import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { HealthConnectPanel } from '@/components/onboarding/HealthConnectPanel'
import { isSupabaseConfigured } from '@/lib/phos/build-snapshot'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Connect your health app · PHOS',
  description: 'Connect Apple Health or Google Health Connect for your Free-tier Photonic Age.',
}

export default async function OnboardingPage() {
  if (!isSupabaseConfigured()) {
    return (
      <section className="dashboard-page onboarding-page">
        <div className="container dashboard-page__content">
          <h1 className="section-title dashboard-page__title">Connect your health app</h1>
          <p className="support">Add Supabase env vars to enable onboarding and live sync.</p>
        </div>
      </section>
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin?next=/onboarding')
  }

  const { data: profile } = await supabase
    .from('photonic_age_profiles')
    .select('member_id')
    .eq('member_id', user.id)
    .maybeSingle()

  if (profile) {
    redirect('/dashboard')
  }

  return (
    <section className="dashboard-page onboarding-page">
      <div className="container dashboard-page__content">
        <p className="eyebrow">Free tier</p>
        <h1 className="section-title dashboard-page__title">Connect your health app</h1>
        <HealthConnectPanel />
      </div>
    </section>
  )
}
