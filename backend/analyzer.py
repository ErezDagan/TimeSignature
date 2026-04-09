"""
Audio analyzer using BeatNet for time signature and BPM detection.
Falls back to librosa-only analysis when BeatNet is unavailable.
"""
import os
import tempfile
import numpy as np
import librosa
import soundfile as sf

# Lazy-loaded BeatNet instance (initialized once)
_beatnet = None


def _get_beatnet():
    """Lazy-initialize BeatNet (model 1, offline DBN mode)."""
    global _beatnet
    if _beatnet is None:
        from BeatNet.BeatNet import BeatNet
        _beatnet = BeatNet(model=1, mode="offline", inference_model="DBN", plot=[])
    return _beatnet


def analyze_file(audio_path: str) -> dict:
    """
    Analyze an audio file and return BPM, time signature, and confidence.

    Returns:
        {
            "bpm": float,
            "numerator": int,
            "denominator": int,
            "confidence": float  (0.0 – 1.0)
        }
    """
    # Load and preprocess: resample to 22050 Hz mono
    y, sr = librosa.load(audio_path, sr=22050, mono=True)

    # Try BeatNet first; fall back to librosa if unavailable
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            tmp_path = tmp.name
        sf.write(tmp_path, y, 22050)

        beatnet = _get_beatnet()
        output = beatnet.process(tmp_path)  # shape: (N, 2) → [beat_time, beat_position]

        if output is None or len(output) < 4:
            return _analyze_with_librosa(y, sr=22050)

        beat_times = output[:, 0].astype(float)
        beat_positions = output[:, 1].astype(int)

        if len(beat_times) > 1:
            ibi = np.diff(beat_times)
            median_ibi = float(np.median(ibi))
            bpm = round(60.0 / median_ibi, 1) if median_ibi > 0 else 120.0
        else:
            bpm = 120.0

        numerator, confidence = _infer_time_signature(beat_positions)
        denominator = 8 if (numerator == 3 and bpm > 170) else 4

        return {
            "bpm": bpm,
            "numerator": numerator,
            "denominator": denominator,
            "confidence": round(confidence, 2),
        }
    except Exception:
        return _analyze_with_librosa(y, sr=22050)
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)


def _analyze_with_librosa(y: np.ndarray, sr: int = 22050) -> dict:
    """Librosa-only fallback: estimates BPM and infers time signature from beat strengths."""
    tempo_arr, beat_frames = librosa.beat.beat_track(y=y, sr=sr, units="frames")
    bpm = float(np.atleast_1d(tempo_arr)[0])

    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    beat_strengths = onset_env[beat_frames] if len(beat_frames) >= 4 else np.array([])

    if len(beat_strengths) >= 8:
        numerator, confidence = _find_meter_from_strengths(beat_strengths)
    else:
        numerator, confidence = 4, 0.2

    denominator = 8 if (numerator == 3 and bpm > 170) else 4
    return {
        "bpm": round(bpm, 1),
        "numerator": numerator,
        "denominator": denominator,
        "confidence": round(confidence, 2),
    }


def _find_meter_from_strengths(beat_strengths: np.ndarray) -> tuple[int, float]:
    """
    Infer time signature numerator from beat onset-strength pattern.

    For each candidate meter m, check which beat position carries the most
    energy on average (the downbeat). The meter whose downbeat has the highest
    contrast against the other positions wins.
    """
    best_meter, best_contrast = 4, 0.0
    for m in [2, 3, 4, 6]:
        group_means = [
            float(np.mean(beat_strengths[pos::m])) if len(beat_strengths[pos::m]) > 0 else 0.0
            for pos in range(m)
        ]
        if not group_means:
            continue
        contrast = max(group_means) / (float(np.mean(group_means)) + 1e-8)
        if contrast > best_contrast:
            best_contrast = contrast
            best_meter = m

    # contrast of 1.0 = uniform (no downbeat), 2.0+ = clear downbeat
    confidence = min(0.85, max(0.2, (best_contrast - 1.0) / 1.5))
    return best_meter, confidence


def _infer_time_signature(beat_positions: np.ndarray) -> tuple[int, float]:
    """
    Infer the time signature numerator from beat position sequence.

    BeatNet outputs beat_position = 1 for downbeats, 2/3/4 for other beats.
    We count the number of beats in each measure (gap between consecutive 1s).
    """
    downbeat_indices = np.where(beat_positions == 1)[0]

    if len(downbeat_indices) < 2:
        return 4, 0.3  # Default to 4/4 with low confidence

    # Count beats per measure
    beats_per_measure = np.diff(downbeat_indices)

    # Mode = most common beats_per_measure value
    values, counts = np.unique(beats_per_measure, return_counts=True)
    mode_idx = np.argmax(counts)
    mode_value = int(values[mode_idx])
    confidence = float(counts[mode_idx]) / float(len(beats_per_measure))

    # Clamp to supported time signatures
    supported = [2, 3, 4, 5, 6, 7]
    if mode_value not in supported:
        mode_value = min(supported, key=lambda x: abs(x - mode_value))
        confidence *= 0.7

    # Promote 2/4 → 4/4 when there is no clear 3/4 or odd-meter evidence.
    # BeatNet sometimes collapses 4/4 to 2/4 on tracks with strong beat-1 only.
    # We promote when: numerator==2 AND 3 is not a common pattern.
    if mode_value == 2:
        counts_dict = dict(zip(values.tolist(), counts.tolist()))
        # If there are any 3-beat measures in the data, keep 2
        if 3 not in counts_dict:
            mode_value = 4
            confidence *= 0.8  # Slightly lower confidence since it's inferred

    return mode_value, confidence
