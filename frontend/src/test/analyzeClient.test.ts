import { describe, it, expect, vi, afterEach } from 'vitest'
import { analyzeFile, AnalysisError } from '../api/analyzeClient'

describe('analyzeClient', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns AnalysisResult on successful response', async () => {
    const mockResult = { bpm: 120, numerator: 4, denominator: 4, confidence: 0.9 }

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResult,
      })
    )

    const file = new File(['audio data'], 'test.wav', { type: 'audio/wav' })
    const result = await analyzeFile(file)

    expect(result).toEqual(mockResult)
    expect(vi.mocked(fetch)).toHaveBeenCalledOnce()
  })

  it('throws AnalysisError on non-OK response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 415,
        json: async () => ({ detail: 'Unsupported file type' }),
      })
    )

    const file = new File(['bad data'], 'test.txt', { type: 'text/plain' })
    await expect(analyzeFile(file)).rejects.toThrow(AnalysisError)
    await expect(analyzeFile(file)).rejects.toThrow('Unsupported file type')
  })

  it('throws AnalysisError with status on HTTP error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 413,
        json: async () => ({ detail: 'File too large' }),
      })
    )

    const file = new File(['huge file'], 'big.wav', { type: 'audio/wav' })
    try {
      await analyzeFile(file)
      expect.fail('Should have thrown')
    } catch (e) {
      expect(e).toBeInstanceOf(AnalysisError)
      expect((e as AnalysisError).status).toBe(413)
    }
  })
})
