from pathlib import Path
import json
import sys
from datetime import datetime

import ollama
from pypdf import PdfReader


# -----------------------------
# 1. Choose the local AI model
# -----------------------------
MODEL = "qwen2.5:7b"   # use "llama3.2:3b" if this is too slow
print(f"[1] Using local model: {MODEL}")


# -----------------------------
# 2. Check PDF
# -----------------------------
if len(sys.argv) > 1:
    PDF_FILE = Path(sys.argv[1])
else:
    PDF_FILE = Path(__file__).resolve().parent / "meeting_notes.pdf"

OUTPUT_FILE = Path(__file__).resolve().parent / "output.json"

print(f"[2] Looking for PDF: {PDF_FILE}")

if not PDF_FILE.exists():
    print("ERROR: PDF not found.")
    raise SystemExit(1)

print("OK: PDF found.")


# -----------------------------
# 3. Extract text from PDF
# -----------------------------
print("[3] Reading PDF...")

reader = PdfReader(str(PDF_FILE))

text = ""

for page_number, page in enumerate(reader.pages, start=1):
    page_text = page.extract_text()

    if page_text:
        text += page_text + "\n"

print("OK: PDF read successfully.")
print(f"   Pages: {len(reader.pages)}")
print(f"   Characters extracted: {len(text)}")

if not text.strip():
    print("ERROR: No text could be extracted from the PDF.")
    raise SystemExit(1)


# -----------------------------
# 4. Send document to the local model
# -----------------------------
print(f"[4] Sending document to {MODEL} (this can take a minute)...")

prompt = f"""
You are a decision extraction engine.

Read the following meeting/document text and identify:

1. Decisions made
2. Reasons for each decision
3. Action items
4. Stakeholders/owners involved
5. Status of each decision
6. Alternatives considered, if mentioned
7. Assumptions: things the team is taking as true without proof
8. Risks: things that could go wrong because of the decision
9. Summary: a short paragraph of 4-6 sentences explaining the decision in plain language: what was decided, why, who owns it, what else was considered and what to watch out for

Only include assumptions and risks that the document actually states or clearly implies. If there are none, leave the list empty. Do not make them up.
The summary must only use information from the document.

Return ONLY valid JSON.

Use exactly this structure:

{{
  "decisions": [
    {{
      "decision": "",
      "summary": "",
      "reason": "",
      "owner": "",
      "status": "",
      "action_items": [],
      "alternatives": [],
      "assumptions": [],
      "risks": []
    }}
  ]
}}

DOCUMENT:

{text}
"""

try:
    response = ollama.chat(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        format="json",
        options={"num_ctx": 8192, "temperature": 0}
    )
except Exception as e:
    print("ERROR: Could not reach Ollama. Is it running? (llama icon near the clock)")
    print(e)
    raise SystemExit(1)

print("OK: Model response received.")


# -----------------------------
# 5. Parse model response
# -----------------------------
print("[5] Parsing model response...")

raw_response = response["message"]["content"].strip()

if raw_response.startswith("```"):
    raw_response = raw_response.replace("```json", "", 1)
    raw_response = raw_response.replace("```", "", 1)
    raw_response = raw_response.strip()

try:
    extracted_data = json.loads(raw_response)

except json.JSONDecodeError:
    print("ERROR: The model did not return valid JSON.")
    print("\nModel returned:")
    print(raw_response)
    raise SystemExit(1)

# -----------------------------
# 6. Save output.json
# -----------------------------
print("[6] Adding decisions to output.json...")

# Load what's already saved (or start empty the first time)
if OUTPUT_FILE.exists():
    try:
        with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
            memory = json.load(f)
    except json.JSONDecodeError:
        # Stop instead of overwriting, so saved decisions are never wiped
        print("ERROR: output.json is damaged. Fix or delete it, then retry.")
        raise SystemExit(1)
else:
    memory = {"decisions": []}

memory.setdefault("decisions", [])

source_name = PDF_FILE.name
added_at = datetime.now().isoformat(timespec="seconds")

# If this same PDF was uploaded before, remove its old decisions
# so re-uploading doesn't create duplicates
memory["decisions"] = [
    d for d in memory["decisions"] if d.get("source") != source_name
]

new_decisions = extracted_data.get("decisions", [])

# Tag each decision with where it came from and when
for d in new_decisions:
    d["source"] = source_name
    d["added_at"] = added_at

memory["decisions"].extend(new_decisions)

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(memory, f, indent=2, ensure_ascii=False)

print(f"OK: Added {len(new_decisions)} decisions from {source_name}")
print(f"   Total decisions stored: {len(memory['decisions'])}")


# -----------------------------
# 7. Done
# -----------------------------
print("\nDECISION EXTRACTION COMPLETE!")
print("PDF -> Ollama (local) -> output.json")