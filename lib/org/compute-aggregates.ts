import type { SupabaseClient } from '@supabase/supabase-js'

import { ANNUAL_COST_PER_PERSON_GBP, BASELINE_LOST_LIGHT_YEARS } from '@/lib/org/constants'
import type { OrgAggregateSnapshot } from '@/lib/org/types'

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

export async function recomputeOrgAggregates(
  supabase: SupabaseClient,
  organisationId: string,
): Promise<{ error: string | null }> {
  const [{ data: org }, { data: members }, { count: memberCount }] = await Promise.all([
    supabase.from('organisations').select('id, name').eq('id', organisationId).maybeSingle(),
    supabase.from('members').select('id').eq('organisation_id', organisationId),
    supabase
      .from('members')
      .select('id', { count: 'exact', head: true })
      .eq('organisation_id', organisationId),
  ])

  if (!org) return { error: 'Organisation not found.' }

  const memberIds = members?.map((member) => member.id) ?? []
  const totalMembers = memberCount ?? memberIds.length

  if (!memberIds.length) {
    await supabase.from('org_aggregates').upsert(
      {
        organisation_id: organisationId,
        member_count: 0,
        consented_count: 0,
        active_count: 0,
        participation_pct: 0,
        avg_photonic_age: null,
        avg_lost_light_years: null,
        avg_calendar_age: null,
        cohort_shift_lly: null,
        estimated_annual_savings_pence: 0,
        avg_confidence_score: null,
        computed_at: new Date().toISOString(),
      },
      { onConflict: 'organisation_id' },
    )
    return { error: null }
  }

  const { data: consents } = await supabase
    .from('consents')
    .select('member_id')
    .in('member_id', memberIds)
    .eq('consent_type', 'employer_aggregate')
    .eq('granted', true)
    .is('revoked_at', null)

  const consentedIds = consents?.map((row) => row.member_id) ?? []

  if (!consentedIds.length) {
    await supabase.from('org_aggregates').upsert(
      {
        organisation_id: organisationId,
        member_count: totalMembers,
        consented_count: 0,
        active_count: 0,
        participation_pct: 0,
        avg_photonic_age: null,
        avg_lost_light_years: null,
        avg_calendar_age: null,
        cohort_shift_lly: null,
        estimated_annual_savings_pence: 0,
        avg_confidence_score: null,
        computed_at: new Date().toISOString(),
      },
      { onConflict: 'organisation_id' },
    )
    return { error: null }
  }

  const { data: profiles } = await supabase
    .from('photonic_age_profiles')
    .select('member_id, photonic_age, lost_light_years, calendar_age, confidence_score')
    .in('member_id', consentedIds)

  const activeCount = profiles?.length ?? 0
  const participationPct =
    totalMembers > 0 ? Math.round((activeCount / totalMembers) * 100) : 0

  let avgPhotonicAge: number | null = null
  let avgLostLightYears: number | null = null
  let avgCalendarAge: number | null = null
  let avgConfidenceScore: number | null = null
  let cohortShiftLly: number | null = null
  let estimatedAnnualSavingsPence = 0

  if (profiles?.length) {
    const photonicSum = profiles.reduce((sum, row) => sum + Number(row.photonic_age), 0)
    const llySum = profiles.reduce((sum, row) => sum + Number(row.lost_light_years), 0)
    const calendarSum = profiles.reduce(
      (sum, row) => sum + Number(row.calendar_age ?? 0),
      0,
    )
    const confidenceRows = profiles.filter((row) => row.confidence_score != null)
    const confidenceSum = confidenceRows.reduce(
      (sum, row) => sum + Number(row.confidence_score),
      0,
    )

    avgPhotonicAge = round1(photonicSum / profiles.length)
    avgLostLightYears = round1(llySum / profiles.length)
    avgCalendarAge = round1(calendarSum / profiles.length)
    avgConfidenceScore = confidenceRows.length
      ? Math.round(confidenceSum / confidenceRows.length)
      : null

    cohortShiftLly = round2(BASELINE_LOST_LIGHT_YEARS - avgLostLightYears)

    const improvementRate = Math.max(
      0,
      Math.min(1, (BASELINE_LOST_LIGHT_YEARS - avgLostLightYears) / BASELINE_LOST_LIGHT_YEARS),
    )
    estimatedAnnualSavingsPence = Math.round(
      consentedIds.length * ANNUAL_COST_PER_PERSON_GBP * 100 * improvementRate,
    )
  }

  const { error } = await supabase.from('org_aggregates').upsert(
    {
      organisation_id: organisationId,
      member_count: totalMembers,
      consented_count: consentedIds.length,
      active_count: activeCount,
      participation_pct: participationPct,
      avg_photonic_age: avgPhotonicAge,
      avg_lost_light_years: avgLostLightYears,
      avg_calendar_age: avgCalendarAge,
      cohort_shift_lly: cohortShiftLly,
      estimated_annual_savings_pence: estimatedAnnualSavingsPence,
      avg_confidence_score: avgConfidenceScore,
      computed_at: new Date().toISOString(),
    },
    { onConflict: 'organisation_id' },
  )

  return { error: error?.message ?? null }
}

export async function loadOrgAggregateSnapshot(
  supabase: SupabaseClient,
  organisationId: string,
  organisationName: string,
): Promise<OrgAggregateSnapshot | null> {
  const { data } = await supabase
    .from('org_aggregates')
    .select('*')
    .eq('organisation_id', organisationId)
    .maybeSingle()

  if (!data) return null

  return {
    organisationId,
    organisationName,
    memberCount: data.member_count,
    consentedCount: data.consented_count,
    activeCount: data.active_count,
    participationPct: data.participation_pct,
    avgPhotonicAge: data.avg_photonic_age != null ? Number(data.avg_photonic_age) : null,
    avgLostLightYears: data.avg_lost_light_years != null ? Number(data.avg_lost_light_years) : null,
    avgCalendarAge: data.avg_calendar_age != null ? Number(data.avg_calendar_age) : null,
    cohortShiftLly: data.cohort_shift_lly != null ? Number(data.cohort_shift_lly) : null,
    estimatedAnnualSavingsGbp: Math.round(Number(data.estimated_annual_savings_pence) / 100),
    avgConfidenceScore: data.avg_confidence_score,
    computedAt: data.computed_at,
    isSample: false,
  }
}

export const DEMO_ORG_AGGREGATE: OrgAggregateSnapshot = {
  organisationId: 'demo',
  organisationName: 'Northbridge Partners',
  memberCount: 150,
  consentedCount: 112,
  activeCount: 89,
  participationPct: 59,
  avgPhotonicAge: 46.1,
  avgLostLightYears: 3.6,
  avgCalendarAge: 42.5,
  cohortShiftLly: 0.6,
  estimatedAnnualSavingsGbp: 288_000,
  avgConfidenceScore: 41,
  computedAt: new Date().toISOString(),
  isSample: true,
}
