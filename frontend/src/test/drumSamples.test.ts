import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loadDrumSamples, getSample, isSamplesLoaded, type DrumInstrument } from '../audio/drumSamples'

const INSTRUMENTS: DrumInstrument[] = ['kick', 'snare', 'hihat_c', 'hihat_o', 'ride', 'crash']

// Mock OfflineAudioContext
class MockAudioBuffer {
  numberOfChannels = 1
  length = 1024
  sampleRate = 44100
  duration = 1024 / 44100
  getChannelData = vi.fn(() => new Float32Array(1024))
  copyFromChannel = vi.fn()
  copyToChannel = vi.fn()
}

class MockOfflineAudioContext {
  destination = {}
  sampleRate = 44100

  createOscillator() {
    return {
      type: 'sine',
      frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    }
  }

  createGain() {
    return {
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    }
  }

  createBuffer(_channels: number, length: number, _rate: number) {
    const buf = new MockAudioBuffer()
    buf.length = length
    buf.getChannelData = vi.fn(() => new Float32Array(length))
    return buf
  }

  createBufferSource() {
    return {
      buffer: null as MockAudioBuffer | null,
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    }
  }

  createBiquadFilter() {
    return {
      type: 'bandpass',
      frequency: { value: 0 },
      Q: { value: 0 },
      connect: vi.fn(),
    }
  }

  startRendering(): Promise<MockAudioBuffer> {
    return Promise.resolve(new MockAudioBuffer())
  }
}

describe('drumSamples', () => {
  beforeEach(() => {
    vi.stubGlobal('OfflineAudioContext', MockOfflineAudioContext)
    // Clear cache between tests by reimporting — use dynamic import trick
    vi.resetModules()
  })

  it('loadDrumSamples returns a map with all 6 instruments', async () => {
    const { loadDrumSamples: load } = await import('../audio/drumSamples')
    const samples = await load()
    expect(samples.size).toBe(6)
    for (const inst of INSTRUMENTS) {
      expect(samples.has(inst)).toBe(true)
    }
  })

  it('all loaded buffers are AudioBuffer instances', async () => {
    const { loadDrumSamples: load } = await import('../audio/drumSamples')
    const samples = await load()
    for (const [, buf] of samples) {
      // MockAudioBuffer satisfies the AudioBuffer interface
      expect(buf).toBeDefined()
      expect(typeof buf.getChannelData).toBe('function')
    }
  })

  it('reports progress during loading', async () => {
    const { loadDrumSamples: load } = await import('../audio/drumSamples')
    const progressValues: number[] = []
    await load(({ loaded, total }) => {
      progressValues.push(loaded / total)
    })
    expect(progressValues.length).toBe(6)
    expect(progressValues[progressValues.length - 1]).toBe(1)
  })
})
