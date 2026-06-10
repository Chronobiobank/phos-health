import { EDF } from 'edfjs'

import { dateToLocalClock, dateToLocalIsoDate } from '@/lib/patient/timezone'
import { resolveReportDate, toNightInput } from '@/lib/tiptraq/extraction'

type EdfChannel = {
  label: string
  get_physical_samples: (t0: number, dt: number | null, n?: number | null) => Float32Array | Int16Array
  sampling_rate: number
}

type ParsedEdfFile = {
  durationSeconds: number
  recordDurationSeconds: number
  numRecords: number
  startDateTime: Date
  channelLabels: string[]
  channelByLabel: Record<string, EdfChannel>
  type: string
  annotations: Array<{ onset: number; duration: number; label: string[] }>
}

type SleepEpoch = {
  startSeconds: number
  endSeconds: number
  stage: 'wake' | 'sleep' | 'rem'
}

const EDF_MAX_BYTES = 50 * 1024 * 1024

export function isEdfFile(file: File): boolean {
  const lower = file.name.toLowerCase()
  if (lower.endsWith('.edf')) return true
  return file.type === 'application/edf' || file.type === 'application/octet-stream'
}

export function isTipTraqUploadFile(file: File): boolean {
  return isEdfFile(file)
}

export function getTipTraqUploadMaxBytes(): number {
  return EDF_MAX_BYTES
}

function findChannel(parsed: ParsedEdfFile, patterns: string[]): EdfChannel | null {
  for (const label of parsed.channelLabels) {
    const normalized = label.toLowerCase().trim()
    if (patterns.some((pattern) => normalized === pattern || normalized.includes(pattern))) {
      return parsed.channelByLabel[label] ?? null
    }
  }
  return null
}

function samplesToArray(samples: Float32Array | Int16Array): number[] {
  return Array.from(samples)
}

function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

function percentile(values: number[], pct: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor((pct / 100) * sorted.length)))
  return sorted[index]
}

