import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { OrgJoinPanel } from '@/components/org/OrgJoinPanel'
import { isSupabaseConfigured } from '@/lib/phos/build-snapshot'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Join employer programme · PHOS',
  description: 'Join your firm programme with an invite code.',
}

export default async function OrgJoinPage() {
  if (!isSupabaseConfigured()) {
    return (
      <section className="dashboard-page org-page">
        <div className="container dashboard-page__content">
          <h1 className="section-title dashboard-page__title">Join your employer programme</h1>
          <p className="support">Add Supabase env vars to enable organisation join.</p>
        </div>
      </section>
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin?next=/org/join')
  }

  return (
    <section className="dashboard-page org-page">
      <div className="container dashboard-page__content">
        <p className="eyebrow">Employer programme</p>
        <h1 className="section-title dashboard-page__title">Join your firm</h1>
        <OrgJoinPanel />
      </div>
    </section>
  )
}
