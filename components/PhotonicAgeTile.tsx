import Link from 'next/link'

export function PhotonicAgeTile() {
  return (
    <div className="photonic-age-panel__tile">
      <article
        className="impact-card"
        aria-label="Senior professional in London, age 43. 4.2 lost light years, 276 hours lost per year, £18,000 annual financial loss per person. Across 150 professionals, 41,400 hours and £2.7 million annually."
      >
        <header className="impact-card__header">Senior professional · London · age 43</header>

        <div className="impact-card__split">
          <div className="impact-card__metric">
            <p className="impact-card__eyebrow">Lost light years</p>
            <p className="impact-card__figure">4.2</p>
            <p className="impact-card__sub">yrs misalignment</p>
          </div>
          <div className="impact-card__metric">
            <p className="impact-card__eyebrow">Hours lost</p>
            <p className="impact-card__figure">276</p>
            <p className="impact-card__sub">per year</p>
          </div>
        </div>

        <div className="impact-card__equals" aria-hidden="true">
          <span className="impact-card__equals-line" />
          <span className="impact-card__equals-sign">=</span>
          <span className="impact-card__equals-line" />
        </div>

        <div className="impact-card__loss">
          <p className="impact-card__eyebrow">Annual financial loss</p>
          <p className="impact-card__loss-value">£18,000</p>
          <p className="impact-card__cite">per person · Hafner et al., RAND Europe 2016</p>
        </div>

        <footer className="impact-card__firm">
          <p className="impact-card__eyebrow">Across 150 professionals</p>
          <p className="impact-card__firm-stats">41,400 hrs · £2.7M annually</p>
          <Link href="/dashboard" className="btn btn--primary impact-card__cta">
            View demo dashboard →
          </Link>
        </footer>
      </article>
    </div>
  )
}
