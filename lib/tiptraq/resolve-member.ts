import type { SupabaseClient } from '@supabase/supabase-js'

export type KitAssignmentMatch = {
  memberId: string
  kitId: string
  serial: string
  kitType: 'panel' | 'tiptraq'
}

export async function resolveMemberFromKitSerial(
  supabase: SupabaseClient,
  serial: string,
): Promise<{ match: KitAssignmentMatch | null; error: string | null }> {
  const normalized = serial.trim().toUpperCase()
  if (!normalized) {
    return { match: null, error: 'Missing kit serial.' }
  }

  const { data: kit, error: kitError } = await supabase
    .from('kits')
    .select('id, serial, kit_type')
    .eq('serial', normalized)
    .maybeSingle()

  if (kitError) {
    return { match: null, error: kitError.message }
  }

  if (!kit) {
    return { match: null, error: `Kit serial ${normalized} is not registered.` }
  }

  const { data: assignment, error: assignmentError } = await supabase
    .from('kit_assignments')
    .select('member_id')
    .eq('kit_id', kit.id)
    .is('unassigned_at', null)
    .maybeSingle()

  if (assignmentError) {
    return { match: null, error: assignmentError.message }
  }

  if (!assignment) {
    return {
      match: null,
      error: `No active kit assignment for serial ${normalized}. Bind the serial to a member first.`,
    }
  }

  return {
    match: {
      memberId: assignment.member_id,
      kitId: kit.id,
      serial: kit.serial,
      kitType: kit.kit_type,
    },
    error: null,
  }
}
