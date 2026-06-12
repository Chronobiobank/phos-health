import type { Metadata } from 'next'

import { DashboardView } from '@/components/dashboard/DashboardView'
import { buildPhosSnapshot, isSupabaseConfigured } from '@/lib/phos/build-snapshot'
import { TERRY_MOCK_SNAPSHOT } from '@/lib/phos/mock-snapshot'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Dashboard · PHOS Circadian Health',
  description: 'Your Photonic Age, confidence band, and daily cues.',
}

type DashboardPageProps = {
  searchParams: Promise<{ id?: string }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { id: assessmentId } = await searchParams

  let signedIn = false
  let initialSnapshot = TERRY_MOCK_SNAPSHOT

  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    signedIn = Boolean(user)

    if (user) {
      initialSnapshot = await buildPhosSnapshot(supabase, user.id, true)
    }
  }

  return (
    <section className="dashboard-page">
      <div className="container dashboard-page__content">
        <DashboardView
          signedIn={signedIn}
          initialSnapshot={initialSnapshot}
          assessmentId={assessmentId ?? null}
        />
      </div>
    </section>
  )
}
