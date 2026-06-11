'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

import { AssessmentStatusPanels } from '@/components/dashboard/AssessmentStatusPanels'
import { PhosDashboardView } from '@/components/dashboard/PhosDashboardView'
import {
  loadAssessmentSession,
  saveAssessmentSession,
  type AssessmentSessionPayload,
} from '@/lib/assessments/session'

function DashboardContent() {
  const searchParams = useSearchParams()
  const [assessment, setAssessment] = useState<AssessmentSessionPayload | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadDashboard() {
      const id = searchParams.get('id')

      if (id) {
        try {
          const response = await fetch(`/api/assessments/${id}`)
          if (!response.ok) {
            if (!cancelled) setLoading(false)
            return
          }

          const payload = (await response.json()) as AssessmentSessionPayload
          if (!cancelled) {
            saveAssessmentSession(payload)
            setAssessment(payload)
            setLoading(false)
          }
        } catch {
          if (!cancelled) setLoading(false)
        }
        return
      }

      const session = loadAssessmentSession()
      if (!cancelled) {
        setAssessment(session)
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

  if (!assessment) {
    return (
      <>
        <h1 className="section-title dashboard-page__title">Your Photonic Age</h1>
        <p className="support dashboard-page__lede">Complete the diagnostic to load your dashboard.</p>
        <div className="copy-actions dashboard-page__actions">
          <Link href="/score" className="btn btn--primary">
            Start diagnostic
          </Link>
        </div>
      </>
    )
  }

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

export function DashboardView() {
  return (
    <Suspense fallback={<p className="support">Loading your dashboard...</p>}>
      <DashboardContent />
    </Suspense>
  )
}
