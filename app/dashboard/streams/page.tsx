import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { DashboardPanel } from '@/components/dashboard/DashboardPanel'
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
          <div className="phos-dashboard">
            <DashboardPanel
              title="Upload nights"
              lede="Add Supabase env vars to enable live TipTraQ upload and processing."
            />
          </div>
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
        <div className="phos-dashboard">
          <DashboardPanel
            title="Upload nights"
            lede="Bind your kit serial for automated ingest, or use dev upload below."
          >
            <KitAssignPanel />
            <TipTraqUploadPanel />
            <article className="dash-card dash-tile dashboard-streams__history">
              <h2 className="display-md dashboard-streams__history-title">Uploaded nights</h2>
              <TipTraqNightList nights={snapshot.nights} canDelete />
            </article>
          </DashboardPanel>
        </div>
      </div>
    </section>
  )
}
