import json
from google import genai
from dotenv import load_dotenv
import os
load_dotenv()
client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

with open("output.json", "r") as f:
    memory = json.load(f)

chat = client.chats.create(
    model="gemini-flash-lite-latest"
)

while True:
    question = input("\nAsk a question (or type exit): ")

    if question.lower() == "exit":
        break

    prompt = f"""
You are an AI assistant for an organizational memory system.

You may answer questions about:

- Decisions
- Reasons
- Owners
- Statuses

using ONLY the information below.

MEMORY:

{json.dumps(memory, indent=2)}

QUESTION:

{question}

If the answer is not present in memory, say:
"I could not find that information in the stored decisions."
"""

    response = chat.send_message(prompt)

    print("\nANSWER:")
    print(response.text)