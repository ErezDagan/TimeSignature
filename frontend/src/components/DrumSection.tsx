import { useEffect, useRef } from 'react'
import { useAppStore } from '../store/appStore'
import { DrumSequencer } from '../audio/drumSequencer'
import { loadDrumSamples } from '../audio/drumSamples'
import { getPatternsForMeter } from '../data/drumPatterns'
import type { DrumInstrument } from '../audio/drumSamples'

const INSTRUMENT_LABELS: Record<DrumInstrument, string> = {
  kick: 'Kick',
  snare: 'Snare',
  hihat_c: 'HH Cl',
  hihat_o: 'HH Op',
  ride: 'Ride',
  crash: 'Crash',
}

const INSTRUMENT_ORDER: DrumInstrument[] = ['kick', 'snare', 'hihat_c', 'hihat_o', 'ride', 'crash']

export function DrumSection() {
  const {
    isPlaying,
    bpm,
    timeSignature,
    selectedPattern,
    setSelectedPattern,
    isDrumMuted,
    setIsDrumMuted,
    isSongMuted,
    setIsSongMuted,
    currentStep,
    setCurrentStep,
    songBuffer,
  } = useAppStore()

  const sequencerRef = useRef<DrumSequencer | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const songSourceRef = useRef<AudioBufferSourceNode | null>(null)
  const songGainRef = useRef<GainNode | null>(null)
  const samplesLoadedRef = useRef(false)

  const ts = getPatternsForMeter(timeSignature.numerator, timeSignature.denominator)
  const activePattern = ts.patterns.find((p) => p.name === selectedPattern) ?? ts.patterns[0]

  // Load samples once
  useEffect(() => {
    if (!samplesLoadedRef.current) {
      samplesLoadedRef.current = true
      loadDrumSamples().catch(console.error)
    }
  }, [])

  // Start/stop sequencer with metronome
  useEffect(() => {
    if (isPlaying) {
      // Create audio context (shared with song)
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioContext()
      }
      const ctx = audioCtxRef.current

      // Create and start sequencer
      const seq = new DrumSequencer(ctx, {
        onStep: (step) => setCurrentStep(step),
      })
      seq.setMuted(isDrumMuted)
      seq.start(bpm, activePattern, ts.stepsPerBar)
      sequencerRef.current = seq

      // Start song audio if we have a buffer and it's not muted
      if (songBuffer) {
        const songGain = ctx.createGain()
        songGain.gain.value = isSongMuted ? 0 : 1
        songGain.connect(ctx.destination)
        songGainRef.current = songGain

        const songSource = ctx.createBufferSource()
        songSource.buffer = songBuffer
        songSource.connect(songGain)
        songSource.loop = true
        songSource.start()
        songSourceRef.current = songSource
      }
    } else {
      // Stop sequencer
      sequencerRef.current?.stop()
      sequencerRef.current = null

      // Stop song
      try {
        songSourceRef.current?.stop()
      } catch {
        // Already stopped
      }
      songSourceRef.current = null
      setCurrentStep(0)
    }
  }, [isPlaying]) // eslint-disable-line react-hooks/exhaustive-deps

  // Update sequencer BPM live
  useEffect(() => {
    sequencerRef.current?.updateBpm(bpm)
  }, [bpm])

  // Swap drum pattern at bar boundary
  useEffect(() => {
    if (sequencerRef.current && isPlaying) {
      sequencerRef.current.swapPattern(activePattern, ts.stepsPerBar)
    }
  }, [selectedPattern, timeSignature]) // eslint-disable-line react-hooks/exhaustive-deps

  // Drum mute
  useEffect(() => {
    sequencerRef.current?.setMuted(isDrumMuted)
  }, [isDrumMuted])

  // Song mute
  useEffect(() => {
    if (songGainRef.current) {
      songGainRef.current.gain.setValueAtTime(
        isSongMuted ? 0 : 1,
        audioCtxRef.current?.currentTime ?? 0
      )
    }
  }, [isSongMuted])

  return (
    <div
      className="w-full flex flex-col gap-4 p-6 rounded-2xl"
      style={{ background: 'var(--surface)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Drum Patterns
        </h2>
        <div className="flex items-center gap-2">
          {/* Song audio toggle */}
          {songBuffer && (
            <button
              onClick={() => setIsSongMuted(!isSongMuted)}
              aria-label={isSongMuted ? 'Unmute song' : 'Mute song'}
              aria-pressed={isSongMuted}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: isSongMuted ? 'var(--border)' : 'rgba(74,222,128,0.15)',
                color: isSongMuted ? 'var(--text-muted)' : '#4ade80',
                border: `1px solid ${isSongMuted ? 'var(--border)' : '#4ade80'}`,
              }}
            >
              {isSongMuted ? '🔇 Song' : '🔊 Song'}
            </button>
          )}
          {/* Drum mute toggle */}
          <button
            onClick={() => setIsDrumMuted(!isDrumMuted)}
            aria-label={isDrumMuted ? 'Unmute drums' : 'Mute drums'}
            aria-pressed={isDrumMuted}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: isDrumMuted ? 'var(--border)' : 'rgba(245,166,35,0.15)',
              color: isDrumMuted ? 'var(--text-muted)' : 'var(--accent)',
              border: `1px solid ${isDrumMuted ? 'var(--border)' : 'var(--accent)'}`,
            }}
          >
            {isDrumMuted ? '🥁 Muted' : '🥁 Drums'}
          </button>
        </div>
      </div>

      {/* Pattern Tabs */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Drum patterns">
        {ts.patterns.map((pattern) => {
          const active = pattern.name === (activePattern.name)
          return (
            <button
              key={pattern.name}
              role="tab"
              aria-selected={active}
              onClick={() => setSelectedPattern(pattern.name)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
              style={{
                background: active ? 'var(--accent)' : 'var(--border)',
                color: active ? '#000' : 'var(--text-muted)',
              }}
            >
              {pattern.name}
            </button>
          )
        })}
      </div>

      {/* Step Sequencer Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" aria-label="Drum pattern grid">
          <tbody>
            {INSTRUMENT_ORDER.map((inst) => {
              const steps = activePattern.steps[inst]
              return (
                <tr key={inst}>
                  <td
                    className="text-xs pr-3 py-1 text-right whitespace-nowrap"
                    style={{ color: 'var(--text-muted)', minWidth: '48px' }}
                  >
                    {INSTRUMENT_LABELS[inst]}
                  </td>
                  {steps.map((active, stepIdx) => {
                    const isCurrentStep = isPlaying && stepIdx === currentStep
                    const isDownbeatStep = stepIdx === 0
                    return (
                      <td key={stepIdx} className="px-0.5 py-0.5">
                        <div
                          style={{
                            width: '14px',
                            height: '14px',
                            borderRadius: '3px',
                            background:
                              isCurrentStep && active
                                ? '#ffffff'
                                : isCurrentStep
                                ? 'rgba(255,255,255,0.15)'
                                : active
                                ? isDownbeatStep
                                  ? 'var(--accent)'
                                  : 'var(--active)'
                                : 'var(--inactive)',
                            transition: 'background 0.05s',
                            outline: isCurrentStep ? '2px solid rgba(255,255,255,0.4)' : 'none',
                          }}
                          aria-label={`${INSTRUMENT_LABELS[inst]} step ${stepIdx + 1}: ${active ? 'on' : 'off'}`}
                        />
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
