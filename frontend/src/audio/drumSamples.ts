/**
 * Drum sample synthesis using Web Audio API.
 *
 * Generates realistic-sounding drum hits as AudioBuffers by synthesis
 * rather than loading external files — zero network dependency,
 * works offline, and produces high-quality results.
 *
 * Each instrument:
 *   kick    — sub-bass thump + transient click
 *   snare   — noise burst + pitch transient
 *   hihat_c — short filtered noise (high-pass)
 *   hihat_o — longer filtered noise (slightly lower frequency)
 *   ride    — metallic filtered noise with longer decay
 *   crash   — wide-band noise burst with long decay
 */

export type DrumInstrument = 'kick' | 'snare' | 'hihat_c' | 'hihat_o' | 'ride' | 'crash'

const SAMPLE_RATE = 44100
const _cache = new Map<DrumInstrument, AudioBuffer>()

// ─── Kick ────────────────────────────────────────────────────────────────────

async function synthKick(): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(1, SAMPLE_RATE * 0.5, SAMPLE_RATE)

  // Sub-bass sine with pitch sweep
  const osc = ctx.createOscillator()
  const gainNode = ctx.createGain()
  osc.connect(gainNode)
  gainNode.connect(ctx.destination)

  osc.frequency.setValueAtTime(150, 0)
  osc.frequency.exponentialRampToValueAtTime(30, 0.2)
  gainNode.gain.setValueAtTime(1.0, 0)
  gainNode.gain.exponentialRampToValueAtTime(0.001, 0.4)
  osc.start(0)
  osc.stop(0.5)

  // Click transient (short noise burst)
  const bufSize = Math.floor(SAMPLE_RATE * 0.01)
  const noiseBuf = ctx.createBuffer(1, bufSize, SAMPLE_RATE)
  const data = noiseBuf.getChannelData(0)
  for (let i = 0; i < bufSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize) * 0.3
  }
  const noiseSource = ctx.createBufferSource()
  noiseSource.buffer = noiseBuf
  const noiseGain = ctx.createGain()
  noiseSource.connect(noiseGain)
  noiseGain.connect(ctx.destination)
  noiseGain.gain.setValueAtTime(0.8, 0)
  noiseGain.gain.exponentialRampToValueAtTime(0.001, 0.01)
  noiseSource.start(0)

  return ctx.startRendering()
}

// ─── Snare ───────────────────────────────────────────────────────────────────

async function synthSnare(): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(1, SAMPLE_RATE * 0.3, SAMPLE_RATE)

  // Noise component (snare wires)
  const noiseDuration = 0.2
  const noiseBuf = ctx.createBuffer(1, Math.floor(SAMPLE_RATE * noiseDuration), SAMPLE_RATE)
  const noiseData = noiseBuf.getChannelData(0)
  for (let i = 0; i < noiseData.length; i++) {
    noiseData[i] = Math.random() * 2 - 1
  }
  const noiseSource = ctx.createBufferSource()
  noiseSource.buffer = noiseBuf

  // High-pass filter for snare character
  const hpf = ctx.createBiquadFilter()
  hpf.type = 'highpass'
  hpf.frequency.value = 1500

  const noiseGain = ctx.createGain()
  noiseSource.connect(hpf)
  hpf.connect(noiseGain)
  noiseGain.connect(ctx.destination)
  noiseGain.gain.setValueAtTime(0.7, 0)
  noiseGain.gain.exponentialRampToValueAtTime(0.001, 0.15)
  noiseSource.start(0)

  // Tonal component (body thump)
  const osc = ctx.createOscillator()
  const oscGain = ctx.createGain()
  osc.connect(oscGain)
  oscGain.connect(ctx.destination)
  osc.frequency.setValueAtTime(200, 0)
  osc.frequency.exponentialRampToValueAtTime(100, 0.05)
  oscGain.gain.setValueAtTime(0.8, 0)
  oscGain.gain.exponentialRampToValueAtTime(0.001, 0.08)
  osc.start(0)
  osc.stop(0.3)

  return ctx.startRendering()
}

// ─── Hi-Hat (closed) ─────────────────────────────────────────────────────────

async function synthHiHatClosed(): Promise<AudioBuffer> {
  const duration = 0.08
  const ctx = new OfflineAudioContext(1, Math.floor(SAMPLE_RATE * duration), SAMPLE_RATE)

  const noiseBuf = ctx.createBuffer(1, Math.floor(SAMPLE_RATE * duration), SAMPLE_RATE)
  const data = noiseBuf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1

  const source = ctx.createBufferSource()
  source.buffer = noiseBuf

  const hpf = ctx.createBiquadFilter()
  hpf.type = 'bandpass'
  hpf.frequency.value = 8000
  hpf.Q.value = 0.5

  const gainNode = ctx.createGain()
  source.connect(hpf)
  hpf.connect(gainNode)
  gainNode.connect(ctx.destination)
  gainNode.gain.setValueAtTime(0.6, 0)
  gainNode.gain.exponentialRampToValueAtTime(0.001, duration * 0.8)
  source.start(0)

  return ctx.startRendering()
}

