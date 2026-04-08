FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libsndfile1 \
    ffmpeg \
    portaudio19-dev \
    && rm -rf /var/lib/apt/lists/*

COPY backend/pyproject.toml .
RUN pip install --no-cache-dir -e .

COPY backend/ .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
