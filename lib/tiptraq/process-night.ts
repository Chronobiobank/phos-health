import type { SupabaseClient } from '@supabase/supabase-js'

import { calculateNightMLux } from '@/lib/mlux'
import { loadMemberLocation } from '@/lib/patient/member-location'
import { recomputePhotonicProfile } from '@/lib/phos/sync-photonic-profile'
import {
  logPostgrestError,
  mapInsertError,
  normalizeExtractedFields,
  resolveReportDate,
  summarizeDbValue,
  toNightInput,
} from '@/lib/tiptraq/extraction'
import { syncMLuxProfileForPatient } from '@/lib/tiptraq/sync-mlux-profile'

export type ProcessNightResult = {
  success: boolean
  error?: string
  reportDate?: string
  memberId?: string
  nightsCount?: number
  rolling?: {
    nights_count: number
    confidence_score: number
    confidence_label: string
    confidence_band_minutes: number
  }
}

async function loadMemberTimeZone(
  supabase: SupabaseClient,
  memberId: string,
): Promise<string> {
  const location = await loadMemberLocation(supabase, memberId)
  return location.timeZone
}

export async function processTipTraqNight(
  supabase: SupabaseClient,
  memberId: string,
  extractedRaw: Record<string, unknown>,
  options?: {
    storagePath?: string
    ingestSource?: string
  },
): Promise<ProcessNightResult> {
  const extracted = normalizeExtractedFields(extractedRaw)
  const reportDate = resolveReportDate(extracted)
  const nightInput = toNightInput(extracted)
  const dlmoResult = calculateNightMLux(nightInput)

  const insertRow = {
    patient_id: memberId,
    report_date: reportDate,
    pdf_path: options?.storagePath ?? null,
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
    extraction_model: String(extracted.algorithm_version ?? options?.ingestSource ?? 'structured-v1'),
  }

  console.info('[TipTraQ] Processing night', {
    memberId,
    reportDate,
    storagePath: options?.storagePath ?? null,
    ingestSource: options?.ingestSource ?? 'structured',
    confidence_score: summarizeDbValue(insertRow.confidence_score),
  })

  const { error: insertError } = await supabase.from('tiptraq_nights').insert(insertRow)

  if (insertError) {
    logPostgrestError('tiptraq_nights insert failed', insertError, {
      memberId,
      reportDate,
      mappedClientMessage: mapInsertError(insertError.message),
    })
    return { success: false, error: mapInsertError(insertError.message) }
  }

  const { error: syncError, rolling } = await syncMLuxProfileForPatient(supabase, memberId)

  if (syncError || !rolling) {
    return { success: false, error: syncError ?? 'Failed to update body clock profile' }
  }

  await supabase.from('subscriptions').upsert(
    {
      member_id: memberId,
      tier: 'premium',
      status: 'active',
    },
    { onConflict: 'member_id' },
  )

  await recomputePhotonicProfile(supabase, memberId, { tier: 'premium' })

  return {
    success: true,
    reportDate,
    memberId,
    nightsCount: rolling.nights_count,
    rolling: {
      nights_count: rolling.nights_count,
      confidence_score: rolling.confidence_score,
      confidence_label: rolling.confidence_label,
      confidence_band_minutes: rolling.confidence_band_minutes,
    },
  }
}

export async function processTipTraqNightFromStorage(
  supabase: SupabaseClient,
  memberId: string,
  storagePath: string,
  ingestSource = 'edf-webhook',
): Promise<ProcessNightResult> {
  const { extractNightDataFromEdf, getTipTraqUploadMaxBytes, mapEdfParseError } = await import(
    '@/lib/tiptraq/edf-parser'
  )

  const { data: storedFile, error: downloadError } = await supabase.storage
    .from('tiptraq-reports')
    .download(storagePath)

  if (downloadError || !storedFile) {
    return { success: false, error: 'Could not read uploaded EDF file' }
  }

  const fileBytes = await storedFile.arrayBuffer()
  if (fileBytes.byteLength > getTipTraqUploadMaxBytes()) {
    return { success: false, error: 'EDF file must be under 50MB' }
  }

  const patientTimeZone = await loadMemberTimeZone(supabase, memberId)

  try {
    const extracted = extractNightDataFromEdf(fileBytes, { timeZone: patientTimeZone })
    return processTipTraqNight(supabase, memberId, extracted, { storagePath, ingestSource })
  } catch (parseError) {
    const message = parseError instanceof Error ? parseError.message : 'Could not parse EDF file'
    return { success: false, error: mapEdfParseError(message) }
  }
}
