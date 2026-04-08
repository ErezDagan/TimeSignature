import { useAppStore } from '../store/appStore'

const SUPPORTED_METERS = [
  { numerator: 2, denominator: 4, label: '2/4' },
  { numerator: 3, denominator: 4, label: '3/4' },
  { numerator: 4, denominator: 4, label: '4/4' },
  { numerator: 5, denominator: 4, label: '5/4' },
  { numerator: 6, denominator: 8, label: '6/8' },
  { numerator: 7, denominator: 8, label: '7/8' },
  { numerator: 9, denominator: 8, label: '9/8' },
]

export function TimeSignatureDisplay() {
  const { timeSignature, setTimeSignature, confidence } = useAppStore()
  const { numerator, denominator } = timeSignature

  function handleOverride(e: React.ChangeEvent<HTMLSelectElement>) {
    const [num, den] = e.target.value.split('/').map(Number)
    setTimeSignature({ numerator: num, denominator: den })
  }

  const currentValue = `${numerator}/${denominator}`
  const isRecognized = SUPPORTED_METERS.some((m) => m.label === currentValue)

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Musical notation time signature */}
      <div
        className="font-music relative select-none"
        style={{ lineHeight: 1 }}
        aria-label={`Time signature: ${numerator} over ${denominator}`}
      >
        {/* Numerator */}
        <div
          className="text-center font-music transition-all duration-300"
          style={{
            fontSize: 'clamp(80px, 15vw, 160px)',
            color: 'var(--accent)',
            fontWeight: 'bold',
          }}
        >
          {numerator}
        </div>

        {/* Dividing line */}
        <div
          style={{
            height: '4px',
            background: 'var(--accent)',
            borderRadius: '2px',
            margin: '4px auto',
            width: '60%',
          }}
        />

        {/* Denominator */}
        <div
          className="text-center font-music transition-all duration-300"
          style={{
            fontSize: 'clamp(80px, 15vw, 160px)',
            color: 'var(--accent)',
            fontWeight: 'bold',
          }}
        >
          {denominator}
        </div>
      </div>

      {/* Confidence badge */}
      {confidence > 0 && (
        <div
          className="px-3 py-1 rounded-full text-xs font-medium"
          style={{
            background: confidence > 0.7 ? 'rgba(74, 222, 128, 0.15)' : 'rgba(245, 166, 35, 0.15)',
            color: confidence > 0.7 ? '#4ade80' : 'var(--accent)',
          }}
        >
          {Math.round(confidence * 100)}% confidence
        </div>
      )}

      {/* Manual override dropdown */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="meter-override"
          className="text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          Override:
        </label>
        <select
          id="meter-override"
          value={isRecognized ? currentValue : ''}
          onChange={handleOverride}
          className="rounded-lg px-3 py-1.5 text-sm cursor-pointer"
          style={{
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
          }}
        >
          {!isRecognized && <option value="">-- detected --</option>}
          {SUPPORTED_METERS.map((m) => (
            <option key={m.label} value={m.label}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
