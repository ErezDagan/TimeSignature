# PRD-A: TimeSignature — Basic Requirements Document

**Project Name:** TimeSignature  
**Date:** 2026-04-08  
**Version:** A (Initial)

---

## Introduction

TimeSignature is a web application that listens to a song in real time, automatically detects its time signature (e.g., 3/4, 4/4, 6/8), and provides musicians with a rich interactive experience including visual time signature display, a synchronized metronome with a distinctive "dong" on beat 1, and toggleable drum pattern suggestions appropriate to the detected meter.

---

## Goals

1. Detect the time signature of a playing song from microphone or file input.
2. Display the time signature clearly and visually on screen.
3. Provide a synchronized metronome that plays a distinct "dong" sound on beat 1.
4. Offer multiple drum role patterns appropriate to the detected time signature.
5. Allow the user to toggle between drum role patterns.

---

## User Stories

### US-001: Song Listening & Time Signature Detection
**As a** musician or music student,  
**I want** to play a song (via microphone or file upload) and have the app detect its time signature,  
**So that** I can quickly know the meter of the piece.

**Acceptance Criteria:**
- App accepts audio input via microphone or audio file (MP3/WAV/FLAC)
- App displays a loading/analyzing state while detecting
- App displays detected time signature (numerator/denominator, e.g., 4/4, 3/4, 6/8)
- Detection updates in real-time or near-real-time (within 5 seconds of audio start)

---

### US-002: Visual Time Signature Display
**As a** user,  
**I want** the time signature displayed visually in a large, clear format,  
**So that** I can see it at a glance while playing or reading music.

**Acceptance Criteria:**
- Time signature is shown in standard musical notation style (large stacked numbers)
- Display updates when a new time signature is detected
- Display is readable from a distance (minimum 120px font)

---

### US-003: Synchronized Metronome
**As a** musician,  
**I want** a metronome that plays in sync with the detected time signature and BPM,  
**So that** I can practice along with the exact beat of the song.

**Acceptance Criteria:**
- Metronome ticks at detected BPM
- Beat 1 plays a distinct "dong" sound (lower pitched, louder)
- Beats 2, 3, 4 etc. play a softer "tick" sound
- Visual beat indicator highlights current beat position
- User can start/stop metronome independently
- User can manually adjust BPM ± from detected value

---

### US-004: Drum Role Patterns
**As a** musician or drummer,  
**I want** to see and hear suggested drum patterns appropriate to the detected time signature,  
**So that** I can learn or experiment with different drum roles over the song.

**Acceptance Criteria:**
- App offers at least 3 different drum patterns per time signature
- Patterns are labeled by style (e.g., "Basic Rock," "Jazz Swing," "Waltz")
- User can toggle between patterns with a single click/tap
- Selected drum pattern plays in sync with the metronome
- User can mute/unmute the drum pattern independently

---

## Non-Goals (v1)

- MIDI output or DAW integration
- Advanced music theory analysis beyond time signature and BPM
- Multi-track recording
- User accounts or cloud storage
- Mobile native app (web responsive is sufficient)

---

## Design Considerations

- Clean, dark-mode UI inspired by music production tools
- Large, readable numbers for time signature (musical notation style)
- Beat indicator pads/circles that light up on each beat
- Drum pattern visualized as a grid (step sequencer style)
- Minimal, focused interface — no clutter

---

## Technical Considerations

- Web Audio API for audio processing and precise timing
- Browser-based (no server required for basic operation)
- Real-time BPM/tempo detection using `realtime-bpm-analyzer` library
- Time signature inference from downbeat/beat grouping analysis
- Metronome scheduling via AudioContext for sample-accurate timing
- Drum sounds synthesized via Web Audio API oscillators or loaded samples

---

## Success Metrics

- Time signature detected correctly for common meters (4/4, 3/4, 6/8) with >80% accuracy
- Metronome timing drift < 5ms per beat
- Drum pattern toggle latency < 100ms
- App loads in < 3 seconds on modern browser

---

## Open Questions

- Should the app support offline use (PWA)?
- What audio formats should be supported for file upload?
- Should drum patterns include audio samples or synthesized sounds?
- Is a Python backend needed for more accurate time signature ML detection, or can we do it entirely in-browser?
