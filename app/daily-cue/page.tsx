import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { DailyCueCompanion } from '@/components/daily-cue/DailyCueCompanion'
import { DashboardPanel } from '@/components/dashboard/DashboardPanel'
import { buildPhosSnapshot, isSupabaseConfigured } from '@/lib/phos/build-snapshot'
import { TERRY_MOCK_SNAPSHOT } from '@/lib/phos/mock-snapshot'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Daily Cue · PHOS',
  description: 'Light Time and body clock prompts.',
}

export default async function DailyCuePage() {
  let snapshot = { ...TERRY_MOCK_SNAPSHOT, canUpload: false }

  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect('/auth/signin?next=/daily-cue')
    }

    snapshot = await buildPhosSnapshot(supabase, user.id, true)
  }

  return (
    <section className="dashboard-page daily-cue-page">
      <div className="container dashboard-page__content">
        <div className="phos-dashboard">
          <DashboardPanel eyebrow="Daily Cue" title="Light Time for today">
            <DailyCueCompanion snapshot={snapshot} />
          </DashboardPanel>
        </div>
      </div>
    </section>
  )
}
