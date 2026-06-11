import { DailyCueTimeline } from '@/components/DailyCueTimeline'
import { PhotonDepletionArc } from '@/components/PhotonDepletionArc'
import type { AssessmentSessionPayload } from '@/lib/assessments/session'

const FOCUS_LABELS: Record<string, string> = {
  anchor: 'Anchor reset',
  weekend_sync: 'Weekend sync',
  light_hygiene: 'Light hygiene',
  balanced: 'Balanced hold',
}

type PhosDashboardViewProps = {
  assessment: AssessmentSessionPayload
}

export function PhosDashboardView({ assessment }: PhosDashboardViewProps) {
  const focusLabel = FOCUS_LABELS[assessment.protocolFocus] ?? assessment.protocolFocus

  return (
    <div className="phos-dashboard">
      <div className="phos-dashboard__summary">
        <div className="phos-dashboard__stat dash-card">
          <p className="dash-card__metric">{assessment.calendarAge}</p>
          <p className="dash-card__label">Calendar age</p>
        </div>
        <div className="phos-dashboard__stat dash-card dash-card--featured">
          <p className="dash-card__metric">{assessment.photonicAge}</p>
          <p className="dash-card__label">Photonic age</p>
        </div>
        <div className="phos-dashboard__stat dash-card phos-dashboard__stat--accent">
          <p className="dash-card__metric">{assessment.lostLightYears}</p>
          <p className="dash-card__label">Lost light years</p>
        </div>
      </div>

      <p className="support phos-dashboard__confidence">
        {assessment.confidenceLabel} confidence ({assessment.confidenceScore}%)
        {` · ±${assessment.confidenceBandMinutes} min`}
        {` · Diagnostic tier`}
      </p>

      <article className="pitch-tile dash-card dash-card--featured phos-dashboard__tile">
        <header className="pitch-tile__header">
          <div className="pitch-tile__intro pitch-tile__intro--no-avatar">
            <p className="pitch-tile__greeting">{assessment.protocolHeadline}</p>
            <p className="support pitch-tile__protocol-support">{assessment.protocolSupport}</p>
            <p className="pitch-tile__sun-window">
              <svg className="pitch-tile__sun-icon" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                <circle cx="8" cy="8" r="3" fill="currentColor" />
                <path
                  d="M8 1v2M8 13v2M1 8h2M13 8h2M2.8 2.8l1.4 1.4M11.8 11.8l1.4 1.4M2.8 13.2l1.4-1.4M11.8 4.2l1.4-1.4"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
              </svg>
              Light time {assessment.lightTimeStart} to {assessment.lightTimeEnd}
            </p>
          </div>
        </header>

        <div className="pitch-tile__gauge">
          <div className="photon-dial photon-dial--pitch">
            <PhotonDepletionArc value={assessment.lostLightYears} />
            <p className="photon-dial__value">{assessment.lostLightYears}</p>
          </div>
          <p className="dash-card__label">Lost light years</p>
        </div>

        <DailyCueTimeline stops={assessment.cueTimeline} />

        <div className="pitch-tile__advice">
          <p className="dash-card__label pitch-tile__cue-type">
            {assessment.dailyCueType} · {focusLabel}
          </p>
          <p className="pitch-tile__advice-copy">{assessment.dailyCueCopy}</p>
        </div>
      </article>

      <div className="phos-dashboard__grid">
        {assessment.domains.map((domain) => (
          <div key={domain.key} className="phos-dashboard__metric dash-card">
            <p className="dash-card__metric">
              {domain.value}
              {domain.unit ? ` ${domain.unit}` : ''}
            </p>
            <p className="dash-card__label">{domain.label}</p>
            <p className="dash-card__support">{domain.lostLightYearsContribution} lost light years</p>
          </div>
        ))}
      </div>
    </div>
  )
}
