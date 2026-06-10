import Link from 'next/link'

type PhotonicAgeTileProps = {
  ctaHref?: string
  ctaLabel?: string
}

export function PhotonicAgeTile({
  ctaHref = '/tiptraq',
  ctaLabel = 'How we measure it →',
}: PhotonicAgeTileProps) {
  return (
    <div className="photonic-age-panel__tile">
      <article
        className="impact-card"
        aria-label="Senior professional in London, age 43. 4.2 lost light years, £18,000 annual financial loss per person. Across 150 professionals, £2.7 million annually."
      >
        <header className="impact-card__header">Senior professional · London · age 43</header>

        <div className="impact-card__metric impact-card__metric--solo">
          <p className="impact-card__eyebrow">Lost light years</p>
          <p className="impact-card__figure">4.2</p>
        </div>

        <div className="impact-card__loss">
          <p className="impact-card__loss-value">£18,000</p>
          <p className="impact-card__cite">per person · Hafner et al. 2016</p>
        </div>

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
