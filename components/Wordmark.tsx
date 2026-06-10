// PHʘS Wordmark — ʘ (U+0298) appears ONLY here, never in page copy
// Everywhere else in copy: write PHOS, never PHʘS

export default function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span
      className={`wordmark ${className}`}
      aria-label="PHOS"
    >
      PH<span aria-hidden="true">ʘ</span>S
    </span>
  )
}
