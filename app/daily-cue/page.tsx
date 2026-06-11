import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { DailyCueCompanion } from '@/components/daily-cue/DailyCueCompanion'
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
        <p className="eyebrow">Daily Cue</p>
        <h1 className="section-title dashboard-page__title">Light Time for today</h1>
        <DailyCueCompanion snapshot={snapshot} />
      </div>
    </section>
  )
}
