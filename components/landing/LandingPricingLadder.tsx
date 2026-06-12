import Link from 'next/link'

import { formatSkuPrice, SHOP_UPGRADE_SKUS } from '@/lib/shop/catalog'
import { pathwayHref, type PathwayLane } from '@/lib/pathway/lanes'

const FREE_SCORE_HREF = '/score'

const basicSku = SHOP_UPGRADE_SKUS.find((sku) => sku.tier === 'basic')
const premiumSku = SHOP_UPGRADE_SKUS.find((sku) => sku.tier === 'premium')

type LadderRung = {
  tier: string
  price: string
  bandLabel: string
  bandWidth: number
  reveal: string
  ctaHref: string
  ctaLabel: string
  pathwayLane: PathwayLane
}

const RUNGS: LadderRung[] = [
  {
    tier: 'Free',
    price: '£0',
    bandLabel: 'Wide band',
    bandWidth: 100,
    reveal: 'Social jet lag from your phone. Instant estimate.',
    ctaHref: FREE_SCORE_HREF,
    ctaLabel: 'Get free score →',
    pathwayLane: 'sleep',
  },
  {
    tier: 'Basic',
    price: basicSku ? formatSkuPrice(basicSku) : '£149',
    bandLabel: 'Tighter band',
    bandWidth: 68,
    reveal:
      'Photonic Panel blood test. Circadian contribution to sleep and metabolic risk.',
    ctaHref: '/shop#photonic-panel',
    ctaLabel: 'Order panel →',
    pathwayLane: 'metabolic',
  },
  {
    tier: 'Premium',
    price: premiumSku ? formatSkuPrice(premiumSku) : '£249',
    bandLabel: 'Tightest band',
    bandWidth: 38,
    reveal:
      'Three night home sleep study. Circadian contribution to cardiometabolic risk.',
    ctaHref: '/shop#photonic-sleep-study',
    ctaLabel: 'Order study →',
    pathwayLane: 'cardiometabolic',
  },
]

function ConfidenceBand({ label, width }: { label: string; width: number }) {
  return (
    <div className="landing-ladder__band" aria-label={`Confidence: ${label}`}>
      <span className="landing-ladder__band-label">{label}</span>
      <span className="landing-ladder__band-track" aria-hidden="true">
        <span className="landing-ladder__band-fill" style={{ width: `${width}%` }} />
      </span>
    </div>
  )
}

export function LandingPricingLadder() {
  return (
    <div className="landing-ladder">
      <div className="landing-ladder__rungs">
        {RUNGS.map((rung) => (
          <article key={rung.tier} className="landing-ladder__rung dash-card">
            <p className="landing-ladder__tier">{rung.tier}</p>
            <p className="landing-ladder__price">{rung.price}</p>
            <ConfidenceBand label={rung.bandLabel} width={rung.bandWidth} />
            <p className="support landing-ladder__reveal">{rung.reveal}</p>
            <Link href={rung.ctaHref} className="btn btn--outline landing-ladder__cta">
              {rung.ctaLabel}
            </Link>
            <Link href={pathwayHref(rung.pathwayLane)} className="landing-ladder__pathway">
              See what to do next →
            </Link>
          </article>
        ))}
      </div>

      <p className="support landing-ladder__signpost">
        Every rung signposts your GP and local specialists when you need help.{' '}
        <Link href={pathwayHref('sleep')} className="landing-ladder__pathway-inline">
          See what to do next →
        </Link>
      </p>

      <p className="support landing-ladder__guarantee">
        Photonic Age confidence is guaranteed on every paid rung, not the test alone.
      </p>

      <aside className="landing-commons">
        <p className="eyebrow">Chronobiobank</p>
        <h3 className="display-md">Your data, held in trust.</h3>
        <p className="support landing-commons__copy">
          Free to join, rewarded not charged. Funds the free tier. Never sold.
        </p>
        <Link href="/chronobiobank" className="btn btn--primary landing-commons__cta">
          Join commons →
        </Link>
      </aside>

      <p className="support landing-ladder__safety">
        If symptoms feel urgent, call 111 or 999 for NHS care.
      </p>
    </div>
  )
}

export { FREE_SCORE_HREF }
