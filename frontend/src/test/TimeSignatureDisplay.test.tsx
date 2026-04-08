import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TimeSignatureDisplay } from '../components/TimeSignatureDisplay'
import { useAppStore } from '../store/appStore'

describe('TimeSignatureDisplay', () => {
  beforeEach(() => {
    useAppStore.setState({
      timeSignature: { numerator: 4, denominator: 4 },
      confidence: 0.9,
    })
  })

  it('renders numerator and denominator from store', () => {
    render(<TimeSignatureDisplay />)
    const nums = screen.getAllByText('4')
    expect(nums.length).toBeGreaterThanOrEqual(2)
  })

  it('shows confidence badge when confidence > 0', () => {
    render(<TimeSignatureDisplay />)
    expect(screen.getByText('90% confidence')).toBeInTheDocument()
  })

  it('does not show confidence badge when confidence is 0', () => {
    useAppStore.setState({ confidence: 0 })
    render(<TimeSignatureDisplay />)
    expect(screen.queryByText(/confidence/)).not.toBeInTheDocument()
  })

  it('dropdown override updates store time signature', () => {
    render(<TimeSignatureDisplay />)
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: '3/4' } })
    const state = useAppStore.getState()
    expect(state.timeSignature).toEqual({ numerator: 3, denominator: 4 })
  })

  it('renders 3/4 correctly', () => {
    useAppStore.setState({ timeSignature: { numerator: 3, denominator: 4 } })
    render(<TimeSignatureDisplay />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })
})
