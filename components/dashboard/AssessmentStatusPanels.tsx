import Link from 'next/link'

import { DashboardPanel, DashboardPanelTiles } from '@/components/dashboard/DashboardPanel'
import type { AssessmentSessionPayload } from '@/lib/assessments/session'
import {
  BLOOD_PANEL_SUB,
  CHRONOBIOBANK_SUB_CONSENTED,
  CHRONOBIOBANK_SUB_PENDING,
  TIPTRAQ_SUB_PENDING,
  TIPTRAQ_SUB_UPLOADED,
} from '@/lib/phos/status-panel-copy'

type AssessmentStatusPanelsProps = {
  assessment?: AssessmentSessionPayload | null
  tipTraqNights?: number
}

export function AssessmentStatusPanels({ assessment, tipTraqNights = 0 }: AssessmentStatusPanelsProps) {
  const chronobiobankConsented = assessment?.consentedChronobiobank ?? false
  const tipTraqLabel =
    tipTraqNights >= 3 ? `${tipTraqNights} nights uploaded` : tipTraqNights > 0 ? `${tipTraqNights} night uploaded` : 'Not started'
  const tipTraqSupport = tipTraqNights > 0 ? TIPTRAQ_SUB_UPLOADED : TIPTRAQ_SUB_PENDING
  const chronobiobankSupport = chronobiobankConsented
    ? CHRONOBIOBANK_SUB_CONSENTED
    : CHRONOBIOBANK_SUB_PENDING

  return (
    <DashboardPanel
      title="Optional upgrades tighten your confidence band"
      titleAs="h2"
    >
      <DashboardPanelTiles columns={3} className="dashboard-status-panels">
        <article className="dash-card dash-tile dashboard-status-panels__card">
          <p className="eyebrow">Blood panel</p>
          <h3 className="display-md">Not submitted</h3>
          <p className="dash-card__copy">{BLOOD_PANEL_SUB}</p>
          <Link href="/shop#photonic-panel" className="btn btn--outline dashboard-status-panels__cta">
            Order panel →
          </Link>
        </article>

        <article className="dash-card dash-tile dashboard-status-panels__card">
          <p className="eyebrow">TipTraQ</p>
          <h3 className="display-md">{tipTraqLabel}</h3>
          <p className="dash-card__copy">{tipTraqSupport}</p>
          <Link href="/dashboard/streams" className="btn btn--outline dashboard-status-panels__cta">
            {tipTraqNights > 0 ? 'View nights →' : 'Start study →'}
          </Link>
        </article>

        <article className="dash-card dash-tile dashboard-status-panels__card">
          <p className="eyebrow">Chronobiobank</p>
          <h3 className="display-md">{chronobiobankConsented ? 'Consented' : 'Not consented'}</h3>
          <p className="dash-card__copy">{chronobiobankSupport}</p>
          <Link href="/chronobiobank" className="btn btn--outline dashboard-status-panels__cta">
            {chronobiobankConsented ? 'Manage consent →' : 'Opt in →'}
          </Link>
        </article>
      </DashboardPanelTiles>
    </DashboardPanel>
  )
}
