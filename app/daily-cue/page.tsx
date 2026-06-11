import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { DailyCueCompanion } from '@/components/daily-cue/DailyCueCompanion'
import { buildPhosSnapshot, isSupabaseConfigured } from '@/lib/phos/build-snapshot'
import { TERRY_MOCK_SNAPSHOT } from '@/lib/phos/mock-snapshot'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Daily Cue · PHOS',
  description: 'Daily cues and Light Time for your body clock.',
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
        <h1 className="section-title dashboard-page__title">Your daily cues</h1>
        <p className="support dashboard-page__lede">Light Time and prompts for today.</p>
        <DailyCueCompanion snapshot={snapshot} />
      </div>
    </section>
  )
}
