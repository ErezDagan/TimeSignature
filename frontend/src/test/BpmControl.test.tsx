import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BpmControl } from '../components/BpmControl'
import { useAppStore } from '../store/appStore'

describe('BpmControl', () => {
  beforeEach(() => {
    useAppStore.setState({ bpm: 120 })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders current BPM', () => {
    render(<BpmControl />)
    expect(screen.getByText('120')).toBeInTheDocument()
  })

  it('+1 button increments BPM', () => {
    render(<BpmControl />)
    fireEvent.click(screen.getByLabelText('Increase BPM by 1'))
    expect(useAppStore.getState().bpm).toBe(121)
  })

  it('−1 button decrements BPM', () => {
    render(<BpmControl />)
    fireEvent.click(screen.getByLabelText('Decrease BPM by 1'))
    expect(useAppStore.getState().bpm).toBe(119)
  })

  it('+5 button increases BPM by 5', () => {
    render(<BpmControl />)
    fireEvent.click(screen.getByLabelText('Increase BPM by 5'))
    expect(useAppStore.getState().bpm).toBe(125)
  })

  it('BPM does not exceed 240', () => {
    useAppStore.setState({ bpm: 238 })
    render(<BpmControl />)
    fireEvent.click(screen.getByLabelText('Increase BPM by 5'))
    expect(useAppStore.getState().bpm).toBe(240)
  })

  it('BPM does not go below 40', () => {
    useAppStore.setState({ bpm: 42 })
    render(<BpmControl />)
    fireEvent.click(screen.getByLabelText('Decrease BPM by 5'))
    expect(useAppStore.getState().bpm).toBe(40)
  })

  it('tap tempo computes BPM from intervals', () => {
    vi.useFakeTimers()
    render(<BpmControl />)
    const tapBtn = screen.getByLabelText('Tap tempo')

    // 3 taps at 500ms intervals = 120 BPM
    fireEvent.click(tapBtn)
    vi.advanceTimersByTime(500)
    fireEvent.click(tapBtn)
    vi.advanceTimersByTime(500)
    fireEvent.click(tapBtn)

    const bpm = useAppStore.getState().bpm
    expect(bpm).toBeGreaterThanOrEqual(115)
    expect(bpm).toBeLessThanOrEqual(125)
  })
})
