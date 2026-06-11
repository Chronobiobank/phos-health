import { NextResponse } from 'next/server'

import { generateDemoObservations } from '@/lib/phos/engine/phone'
import type { PhoneObservation } from '@/lib/phos/engine/types'
import {
  ensureMemberRecord,
  recomputePhotonicProfile,
  storePhoneObservations,
} from '@/lib/phos/sync-photonic-profile'
import { createClient } from '@/lib/supabase/server'

type SyncSource = 'apple_healthkit' | 'google_health_connect' | 'demo'

type SyncBody = {
  source?: SyncSource
  observations?: PhoneObservation[]
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
  }

  let body: SyncBody = {}
  try {
    body = (await request.json()) as SyncBody
  } catch {
    body = {}
  }

  const source: SyncSource = body.source ?? 'demo'
  const observations =
    body.observations?.length && source !== 'demo'
      ? body.observations
      : generateDemoObservations(90)

  await ensureMemberRecord(supabase, user.id, user.user_metadata?.full_name as string | undefined)
  await storePhoneObservations(supabase, user.id, source, observations)

  const { error } = await recomputePhotonicProfile(supabase, user.id)
  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  const { data: profile } = await supabase
    .from('photonic_age_profiles')
    .select('photonic_age, lost_light_years, confidence_score, confidence_label, tier')
    .eq('member_id', user.id)
    .maybeSingle()

  return NextResponse.json({
    ok: true,
    source,
    observationCount: observations.length,
    profile,
  })
}
