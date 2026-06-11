import { TERRY_MOCK_SNAPSHOT } from '@/lib/phos/mock-snapshot'
import type { DailyCueStop, PhosMetric, PhosSnapshot } from '@/lib/phos/types'
import { photonicCalibration } from '@/lib/tiptraq/sync-mlux-profile'
import type { createClient } from '@/lib/supabase/server'

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

function formatTime(value: string | null | undefined): string | null {
  if (!value) return null
  return value.slice(0, 5)
}

function defaultCueTimeline(): DailyCueStop[] {
  return [
    { time: '08:30', label: 'Anchor', icon: 'anchor', active: true },
    { time: '15:00', label: 'Peak', icon: 'peak' },
    { time: '19:30', label: 'Fuel', icon: 'fuel' },
    { time: '21:30', label: 'Dim', icon: 'dim' },
  ]
}

function buildCueTimeline(
  start: string | null,
  end: string | null,
  cueType: string | null,
): DailyCueStop[] {
  if (!start) return defaultCueTimeline()

  const anchor = start
  const peak = end ?? '15:00'

  return [
    { time: anchor, label: cueType ?? 'Anchor', icon: 'anchor', active: true },
    { time: peak, label: 'Peak', icon: 'peak' },
    { time: '19:30', label: 'Fuel', icon: 'fuel' },
    { time: '21:30', label: 'Dim', icon: 'dim' },
  ]
}

async function buildFromPhotonicProfile(
  supabase: SupabaseServerClient,
  userId: string,
  canUpload: boolean,
): Promise<PhosSnapshot | null> {
  const [{ data: member }, { data: profile }, { data: nights }] = await Promise.all([
    supabase.from('members').select('full_name, date_of_birth').eq('id', userId).maybeSingle(),
    supabase.from('photonic_age_profiles').select('*').eq('member_id', userId).maybeSingle(),
    supabase
      .from('tiptraq_nights')
      .select('id, report_date, sleep_efficiency_pct, tst_minutes, waso_minutes, mlux_phase_time')
      .eq('patient_id', userId)
      .order('report_date', { ascending: false }),
  ])

  if (!profile) return null

  const metrics: PhosMetric[] = [
    {
      label: 'Body clock phase',
      value: profile.d1_value != null ? `${profile.d1_value} h drift` : 'Pending',
      note: profile.d1_source ?? 'Phone',
    },
    {
      label: 'Social jet lag',
      value: profile.d2_value != null ? `${Math.round(profile.d2_value)} min` : 'Pending',
      note: profile.d2_source ?? 'Phone sleep timing',
    },
    {
      label: 'Personal light',
      value: profile.d3_value != null ? `${profile.d3_value} index` : 'Pending',
      note: profile.d3_source ?? 'Inferred',
    },
    {
      label: 'Confidence band',
      value: profile.confidence_band_minutes != null ? `±${profile.confidence_band_minutes} min` : 'Pending',
      note: profile.confidence_label ?? 'Wide',
    },
    {
      label: 'Tier',
      value: profile.tier === 'premium' ? 'Premium' : profile.tier === 'basic' ? 'Basic' : 'Free',
      note: 'Current measurement tier',
    },
    {
      label: 'Observations',
      value: String((profile.provenance as { observationCount?: number } | null)?.observationCount ?? 'Synced'),
      note: 'Sleep history used',
    },
  ]

  return {
    subjectName: member?.full_name?.split(' ')[0] ?? 'You',
    calendarAge: profile.calendar_age ?? TERRY_MOCK_SNAPSHOT.calendarAge,
    photonicAge: Number(profile.photonic_age),
    lostLightYears: Number(profile.lost_light_years),
    nightsCount: nights?.length ?? 0,
    tier: profile.tier,
    confidenceScore: profile.confidence_score,
    confidenceLabel: profile.confidence_label,
    confidenceBandMinutes: profile.confidence_band_minutes,
    chronotype: null,
    lightWindow:
      profile.light_time_start && profile.light_time_end
        ? {
            start: formatTime(profile.light_time_start) ?? '',
            end: formatTime(profile.light_time_end) ?? '',
          }
        : null,
    dailyCueType: profile.daily_cue_type,
    dailyCueCopy: profile.daily_cue_copy,
    cueTimeline: buildCueTimeline(
      formatTime(profile.light_time_start),
      formatTime(profile.light_time_end),
      profile.daily_cue_type,
    ),
    metrics,
    nights:
      nights?.map((night) => ({
        id: night.id,
        date: night.report_date,
        sleepEfficiency: night.sleep_efficiency_pct,
        tstMinutes: night.tst_minutes,
        dlmoTime: formatTime(night.mlux_phase_time),
      })) ?? [],
    isSample: false,
    hasPhoneData: true,
    canUpload,
    onboardingPath: '/onboarding',
  }
}

