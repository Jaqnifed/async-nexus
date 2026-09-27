import subprocess
import sys
from pathlib import Path

backend = Path(__file__).parent

pdf = backend / "meeting_notes.pdf"

if not pdf.exists():
    print("❌ meeting_notes.pdf not found in backend folder.")
    print("Put your test PDF inside the backend folder and name it meeting_notes.pdf")
    sys.exit(1)

print("📄 Step 1: Extracting decisions from PDF...")
subprocess.run([sys.executable, str(backend / "decision_extractor.py")], check=True)

print("\n✅ PDF extraction completed!")
print("🧠 Step 2: Starting question engine...\n")

subprocess.run([sys.executable, str(backend / "question_engine.py")], check=True)