const API_URL = import.meta.env.VITE_API_URL ?? '/api'

export interface AnalysisResult {
  bpm: number
  numerator: number
  denominator: number
  confidence: number
}

export class AnalysisError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message)
    this.name = 'AnalysisError'
  }
}

export async function analyzeFile(file: File): Promise<AnalysisResult> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_URL}/analyze`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new AnalysisError(body.detail ?? `HTTP ${response.status}`, response.status)
  }

  return response.json() as Promise<AnalysisResult>
}
