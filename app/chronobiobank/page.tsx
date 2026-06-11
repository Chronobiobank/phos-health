import type { Metadata } from 'next'

import { ChronobiobankOptInPanel } from '@/components/chronobiobank/ChronobiobankOptInPanel'
import { loadChronobiobankState } from '@/lib/chronobiobank/consent'
import type { ChronobiobankMemberState } from '@/lib/chronobiobank/types'
import { isSupabaseConfigured } from '@/lib/phos/build-snapshot'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Chronobiobank · PHOS',
  description: 'Opt in to the member-owned light health commons.',
}

const EMPTY_STATE: ChronobiobankMemberState = {
  consent: { granted: false, grantedAt: null, revokedAt: null },
  contribution: {
    active: false,
    pseudonymId: null,
    contributedAt: null,
    withdrawnAt: null,
    tier: null,
  },
}

export default async function ChronobiobankPage() {
  let signedIn = false
  let state = EMPTY_STATE

  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    signedIn = Boolean(user)
    if (user) {
      state = await loadChronobiobankState(supabase, user.id)
    }
  }

  return (
    <section className="dashboard-page chronobiobank-page">
      <div className="container dashboard-page__content">
        <p className="eyebrow">Research commons</p>
        <h1 className="section-title dashboard-page__title">Chronobiobank</h1>
        <p className="lede chronobiobank-page__lede">
          Member-owned light health commons, held by charity, never sold to anyone.
        </p>

        <div className="chronobiobank-page__blocks">
          <article className="dash-card chronobiobank-page__block">
            <h2 className="display-md">What it is</h2>
            <p className="support">
              Researchers license findings inside a controlled vault. Your records never leave.
            </p>
          </article>

          <article className="dash-card chronobiobank-page__block">
            <h2 className="display-md">What you contribute</h2>
            <p className="support">
              De-identified Photonic Age metrics only. Never your name or employer.
            </p>
          </article>

          <article className="dash-card chronobiobank-page__block">
            <h2 className="display-md">Why it matters</h2>
            <p className="support">
              Licence revenue funds free access. Your data stays charity-side, never corporate.
            </p>
          </article>
        </div>

        <ChronobiobankOptInPanel state={state} signedIn={signedIn} />
      </div>
    </section>
  )
}
