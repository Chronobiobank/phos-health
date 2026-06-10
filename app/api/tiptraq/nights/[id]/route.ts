import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { mapTipTraqDeleteError, syncMLuxProfileForPatient } from '@/lib/tiptraq/sync-mlux-profile'

export const dynamic = 'force-dynamic'

const TIPTRAQ_BUCKET = 'tiptraq-reports'

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status })
}

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return errorResponse('Unauthorised', 401)
    }

    const { data: night, error: fetchError } = await supabase
      .from('tiptraq_nights')
      .select('id, patient_id, pdf_path')
      .eq('id', id)
      .eq('patient_id', user.id)
      .maybeSingle<{ id: string; patient_id: string; pdf_path: string | null }>()

    if (fetchError) {
      console.error('TipTraQ night fetch error:', fetchError)
      return errorResponse(mapTipTraqDeleteError(fetchError.message), 500)
    }

    if (!night) {
      return errorResponse('Recording not found', 404)
    }

    if (night.pdf_path) {
      const { error: storageError } = await supabase.storage.from(TIPTRAQ_BUCKET).remove([night.pdf_path])
      if (storageError) {
        console.error('TipTraQ storage delete error:', storageError)
      }
    }

    const { error: deleteError } = await supabase.from('tiptraq_nights').delete().eq('id', night.id)

    if (deleteError) {
      console.error('TipTraQ night delete error:', deleteError)
      return errorResponse(mapTipTraqDeleteError(deleteError.message), 500)
    }

    const { error: syncError } = await syncMLuxProfileForPatient(supabase, user.id)

    if (syncError) {
      console.error('MLux profile sync error after delete:', syncError)
      return errorResponse(syncError, 500)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('TipTraQ delete error:', error)
    return errorResponse('Could not delete this recording', 500)
  }
}
