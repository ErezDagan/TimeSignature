/**
 * Metronome engine using Web Audio API look-ahead scheduling.
 *
 * Design:
 * - Scheduler runs every SCHEDULE_INTERVAL_MS, looks LOOKAHEAD_SECS ahead
 * - Beats are scheduled via AudioContext.currentTime for sample accuracy
 * - Beat 1 (downbeat): 220 Hz sine, 300ms, gain 0.9
 * - Other beats:        880 Hz sine,  50ms, gain 0.4
 * - Fires onBeat(beatNumber) callback for UI updates
 */

const LOOKAHEAD_SECS = 0.1 // Schedule this far ahead
const SCHEDULE_INTERVAL_MS = 25 // Check this often

export interface MetronomeOptions {
  onBeat: (beatNumber: number, beatTime: number) => void
}

export class Metronome {
  private audioContext: AudioContext | null = null
  private schedulerTimer: ReturnType<typeof setInterval> | null = null
  private nextBeatTime = 0
  private currentBeat = 1
  private bpm = 120
  private beatsPerBar = 4
  private options: MetronomeOptions

  constructor(options: MetronomeOptions) {
    this.options = options
  }

  start(bpm: number, beatsPerBar: number): void {
    if (this.schedulerTimer !== null) return // Already running

    this.audioContext = new AudioContext()
    this.bpm = bpm
    this.beatsPerBar = beatsPerBar
    this.currentBeat = 1
    this.nextBeatTime = this.audioContext.currentTime + 0.1 // Small startup delay

    this.schedulerTimer = setInterval(() => this._schedule(), SCHEDULE_INTERVAL_MS)
  }

  stop(): void {
    if (this.schedulerTimer !== null) {
      clearInterval(this.schedulerTimer)
      this.schedulerTimer = null
    }
    this.audioContext?.close()
    this.audioContext = null
    this.currentBeat = 1
  }

  updateParams(bpm: number, beatsPerBar: number): void {
    this.bpm = bpm
    this.beatsPerBar = beatsPerBar
  }

  get isRunning(): boolean {
    return this.schedulerTimer !== null
  }

  private _schedule(): void {
    if (!this.audioContext) return
    const now = this.audioContext.currentTime
    const horizon = now + LOOKAHEAD_SECS

    while (this.nextBeatTime < horizon) {
      this._scheduleBeat(this.nextBeatTime, this.currentBeat)
      this.nextBeatTime += 60.0 / this.bpm
      this.currentBeat = (this.currentBeat % this.beatsPerBar) + 1
    }
  }

  private _scheduleBeat(time: number, beatNumber: number): void {
    if (!this.audioContext) return
    const isDownbeat = beatNumber === 1

    const osc = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    osc.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    osc.type = 'sine'
    osc.frequency.setValueAtTime(isDownbeat ? 220 : 880, time)

    const gain = isDownbeat ? 0.9 : 0.4
    const duration = isDownbeat ? 0.3 : 0.05

    gainNode.gain.setValueAtTime(gain, time)
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration)

    osc.start(time)
    osc.stop(time + duration)

    // Notify UI slightly before the beat fires
    const delay = Math.max(0, (time - this.audioContext.currentTime) * 1000 - 10)
    setTimeout(() => {
      this.options.onBeat(beatNumber, time)
    }, delay)
  }
}
