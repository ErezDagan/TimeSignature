import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BeatIndicator } from '../components/BeatIndicator'
import { useAppStore } from '../store/appStore'

describe('BeatIndicator', () => {
  beforeEach(() => {
    useAppStore.setState({
      currentBeat: 1,
      timeSignature: { numerator: 4, denominator: 4 },
      isPlaying: true,
    })
  })

  it('renders nothing when not playing', () => {
    useAppStore.setState({ isPlaying: false })
    const { container } = render(<BeatIndicator />)
    expect(container.firstChild).toBeNull()
  })

  it('renders beat number from store', () => {
    render(<BeatIndicator />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('updates to correct beat number', () => {
    useAppStore.setState({ currentBeat: 3 })
    render(<BeatIndicator />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders all 4 beat dots for 4/4', () => {
    render(<BeatIndicator />)
    const progressBars = screen.getAllByRole('progressbar')
    expect(progressBars.length).toBeGreaterThanOrEqual(1)
    const bar = progressBars[0]
    expect(bar).toHaveAttribute('aria-valuemax', '4')
  })

  it('shows correct aria label for 3/4', () => {
    useAppStore.setState({
      timeSignature: { numerator: 3, denominator: 4 },
      currentBeat: 2,
    })
    render(<BeatIndicator />)
    const progressBars = screen.getAllByRole('progressbar')
    expect(progressBars[0]).toHaveAttribute('aria-valuemax', '3')
    expect(progressBars[0]).toHaveAttribute('aria-valuenow', '2')
  })
})
