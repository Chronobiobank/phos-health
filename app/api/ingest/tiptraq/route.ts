import { NextRequest, NextResponse } from 'next/server'

import { createAdminClient } from '@/lib/supabase/admin'
import { parseTipTraqIngestPayload } from '@/lib/tiptraq/ingest-payload'
import { processTipTraqNight, processTipTraqNightFromStorage } from '@/lib/tiptraq/process-night'
import { resolveMemberFromKitSerial } from '@/lib/tiptraq/resolve-member'
import { getTipTraqWebhookSecret, verifyTipTraqWebhookSignature } from '@/lib/tiptraq/verify-webhook'

export const maxDuration = 60
export const dynamic = 'force-dynamic'

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status })
}

async function logIngestEvent(
  supabase: ReturnType<typeof createAdminClient>,
  row: {
    external_id?: string
    kit_serial: string
    member_id?: string
    status: 'received' | 'processed' | 'failed' | 'duplicate'
    payload: Record<string, unknown>
    error_message?: string
  },
) {
  await supabase.from('ingest_events').insert({
    source: 'tiptraq_webhook',
    external_id: row.external_id ?? null,
    kit_serial: row.kit_serial,
    member_id: row.member_id ?? null,
    status: row.status,
    payload: row.payload,
    error_message: row.error_message ?? null,
    processed_at: row.status === 'processed' || row.status === 'duplicate' ? new Date().toISOString() : null,
  })
}

export async function POST(request: NextRequest) {
  const secret = getTipTraqWebhookSecret()
  if (!secret) {
    return json({ success: false, error: 'Webhook secret is not configured.' }, 503)
  }

  let rawBody = ''
  try {
    rawBody = await request.text()
  } catch {
    return json({ success: false, error: 'Could not read request body.' }, 400)
  }

  const signature =
    request.headers.get('x-phos-signature') ??
    request.headers.get('x-tiptraq-signature') ??
    request.headers.get('x-pranaq-signature')

  if (!verifyTipTraqWebhookSignature(rawBody, signature, secret)) {
    return json({ success: false, error: 'Invalid webhook signature.' }, 401)
  }

  let payload
  try {
    payload = parseTipTraqIngestPayload(JSON.parse(rawBody))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid webhook payload.'
    return json({ success: false, error: message }, 400)
  }

  let supabase
  try {
    supabase = createAdminClient()
  } catch {
    return json({ success: false, error: 'Supabase admin credentials are not configured.' }, 503)
  }

  if (payload.external_id) {
    const { data: existing } = await supabase
      .from('ingest_events')
      .select('id, status, member_id')
      .eq('source', 'tiptraq_webhook')
      .eq('external_id', payload.external_id)
      .eq('status', 'processed')
      .maybeSingle()

    if (existing) {
      await logIngestEvent(supabase, {
        external_id: payload.external_id,
        kit_serial: payload.serial,
        member_id: existing.member_id ?? undefined,
        status: 'duplicate',
        payload: payload as unknown as Record<string, unknown>,
      })
      return json({ success: true, duplicate: true, member_id: existing.member_id })
    }
  }

  const { match, error: resolveError } = await resolveMemberFromKitSerial(supabase, payload.serial)
  if (!match || resolveError) {
    await logIngestEvent(supabase, {
      external_id: payload.external_id,
      kit_serial: payload.serial,
      status: 'failed',
      payload: payload as unknown as Record<string, unknown>,
      error_message: resolveError ?? 'Kit serial not assigned.',
    })
    return json({ success: false, error: resolveError ?? 'Kit serial not assigned.' }, 404)
  }

  if (match.kitType !== 'tiptraq') {
    await logIngestEvent(supabase, {
      external_id: payload.external_id,
      kit_serial: payload.serial,
      member_id: match.memberId,
      status: 'failed',
      payload: payload as unknown as Record<string, unknown>,
      error_message: 'Serial is not a TipTraQ sleep study kit.',
    })
    return json({ success: false, error: 'Serial is not a TipTraQ sleep study kit.' }, 422)
  }

  await logIngestEvent(supabase, {
    external_id: payload.external_id,
    kit_serial: payload.serial,
    member_id: match.memberId,
    status: 'received',
    payload: payload as unknown as Record<string, unknown>,
  })

  const result = payload.report
    ? await processTipTraqNight(supabase, match.memberId, payload.report, {
        storagePath: payload.storagePath,
        ingestSource: 'pranaq-structured',
      })
    : await processTipTraqNightFromStorage(supabase, match.memberId, payload.storagePath!, 'edf-webhook')

  if (!result.success) {
    await logIngestEvent(supabase, {
      external_id: payload.external_id,
      kit_serial: payload.serial,
      member_id: match.memberId,
      status: 'failed',
      payload: payload as unknown as Record<string, unknown>,
      error_message: result.error,
    })
    return json({ success: false, error: result.error ?? 'Ingest failed.' }, 500)
  }

  await supabase
    .from('kits')
    .update({ status: result.nightsCount && result.nightsCount >= 3 ? 'completed' : 'in_use' })
    .eq('id', match.kitId)

  await logIngestEvent(supabase, {
    external_id: payload.external_id,
    kit_serial: payload.serial,
    member_id: match.memberId,
    status: 'processed',
    payload: {
      report_date: result.reportDate,
      nights_count: result.nightsCount,
      rolling: result.rolling,
    },
  })

  return json({
    success: true,
    member_id: match.memberId,
    serial: match.serial,
    report_date: result.reportDate,
    nights_count: result.nightsCount,
    rolling: result.rolling,
  })
}
