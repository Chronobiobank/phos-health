import Link from 'next/link'

import { PhotonicAgeTile } from '@/components/PhotonicAgeTile'
import { PitchTile } from '@/components/PitchTile'
import { QDailyPanel } from '@/components/QDailyPanel'

type LossDualPanelProps = {
  ctaHref?: string
  ctaLabel?: string
  pitch?: boolean
}

export function LossDualPanel({
  ctaHref = '/dashboard',
  ctaLabel = 'View dashboard →',
  pitch = false,
}: LossDualPanelProps) {
  if (pitch) {
    return (
      <div className="loss-pitch-panel">
        <PitchTile ctaHref={ctaHref} ctaLabel={ctaLabel} />
      </div>
    )
  }

  return (
    <div className="loss-dual-panel">
      <div className="loss-dual-panel__row">
        <PhotonicAgeTile ctaOutside={false} />
        <QDailyPanel />
      </div>

      <div className="q-schedule-bar dash-card">
        <p className="dash-card__label q-schedule-bar__cue">Daily Cue:</p>
        <p className="q-schedule-bar__copy">Schedule your deepest work before 15:00 today.</p>
      </div>

      <div className="loss-dual-panel__cta-wrap">
        <Link href={ctaHref} className="btn btn--primary">
          {ctaLabel}
        </Link>
      </div>
    </div>
  )
}
