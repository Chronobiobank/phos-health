import { TERRY_MOCK_SNAPSHOT } from '@/lib/phos/mock-snapshot'
import type { PhosMetric, PhosSnapshot } from '@/lib/phos/types'
import { photonicCalibration } from '@/lib/tiptraq/sync-mlux-profile'
import type { createClient } from '@/lib/supabase/server'

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

function estimateLostLightYears(
  calendarAge: number,
  nights: Array<{ sleep_efficiency_pct: number | null; waso_minutes: number | null }>,
): number {
  if (!nights.length) return 0

  const avgEfficiency =
    nights.reduce((sum, night) => sum + (night.sleep_efficiency_pct ?? 75), 0) / nights.length
  const avgWaso = nights.reduce((sum, night) => sum + (night.waso_minutes ?? 40), 0) / nights.length

  const efficiencyGap = Math.max(0, 92 - avgEfficiency)
  const wasoPenalty = Math.min(2.5, avgWaso / 60)
  const gap = efficiencyGap * 0.08 + wasoPenalty * 0.35

  return Math.round(Math.min(14, Math.max(0, gap)) * 10) / 10
}

function formatTime(value: string | null | undefined): string | null {
  if (!value) return null
  return value.slice(0, 5)
}

export async function buildPhosSnapshot(
  supabase: SupabaseServerClient,
  userId: string,
  canUpload: boolean,
): Promise<PhosSnapshot> {
  const [{ data: profile }, { data: patient }, { data: mlux }, { data: nights }] = await Promise.all([
    supabase.from('profiles').select('full_name').eq('id', userId).maybeSingle(),
    supabase
      .from('patient_profiles')
      .select('date_of_birth, location_city')
      .eq('id', userId)
      .maybeSingle(),
    supabase.from('mlux_profiles').select('*').eq('patient_id', userId).maybeSingle(),
    supabase
      .from('tiptraq_nights')
      .select('id, report_date, sleep_efficiency_pct, tst_minutes, waso_minutes, mlux_phase_time')
      .eq('patient_id', userId)
      .order('report_date', { ascending: false }),
  ])

  if (!nights?.length) {
    return {
      ...TERRY_MOCK_SNAPSHOT,
      subjectName: profile?.full_name?.split(' ')[0] ?? TERRY_MOCK_SNAPSHOT.subjectName,
      isSample: true,
      canUpload,
    }
  }

  const calendarAge = patient?.date_of_birth
    ? Math.floor(
        (Date.now() - new Date(patient.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
      )
    : TERRY_MOCK_SNAPSHOT.calendarAge

  const lostLightYears = estimateLostLightYears(calendarAge, nights)
  const photonicAge = Math.round((calendarAge + lostLightYears) * 10) / 10
  const calibration = photonicCalibration(mlux?.nights_count ?? nights.length)

  const avgEfficiency = Math.round(
    nights.reduce((sum, night) => sum + (night.sleep_efficiency_pct ?? 0), 0) / nights.length,
  )
  const avgTst = Math.round(
    nights.reduce((sum, night) => sum + (night.tst_minutes ?? 0), 0) / nights.length,
  )

  const metrics: PhosMetric[] = [
    {
      label: 'Sleep efficiency',
      value: `${avgEfficiency}%`,
      note: `${nights.length}-night average`,
    },
    {
      label: 'Total sleep',
      value: `${Math.floor(avgTst / 60)}h ${avgTst % 60}m`,
      note: 'Per night',
    },
    {
      label: 'Body clock phase',
      value: formatTime(mlux?.mlux_phase_time) ?? 'Pending',
      note: mlux?.chronotype ?? 'Calibrating',
    },
    {
      label: 'Confidence',
      value: mlux?.confidence_score != null ? `${mlux.confidence_score}%` : 'Pending',
      note: mlux?.confidence_label ?? calibration.displayLabel,
    },
    {
      label: 'Sun window',
      value:
        mlux?.light_dose_window_start && mlux?.light_dose_window_end
          ? `${formatTime(mlux.light_dose_window_start)} to ${formatTime(mlux.light_dose_window_end)}`
          : 'Pending',
      note: 'Outdoor light window',
    },
    {
      label: 'Nights uploaded',
      value: String(nights.length),
      note: calibration.displayLabel,
    },
  ]

  return {
    subjectName: profile?.full_name?.split(' ')[0] ?? 'You',
    calendarAge,
    photonicAge,
    lostLightYears,
    nightsCount: mlux?.nights_count ?? nights.length,
    confidenceScore: mlux?.confidence_score ?? null,
    confidenceLabel: mlux?.confidence_label ?? null,
    chronotype: mlux?.chronotype ?? null,
    lightWindow:
      mlux?.light_dose_window_start && mlux?.light_dose_window_end
        ? {
            start: formatTime(mlux.light_dose_window_start) ?? '',
            end: formatTime(mlux.light_dose_window_end) ?? '',
          }
        : null,
    metrics,
    nights: nights.map((night) => ({
      id: night.id,
      date: night.report_date,
      sleepEfficiency: night.sleep_efficiency_pct,
      tstMinutes: night.tst_minutes,
      dlmoTime: formatTime(night.mlux_phase_time),
    })),
    isSample: false,
    canUpload,
  }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}
