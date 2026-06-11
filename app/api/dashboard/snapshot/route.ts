import { NextResponse } from 'next/server'

import { buildPhosSnapshot, isSupabaseConfigured } from '@/lib/phos/build-snapshot'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Dashboard storage is not configured.' }, { status: 503 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
  }

  const snapshot = await buildPhosSnapshot(supabase, user.id, true)
  return NextResponse.json(snapshot)
}
