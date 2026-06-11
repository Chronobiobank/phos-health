import type { SupabaseClient } from '@supabase/supabase-js'

import type { EmployerContext } from '@/lib/org/types'

export async function getEmployerContext(
  supabase: SupabaseClient,
  userId: string,
): Promise<EmployerContext | null> {
  const { data } = await supabase
    .from('organisation_memberships')
    .select(
      `
      role,
      organisations!inner (
        id,
        name
      )
    `,
    )
    .eq('member_id', userId)
    .limit(1)
    .maybeSingle()

  if (!data) return null

  const orgRaw = data.organisations
  const org = (Array.isArray(orgRaw) ? orgRaw[0] : orgRaw) as { id: string; name: string } | null
  if (!org) return null

  return {
    organisationId: org.id,
    organisationName: org.name,
    role: data.role as EmployerContext['role'],
  }
}