async function buildFromTipTraq(
  supabase: SupabaseServerClient,
  userId: string,
  canUpload: boolean,
): Promise<PhosSnapshot | null> {
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

  if (!nights?.length) return null

  const calendarAge = patient?.date_of_birth
    ? Math.floor(
        (Date.now() - new Date(patient.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000),
      )
    : TERRY_MOCK_SNAPSHOT.calendarAge

  const avgEfficiency = Math.round(
    nights.reduce((sum, night) => sum + (night.sleep_efficiency_pct ?? 0), 0) / nights.length,
  )
  const avgTst = Math.round(
    nights.reduce((sum, night) => sum + (night.tst_minutes ?? 0), 0) / nights.length,
  )
  const lostLightYears = TERRY_MOCK_SNAPSHOT.lostLightYears
  const photonicAge = Math.round((calendarAge + lostLightYears) * 10) / 10
  const calibration = photonicCalibration(mlux?.nights_count ?? nights.length)

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
    tier: 'premium',
    confidenceScore: mlux?.confidence_score ?? null,
    confidenceLabel: mlux?.confidence_label ?? null,
    confidenceBandMinutes: mlux?.confidence_band_minutes ?? null,
    chronotype: mlux?.chronotype ?? null,
    lightWindow:
      mlux?.light_dose_window_start && mlux?.light_dose_window_end
        ? {
            start: formatTime(mlux.light_dose_window_start) ?? '',
            end: formatTime(mlux.light_dose_window_end) ?? '',
          }
        : null,
    dailyCueType: 'Anchor',
    dailyCueCopy: mlux?.light_dose_window_start
      ? `Catch first light, before ${formatTime(mlux.light_dose_window_start)}.`
      : 'Catch first light, before 08:30.',
    cueTimeline: buildCueTimeline(
      formatTime(mlux?.light_dose_window_start),
      formatTime(mlux?.light_dose_window_end),
      'Anchor',
    ),
    metrics,
    nights: nights.map((night) => ({
      id: night.id,
      date: night.report_date,
      sleepEfficiency: night.sleep_efficiency_pct,
      tstMinutes: night.tst_minutes,
      dlmoTime: formatTime(night.mlux_phase_time),
    })),
    isSample: false,
    hasPhoneData: false,
    canUpload,
    onboardingPath: '/onboarding',
  }
}

export async function buildPhosSnapshot(
  supabase: SupabaseServerClient,
  userId: string,
  canUpload: boolean,
): Promise<PhosSnapshot> {
  if (!userId) {
    return { ...TERRY_MOCK_SNAPSHOT, canUpload }
  }

  try {
    const fromProfile = await buildFromPhotonicProfile(supabase, userId, canUpload)
    if (fromProfile) return fromProfile
  } catch {
    // Migration 002 not applied yet; fall through to TipTraQ path.
  }

  try {
    const fromTipTraq = await buildFromTipTraq(supabase, userId, canUpload)
    if (fromTipTraq) return fromTipTraq
  } catch {
    // Legacy tables unavailable.
  }

  return {
    ...TERRY_MOCK_SNAPSHOT,
    subjectName: 'You',
    isSample: true,
    canUpload,
  }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}
