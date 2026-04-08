import { useEffect, useRef } from 'react'
import { useAppStore } from '../store/appStore'

// ─── Pendulum ─────────────────────────────────────────────────────────────────

function Pendulum({ currentBeat, beatsPerBar }: { currentBeat: number; beatsPerBar: number }) {
  const isDownbeat = currentBeat === 1
  // Alternate direction each beat: odd = right, even = left
  const angle = currentBeat % 2 === 1 ? 30 : -30

  return (
    <div className="flex flex-col items-center gap-1" aria-hidden="true">
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        Pendulum
      </p>
      <svg
        width="80"
        height="100"
        viewBox="-50 -10 100 110"
        aria-label={`Pendulum, beat ${currentBeat} of ${beatsPerBar}`}
      >
        {/* Pivot point */}
        <circle cx="0" cy="0" r="4" fill="var(--text-muted)" />
        {/* Arm */}
        <g
          style={{
            transform: `rotate(${angle}deg)`,
            transformOrigin: '0 0',
            transition: 'transform 0.08s ease-out',
          }}
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="75"
            stroke={isDownbeat ? 'var(--accent)' : 'var(--text)'}
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Bob */}
          <circle
            cx="0"
            cy="75"
            r="12"
            fill={isDownbeat ? 'var(--accent)' : 'var(--surface)'}
            stroke={isDownbeat ? 'var(--accent)' : 'var(--border)'}
            strokeWidth="2"
          />
        </g>
      </svg>
    </div>
  )
}

// ─── Sweep Bar ────────────────────────────────────────────────────────────────

function SweepBar({ currentBeat, beatsPerBar }: { currentBeat: number; beatsPerBar: number }) {
  const progress = (currentBeat - 1) / beatsPerBar
  const isDownbeat = currentBeat === 1

  return (
    <div className="flex flex-col gap-2 w-full">
      <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
        Bar Progress
      </p>
      <div
        className="relative h-3 rounded-full overflow-hidden"
        style={{ background: 'var(--border)' }}
        role="progressbar"
        aria-valuenow={currentBeat}
        aria-valuemin={1}
        aria-valuemax={beatsPerBar}
        aria-label={`Beat ${currentBeat} of ${beatsPerBar}`}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${progress * 100}%`,
            background: isDownbeat ? 'var(--accent)' : 'var(--active)',
            transition: isDownbeat ? 'none' : 'width 0.06s linear',
            borderRadius: '9999px',
          }}
        />
      </div>
      {/* Beat tick marks */}
      <div className="flex justify-between px-0.5">
        {Array.from({ length: beatsPerBar }, (_, i) => (
          <div
            key={i}
            style={{
              width: '2px',
              height: '6px',
              borderRadius: '1px',
              background: i + 1 <= currentBeat ? (i === 0 ? 'var(--accent)' : 'var(--active)') : 'var(--border)',
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Beat Number ─────────────────────────────────────────────────────────────

function BeatNumber({
  currentBeat,
  beatsPerBar,
}: {
  currentBeat: number
  beatsPerBar: number
}) {
  const isDownbeat = currentBeat === 1
  const prevBeatRef = useRef(currentBeat)
  const animRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prevBeatRef.current !== currentBeat && animRef.current) {
      if (typeof animRef.current.animate === 'function') {
        animRef.current.animate(
          [
            { transform: 'scale(1.3)', opacity: 0.6 },
            { transform: 'scale(1)', opacity: 1 },
          ],
          { duration: 120, easing: 'ease-out', fill: 'forwards' }
        )
      }
      prevBeatRef.current = currentBeat
    }
  }, [currentBeat])

  return (
    <div className="flex flex-col items-center gap-1" aria-live="polite" aria-atomic="true">
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        Beat
      </p>
      <div
        ref={animRef}
        className="tabular-nums font-bold"
        style={{
          fontSize: 'clamp(48px, 8vw, 72px)',
          lineHeight: 1,
          color: isDownbeat ? 'var(--accent)' : 'var(--text)',
          minWidth: '1.2em',
          textAlign: 'center',
        }}
        aria-label={`Beat ${currentBeat} of ${beatsPerBar}`}
      >
        {currentBeat}
      </div>
      <div className="flex gap-1.5 mt-1">
        {Array.from({ length: beatsPerBar }, (_, i) => (
          <div
            key={i}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background:
                i + 1 === currentBeat
                  ? i === 0
                    ? 'var(--accent)'
                    : 'var(--active)'
                  : 'var(--border)',
              transition: 'background 0.05s',
            }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Composite BeatIndicator ──────────────────────────────────────────────────

export function BeatIndicator() {
  const { currentBeat, timeSignature, isPlaying } = useAppStore()
  const beatsPerBar = timeSignature.numerator

  if (!isPlaying) return null

  return (
    <div
      className="w-full flex flex-col items-center gap-6 p-6 rounded-2xl"
      style={{ background: 'var(--surface)' }}
    >
      {/* Row 1: Pendulum + Beat Number side by side */}
      <div className="flex items-center justify-around w-full gap-8">
        <Pendulum currentBeat={currentBeat} beatsPerBar={beatsPerBar} />
        <BeatNumber currentBeat={currentBeat} beatsPerBar={beatsPerBar} />
      </div>

      {/* Row 2: Sweep bar full width */}
      <SweepBar currentBeat={currentBeat} beatsPerBar={beatsPerBar} />
    </div>
  )
}
