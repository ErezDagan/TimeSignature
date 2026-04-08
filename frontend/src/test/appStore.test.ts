import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from '../store/appStore'

describe('appStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useAppStore.setState({
      bpm: 120,
      timeSignature: { numerator: 4, denominator: 4 },
      confidence: 0,
      isDetecting: false,
      detectionError: null,
      isPlaying: false,
      currentBeat: 1,
      inputMode: 'mic',
      selectedPattern: 'Basic Rock',
      isDrumMuted: false,
      isSongMuted: false,
    })
  })

  it('initializes with correct defaults', () => {
    const state = useAppStore.getState()
    expect(state.bpm).toBe(120)
    expect(state.timeSignature).toEqual({ numerator: 4, denominator: 4 })
    expect(state.confidence).toBe(0)
    expect(state.isDetecting).toBe(false)
    expect(state.isPlaying).toBe(false)
    expect(state.currentBeat).toBe(1)
    expect(state.inputMode).toBe('mic')
    expect(state.selectedPattern).toBe('Basic Rock')
    expect(state.isDrumMuted).toBe(false)
    expect(state.isSongMuted).toBe(false)
  })

  it('setBpm updates bpm', () => {
    useAppStore.getState().setBpm(140)
    expect(useAppStore.getState().bpm).toBe(140)
  })

  it('setTimeSignature updates time signature', () => {
    useAppStore.getState().setTimeSignature({ numerator: 3, denominator: 4 })
    expect(useAppStore.getState().timeSignature).toEqual({ numerator: 3, denominator: 4 })
  })

  it('setIsPlaying toggles playing state', () => {
    useAppStore.getState().setIsPlaying(true)
    expect(useAppStore.getState().isPlaying).toBe(true)
    useAppStore.getState().setIsPlaying(false)
    expect(useAppStore.getState().isPlaying).toBe(false)
  })

  it('setInputMode switches between mic and file', () => {
    useAppStore.getState().setInputMode('file')
    expect(useAppStore.getState().inputMode).toBe('file')
    useAppStore.getState().setInputMode('mic')
    expect(useAppStore.getState().inputMode).toBe('mic')
  })

  it('setSelectedPattern updates pattern', () => {
    useAppStore.getState().setSelectedPattern('Jazz Ride')
    expect(useAppStore.getState().selectedPattern).toBe('Jazz Ride')
  })

  it('setCurrentBeat updates current beat', () => {
    useAppStore.getState().setCurrentBeat(3)
    expect(useAppStore.getState().currentBeat).toBe(3)
  })
})
