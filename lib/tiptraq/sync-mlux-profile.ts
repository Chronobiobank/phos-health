import { calculateRollingMLux, type MLuxResult, type RollingMLux } from '@/lib/mlux'
import { loadMemberLocation } from '@/lib/patient/member-location'
import { mapFetchError, mapProfileUpsertError } from '@/lib/tiptraq/extraction'
import type { SupabaseClient } from '@supabase/supabase-js'

type NightSummaryRow = {
  mlux_phase_minutes: number | null
  confidence_score: number | null
  confidence_band_minutes: number | null
}

export function toRollingNightResults(nights: NightSummaryRow[]): MLuxResult[] {
  return nights.map((night) => ({
    proxy_dlmo_minutes: night.mlux_phase_minutes ?? 0,
    proxy_dlmo_time: '',
    baseline_estimate: '',
    rem_correction_min: 0,
    ans_correction_min: 0,
    ahi_modifier_min: 0,
    confidence_score: night.confidence_score ?? 0,
    confidence_band_minutes: night.confidence_band_minutes ?? 75,
    confidence_label: '',
    chronotype_signal: '',
    non_dipper_flag: false,
    high_sympathetic_flag: false,
    rem_delay_flag: false,
    apnea_confound_flag: false,
  }))
}

export type PhotonicCalibration = {
  nightsCount: number
  gate: 'pending' | 'partial' | 'complete'
  nightsRemaining: number
  displayLabel: string
}

export function photonicCalibration(nightsCount: number): PhotonicCalibration {
  if (nightsCount <= 0) {
    return {
      nightsCount: 0,
      gate: 'pending',
      nightsRemaining: 3,
      displayLabel: 'Upload three nights to calibrate Photonic Age.',
    }
  }

  if (nightsCount < 3) {
    return {
      nightsCount,
      gate: 'partial',
      nightsRemaining: 3 - nightsCount,
      displayLabel: `${nightsCount} of 3 nights uploaded.`,
    }
  }

  return {
    nightsCount,
    gate: 'complete',
    nightsRemaining: 0,
    displayLabel: 'Photonic Age calibrated from three nights.',
  }
}

export async function syncMLuxProfileForPatient(
  supabase: SupabaseClient,
  patientId: string,
): Promise<{ error: string | null; rolling: RollingMLux | null; calibration: PhotonicCalibration }> {
  const { data: allNights, error: fetchError } = await supabase
    .from('tiptraq_nights')
    .select('mlux_phase_minutes, confidence_score, confidence_band_minutes')
    .eq('patient_id', patientId)
    .order('report_date', { ascending: true })

  if (fetchError) {
    return { error: mapFetchError(fetchError.message), rolling: null, calibration: photonicCalibration(0) }
  }

  if (!allNights || allNights.length === 0) {
    const { error: upsertError } = await supabase.from('mlux_profiles').upsert(
      {
        patient_id: patientId,
        nights_count: 0,
        mlux_phase_time: null,
        mlux_phase_minutes: null,
        confidence_score: null,
        confidence_band_minutes: null,
        confidence_label: null,
        chronotype: null,
        simvastatin_optimal_time: null,
        ramipril_optimal_time: null,
        prednisolone_optimal_time: null,
        salmeterol_optimal_time: null,
        light_dose_window_start: null,
        light_dose_window_end: null,
        has_tiptraq: false,
        last_updated: new Date().toISOString(),
      },
      { onConflict: 'patient_id' },
    )

    if (upsertError) {
      return { error: mapProfileUpsertError(upsertError.message), rolling: null, calibration: photonicCalibration(0) }
    }

    return { error: null, rolling: null, calibration: photonicCalibration(0) }
  }

  const rolling = calculateRollingMLux(toRollingNightResults(allNights), {
    timeZone: (await loadMemberLocation(supabase, patientId)).timeZone,
  })

  const { error: upsertError } = await supabase.from('mlux_profiles').upsert(
    {
      patient_id: patientId,
      nights_count: rolling.nights_count,
      mlux_phase_time: rolling.proxy_dlmo_time,
      mlux_phase_minutes: rolling.proxy_dlmo_minutes,
      confidence_score: rolling.confidence_score,
      confidence_band_minutes: rolling.confidence_band_minutes,
      confidence_label: rolling.confidence_label,
      chronotype: rolling.chronotype,
      simvastatin_optimal_time: rolling.simvastatin_optimal,
      ramipril_optimal_time: rolling.ramipril_optimal,
      prednisolone_optimal_time: rolling.prednisolone_optimal,
      salmeterol_optimal_time: rolling.salmeterol_optimal,
      light_dose_window_start: rolling.light_window_start,
      light_dose_window_end: rolling.light_window_end,
      has_tiptraq: true,
      last_updated: new Date().toISOString(),
    },
    { onConflict: 'patient_id' },
  )

  if (upsertError) {
    return { error: mapProfileUpsertError(upsertError.message), rolling: null, calibration: photonicCalibration(0) }
  }

  return {
    error: null,
    rolling,
    calibration: photonicCalibration(rolling.nights_count),
  }
}

export function mapTipTraqDeleteError(message: string): string {
  const lower = message.toLowerCase()

  if (lower.includes('row-level security') || lower.includes('policy')) {
    return 'You do not have permission to delete this recording.'
  }

  if (lower.includes('does not exist') || lower.includes('schema cache')) {
    return 'TipTraQ delete is not set up yet. Run supabase/migrations/001_phos_dashboard.sql in Supabase.'
  }

  return 'Could not delete this recording. Please try again.'
}
