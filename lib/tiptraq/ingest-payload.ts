import { normalizeExtractedFields } from '@/lib/tiptraq/extraction'

export type TipTraqIngestPayload = {
  serial: string
  external_id?: string
  report?: Record<string, unknown>
  storage_path?: string
  storagePath?: string
}

export function parseTipTraqIngestPayload(raw: unknown): TipTraqIngestPayload {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid webhook body.')
  }

  const body = raw as Record<string, unknown>
  const serial = String(body.serial ?? body.device_serial ?? body.kit_serial ?? '').trim()

  if (!serial) {
    throw new Error('Missing serial in webhook payload.')
  }

  const report =
    (body.report as Record<string, unknown> | undefined) ??
    (body.study as Record<string, unknown> | undefined) ??
    (body.night as Record<string, unknown> | undefined)

  const storagePath = String(body.storage_path ?? body.storagePath ?? '').trim() || undefined
  const externalId = String(body.external_id ?? body.externalId ?? body.event_id ?? '').trim() || undefined

  if (!report && !storagePath) {
    throw new Error('Webhook must include structured report data or storage_path.')
  }

  return {
    serial,
    external_id: externalId,
    report: report ? normalizeExtractedFields(report) : undefined,
    storagePath,
  }
}
