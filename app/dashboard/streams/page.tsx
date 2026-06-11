import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { KitAssignPanel } from '@/components/dashboard/KitAssignPanel'
import { TipTraqNightList } from '@/components/dashboard/TipTraqNightList'
import { TipTraqUploadPanel } from '@/components/dashboard/TipTraqUploadPanel'
import { buildPhosSnapshot, isSupabaseConfigured } from '@/lib/phos/build-snapshot'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Upload nights · PHOS Dashboard',
  description: 'Upload TipTraQ EDF files for Photonic Age processing.',
}

export default async function DashboardStreamsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <section className="dashboard-page">
        <div className="container dashboard-page__content">
          <h1 className="section-title dashboard-page__title">Upload nights</h1>
          <p className="support">
            Add Supabase env vars to enable live TipTraQ upload and processing.
          </p>
        </div>
      </section>
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin?next=/dashboard/streams')
  }

  const snapshot = await buildPhosSnapshot(supabase, user.id, true)

  return (
    <section className="dashboard-page">
      <div className="container dashboard-page__content">
        <h1 className="section-title dashboard-page__title">Upload nights</h1>
        <p className="support">Bind your kit serial for automated ingest, or use dev upload below.</p>

        <KitAssignPanel />

        <TipTraqUploadPanel />

        <div className="dashboard-streams__history">
          <h2 className="display-md dashboard-streams__history-title">Uploaded nights</h2>
          <TipTraqNightList nights={snapshot.nights} canDelete />
        </div>
      </div>
    </section>
  )
}
