# Execution-Plan: TimeSignature

**Date:** 2026-04-08  
**Model:** claude-sonnet-4-6 (Sonnet 4.6)  
**Context budget per step:** ≤ 80% of context window

Each step = one commit. Every step has: Goal, Tasks, Tests, Pass Criteria.

---

## STEP 1.1 — Monorepo Scaffold
**Branch:** `scaffold/monorepo-init`  
**Goal:** Initialize project structure, frontend Vite+React+TS, backend FastAPI skeleton.

**Tasks:**
1. Create `/frontend` with `npm create vite@latest -- --template react-ts`
2. Install: `tailwindcss`, `zustand`, `realtime-bpm-analyzer`
3. Configure Tailwind dark theme tokens in `tailwind.config.ts`
4. Create `/backend` with `pyproject.toml` (FastAPI, uvicorn, pydantic, python-multipart)
5. Create `backend/main.py` with `/health` endpoint
6. Create `docker-compose.yml` (frontend dev server + backend uvicorn)
7. Add `.gitignore`, `README.md`
8. Configure ESLint + Prettier in frontend
9. Configure `mypy` in backend

**Tests:**
- `cd frontend && npm run typecheck` → exit 0
- `cd frontend && npm run lint` → exit 0
- `docker compose up -d && curl localhost:8000/health` → `{"status":"ok"}`
- `cd backend && mypy .` → exit 0

**Commit message:** `feat: initialize monorepo scaffold (frontend Vite+React+TS, backend FastAPI)`

---

## STEP 2.1 — Backend: BeatNet Integration
**Branch:** `backend/beatnet-detection`  
**Goal:** Install BeatNet, load model, implement `/analyze` endpoint.

**Tasks:**
1. Add BeatNet to `pyproject.toml` (pip install beatnet or from source)
2. Create `backend/analyzer.py`: load BeatNet model at startup, `analyze_audio(filepath)` → `{bpm, numerator, denominator, confidence}`
3. Implement `POST /analyze`: accept multipart audio file, save temp, run analyzer, return JSON
4. Pydantic response model `AnalysisResult`
5. Audio preprocessing: resample to 22050Hz mono using `librosa`
6. Startup event to pre-load model (avoid cold-start latency)

**Tests:**
- `pytest backend/tests/test_analyze.py` with a bundled 4/4 test WAV
- Assert `numerator == 4`, `denominator == 4`, `bpm` within ±5 of known BPM
- Assert `numerator == 3` for bundled 3/4 test WAV

**Commit message:** `feat: backend BeatNet time signature detection API`

---

## STEP 2.2 — Backend: WebSocket Stream Endpoint
**Branch:** `backend/websocket-stream`  
**Goal:** WebSocket endpoint that accepts chunked mic audio and streams back beat events.

**Tasks:**
1. Implement `WebSocket /stream` in FastAPI
2. Accept binary audio chunks (PCM float32)
3. Buffer chunks, run BeatNet on accumulated audio
4. Send JSON beat events: `{type: "beat", beat: 1, bpm: 120, ...}`
5. Handle disconnect gracefully

**Tests:**
- `pytest backend/tests/test_stream.py`: mock WebSocket client streams PCM audio, assert beat events received

**Commit message:** `feat: backend WebSocket streaming beat detection`

---

## STEP 3.1 — Frontend: Zustand Store + API Client
**Branch:** `frontend/store-api`  
**Goal:** Define app state schema and typed API client.

**Tasks:**
1. Define Zustand store in `frontend/src/store/appStore.ts`:
   - `bpm: number`, `timeSignature: {numerator, denominator}`, `confidence: number`
   - `currentBeat: number`, `isPlaying: boolean`
   - `selectedPattern: string`, `isDrumMuted: boolean`, `isSongMuted: boolean`
   - `inputMode: 'mic' | 'file'`
2. Create `frontend/src/api/analyzeClient.ts`: typed fetch wrapper for `POST /analyze`
3. Create `frontend/src/api/streamClient.ts`: WebSocket wrapper for `/stream`

**Tests:**
- Vitest: store initializes with correct defaults
- Vitest: `analyzeClient` mock fetch → store updated correctly
- `npm run typecheck` passes

**Commit message:** `feat: Zustand store schema and typed API client`

---

## STEP 3.2 — Frontend: Audio Input Components
**Branch:** `frontend/audio-input`  
**Goal:** Mic capture and file upload UI, wired to API, result in store.

