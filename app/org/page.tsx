import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { DashboardPanel } from '@/components/dashboard/DashboardPanel'
import { OrgDashboardView } from '@/components/org/OrgDashboardView'
import { loadOrgDashboardForUser, tryCreateAdminClient } from '@/lib/org/load-org-dashboard'
import { isSupabaseConfigured } from '@/lib/phos/build-snapshot'
import { DEMO_ORG_AGGREGATE } from '@/lib/org/compute-aggregates'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Employer cohort · PHOS',
  description: 'Anonymised workforce Photonic Age and savings rollups.',
}

export default async function OrgPage() {
  if (!isSupabaseConfigured()) {
    return (
      <section className="dashboard-page org-page">
        <div className="container dashboard-page__content">
          <div className="phos-dashboard">
            <DashboardPanel
              title="Employer cohort"
              lede="Add Supabase env vars to enable the employer dashboard."
            >
              <OrgDashboardView snapshot={DEMO_ORG_AGGREGATE} role="viewer" />
            </DashboardPanel>
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
    redirect('/auth/signin?next=/org')
  }

  const admin = tryCreateAdminClient()
  const { snapshot, role, inviteCode } = await loadOrgDashboardForUser(supabase, admin, user.id)

  return (
    <section className="dashboard-page org-page">
      <div className="container dashboard-page__content">
        <div className="phos-dashboard">
          <DashboardPanel
            eyebrow="Employer dashboard"
            title={snapshot.organisationName}
            lede="Participation, cohort Photonic Age shift, and savings. Aggregate only."
          >
            <OrgDashboardView snapshot={snapshot} role={role} inviteCode={inviteCode} />
          </DashboardPanel>
        </div>
      </div>
    </section>
  )
}
