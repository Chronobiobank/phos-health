import Link from 'next/link'

type PhotonicAgeTileProps = {
  ctaHref?: string
  ctaLabel?: string
  compact?: boolean
}

export function PhotonicAgeTile({
  ctaHref = '/tiptraq',
  ctaLabel = 'How we measure it →',
  compact = false,
}: PhotonicAgeTileProps) {
  if (compact) {
    return (
      <article
        className="impact-card impact-card--compact loss-metric-card"
        aria-label="4.2 lost light years, 276 hours lost, £18,000 annual cost per person."
      >
        <div className="impact-card__metric impact-card__metric--solo impact-card__metric--compact">
          <p className="impact-card__eyebrow">Lost light years</p>
          <p className="impact-card__figure">4.2</p>
          <p className="impact-card__summary">276 hrs · £18,000</p>
        </div>
      </article>
    )
  }

  return (
    <div className="photonic-age-panel__tile">
      <article
        className="impact-card"
        aria-label="Senior professional in London, age 43. 4.2 lost light years, 276 hours lost, £18,000 annual cost per person. Across 150 professionals, £2.7 million annually."
      >
        <header className="impact-card__header">Senior professional · London · age 43</header>

        <div className="impact-card__split impact-card__split--triple">
          <div className="impact-card__metric">
            <p className="impact-card__eyebrow">Lost light years</p>
            <p className="impact-card__figure">4.2</p>
          </div>
          <div className="impact-card__metric">
            <p className="impact-card__eyebrow">Hours lost</p>
            <p className="impact-card__figure impact-card__figure--compact">276</p>
            <p className="impact-card__sub">hrs</p>
          </div>
          <div className="impact-card__metric">
            <p className="impact-card__eyebrow">Annual cost</p>
            <p className="impact-card__figure impact-card__figure--compact">£18,000</p>
          </div>
        </div>

        <p className="impact-card__cite impact-card__cite--centered">per person · Hafner et al. 2016</p>

        <footer className="impact-card__firm">
          <p className="impact-card__firm-stats">150 professionals · £2.7M annually</p>
          <Link href={ctaHref} className="btn btn--primary impact-card__cta">
            {ctaLabel}
          </Link>
        </footer>
      </article>
    </div>
  )
}
