import { useAppStore } from './store/appStore'
import { InputToggle } from './components/InputToggle'
import { FileUpload } from './components/FileUpload'
import { MicInput } from './components/MicInput'
import { TimeSignatureDisplay } from './components/TimeSignatureDisplay'
import { BpmControl } from './components/BpmControl'
import { MetronomeControls } from './components/MetronomeControls'
import { BeatIndicator } from './components/BeatIndicator'

function App() {
  const { inputMode, confidence, detectionError, isDetecting } = useAppStore()

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-8 py-4 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <h1 className="font-music text-2xl" style={{ color: 'var(--accent)' }}>
          ♩ TimeSignature
        </h1>
        <InputToggle />
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col lg:flex-row gap-8 px-8 py-10 max-w-6xl mx-auto w-full">
        {/* Left column: Audio input */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="w-full">
            {inputMode === 'file' ? <FileUpload /> : <MicInput />}
          </div>

          {detectionError && (
            <p
              className="text-sm px-4 py-3 rounded-lg text-center"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}
            >
              {detectionError}
            </p>
          )}

          {isDetecting && !detectionError && (
            <div className="flex items-center justify-center gap-3 py-4">
              <div
                className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
              />
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Detecting time signature…
              </span>
            </div>
          )}
        </div>

        {/* Right column: Time signature + metronome (STEP 4.2 will add metronome) */}
        <div className="flex-1 flex flex-col items-center gap-8">
          {/* Time Signature */}
          <div
            className="w-full flex flex-col items-center gap-6 p-8 rounded-2xl"
            style={{ background: 'var(--surface)' }}
          >
            <TimeSignatureDisplay />
            <BpmControl />
            <MetronomeControls />
          </div>

          {/* Beat Visuals */}
          <BeatIndicator />
        </div>
      </main>
    </div>
  )
}

export default App
