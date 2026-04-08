import { useRef } from 'react'
import { useAppStore } from '../store/appStore'

const MIN_BPM = 40
const MAX_BPM = 240

export function BpmControl() {
  const { bpm, setBpm } = useAppStore()
  const tapTimesRef = useRef<number[]>([])
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function adjustBpm(delta: number) {
    setBpm(Math.max(MIN_BPM, Math.min(MAX_BPM, bpm + delta)))
  }

  function handleTap() {
    const now = Date.now()
    tapTimesRef.current.push(now)

    // Reset if no tap within 3 seconds
    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current)
    tapTimeoutRef.current = setTimeout(() => {
      tapTimesRef.current = []
    }, 3000)

    // Need at least 2 taps to calculate BPM
    if (tapTimesRef.current.length < 2) return

    // Keep only the last 8 taps
    if (tapTimesRef.current.length > 8) {
      tapTimesRef.current = tapTimesRef.current.slice(-8)
    }

    const intervals: number[] = []
    for (let i = 1; i < tapTimesRef.current.length; i++) {
      intervals.push(tapTimesRef.current[i] - tapTimesRef.current[i - 1])
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
    const computedBpm = Math.round(60000 / avgInterval)
    const clamped = Math.max(MIN_BPM, Math.min(MAX_BPM, computedBpm))
    setBpm(clamped)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* BPM display */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => adjustBpm(-5)}
          aria-label="Decrease BPM by 5"
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-opacity hover:opacity-70"
          style={{ background: 'var(--border)', color: 'var(--text)' }}
        >
          −5
        </button>
        <button
          onClick={() => adjustBpm(-1)}
          aria-label="Decrease BPM by 1"
          className="w-8 h-8 rounded-full flex items-center justify-center font-bold transition-opacity hover:opacity-70"
          style={{ background: 'var(--border)', color: 'var(--text)' }}
        >
          −
        </button>

        <div className="text-center min-w-[100px]">
          <span
            className="text-3xl font-bold tabular-nums"
            style={{ color: 'var(--text)' }}
            aria-label={`${bpm} BPM`}
          >
            {bpm}
          </span>
          <span className="text-sm ml-1" style={{ color: 'var(--text-muted)' }}>
            BPM
          </span>
        </div>

        <button
          onClick={() => adjustBpm(1)}
          aria-label="Increase BPM by 1"
          className="w-8 h-8 rounded-full flex items-center justify-center font-bold transition-opacity hover:opacity-70"
          style={{ background: 'var(--border)', color: 'var(--text)' }}
        >
          +
        </button>
        <button
          onClick={() => adjustBpm(5)}
          aria-label="Increase BPM by 5"
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-opacity hover:opacity-70"
          style={{ background: 'var(--border)', color: 'var(--text)' }}
        >
          +5
        </button>
      </div>

      {/* Tap tempo */}
      <button
        onClick={handleTap}
        aria-label="Tap tempo"
        className="px-6 py-2 rounded-full text-sm font-medium transition-all duration-100 hover:opacity-80 active:scale-95"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
      >
        Tap Tempo
      </button>
    </div>
  )
}
