import type { SupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

import { recomputeOrgAggregates } from '@/lib/org/compute-aggregates'
import { ensureMemberRecord } from '@/lib/phos/sync-photonic-profile'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type JoinBody = {
  code?: string
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
  }

  let body: JoinBody = {}
  try {
    body = (await request.json()) as JoinBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const code = body.code?.trim().toUpperCase()
  if (!code) {
    return NextResponse.json({ error: 'Missing organisation invite code.' }, { status: 400 })
  }

  await ensureMemberRecord(supabase, user.id, user.user_metadata?.full_name as string | undefined)

  let inviteClient: SupabaseClient = supabase
  try {
    inviteClient = createAdminClient()
  } catch {
    // Fall back to user client when admin is unavailable (dev without service role).
  }

  const { data: invite, error: inviteError } = await inviteClient
    .from('org_invite_codes')
    .select('organisation_id, active')
    .eq('code', code)
    .maybeSingle()

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 500 })
  }

  if (!invite?.active) {
    return NextResponse.json({ error: 'Invite code is invalid or expired.' }, { status: 404 })
  }

  const { error: memberError } = await supabase
    .from('members')
    .update({ organisation_id: invite.organisation_id })
    .eq('id', user.id)

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 })
  }

  const { error: consentError } = await supabase.from('consents').upsert(
    {
      member_id: user.id,
      consent_type: 'employer_aggregate',
      granted: true,
      granted_at: new Date().toISOString(),
      revoked_at: null,
    },
    { onConflict: 'member_id,consent_type' },
  )

  if (consentError) {
    return NextResponse.json({ error: consentError.message }, { status: 500 })
  }

  try {
    const admin = createAdminClient()
    await recomputeOrgAggregates(admin, invite.organisation_id)
  } catch {
    // Non-blocking if admin credentials are missing in dev.
  }

  const { data: org } = await supabase
    .from('organisations')
    .select('name')
    .eq('id', invite.organisation_id)
    .maybeSingle()

  return NextResponse.json({
    ok: true,
    organisation_id: invite.organisation_id,
    organisation_name: org?.name ?? 'Your organisation',
    message: 'You joined your employer programme. Cohort data stays anonymised.',
  })
}
