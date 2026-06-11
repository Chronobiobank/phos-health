'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

import { AssessmentStatusPanels } from '@/components/dashboard/AssessmentStatusPanels'
import { PhosDashboardView } from '@/components/dashboard/PhosDashboardView'
import { TipTraqDashboardView } from '@/components/dashboard/TipTraqDashboardView'
import {
  clearAssessmentSession,
  loadAssessmentSession,
  saveAssessmentSession,
  type AssessmentSessionPayload,
} from '@/lib/assessments/session'
import type { PhosSnapshot } from '@/lib/phos/types'

type DashboardMode = 'assessment' | 'tiptraq' | 'empty' | 'unauthenticated'

function hasTipTraqSnapshot(snapshot: PhosSnapshot): boolean {
  return !snapshot.isSample && snapshot.nightsCount > 0
}

function DashboardContent() {
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<DashboardMode>('empty')
  const [assessment, setAssessment] = useState<AssessmentSessionPayload | null>(null)
  const [snapshot, setSnapshot] = useState<PhosSnapshot | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadDashboard() {
      const assessmentId = searchParams.get('id')

      try {
        const snapshotResponse = await fetch('/api/dashboard/snapshot')

        if (snapshotResponse.status === 401) {
          if (!cancelled) {
            setMode('unauthenticated')
            setLoading(false)
          }
          return
        }

        if (snapshotResponse.ok) {
          const liveSnapshot = (await snapshotResponse.json()) as PhosSnapshot
          if (!cancelled && hasTipTraqSnapshot(liveSnapshot)) {
            clearAssessmentSession()
            setSnapshot(liveSnapshot)
            setAssessment(null)
            setMode('tiptraq')
            setLoading(false)
            return
          }
        }
      } catch {
        // Fall through to assessment paths.
      }

      if (assessmentId) {
        try {
          const response = await fetch(`/api/assessments/${assessmentId}`)
          if (response.ok) {
            const payload = (await response.json()) as AssessmentSessionPayload
            if (!cancelled) {
              saveAssessmentSession(payload)
              setAssessment(payload)
              setSnapshot(null)
              setMode('assessment')
              setLoading(false)
            }
            return
          }
        } catch {
          if (!cancelled) setLoading(false)
          return
        }
      }

      const session = loadAssessmentSession()
      if (!cancelled) {
        if (session) {
          setAssessment(session)
          setSnapshot(null)
          setMode('assessment')
        } else {
          setMode('empty')
        }
        setLoading(false)
      }
    }

    void loadDashboard()

    return () => {
      cancelled = true
    }
  }, [searchParams])

  if (loading) {
    return <p className="support">Loading your dashboard...</p>
  }

  if (mode === 'unauthenticated') {
    return (
      <>
        <h1 className="section-title dashboard-page__title">Your Photonic Age</h1>
        <p className="support dashboard-page__lede">Sign in to load your TipTraQ nights and score.</p>
        <div className="copy-actions dashboard-page__actions">
          <Link href="/auth/signin?next=/dashboard" className="btn btn--primary">
            Sign in →
          </Link>
        </div>
      </>
    )
  }

  if (mode === 'empty') {
    return (
      <>
        <h1 className="section-title dashboard-page__title">Your Photonic Age</h1>
        <p className="support dashboard-page__lede">
          Sign in to see TipTraQ nights, or complete the diagnostic for your score.
        </p>
        <div className="copy-actions dashboard-page__actions">
          <Link href="/auth/signin?next=/dashboard" className="btn btn--outline">
            Sign in
          </Link>
          <Link href="/score" className="btn btn--primary">
            Start diagnostic
          </Link>
        </div>
      </>
    )
  }

  if (mode === 'tiptraq' && snapshot) {
    return (
      <>
        <h1 className="section-title dashboard-page__title">Your Photonic Age</h1>
        <p className="support dashboard-page__lede">
          {snapshot.nightsCount} sleep study nights processed.
        </p>
        <TipTraqDashboardView snapshot={snapshot} />
        <AssessmentStatusPanels tipTraqNights={snapshot.nightsCount} />
      </>
    )
  }

  if (mode === 'assessment' && assessment) {
    return (
      <>
        <h1 className="section-title dashboard-page__title">Your Photonic Age</h1>
        <p className="support dashboard-page__lede">
          Diagnostic score · {assessment.confidenceLabel} confidence · risk {assessment.riskLevel}
        </p>
        <PhosDashboardView assessment={assessment} />
        <AssessmentStatusPanels assessment={assessment} />
        <div className="copy-actions dashboard-page__actions">
          <Link href={`/protocol?id=${assessment.assessmentId}`} className="btn btn--outline">
            View protocol
          </Link>
          <Link href="/shop#protocol" className="btn btn--primary">
            Start your protocol →
          </Link>
        </div>
      </>
    )
  }

  return null
}

export function DashboardView() {
  return (
    <Suspense fallback={<p className="support">Loading your dashboard...</p>}>
      <DashboardContent />
    </Suspense>
  )
}