**Tasks:**
1. `InputToggle` component: Mic / File switch
2. `MicInput` component: `getUserMedia` → `MediaStream` → WebSocket stream to backend
3. `FileUpload` component: drag-and-drop + button → POST to `/analyze`
4. Loading state, error state, success state
5. On success: dispatch result to Zustand store

**Tests:**
- RTL: `FileUpload` renders, triggers mock API, updates store
- RTL: `InputToggle` switches mode
- Verify in browser: upload a WAV, see result displayed

**Commit message:** `feat: audio input components (mic + file upload) with backend integration`

---

## STEP 4.1 — Frontend: Time Signature Display + BPM Controls
**Branch:** `frontend/timesig-display`  
**Goal:** Large musical notation display, manual override dropdown, BPM controls.

**Tasks:**
1. Load "IM Fell English" Google Font
2. `TimeSignatureDisplay` component: stacked numerator/denominator, 120px+, CSS transition on change
3. `TimeSignatureOverride` dropdown: 2/4, 3/4, 4/4, 5/4, 6/8, 7/8, 9/8
4. `BpmControl` component: display + ±1 ±5 buttons + tap tempo
5. `ConfidenceIndicator`: small badge showing detection confidence %
6. Wire all to Zustand store

**Tests:**
- RTL: `TimeSignatureDisplay` renders numerator/denominator from store
- RTL: dropdown selection updates store
- RTL: tap tempo button computes BPM from tap intervals
- Verify in browser

**Commit message:** `feat: time signature display, override dropdown, BPM controls`

---

## STEP 4.2 — Frontend: Metronome Engine
**Branch:** `frontend/metronome-engine`  
**Goal:** Sample-accurate metronome with dong/tick sounds, look-ahead scheduler.

**Tasks:**
1. `metronome.ts` service: `AudioContext` look-ahead scheduler (100ms lookahead, 25ms interval)
2. `scheduleBeat(beatTime, isDownbeat)`: create `OscillatorNode`
   - Downbeat: 220Hz, 300ms, gain 0.9, ADSR
   - Tick: 880Hz, 50ms, gain 0.4, sharp attack
3. Scheduler fires `onBeat(beatNumber)` callback → updates Zustand `currentBeat`
4. Start/stop controls

**Tests:**
- Timing test: record 100 beat timestamps from scheduler, compute max jitter (target < 5ms in test env)
- Unit test: `scheduleBeat` called with correct parameters for downbeat vs tick
- `npm run typecheck` passes

**Commit message:** `feat: metronome engine with AudioContext look-ahead scheduler`

---

## STEP 4.3 — Frontend: Beat Visual Indicators
**Branch:** `frontend/beat-visuals`  
**Goal:** All three synchronized beat visuals — pendulum, sweep bar, large number.

**Tasks:**
1. `Pendulum` component: SVG arm, CSS `transform: rotate()`, swings left↔right, beat-1 gold color
2. `SweepBar` component: CSS `scaleX` bar that fills from 0→1 over one measure duration, resets on beat 1
3. `BeatNumber` component: large centered number (1…N), bold, gold on beat 1, white otherwise
4. All three subscribe to `currentBeat` from Zustand store
5. Compose into `BeatIndicator` layout component

**Tests:**
- RTL: `BeatNumber` renders correct number from store
- RTL: `Pendulum` applies correct rotation class on beat change
- Verify in browser: all three visuals sync at 120 BPM 4/4

**Commit message:** `feat: three combined beat visuals (pendulum, sweep bar, beat number)`

---

## STEP 5.1 — Frontend: Drum Sample Loader
**Branch:** `frontend/drum-samples`  
**Goal:** Load real drum WAV samples into AudioBuffers, ready for playback.

**Tasks:**
1. Source and add free/open-source drum samples to `/frontend/public/samples/`:
   - `kick.wav`, `snare.wav`, `hihat-closed.wav`, `hihat-open.wav`, `ride.wav`, `crash.wav`
2. `drumSampleLoader.ts`: fetch + `decodeAudioData` for each sample on app init
3. Loading progress indicator
4. Cache decoded `AudioBuffer` objects in module-level map

**Tests:**
- Unit test: all 6 samples load without error (mock fetch)
- Unit test: decoded buffers are non-null `AudioBuffer` instances
- `npm run typecheck` passes

**Commit message:** `feat: drum sample loader with AudioBuffer caching`

---

## STEP 5.2 — Frontend: Drum Sequencer + Pattern Data
**Branch:** `frontend/drum-sequencer`  
**Goal:** Drum pattern JSON data and step sequencer engine synchronized to metronome clock.

