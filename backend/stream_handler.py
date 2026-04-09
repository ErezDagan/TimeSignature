"""
WebSocket stream handler for real-time mic audio → beat detection.

Protocol:
  Client → Server: binary PCM float32 chunks (22050 Hz, mono)
  Server → Client: JSON beat events

Beat event shape:
  { "type": "beat", "beat": 1, "bpm": 120.0, "numerator": 4, "denominator": 4 }
  { "type": "analysis", "bpm": 120.0, "numerator": 4, "denominator": 4, "confidence": 0.85 }
  { "type": "error", "message": "..." }
"""
from __future__ import annotations

import json
import tempfile
import os
from typing import Optional
import numpy as np
import soundfile as sf
from fastapi import WebSocket, WebSocketDisconnect

SAMPLE_RATE = 22050
# Buffer 5 seconds of audio before running analysis (enough for BeatNet)
MIN_BUFFER_SECONDS = 5
MIN_BUFFER_SAMPLES = SAMPLE_RATE * MIN_BUFFER_SECONDS
# Re-analyze every 3 seconds of new audio
REANALYSIS_STRIDE_SECONDS = 3
REANALYSIS_STRIDE_SAMPLES = SAMPLE_RATE * REANALYSIS_STRIDE_SECONDS


async def handle_stream(websocket: WebSocket) -> None:
    """
    Handles a WebSocket connection for real-time audio streaming.
    Accepts PCM float32 binary frames, buffers audio, and streams back beat events.
    """
    await websocket.accept()

    audio_buffer: list[float] = []
    last_analysis_sample: int = 0
    last_result: dict | None = None

    try:
        while True:
            try:
                data = await websocket.receive_bytes()
            except WebSocketDisconnect:
                break

            # Decode float32 PCM chunk
            chunk = np.frombuffer(data, dtype=np.float32)
            audio_buffer.extend(chunk.tolist())

            total_samples = len(audio_buffer)

            # Wait until we have enough audio for a meaningful analysis
            if total_samples < MIN_BUFFER_SAMPLES:
                # Send a "buffering" progress event
                progress = total_samples / MIN_BUFFER_SAMPLES
                await websocket.send_text(json.dumps({
                    "type": "buffering",
                    "progress": round(progress, 2),
                }))
                continue

            # Re-analyze only when we've accumulated enough new samples
            new_samples = total_samples - last_analysis_sample
            if new_samples < REANALYSIS_STRIDE_SAMPLES and last_result is not None:
                # Still emit beat tick based on last result
                if last_result:
                    await websocket.send_text(json.dumps({
                        "type": "tick",
                        "bpm": last_result["bpm"],
                    }))
                continue

            # Run BeatNet analysis on accumulated buffer
            audio_array = np.array(audio_buffer, dtype=np.float32)
            result, error = await _analyze_buffer(audio_array)

            if error:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": f"Analysis failed: {error}",
                }))
            elif result:
                last_result = result
                last_analysis_sample = total_samples
                await websocket.send_text(json.dumps({
                    "type": "analysis",
                    **result,
                }))

    except Exception as e:
        try:
            await websocket.send_text(json.dumps({
                "type": "error",
                "message": str(e),
            }))
        except Exception:
            pass
    finally:
        try:
            await websocket.close()
        except Exception:
            pass


async def _analyze_buffer(audio: np.ndarray) -> tuple[Optional[dict], Optional[str]]:
    """
    Write buffer to temp file and run analysis.
    Returns (result, error_message) — exactly one of which will be non-None.
    """
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp_path = tmp.name
    try:
        sf.write(tmp_path, audio, SAMPLE_RATE)
        from analyzer import analyze_file
        result = analyze_file(tmp_path)
        return result, None
    except Exception as e:
        return None, str(e)
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)
