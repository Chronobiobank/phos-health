import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { mapStorageUploadError } from '@/lib/tiptraq/extraction'

export const dynamic = 'force-dynamic'

export async function POST() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 })
  }

  const storagePath = `${user.id}/${Date.now()}-tiptraq.edf`

  const { data, error } = await supabase.storage
    .from('tiptraq-reports')
    .createSignedUploadUrl(storagePath)

  if (error || !data) {
    return NextResponse.json(
      { success: false, error: mapStorageUploadError(error?.message ?? 'Could not prepare upload') },
      { status: 500 },
    )
  }

  return NextResponse.json({
    success: true,
    storagePath,
    signedUrl: data.signedUrl,
    token: data.token,
  })
}
