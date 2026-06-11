import { createHmac, timingSafeEqual } from 'crypto'

export function getTipTraqWebhookSecret(): string | null {
  return process.env.TIPTRAQ_INGEST_WEBHOOK_SECRET ?? null
}

export function signTipTraqWebhookPayload(rawBody: string, secret: string): string {
  return createHmac('sha256', secret).update(rawBody).digest('hex')
}

export function verifyTipTraqWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!signatureHeader?.trim()) return false

  const provided = signatureHeader.trim().replace(/^sha256=/i, '')
  const expected = signTipTraqWebhookPayload(rawBody, secret)

  if (provided.length !== expected.length) return false

  try {
    return timingSafeEqual(Buffer.from(provided, 'utf8'), Buffer.from(expected, 'utf8'))
  } catch {
    return false
  }
}
