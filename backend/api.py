from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import shutil
import subprocess
import sys

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