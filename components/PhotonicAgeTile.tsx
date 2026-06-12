import Link from 'next/link'

import { PhotonDepletionArc } from '@/components/PhotonDepletionArc'
import { formatGbp } from '@/lib/format-gbp'

const ANNUAL_COST_PER_PERSON = 18_000

type PhotonicAgeTileProps = {
  ctaHref?: string
  ctaLabel?: string
  ctaOutside?: boolean
}

export function PhotonicAgeTile({
  ctaHref = '/shop',
  ctaLabel = 'Tighten your band →',
  ctaOutside = true,
}: PhotonicAgeTileProps) {
  const cta = (
    <Link href={ctaHref} className="btn btn--primary impact-card__cta">
      {ctaLabel}
    </Link>
  )

  const annualCost = formatGbp(ANNUAL_COST_PER_PERSON)

  return (
    <div
      className={`photonic-age-panel__tile photonic-age-panel__tile--worked${ctaOutside ? '' : ' photonic-age-panel__tile--embedded'}`}
    >
      <article
        className={`impact-card impact-card--worked impact-card--evidence dash-card dash-card--featured${ctaOutside ? '' : ' impact-card--embedded'}`}
        aria-label={`Night-shift A&E registrar in London, age 43. 4.2 lost light years, 276 working hours lost, ${annualCost} annual cost per person.`}
      >
        <header className="impact-card__header impact-card__header--evidence">
          <span className="impact-card__subject">Night-shift A&E registrar</span>
          <span className="impact-card__meta">London · age 43 · 3 nights</span>
        </header>

        <div className="impact-card__evidence-body">
          <div className="impact-card__hero">
            <div className="photon-dial">
              <PhotonDepletionArc value={4.2} />
              <p className="photon-dial__value">4.2</p>
            </div>
            <p className="dash-card__label impact-card__eyebrow--evidence">Lost light years</p>
          </div>

          <div className="impact-card__cascade">
            <div className="impact-card__cascade-row">
              <p className="dash-card__metric impact-card__cascade-figure">276</p>
              <p className="dash-card__support impact-card__cascade-label">Working hours lost</p>
            </div>
            <div className="impact-card__cascade-row">
              <p className="dash-card__metric impact-card__cascade-figure impact-card__cascade-figure--money">
                {annualCost}
              </p>
              <p className="dash-card__support impact-card__cascade-label">Annual cost per person</p>
            </div>
          </div>
        </div>
      </article>

      {ctaOutside && <div className="impact-card__cta-outside">{cta}</div>}
    </div>
  )
}
