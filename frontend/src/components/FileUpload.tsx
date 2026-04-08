import { useRef, useState, type DragEvent, type ChangeEvent } from 'react'
import { analyzeFile, type AnalysisError } from '../api/analyzeClient'
import { useAppStore } from '../store/appStore'

const ACCEPTED_TYPES = '.mp3,.wav,.flac,.ogg,audio/mpeg,audio/wav,audio/flac,audio/ogg'

export function FileUpload() {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const {
    setIsDetecting,
    setDetectionError,
    setBpm,
    setTimeSignature,
    setConfidence,
    isDetecting,
  } = useAppStore()

  async function handleFile(file: File) {
    setIsDetecting(true)
    setDetectionError(null)
    try {
      const result = await analyzeFile(file)
      setBpm(result.bpm)
      setTimeSignature({ numerator: result.numerator, denominator: result.denominator })
      setConfidence(result.confidence)
    } catch (e) {
      const msg = (e as AnalysisError).message ?? 'Analysis failed'
      setDetectionError(msg)
    } finally {
      setIsDetecting(false)
    }
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function onDragLeave() {
    setIsDragging(false)
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  return (
    <div
      role="region"
      aria-label="Audio file upload"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 cursor-pointer transition-colors duration-200"
      style={{
        borderColor: isDragging ? 'var(--accent)' : 'var(--border)',
        background: isDragging ? 'var(--accent-dim)' : 'var(--surface)',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        onChange={onChange}
        className="hidden"
        aria-label="Choose audio file"
      />

      {isDetecting ? (
        <>
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
          />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Analyzing audio…
          </p>
        </>
      ) : (
        <>
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{ color: isDragging ? 'var(--accent)' : 'var(--text-muted)' }}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <div className="text-center">
            <p className="font-medium" style={{ color: 'var(--text)' }}>
              Drop audio file here
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              or click to browse — MP3, WAV, FLAC, OGG
            </p>
          </div>
        </>
      )}
    </div>
  )
}
