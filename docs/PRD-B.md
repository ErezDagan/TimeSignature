# PRD-B: TimeSignature — Full Product & Architecture Analysis

**Project Name:** TimeSignature  
**Date:** 2026-04-08  
**Version:** B (Analysis)  
**Based on:** PRD-A + Research of similar products and reference technologies

---

## Introduction

TimeSignature is a browser-based web application that listens to audio (microphone or file upload), detects the time signature and BPM in real time, displays the results in a clear musical notation style, runs a synchronized metronome with distinctive beat-1 "dong," and provides toggleable drum pattern suggestions appropriate to the detected meter.

The application targets musicians, music students, and drummers who want to quickly identify a song's meter and practice with relevant rhythmic patterns.

---

## Product Goals

| Priority | Goal |
|----------|------|
| P0 | Real-time time signature detection from live audio or file |
| P0 | Visual display of time signature in musical notation format |
| P0 | Synchronized metronome with distinct beat-1 "dong" |
| P1 | Toggleable drum role patterns per time signature |
| P1 | BPM display and manual adjustment |
| P2 | PWA / offline support |
| P2 | Export/share current settings |

---

## User Stories

### US-001: Audio Input Selection
**As a** user,  
**I want** to choose between microphone input or file upload,  
**So that** I can use the app in different practice scenarios.

**Acceptance Criteria:**
- Input selector shown on landing screen
- Microphone requests permission via browser API
- File upload accepts MP3, WAV, FLAC, OGG (max 50MB)
- Input source switchable without full page reload
- Verify in browser using dev-browser skill

---

### US-002: Time Signature Detection
**As a** musician,  
**I want** the app to analyze the audio and detect the time signature,  
**So that** I can immediately understand the meter of a song.

**Acceptance Criteria:**
- Detection starts within 2 seconds of audio input beginning
- Supports detection of: 4/4, 3/4, 6/8, 2/4, 5/4, 7/8
- Confidence indicator shown alongside result
- Detection updates if meter changes during playback
- Typecheck passes

---

### US-003: Visual Time Signature Display
**As a** musician,  
**I want** the time signature shown in large musical notation style,  
**So that** I can read it clearly during performance.

**Acceptance Criteria:**
- Stacked numerator/denominator in a serif musical font
- Minimum 120px numerals, centered on screen
- Animated transition when time signature changes
- Dark background with high-contrast white/gold numerals
- Verify in browser using dev-browser skill

---

### US-004: BPM Display
**As a** user,  
**I want** to see the detected BPM alongside the time signature,  
**So that** I understand the tempo.

**Acceptance Criteria:**
- BPM shown as integer (e.g., "120 BPM")
- ± manual adjustment buttons (±1, ±5)
- Tap tempo button as alternative input
- Typecheck passes

---

### US-005: Synchronized Metronome
**As a** musician,  
**I want** a metronome synchronized to the detected BPM and time signature,  
**So that** I can play along precisely.

**Acceptance Criteria:**
- Start/stop button
- Beat 1: low-pitched "dong" (220 Hz, 0.3s, high gain)
- Beats 2-N: high-pitched "tick" (880 Hz, 0.05s, lower gain)
- Visual beat indicator: N circles (one per beat), light up in sequence
- Beat circle 1 highlighted in gold/amber; others in white
- Scheduling via `AudioContext.currentTime` (not setTimeout) for < 2ms jitter
- Typecheck passes

---

### US-006: Drum Pattern Display & Playback
**As a** drummer or musician,  
**I want** to see and hear suggested drum patterns for the detected time signature,  
**So that** I can learn appropriate rhythmic roles.

**Acceptance Criteria:**
- Minimum 3 named patterns per time signature (see Drum Patterns section)
- Patterns displayed as a step sequencer grid (rows: kick, snare, hi-hat, ride)
- Active pattern highlighted in grid
- Pattern playback synchronized with metronome
- Toggle between patterns via tab/button UI
- Mute/unmute drum pattern independently of metronome
- Verify in browser using dev-browser skill

---

### US-007: Responsive & Accessible UI
**As a** user on any device,  
**I want** the app to work well on desktop and tablet,  
**So that** I can use it in my studio or practice room.

**Acceptance Criteria:**
- Responsive layout: desktop (1200px+), tablet (768px+)
- All interactive controls keyboard accessible
- Color contrast meets WCAG AA
- Verify in browser using dev-browser skill

---

## Non-Goals (v1)

