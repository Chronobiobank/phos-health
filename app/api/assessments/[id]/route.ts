import { NextResponse } from 'next/server'

import { sessionFromAssessmentRow } from '@/lib/assessments/row-to-session'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Assessment storage is not configured.' }, { status: 503 })
  }

  const { id } = await context.params
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: 'Invalid assessment id.' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase.from('phos_assessments').select('*').eq('id', id).maybeSingle()

  if (error) {
    console.error('phos_assessments fetch failed', error.code, error.message)
    return NextResponse.json({ error: 'Could not load assessment.' }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: 'Assessment not found.' }, { status: 404 })
  }

  return NextResponse.json(sessionFromAssessmentRow(id, data))
}
