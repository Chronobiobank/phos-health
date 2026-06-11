import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

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
          <h1 className="section-title dashboard-page__title">Employer cohort</h1>
          <p className="support">Add Supabase env vars to enable the employer dashboard.</p>
          <OrgDashboardView snapshot={DEMO_ORG_AGGREGATE} role="viewer" />
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
        <p className="eyebrow">Employer dashboard</p>
        <h1 className="section-title dashboard-page__title">{snapshot.organisationName}</h1>
        <p className="support dashboard-page__lede">
          Participation, cohort Photonic Age shift, and savings. Aggregate only.
        </p>
        <OrgDashboardView snapshot={snapshot} role={role} inviteCode={inviteCode} />
      </div>
    </section>
  )
}
