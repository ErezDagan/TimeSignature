export function TimeSignatureSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="skeleton" style={{ width: '120px', height: '120px' }} />
      <div className="skeleton" style={{ width: '80px', height: '4px' }} />
      <div className="skeleton" style={{ width: '120px', height: '120px' }} />
      <div className="skeleton" style={{ width: '60px', height: '20px', borderRadius: '9999px' }} />
    </div>
  )
}
