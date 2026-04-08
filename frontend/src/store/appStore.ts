import { create } from 'zustand'

export type InputMode = 'mic' | 'file'

export interface TimeSignature {
  numerator: number
  denominator: number
}

export interface AppState {
  // Detection
  bpm: number
  timeSignature: TimeSignature
  confidence: number
  isDetecting: boolean
  detectionError: string | null

  // Playback
  isPlaying: boolean
  currentBeat: number
  currentStep: number

  // Input
  inputMode: InputMode

  // Drum patterns
  selectedPattern: string
  isDrumMuted: boolean
  isSongMuted: boolean

  // Song audio buffer (decoded from uploaded file)
  songBuffer: AudioBuffer | null

  // Actions
  setBpm: (bpm: number) => void
  setTimeSignature: (ts: TimeSignature) => void
  setConfidence: (confidence: number) => void
  setIsDetecting: (detecting: boolean) => void
  setDetectionError: (error: string | null) => void
  setIsPlaying: (playing: boolean) => void
  setCurrentBeat: (beat: number) => void
  setCurrentStep: (step: number) => void
  setInputMode: (mode: InputMode) => void
  setSelectedPattern: (pattern: string) => void
  setIsDrumMuted: (muted: boolean) => void
  setIsSongMuted: (muted: boolean) => void
  setSongBuffer: (buffer: AudioBuffer | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  // Detection defaults
  bpm: 120,
  timeSignature: { numerator: 4, denominator: 4 },
  confidence: 0,
  isDetecting: false,
  detectionError: null,

  // Playback defaults
  isPlaying: false,
  currentBeat: 1,
  currentStep: 0,

  // Input defaults
  inputMode: 'mic',

  // Drum defaults
  selectedPattern: 'Basic Rock',
  isDrumMuted: false,
  isSongMuted: false,
  songBuffer: null,

  // Actions
  setBpm: (bpm) => set({ bpm }),
  setTimeSignature: (timeSignature) => set({ timeSignature }),
  setConfidence: (confidence) => set({ confidence }),
  setIsDetecting: (isDetecting) => set({ isDetecting }),
  setDetectionError: (detectionError) => set({ detectionError }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentBeat: (currentBeat) => set({ currentBeat }),
  setCurrentStep: (currentStep) => set({ currentStep }),
  setInputMode: (inputMode) => set({ inputMode }),
  setSelectedPattern: (selectedPattern) => set({ selectedPattern }),
  setIsDrumMuted: (isDrumMuted) => set({ isDrumMuted }),
  setIsSongMuted: (isSongMuted) => set({ isSongMuted }),
  setSongBuffer: (songBuffer) => set({ songBuffer }),
}))
