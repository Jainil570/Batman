# 🦇 Batman AI — Cinematic RAG Exam Assistant
[Demo Video](https://drive.google.com/file/d/1QF_w40aeJTePntbDqtcamDWBGT0xDK41/view?usp=sharing)

**Batman AI** is a premium, high-performance web application designed for students and professionals to prepare for exams. It features a stunning cinematic dark-themed UI (inspired by the aesthetics of Batman) and utilizes advanced **Retrieval-Augmented Generation (RAG)** to answer queries directly from user-uploaded PDFs.

---

## 🌟 Key Features

* **Cinematic User Interface**: A premium Next.js UI using Framer Motion micro-animations, glassmorphism, and completely custom typography (Fiorello, Tommy Hilfiger, Azonix).
* **Local LLM Inference**: Privacy-first approach using `Ollama` running `llama3.1:8b` Locally via Docker & GPU.
* **Smart RAG Engine**: Uses `sentence-transformers` and `FAISS` Vector indexing to perform semantic search across document chunks.
* **Document Management**: Upload massive PDFs. The backend effortlessly extracts, chunks, and indexes it via `PyMuPDF`.
* **Streaming AI Chat**: Uses WebSockets to provide real-time token streaming back to the frontend.
* **Microservice Architecture**: Decoupled APIs powered by FastAPI, MongoDB (NoSQL), and Redis (Caching & Rate Limiting).

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 (React 19)
- **Styling**: TailwindCSS & Custom Vanilla CSS styles for complex effects
- **Components**: Shadcn/UI, Radix UI, Framer Motion

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB (Motor Async Driver)
- **Caching/Rate Limit**: Redis (aioredis)
- **WebSockets**: Streaming chat architecture

### AI & Embeddings
- **LLM**: Ollama (`llama3.1:8b` and others)
- **Embeddings microservice**: `all-MiniLM-L6-v2` served via a dedicated FastAPI Docker container
- **Vector Search**: FAISS In-Memory Inner Product Search

---

## 🚀 Getting Started

### Prerequisites
* **Python 3.11+**
* **Node.js 18+**
* **Docker Desktop** (with GPU passthrough enabled)
* **MongoDB** and **Redis** running locally.

### 1. Backend Setup

Create a virtual environment and start the application:

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate   # (Windows) or source venv/bin/activate (Mac/Linux)

pip install -r requirements.txt

# Create a copy of the root `.env` here (ensure MONGODB_URI and REDIS_URL are correct)
uvicorn app.main:app --reload --port 8000
```

### 2. Infrastructure Setup (Docker & AI)

Start the local AI services. This will run Ollama and the FAISS Embedding GPU Service.

```bash
cd ..
docker compose up -d --build

# Pull the primary LLM model into the volume
docker exec batman-ollama ollama pull llama3.1:8b
```

### 3. Frontend Setup

Move into your frontend workspace, install dependencies, and start Next.js!

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to enter the Batcave.

---

## 📁 Repository Structure
```
/
├── backend/               # Main FastAPI server handling users, chats & RAG
├── frontend/              # Next.js Application
├── embedding-service/     # Docker-only GPU service for generating sentence embeddings
├── docs/                  # Documentation and API references
├── docker-compose.yml     # Composes Ollama and Embedding Service
└── .env                   # Central Environment Variables
```

## 🔒 Environment Configuration
This app expects a `.env` file at the root. Reference `.env.example` in this repository to configure DB URLs and Secret Keys.

---

