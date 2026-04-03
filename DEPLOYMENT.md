# 🚀 Batman AI - Free Deployment Guide

Deploying a complex AI application like Batman AI for **$0/month** is entirely possible! 

However, since free hosting providers (like Render or Vercel) **do not provide GPUs**, you cannot run the current Docker containers (`ollama` and `embedding-service`) on them. 

To achieve a 100% free deployment, the architecture must transition from **Local AI** to **Cloud API AI**.

---

## 🏗️ The Free Architecture Strategy

1. **Frontend UI** ➔ Hosted on **Vercel** (Free)
2. **Backend Server** ➔ Hosted on **Render** (Free CPU Tier)
3. **Primary Database** ➔ Hosted on **MongoDB Atlas** (Free 512MB Cluster)
4. **Caching & Rate Limits** ➔ Hosted on **Upstash Redis** (Free Tier)
5. **LLM (Chat)** ➔ Transition from local `Ollama` to the free **Groq Cloud API**.
6. **Embeddings (FAISS)** ➔ Transition from local GPU `sentence-transformers` to a free Serverless Vector DB (like **Pinecone**) and a free Embedding API (like **Google Gemini** or **HuggingFace**).

---

## Step-by-Step Deployment Instructions

### Step 1: Set Up MongoDB Atlas (Cloud Database)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free account.
2. Create a "Shared" (Free) Cluster.
3. In Database Access, create a local user with a password (e.g., `batman_user` / `securepassword!`).
4. In Network Access, whitelist your IP address (allow `0.0.0.0/0` so your backend can connect from anywhere).
5. Click **Connect** -> **Drivers** and copy your `MONGODB_URI`. 
   *(It will look like `mongodb+srv://batman_user:securepassword!...`)*

### Step 2: Set Up Upstash Redis (Cloud Cache)
1. Go to [Upstash](https://upstash.com/) and create a free account.
2. Click **Create Database** under Redis.
3. Once created, scroll down to the **Connect** section and copy the **Redis URL**.
   *(It will look like `redis://default:password@random-name.upstash.io:30000`)*

### Step 3: Shift the AI to Free Cloud APIs (Crucial Step)
Since we can't deploy your local Docker GPUs for free, you must modify your Python backend:
1. Generate a free API key at [Groq Cloud](https://console.groq.com/keys).
2. We must modify your codebase to use Groq completely (removing Ollama dependencies).
3. Generate a free Vector Database at [Pinecone](https://www.pinecone.io/) to replace FAISS.
4. Integrate a free Embedding API (like Google Gemini API) to replace the `embedding-service` Docker container.

> *Note: If you want to do this, let me (the AI) know we are ready to write the Serverless integration code, and I will refactor your Python backend automatically!*

### Step 4: Deploy the FastAPI Backend to Render
Once the backend is refactored to use Cloud APIs:
1. Go to [Render.com](https://render.com/) and sign in with GitHub.
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository (`Batman`).
4. **Root Directory**: `backend`
5. **Build Command**: `pip install -r requirements.txt`
6. **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port 10000`
7. Click **Advanced** and add all your Environmental Variables:
   * `MONGODB_URI` = *(Your Atlas connection string)*
   * `REDIS_URL` = *(Your Upstash connection string)*
   * `GROQ_API_KEY` = *(Your Groq Key)*
   * `JWT_SECRET_KEY` = *(A strong random password)*
8. Click **Create Web Service**. Wait 5-10 minutes for it to build. Once live, copy its URL (e.g., `https://batman-backend.onrender.com`).

### Step 5: Deploy Next.js Frontend to Vercel
1. Go to [Vercel](https://vercel.com/) and sign in with GitHub.
2. Click **Add New** -> **Project** and select your `Batman` repo.
3. Change the **Root Directory** to `frontend`.
4. In the Environment Variables section, add:
   * `NEXT_PUBLIC_API_URL` = *(The Render URL you copied in Step 4)*
5. Click **Deploy**. Vercel will instantly build and host your highly cinematic UI globally!

---

### 🎉 Success!
You now have a fully operational, enterprise-grade AI examination web app deployed globally for zero cost. 

If you are ready to start **Step 3** (updating the codebase so it can survive purely on Cloud APIs instead of your local GPU docker setup), simply reply: 
> *"Refactor the backend to be fully Serverless using Groq and Pinecone!"*
