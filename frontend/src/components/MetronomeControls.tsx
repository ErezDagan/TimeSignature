import { useRef, useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import { Metronome } from '../audio/metronome'

export function MetronomeControls() {
  const { bpm, timeSignature, isPlaying, setIsPlaying, setCurrentBeat } = useAppStore()
  const metronomeRef = useRef<Metronome | null>(null)

  // Initialize metronome once
  useEffect(() => {
    metronomeRef.current = new Metronome({
      onBeat: (beatNumber) => {
        setCurrentBeat(beatNumber)
      },
    })
    return () => {
      metronomeRef.current?.stop()
    }
  }, [setCurrentBeat])

  // Keep metronome params in sync with store
  useEffect(() => {
    if (metronomeRef.current?.isRunning) {
      metronomeRef.current.updateParams(bpm, timeSignature.numerator)
    }
  }, [bpm, timeSignature.numerator])

  function toggleMetronome() {
    const metro = metronomeRef.current
    if (!metro) return

    if (isPlaying) {
      metro.stop()
      setCurrentBeat(1)
      setIsPlaying(false)
    } else {
      metro.start(bpm, timeSignature.numerator)
      setIsPlaying(true)
    }
  }

  return (
    <button
      onClick={toggleMetronome}
      aria-label={isPlaying ? 'Stop metronome' : 'Start metronome'}
      className="flex items-center gap-3 px-8 py-3 rounded-full font-medium transition-all duration-200 hover:opacity-80 active:scale-95"
      style={{
        background: isPlaying ? '#ef4444' : 'var(--accent)',
        color: isPlaying ? '#fff' : '#000',
      }}
    >
      {isPlaying ? (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
          Stop Metronome
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21" />
          </svg>
          Start Metronome
        </>
      )}
    </button>
  )
}
