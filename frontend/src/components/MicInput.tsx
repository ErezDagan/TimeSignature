import { useEffect, useRef, useState } from 'react'
import { StreamClient } from '../api/streamClient'
import { useAppStore } from '../store/appStore'

const CHUNK_SIZE = 4096 // samples per chunk

export function MicInput() {
  const [isListening, setIsListening] = useState(false)
  const [bufferProgress, setBufferProgress] = useState(0)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const streamClientRef = useRef<StreamClient | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const { setBpm, setTimeSignature, setConfidence, setDetectionError, setIsDetecting } =
    useAppStore()

  function stopListening() {
    processorRef.current?.disconnect()
    sourceRef.current?.disconnect()
    audioContextRef.current?.close()
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamClientRef.current?.disconnect()
    processorRef.current = null
    sourceRef.current = null
    audioContextRef.current = null
    streamRef.current = null
    streamClientRef.current = null
    setIsListening(false)
    setBufferProgress(0)
    setIsDetecting(false)
  }

  async function startListening() {
    setPermissionDenied(false)
    setDetectionError(null)
    setIsDetecting(true)

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    } catch {
      setPermissionDenied(true)
      setIsDetecting(false)
      return
    }
    streamRef.current = stream

    // Set up WebSocket
    const client = new StreamClient({
      onEvent: (event) => {
        if (event.type === 'buffering') {
          setBufferProgress(event.progress)
        } else if (event.type === 'analysis') {
          setBpm(event.bpm)
          setTimeSignature({ numerator: event.numerator, denominator: event.denominator })
          setConfidence(event.confidence)
          setIsDetecting(false)
        } else if (event.type === 'error') {
          setDetectionError(event.message)
          setIsDetecting(false)
        }
      },
      onClose: () => stopListening(),
    })
    client.connect()
    streamClientRef.current = client

    // Set up AudioContext for PCM extraction
    const audioContext = new AudioContext({ sampleRate: 22050 })
    audioContextRef.current = audioContext
    const source = audioContext.createMediaStreamSource(stream)
    sourceRef.current = source

    const processor = audioContext.createScriptProcessor(CHUNK_SIZE, 1, 1)
    processorRef.current = processor
    processor.onaudioprocess = (e) => {
      const float32 = e.inputBuffer.getChannelData(0)
      if (client.isConnected) {
        client.sendPcmChunk(float32)
      }
    }

    source.connect(processor)
    processor.connect(audioContext.destination)
    setIsListening(true)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => stopListening()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="flex flex-col items-center justify-center gap-4 rounded-xl p-10"
      style={{ background: 'var(--surface)' }}
    >
      {permissionDenied && (
        <p className="text-sm text-center" style={{ color: '#f87171' }}>
          Microphone access denied. Please allow microphone access in your browser settings.
        </p>
      )}

      {isListening ? (
        <>
          {/* Animated mic indicator */}
          <div className="relative flex items-center justify-center">
            <div
              className="absolute w-16 h-16 rounded-full animate-ping opacity-30"
              style={{ background: 'var(--accent)' }}
            />
            <div
              className="relative w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'var(--accent)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#000">
                <path d="M12 1a4 4 0 0 1 4 4v7a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm-2 18.94A9 9 0 0 0 21 12h-2a7 7 0 0 1-14 0H3a9 9 0 0 0 7 8.94V23h2v-3.06z" />
              </svg>
            </div>
          </div>

          {bufferProgress < 1 ? (
            <div className="w-full max-w-xs">
              <p className="text-sm text-center mb-2" style={{ color: 'var(--text-muted)' }}>
                Buffering audio… {Math.round(bufferProgress * 100)}%
              </p>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${bufferProgress * 100}%`, background: 'var(--accent)' }}
                />
              </div>
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--accent)' }}>
              Listening and analyzing…
            </p>
          )}

          <button
            onClick={stopListening}
            className="px-6 py-2 rounded-full text-sm font-medium transition-opacity hover:opacity-80"
            style={{ background: '#ef4444', color: '#fff' }}
          >
            Stop Listening
          </button>
        </>
      ) : (
        <>
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'var(--border)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--text-muted)' }}>
              <path d="M12 1a4 4 0 0 1 4 4v7a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm-2 18.94A9 9 0 0 0 21 12h-2a7 7 0 0 1-14 0H3a9 9 0 0 0 7 8.94V23h2v-3.06z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="font-medium" style={{ color: 'var(--text)' }}>
              Listen via Microphone
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Play a song and we'll detect its time signature
            </p>
          </div>
          <button
            onClick={startListening}
            className="px-6 py-2 rounded-full text-sm font-medium transition-opacity hover:opacity-80"
            style={{ background: 'var(--accent)', color: '#000' }}
          >
            Start Listening
          </button>
        </>
      )}
    </div>
  )
}
