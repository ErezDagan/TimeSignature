import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DrumSection } from '../components/DrumSection'
import { useAppStore } from '../store/appStore'

// Mock audio modules to avoid Web Audio API in tests
vi.mock('../audio/drumSamples', () => ({
  loadDrumSamples: vi.fn().mockResolvedValue(new Map()),
  getSample: vi.fn().mockReturnValue(null),
  isSamplesLoaded: vi.fn().mockReturnValue(false),
}))

vi.mock('../audio/drumSequencer', () => ({
  DrumSequencer: vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    swapPattern: vi.fn(),
    updateBpm: vi.fn(),
    setMuted: vi.fn(),
    isRunning: false,
  })),
}))

describe('DrumSection', () => {
  beforeEach(() => {
    useAppStore.setState({
      isPlaying: false,
      bpm: 120,
      timeSignature: { numerator: 4, denominator: 4 },
      selectedPattern: 'Basic Rock',
      isDrumMuted: false,
      isSongMuted: false,
      currentStep: 0,
      songBuffer: null,
    })
  })

  it('renders the drum grid with correct 4/4 pattern tabs', () => {
    render(<DrumSection />)
    expect(screen.getByText('Basic Rock')).toBeInTheDocument()
    expect(screen.getByText('Funk Groove')).toBeInTheDocument()
    expect(screen.getByText('Jazz Ride')).toBeInTheDocument()
  })

  it('renders instrument row labels', () => {
    render(<DrumSection />)
    expect(screen.getByText('Kick')).toBeInTheDocument()
    expect(screen.getByText('Snare')).toBeInTheDocument()
    expect(screen.getByText('HH Cl')).toBeInTheDocument()
  })

  it('clicking pattern tab updates store', () => {
    render(<DrumSection />)
    fireEvent.click(screen.getByRole('tab', { name: 'Funk Groove' }))
    expect(useAppStore.getState().selectedPattern).toBe('Funk Groove')
  })

  it('drum mute button toggles isDrumMuted', () => {
    render(<DrumSection />)
    const muteBtn = screen.getByLabelText('Mute drums')
    fireEvent.click(muteBtn)
    expect(useAppStore.getState().isDrumMuted).toBe(true)
  })

  it('song toggle not shown when no song buffer', () => {
    render(<DrumSection />)
    expect(screen.queryByLabelText('Mute song')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Unmute song')).not.toBeInTheDocument()
  })

  it('3/4 patterns shown for 3/4 time signature', () => {
    useAppStore.setState({ timeSignature: { numerator: 3, denominator: 4 } })
    render(<DrumSection />)
    expect(screen.getByText('Classic Waltz')).toBeInTheDocument()
    expect(screen.getByText('Jazz Waltz')).toBeInTheDocument()
  })
})
