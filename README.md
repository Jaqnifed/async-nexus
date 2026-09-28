# ASYNC Nexus

**Your team's decision memory: upload meeting notes, ask "why did we decide that?", and get an answer with its source. Runs 100% on your own machine.**

Built by **Team Nowais** for **ASYNC'26** (CSE AIML Hackathon, MSRIT) in the **Sovereign AI** track.

---

## The problem

Teams make decisions in meetings every week, and the reasons end up buried in notes and PDFs. Months later nobody remembers *why* a tech stack was picked, what else was considered, or who owns it. When people leave, that context goes with them.

## What ASYNC Nexus does

1. **Upload** meeting notes or any document as a PDF.
2. **Extract.** A local AI model pulls out every decision, along with:
   - the reason behind it
   - owner and status
   - action items
   - alternatives considered
   - assumptions and risks
   - a plain-language summary
3. **Remember.** Every document's decisions are added to one shared memory, tagged with the PDF they came from. Re-uploading the same file replaces its old entries, so nothing is duplicated.
4. **Ask.** Ask questions in plain English, including follow-ups. Answers use **only** the stored decisions and **cite the source PDF**. If the answer isn't there, it says so and does not make one up.

## Why "Sovereign AI"

- **No data leaves your device.** The AI model runs locally through [Ollama](https://ollama.com).
- **No cloud API keys, no per-query costs, no vendor lock-in.**
- Safe for confidential documents like internal meetings, plans and strategy.

## How it works

```
PDF upload ──► Text extraction (pypdf) ──► Local LLM (qwen2.5:7b via Ollama)
                                                 │  structured JSON: decision, reason,
                                                 │  owner, status, alternatives, risks...
                                                 ▼
                                          Decision memory (output.json)
                                                 │
Question ──► Local LLM answers using ONLY that memory ──► Answer + (Source: file.pdf)
```

| Part | Tech |
|---|---|
| Frontend | Next.js + React + Tailwind CSS |
| Backend | Python, FastAPI |
| AI model | qwen2.5:7b running locally in Ollama |
| PDF reading | pypdf |
| Storage | JSON file (`backend/output.json`) |

### Pages
- **Home**: overview
- **Upload**: add a PDF; warns you if that document is already in memory
- **Notes**: browse every stored decision with its status, owner and source
- **Ask**: chat with your organization's memory

### API (backend, port 8000)
| Method | Route | What it does |
|---|---|---|
| POST | `/upload-pdf` | Save a PDF and extract its decisions |
| GET | `/documents` | List documents in memory |
| GET | `/decisions` | All stored decisions |
| POST | `/ask` | Answer a question (supports follow-up history) |

---

## Run it yourself (Windows)

### You'll need
- [Python 3.10+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/)
- [Ollama](https://ollama.com/download)

### 1. Get the AI model (one time)
```
ollama pull qwen2.5:7b
```
Make sure Ollama is running: the llama icon should be near the clock.
> On a slower laptop, use `llama3.2:3b` and change `MODEL` in `backend/api.py` and `backend/decision_extractor.py`.

### 2. Start the backend
```
cd backend
py -m pip install -r requirements.txt
py -m uvicorn api:app --reload
```
Wait for `Application startup complete`.

### 3. Start the frontend (in a second terminal)
```
cd frontend_new
npm install
npm run dev
```
Open **http://localhost:3000**.

### 4. Try it
Upload a meeting-notes PDF, look at the **Notes** page, then go to **Ask** and try:
- "What tech stack did we choose, and why?"
- "Who owns the launch?"
- "What alternatives were rejected?"

The first upload or question can take a minute while the model loads.

### Optional: share a public link
The frontend forwards `/api/*` to the backend, so one tunnel is enough:
```
cloudflared tunnel --url http://localhost:3000
```
The link works only while your laptop and all three parts are running.

---

## Project structure
```
async-nexus/
├── backend/
│   ├── api.py                 # FastAPI server: upload, documents, decisions, ask
│   ├── decision_extractor.py  # PDF → local LLM → decisions added to output.json
│   ├── question_engine.py     # Command-line version of the Ask feature
│   ├── requirements.txt
│   └── uploads/               # Uploaded PDFs (not committed)
└── frontend_new/              # Next.js website
    ├── app/                   # Home, upload/, notes/, ask/ pages
    └── next.config.mjs        # Forwards /api to the backend
```

## What's next
- Detect when a decision **changes** between meetings (e.g. a launch date moving) and show the history
- Search and filters on the Notes page
- Multi-user teams and a proper database
- Support for Word documents and meeting transcripts

## Team Nowais
- Ritesh (Team Leader)
- _add teammates here_

## Demo
- Demo video: _add link_