**Tasks:**
1. Create `frontend/src/data/drumPatterns.ts`: all pattern definitions (4/4×5, 3/4×3, 6/8×3, 5/4×2, 7/8×2)
2. `drumSequencer.ts`: step counter locked to metronome `AudioContext` clock
   - On each tick from metronome scheduler, fire correct drum steps
   - Use `AudioContext.createBufferSource` per hit
3. Pattern switching: zero-latency swap on bar boundary

**Tests:**
- Unit test: 4/4 Basic Rock pattern fires kick on steps 0,8 of 16
- Unit test: pattern switch applies on next bar
- `npm run typecheck` passes

**Commit message:** `feat: drum sequencer engine with pattern data`

---

## STEP 5.3 — Frontend: Drum UI + Song Audio Toggle
**Branch:** `frontend/drum-ui`  
**Goal:** Drum pattern grid UI, pattern tabs, mute button, song audio toggle.

**Tasks:**
1. `DrumPatternGrid` component: rows (instruments) × columns (steps), active steps highlighted green
2. `PatternTabs` component: named tabs, active tab highlighted
3. Drum mute button
4. Song audio routing: file `AudioBuffer` → `GainNode` → destination; toggle gain 0↔1
5. Song audio toggle button (Play Song / Mute Song)
6. Compose into `DrumSection` layout

**Tests:**
- RTL: `DrumPatternGrid` renders correct grid for 4/4 Basic Rock
- RTL: pattern tab click updates store + grid
- RTL: song toggle updates gain
- Verify in browser: full drum + song playback

**Commit message:** `feat: drum pattern grid UI, pattern tabs, song + drum controls`

---

## STEP 6.1 — PWA Configuration
**Branch:** `pwa/setup`  
**Goal:** Full PWA: manifest, service worker, offline support.

**Tasks:**
1. Install `vite-plugin-pwa` + `workbox-window`
2. Configure in `vite.config.ts`:
   - `manifest.json` with name, icons, theme `#0f0f13`
   - Workbox: `StaleWhileRevalidate` for all assets + `/samples/`
   - `registerType: 'autoUpdate'`
3. Generate 192px + 512px icons
4. Test installability in Chrome

**Tests:**
- Lighthouse CI: PWA score = 100
- Offline test: service worker active, assets load with no network

**Commit message:** `feat: full PWA configuration with Workbox offline caching`

---

## STEP 6.2 — UI Polish + Responsive Layout
**Branch:** `ui/polish`  
**Goal:** Final visual polish, responsive layout, color system, accessibility.

**Tasks:**
1. Apply full color palette (background `#0f0f13`, surface `#1a1a24`, amber `#f5a623`, green `#4ade80`)
2. Responsive layout: CSS Grid, desktop 1200px, tablet 768px breakpoints
3. Loading skeleton components
4. Error boundary + user-friendly messages
5. WCAG AA contrast audit + fixes
6. Keyboard navigation: all controls focusable, Enter/Space triggers

**Tests:**
- Lighthouse: Performance > 90, Accessibility > 90
- Verify in browser: desktop + tablet layouts correct
- Keyboard navigation test

**Commit message:** `feat: UI polish, responsive layout, accessibility`

---

## STEP 6.3 — Deployment
**Branch:** `deploy/production`  
**Goal:** Frontend on Vercel, backend on Railway, environment configured.

**Tasks:**
1. Add `vercel.json` for frontend SPA routing
2. Add `Dockerfile` for backend (python:3.11-slim, uvicorn)
3. Set `VITE_API_URL` env var on Vercel
4. Deploy backend to Railway
5. Deploy frontend to Vercel
6. Smoke test production URL

**Tests:**
- Production URL: upload test WAV → detection result received
- Metronome starts → beats fire correctly
- Offline: disconnect network → app loads from cache

**Commit message:** `deploy: production deployment (Vercel + Railway)`

---

## Step Summary

| Step | Description | Stage |
|------|-------------|-------|
| 1.1 | Monorepo scaffold | 1 |
| 2.1 | Backend BeatNet detection | 2 |
| 2.2 | Backend WebSocket stream | 2 |
| 3.1 | Zustand store + API client | 3 |
| 3.2 | Audio input components | 3 |
| 4.1 | Time signature display + BPM | 4 |
| 4.2 | Metronome engine | 4 |
| 4.3 | Beat visual indicators | 4 |
| 5.1 | Drum sample loader | 5 |
| 5.2 | Drum sequencer + patterns | 5 |
| 5.3 | Drum UI + song toggle | 5 |
| 6.1 | PWA setup | 6 |
| 6.2 | UI polish + responsive | 6 |
| 6.3 | Deployment | 6 |
