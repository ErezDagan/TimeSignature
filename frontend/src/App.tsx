import { useAppStore } from './store/appStore'
import { InputToggle } from './components/InputToggle'
import { FileUpload } from './components/FileUpload'
import { MicInput } from './components/MicInput'
import { TimeSignatureDisplay } from './components/TimeSignatureDisplay'
import { BpmControl } from './components/BpmControl'
import { MetronomeControls } from './components/MetronomeControls'
import { BeatIndicator } from './components/BeatIndicator'
import { DrumSection } from './components/DrumSection'
import { TimeSignatureSkeleton } from './components/LoadingSkeleton'

function App() {
  const { inputMode, confidence, detectionError, isDetecting } = useAppStore()
  const hasDetection = confidence > 0

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: 'var(--border)', background: 'rgba(15,15,19,0.9)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center gap-3">
          <span className="font-music text-2xl" style={{ color: 'var(--accent)' }}>♩</span>
          <h1 className="font-music text-xl font-semibold" style={{ color: 'var(--text)' }}>
            TimeSignature
          </h1>
        </div>
        <InputToggle />
      </header>

      {/* Main — two columns on large screens */}
      <main
        className="flex-1 grid gap-6 px-6 py-8 mx-auto w-full"
        style={{
          maxWidth: '1200px',
          gridTemplateColumns: 'minmax(0,1fr)',
        }}
      >
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          }}
        >
          {/* Left: Audio input */}
          <div className="flex flex-col gap-4">
            {inputMode === 'file' ? <FileUpload /> : <MicInput />}

            {detectionError && (
              <p
                role="alert"
                className="text-sm px-4 py-3 rounded-xl text-center"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}
              >
                {detectionError}
              </p>
            )}
          </div>

          {/* Right: Time signature + controls */}
          <div className="flex flex-col gap-4">
            <div
              className="flex flex-col items-center gap-6 p-8 rounded-2xl"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              {isDetecting && !hasDetection ? (
                <TimeSignatureSkeleton />
              ) : (
                <TimeSignatureDisplay />
              )}
              <BpmControl />
              <MetronomeControls />
            </div>

            <BeatIndicator />
          </div>
        </div>

        {/* Full-width drum section */}
        <DrumSection />
      </main>

      {/* Footer */}
      <footer
        className="px-6 py-4 text-center text-xs border-t"
        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
      >
        TimeSignature — Detect. Play. Groove.
      </footer>
    </div>
  )
}

export default App
