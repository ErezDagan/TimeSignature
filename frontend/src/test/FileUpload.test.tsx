import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FileUpload } from '../components/FileUpload'
import { useAppStore } from '../store/appStore'
import * as analyzeClientModule from '../api/analyzeClient'

describe('FileUpload', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    useAppStore.setState({
      bpm: 120,
      timeSignature: { numerator: 4, denominator: 4 },
      confidence: 0,
      isDetecting: false,
      detectionError: null,
    })
  })

  it('renders upload area', () => {
    render(<FileUpload />)
    expect(screen.getByText('Drop audio file here')).toBeInTheDocument()
  })

  it('shows analyzing state during file upload', async () => {
    // Slow mock to capture loading state
    vi.spyOn(analyzeClientModule, 'analyzeFile').mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ bpm: 120, numerator: 4, denominator: 4, confidence: 0.9 }), 100))
    )

    render(<FileUpload />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['audio'], 'test.wav', { type: 'audio/wav' })
    await userEvent.upload(input, file)

    expect(screen.getByText('Analyzing audio…')).toBeInTheDocument()
  })

  it('updates store on successful analysis', async () => {
    vi.spyOn(analyzeClientModule, 'analyzeFile').mockResolvedValue({
      bpm: 130,
      numerator: 3,
      denominator: 4,
      confidence: 0.85,
    })

    render(<FileUpload />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['audio'], 'test.wav', { type: 'audio/wav' })
    await userEvent.upload(input, file)

    await waitFor(() => {
      const state = useAppStore.getState()
      expect(state.bpm).toBe(130)
      expect(state.timeSignature).toEqual({ numerator: 3, denominator: 4 })
      expect(state.confidence).toBe(0.85)
    })
  })

  it('sets detectionError on failed analysis', async () => {
    vi.spyOn(analyzeClientModule, 'analyzeFile').mockRejectedValue(
      Object.assign(new Error('File too large'), { name: 'AnalysisError' })
    )

    render(<FileUpload />)
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['big audio'], 'huge.wav', { type: 'audio/wav' })
    await userEvent.upload(input, file)

    await waitFor(() => {
      expect(useAppStore.getState().detectionError).toBe('File too large')
    })
  })
})
