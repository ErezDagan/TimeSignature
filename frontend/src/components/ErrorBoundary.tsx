import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="flex flex-col items-center justify-center min-h-screen gap-4 p-8 text-center"
          style={{ background: 'var(--bg)', color: 'var(--text)' }}
        >
          <div style={{ fontSize: '48px' }}>⚠️</div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
            Something went wrong
          </h2>
          <p className="text-sm max-w-md" style={{ color: 'var(--text-muted)' }}>
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 rounded-full font-medium"
            style={{ background: 'var(--accent)', color: '#000' }}
          >
            Reload App
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
