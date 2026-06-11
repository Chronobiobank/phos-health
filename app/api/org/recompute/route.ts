import { NextResponse } from 'next/server'

import { recomputeOrgAggregates } from '@/lib/org/compute-aggregates'
import { getEmployerContext } from '@/lib/org/employer-context'
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

  const context = await getEmployerContext(supabase, user.id)
  if (!context) {
    return NextResponse.json({ error: 'Employer access required.' }, { status: 403 })
  }

  if (context.role !== 'admin') {
    return NextResponse.json({ error: 'Admin role required to refresh aggregates.' }, { status: 403 })
  }

  let admin
  try {
    admin = createAdminClient()
  } catch {
    return NextResponse.json({ error: 'Aggregate refresh is not configured.' }, { status: 503 })
  }

  const { error } = await recomputeOrgAggregates(admin, context.organisationId)
  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json({ ok: true, organisation_id: context.organisationId })
}
