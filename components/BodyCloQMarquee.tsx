const MARQUEE_ITEMS = [
  'BodyCloQ Score',
  'Circadian Amplitude',
  'Cognitive Peak Window',
  'Sleep Architecture',
  'HRV Overnight',
  'Social Jet Lag',
  'Recovery Index',
  'Circadian Phase',
  'Daily Q Cue',
  'TipTraQ Baseline',
  'Chronotype Mapping',
  'Light Protocol',
  'Travel Recovery',
  'Nootropic Timing',
] as const

function MarqueeContent() {
  return (
    <span className="marquee__content">
      {MARQUEE_ITEMS.map((item) => (
        <span key={item} className="inline-flex items-center gap-6">
          {item}
          <span className="marquee__dot" aria-hidden>
            ·
          </span>
        </span>
      ))}
    </span>
  )
}

export function BodyCloQMarquee() {
  return (
    <div className="marquee" aria-hidden>
      <div className="marquee__track">
        <MarqueeContent />
        <MarqueeContent />
      </div>
    </div>
  )
}
