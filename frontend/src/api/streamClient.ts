const WS_URL = (() => {
  const base = import.meta.env.VITE_API_URL ?? ''
  if (base) {
    return base.replace(/^http/, 'ws') + '/stream'
  }
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/api/stream`
})()

export type StreamEvent =
  | { type: 'buffering'; progress: number }
  | { type: 'analysis'; bpm: number; numerator: number; denominator: number; confidence: number }
  | { type: 'tick'; bpm: number }
  | { type: 'error'; message: string }

export interface StreamClientOptions {
  onEvent: (event: StreamEvent) => void
  onOpen?: () => void
  onClose?: () => void
}

export class StreamClient {
  private ws: WebSocket | null = null
  private options: StreamClientOptions

  constructor(options: StreamClientOptions) {
    this.options = options
  }

  connect(): void {
    if (this.ws) return
    this.ws = new WebSocket(WS_URL)
    this.ws.binaryType = 'arraybuffer'

    this.ws.onopen = () => {
      this.options.onOpen?.()
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string) as StreamEvent
        this.options.onEvent(data)
      } catch {
        // Ignore malformed messages
      }
    }

    this.ws.onclose = () => {
      this.ws = null
      this.options.onClose?.()
    }

    this.ws.onerror = () => {
      this.options.onEvent({ type: 'error', message: 'WebSocket connection error' })
    }
  }

  sendPcmChunk(float32Array: Float32Array): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(float32Array.buffer)
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}
