# 📖 Interactive Story Engine

> Transform any linear story into a branching, choose-your-own-adventure experience — powered by IBM Granite AI and LangChain.

![IBM AI Builders Challenge](https://img.shields.io/badge/IBM%20AI%20Builders%20Challenge-July%202025-blue?style=for-the-badge)
![Theme](https://img.shields.io/badge/Theme-Reimagine%20Creative%20Industries-purple?style=for-the-badge)
![Built With](https://img.shields.io/badge/Built%20With-IBM%20Bob-orange?style=for-the-badge)

---

## 🎯 Problem Statement

Creative storytelling is inherently linear — authors write one path, readers follow it. But stories are full of moments where a character could have chosen differently, where the world could have unfolded another way. Traditional publishing has no room for this. Writers who want to create branching narratives must manually write every path, every consequence, every variation — a process that takes months and requires significant technical skill.

**The result:** Interactive storytelling remains out of reach for most writers. Great stories stay locked in a single timeline.

---

## 💡 Solution

The Interactive Story Engine uses AI to do what no human author could do efficiently at scale — **read a story, understand it deeply, and generate meaningful branches that feel authentic to the original**.

A writer pastes their story. The AI extracts the story's DNA — characters, tone, world rules, setting. It identifies the natural turning points where decisions matter. Then it generates branching scenes for each path, keeping every branch consistent with the original story's voice and world.

The result is a fully interactive, choose-your-own-adventure experience — generated in under 60 seconds from any piece of writing.

---

## ✨ Key Features

- **Story Bible Extraction** — AI identifies all characters, setting, tone, and world rules from the original text
- **Automatic Decision Point Detection** — Granite finds 2–3 natural turning points in any story
- **Consistent Branch Generation** — Every AI-generated branch honors the original characters, tone, and world rules
- **Visual Story Map** — Interactive SVG tree showing every possible path, with visited path highlighted
- **Real-time Processing** — Async pipeline with live status polling so users see progress
- **Clean Reader UI** — Cinematic dark-themed reader with animated scene transitions

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     User Interface                       │
│          Next.js 14 · TypeScript · Framer Motion        │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP
┌─────────────────────▼───────────────────────────────────┐
│                   FastAPI Backend                        │
│                    Python 3.11                           │
│                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Analyzer   │  │  Branch Gen  │  │ Graph Builder │  │
│  │             │  │              │  │               │  │
│  │ Story Bible │  │ AI Branches  │  │  Story JSON   │  │
│  │ Extraction  │  │ Generation   │  │  Assembly     │  │
│  └──────┬──────┘  └──────┬───────┘  └───────┬───────┘  │
│         └────────────────┴──────────────────┘           │
│                          │                               │
│              ┌───────────▼──────────┐                   │
│              │  LangChain Pipeline  │                   │
│              └───────────┬──────────┘                   │
│                          │                               │
│              ┌───────────▼──────────┐                   │
│              │    IBM Granite LLM   │                   │
│              │  (via watsonx.ai)    │                   │
│              └──────────────────────┘                   │
└─────────────────────────────────────────────────────────┘
```

### AI Pipeline (3 Steps)

```
Step 1 — ANALYZE          Step 2 — DETECT           Step 3 — GENERATE
─────────────────         ──────────────────         ─────────────────────
Story text input    →     Find 2-3 turning    →     For each turning point
                          points where a             generate 2 branch scenes
Extract:                  character faces a          using story bible as
· Characters              meaningful choice          context to ensure
· Setting                                            consistency of:
· Tone                    Output:                    · Character names/traits
· World rules             · Scene index              · Tone and voice
                          · Choice prompt            · World rules
Output:                   · Choice A label           · Setting details
Story Bible JSON          · Choice B label
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| LLM | IBM Granite (`granite-13b-instruct-v2`) | Story analysis, branch generation |
| Orchestration | LangChain | Multi-step AI pipeline |
| Backend | FastAPI + Python 3.11 | REST API, async processing |
| Frontend | Next.js 14 + TypeScript | Interactive reader UI |
| Styling | Tailwind CSS + Framer Motion | Design + animations |
| AI Platform | IBM watsonx.ai | Granite model hosting |
| Dev Tool | IBM Bob | Primary development assistant |

---

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- IBM watsonx.ai account ([register free](https://cloud.ibm.com/registration))
- A Groq API key ([free at console.groq.com](https://console.groq.com)) — or IBM watsonx credentials

### Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/interactive-story-engine.git
cd interactive-story-engine

# 2. Install Python dependencies
pip install -r requirements.txt

# 3. Configure environment variables
cp .env.example .env
# Edit .env — set your LLM_BACKEND and credentials (see below)

# 4. Start the backend
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd story-engine-frontend

# 2. Install dependencies
npm install

# 3. Start the frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the app is ready.

---

## ⚙️ Environment Variables

### Backend (`.env`)

The backend supports three LLM backends — pick one:

```env
# ── Option 1: Groq (recommended — free, fast) ─────────────────
LLM_BACKEND=groq
GROQ_API_KEY=gsk_your_key_here
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_BASE_URL=https://api.groq.com/openai/v1

# ── Option 2: IBM watsonx.ai ───────────────────────────────────
LLM_BACKEND=watsonx
WATSONX_API_KEY=your_watsonx_api_key
WATSONX_PROJECT_ID=your_project_id
WATSONX_URL=https://us-south.ml.cloud.ibm.com
GRANITE_MODEL_ID=ibm/granite-13b-instruct-v2

# ── Option 3: Ollama (local, no account needed) ────────────────
LLM_BACKEND=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=granite3.1-dense:2b

APP_ENV=development
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/story/ingest` | Submit a story for AI processing |
| `GET` | `/api/story/{id}/status` | Poll processing status (`processing` / `ready` / `failed`) |
| `GET` | `/api/story/{id}/graph` | Retrieve the full story graph JSON |
| `GET` | `/health` | Health check |

### Example: Ingest a Story

```bash
curl -X POST http://localhost:8000/api/story/ingest \
  -H "Content-Type: application/json" \
  -d '{"story_text": "Your story text here (min 100 chars)..."}'
```

**Response:**
```json
{ "story_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479", "message": "Story received and is being processed." }
```

### Example: Get Story Graph

```bash
curl http://localhost:8000/api/story/f47ac10b-58cc-4372-a567-0e02b2c3d479/graph
```

**Response:**
```json
{
  "story_id": "f47ac10b...",
  "story_bible": {
    "characters": [{"name": "Mara", "description": "A determined explorer"}],
    "setting": "The Ashwood Forest, dusk",
    "tone": "dark fantasy",
    "world_rules": ["The lantern never goes out in the forest"]
  },
  "nodes": [
    {
      "node_id": "node_0",
      "type": "scene",
      "text": "Mara stood at the fork in the path...",
      "choices": [
        {"label": "Head deeper into the forest", "next_node": "node_0a"},
        {"label": "Turn back to the village",    "next_node": "node_0b"}
      ]
    },
    {
      "node_id": "node_0a",
      "type": "branch",
      "text": "AI-generated continuation for choice A...",
      "choices": []
    },
    {
      "node_id": "node_0b",
      "type": "branch",
      "text": "AI-generated continuation for choice B...",
      "choices": []
    }
  ]
}
```

---

## 🧪 Running Tests

```bash
cd interactive-story-engine
pytest tests/ -v
```

All 28 tests pass. Tests mock the LLM so no API key is required.

---

## 🤖 How IBM Bob Was Used

IBM Bob was the **primary development tool** for this entire project, used across every phase:

- **Project scaffolding** — Bob generated the complete folder structure, `requirements.txt`, and all boilerplate from a single spec prompt
- **AI pipeline** — Bob wrote the full LangChain chain logic in `analyzer.py`, `branch_gen.py`, and `graph_builder.py` including all Granite prompt templates
- **Retry logic** — When Granite returned malformed JSON, Bob diagnosed and added retry logic with a stricter fallback prompt
- **Frontend** — Bob built all React/Next.js components including the animated reader, SVG story map, and Framer Motion transitions
- **CORS fix** — Bob identified the cross-origin issue between FastAPI and Next.js and fixed it via the Next.js rewrite proxy
- **Tests** — Bob wrote all 28 pytest unit tests with mocked LLM responses
- **Multi-LLM support** — Bob added Groq, Ollama, and watsonx backends behind a single `LLM_BACKEND` env var

---

## 🧠 IBM Granite Model Details

| Parameter | Value |
|-----------|-------|
| Model | `ibm/granite-13b-instruct-v2` |
| Platform | IBM watsonx.ai |
| `max_new_tokens` | 512 |
| `temperature` | 0.7 |
| `top_p` | 0.9 |

**Prompting strategy:** Structured JSON-forcing prompts with explicit field schemas and `"Return ONLY valid JSON"` instructions. A strict-prompt retry fires automatically if the first response is unparseable.

**Consistency mechanism:** The full Story Bible (characters, tone, world rules) is injected as context into every branch generation prompt — ensuring all AI-generated scenes stay faithful to the original story's world.

---

## 🎯 IBM AI Builders Challenge

**Theme: Reimagine Creative Industries with AI**
**Challenge: IBM AI Builders Challenge — July 2025**
**Deadline: July 31, 2025 @ 11:59 PM ET**

The Interactive Story Engine demonstrates how generative AI can democratise interactive fiction — a form that previously required teams of writers. Any author can paste a short story and receive a playable branching narrative in seconds.

---

## 📁 Project Structure

```
interactive-story-engine/
├── main.py                        # FastAPI app + CORS + static UI
├── requirements.txt
├── .env.example
├── pytest.ini
├── app/
│   ├── routers/story.py           # All API endpoints
│   ├── services/
│   │   ├── analyzer.py            # Story Bible extraction + decision points
│   │   ├── branch_gen.py          # Branch scene generation
│   │   └── graph_builder.py       # Story graph assembly
│   ├── models/story.py            # Pydantic request/response models
│   └── core/
│       ├── config.py              # pydantic-settings config
│       └── llm.py                 # Multi-backend LLM factory
├── tests/
│   ├── test_ingest.py             # 8 API tests
│   ├── test_analyzer.py           # 8 unit tests (mocked LLM)
│   └── test_graph.py              # 12 graph assembly tests
├── static/
│   └── index.html                 # Built-in HTML frontend (served at /)
└── story-engine-frontend/         # Next.js frontend
    ├── app/
    │   ├── page.tsx               # Landing page
    │   └── story/[story_id]/
    │       ├── page.tsx           # Interactive story reader
    │       └── map/page.tsx       # SVG story map
    ├── components/
    │   ├── SceneCard.tsx          # Animated scene card
    │   ├── ChoiceButton.tsx       # Branching choice button
    │   ├── StoryMap.tsx           # SVG tree visualisation
    │   ├── ProgressBar.tsx        # Amber progress indicator
    │   ├── LoadingDots.tsx        # Animated loading state
    │   └── LanternIcon.tsx        # SVG hero icon
    ├── lib/
    │   ├── api.ts                 # API call functions
    │   └── types.ts               # TypeScript interfaces
    └── hooks/
        └── useStoryGraph.ts       # Graph navigation hook
```

---

## 📸 Screenshots

> *(Add screenshots of the Landing Page, Story Reader, and Story Map here before submission)*

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
