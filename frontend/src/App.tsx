import { useAppStore } from './store/appStore'
import { InputToggle } from './components/InputToggle'
import { FileUpload } from './components/FileUpload'
import { MicInput } from './components/MicInput'

function App() {
  const { inputMode, timeSignature, bpm, confidence, detectionError } = useAppStore()

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
      <main className="flex-1 flex flex-col items-center justify-center gap-8 px-8 py-12 max-w-2xl mx-auto w-full">
        {/* Audio Input */}
        <div className="w-full">
          {inputMode === 'file' ? <FileUpload /> : <MicInput />}
        </div>

        {/* Error */}
        {detectionError && (
          <p className="text-sm px-4 py-3 rounded-lg w-full text-center" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
            {detectionError}
          </p>
        )}

        {/* Detection result — basic display (replaced in STEP 4.1) */}
        {confidence > 0 && (
          <div
            className="text-center p-8 rounded-2xl w-full"
            style={{ background: 'var(--surface)' }}
          >
            <div className="font-music" style={{ fontSize: '120px', lineHeight: 1, color: 'var(--accent)' }}>
              {timeSignature.numerator}
            </div>
            <div style={{ borderTop: '4px solid var(--accent)', width: '80px', margin: '8px auto' }} />
            <div className="font-music" style={{ fontSize: '120px', lineHeight: 1, color: 'var(--accent)' }}>
              {timeSignature.denominator}
            </div>
            <p className="mt-4 text-lg" style={{ color: 'var(--text-muted)' }}>
              {bpm} BPM · {Math.round(confidence * 100)}% confidence
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
