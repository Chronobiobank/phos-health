type PathwaySafetyNetProps = {
  variant?: 'banner' | 'panel'
}

export function PathwaySafetyNet({ variant = 'panel' }: PathwaySafetyNetProps) {
  return (
    <aside
      className={`pathway-safety-net pathway-safety-net--${variant}`}
      role="note"
      aria-label="Urgent care guidance"
    >
      <p className="pathway-safety-net__head">If you have urgent symptoms, do not wait.</p>
      <p className="pathway-safety-net__copy">
        Contact your GP, call NHS 111, or in an emergency call 999.
      </p>
    </aside>
  )
}
