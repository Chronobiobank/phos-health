import Link from 'next/link'

import type { AssessmentSessionPayload } from '@/lib/assessments/session'

type AssessmentStatusPanelsProps = {
  assessment?: AssessmentSessionPayload | null
  tipTraqNights?: number
}

export function AssessmentStatusPanels({ assessment, tipTraqNights = 0 }: AssessmentStatusPanelsProps) {
  const chronobiobankConsented = assessment?.consentedChronobiobank ?? false
  const tipTraqLabel =
    tipTraqNights >= 3 ? `${tipTraqNights} nights uploaded` : tipTraqNights > 0 ? `${tipTraqNights} night uploaded` : 'Not started'
  const tipTraqSupport =
    tipTraqNights >= 3
      ? 'Your home sleep study nights are in your dashboard.'
      : 'Three home nights give your tightest sleep read.'

  return (
    <div className="dashboard-status-panels">
      <article className="dash-card dashboard-status-panels__card">
        <p className="eyebrow">Blood panel</p>
        <h2 className="display-md">Not submitted</h2>
        <p className="support">Lab panel tightens your Photonic Age confidence band.</p>
        <Link href="/shop" className="btn btn--outline dashboard-status-panels__cta">
          Order panel →
        </Link>
      </article>

      <article className="dash-card dashboard-status-panels__card">
        <p className="eyebrow">TipTraQ</p>
        <h2 className="display-md">{tipTraqLabel}</h2>
        <p className="support">{tipTraqSupport}</p>
        <Link href="/dashboard/streams" className="btn btn--outline dashboard-status-panels__cta">
          {tipTraqNights > 0 ? 'View nights →' : 'Start study →'}
        </Link>
      </article>

      <article className="dash-card dashboard-status-panels__card">
        <p className="eyebrow">Chronobiobank</p>
        <h2 className="display-md">{chronobiobankConsented ? 'Consented' : 'Not consented'}</h2>
        <p className="support">
          {chronobiobankConsented
            ? 'Your de-identified assessment is in the research commons.'
            : 'Opt in after your score to join the founding dataset.'}
        </p>
        <Link href="/chronobiobank" className="btn btn--outline dashboard-status-panels__cta">
          {chronobiobankConsented ? 'Manage consent →' : 'Opt in →'}
        </Link>
      </article>
    </div>
  )
}
