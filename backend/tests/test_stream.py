"""
Tests for WebSocket /stream endpoint.
"""
import json
import math
import struct
import numpy as np
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

SAMPLE_RATE = 22050


def make_pcm_chunk(duration_sec: float, freq: float = 220.0, amplitude: float = 0.5) -> bytes:
    """Generate a chunk of PCM float32 audio (sine wave)."""
    n = int(duration_sec * SAMPLE_RATE)
    samples = [amplitude * math.sin(2 * math.pi * freq * i / SAMPLE_RATE) for i in range(n)]
    return struct.pack(f"<{n}f", *samples)


def make_click_pcm(bpm: float, beats_per_bar: int, num_bars: int) -> bytes:
    """Generate a click track as PCM float32 bytes."""
    spb = 60.0 / bpm
    total_beats = beats_per_bar * num_bars
    total = int(total_beats * spb * SAMPLE_RATE) + SAMPLE_RATE
    samples = [0.0] * total
    click_dur = int(0.05 * SAMPLE_RATE)
    for bi in range(total_beats):
        t = bi * spb
        start = int(t * SAMPLE_RATE)
        amp = 0.9 if bi % beats_per_bar == 0 else 0.4
        freq = 220.0 if bi % beats_per_bar == 0 else 880.0
        for i in range(click_dur):
            if start + i < total:
                env = 1.0 - i / click_dur
                samples[start + i] += amp * env * math.sin(2 * math.pi * freq * i / SAMPLE_RATE)
    samples = [max(-1.0, min(1.0, s)) for s in samples]
    return struct.pack(f"<{len(samples)}f", *samples)


def test_websocket_connect_and_disconnect():
    """WebSocket accepts connection and handles clean disconnect."""
    with client.websocket_connect("/stream") as ws:
        # Send a tiny chunk — will get buffering response
        chunk = make_pcm_chunk(0.1)
        ws.send_bytes(chunk)
        msg = ws.receive_text()
        data = json.loads(msg)
        assert data["type"] == "buffering"
        assert 0.0 <= data["progress"] <= 1.0
        # Client closes cleanly
        ws.close()


def test_websocket_buffering_progress():
    """Server reports buffering progress while accumulating audio."""
    with client.websocket_connect("/stream") as ws:
        chunk = make_pcm_chunk(1.0)  # 1 second chunks
        responses = []
        for _ in range(3):
            ws.send_bytes(chunk)
            msg = ws.receive_text()
            responses.append(json.loads(msg))
        # All should be buffering (< 5s total = < MIN_BUFFER_SAMPLES)
        assert all(r["type"] == "buffering" for r in responses)
        # Progress should be increasing
        progresses = [r["progress"] for r in responses]
        assert progresses == sorted(progresses)


def test_websocket_analysis_after_buffer():
    """Server sends analysis event after enough audio is buffered (5s+)."""
    with client.websocket_connect("/stream") as ws:
        # Send 6 seconds of 4/4 click track in one shot
        audio = make_click_pcm(bpm=120, beats_per_bar=4, num_bars=10)
        # Send in 1-second chunks
        chunk_size = SAMPLE_RATE * 4  # 4 bytes per float32, 1 second
        chunk_bytes = SAMPLE_RATE * 4  # actual bytes: SAMPLE_RATE floats × 4 bytes
        total_bytes = len(audio)
        pos = 0
        events = []
        while pos < total_bytes:
            end = min(pos + chunk_bytes, total_bytes)
            ws.send_bytes(audio[pos:end])
            try:
                msg = ws.receive_text()
                events.append(json.loads(msg))
            except Exception:
                break
            pos = end
            if any(e["type"] == "analysis" for e in events):
                break

        analysis_events = [e for e in events if e["type"] == "analysis"]
        assert len(analysis_events) > 0, f"No analysis event received. Got: {[e['type'] for e in events]}"
        result = analysis_events[0]
        assert "bpm" in result
        assert "numerator" in result
        assert "denominator" in result
        assert result["numerator"] in [2, 3, 4]  # Valid time signatures
        assert result["bpm"] > 0
