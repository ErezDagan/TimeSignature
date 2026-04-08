/**
 * Drum sequencer locked to the metronome's AudioContext clock.
 *
 * Steps are 16th-note subdivisions. The sequencer fires on each
 * subdivision of the metronome beat using the same AudioContext
 * look-ahead scheduling approach.
 *
 * Usage:
 *   const seq = new DrumSequencer(audioContext, { onStep: (step) => updateUI(step) })
 *   seq.start(bpm, pattern, stepsPerBar)
 *   seq.stop()
 *   seq.swapPattern(newPattern)   // takes effect at next bar boundary
 */

import { getSample, type DrumInstrument } from './drumSamples'
import type { DrumPattern } from '../data/drumPatterns'

const LOOKAHEAD_SECS = 0.1
const SCHEDULE_INTERVAL_MS = 25
const SUBDIVISIONS = 4 // 16th notes per beat

export interface DrumSequencerOptions {
  onStep: (stepIndex: number) => void
}

export class DrumSequencer {
  private ctx: AudioContext
  private options: DrumSequencerOptions
  private timer: ReturnType<typeof setInterval> | null = null
  private pattern: DrumPattern | null = null
  private pendingPattern: DrumPattern | null = null
  private stepsPerBar = 16
  private nextStepTime = 0
  private currentStep = 0
  private stepDuration = 0
  private gainNode: GainNode
  private muted = false

  constructor(ctx: AudioContext, options: DrumSequencerOptions) {
    this.ctx = ctx
    this.options = options
    this.gainNode = ctx.createGain()
    this.gainNode.connect(ctx.destination)
  }

  start(bpm: number, pattern: DrumPattern, stepsPerBar: number): void {
    if (this.timer !== null) return
    this.pattern = pattern
    this.stepsPerBar = stepsPerBar
    this.currentStep = 0
    this.stepDuration = 60.0 / (bpm * SUBDIVISIONS)
    this.nextStepTime = this.ctx.currentTime + 0.05

    this.timer = setInterval(() => this._schedule(), SCHEDULE_INTERVAL_MS)
  }

  stop(): void {
    if (this.timer !== null) {
      clearInterval(this.timer)
      this.timer = null
    }
    this.currentStep = 0
  }

  /** Queue a pattern swap — applies at next bar boundary */
  swapPattern(pattern: DrumPattern, stepsPerBar: number): void {
    this.pendingPattern = pattern
    this.stepsPerBar = stepsPerBar
  }

  updateBpm(bpm: number): void {
    this.stepDuration = 60.0 / (bpm * SUBDIVISIONS)
  }

  setMuted(muted: boolean): void {
    this.muted = muted
    this.gainNode.gain.setValueAtTime(muted ? 0 : 1, this.ctx.currentTime)
  }

  get isRunning(): boolean {
    return this.timer !== null
  }

  private _schedule(): void {
    const now = this.ctx.currentTime
    const horizon = now + LOOKAHEAD_SECS

    while (this.nextStepTime < horizon) {
      this._fireStep(this.nextStepTime, this.currentStep)
      this.currentStep++

      // Check for bar boundary → apply pending pattern
      if (this.currentStep >= this.stepsPerBar) {
        this.currentStep = 0
        if (this.pendingPattern) {
          this.pattern = this.pendingPattern
          this.pendingPattern = null
        }
      }

      this.nextStepTime += this.stepDuration
    }
  }

  private _fireStep(time: number, stepIndex: number): void {
    if (!this.pattern || this.muted) return

    const instruments = Object.keys(this.pattern.steps) as DrumInstrument[]
    for (const inst of instruments) {
      const steps = this.pattern.steps[inst]
      if (steps[stepIndex] === 1) {
        this._playHit(inst, time)
      }
    }

    // Notify UI
    const delay = Math.max(0, (time - this.ctx.currentTime) * 1000 - 10)
    setTimeout(() => {
      this.options.onStep(stepIndex)
    }, delay)
  }

  private _playHit(instrument: DrumInstrument, time: number): void {
    const buffer = getSample(instrument)
    if (!buffer) return

    const source = this.ctx.createBufferSource()
    source.buffer = buffer
    source.connect(this.gainNode)
    source.start(time)
  }
}
