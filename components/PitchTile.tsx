import Image from 'next/image'
import Link from 'next/link'

import { DailyCueTimeline } from '@/components/DailyCueTimeline'
import { PhotonDepletionArc } from '@/components/PhotonDepletionArc'

type PitchTileProps = {
  ctaHref?: string
  ctaLabel?: string
}

export function PitchTile({
  ctaHref = '/dashboard',
  ctaLabel = 'View dashboard →',
}: PitchTileProps) {
  return (
    <div className="photonic-age-panel__tile photonic-age-panel__tile--pitch">
      <article
        className="pitch-tile dash-card dash-card--featured"
        aria-label="Hey Terry. 4.2 lost light years. Daily cue anchor: catch first light before 08:30."
      >
        <header className="pitch-tile__header">
          <Image
            className="pitch-tile__avatar"
            src="/terry-profile.png"
            alt=""
            width={48}
            height={48}
            aria-hidden="true"
          />
          <div className="pitch-tile__intro">
            <p className="pitch-tile__greeting">Hey, Terry</p>
            <p className="pitch-tile__sun-window">
              <svg className="pitch-tile__sun-icon" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                <circle cx="8" cy="8" r="3" fill="currentColor" />
                <path d="M8 1v2M8 13v2M1 8h2M13 8h2M2.8 2.8l1.4 1.4M11.8 11.8l1.4 1.4M2.8 13.2l1.4-1.4M11.8 4.2l1.4-1.4" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              Sun window 10:00 to 16:00
            </p>
          </div>
        </header>

        <div className="pitch-tile__gauge">
          <div className="photon-dial photon-dial--pitch">
            <PhotonDepletionArc value={4.2} />
            <p className="photon-dial__value">4.2</p>
          </div>
          <p className="dash-card__label">Lost light years</p>
        </div>

        <DailyCueTimeline />

        <div className="pitch-tile__advice">
          <p className="dash-card__label pitch-tile__cue-type">Daily Cue: Anchor</p>
          <p className="pitch-tile__advice-copy">Catch first light, before 08:30.</p>
        </div>

        <footer className="pitch-tile__footer">
          <Link href={ctaHref} className="btn btn--primary pitch-tile__cta">
            {ctaLabel}
          </Link>
        </footer>
      </article>
    </div>
  )
}
