import { TERRY_MOCK_SNAPSHOT } from '@/lib/phos/mock-snapshot'
import type { DailyCueStop, PhosMetric, PhosSnapshot } from '@/lib/phos/types'
import { buildPhotonicRiskSpectrum } from '@/lib/phos/risk-spectrum/build-nodes'
import { meanAhiFromValues } from '@/lib/phos/risk-spectrum/indicators'
import type { BuildPhotonicRiskSpectrumInput, TipTraqNightFlags } from '@/lib/phos/risk-spectrum/types'
import { TERRY_MOCK_RISK_SPECTRUM } from '@/lib/phos/risk-spectrum/mock-spectrum'
import { addMinutesToClock } from '@/lib/phos/engine/time'
import {
  adjustLightWindowForLocation,
  dailyCueCopyForLightWindow,
} from '@/lib/patient/light-window'
import { memberLocationFromFields } from '@/lib/patient/member-location'
import type { createClient } from '@/lib/supabase/server'

const TIPTRAQ_NIGHT_SELECT =
  'id, report_date, sleep_efficiency_pct, tst_minutes, waso_minutes, mlux_phase_time, ahi, non_dipper_flag, rem_delay_flag, high_sympathetic_flag'

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

function lightAlignmentFromLostYears(lostLightYears: number): number {
  return Math.max(0, Math.min(100, Math.round(100 - lostLightYears * 18)))
}

function isEveningChronotype(chronotype: string | null | undefined): boolean {
  const label = chronotype?.toLowerCase() ?? ''
  return label.includes('evening') || label.includes('night') || label.includes('late')
}

function nightFlagsFromRow(
  row: {
    ahi?: number | null
    non_dipper_flag?: boolean | null
    rem_delay_flag?: boolean | null
    high_sympathetic_flag?: boolean | null
  } | null,
): TipTraqNightFlags | null {
  if (!row) return null
  return {
    ahi: row.ahi ?? null,
    non_dipper_flag: row.non_dipper_flag ?? null,
    rem_delay_flag: row.rem_delay_flag ?? null,
    high_sympathetic_flag: row.high_sympathetic_flag ?? null,
  }
}

function buildRiskSpectrum(input: BuildPhotonicRiskSpectrumInput) {
  return buildPhotonicRiskSpectrum(input)
}

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
  const peak = end ?? addMinutesToClock(anchor, 390)
  const fuel = addMinutesToClock(anchor, 660)
  const dim = addMinutesToClock(anchor, 780)

  return [
    { time: anchor, label: cueType ?? 'Anchor', icon: 'anchor', active: true },
    { time: peak, label: 'Peak', icon: 'peak' },
    { time: fuel, label: 'Fuel', icon: 'fuel' },
    { time: dim, label: 'Dim', icon: 'dim' },
  ]
}

function locationAdjustedLightWindow(
  start: string | null,
  end: string | null,
  timeZone: string,
): { start: string | null; end: string | null } {
  if (!start || !end) return { start, end }
  const adjusted = adjustLightWindowForLocation(start, end, timeZone)
  return { start: adjusted.start, end: adjusted.end }
}

