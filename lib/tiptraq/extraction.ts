import type { TipTraQNight } from '@/lib/mlux'

const TIME_PATTERN = /^\d{2}:\d{2}$/

const REPORT_DATE_ALIASES = [
  'report_date',
  'reportDate',
  'date',
  'study_date',
  'test_date',
  'recording_date',
  'session_date',
  'night_date',
] as const

const NUMERIC_FIELDS = [
  'trt_minutes',
  'signal_quality_pct',
  'sleep_latency_minutes',
  'tst_minutes',
  'waso_minutes',
  'sleep_efficiency_pct',
  'rem_duration_minutes',
  'rem_pct_tst',
  'nrem_duration_minutes',
  'ahi',
  'rdi',
  'odi_3pct',
  'odi_4pct',
  't90_pct',
  'min_spo2',
  'mean_spo2',
  'hypoxic_burden',
  'event_count',
  'mean_pr',
  'min_pr',
  'max_pr',
  'sns_pct',
  'pns_pct',
  'snoring_minutes',
] as const

const TIME_FIELDS = [
  'recording_start',
  'recording_end',
  'sleep_onset',
  'sleep_offset',
  'first_rem_onset',
] as const

export function isPdfFile(file: File): boolean {
  if (file.type === 'application/pdf') return true
  return file.name.toLowerCase().endsWith('.pdf')
}

export function parseExtractedJson(rawText: string): Record<string, unknown> {
  let text = rawText.trim()
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) {
    text = fenced[1].trim()
  }
  return normalizeExtractedFields(JSON.parse(text) as Record<string, unknown>)
}

function coerceNumber(value: unknown): unknown {
  if (typeof value === 'number' && !Number.isNaN(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value.replace(/,/g, ''))
    if (!Number.isNaN(parsed)) return parsed
  }
  return value
}

function normalizeTime(value: unknown): unknown {
  if (value === null || value === undefined || value === '') return value
  if (typeof value !== 'string') return value

  const trimmed = value.trim()
  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/)
  if (!match) return value

  return `${match[1].padStart(2, '0')}:${match[2]}`
}

export function normalizeExtractedFields(extracted: Record<string, unknown>): Record<string, unknown> {
  const normalized = { ...extracted }

  for (const field of NUMERIC_FIELDS) {
    if (field in normalized) {
      normalized[field] = coerceNumber(normalized[field])
    }
  }

  for (const field of TIME_FIELDS) {
    if (field in normalized) {
      normalized[field] = normalizeTime(normalized[field])
    }
  }

  for (const key of REPORT_DATE_ALIASES) {
    const iso = parseReportDateToIso(normalized[key])
    if (iso) {
      normalized.report_date = iso
      break
    }
  }

  return normalized
}

function pad2(value: number): string {
  return value.toString().padStart(2, '0')
}

function toIsoDate(year: number, month: number, day: number): string | null {
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2100) {
    return null
  }

  const date = new Date(Date.UTC(year, month - 1, day))
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null
  }

  return `${year}-${pad2(month)}-${pad2(day)}`
}

export function parseReportDateToIso(value: unknown): string | null {
  if (value === null || value === undefined) return null
  if (typeof value !== 'string') return null

  const trimmed = value.trim()
  if (!trimmed) return null

  const isoPrefix = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (isoPrefix) {
    return toIsoDate(Number(isoPrefix[1]), Number(isoPrefix[2]), Number(isoPrefix[3]))
  }

  const dmyMatch = trimmed.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/)
  if (dmyMatch) {
    return toIsoDate(Number(dmyMatch[3]), Number(dmyMatch[2]), Number(dmyMatch[1]))
  }

  const ymdMatch = trimmed.match(/^(\d{4})[/.-](\d{1,2})[/.-](\d{1,2})$/)
  if (ymdMatch) {
    return toIsoDate(Number(ymdMatch[1]), Number(ymdMatch[2]), Number(ymdMatch[3]))
  }

  const textMonthMatch = trimmed.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/)
  if (textMonthMatch) {
    const parsed = Date.parse(`${textMonthMatch[2]} ${textMonthMatch[1]}, ${textMonthMatch[3]}`)
    if (!Number.isNaN(parsed)) {
      const date = new Date(parsed)
      return toIsoDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
    }
  }

  const parsed = Date.parse(trimmed)
  if (!Number.isNaN(parsed)) {
    const date = new Date(parsed)
    return toIsoDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
  }

  return null
}

export function resolveReportDate(extracted: Record<string, unknown>): string {
  for (const key of REPORT_DATE_ALIASES) {
    const iso = parseReportDateToIso(extracted[key])
    if (iso) return iso
  }

  for (const key of ['recording_start', 'recording_end', 'sleep_onset'] as const) {
    const iso = parseReportDateToIso(extracted[key])
    if (iso) return iso
  }

  throw new Error('Report is missing a valid report date.')
}

function requiredTime(value: unknown, field: string): string {
  if (typeof value !== 'string' || !TIME_PATTERN.test(value)) {
    throw new Error(`Report is missing a valid ${field} time.`)
  }
  return value
}

function requiredNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`Report is missing a valid ${field} value.`)
  }
  return value
}

function optionalTime(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null
  if (typeof value !== 'string' || !TIME_PATTERN.test(value)) {
    throw new Error('Report has an invalid first REM onset time.')
  }
  return value
}

export function validateReportDate(value: unknown): string {
  const iso = parseReportDateToIso(value)
  if (!iso) {
    throw new Error('Report is missing a valid report date.')
  }
  return iso
}

