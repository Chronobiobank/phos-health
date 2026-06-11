'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { formatGbp } from '@/lib/format-gbp'
import { BASELINE_LOST_LIGHT_YEARS } from '@/lib/org/constants'
import type { EmployerRole, OrgAggregateSnapshot } from '@/lib/org/types'

type OrgDashboardViewProps = {
  snapshot: OrgAggregateSnapshot
  role: EmployerRole
  inviteCode?: string | null
}

export function OrgDashboardView({ snapshot, role, inviteCode }: OrgDashboardViewProps) {
  const router = useRouter()
  const [refreshing, setRefreshing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function refreshAggregates() {
    setRefreshing(true)
    setMessage(null)

    try {
      const response = await fetch('/api/org/recompute', { method: 'POST' })
      const payload = (await response.json()) as { error?: string }

      if (!response.ok) {
        setMessage(payload.error ?? 'Could not refresh cohort data.')
        return
      }

      router.refresh()
    } catch {
      setMessage('Could not refresh cohort data.')
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="org-dashboard">
      {snapshot.isSample ? (
        <p className="support org-dashboard__sample">
          Sample cohort dashboard. Employer access shows live anonymised rollups only.
        </p>
      ) : null}

      <div className="org-dashboard__hero dash-card dash-card--featured">
        <p className="dash-card__label">Estimated annual savings</p>
        <p className="org-dashboard__savings">{formatGbp(snapshot.estimatedAnnualSavingsGbp)}</p>
        <p className="support">
          From improved body clock outcomes across your anonymised cohort.
        </p>
      </div>

      <div className="org-dashboard__grid">
        <div className="dash-card org-dashboard__stat">
          <p className="dash-card__metric dash-card__metric--lg">{snapshot.participationPct}%</p>
          <p className="dash-card__label">Participation</p>
          <p className="dash-card__support">
            {snapshot.activeCount} of {snapshot.memberCount} with scores
          </p>
        </div>
        <div className="dash-card org-dashboard__stat">
          <p className="dash-card__metric dash-card__metric--lg">
            {snapshot.avgPhotonicAge ?? '—'}
          </p>
          <p className="dash-card__label">Cohort Photonic Age</p>
          <p className="dash-card__support">Anonymised average</p>
        </div>
        <div className="dash-card org-dashboard__stat">
          <p className="dash-card__metric dash-card__metric--lg">
            {snapshot.avgLostLightYears ?? '—'}
          </p>
          <p className="dash-card__label">Lost light years</p>
          <p className="dash-card__support">Cohort average</p>
        </div>
        <div className="dash-card org-dashboard__stat">
          <p className="dash-card__metric dash-card__metric--lg">
            {snapshot.cohortShiftLly != null ? snapshot.cohortShiftLly : '—'}
          </p>
          <p className="dash-card__label">Shift vs {BASELINE_LOST_LIGHT_YEARS}</p>
          <p className="dash-card__support">Positive means ahead of baseline</p>
        </div>
        <div className="dash-card org-dashboard__stat">
          <p className="dash-card__metric">{snapshot.consentedCount}</p>
          <p className="dash-card__label">Consented members</p>
          <p className="dash-card__support">Employer aggregate opt-in</p>
        </div>
        <div className="dash-card org-dashboard__stat">
          <p className="dash-card__metric">
            {snapshot.avgConfidenceScore != null ? `${snapshot.avgConfidenceScore}%` : '—'}
          </p>
          <p className="dash-card__label">Confidence</p>
          <p className="dash-card__support">Cohort average band</p>
        </div>
      </div>

      <article className="dash-card org-dashboard__privacy">
        <h2 className="display-md">Aggregate only</h2>
        <p className="support">
          You never see individual sleep data, names, or health records. Only cohort rollups from
          members who opted in.
        </p>
      </article>

      {inviteCode ? (
        <article className="dash-card org-dashboard__invite">
          <h2 className="display-md">Employee invite code</h2>
          <p className="support">Share this code so staff join your programme and consent to anonymised rollups.</p>
          <p className="org-dashboard__invite-code">{inviteCode}</p>
        </article>
      ) : null}

      {role === 'admin' && !snapshot.isSample ? (
        <button
          type="button"
          className="btn btn--outline"
          onClick={refreshAggregates}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing…' : 'Refresh cohort data →'}
        </button>
      ) : null}

      {message ? <p className="support org-dashboard__message">{message}</p> : null}
    </div>
  )
}
