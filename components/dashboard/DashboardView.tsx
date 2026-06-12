'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

import { AssessmentStatusPanels } from '@/components/dashboard/AssessmentStatusPanels'
import { DashboardPanel } from '@/components/dashboard/DashboardPanel'
import { PhosDashboardView } from '@/components/dashboard/PhosDashboardView'
import { TipTraqDashboardView } from '@/components/dashboard/TipTraqDashboardView'
import {
  clearAssessmentSession,
  loadAssessmentSession,
  saveAssessmentSession,
  type AssessmentSessionPayload,
} from '@/lib/assessments/session'
import type { PhosSnapshot } from '@/lib/phos/types'

type DashboardMode = 'assessment' | 'live' | 'empty' | 'unauthenticated'

type DashboardViewProps = {
  signedIn: boolean
  initialSnapshot: PhosSnapshot | null
  assessmentId: string | null
}

function isRenderableSnapshot(snapshot: PhosSnapshot | null | undefined): snapshot is PhosSnapshot {
  return snapshot != null && typeof snapshot.photonicAge === 'number'
}

function LoadingPanel() {
  return (
    <div className="phos-dashboard">
      <DashboardPanel title="Your Photonic Age" lede="Loading your dashboard..." />
    </div>
  )
}

function LiveDashboard({ snapshot, signedIn }: { snapshot: PhosSnapshot; signedIn: boolean }) {
  const nightsLine =
    snapshot.nightsCount > 0
      ? `${snapshot.nightsCount} sleep study nights processed.`
      : snapshot.isSample
        ? 'Preview dashboard. Sign in for your live TipTraQ score.'
        : 'Phone data synced. Upload nights or upgrade for tighter confidence.'

  return (
    <div className="phos-dashboard">
      <TipTraqDashboardView snapshot={snapshot} lede={nightsLine} />
      {!signedIn ? (
        <DashboardPanel
          title="Your account"
          lede="Sign in to load your nights and save your score."
          footer={
            <Link href="/auth/signin?next=/dashboard" className="btn btn--primary">
              Sign in →
            </Link>
          }
        />
      ) : (
        <AssessmentStatusPanels tipTraqNights={snapshot.nightsCount} />
      )}
    </div>
  )
}

function AssessmentDashboard({ assessment }: { assessment: AssessmentSessionPayload }) {
  return (
    <div className="phos-dashboard">
      <PhosDashboardView
        assessment={assessment}
        lede={`Diagnostic score · ${assessment.confidenceLabel} confidence · risk ${assessment.riskLevel}`}
      />
      <AssessmentStatusPanels assessment={assessment} />
      <DashboardPanel
        title="Your protocol"
        lede="View your plan or start supplements from the shop."
        footer={
          <>
            <Link href={`/protocol?id=${assessment.assessmentId}`} className="btn btn--outline">
              View protocol
            </Link>
            <Link href="/shop#protocol" className="btn btn--primary">
              Start your protocol →
            </Link>
          </>
        }
      />
    </div>
  )
}

function DashboardContent({ signedIn, initialSnapshot, assessmentId }: DashboardViewProps) {
  const searchParams = useSearchParams()
  const resolvedAssessmentId = assessmentId ?? searchParams.get('id')

  const [mode, setMode] = useState<DashboardMode>(() => {
    if (isRenderableSnapshot(initialSnapshot)) return 'live'
    if (resolvedAssessmentId) return 'empty'
    const session = loadAssessmentSession()
    if (session) return 'assessment'
    return 'unauthenticated'
  })

  const [snapshot, setSnapshot] = useState<PhosSnapshot | null>(
    isRenderableSnapshot(initialSnapshot) ? initialSnapshot : null,
  )
  const [assessment, setAssessment] = useState<AssessmentSessionPayload | null>(() => {
    if (isRenderableSnapshot(initialSnapshot) || resolvedAssessmentId) return null
    return loadAssessmentSession()
  })

  const needsClientLoad =
    signedIn && !isRenderableSnapshot(initialSnapshot) && Boolean(resolvedAssessmentId || signedIn)
  const [loading, setLoading] = useState(needsClientLoad)

  useEffect(() => {
    if (isRenderableSnapshot(initialSnapshot)) return

    let cancelled = false

    async function loadDashboard() {
      if (signedIn) {
        try {
          const snapshotResponse = await fetch('/api/dashboard/snapshot')
          if (snapshotResponse.ok) {
            const liveSnapshot = (await snapshotResponse.json()) as PhosSnapshot
            if (!cancelled && isRenderableSnapshot(liveSnapshot)) {
              clearAssessmentSession()
              setSnapshot(liveSnapshot)
              setAssessment(null)
              setMode('live')
              return
            }
          }
        } catch {
          // Fall through.
        }
      }

      if (resolvedAssessmentId) {
        try {
          const response = await fetch(`/api/assessments/${resolvedAssessmentId}`)
          if (response.ok) {
            const payload = (await response.json()) as AssessmentSessionPayload
            if (!cancelled) {
              saveAssessmentSession(payload)
              setAssessment(payload)
              setSnapshot(null)
              setMode('assessment')
            }
            return
          }
        } catch {
          // Fall through.
        }
      }

      if (!cancelled) {
        const session = loadAssessmentSession()
        if (session) {
          setAssessment(session)
          setSnapshot(null)
          setMode('assessment')
        } else if (!signedIn) {
          setMode('unauthenticated')
        } else {
          setMode('empty')
        }
      }
    }

    void loadDashboard().finally(() => {
      if (!cancelled) setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [initialSnapshot, resolvedAssessmentId, signedIn])

  if (loading) {
    return <LoadingPanel />
  }

  if (mode === 'unauthenticated') {
    return (
      <div className="phos-dashboard">
        <DashboardPanel
          title="Your Photonic Age"
          lede="Sign in to load your TipTraQ nights and score."
          footer={
            <Link href="/auth/signin?next=/dashboard" className="btn btn--primary">
              Sign in →
            </Link>
          }
        />
      </div>
    )
  }

  if (mode === 'empty') {
    return (
      <div className="phos-dashboard">
        <DashboardPanel
          title="Your Photonic Age"
          lede="Sign in to see TipTraQ nights, or complete the diagnostic for your score."
          footer={
            <>
              <Link href="/auth/signin?next=/dashboard" className="btn btn--outline">
                Sign in
              </Link>
              <Link href="/score" className="btn btn--primary">
                Start diagnostic
              </Link>
            </>
          }
        />
      </div>
    )
  }

  if (mode === 'live' && snapshot) {
    return <LiveDashboard snapshot={snapshot} signedIn={signedIn} />
  }

  if (mode === 'assessment' && assessment) {
    return <AssessmentDashboard assessment={assessment} />
  }

  return null
}

export function DashboardView(props: DashboardViewProps) {
  return (
    <Suspense fallback={<LoadingPanel />}>
      <DashboardContent {...props} />
    </Suspense>
  )
}
