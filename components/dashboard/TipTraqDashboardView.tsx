import Link from 'next/link'

import { DailyCueTimeline } from '@/components/DailyCueTimeline'
import { PhotonDepletionArc } from '@/components/PhotonDepletionArc'
import { DashboardMetricTile } from '@/components/dashboard/DashboardMetricTile'
import { DashboardPanel, DashboardPanelTiles } from '@/components/dashboard/DashboardPanel'
import { PhotonicAgeSummaryRow } from '@/components/dashboard/PhotonicAgeSummaryRow'
import { PhotonicRiskSpectrum } from '@/components/dashboard/PhotonicRiskSpectrum'
import type { PhosSnapshot } from '@/lib/phos/types'

type TipTraqDashboardViewProps = {
  snapshot: PhosSnapshot
  title?: string
  lede?: string
}

/** Retired metric tiles — data lives in the hero tile or page lede instead. */
const HIDDEN_DASHBOARD_METRICS = new Set(['Confidence', 'Sun window', 'Nights uploaded', 'Total sleep'])

export function TipTraqDashboardView({
  snapshot,
  title = 'Your Photonic Age',
  lede,
}: TipTraqDashboardViewProps) {
  const greeting = `Hey, ${snapshot.subjectName}`
  const metrics = snapshot.metrics.filter((metric) => !HIDDEN_DASHBOARD_METRICS.has(metric.label))

  const confidenceLine =
    snapshot.confidenceScore != null
      ? `${snapshot.confidenceLabel} confidence (${snapshot.confidenceScore}%)` +
        (snapshot.confidenceBandMinutes != null ? ` · ±${snapshot.confidenceBandMinutes} min` : '') +
        (snapshot.tier === 'free' ? ' · Free tier' : snapshot.tier === 'premium' ? ' · Premium' : '')
      : undefined

  const panelLede = [lede, confidenceLine].filter(Boolean).join(' · ')

  return (
    <DashboardPanel
      title={title}
      lede={panelLede || undefined}
      footer={
        snapshot.canUpload ? (
          <>
            <Link href="/dashboard/streams" className="btn btn--primary">
              Upload nights →
            </Link>
            {snapshot.tier !== 'premium' ? (
              <Link href="/shop" className="btn btn--outline">
                Upgrade measurement →
              </Link>
            ) : null}
            <Link href="/daily-cue" className="btn btn--outline">
              Open Daily Cue →
            </Link>
          </>
        ) : undefined
      }
    >
      <PhotonicAgeSummaryRow
        calendarAge={snapshot.calendarAge}
        photonicAge={snapshot.photonicAge}
        lostLightYears={snapshot.lostLightYears}
      />

      <article className="pitch-tile dash-card dash-tile dash-card--featured phos-dashboard__tile">
        <header className="pitch-tile__header">
          <div className="pitch-tile__intro pitch-tile__intro--no-avatar">
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
                Light time {snapshot.lightWindow.start} to {snapshot.lightWindow.end}
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

        <DailyCueTimeline stops={snapshot.cueTimeline} />

        <div className="pitch-tile__advice">
          <p className="dash-card__label pitch-tile__cue-type">{snapshot.dailyCueType ?? 'Anchor'}</p>
          <p className="pitch-tile__advice-copy">
            {snapshot.dailyCueCopy ?? 'Catch first light, before 08:30.'}
          </p>
        </div>
      </article>

      <article className="dash-card dash-tile phos-dashboard__risk-spectrum">
        <p className="eyebrow">UK Biobank evidence</p>
        <h2 className="display-md">Your light-dark risk mild left, chronic right in 89k.</h2>
        <PhotonicRiskSpectrum nodes={snapshot.riskSpectrum} />
      </article>

      {metrics.length > 0 ? (
        <DashboardPanelTiles columns={2} className="phos-dashboard__metrics-pair">
          {metrics.map((metric) => (
            <DashboardMetricTile key={metric.label} metric={metric} />
          ))}
        </DashboardPanelTiles>
      ) : null}
    </DashboardPanel>
  )
}
