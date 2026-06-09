const MARQUEE_ITEMS = [
  'Photonic Age',
  'Lost Light Years',
  'Light/Dark Cycle Exposure',
  'Circadian Amplitude',
  'Cognitive Peak Window',
  'Sleep Architecture',
  'HRV Overnight',
  'Social Jet Lag',
  'Recovery Index',
  'TipTraQ Baseline',
  'Chronotype Mapping',
  'Light Protocol',
  'UK Biobank Methodology',
  'Workforce Photonic Deficit',
] as const

function MarqueeContent() {
  return (
    <span className="marquee__content">
      {MARQUEE_ITEMS.map((item) => (
        <span key={item} className="marquee__item">
          {item}
          <span className="marquee__dot" aria-hidden>
            ·
          </span>
        </span>
      ))}
    </span>
  )
}

export function PhotonicAgeMarquee() {
  return (
    <div className="marquee" aria-hidden>
      <div className="marquee__track">
        <MarqueeContent />
        <MarqueeContent />
      </div>
    </div>
  )
}
