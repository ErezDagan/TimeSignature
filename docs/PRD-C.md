# PRD-C: TimeSignature — Final Requirements (Post-Clarification)

**Project Name:** TimeSignature  
**Date:** 2026-04-08  
**Version:** C (Final — answers incorporated)

---

## Clarification Answers

| Q | Answer |
|---|--------|
| Q1 Audio Input | **C** — Both mic and file upload, switchable at any time |
| Q2 Detection | **B** — Python/ML backend using BeatNet for accurate time signature detection |
| Q3 Drum Sounds | **B** — Real audio samples (WAV/MP3 drum hits) |
| Q4 Override | **A** — Dropdown to manually select time signature |
| Q5 Drum Mixing | **C** — Drums play with song audio; user toggles song on/off |
| Q6 Beat Visual | **B+C+D** — Pendulum + sweeping bar + large counting number, all three |
| Q7 PWA | **A** — Full PWA: installable, works offline |

---

## Introduction

TimeSignature is a full-stack web application (React PWA + Python backend) that:
1. Accepts audio via **microphone** or **file upload** (switchable)
2. Sends audio to a **Python/BeatNet backend** for accurate time signature + BPM detection
3. Displays the time signature in **large musical notation**, with a **manual dropdown override**
4. Runs a synchronized **metronome** with three combined visual indicators: **pendulum**, **sweeping progress bar**, and **large beat count number**; distinct "dong" on beat 1
5. Plays **real audio sample drum patterns** in sync, mixed with the original song audio; user toggles song audio on/off
6. Works as a **full PWA** — installable to home screen, fully offline after first load

---

## User Stories (Final)

### US-001: Audio Input Selection
- Mic input via Web Audio API `getUserMedia`
- File upload: MP3, WAV, FLAC, OGG (max 50MB)
- Toggle switch between mic and file at any time without page reload
- Verify in browser using dev-browser skill

### US-002: Time Signature Detection (Backend)
- Frontend streams/sends audio to Python backend
- Backend runs BeatNet model → returns `{ bpm, numerator, denominator, confidence }`
- Frontend polls or receives WebSocket result
- Result displayed within ~3–5 seconds of audio start
- Typecheck passes

### US-003: Visual Time Signature Display
- Large stacked numerator/denominator in serif musical font (min 120px)
- Dropdown override: supported meters 2/4, 3/4, 4/4, 5/4, 6/8, 7/8, 9/8
- Animated transition on change
- Verify in browser using dev-browser skill

### US-004: BPM Display & Control
- BPM shown as integer
- ±1, ±5 adjustment buttons
- Tap tempo button
- Typecheck passes

### US-005: Metronome — Three Combined Visuals
- **Pendulum:** SVG pendulum swinging left-right, one swing per beat
- **Sweeping bar:** horizontal progress bar that fills across one full measure, resets on beat 1
- **Large number:** centered countdown number (1, 2, 3, 4...) matching beat position
- Beat 1: gold/amber color, dong sound (lower pitch, louder)
- Beats 2–N: white, tick sound (higher pitch, softer)
- All scheduled via `AudioContext.currentTime` (< 2ms jitter)
- Start/stop button
- Verify in browser using dev-browser skill

### US-006: Drum Patterns — Real Samples + Song Mix
- Real drum hit samples (kick, snare, hi-hat closed, hi-hat open, ride, crash) loaded as AudioBuffers
- 3–5 named patterns per time signature (see drum patterns table in PRD-B)
- Step sequencer grid UI (16 steps for 4/4, 12 for 3/4/6/8)
- Pattern tabs to toggle between patterns
- Song audio toggle (play/mute original audio while drums run)
- Drum mute button independent of song toggle
- All audio synchronized via single AudioContext scheduler
- Verify in browser using dev-browser skill

### US-007: PWA — Full Offline
- `manifest.json` with icons, name, theme color
- Service Worker caching all static assets + drum samples
- Installable on desktop and mobile home screen
- App shell loads instantly offline
- Typecheck passes

---

## Architecture (Final)

```
┌─────────────────────────────────────────────────────────────┐
│                    BROWSER (React PWA)                       │
│                                                              │
│  ┌──────────────┐   ┌──────────────────────────────────┐   │
│  │  Audio Input  │   │         React UI                  │   │
│  │  - Mic stream │   │  ┌──────────┐ ┌───────────────┐  │   │
│  │  - File upload│   │  │Time Sig  │ │ Beat Visuals  │  │   │
│  └──────┬───────┘   │  │Display + │ │ - Pendulum    │  │   │
│         │            │  │Dropdown  │ │ - Sweep bar   │  │   │
│         ▼            │  └──────────┘ │ - Beat number │  │   │
│  ┌──────────────┐   │  ┌──────────┐ └───────────────┘  │   │
│  │  Audio Engine│   │  │BPM + Tap │ ┌───────────────┐  │   │
│  │  - Metronome │   │  │Tempo     │ │Drum Grid +    │  │   │
│  │  - Drum Seq. │   │  └──────────┘ │Pattern Tabs   │  │   │
│  │  - Song mix  │   │               └───────────────┘  │   │
│  └──────────────┘   └──────────────────────────────────┘   │
│         │                                                    │
│         ▼                      ▲                            │
│  ┌─────────────────────────────┴──────────────────────┐    │
│  │           Zustand App State                         │    │
│  │  bpm | timeSignature | beat | pattern | isPlaying   │    │
│  └────────────────────────────────────────────────────┘    │
│         │                                                    │
│         ▼ HTTP / WebSocket                                  │
├──────────────────────────────────────────────────────────── ┤
│                  PYTHON BACKEND (FastAPI)                    │
│                                                              │
│   POST /analyze  ──►  BeatNet Model                         │
│   WebSocket /stream ──► real-time beat tracking             │
│                                                              │
│   Returns: { bpm, numerator, denominator, confidence }      │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack (Final)

| Layer | Technology |
|-------|-----------|
| Frontend framework | React 18 + TypeScript |
| Build tool | Vite 5 |
| Styling | Tailwind CSS v3 |
| State management | Zustand |
| Audio analysis (client) | Web Audio API (native) |
| BPM library | realtime-bpm-analyzer v5 |
| Backend framework | FastAPI (Python 3.11) |
| ML model | BeatNet (joint beat/downbeat/meter) |
| Backend packaging | Docker |
| Drum sounds | Real WAV samples (free/open-source kit) |
| Visuals | SVG (pendulum), CSS animation (sweep bar) |
| PWA | Vite PWA plugin + Workbox |
| Font | IM Fell English (Google Fonts) |
| Testing | Vitest + React Testing Library + pytest |
| Deployment | Vercel (frontend) + Railway/Render (backend) |

---

## Non-Goals (v1)

- MIDI output
- Multi-track or DAW integration
- User accounts / cloud sync
- Chord / harmony analysis
- Native mobile app

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Time signature accuracy (4/4, 3/4, 6/8) | > 85% on test corpus |
| BPM detection accuracy | ± 2 BPM |
| Metronome jitter | < 2ms per beat |
| App load (cached) | < 500ms |
| Lighthouse PWA score | 100 |
| Lighthouse performance | > 90 |
