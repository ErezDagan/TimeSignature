import os
import tempfile
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


class AnalysisResult(BaseModel):
    bpm: float
    numerator: int
    denominator: int
    confidence: float


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-load BeatNet model at startup to avoid cold-start on first request
    try:
        from analyzer import _get_beatnet
        _get_beatnet()
        print("BeatNet model loaded.")
    except Exception as e:
        print(f"Warning: BeatNet pre-load failed: {e}")
    yield


app = FastAPI(title="TimeSignature API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:4173",
        os.getenv("FRONTEND_URL", ""),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_TYPES = {
    "audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav",
    "audio/flac", "audio/ogg", "audio/vnd.wave",
}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalysisResult)
async def analyze(file: UploadFile = File(...)) -> AnalysisResult:
    """
    Analyze an uploaded audio file and return its time signature and BPM.
    Accepts: MP3, WAV, FLAC, OGG (max 50 MB).
    """
    # Validate content type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type: {file.content_type}. Use MP3, WAV, FLAC, or OGG.",
        )

    # Read and size-check
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum 50 MB.")

    # Write to temp file for BeatNet
    suffix = os.path.splitext(file.filename or "audio")[1] or ".wav"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        from analyzer import analyze_file
        result = analyze_file(tmp_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}")
    finally:
        os.unlink(tmp_path)

    return AnalysisResult(**result)
