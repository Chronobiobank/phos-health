import Image from 'next/image'
import Link from 'next/link'

import { DailyCueTimeline } from '@/components/DailyCueTimeline'
import { PhotonDepletionArc } from '@/components/PhotonDepletionArc'
import type { PhosSnapshot } from '@/lib/phos/types'

type PhosDashboardViewProps = {
  snapshot: PhosSnapshot
}

export function PhosDashboardView({ snapshot }: PhosDashboardViewProps) {
  const greeting = snapshot.isSample ? 'Hey, Terry' : `Hey, ${snapshot.subjectName}`

  return (
    <div className="phos-dashboard">
      {snapshot.isSample ? (
        <p className="support phos-dashboard__sample-note">Showing sample data until TipTraQ nights are uploaded.</p>
      ) : null}

      <div className="phos-dashboard__summary">
        <div className="phos-dashboard__stat dash-card">
          <p className="dash-card__metric dash-card__metric--lg">{snapshot.calendarAge}</p>
          <p className="dash-card__label">Calendar age</p>
        </div>
        <div className="phos-dashboard__stat dash-card dash-card--featured">
          <p className="dash-card__metric dash-card__metric--xl">{snapshot.photonicAge}</p>
          <p className="dash-card__label">Photonic age</p>
        </div>
        <div className="phos-dashboard__stat dash-card phos-dashboard__stat--accent">
          <p className="dash-card__metric dash-card__metric--lg">{snapshot.lostLightYears}</p>
          <p className="dash-card__label">Lost light years</p>
        </div>
      </div>

      <article className="pitch-tile dash-card dash-card--featured phos-dashboard__tile">
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
            <p className="pitch-tile__greeting">{greeting}</p>
            {snapshot.lightWindow ? (
              <p className="pitch-tile__sun-window">
                <svg className="pitch-tile__sun-icon" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                  <circle cx="8" cy="8" r="3" fill="currentColor" />
                  <path
                    d="M8 1v2M8 13v2M1 8h2M13 8h2M2.8 2.8l1.4 1.4M11.8 11.8l1.4 1.4M2.8 13.2l1.4-1.4M11.8 4.2l1.4-1.4"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                </svg>
                Sun window {snapshot.lightWindow.start} to {snapshot.lightWindow.end}
              </p>
            ) : null}
          </div>
        </header>

        <div className="pitch-tile__gauge">
          <div className="photon-dial photon-dial--pitch">
            <PhotonDepletionArc value={snapshot.lostLightYears} />
            <p className="photon-dial__value">{snapshot.lostLightYears}</p>
          </div>
          <p className="dash-card__label">Lost light years</p>
        </div>

        <DailyCueTimeline />

        <div className="pitch-tile__advice">
          <p className="dash-card__label pitch-tile__cue-type">Daily Cue: Anchor</p>
          <p className="pitch-tile__advice-copy">Catch first light, before 08:30.</p>
        </div>
      </article>

      <div className="phos-dashboard__grid">
        {snapshot.metrics.map((metric) => (
          <div key={metric.label} className="phos-dashboard__metric dash-card">
            <p className="dash-card__metric">{metric.value}</p>
            <p className="dash-card__label">{metric.label}</p>
            <p className="dash-card__support">{metric.note}</p>
          </div>
        ))}
      </div>

      <div className="phos-dashboard__actions">
        {snapshot.canUpload ? (
          <Link href="/dashboard/streams" className="btn btn--primary">
            Upload TipTraQ nights →
          </Link>
        ) : (
          <p className="support">Sign in and connect Supabase to enable live TipTraQ uploads.</p>
        )}
        <Link href="/" className="btn btn--outline">
          Back to home
        </Link>
      </div>
    </div>
  )
}
