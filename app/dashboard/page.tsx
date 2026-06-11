import type { Metadata } from 'next'

import { PhosDashboardView } from '@/components/dashboard/PhosDashboardView'
import { buildPhosSnapshot, isSupabaseConfigured } from '@/lib/phos/build-snapshot'
import { TERRY_MOCK_SNAPSHOT } from '@/lib/phos/mock-snapshot'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Dashboard · PHOS Circadian Health',
  description: 'Your Photonic Age, confidence band, and daily cues.',
}

export default async function DashboardPage() {
  const configured = isSupabaseConfigured()
  let snapshot = { ...TERRY_MOCK_SNAPSHOT, canUpload: false }

  if (configured) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    snapshot = await buildPhosSnapshot(supabase, user?.id ?? '', Boolean(user))
  }

  return (
    <section className="dashboard-page">
      <div className="container dashboard-page__content">
        <h1 className="section-title dashboard-page__title">Your Photonic Age</h1>
        <p className="support dashboard-page__lede">
          {snapshot.isSample
            ? 'Sample dashboard until you connect your health app.'
            : snapshot.hasPhoneData
              ? `Free tier score from synced sleep history.`
              : `${snapshot.nightsCount} sleep study nights processed.`}
        </p>
        <PhosDashboardView snapshot={snapshot} />
      </div>
    </section>
  )
}
