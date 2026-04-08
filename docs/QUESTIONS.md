# Clarification Questions — TimeSignature

**Date:** 2026-04-08  
Graded 1 (least critical) to 10 (most critical).  
★ = selected for user review (top 7 critical)

---

| # | Question | Grade | Selected |
|---|----------|-------|----------|
| Q1 | **Audio Input:** Should the app support live microphone input, file upload, or both? If both, should they be simultaneous or mutually exclusive? | 10 | ★ |
| Q2 | **Time Signature Detection Approach:** Can we do fully client-side (in-browser) detection, or do you need a Python/ML backend for higher accuracy? | 9 | ★ |
| Q3 | **Drum Sounds:** Should drum patterns use synthesized sounds (Web Audio oscillators/noise) or real sample-based sounds (loaded audio files)? This affects audio quality vs. bundle size. | 9 | ★ |
| Q4 | **Time Signature Correction:** If the app detects the wrong time signature, should the user be able to manually override it? If yes, how — a dropdown, tap-to-count, or free input? | 8 | ★ |
| Q5 | **Drum Pattern Playback:** Should the drum patterns play over the original song audio simultaneously (mixing), or should they only play standalone alongside the metronome? | 8 | ★ |
| Q6 | **Metronome Visual:** For beat indicators, which do you prefer: (A) animated circles/dots that pulse, (B) a pendulum animation, (C) a bar that sweeps across, or (D) something else? | 7 | ★ |
| Q7 | **Offline / PWA:** Should the app work offline after first load (Progressive Web App with service worker caching)? | 7 | ★ |
| Q8 | **Supported Time Signatures:** Beyond the common meters (4/4, 3/4, 6/8), should we support complex meters like 5/4, 7/8, 9/8 in v1? | 6 | |
| Q9 | **BPM Range:** What BPM range should the detector support? Default recommendation: 60–200 BPM. | 5 | |
| Q10 | **Platform Priority:** Is this primarily for desktop use, or must it work well on tablet (e.g., iPad used on a music stand)? | 6 | |
| Q11 | **Drum Pattern Count:** How many drum patterns per time signature? 3 minimum was proposed — is that enough, or do you want 5–8 options? | 4 | |
| Q12 | **Metronome Independence:** Should the metronome be able to run even before a time signature is detected (e.g., default to 4/4 at 120 BPM)? | 5 | |
| Q13 | **Visual Theme:** Dark mode only, or should we support a light mode toggle? | 3 | |
| Q14 | **Audio File Size Limit:** What maximum file size for uploads? Proposed: 50MB. | 2 | |
| Q15 | **Drum Grid Resolution:** Should the drum grid show 16th-note resolution (16 steps for 4/4) or 8th-note resolution (8 steps)? 16 steps gives more detail but may be harder to read on small screens. | 4 | |
| Q16 | **Sharing/Export:** Should users be able to share or export their detected time signature + BPM + pattern as a preset? | 2 | |
| Q17 | **Confidence Display:** Should we show a confidence percentage next to the detected time signature, or just display the result without qualifiers? | 3 | |
| Q18 | **Multiple Song Analysis:** Should the app analyze one song at a time, or queue multiple files? | 2 | |
| Q19 | **Accessibility:** Are there specific accessibility requirements (screen reader, keyboard-only navigation, WCAG level)? | 3 | |
| Q20 | **Localization:** English only for v1, or should we support additional languages? | 1 | |

---

## Top 7 Critical Questions (for User Clarification)

### Q1 — Audio Input Mode (Grade: 10)
Should the app support:
- **A)** Microphone only (real-time live listening)
- **B)** File upload only (analyze an audio file)
- **C)** Both — user can switch between them at any time

---

### Q2 — Detection Approach (Grade: 9)
For time signature detection, should we:
- **A)** Keep everything 100% client-side in the browser (faster to build, slightly less accurate)
- **B)** Add a lightweight Python/Flask backend with a proper ML model (BeatNet) for higher accuracy (requires server deployment)
- **C)** Start client-side for v1, with the option to swap in a backend later

---

### Q3 — Drum Sound Source (Grade: 9)
For drum pattern playback, should the sounds be:
- **A)** Synthesized purely in the browser (Web Audio API oscillators + noise — zero download, but sounds electronic)
- **B)** Real audio samples (WAV/MP3 files of real drum hits — sounds natural, but adds ~2–5MB to load)
- **C)** A mix: synthesized by default, with a "realistic samples" option

---

### Q4 — Manual Time Signature Override (Grade: 8)
If the app detects the wrong time signature, should the user be able to correct it?
- **A)** Yes — dropdown to select from supported meters
- **B)** Yes — tap-to-count their own downbeat pattern
- **C)** No — trust the detection only

---

### Q5 — Drum + Song Audio Mixing (Grade: 8)
Should drum patterns:
- **A)** Play alongside the original song audio (user hears song + drums together)
- **B)** Play standalone alongside just the metronome (no song audio while drums play)
- **C)** Both — user can toggle song audio on/off while drums play

---

### Q6 — Beat Indicator Visual (Grade: 7)
Which visual style for the beat indicator?
- **A)** Animated circles/dots (one per beat, pulses on each beat)
- **B)** Pendulum animation
- **C)** Horizontal progress bar that sweeps per bar
- **D)** Large number counting (1, 2, 3, 4, 1, 2...)
- **E)** Two of the above combined

---

### Q7 — PWA / Offline Support (Grade: 7)
Should the app work offline after first load?
- **A)** Yes — full PWA with service worker (installable to home screen)
- **B)** No — online-only is fine for v1
- **C)** Partially — cache assets but don't make it installable
