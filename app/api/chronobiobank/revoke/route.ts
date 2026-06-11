import { NextResponse } from 'next/server'

import { revokeResearchConsent } from '@/lib/chronobiobank/consent'
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

  try {
    const admin = createAdminClient()
    const { error } = await revokeResearchConsent(admin, user.id)
    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }
  } catch {
    const { error } = await revokeResearchConsent(supabase, user.id)
    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }
  }

  return NextResponse.json({
    ok: true,
    message: 'Chronobiobank consent revoked. Your contribution was withdrawn from the pool.',
  })
}
