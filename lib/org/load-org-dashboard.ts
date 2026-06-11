import type { SupabaseClient } from '@supabase/supabase-js'

import {
  DEMO_ORG_AGGREGATE,
  loadOrgAggregateSnapshot,
  recomputeOrgAggregates,
} from '@/lib/org/compute-aggregates'
import { getEmployerContext } from '@/lib/org/employer-context'
import type { OrgAggregateSnapshot } from '@/lib/org/types'
import { createAdminClient } from '@/lib/supabase/admin'

export async function loadOrgDashboardForUser(
  userSupabase: SupabaseClient,
  adminSupabase: SupabaseClient | null,
  userId: string,
): Promise<{
  snapshot: OrgAggregateSnapshot
  role: 'admin' | 'viewer'
  inviteCode: string | null
}> {
  const context = await getEmployerContext(userSupabase, userId)

  if (!context) {
    return {
      snapshot: DEMO_ORG_AGGREGATE,
      role: 'viewer',
      inviteCode: null,
    }
  }

  if (adminSupabase) {
    await recomputeOrgAggregates(adminSupabase, context.organisationId)
  }

  const snapshot =
    (await loadOrgAggregateSnapshot(
      userSupabase,
      context.organisationId,
      context.organisationName,
    )) ?? {
      ...DEMO_ORG_AGGREGATE,
      organisationId: context.organisationId,
      organisationName: context.organisationName,
      isSample: false,
      memberCount: 0,
      consentedCount: 0,
      activeCount: 0,
      participationPct: 0,
      avgPhotonicAge: null,
      avgLostLightYears: null,
      avgCalendarAge: null,
      cohortShiftLly: null,
      estimatedAnnualSavingsGbp: 0,
      avgConfidenceScore: null,
    }

  let inviteCode: string | null = null
  if (context.role === 'admin') {
    const { data: invite } = await userSupabase
      .from('org_invite_codes')
      .select('code')
      .eq('organisation_id', context.organisationId)
      .eq('active', true)
      .limit(1)
      .maybeSingle()
    inviteCode = invite?.code ?? null
  }

  return {
    snapshot,
    role: context.role,
    inviteCode,
  }
}

export function tryCreateAdminClient(): SupabaseClient | null {
  try {
    return createAdminClient()
  } catch {
    return null
  }
}