- MIDI output or external hardware sync
- Advanced harmony/chord analysis
- Multi-track recording or DAW integration
- User accounts, cloud sync, or social features
- Native mobile app (iOS/Android)
- Video output

---

## Functional Requirements

### Audio Engine
- Use Web Audio API exclusively (no external audio libraries)
- `AudioContext` for all timing — never `setTimeout`/`setInterval` for audio
- `AnalyserNode` + `ScriptProcessorNode` or `AudioWorklet` for real-time analysis
- Support both `MediaStream` (microphone) and `AudioBuffer` (file) sources

### Time Signature Detection Algorithm
Two-stage pipeline:

**Stage 1 — BPM/Tempo Detection:**
- Use `realtime-bpm-analyzer` (v5+, zero dependencies, TypeScript)
- Fallback: spectral flux onset detection (custom or Web-Onset reference)
- Output: BPM float, confidence 0–1

**Stage 2 — Meter/Time Signature Inference:**
- Analyze inter-onset intervals (IOI) for grouping patterns
- Autocorrelation of beat strength at beat-level and bar-level
- Heuristic rules:
  - IOI ratio 3:1 sub-beats → 3/4 or 6/8
  - IOI ratio 4:1 sub-beats → 4/4 or 2/4
  - IOI ratio 5:1 → 5/4
  - IOI ratio 7:1 → 7/8
- Use energy envelope peak analysis at beat-1 position for downbeat confirmation
- Output: { numerator, denominator, confidence }

### Metronome Engine
- Look-ahead scheduler: schedule beats 100ms in advance
- `OscillatorNode` for dong/tick synthesis (no audio files needed)
- Dong: 220Hz sine, 300ms, ADSR envelope, gain 0.9
- Tick: 880Hz sine, 50ms, sharp attack, gain 0.4
- Beat position state machine drives visual indicator updates

### Drum Pattern Engine
- Pattern data: JSON arrays of step-on/off per instrument per beat subdivision
- 16 steps per measure for 4/4; 12 steps for 3/4 (or 6/8 = 12 steps)
- Instruments: Kick, Snare, Hi-Hat (closed), Hi-Hat (open), Ride, Crash
- Each instrument synthesized via Web Audio API:
  - Kick: low-frequency sine + noise burst
  - Snare: noise + mid-frequency oscillator
  - Hi-hat: high-frequency filtered noise
- Pattern selection: tab component (3–5 patterns per time signature)
- Pattern plays in lock-step with metronome scheduler

---

## Drum Patterns by Time Signature

### 4/4 Patterns
| Name | Style |
|------|-------|
| Basic Rock | Kick on 1,3; Snare on 2,4; Hi-hat all 8ths |
| Funk Groove | Syncopated kick; Snare ghost notes; Open hi-hat on "and" of 2 |
| Jazz Ride | Ride cymbal jazz pattern; Snare brushwork; Kick sparse |
| Pop/Dance | Four-on-the-floor kick; Snare 2,4; Hi-hat 16ths |
| Shuffle | Swing-feel 8th note hi-hat; Snare 2,4; Kick 1, and-of-2 |

### 3/4 (Waltz) Patterns
| Name | Style |
|------|-------|
| Classic Waltz | Kick on 1; Hi-hat on 2,3; Snare on 3 |
| Jazz Waltz | Ride on all 3; Snare on 2 sometimes; Kick on 1 |
| Rock Waltz | Kick on 1, Snare on 2,3; Open hi-hat on 3 |

### 6/8 Patterns
| Name | Style |
|------|-------|
| 6/8 Ballad | Kick on 1,4; Hi-hat all 6; Snare on 3,6 |
| 6/8 Rock | Kick 1; Snare 3; Hi-hat 1-6 all |
| 6/8 Celtic | Kick 1,4; Ride pattern; Snare accents |

### 5/4 Patterns
| Name | Style |
|------|-------|
| Take Five (2+3) | Kick 1,3; Snare 2,5; Hi-hat all 5 |
| Mission Impossible (3+2) | Kick 1,4; Snare 3,5; Hi-hat all 5 |

