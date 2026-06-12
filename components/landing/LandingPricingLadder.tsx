import Link from 'next/link'

import { formatSkuPrice, SHOP_UPGRADE_SKUS } from '@/lib/shop/catalog'

const FREE_SCORE_HREF = '/score'

const basicSku = SHOP_UPGRADE_SKUS.find((sku) => sku.tier === 'basic')
const premiumSku = SHOP_UPGRADE_SKUS.find((sku) => sku.tier === 'premium')

type LadderRung = {
  tier: string
  price: string
  line: string
  bandWidth: number
  ctaHref: string
  ctaLabel: string
}

const RUNGS: LadderRung[] = [
  {
    tier: 'Free',
    price: '£0',
    line: 'Best window and one thing tonight.',
    bandWidth: 100,
    ctaHref: FREE_SCORE_HREF,
    ctaLabel: 'Get your window →',
  },
  {
    tier: 'Basic',
    price: basicSku ? formatSkuPrice(basicSku) : '£149',
    line: 'Protocol tuned to your blood timing.',
    bandWidth: 68,
    ctaHref: '/shop#photonic-panel',
    ctaLabel: 'Sharpen protocol →',
  },
  {
    tier: 'Premium',
    price: premiumSku ? formatSkuPrice(premiumSku) : '£249',
    line: 'Track your timing improving nightly.',
    bandWidth: 38,
    ctaHref: '/shop#photonic-sleep-study',
    ctaLabel: 'Sharpen protocol →',
  },
]

function ConfidenceBand({ width }: { width: number }) {
  return (
    <span className="landing-ladder__band-track" aria-hidden="true">
      <span className="landing-ladder__band-fill" style={{ width: `${width}%` }} />
    </span>
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
            <ConfidenceBand width={rung.bandWidth} />
            <p className="support landing-ladder__line">{rung.line}</p>
            <Link href={rung.ctaHref} className="btn btn--outline landing-ladder__cta">
              {rung.ctaLabel}
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}

export { FREE_SCORE_HREF }
