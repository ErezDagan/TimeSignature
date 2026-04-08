"""
Tests for the /analyze endpoint and the analyzer module.
Uses synthetic WAV files with clear beat patterns.
"""
import io
import wave
import struct
import math
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

SAMPLE_RATE = 22050


def make_click_track_wav(bpm: float, beats_per_bar: int, num_bars: int) -> bytes:
    """
    Generate a synthetic click track WAV as bytes.
    Beat 1 (downbeat) = louder sine burst; other beats = softer sine burst.
    """
    seconds_per_beat = 60.0 / bpm
    total_beats = beats_per_bar * num_bars
    total_samples = int(total_beats * seconds_per_beat * SAMPLE_RATE) + SAMPLE_RATE

    samples = [0.0] * total_samples
    click_duration = int(0.05 * SAMPLE_RATE)  # 50ms click

    for beat_idx in range(total_beats):
        t = beat_idx * seconds_per_beat
        start = int(t * SAMPLE_RATE)
        is_downbeat = (beat_idx % beats_per_bar == 0)
        amplitude = 0.9 if is_downbeat else 0.4
        freq = 220.0 if is_downbeat else 880.0
        for i in range(click_duration):
            if start + i < total_samples:
                envelope = 1.0 - (i / click_duration)
                samples[start + i] += amplitude * envelope * math.sin(
                    2 * math.pi * freq * i / SAMPLE_RATE
                )

    # Clamp
    samples = [max(-1.0, min(1.0, s)) for s in samples]

    # Pack as 16-bit PCM WAV
    buf = io.BytesIO()
    with wave.open(buf, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        packed = struct.pack(f'<{len(samples)}h', *[int(s * 32767) for s in samples])
        wf.writeframes(packed)
    return buf.getvalue()


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_analyze_4_4():
    """Upload a synthetic 4/4 click track and verify detection."""
    wav_bytes = make_click_track_wav(bpm=120, beats_per_bar=4, num_bars=8)
    response = client.post(
        "/analyze",
        files={"file": ("test_4_4.wav", wav_bytes, "audio/wav")},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["numerator"] == 4
    assert data["denominator"] == 4
    assert 100 <= data["bpm"] <= 140  # ±20 BPM tolerance for synthetic track
    assert data["confidence"] > 0.0


def test_analyze_3_4():
    """Upload a synthetic 3/4 click track and verify detection."""
    wav_bytes = make_click_track_wav(bpm=120, beats_per_bar=3, num_bars=8)
    response = client.post(
        "/analyze",
        files={"file": ("test_3_4.wav", wav_bytes, "audio/wav")},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["numerator"] == 3
    assert data["denominator"] == 4


def test_analyze_unsupported_type():
    """Non-audio content type returns 415."""
    response = client.post(
        "/analyze",
        files={"file": ("test.txt", b"hello", "text/plain")},
    )
    assert response.status_code == 415


def test_analyze_missing_file():
    """Missing file returns 422 (validation error)."""
    response = client.post("/analyze")
    assert response.status_code == 422
