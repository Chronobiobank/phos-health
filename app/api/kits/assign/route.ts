import { NextResponse } from 'next/server'

import { ensureMemberRecord } from '@/lib/phos/sync-photonic-profile'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type AssignBody = {
  serial?: string
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Sign in required.' }, { status: 401 })
  }

  let body: AssignBody = {}
  try {
    body = (await request.json()) as AssignBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 })
  }

  const serial = body.serial?.trim().toUpperCase()
  if (!serial) {
    return NextResponse.json({ error: 'Missing kit serial.' }, { status: 400 })
  }

  await ensureMemberRecord(supabase, user.id, user.user_metadata?.full_name as string | undefined)

  const { data: kit, error: kitError } = await supabase
    .from('kits')
    .select('id, serial, kit_type, status')
    .eq('serial', serial)
    .maybeSingle()

  if (kitError) {
    return NextResponse.json({ error: kitError.message }, { status: 500 })
  }

  if (!kit) {
    return NextResponse.json({ error: `Kit ${serial} is not registered.` }, { status: 404 })
  }

  const { data: existingAssignment } = await supabase
    .from('kit_assignments')
    .select('member_id')
    .eq('kit_id', kit.id)
    .is('unassigned_at', null)
    .maybeSingle()

  if (existingAssignment && existingAssignment.member_id !== user.id) {
    return NextResponse.json({ error: 'This kit is already assigned to another member.' }, { status: 409 })
  }

  if (!existingAssignment) {
    const { error: assignError } = await supabase.from('kit_assignments').insert({
      kit_id: kit.id,
      member_id: user.id,
    })

    if (assignError) {
      return NextResponse.json({ error: assignError.message }, { status: 500 })
    }
  }

  await supabase.from('kits').update({ status: 'assigned' }).eq('id', kit.id)

  return NextResponse.json({
    ok: true,
    serial: kit.serial,
    kit_type: kit.kit_type,
    member_id: user.id,
  })
}
