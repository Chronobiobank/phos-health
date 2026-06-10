'use client'

import { createClient } from '@/lib/supabase/client'
import { getTipTraqUploadMaxBytes, isEdfFile } from '@/lib/tiptraq/edf-parser'

export const TIPTRAQ_UPLOAD_FLOW = 'signed-storage-v3'

export type TipTraqUploadResult = {
  night: {
    date: string
    dlmo_time: string
    confidence_score: number
    confidence_label: string
    confidence_band_minutes: number
    chronotype_signal: string
  }
  rolling: {
    nights_count: number
    dlmo_time: string
    confidence_score: number
    confidence_label: string
    confidence_band_minutes: number
    chronotype: string
    dose_windows: Record<string, string>
  }
  calibration?: {
    gate: 'pending' | 'partial' | 'complete'
    displayLabel: string
    nightsRemaining: number
  }
}

const EXTRACT_MAX_JSON_BYTES = 4096

const FLOW_HEADERS = {
  Accept: 'application/json',
  'X-PHOS-Upload-Flow': TIPTRAQ_UPLOAD_FLOW,
} as const

async function readJsonResponse<T extends { error?: string }>(
  response: Response,
  step: string
): Promise<T> {
  const text = await response.text()

  if (!text) {
    throw new Error(`${step}: empty server response (HTTP ${response.status})`)
  }

  try {
    return JSON.parse(text) as T
  } catch {
    if (/request entity too large|payload too large|413/i.test(text)) {
      throw new Error(
        `${step}: request too large. The EDF must be uploaded to Supabase storage first — never POST the file to /api/tiptraq/extract.`
      )
    }
    throw new Error(`${step}: ${text.slice(0, 200)}`)
  }
}

/** Step 1 — ask our API for a signed Supabase upload URL (no file bytes). */
async function requestSignedUploadUrl(): Promise<{
  storagePath: string
  signedUrl: string
  token: string
}> {
  const response = await fetch('/api/tiptraq/signed-upload', {
    method: 'POST',
    credentials: 'same-origin',
    headers: FLOW_HEADERS,
  })

  const payload = await readJsonResponse<{
    error?: string
    storagePath?: string
    signedUrl?: string
    token?: string
  }>(response, 'Step 1 (signed upload URL)')

  if (!response.ok || !payload.storagePath || !payload.signedUrl || !payload.token) {
    throw new Error(payload.error || 'Step 1 failed: could not prepare upload')
  }

  return {
    storagePath: payload.storagePath,
    signedUrl: payload.signedUrl,
    token: payload.token,
  }
}

/** Step 2 — PUT file bytes directly to Supabase (bypasses Next.js body limits). */
async function uploadFileToSupabase(signedUrl: string, file: File): Promise<void> {
  const uploadResponse = await fetch(signedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/octet-stream',
      'x-upsert': 'false',
      'X-PHOS-Upload-Flow': TIPTRAQ_UPLOAD_FLOW,
    },
    body: file,
  })

  if (!uploadResponse.ok) {
    const detail = (await uploadResponse.text()).slice(0, 200)
    if (uploadResponse.status === 413 || /entity too large|payload too large/i.test(detail)) {
      throw new Error('Step 2 (storage upload): EDF file must be under 50MB')
    }
    throw new Error(detail || `Step 2 (storage upload) failed (HTTP ${uploadResponse.status})`)
  }
}

/** Step 3 — tell extract API where the file lives (JSON only, no file bytes). */
async function processUploadedFile(storagePath: string): Promise<TipTraqUploadResult> {
  const jsonBody = JSON.stringify({ storagePath })

  if (jsonBody.length > EXTRACT_MAX_JSON_BYTES) {
    throw new Error('Step 3 (extract): internal error — payload too large')
  }

  const response = await fetch('/api/tiptraq/extract', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      ...FLOW_HEADERS,
      'Content-Type': 'application/json',
    },
    body: jsonBody,
  })

  const result = await readJsonResponse<TipTraqUploadResult & { error?: string }>(
    response,
    'Step 3 (extract)'
  )

  if (!response.ok) {
    throw new Error(result.error || `Step 3 failed (HTTP ${response.status})`)
  }

  if (!result.night || !result.rolling) {
    throw new Error('Step 3 failed: incomplete response from server')
  }

  return result
}

export async function runTipTraqEdfUpload(file: File): Promise<TipTraqUploadResult> {
  if (!isEdfFile(file)) {
    throw new Error('Please upload a TipTraQ channel export (.edf file).')
  }

  const maxBytes = getTipTraqUploadMaxBytes()
  if (file.size > maxBytes) {
    throw new Error(`EDF file must be under 50MB (yours is ${(file.size / (1024 * 1024)).toFixed(1)}MB).`)
  }

  const signed = await requestSignedUploadUrl()

  try {
    await uploadFileToSupabase(signed.signedUrl, file)
    return await processUploadedFile(signed.storagePath)
  } catch (error) {
    const supabase = createClient()
    await supabase.storage.from('tiptraq-reports').remove([signed.storagePath])
    throw error
  }
}