async function buildFromPhotonicProfile(
  supabase: SupabaseServerClient,
  userId: string,
  canUpload: boolean,
): Promise<PhosSnapshot | null> {
  const [{ data: member }, { data: profile }, { data: nights }] = await Promise.all([
    supabase
      .from('members')
      .select('full_name, date_of_birth, location_city, location_country, latitude')
      .eq('id', userId)
      .maybeSingle(),
    supabase.from('photonic_age_profiles').select('*').eq('member_id', userId).maybeSingle(),
    supabase
      .from('tiptraq_nights')
      .select(TIPTRAQ_NIGHT_SELECT)
      .eq('patient_id', userId)
      .order('report_date', { ascending: false }),
  ])

  if (!profile) return null

  const lostLightYears = Number(profile.lost_light_years)
  const latestNightRow = nights?.[0] ?? null
  const meanAhi = meanAhiFromValues((nights ?? []).map((night) => night.ahi ?? NaN).filter((v) => !Number.isNaN(v)))

  const location = memberLocationFromFields({
    locationCity: member?.location_city,
    locationCountry: member?.location_country,
    latitude: member?.latitude,
  })
  const lightStart = formatTime(profile.light_time_start)
  const lightEnd = formatTime(profile.light_time_end)
  const adjustedLight = locationAdjustedLightWindow(lightStart, lightEnd, location.timeZone)

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
      adjustedLight.start && adjustedLight.end
        ? {
            start: adjustedLight.start,
            end: adjustedLight.end,
          }
        : null,
    dailyCueType: profile.daily_cue_type,
    dailyCueCopy: adjustedLight.start
      ? dailyCueCopyForLightWindow(adjustedLight.start)
      : profile.daily_cue_copy,
    cueTimeline: buildCueTimeline(
      adjustedLight.start,
      adjustedLight.end,
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
    riskSpectrum: buildRiskSpectrum({
      lostLightYears,
      lightAlignmentScore: lightAlignmentFromLostYears(lostLightYears),
      chronotypeEvening: (profile.d2_value ?? 0) >= 45,
      hasTipTraq: (nights?.length ?? 0) > 0,
      tipTraqNightsCount: nights?.length ?? 0,
      meanAhi,
      latestNight: nightFlagsFromRow(latestNightRow),
      hasBloodPanel: profile.tier === 'basic' || profile.tier === 'premium',
      vitaminDLow: false,
    }),
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
  const [profileResult, patientResult, memberResult, mluxResult, nightsResult] = await Promise.all([
      supabase.from('profiles').select('full_name').eq('id', userId).maybeSingle(),
      supabase
        .from('patient_profiles')
        .select('date_of_birth, location_city, location_country')
        .eq('id', userId)
        .maybeSingle(),
      supabase
        .from('members')
        .select('full_name, date_of_birth, location_city, location_country')
        .eq('id', userId)
        .maybeSingle(),
      supabase.from('mlux_profiles').select('*').eq('patient_id', userId).maybeSingle(),
      supabase
        .from('tiptraq_nights')
        .select(TIPTRAQ_NIGHT_SELECT)
        .eq('patient_id', userId)
        .order('report_date', { ascending: false }),
    ])

  const { data: profile } = profileResult
  const { data: patient } = patientResult
  const { data: member } = memberResult
  const { data: mlux } = mluxResult

  const { data: nights, error: nightsError } = nightsResult
  if (nightsError) {
    console.error('[buildPhosSnapshot] tiptraq_nights:', nightsError.message)
    return null
  }

  if (!nights?.length) return null

  const location = memberLocationFromFields({
    locationCity: patient?.location_city ?? member?.location_city,
    locationCountry: patient?.location_country ?? member?.location_country,
  })
  const rawLightStart = formatTime(mlux?.light_dose_window_start)
  const rawLightEnd = formatTime(mlux?.light_dose_window_end)
  const adjustedLight = locationAdjustedLightWindow(rawLightStart, rawLightEnd, location.timeZone)

  const calendarAge = patient?.date_of_birth ?? member?.date_of_birth
    ? Math.floor(
        (Date.now() - new Date((patient?.date_of_birth ?? member?.date_of_birth) as string).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000),
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
  const latestNightRow = nights[0] ?? null
  const meanAhi = meanAhiFromValues(nights.map((night) => night.ahi ?? NaN).filter((v) => !Number.isNaN(v)))
  const chronotype = mlux?.chronotype ?? null

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
  ]

  return {
    subjectName:
      profile?.full_name?.split(' ')[0] ?? member?.full_name?.split(' ')[0] ?? 'You',
    calendarAge,
    photonicAge,
    lostLightYears,
    nightsCount: mlux?.nights_count ?? nights.length,
    tier: 'premium',
    confidenceScore: mlux?.confidence_score ?? null,
    confidenceLabel: mlux?.confidence_label ?? null,
    confidenceBandMinutes: mlux?.confidence_band_minutes ?? null,
    chronotype,
    lightWindow:
      adjustedLight.start && adjustedLight.end
        ? {
            start: adjustedLight.start,
            end: adjustedLight.end,
          }
        : null,
    dailyCueType: 'Anchor',
    dailyCueCopy: adjustedLight.start
      ? dailyCueCopyForLightWindow(adjustedLight.start)
      : 'Catch first light, before 08:30.',
    cueTimeline: buildCueTimeline(adjustedLight.start, adjustedLight.end, 'Anchor'),
    metrics,
    nights: nights.map((night) => ({
      id: night.id,
      date: night.report_date,
      sleepEfficiency: night.sleep_efficiency_pct,
      tstMinutes: night.tst_minutes,
      dlmoTime: formatTime(night.mlux_phase_time),
    })),
    riskSpectrum: buildRiskSpectrum({
      lostLightYears,
      lightAlignmentScore: lightAlignmentFromLostYears(lostLightYears),
      chronotypeEvening: isEveningChronotype(chronotype),
      hasTipTraq: nights.length > 0,
      tipTraqNightsCount: mlux?.nights_count ?? nights.length,
      meanAhi,
      latestNight: nightFlagsFromRow(latestNightRow),
      hasBloodPanel: false,
      vitaminDLow: false,
    }),
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
    return { ...TERRY_MOCK_SNAPSHOT, riskSpectrum: TERRY_MOCK_RISK_SPECTRUM, canUpload }
  }

  // TipTraQ nights take precedence — sleep study dashboard, not phone diagnostic tiles.
  try {
    const fromTipTraq = await buildFromTipTraq(supabase, userId, canUpload)
    if (fromTipTraq) return fromTipTraq
  } catch {
    // Legacy tables unavailable.
  }

  try {
    const fromProfile = await buildFromPhotonicProfile(supabase, userId, canUpload)
    if (fromProfile) return fromProfile
  } catch {
    // Migration 002 not applied yet; fall through to mock.
  }

  return {
    ...TERRY_MOCK_SNAPSHOT,
    subjectName: 'You',
    riskSpectrum: TERRY_MOCK_RISK_SPECTRUM,
    isSample: true,
    canUpload,
  }
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}
