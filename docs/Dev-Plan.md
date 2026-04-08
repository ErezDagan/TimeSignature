# Dev-Plan: TimeSignature

**Date:** 2026-04-08  
**Based on:** PRD-C

---

## Overview

The project is split into 6 development stages, ordered by dependency. Each stage produces a testable, committable increment. Backend must be functional before frontend detection integration.

---

## Stage 1 — Project Scaffold & Tooling
**Goal:** Working monorepo with frontend and backend skeletons, CI, linting, type checking.

**Deliverables:**
- Monorepo structure: `/frontend` (Vite + React + TS) + `/backend` (FastAPI + Python)
- Tailwind CSS configured with dark theme tokens
- Zustand store scaffold
- ESLint + Prettier + mypy configured
- Docker Compose for local dev (frontend + backend + hot reload)
- GitHub repo initialized with `.gitignore`, `README.md`

**Tests:**
- `npm run typecheck` passes (zero TS errors)
- `npm run lint` passes
- `docker compose up` starts both services without errors
- `/api/health` returns `200 OK`

**KPIs:** Zero setup errors, both services running in < 30s

---

## Stage 2 — Python Backend: BeatNet Detection API
**Goal:** REST + WebSocket API that accepts audio and returns time signature + BPM using BeatNet.

**Deliverables:**
- `POST /analyze` — accepts audio file (multipart), returns `{ bpm, numerator, denominator, confidence }`
- `WebSocket /stream` — accepts chunked mic audio, streams back real-time beat events
- BeatNet model loaded and inference working
- Audio preprocessing: resample to 22050 Hz mono
- Response schema with Pydantic models

**Tests:**
- Unit test: POST a known 4/4 WAV → assert numerator=4, denominator=4
- Unit test: POST a known 3/4 WAV → assert numerator=3
- WebSocket test: stream mock audio → receive beat events
- Load test: 3 concurrent requests handled without crash

**KPIs:** Detection latency < 5s for 30s audio clip; accuracy > 85% on 10-song test set

---

## Stage 3 — Frontend: Audio Input + Detection Integration
**Goal:** Working audio capture (mic + file) wired to backend, results in Zustand store.

**Deliverables:**
- Mic input: `getUserMedia` → `MediaStream` → chunked WebSocket stream to backend
- File upload: drag-and-drop + button → POST to `/analyze`
- Input toggle switch (Mic / File)
- Detection loading state + error handling
- Zustand store updated with `{ bpm, numerator, denominator, confidence }`
- Basic result display (unstyled, functional)

**Tests:**
- Component test: file upload renders result in store
- Component test: toggle switch changes input mode
- Mock backend: verify correct API calls made
- Typecheck passes

**KPIs:** End-to-end detection flow working in browser within 5s

---

## Stage 4 — Frontend: Time Signature Display + Metronome Engine
**Goal:** Full visual time signature display, manual override dropdown, and synchronized metronome with three visual indicators.

**Deliverables:**
- `TimeSignatureDisplay` component: stacked numerals (IM Fell English font, 120px+), animated transition
- Manual override dropdown: 2/4, 3/4, 4/4, 5/4, 6/8, 7/8, 9/8
- BPM display with ±1, ±5 buttons and tap tempo
- Metronome engine: `AudioContext`-based look-ahead scheduler
  - Dong: 220Hz sine, 300ms, gain 0.9
  - Tick: 880Hz sine, 50ms, gain 0.4
- Beat visual 1: **Pendulum** — SVG arm swings left↔right per beat
- Beat visual 2: **Sweep bar** — CSS bar fills across full measure, resets on beat 1
- Beat visual 3: **Large number** — centered number counts 1…N per measure
- Beat 1: gold/amber color across all three visuals
- Start/stop metronome button

**Tests:**
- Timing test: schedule 100 beats, measure max jitter (target < 2ms)
- Visual test: pendulum completes one swing per beat at 120 BPM
- Component test: dropdown override updates time signature display
- Verify in browser

**KPIs:** Metronome jitter < 2ms; all three visuals in sync

---

## Stage 5 — Frontend: Drum Pattern Engine + Real Samples
**Goal:** Drum patterns with real audio samples, synchronized to metronome, mixed with song audio.

**Deliverables:**
- Drum sample loader: fetch and decode WAV samples into AudioBuffers (kick, snare, hi-hat closed, hi-hat open, ride, crash)
- Drum scheduler: step sequencer locked to metronome `AudioContext` clock
- Pattern data: JSON definitions for all patterns (4/4 × 5, 3/4 × 3, 6/8 × 3, 5/4 × 2, 7/8 × 2)
- `DrumPatternGrid` component: step sequencer visualization (rows × steps)
- Pattern tab selector (named tabs)
- Drum mute/unmute button
- Song audio routing: decoded song `AudioBuffer` → `GainNode` → output; toggle gain 0/1
- Song audio toggle button

**Tests:**
- Audio test: drum scheduler fires correct steps at correct times (tolerance < 5ms)
- Component test: pattern tab switch updates active pattern
- Component test: song toggle mutes/unmutes song audio
- Component test: drum mute button works independently
- Verify in browser

**KPIs:** Drum/metronome sync drift < 5ms over 60s; all patterns audible

---

## Stage 6 — PWA, Polish & Deployment
**Goal:** Full PWA with offline support, polished UI, deployed to production.

**Deliverables:**
- `vite-plugin-pwa` + Workbox configured: cache all assets + drum samples
- `manifest.json`: icons (192px, 512px), name, theme color `#0f0f13`
- Service worker: stale-while-revalidate for assets
- Full responsive layout (desktop 1200px+, tablet 768px+)
- Color palette applied: background `#0f0f13`, accent `#f5a623`, active `#4ade80`
- Confidence indicator next to time signature
- Loading skeleton states
- Error boundary + user-friendly error messages
- Lighthouse audit: PWA 100, Performance > 90
- Frontend deployed to Vercel
- Backend deployed to Railway (Docker)
- Environment variables: `VITE_API_URL`

**Tests:**
- Lighthouse CI: PWA score = 100
- Offline test: disconnect network → app loads from cache
- Installability test: "Add to Home Screen" prompt appears
- E2E smoke test: upload file → detection → metronome start → drum pattern play

**KPIs:** Lighthouse PWA=100, Performance>90; offline load < 500ms

---

## Merge Strategy

| After Stage | Merge to main? |
|-------------|---------------|
| Stage 1 | Yes — scaffold complete |
| Stage 2 | Yes — backend stable |
| Stage 3 | Yes — detection flow working |
| Stage 4 | Yes — core music features working |
| Stage 5 | Yes — full feature complete |
| Stage 6 | Yes — production release |