export function toNightInput(extracted: Record<string, unknown>): TipTraQNight {
  return {
    sleep_onset: requiredTime(extracted.sleep_onset, 'sleep onset'),
    sleep_offset: requiredTime(extracted.sleep_offset, 'sleep offset'),
    sleep_latency_minutes: requiredNumber(extracted.sleep_latency_minutes, 'sleep latency'),
    tst_minutes: requiredNumber(extracted.tst_minutes, 'total sleep time'),
    waso_minutes: requiredNumber(extracted.waso_minutes, 'WASO'),
    sleep_efficiency_pct: requiredNumber(extracted.sleep_efficiency_pct, 'sleep efficiency'),
    rem_duration_minutes: requiredNumber(extracted.rem_duration_minutes, 'REM duration'),
    rem_pct_tst: requiredNumber(extracted.rem_pct_tst, 'REM percentage'),
    first_rem_onset: optionalTime(extracted.first_rem_onset),
    ahi: requiredNumber(extracted.ahi, 'AHI'),
    sns_pct: requiredNumber(extracted.sns_pct, 'SNS'),
    pns_pct: requiredNumber(extracted.pns_pct, 'PNS'),
    mean_pr: requiredNumber(extracted.mean_pr, 'mean pulse rate'),
    min_pr: requiredNumber(extracted.min_pr, 'minimum pulse rate'),
    min_spo2: requiredNumber(extracted.min_spo2, 'minimum SpO2'),
    hypoxic_burden: requiredNumber(extracted.hypoxic_burden, 'hypoxic burden'),
    signal_quality_pct: requiredNumber(extracted.signal_quality_pct, 'signal quality'),
  }
}

export type PostgrestErrorLike = {
  code?: string | null
  message?: string
  details?: string | null
  hint?: string | null
}

export function summarizeDbValue(value: unknown): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'number') {
    return Number.isFinite(value) ? `number(${value})` : `number(NaN/Infinity)`
  }
  if (typeof value === 'boolean') return `boolean(${value})`
  if (typeof value === 'string') {
    const preview = value.length > 48 ? `${value.slice(0, 48)}…` : value
    return `string("${preview}")`
  }
  return typeof value
}

export function logPostgrestError(
  context: string,
  error: PostgrestErrorLike | null,
  meta?: Record<string, unknown>
) {
  if (!error) return

  console.error(`[TipTraQ] ${context}`, {
    pgCode: error.code ?? null,
    message: error.message ?? null,
    details: error.details ?? null,
    hint: error.hint ?? null,
    ...meta,
  })
}

export function mapStorageUploadError(message: string): string {
  const lower = message.toLowerCase()

  if (lower.includes('bucket') || lower.includes('not found') || lower.includes('does not exist')) {
    return 'TipTraQ storage is not set up yet. Run supabase/run-tiptraq-setup.sql in Supabase SQL Editor.'
  }

  if (lower.includes('row-level security') || lower.includes('policy')) {
    return 'TipTraQ storage permissions are missing. Run supabase/run-tiptraq-setup.sql in Supabase SQL Editor.'
  }

  return 'Failed to store EDF file. Please try again.'
}

export function mapInsertError(message: string): string {
  const lower = message.toLowerCase()

  if (lower.includes('does not exist') || lower.includes('schema cache') || lower.includes('relation')) {
    return 'TipTraQ database tables are not set up yet. Run supabase/run-tiptraq-setup.sql in Supabase SQL Editor.'
  }

  if (lower.includes('foreign key') || lower.includes('profiles')) {
    return 'Your profile record is missing. Sign out, sign in again, then retry the upload.'
  }

  if (lower.includes('duplicate') || lower.includes('unique')) {
    return 'This report date has already been uploaded.'
  }

  if (lower.includes('row-level security') || lower.includes('violates row-level security')) {
    return 'TipTraQ insert permissions are missing. Run supabase/run-tiptraq-setup.sql in Supabase SQL Editor.'
  }

  if (lower.includes('invalid input syntax') && lower.includes('time')) {
    return 'Could not read sleep times from this recording. Check the EDF file and try again.'
  }

  if (lower.includes('numeric field overflow') || lower.includes('out of range')) {
    return 'Sleep metrics from this EDF are out of range. Check the file and try again.'
  }

  if (lower.includes('null value') && lower.includes('not-null')) {
    return 'Required sleep data is missing from this EDF recording.'
  }

  return 'Failed to save night data. Please try again.'
}

export function mapFetchError(message: string): string {
  const lower = message.toLowerCase()

  if (lower.includes('does not exist') || lower.includes('schema cache') || lower.includes('relation')) {
    return 'TipTraQ database tables are not set up yet. Run supabase/run-tiptraq-setup.sql in Supabase SQL Editor.'
  }

  if (lower.includes('row-level security') || lower.includes('policy')) {
    return 'TipTraQ read permissions are missing. Run supabase/run-tiptraq-setup.sql in Supabase SQL Editor.'
  }

  return 'Failed to load night history after upload.'
}

export function mapProfileUpsertError(message: string): string {
  const lower = message.toLowerCase()

  if (lower.includes('does not exist') || lower.includes('schema cache') || lower.includes('relation')) {
    return 'DLMO profile table is not set up yet. Run supabase/run-tiptraq-setup.sql in Supabase SQL Editor.'
  }

  if (lower.includes('row-level security') || lower.includes('policy')) {
    return 'DLMO profile permissions are missing. Run supabase/run-tiptraq-setup.sql in Supabase SQL Editor.'
  }

  return 'Failed to update your body clock profile.'
}
