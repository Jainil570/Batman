# Deployment Guide

## Option 1: Docker Compose (VPS/Cloud VM)

### Requirements
- VPS with 4GB+ RAM (8GB for Ollama)
- Docker + Docker Compose installed

### Steps

```bash
# 1. Clone the repo to your server
git clone <your-repo> batman-ai
cd batman-ai

# 2. Configure environment
cp .env.example .env
nano .env  # Set JWT_SECRET_KEY, GROQ_API_KEY, etc.

# 3. Build and start
docker-compose up -d --build

# 4. Pull LLM model
docker exec batman-ollama ollama pull llama3.1:8b

# 5. Verify
curl http://localhost:8000/health
```

### Production Checklist
- [ ] Set strong `JWT_SECRET_KEY`
- [ ] Configure `CORS_ORIGINS` for your domain
- [ ] Set up reverse proxy (nginx/caddy)
- [ ] Enable HTTPS
- [ ] Set `DEBUG=false`

## Option 2: Railway Deployment

### Backend (FastAPI)

1. Create new project on [Railway](https://railway.app)
2. Add **MongoDB** plugin → copy connection string
3. Add **Redis** plugin → copy connection string
4. Deploy backend:
   - Connect GitHub repo
   - Set root directory: `backend`
   - Set build command: `pip install -r requirements.txt`
   - Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from `.env.example`
6. Set `GROQ_API_KEY` (since Railway won't run Ollama)

### Frontend (Next.js)

1. Add new service in same project
2. Set root directory: `frontend`
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Add env: `NEXT_PUBLIC_API_URL=https://your-backend.railway.app`

## Option 3: Render

### Backend
1. New **Web Service** → connect repo
2. Root: `backend`, Runtime: Python 3
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add env vars

### Frontend
1. New **Static Site** or **Web Service**
2. Root: `frontend`, Runtime: Node
3. Build: `npm run build`
4. Start: `npm start`

## Using Groq Instead of Ollama (Cloud Deploy)

For cloud deployments without GPU, use Groq as primary:

1. Get API key from [Groq Console](https://console.groq.com)
2. Set `GROQ_API_KEY` in your environment
3. The backend auto-falls back to Groq when Ollama is unavailable
