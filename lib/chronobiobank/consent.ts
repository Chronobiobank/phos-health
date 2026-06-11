import type { SupabaseClient } from '@supabase/supabase-js'

import { buildDeidentifiedPayload } from '@/lib/chronobiobank/deidentify'
import { buildMemberPseudonym } from '@/lib/chronobiobank/pseudonym'
import type { ChronobiobankMemberState } from '@/lib/chronobiobank/types'

const RESEARCH_CONSENT = 'research_chronobiobank'

export async function loadChronobiobankState(
  supabase: SupabaseClient,
  memberId: string,
): Promise<ChronobiobankMemberState> {
  const [{ data: consent }, { data: contribution }] = await Promise.all([
    supabase
      .from('consents')
      .select('granted, granted_at, revoked_at')
      .eq('member_id', memberId)
      .eq('consent_type', RESEARCH_CONSENT)
      .maybeSingle(),
    supabase
      .from('research_contributions')
      .select('status, pseudonym_id, contributed_at, withdrawn_at, tier')
      .eq('member_id', memberId)
      .maybeSingle(),
  ])

  return {
    consent: {
      granted: Boolean(consent?.granted) && !consent?.revoked_at,
      grantedAt: consent?.granted_at ?? null,
      revokedAt: consent?.revoked_at ?? null,
    },
    contribution: {
      active: contribution?.status === 'active',
      pseudonymId: contribution?.pseudonym_id ?? null,
      contributedAt: contribution?.contributed_at ?? null,
      withdrawnAt: contribution?.withdrawn_at ?? null,
      tier: contribution?.tier ?? null,
    },
  }
}

export async function grantResearchConsent(
  supabase: SupabaseClient,
  memberId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('consents').upsert(
    {
      member_id: memberId,
      consent_type: RESEARCH_CONSENT,
      granted: true,
      granted_at: new Date().toISOString(),
      revoked_at: null,
    },
    { onConflict: 'member_id,consent_type' },
  )

  return { error: error?.message ?? null }
}

export async function revokeResearchConsent(
  supabase: SupabaseClient,
  memberId: string,
): Promise<{ error: string | null }> {
  const { error: consentError } = await supabase
    .from('consents')
    .update({
      granted: false,
      revoked_at: new Date().toISOString(),
    })
    .eq('member_id', memberId)
    .eq('consent_type', RESEARCH_CONSENT)

  if (consentError) {
    return { error: consentError.message }
  }

  const { error: withdrawError } = await supabase
    .from('research_contributions')
    .update({
      status: 'withdrawn',
      withdrawn_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('member_id', memberId)
    .eq('status', 'active')

  return { error: withdrawError?.message ?? null }
}

export async function hasActiveResearchConsent(
  supabase: SupabaseClient,
  memberId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from('consents')
    .select('granted, revoked_at')
    .eq('member_id', memberId)
    .eq('consent_type', RESEARCH_CONSENT)
    .maybeSingle()

  return Boolean(data?.granted) && !data?.revoked_at
}

export async function syncResearchContribution(
  supabase: SupabaseClient,
  memberId: string,
): Promise<{ error: string | null; synced: boolean }> {
  const consented = await hasActiveResearchConsent(supabase, memberId)
  if (!consented) {
    return { error: null, synced: false }
  }

  const [{ data: profile }, { data: member }] = await Promise.all([
    supabase.from('photonic_age_profiles').select('*').eq('member_id', memberId).maybeSingle(),
    supabase
      .from('members')
      .select('location_country')
      .eq('id', memberId)
      .maybeSingle(),
  ])

  if (!profile) {
    return { error: 'Connect your health app before contributing to Chronobiobank.', synced: false }
  }

  const payload = buildDeidentifiedPayload({
    tier: profile.tier,
    photonicAge: Number(profile.photonic_age),
    lostLightYears: Number(profile.lost_light_years),
    confidenceScore: profile.confidence_score,
    confidenceBandMinutes: profile.confidence_band_minutes,
    calendarAge: profile.calendar_age,
    d1Source: profile.d1_source,
    d2Value: profile.d2_value != null ? Number(profile.d2_value) : null,
    d3Source: profile.d3_source,
    region: member?.location_country ?? null,
    provenance: (profile.provenance as Record<string, unknown> | null) ?? null,
  })

  const { error } = await supabase.from('research_contributions').upsert(
    {
      member_id: memberId,
      pseudonym_id: buildMemberPseudonym(memberId),
      status: 'active',
      tier: profile.tier,
      payload,
      contributed_at: new Date().toISOString(),
      withdrawn_at: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'member_id' },
  )

  return { error: error?.message ?? null, synced: !error }
}
