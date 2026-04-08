import { useAppStore, type InputMode } from '../store/appStore'

export function InputToggle() {
  const inputMode = useAppStore((s) => s.inputMode)
  const setInputMode = useAppStore((s) => s.setInputMode)

  return (
    <div className="flex items-center gap-1 rounded-full p-1" style={{ background: 'var(--surface)' }}>
      {(['mic', 'file'] as InputMode[]).map((mode) => {
        const active = inputMode === mode
        return (
          <button
            key={mode}
            onClick={() => setInputMode(mode)}
            aria-pressed={active}
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200"
            style={{
              background: active ? 'var(--accent)' : 'transparent',
              color: active ? '#000' : 'var(--text-muted)',
            }}
          >
            {mode === 'mic' ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1a4 4 0 0 1 4 4v7a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm-2 18.94A9 9 0 0 0 21 12h-2a7 7 0 0 1-14 0H3a9 9 0 0 0 7 8.94V23h2v-3.06z" />
                </svg>
                Microphone
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
                </svg>
                File Upload
              </>
            )}
          </button>
        )
      })}
    </div>
  )
}
