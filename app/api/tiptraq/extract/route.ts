import { NextRequest, NextResponse } from 'next/server'

import { resolvePatientTimeZone } from '@/lib/patient/timezone'
import { createClient } from '@/lib/supabase/server'
import {
  extractNightDataFromEdf,
  getTipTraqUploadMaxBytes,
  mapEdfParseError,
} from '@/lib/tiptraq/edf-parser'
import { photonicCalibration } from '@/lib/tiptraq/sync-mlux-profile'
import { processTipTraqNight } from '@/lib/tiptraq/process-night'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

/** Dev/MVP self-upload path. Production ingest uses POST /api/ingest/tiptraq. */
function jsonResponse(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function errorResponse(message: string, status: number) {
  return jsonResponse({ success: false, error: message }, status)
}

function isOwnedStoragePath(userId: string, storagePath: string): boolean {
  return storagePath.startsWith(`${userId}/`) && !storagePath.includes('..')
}

async function parseRequestBody(
  request: NextRequest
): Promise<{ storagePath?: string } | NextResponse> {
  const contentType = request.headers.get('content-type') ?? ''
  const contentLength = Number(request.headers.get('content-length') ?? 0)

  if (contentLength > 4096) {
    return errorResponse(
      'Request body too large. Upload the EDF to Supabase storage first, then POST only { "storagePath": "..." }.',
      413
    )
  }

  if (contentType.includes('multipart/form-data')) {
    return errorResponse(
      'Do not upload the EDF file to this endpoint. Upload to storage first, then send JSON: { "storagePath": "..." }.',
      400
    )
  }

  let raw = ''
  try {
    raw = await request.text()
  } catch (readError) {
    console.error('TipTraQ extract body read error:', readError)
    return errorResponse('Could not read request body', 400)
  }

  if (!raw.trim()) {
    return errorResponse('Missing request body. Expected JSON: { "storagePath": "user-id/timestamp-tiptraq.edf" }', 400)
  }

  try {
    return JSON.parse(raw) as { storagePath?: string }
  } catch (parseError) {
    console.error('TipTraQ extract JSON parse error:', parseError)
    if (/request entity too large|payload too large/i.test(raw)) {
      return errorResponse(
        'Request body too large. Upload the EDF via /api/tiptraq/signed-upload, not directly to /api/tiptraq/extract.',
        413
      )
    }
    return errorResponse('Invalid JSON body. Expected { "storagePath": "..." }', 400)
  }
}

export async function POST(request: NextRequest) {
  try {
    const parsed = await parseRequestBody(request)
    if (parsed instanceof NextResponse) {
      return parsed
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return errorResponse('Unauthorised', 401)
    }

    const storagePath = parsed.storagePath?.trim()

    if (!storagePath) {
      return errorResponse('Missing uploaded file reference (storagePath)', 400)
    }

    if (!isOwnedStoragePath(user.id, storagePath)) {
      return errorResponse('Invalid file path', 400)
    }

    const { data: storedFile, error: downloadError } = await supabase.storage
      .from('tiptraq-reports')
      .download(storagePath)

    if (downloadError || !storedFile) {
      console.error('Storage download error:', downloadError)
      return errorResponse('Could not read uploaded EDF file', 404)
    }

    const fileBytes = await storedFile.arrayBuffer()
    if (fileBytes.byteLength > getTipTraqUploadMaxBytes()) {
      return errorResponse('EDF file must be under 50MB', 400)
    }

    const { data: patientProfile } = await supabase
      .from('patient_profiles')
      .select('location_city, location_country')
      .eq('id', user.id)
      .maybeSingle<{ location_city: string | null; location_country: string | null }>()

    const patientTimeZone = resolvePatientTimeZone(
      patientProfile?.location_city,
      patientProfile?.location_country
    )

    let extracted: Record<string, unknown>
    try {
      extracted = extractNightDataFromEdf(fileBytes, { timeZone: patientTimeZone })
    } catch (parseError) {
      const message = parseError instanceof Error ? parseError.message : 'Could not parse EDF file'
      console.error('EDF parse error:', message)
      return errorResponse(mapEdfParseError(message), 422)
    }

    const result = await processTipTraqNight(supabase, user.id, extracted, {
      storagePath,
      ingestSource: 'edf-self-upload',
    })

    if (!result.success) {
      return errorResponse(result.error ?? 'Failed to process night', 500)
    }

    return jsonResponse({
      success: true,
      night: {
        date: result.reportDate,
        confidence_score: result.rolling?.confidence_score,
        confidence_label: result.rolling?.confidence_label,
        confidence_band_minutes: result.rolling?.confidence_band_minutes,
      },
      rolling: result.rolling ?? null,
      calibration: photonicCalibration(result.nightsCount ?? 0),
    })
  } catch (error) {
    console.error('TipTraQ EDF pipeline error:', error)

    if (error instanceof Error) {
      if (error.message.startsWith('Report is missing') || error.message.startsWith('Report has an invalid')) {
        return errorResponse(error.message, 422)
      }
    }

    return errorResponse('Internal server error', 500)
  }
}
