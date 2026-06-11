import { NextResponse } from 'next/server'

import {
  grantResearchConsent,
  syncResearchContribution,
} from '@/lib/chronobiobank/consent'
import { ensureMemberRecord } from '@/lib/phos/sync-photonic-profile'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
  }

  await ensureMemberRecord(supabase, user.id, user.user_metadata?.full_name as string | undefined)

  const { error: consentError } = await grantResearchConsent(supabase, user.id)
  if (consentError) {
    return NextResponse.json({ error: consentError }, { status: 500 })
  }

  let admin
  try {
    admin = createAdminClient()
  } catch {
    return NextResponse.json(
      { error: 'Chronobiobank sync is not configured. Add SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 503 },
    )
  }

  const { error: syncError, synced } = await syncResearchContribution(admin, user.id)
  if (syncError) {
    return NextResponse.json({ error: syncError }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    synced,
    message: synced
      ? 'You joined Chronobiobank. Your de-identified data is in the commons.'
      : 'Consent saved. Connect your health app to contribute your first snapshot.',
  })
}
