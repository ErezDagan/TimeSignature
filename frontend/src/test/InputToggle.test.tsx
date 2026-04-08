import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { InputToggle } from '../components/InputToggle'
import { useAppStore } from '../store/appStore'

describe('InputToggle', () => {
  beforeEach(() => {
    useAppStore.setState({ inputMode: 'mic' })
  })

  it('renders both modes', () => {
    render(<InputToggle />)
    expect(screen.getByText('Microphone')).toBeInTheDocument()
    expect(screen.getByText('File Upload')).toBeInTheDocument()
  })

  it('switches to file mode on click', () => {
    render(<InputToggle />)
    fireEvent.click(screen.getByText('File Upload'))
    expect(useAppStore.getState().inputMode).toBe('file')
  })

  it('switches back to mic mode', () => {
    useAppStore.setState({ inputMode: 'file' })
    render(<InputToggle />)
    fireEvent.click(screen.getByText('Microphone'))
    expect(useAppStore.getState().inputMode).toBe('mic')
  })
})
