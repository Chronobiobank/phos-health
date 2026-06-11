import { computePhotonicAge } from '@/lib/phos/engine/compute'
import type { MemberTier, PhoneObservation, PremiumD1Input } from '@/lib/phos/engine/types'
import type { SupabaseClient } from '@supabase/supabase-js'

function estimateCalendarAge(dateOfBirth: string | null | undefined, fallback = 35): number {
  if (!dateOfBirth) return fallback
  return Math.floor((Date.now() - new Date(dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
}

export async function ensureMemberRecord(
  supabase: SupabaseClient,
  userId: string,
  fullName?: string | null,
): Promise<void> {
  await supabase.from('members').upsert(
    {
      id: userId,
      full_name: fullName ?? null,
      location_country: 'United Kingdom',
    },
    { onConflict: 'id' },
  )

  await supabase.from('consents').upsert(
    {
      member_id: userId,
      consent_type: 'service',
      granted: true,
      granted_at: new Date().toISOString(),
    },
    { onConflict: 'member_id,consent_type' },
  )

  await supabase.from('subscriptions').upsert(
    {
      member_id: userId,
      tier: 'free',
      status: 'active',
    },
    { onConflict: 'member_id' },
  )
}

export async function storePhoneObservations(
  supabase: SupabaseClient,
  memberId: string,
  source: 'apple_healthkit' | 'google_health_connect' | 'demo',
  observations: PhoneObservation[],
): Promise<void> {
  if (!observations.length) return

  const rows = observations.map((observation) => ({
    member_id: memberId,
    source,
    observation_date: observation.observation_date,
    sleep_onset: observation.sleep_onset,
    sleep_offset: observation.sleep_offset,
    sleep_duration_minutes: observation.sleep_duration_minutes,
    is_weekend: observation.is_weekend,
    steps: observation.steps,
  }))

  await supabase.from('phone_observations').upsert(rows, {
    onConflict: 'member_id,observation_date,source',
  })
}

export async function recomputePhotonicProfile(
  supabase: SupabaseClient,
  memberId: string,
  options?: { premium?: PremiumD1Input | null; tier?: MemberTier },
): Promise<{ error: string | null }> {
  const [{ data: member }, { data: subscription }, { data: observations }, { data: mlux }] = await Promise.all([
    supabase
      .from('members')
      .select('date_of_birth, latitude, full_name')
      .eq('id', memberId)
      .maybeSingle(),
    supabase.from('subscriptions').select('tier').eq('member_id', memberId).maybeSingle(),
    supabase
      .from('phone_observations')
      .select('observation_date, sleep_onset, sleep_offset, sleep_duration_minutes, is_weekend, steps')
      .eq('member_id', memberId)
      .order('observation_date', { ascending: false })
      .limit(120),
    supabase.from('mlux_profiles').select('*').eq('patient_id', memberId).maybeSingle(),
  ])

  if (!observations?.length) {
    return { error: 'No phone observations to compute from.' }
  }

  const tier = options?.tier ?? (subscription?.tier as MemberTier | undefined) ?? 'free'
  const premium =
    options?.premium ??
    (mlux
      ? {
          mluxPhaseMinutes: mlux.mlux_phase_minutes,
          confidenceScore: mlux.confidence_score,
          confidenceBandMinutes: mlux.confidence_band_minutes,
          confidenceLabel: mlux.confidence_label,
          chronotype: mlux.chronotype,
          lightWindowStart: mlux.light_dose_window_start,
          lightWindowEnd: mlux.light_dose_window_end,
        }
      : null)

  const computation = computePhotonicAge({
    tier,
    calendarAge: estimateCalendarAge(member?.date_of_birth),
    observations,
    latitude: member?.latitude != null ? Number(member.latitude) : 51.5,
    premium,
  })

  const { error } = await supabase.from('photonic_age_profiles').upsert(
    {
      member_id: memberId,
      tier: computation.tier,
      calendar_age: computation.calendarAge,
      photonic_age: computation.photonicAge,
      lost_light_years: computation.lostLightYears,
      confidence_score: computation.confidenceScore,
      confidence_band_minutes: computation.confidenceBandMinutes,
      confidence_label: computation.confidenceLabel,
      d1_value: computation.domains.find((domain) => domain.key === 'd1')?.value ?? null,
      d1_source: computation.domains.find((domain) => domain.key === 'd1')?.source ?? null,
      d1_confidence: computation.domains.find((domain) => domain.key === 'd1')?.confidence ?? null,
      d2_value: computation.domains.find((domain) => domain.key === 'd2')?.value ?? null,
      d2_source: computation.domains.find((domain) => domain.key === 'd2')?.source ?? null,
      d2_confidence: computation.domains.find((domain) => domain.key === 'd2')?.confidence ?? null,
      d3_value: computation.domains.find((domain) => domain.key === 'd3')?.value ?? null,
      d3_source: computation.domains.find((domain) => domain.key === 'd3')?.source ?? null,
      d3_confidence: computation.domains.find((domain) => domain.key === 'd3')?.confidence ?? null,
      light_time_start: computation.lightTime.start,
      light_time_end: computation.lightTime.end,
      daily_cue_type: computation.lightTime.cueType,
      daily_cue_copy: computation.lightTime.cueCopy,
      provenance: computation.provenance,
      computed_at: new Date().toISOString(),
    },
    { onConflict: 'member_id' },
  )

  if (error) return { error: error.message }

  await supabase.from('cue_events').insert({
    member_id: memberId,
    cue_type: computation.lightTime.cueType,
    cue_copy: computation.lightTime.cueCopy,
    light_time_start: computation.lightTime.start,
    light_time_end: computation.lightTime.end,
    delivered_via: 'daily_cue',
  })

  try {
    const { hasActiveResearchConsent, syncResearchContribution } = await import(
      '@/lib/chronobiobank/consent'
    )
    const { createAdminClient } = await import('@/lib/supabase/admin')
    if (await hasActiveResearchConsent(supabase, memberId)) {
      const admin = createAdminClient()
      await syncResearchContribution(admin, memberId)
    }
  } catch {
    // Non-blocking when service role or Chronobiobank tables are unavailable.
  }

  return { error: null }
}