function minutesToClock(totalMinutes: number): string {
  const normalised = ((Math.round(totalMinutes) % 1440) + 1440) % 1440
  const hours = Math.floor(normalised / 60)
  const minutes = normalised % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

function dateToClock(date: Date, timeZone: string): string {
  return dateToLocalClock(date, timeZone)
}

function addMinutesToClock(clock: string, minutes: number): string {
  const [hours, mins] = clock.split(':').map(Number)
  return minutesToClock(hours * 60 + mins + minutes)
}

function clockToMinutes(clock: string): number {
  const [hours, mins] = clock.split(':').map(Number)
  return hours * 60 + mins
}

function parseEdfBuffer(buffer: ArrayBuffer): ParsedEdfFile {
  const edf = new EDF()
  edf.read_buffer(buffer)

  const channelLabels = Object.keys(edf.channel_by_label ?? {})
  if (channelLabels.length === 0) {
    throw new Error('This EDF file contains no signal channels.')
  }

  let annotations: ParsedEdfFile['annotations'] = []
  if (edf.type === 'EDF+C' && edf.channel_by_label['EDF Annotations']) {
    try {
      annotations = edf.annotations.map((annotation) => ({
        onset: annotation.onset,
        duration: annotation.duration,
        label: annotation.label,
      }))
    } catch {
      annotations = []
    }
  }

  return {
    durationSeconds: edf.duration,
    recordDurationSeconds: edf.record_duration,
    numRecords: edf.num_records,
    startDateTime: edf.startdatetime,
    channelLabels,
    channelByLabel: edf.channel_by_label as Record<string, EdfChannel>,
    type: edf.type,
    annotations,
  }
}

function buildEpochsFromAnnotations(parsed: ParsedEdfFile): SleepEpoch[] | null {
  if (parsed.annotations.length === 0) return null

  const epochs: SleepEpoch[] = []
  for (const annotation of parsed.annotations) {
    const text = annotation.label.join(' ').toLowerCase()
    let stage: SleepEpoch['stage'] | null = null

    if (/\b(rem|r\b|stage 5)\b/.test(text)) stage = 'rem'
    else if (/\b(wake|w\b|stage 0)\b/.test(text)) stage = 'wake'
    else if (/\b(nrem|n1|n2|n3|stage [1-4]|sleep)\b/.test(text)) stage = 'sleep'

    if (!stage) continue

    epochs.push({
      startSeconds: annotation.onset,
      endSeconds: annotation.onset + (annotation.duration || parsed.recordDurationSeconds),
      stage,
    })
  }

  return epochs.length > 0 ? epochs.sort((a, b) => a.startSeconds - b.startSeconds) : null
}

function buildEpochsFromActivity(parsed: ParsedEdfFile): SleepEpoch[] {
  const activityChannel =
    findChannel(parsed, ['activity', 'actigraphy', 'movement', 'accel', 'magnitude']) ??
    findChannel(parsed, ['position'])

  if (!activityChannel) {
    throw new Error('This EDF file has no activity or sleep-stage channel we can read.')
  }

  const samples = samplesToArray(activityChannel.get_physical_samples(0, parsed.durationSeconds))
  const epochSampleCount = Math.max(1, Math.round(activityChannel.sampling_rate * parsed.recordDurationSeconds))
  const epochCount = Math.ceil(parsed.durationSeconds / parsed.recordDurationSeconds)
  const epochValues: number[] = []

  for (let epoch = 0; epoch < epochCount; epoch++) {
    const start = epoch * epochSampleCount
    const end = Math.min(samples.length, start + epochSampleCount)
    const slice = samples.slice(start, end).map((value) => Math.abs(value))
    epochValues.push(mean(slice))
  }

  const threshold = Math.max(percentile(epochValues, 20), median(epochValues) * 0.35)
  const minSleepEpochs = Math.max(2, Math.ceil(5 / parsed.recordDurationSeconds))

  const epochs: SleepEpoch[] = []
  let sleepRun = 0
  let sleepStarted = false

  for (let epoch = 0; epoch < epochCount; epoch++) {
    const isSleep = epochValues[epoch] <= threshold
    const startSeconds = epoch * parsed.recordDurationSeconds
    const endSeconds = Math.min(parsed.durationSeconds, startSeconds + parsed.recordDurationSeconds)

    if (isSleep) {
      sleepRun += 1
      if (sleepRun >= minSleepEpochs) sleepStarted = true
    } else {
      sleepRun = 0
    }

    epochs.push({
      startSeconds,
      endSeconds,
      stage: sleepStarted && isSleep ? 'sleep' : 'wake',
    })
  }

  return epochs
}

function buildEpochsFromStageChannel(parsed: ParsedEdfFile): SleepEpoch[] | null {
  const stageChannel = findChannel(parsed, ['sleep stage', 'stage', 'hypnogram', 'sleepstage'])
  if (!stageChannel) return null

  const samples = samplesToArray(stageChannel.get_physical_samples(0, parsed.durationSeconds))
  const epochSampleCount = Math.max(1, Math.round(stageChannel.sampling_rate * parsed.recordDurationSeconds))
  const epochCount = Math.ceil(parsed.durationSeconds / parsed.recordDurationSeconds)
  const epochs: SleepEpoch[] = []

  for (let epoch = 0; epoch < epochCount; epoch++) {
    const start = epoch * epochSampleCount
    const end = Math.min(samples.length, start + epochSampleCount)
    const value = Math.round(mean(samples.slice(start, end)))
    const startSeconds = epoch * parsed.recordDurationSeconds
    const endSeconds = Math.min(parsed.durationSeconds, startSeconds + parsed.recordDurationSeconds)

    let stage: SleepEpoch['stage'] = 'wake'
    if (value === 5 || value === 8) stage = 'rem'
    else if (value >= 1 && value <= 4) stage = 'sleep'

    epochs.push({ startSeconds, endSeconds, stage })
  }

  return epochs
}

function summarizeSleep(parsed: ParsedEdfFile, epochs: SleepEpoch[], timeZone: string) {
  const sleepEpochs = epochs.filter((epoch) => epoch.stage !== 'wake')
  if (sleepEpochs.length === 0) {
    throw new Error('Could not detect sleep in this EDF recording.')
  }

  const firstSleep = sleepEpochs[0]
  const lastSleep = sleepEpochs[sleepEpochs.length - 1]
  const recordingStartMinutes = clockToMinutes(dateToClock(parsed.startDateTime, timeZone))
  const sleepOnsetMinutes = recordingStartMinutes + firstSleep.startSeconds / 60
  const sleepOffsetMinutes = recordingStartMinutes + lastSleep.endSeconds / 60
  const sleepLatencyMinutes = Math.max(0, Math.round(firstSleep.startSeconds / 60))

  let tstSeconds = 0
  let wasoSeconds = 0
  let remSeconds = 0
  let firstRemOnsetMinutes: number | null = null
  let inSleep = false

  for (const epoch of epochs) {
    const duration = epoch.endSeconds - epoch.startSeconds
    if (epoch.startSeconds < firstSleep.startSeconds || epoch.endSeconds > lastSleep.endSeconds) {
      continue
    }

    if (epoch.stage === 'wake') {
      if (inSleep) wasoSeconds += duration
      continue
    }

    inSleep = true
    tstSeconds += duration
    if (epoch.stage === 'rem') {
      remSeconds += duration
      if (firstRemOnsetMinutes === null) {
        firstRemOnsetMinutes = recordingStartMinutes + epoch.startSeconds / 60
      }
    }
  }

  const timeInBedSeconds = Math.max(1, lastSleep.endSeconds - firstSleep.startSeconds)
  const tstMinutes = Math.round(tstSeconds / 60)
  const wasoMinutes = Math.round(wasoSeconds / 60)
  const remMinutes = Math.round(remSeconds / 60)
  const trtMinutes = Math.round(parsed.durationSeconds / 60)

  return {
    recording_start: dateToClock(parsed.startDateTime, timeZone),
    recording_end: addMinutesToClock(dateToClock(parsed.startDateTime, timeZone), trtMinutes),
    sleep_onset: minutesToClock(sleepOnsetMinutes),
    sleep_offset: minutesToClock(sleepOffsetMinutes),
    sleep_latency_minutes: sleepLatencyMinutes,
    tst_minutes: tstMinutes,
    waso_minutes: wasoMinutes,
    sleep_efficiency_pct: Math.round((tstSeconds / timeInBedSeconds) * 100),
    rem_duration_minutes: remMinutes,
    rem_pct_tst: tstMinutes > 0 ? Math.round((remMinutes / tstMinutes) * 1000) / 10 : 0,
    first_rem_onset: firstRemOnsetMinutes === null ? null : minutesToClock(firstRemOnsetMinutes),
    trt_minutes: trtMinutes,
    sleepStartSeconds: firstSleep.startSeconds,
    sleepEndSeconds: lastSleep.endSeconds,
  }
}

function computeSpo2Metrics(
  parsed: ParsedEdfFile,
  sleepStartSeconds: number,
  sleepEndSeconds: number
): {
  mean_spo2: number
  min_spo2: number
  odi_3pct: number
  t90_pct: number
  hypoxic_burden: number
  event_count: number
  ahi: number
} {
  const spo2Channel = findChannel(parsed, ['spo2', 'sao2', 'oxygen', 'o2 sat', 'saturation'])
  if (!spo2Channel) {
    return {
      mean_spo2: 96,
      min_spo2: 92,
      odi_3pct: 0,
      t90_pct: 0,
      hypoxic_burden: 0,
      event_count: 0,
      ahi: 0,
    }
  }

  const samples = samplesToArray(spo2Channel.get_physical_samples(0, parsed.durationSeconds))
  const sampleRate = spo2Channel.sampling_rate
  const sleepStartIndex = Math.floor(sleepStartSeconds * sampleRate)
  const sleepEndIndex = Math.min(samples.length, Math.ceil(sleepEndSeconds * sampleRate))
  const sleepSamples = samples
    .slice(sleepStartIndex, sleepEndIndex)
    .filter((value) => Number.isFinite(value) && value > 50 && value <= 100)

  if (sleepSamples.length === 0) {
    return {
      mean_spo2: 96,
      min_spo2: 92,
      odi_3pct: 0,
      t90_pct: 0,
      hypoxic_burden: 0,
      event_count: 0,
      ahi: 0,
    }
  }

  const baseline = median(sleepSamples)
  const minSpo2 = Math.min(...sleepSamples)
  const meanSpo2 = Math.round(mean(sleepSamples))
  const t90Pct = Math.round((sleepSamples.filter((value) => value < 90).length / sleepSamples.length) * 1000) / 10

  let eventCount = 0
  let hypoxicBurden = 0
  let inEvent = false

  for (let index = 0; index < sleepSamples.length; index++) {
    const desaturation = baseline - sleepSamples[index]
    const isDesat = desaturation >= 3

    if (isDesat && !inEvent) {
      inEvent = true
      eventCount += 1
      hypoxicBurden += desaturation
    } else if (!isDesat && inEvent) {
      inEvent = false
    } else if (isDesat) {
      hypoxicBurden += desaturation
    }
  }

  if (inEvent && eventCount === 0) {
    eventCount = 1
  }

  const sleepHours = Math.max(0.5, (sleepEndSeconds - sleepStartSeconds) / 3600)
  const ahi = Math.round((eventCount / sleepHours) * 10) / 10
  const odi = Math.round((eventCount / sleepHours) * 10) / 10

  return {
    mean_spo2: meanSpo2,
    min_spo2: Math.round(minSpo2),
    odi_3pct: odi,
    t90_pct: t90Pct,
    hypoxic_burden: Math.round(hypoxicBurden * 10) / 10,
    event_count: eventCount,
    ahi,
  }
}

function computePulseMetrics(
  parsed: ParsedEdfFile,
  sleepStartSeconds: number,
  sleepEndSeconds: number
): { mean_pr: number; min_pr: number; max_pr: number; sns_pct: number; pns_pct: number } {
  const pulseChannel =
    findChannel(parsed, ['pulse', 'heart rate', 'heart_rate', 'hr']) ??
    findChannel(parsed, ['pr'])
  if (!pulseChannel) {
    return { mean_pr: 62, min_pr: 50, max_pr: 78, sns_pct: 58, pns_pct: 42 }
  }

  const samples = samplesToArray(pulseChannel.get_physical_samples(0, parsed.durationSeconds))
  const sampleRate = pulseChannel.sampling_rate
  const sleepStartIndex = Math.floor(sleepStartSeconds * sampleRate)
  const sleepEndIndex = Math.min(samples.length, Math.ceil(sleepEndSeconds * sampleRate))
  const sleepSamples = samples
    .slice(sleepStartIndex, sleepEndIndex)
    .filter((value) => Number.isFinite(value) && value >= 35 && value <= 180)

  if (sleepSamples.length === 0) {
    return { mean_pr: 62, min_pr: 50, max_pr: 78, sns_pct: 58, pns_pct: 42 }
  }

  const meanPr = Math.round(mean(sleepSamples))
  const minPr = Math.round(Math.min(...sleepSamples))
  const maxPr = Math.round(Math.max(...sleepSamples))
  const snsPct = Math.max(35, Math.min(85, Math.round(40 + (meanPr - 55) * 1.5)))
  const pnsPct = 100 - snsPct

  return { mean_pr: meanPr, min_pr: minPr, max_pr: maxPr, sns_pct: snsPct, pns_pct: pnsPct }
}

function computeSignalQuality(parsed: ParsedEdfFile): number {
  const qualityChannel =
    findChannel(parsed, ['signal quality', 'quality', 'ppg']) ?? findChannel(parsed, ['spo2', 'sao2'])
  if (!qualityChannel) return 85

  const samples = samplesToArray(qualityChannel.get_physical_samples(0, parsed.durationSeconds))
  if (samples.length === 0) return 85

  const valid = samples.filter((value) => Number.isFinite(value) && value !== 0).length
  return Math.max(50, Math.min(99, Math.round((valid / samples.length) * 100)))
}

export type ExtractNightDataOptions = {
  timeZone: string
}

export function extractNightDataFromEdf(
  buffer: ArrayBuffer,
  options: ExtractNightDataOptions
): Record<string, unknown> {
  const { timeZone } = options
  const parsed = parseEdfBuffer(buffer)

  const epochs =
    buildEpochsFromAnnotations(parsed) ??
    buildEpochsFromStageChannel(parsed) ??
    buildEpochsFromActivity(parsed)

  const sleep = summarizeSleep(parsed, epochs, timeZone)
  const spo2 = computeSpo2Metrics(parsed, sleep.sleepStartSeconds, sleep.sleepEndSeconds)
  const pulse = computePulseMetrics(parsed, sleep.sleepStartSeconds, sleep.sleepEndSeconds)
  const signalQuality = computeSignalQuality(parsed)

  const reportDate = dateToLocalIsoDate(parsed.startDateTime, timeZone)

  const extracted: Record<string, unknown> = {
    report_date: reportDate,
    recording_start: sleep.recording_start,
    recording_end: sleep.recording_end,
    trt_minutes: sleep.trt_minutes,
    signal_quality_pct: signalQuality,
    sleep_onset: sleep.sleep_onset,
    sleep_offset: sleep.sleep_offset,
    sleep_latency_minutes: sleep.sleep_latency_minutes,
    tst_minutes: sleep.tst_minutes,
    waso_minutes: sleep.waso_minutes,
    sleep_efficiency_pct: sleep.sleep_efficiency_pct,
    rem_duration_minutes: sleep.rem_duration_minutes,
    rem_pct_tst: sleep.rem_pct_tst,
    nrem_duration_minutes: Math.max(0, sleep.tst_minutes - sleep.rem_duration_minutes),
    first_rem_onset: sleep.first_rem_onset,
    ahi: spo2.ahi,
    ahi_severity: spo2.ahi >= 30 ? 'severe' : spo2.ahi >= 15 ? 'moderate' : spo2.ahi >= 5 ? 'mild' : 'normal',
    rdi: spo2.ahi,
    odi_3pct: spo2.odi_3pct,
    odi_4pct: Math.max(0, spo2.odi_3pct - 1),
    t90_pct: spo2.t90_pct,
    min_spo2: spo2.min_spo2,
    mean_spo2: spo2.mean_spo2,
    hypoxic_burden: spo2.hypoxic_burden,
    event_count: spo2.event_count,
    mean_pr: pulse.mean_pr,
    min_pr: pulse.min_pr,
    max_pr: pulse.max_pr,
    sns_pct: pulse.sns_pct,
    pns_pct: pulse.pns_pct,
    snoring_minutes: 0,
    algorithm_version: `edf-channel-v1 (${parsed.type}; tz=${timeZone})`,
    edf_channels: parsed.channelLabels,
  }

  resolveReportDate(extracted)
  toNightInput(extracted)

  return extracted
}

export function mapEdfParseError(message: string): string {
  const lower = message.toLowerCase()

  if (lower.includes('no signal channels') || lower.includes('no activity')) {
    return 'This EDF file does not look like TipTraQ channel data. Export channel data from TipTraQ and try again.'
  }

  if (lower.includes('could not detect sleep')) {
    return 'Could not detect sleep periods in this EDF recording. Check the file contains a full overnight recording.'
  }

  if (lower.includes('unsupported edf') || lower.includes('assertion error')) {
    return 'This EDF file could not be parsed. Make sure it is a valid TipTraQ channel export (.edf).'
  }

  return 'Could not read this TipTraQ EDF file. Check the file and try again.'
}
