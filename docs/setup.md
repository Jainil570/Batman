# Local Development Setup

## Prerequisites

1. **Python 3.11+** - [Download](https://python.org)
2. **Node.js 20+** - [Download](https://nodejs.org)
3. **Docker Desktop** - [Download](https://docker.com/products/docker-desktop)
4. **Ollama** - [Download](https://ollama.ai)

## Step 1: Clone and Configure

```bash
cd batman-ai
cp .env.example .env
# Edit .env with your settings (defaults work for local dev)
```

## Step 2: Start Infrastructure

```bash
# Start MongoDB, Redis, and Ollama via Docker
docker-compose up -d mongodb redis ollama

# Pull the LLM model (first time only, ~4.7GB)
ollama pull llama3.1:8b

# Verify Ollama is running
curl http://localhost:11434/api/tags
```

## Step 3: Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn app.main:app --reload --port 8000
```

Verify: Open `http://localhost:8000/docs` in your browser.

## Step 4: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Verify: Open `http://localhost:3000` in your browser.

## Step 5: Test the Flow

1. Open `http://localhost:3000` - you should see the Batman AI landing page
2. Click "Get Started" to sign up
3. Upload a PDF document
4. Click "Chat" on the document
5. Ask questions about the document content

## Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection failed | Ensure Docker is running: `docker ps` |
| Ollama model not found | Run `ollama pull llama3.1:8b` |
| CORS errors | Check `CORS_ORIGINS` in `.env` |
| PDF upload fails | Check file is <20MB and <100 pages |
| WebSocket disconnects | Ensure backend is running on port 8000 |
