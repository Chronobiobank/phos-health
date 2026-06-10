import { NextRequest, NextResponse } from 'next/server'

import { calculateNightMLux } from '@/lib/mlux'
import { resolvePatientTimeZone } from '@/lib/patient/timezone'
import { createClient } from '@/lib/supabase/server'
import {
  extractNightDataFromEdf,
  getTipTraqUploadMaxBytes,
  mapEdfParseError,
} from '@/lib/tiptraq/edf-parser'
import {
  logPostgrestError,
  mapInsertError,
  resolveReportDate,
  summarizeDbValue,
  toNightInput,
} from '@/lib/tiptraq/extraction'
import { syncMLuxProfileForPatient } from '@/lib/tiptraq/sync-mlux-profile'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

/** EDF processing only — does not call Anthropic (ANTHROPIC_API_KEY not required). */
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

    const reportDate = resolveReportDate(extracted)
    const nightInput = toNightInput(extracted)
    const dlmoResult = calculateNightMLux(nightInput)

    const insertRow = {
      patient_id: user.id,
      report_date: reportDate,
      pdf_path: storagePath,
      recording_start: extracted.recording_start,
      recording_end: extracted.recording_end,
      trt_minutes: extracted.trt_minutes,
      signal_quality_pct: extracted.signal_quality_pct,
      sleep_onset: extracted.sleep_onset,
      sleep_offset: extracted.sleep_offset,
      sleep_latency_minutes: extracted.sleep_latency_minutes,
      tst_minutes: extracted.tst_minutes,
      waso_minutes: extracted.waso_minutes,
      sleep_efficiency_pct: extracted.sleep_efficiency_pct,
      rem_duration_minutes: extracted.rem_duration_minutes,
      rem_pct_tst: extracted.rem_pct_tst,
      nrem_duration_minutes: extracted.nrem_duration_minutes,
      first_rem_onset: extracted.first_rem_onset,
      ahi: extracted.ahi,
      ahi_severity: extracted.ahi_severity,
      rdi: extracted.rdi,
      odi_3pct: extracted.odi_3pct,
      odi_4pct: extracted.odi_4pct,
      t90_pct: extracted.t90_pct,
      min_spo2: extracted.min_spo2,
      mean_spo2: extracted.mean_spo2,
      hypoxic_burden: extracted.hypoxic_burden,
      event_count: extracted.event_count,
      mean_pr: extracted.mean_pr,
      min_pr: extracted.min_pr,
      max_pr: extracted.max_pr,
      sns_pct: extracted.sns_pct,
      pns_pct: extracted.pns_pct,
      snoring_minutes: extracted.snoring_minutes,
      algorithm_version: extracted.algorithm_version,
      mlux_phase_time: dlmoResult.proxy_dlmo_time,
      mlux_phase_minutes: dlmoResult.proxy_dlmo_minutes,
      dlmo_baseline_estimate: dlmoResult.baseline_estimate,
      dlmo_rem_correction_min: dlmoResult.rem_correction_min,
      dlmo_ans_correction_min: dlmoResult.ans_correction_min,
      dlmo_ahi_modifier_min: dlmoResult.ahi_modifier_min,
      confidence_score: dlmoResult.confidence_score,
      confidence_band_minutes: dlmoResult.confidence_band_minutes,
      confidence_label: dlmoResult.confidence_label,
      chronotype_signal: dlmoResult.chronotype_signal,
      non_dipper_flag: dlmoResult.non_dipper_flag,
      high_sympathetic_flag: dlmoResult.high_sympathetic_flag,
      rem_delay_flag: dlmoResult.rem_delay_flag,
      apnea_confound_flag: dlmoResult.apnea_confound_flag,
      extraction_model: String(extracted.algorithm_version ?? 'edf-channel-v1'),
    }

    console.info('[TipTraQ] EDF parsed — inserting tiptraq_nights row', {
      userId: user.id,
      storagePath,
      reportDate,
      patientTimeZone,
      edfType: extracted.algorithm_version,
      channelCount: Array.isArray(extracted.edf_channels) ? extracted.edf_channels.length : null,
      timeFields: {
        recording_start: summarizeDbValue(insertRow.recording_start),
        recording_end: summarizeDbValue(insertRow.recording_end),
        sleep_onset: summarizeDbValue(insertRow.sleep_onset),
        sleep_offset: summarizeDbValue(insertRow.sleep_offset),
        first_rem_onset: summarizeDbValue(insertRow.first_rem_onset),
        mlux_phase_time: summarizeDbValue(insertRow.mlux_phase_time),
        dlmo_baseline_estimate: summarizeDbValue(insertRow.dlmo_baseline_estimate),
      },
      keyMetrics: {
        tst_minutes: summarizeDbValue(insertRow.tst_minutes),
        ahi: summarizeDbValue(insertRow.ahi),
        rem_pct_tst: summarizeDbValue(insertRow.rem_pct_tst),
        hypoxic_burden: summarizeDbValue(insertRow.hypoxic_burden),
        confidence_score: summarizeDbValue(insertRow.confidence_score),
      },
    })

    const { error: insertError } = await supabase.from('tiptraq_nights').insert(insertRow)

    if (insertError) {
      logPostgrestError('tiptraq_nights insert failed', insertError, {
        userId: user.id,
        reportDate,
        storagePath,
        mappedClientMessage: mapInsertError(insertError.message),
        invalidFields: Object.fromEntries(
          Object.entries(insertRow).map(([key, value]) => [key, summarizeDbValue(value)])
        ),
      })
      return errorResponse(mapInsertError(insertError.message), 500)
    }

    console.info('[TipTraQ] tiptraq_nights insert succeeded', {
      userId: user.id,
      reportDate,
      storagePath,
    })

    const { error: syncError, rolling, calibration } = await syncMLuxProfileForPatient(
      supabase,
      user.id,
    )

    if (syncError || !rolling) {
      console.error('[TipTraQ] MLux profile sync failed after insert', {
        userId: user.id,
        reportDate,
        syncError,
      })
      return errorResponse(syncError ?? 'Failed to update body clock profile', 500)
    }

    return jsonResponse({
      success: true,
      night: {
        date: reportDate,
        dlmo_time: dlmoResult.proxy_dlmo_time,
        confidence_score: dlmoResult.confidence_score,
        confidence_label: dlmoResult.confidence_label,
        confidence_band_minutes: dlmoResult.confidence_band_minutes,
        chronotype_signal: dlmoResult.chronotype_signal,
        flags: {
          non_dipper: dlmoResult.non_dipper_flag,
          high_sympathetic: dlmoResult.high_sympathetic_flag,
          rem_delay: dlmoResult.rem_delay_flag,
          apnea_confound: dlmoResult.apnea_confound_flag,
        },
      },
      rolling: {
        nights_count: rolling.nights_count,
        dlmo_time: rolling.proxy_dlmo_time,
        confidence_score: rolling.confidence_score,
        confidence_label: rolling.confidence_label,
        confidence_band_minutes: rolling.confidence_band_minutes,
        chronotype: rolling.chronotype,
        dose_windows: {
          simvastatin: rolling.simvastatin_optimal,
          ramipril: rolling.ramipril_optimal,
          prednisolone: rolling.prednisolone_optimal,
          salmeterol: rolling.salmeterol_optimal,
          light_start: rolling.light_window_start,
          light_end: rolling.light_window_end,
        },
      },
      calibration: {
        gate: calibration.gate,
        displayLabel: calibration.displayLabel,
        nightsRemaining: calibration.nightsRemaining,
      },
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
