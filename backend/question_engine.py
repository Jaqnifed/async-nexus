import json
from pathlib import Path

import ollama

MODEL = "qwen2.5:7b"   # change to "llama3.2:3b" if this is too slow

OUTPUT_FILE = Path(__file__).resolve().parent / "output.json"

if not OUTPUT_FILE.exists():
    print("No decisions saved yet. Upload a PDF first.")
    raise SystemExit(1)

with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
    memory = json.load(f)

system_prompt = f"""
You are an AI assistant for an organizational memory system.

You may answer questions about:

- Decisions
- Reasons
- Owners
- Statuses
- Assumptions
- Risks
- Action items
- Alternatives

using ONLY the information below.

Each decision has a "source" field with the PDF it came from. At the end of every answer, add the source in brackets, like this: (Source: meeting_hosting.pdf). If the answer uses more than one decision, list every source.

If the answer is not present in memory, say:
"I could not find that information in the stored decisions."

MEMORY:

{json.dumps(memory, indent=2, ensure_ascii=False)}
"""

# The conversation so far, so follow-up questions like "Is it approved?" work
messages = [{"role": "system", "content": system_prompt}]

while True:
    question = input("\nAsk a question (or type exit): ").strip()

    if question.lower() == "exit":
        break
    if not question:
        continue

    messages.append({"role": "user", "content": question})
    print("\nThinking...")

    try:
        response = ollama.chat(
            model=MODEL,
            messages=messages,
            options={"num_ctx": 8192}
        )
    except Exception as e:
        print("ERROR: Could not reach Ollama. Is it running? (llama icon near the clock)")
        print(e)
        messages.pop()
        continue

    answer = response["message"]["content"]
    messages.append({"role": "assistant", "content": answer})

    print("\nANSWER:")
    print(answer)