import Link from 'next/link'

import { PhotonicAgeTile } from '@/components/PhotonicAgeTile'
import { QDailyPanel } from '@/components/QDailyPanel'

type LossDualPanelProps = {
  ctaHref?: string
  ctaLabel?: string
}

export function LossDualPanel({
  ctaHref = '/dashboard',
  ctaLabel = 'View dashboard →',
}: LossDualPanelProps) {
  return (
    <div className="loss-dual-panel">
      <div className="loss-dual-panel__row">
        <PhotonicAgeTile compact />
        <QDailyPanel />
      </div>

      <div className="q-schedule-bar">
        <p className="q-schedule-bar__mark">Q</p>
        <p className="q-schedule-bar__copy">Schedule your deepest work before 15:00 today.</p>
      </div>

      <Link href={ctaHref} className="btn btn--primary loss-dual-panel__cta">
        {ctaLabel}
      </Link>
    </div>
  )
}
