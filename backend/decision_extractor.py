from pathlib import Path
import json
import os
import sys

from dotenv import load_dotenv
from pypdf import PdfReader
from google import genai


# -----------------------------
# 1. Load environment variables
# -----------------------------
print("[1] Loading environment...")

ROOT_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = ROOT_DIR / ".env"

load_dotenv(ENV_FILE)

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("ERROR: GEMINI_API_KEY was not found.")
    print(f"Checked: {ENV_FILE}")
    raise SystemExit(1)

print("OK: Gemini API key found.")


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
# 4. Send document to Gemini
# -----------------------------
print("[4] Sending document to Gemini...")

client = genai.Client(api_key=api_key)

prompt = f"""
You are a decision extraction engine.

Read the following meeting/document text and identify:

1. Decisions made
2. Reasons for each decision
3. Action items
4. Stakeholders/owners involved
5. Status of each decision
6. Alternatives considered, if mentioned

Return ONLY valid JSON.

Use exactly this structure:

{{
  "decisions": [
    {{
      "decision": "",
      "reason": "",
      "owner": "",
      "status": "",
      "action_items": [],
      "alternatives": []
    }}
  ]
}}

DOCUMENT:

{text}
"""

response = client.models.generate_content(
    model="gemini-3.8-flash",
    contents=prompt
)

print("OK: Gemini response received.")


# -----------------------------
# 5. Parse Gemini response
# -----------------------------
print("[5] Parsing Gemini response...")

raw_response = response.text.strip()

if raw_response.startswith("```"):
    raw_response = raw_response.replace("```json", "", 1)
    raw_response = raw_response.replace("```", "", 1)
    raw_response = raw_response.strip()

try:
    extracted_data = json.loads(raw_response)

except json.JSONDecodeError:
    print("ERROR: Gemini did not return valid JSON.")
    print("\nGemini returned:")
    print(raw_response)
    raise SystemExit(1)


# -----------------------------
# 6. Save output.json
# -----------------------------
print("[6] Saving output.json...")

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(extracted_data, f, indent=2, ensure_ascii=False)

print(f"OK: Saved output.json")


# -----------------------------
# 7. Done
# -----------------------------
print("\nDECISION EXTRACTION COMPLETE!")
print("PDF -> Gemini -> output.json")