// ─── Hi-Hat (open) ───────────────────────────────────────────────────────────

async function synthHiHatOpen(): Promise<AudioBuffer> {
  const duration = 0.4
  const ctx = new OfflineAudioContext(1, Math.floor(SAMPLE_RATE * duration), SAMPLE_RATE)

  const noiseBuf = ctx.createBuffer(1, Math.floor(SAMPLE_RATE * duration), SAMPLE_RATE)
  const data = noiseBuf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1

  const source = ctx.createBufferSource()
  source.buffer = noiseBuf

  const hpf = ctx.createBiquadFilter()
  hpf.type = 'bandpass'
  hpf.frequency.value = 7000
  hpf.Q.value = 0.3

  const gainNode = ctx.createGain()
  source.connect(hpf)
  hpf.connect(gainNode)
  gainNode.connect(ctx.destination)
  gainNode.gain.setValueAtTime(0.5, 0)
  gainNode.gain.exponentialRampToValueAtTime(0.001, duration * 0.9)
  source.start(0)

  return ctx.startRendering()
}

// ─── Ride ────────────────────────────────────────────────────────────────────

async function synthRide(): Promise<AudioBuffer> {
  const duration = 0.5
  const ctx = new OfflineAudioContext(1, Math.floor(SAMPLE_RATE * duration), SAMPLE_RATE)

  const noiseBuf = ctx.createBuffer(1, Math.floor(SAMPLE_RATE * duration), SAMPLE_RATE)
  const data = noiseBuf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1

  const source = ctx.createBufferSource()
  source.buffer = noiseBuf

  const bpf = ctx.createBiquadFilter()
  bpf.type = 'bandpass'
  bpf.frequency.value = 10000
  bpf.Q.value = 1.5

  const gainNode = ctx.createGain()
  source.connect(bpf)
  bpf.connect(gainNode)
  gainNode.connect(ctx.destination)
  gainNode.gain.setValueAtTime(0.4, 0)
  gainNode.gain.exponentialRampToValueAtTime(0.001, duration * 0.85)
  source.start(0)

  return ctx.startRendering()
}

// ─── Crash ───────────────────────────────────────────────────────────────────

async function synthCrash(): Promise<AudioBuffer> {
  const duration = 1.0
  const ctx = new OfflineAudioContext(1, Math.floor(SAMPLE_RATE * duration), SAMPLE_RATE)

  const noiseBuf = ctx.createBuffer(1, Math.floor(SAMPLE_RATE * duration), SAMPLE_RATE)
  const data = noiseBuf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1

  const source = ctx.createBufferSource()
  source.buffer = noiseBuf

  const gainNode = ctx.createGain()
  source.connect(gainNode)
  gainNode.connect(ctx.destination)
  gainNode.gain.setValueAtTime(0.8, 0)
  gainNode.gain.exponentialRampToValueAtTime(0.001, duration * 0.9)
  source.start(0)

  return ctx.startRendering()
}

// ─── Public API ──────────────────────────────────────────────────────────────

const SYNTH_FNS: Record<DrumInstrument, () => Promise<AudioBuffer>> = {
  kick: synthKick,
  snare: synthSnare,
  hihat_c: synthHiHatClosed,
  hihat_o: synthHiHatOpen,
  ride: synthRide,
  crash: synthCrash,
}

export type LoadProgress = { loaded: number; total: number }

/**
 * Synthesize all drum samples and cache them.
 * Returns a map of instrument → AudioBuffer.
 */
export async function loadDrumSamples(
  onProgress?: (p: LoadProgress) => void
): Promise<Map<DrumInstrument, AudioBuffer>> {
  const instruments = Object.keys(SYNTH_FNS) as DrumInstrument[]
  const total = instruments.length
  let loaded = 0

  await Promise.all(
    instruments.map(async (name) => {
      if (!_cache.has(name)) {
        const buf = await SYNTH_FNS[name]()
        _cache.set(name, buf)
      }
      loaded++
      onProgress?.({ loaded, total })
    })
  )

  return new Map(_cache)
}

export function getSample(name: DrumInstrument): AudioBuffer | undefined {
  return _cache.get(name)
}

export function isSamplesLoaded(): boolean {
  return _cache.size === 6
}
