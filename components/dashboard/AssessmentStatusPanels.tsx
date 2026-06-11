import Link from 'next/link'

import type { AssessmentSessionPayload } from '@/lib/assessments/session'

type AssessmentStatusPanelsProps = {
  assessment: AssessmentSessionPayload
}

export function AssessmentStatusPanels({ assessment }: AssessmentStatusPanelsProps) {
  const chronobiobankConsented = assessment.consentedChronobiobank

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
        <h2 className="display-md">Not started</h2>
        <p className="support">Three home nights give your tightest sleep read.</p>
        <Link href="/shop" className="btn btn--outline dashboard-status-panels__cta">
          Start study →
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
