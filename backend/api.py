from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
import json
import shutil
import subprocess
import sys

import ollama

app = FastAPI()

# Allow the React frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Folder where uploaded PDFs are stored
UPLOAD_DIR = Path(__file__).parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Where the extracted decisions are saved
OUTPUT_FILE = Path(__file__).parent / "output.json"

# Local AI model used to answer questions (same as question_engine.py)
MODEL = "qwen2.5:7b"   # use "llama3.2:3b" if this is too slow


def load_memory():
    """Read output.json. Returns an empty memory if nothing is saved yet."""
    if not OUTPUT_FILE.exists():
        return {"decisions": []}

    try:
        with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
            memory = json.load(f)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail="output.json is damaged. Fix or delete it, then retry."
        )

    memory.setdefault("decisions", [])
    return memory


@app.get("/")
def home():
    return {
        "message": "DecisionVault API is running"
    }


@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):

    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )

    file_path = UPLOAD_DIR / file.filename

    # Save uploaded PDF
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Could not save uploaded PDF: {str(e)}"
        )

    # Run decision extraction
    result = subprocess.run(
        [
            sys.executable,
            str(Path(__file__).parent / "decision_extractor.py"),
            str(file_path)
        ],
        capture_output=True,
        text=True,
        encoding="utf-8"
    )

    # Extraction failed
    if result.returncode != 0:
        raise HTTPException(
            status_code=500,
            detail={
                "message": "PDF uploaded, but extraction failed",
                "filename": file.filename,
                "return_code": result.returncode,
                "stdout": result.stdout,
                "stderr": result.stderr
            }
    )
    return {
        "message": "PDF uploaded and processed successfully",
        "filename": file.filename,
        "extraction": "completed"
    }


# -----------------------------
# List every document already in memory
# (the upload page uses this to ask "replace it?")
# -----------------------------
@app.get("/documents")
def list_documents():
    memory = load_memory()
    documents = {}

    for d in memory["decisions"]:
        source = d.get("source") or "Unknown document"
        doc = documents.setdefault(
            source,
            {"source": source, "decision_count": 0, "added_at": d.get("added_at", "")}
        )
        doc["decision_count"] += 1

    return {"documents": list(documents.values())}


# -----------------------------
# Return every saved decision (for the Notes page)
# -----------------------------
@app.get("/decisions")
def get_decisions():
    return load_memory()


# -----------------------------
# Answer a question using the local model (for the Ask page)
# -----------------------------
class Question(BaseModel):
    question: str
    history: list = []   # earlier questions and answers, so follow-ups work


@app.post("/ask")
def ask(q: Question):
    memory = load_memory()

    if not memory["decisions"]:
        return {"answer": "No documents have been uploaded yet. Upload a PDF first."}

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

Format every answer like this:
- First line: one short sentence that directly answers the question.
- Then an empty line.
- Then a short paragraph (3-5 sentences) giving the context: the reasons, owners, alternatives, assumptions or risks that matter.
- Then the source(s) in brackets.

If the answer is not present in memory, say only:
"I could not find that information in the stored decisions."

MEMORY:

{json.dumps(memory, ensure_ascii=False)}
"""

    messages = [{"role": "system", "content": system_prompt}]

    # Keep only the last few turns so the prompt stays short and fast
    for turn in q.history[-6:]:
        if isinstance(turn, dict) and turn.get("role") in ("user", "assistant"):
            messages.append({"role": turn["role"], "content": str(turn.get("content", ""))})

    messages.append({"role": "user", "content": q.question})

    try:
        response = ollama.chat(
            model=MODEL,
            messages=messages,
            options={"num_ctx": 8192},
            keep_alive="30m"
        )
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Could not reach Ollama. Is it running? ({e})"
        )

    return {"answer": response["message"]["content"]}