### 7/8 Patterns
| Name | Style |
|------|-------|
| Balkan 3+2+2 | Kick 1,4; Snare 3,6; Hi-hat all 7 |
| Progressive 2+2+3 | Kick 1,3; Snare 5,7; Hi-hat all |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    BROWSER (Single Page App)             │
│                                                         │
│  ┌──────────────┐   ┌──────────────────────────────┐   │
│  │  Audio Input  │   │     React UI Layer            │   │
│  │  Module       │   │  ┌────────┐  ┌────────────┐  │   │
│  │  - Mic input  │   │  │Time Sig│  │Beat Visual │  │   │
│  │  - File load  │   │  │Display │  │Indicator   │  │   │
│  └──────┬───────┘   │  └────────┘  └────────────┘  │   │
│         │            │  ┌────────┐  ┌────────────┐  │   │
│         ▼            │  │BPM     │  │Drum Pattern│  │   │
│  ┌──────────────┐   │  │Control │  │Grid        │  │   │
│  │  Web Audio   │   │  └────────┘  └────────────┘  │   │
│  │  Analysis    │   └──────────────────────────────┘   │
│  │  - BPM detect│                  ▲                    │
│  │  - Meter inf.│                  │ state updates      │
│  └──────┬───────┘                  │                    │
│         │            ┌─────────────┴──────────────┐    │
│         ▼            │   App State (Zustand/Redux) │    │
│  ┌──────────────┐   │   - detectedBPM             │    │
│  │  Audio Engine│   │   - timeSignature            │    │
│  │  - Metronome │◄──│   - currentBeat             │    │
│  │  - Drum Seq. │   │   - selectedPattern          │    │
│  │  - Scheduler │   │   - isPlaying               │    │
│  └──────────────┘   └────────────────────────────-─┘    │
└─────────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | React 18 + TypeScript | Component model fits beat/pattern UI |
| Build tool | Vite 5 | Fast dev server, HMR |
| Styling | Tailwind CSS + CSS custom properties | Dark theme, rapid UI |
| State | Zustand | Lightweight, synchronous state for audio timing |
| BPM Detection | realtime-bpm-analyzer v5 | Zero deps, TypeScript, actively maintained |
| Beat Analysis | Custom Web Audio API (spectral flux) | Full control for meter inference |
| Audio | Web Audio API (native) | Sample-accurate timing |
| Font | "Noto Serif" or "IM Fell English" | Musical notation aesthetic |
| Testing | Vitest + React Testing Library | Unit + component tests |
| Deployment | Vercel / GitHub Pages | Static SPA, no backend needed |

---

## UI/UX Design

### Layout (Desktop)

```
┌─────────────────────────────────────────────────────────┐
│  ♩ TimeSignature                    [Input: Mic ▼] [⚙]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│              ┌──────────────────┐                       │
│              │        4         │                       │
│              │       ───        │   120 BPM  [−] [+]   │
│              │        4         │                       │
│              └──────────────────┘                       │
│                                                         │
│         ●  ○  ○  ○     ← beat indicators                │
│                                                         │
│              [▶ Start Metronome]                        │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  DRUM PATTERNS:  [Basic Rock] [Funk] [Jazz] [Pop] [Shuf]│
│                                                         │
│  KICK    ■ □ □ □ □ □ □ □ ■ □ □ □ □ □ □ □             │
│  SNARE   □ □ □ □ ■ □ □ □ □ □ □ □ ■ □ □ □             │
│  HI-HAT  ■ □ ■ □ ■ □ ■ □ ■ □ ■ □ ■ □ ■ □             │
│                                          [Mute Drums]   │
└─────────────────────────────────────────────────────────┘
```

### Color Palette
- Background: `#0f0f13` (near-black)
- Surface: `#1a1a24`
- Beat 1 accent: `#f5a623` (amber/gold)
- Beat N accent: `#ffffff` (white)
- Active step: `#4ade80` (green)
- Inactive step: `#2d2d3a`
- Text: `#e2e8f0`

---

## Infrastructure & Deployment

- **No backend required** for v1 — fully client-side
- Static SPA deployed to Vercel or GitHub Pages
- HTTPS required (browser microphone API requires secure context)
- Optional: Cloudflare CDN for asset caching

---

## Performance Requirements

| Metric | Target |
|--------|--------|
| Time to first meaningful paint | < 1.5s |
| BPM detection latency | < 2s after audio start |
| Metronome timing jitter | < 2ms per beat |
| Drum pattern toggle latency | < 50ms |
| Audio analysis CPU usage | < 15% on mid-range device |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Time signature accuracy (4/4, 3/4, 6/8) | > 80% on test corpus |
| Metronome timing accuracy | < 2ms jitter |
| User task completion (detect + play) | < 30 seconds |
| Lighthouse performance score | > 90 |

---

## Open Questions (for PRD-C clarification)

See separate questions document. Key unknowns: accuracy requirements, audio format scope, drum sound source (samples vs synth), offline/PWA requirement, and time signature correction UX.
