'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

import {
  loadAssessmentSession,
  saveAssessmentSession,
  type AssessmentSessionPayload,
} from '@/lib/assessments/session'

const FOCUS_LABELS: Record<string, string> = {
  anchor: 'Anchor reset',
  weekend_sync: 'Weekend sync',
  light_hygiene: 'Light hygiene',
  balanced: 'Balanced hold',
}

function ProtocolContent() {
  const searchParams = useSearchParams()
  const [result, setResult] = useState<AssessmentSessionPayload | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadProtocol() {
      const id = searchParams.get('id')
      const session = loadAssessmentSession()

      if (session && (!id || session.assessmentId === id)) {
        if (!cancelled) {
          setResult(session)
          setLoading(false)
        }
        return
      }

      if (!id) {
        if (!cancelled) setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/assessments/${id}`)
        if (!response.ok) {
          if (!cancelled) setLoading(false)
          return
        }

        const payload = (await response.json()) as AssessmentSessionPayload
        if (!cancelled) {
          saveAssessmentSession(payload)
          setResult(payload)
          setLoading(false)
        }
      } catch {
        if (!cancelled) setLoading(false)
      }
    }

    void loadProtocol()

    return () => {
      cancelled = true
    }
  }, [searchParams])

  if (loading) {
    return (
      <div className="auth-page">
        <div className="container auth-page__content">
          <p className="support">Loading your protocol...</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="auth-page">
        <div className="container auth-page__content">
          <h1 className="section-title">No protocol loaded.</h1>
          <p className="support">Complete the diagnostic to see your protocol.</p>
          <div className="copy-actions">
            <Link href="/score" className="btn btn--primary">
              Start diagnostic
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const focusLabel = FOCUS_LABELS[result.protocolFocus] ?? result.protocolFocus

  return (
    <div className="auth-page">
      <div className="container auth-page__content">
        <p className="eyebrow">Your protocol</p>
        <h1 className="section-title">{result.protocolHeadline}</h1>
        <p className="support">{result.protocolSupport}</p>

        <div className="phos-dashboard__summary" style={{ marginTop: 'var(--stack-lg)' }}>
          <div className="phos-dashboard__stat dash-card">
            <p className="dash-card__metric">{result.calendarAge}</p>
            <p className="dash-card__label">Calendar age</p>
          </div>
          <div className="phos-dashboard__stat dash-card dash-card--featured">
            <p className="dash-card__metric">{result.photonicAge}</p>
            <p className="dash-card__label">Photonic age</p>
          </div>
          <div className="phos-dashboard__stat dash-card phos-dashboard__stat--accent">
            <p className="dash-card__metric">{result.lostLightYears}</p>
            <p className="dash-card__label">Lost light years</p>
          </div>
        </div>

        <div className="auth-form dash-card" style={{ marginTop: 'var(--stack-md)' }}>
          <p className="dash-card__label">Focus</p>
          <p className="display-md" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)' }}>
            {focusLabel}
          </p>
          <p className="support">
            Light window {result.lightTimeStart} to {result.lightTimeEnd}. {result.confidenceLabel}{' '}
            confidence.
          </p>
          <p className="support">Risk level: {result.riskLevel}.</p>
        </div>

        <div className="phos-dashboard__grid" style={{ marginTop: 'var(--stack-md)' }}>
          {result.domains.map((domain) => (
            <div key={domain.key} className="phos-dashboard__metric dash-card">
              <p className="dash-card__metric">
                {domain.value}
                {domain.unit ? ` ${domain.unit}` : ''}
              </p>
              <p className="dash-card__label">{domain.label}</p>
              <p className="dash-card__support">
                {domain.lostLightYearsContribution} lost light years
              </p>
            </div>
          ))}
        </div>

        <div className="copy-actions">
          <Link href="/score" className="btn btn--outline">
            Run again
          </Link>
          <Link href="/shop#protocol" className="btn btn--primary">
            Start your protocol →
          </Link>
        </div>
      </div>
    </div>
  )
}

export function ProtocolView() {
  return (
    <Suspense
      fallback={
        <div className="auth-page">
          <div className="container auth-page__content">
            <p className="support">Loading your protocol...</p>
          </div>
        </div>
      }
    >
      <ProtocolContent />
    </Suspense>
  )
}
