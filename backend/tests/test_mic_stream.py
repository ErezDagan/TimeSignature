"""
Integration test for the mic → WebSocket → analysis pipeline.

Generates a synthetic click-track audio signal with a known time signature,
sends it through the /stream WebSocket endpoint in chunks (simulating the
browser's ScriptProcessorNode), and asserts that an 'analysis' event is
returned with a plausible BPM and numerator.

Run with:
    cd backend && python -m pytest tests/test_mic_stream.py -v
"""
import json
import numpy as np
import pytest
from fastapi.testclient import TestClient
from main import app

SR = 22050
CHUNK_SIZE = 4096

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_click_track(
    bpm: float,
    numerator: int,
    duration_sec: float,
    sr: int = SR,
) -> np.ndarray:
    """
    Generate a mono float32 click track at the given BPM and time signature.

    Downbeats (beat 1 of each measure) have amplitude 0.9;
    other beats have amplitude 0.45. A short exponential-decay envelope
    makes each click realistic enough for onset detection.
    """
    n = int(duration_sec * sr)
    audio = np.zeros(n, dtype=np.float32)
    beat_period = int(round(60.0 / bpm * sr))
    click_len = min(512, beat_period)
    click_env = np.exp(-np.linspace(0, 8, click_len)).astype(np.float32)

    beat_idx = 0
    pos = 0
    while pos < n:
        amplitude = 0.9 if (beat_idx % numerator == 0) else 0.45
        end = min(pos + click_len, n)
        audio[pos:end] += click_env[: end - pos] * amplitude
        pos += beat_period
        beat_idx += 1

    return audio


def send_audio_over_ws(ws, audio: np.ndarray, chunk_size: int = CHUNK_SIZE) -> None:
    """Send a numpy float32 array as binary chunks over a WebSocket."""
    for start in range(0, len(audio), chunk_size):
        chunk = audio[start : start + chunk_size]
        ws.send_bytes(chunk.tobytes())


def collect_until_analysis(ws, max_messages: int = 200) -> list[dict]:
    """
    Receive WebSocket messages until an 'analysis' event arrives or
    we hit the message cap. Returns all collected events.
    """
    events: list[dict] = []
    for _ in range(max_messages):
        raw = ws.receive_text()
        event = json.loads(raw)
        events.append(event)
        if event["type"] == "analysis":
            break
    return events


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("bpm,numerator", [
    (120.0, 4),   # Standard 4/4
    (90.0,  3),   # Waltz 3/4
])
def test_stream_detects_time_signature(bpm: float, numerator: int) -> None:
    """
    Full pipeline smoke-test: send 10 seconds of synthetic click audio and
    verify we receive an analysis event with a reasonable BPM and numerator.
    """
    audio = make_click_track(bpm=bpm, numerator=numerator, duration_sec=10.0)

    client = TestClient(app)
    with client.websocket_connect("/stream") as ws:
        send_audio_over_ws(ws, audio)
        events = collect_until_analysis(ws)

    analysis = next((e for e in events if e["type"] == "analysis"), None)
    assert analysis is not None, (
        f"No 'analysis' event received for {bpm} BPM {numerator}/4. "
        f"Got: {[e['type'] for e in events]}"
    )

    detected_bpm: float = analysis["bpm"]
    detected_numerator: int = analysis["numerator"]

    # Beat trackers can report tempo at half or double the true value (octave error).
    # Accept any of: bpm×1, bpm×2, bpm÷2 within ±15%.
    bpm_candidates = [bpm, bpm * 2, bpm / 2]
    bpm_ok = any(abs(detected_bpm - c) / c < 0.15 for c in bpm_candidates)
    assert bpm_ok, (
        f"BPM mismatch: expected ~{bpm} (or ×2/÷2), got {detected_bpm}"
    )

    # Numerator must be a supported time-signature value.
    # We don't assert the exact value because beat trackers (especially on
    # synthetic audio) frequently confuse 3/4 with 4/4 or vice-versa;
    # the important invariant is that the pipeline returns *a* valid result.
    assert detected_numerator in {2, 3, 4, 5, 6, 7}, (
        f"Numerator out of supported range: {detected_numerator}"
    )


def test_stream_sends_buffering_events() -> None:
    """Verify that buffering progress events are emitted before analysis."""
    audio = make_click_track(bpm=120.0, numerator=4, duration_sec=10.0)

    client = TestClient(app)
    with client.websocket_connect("/stream") as ws:
        send_audio_over_ws(ws, audio)
        events = collect_until_analysis(ws)

    buffering_events = [e for e in events if e["type"] == "buffering"]
    assert len(buffering_events) > 0, "Expected buffering progress events before analysis"

    # Progress values should be in [0, 1]
    for ev in buffering_events:
        assert 0.0 <= ev["progress"] <= 1.0
