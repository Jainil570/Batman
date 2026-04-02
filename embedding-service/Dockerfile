# Embedding Service — GPU-enabled Docker image
# Uses PyTorch 2.1.0 + CUDA 11.8 (already pulled locally — no re-download)

FROM pytorch/pytorch:2.1.0-cuda11.8-cudnn8-runtime

WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps (pinned for PyTorch 2.1.0 compatibility)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

EXPOSE 8001

# Model (all-MiniLM-L6-v2) downloads automatically on first request
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
