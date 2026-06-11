import type { PhoneObservation } from '@/lib/phos/engine/types'

function parseTimeToMinutes(value: string | null): number | null {
  if (!value) return null
  const [hours, minutes] = value.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null
  return hours * 60 + minutes
}

function formatMinutes(minutes: number): string {
  const normalized = ((minutes % 1440) + 1440) % 1440
  const hours = Math.floor(normalized / 60)
  const mins = normalized % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

function sleepMidpointMinutes(observation: PhoneObservation): number | null {
  const onset = parseTimeToMinutes(observation.sleep_onset)
  if (onset == null) return null

  const duration = observation.sleep_duration_minutes ?? 480
  return onset + duration / 2
}

export function averageSleepMidpoint(observations: PhoneObservation[]): number | null {
  const midpoints = observations.map(sleepMidpointMinutes).filter((value): value is number => value != null)
  if (!midpoints.length) return null
  return midpoints.reduce((sum, value) => sum + value, 0) / midpoints.length
}

export function averageWakeTime(observations: PhoneObservation[]): string | null {
  const offsets = observations
    .map((observation) => parseTimeToMinutes(observation.sleep_offset))
    .filter((value): value is number => value != null)
  if (!offsets.length) return null
  const average = offsets.reduce((sum, value) => sum + value, 0) / offsets.length
  return formatMinutes(Math.round(average))
}

export function socialJetLagMinutes(observations: PhoneObservation[]): number {
  const weekday = observations.filter((observation) => !observation.is_weekend)
  const weekend = observations.filter((observation) => observation.is_weekend)
  const weekdayMid = averageSleepMidpoint(weekday)
  const weekendMid = averageSleepMidpoint(weekend)
  if (weekdayMid == null || weekendMid == null) return 0
  return Math.abs(weekdayMid - weekendMid)
}

export function averageSteps(observations: PhoneObservation[]): number | null {
  const steps = observations.map((observation) => observation.steps).filter((value): value is number => value != null)
  if (!steps.length) return null
  return Math.round(steps.reduce((sum, value) => sum + value, 0) / steps.length)
}

export function generateDemoObservations(days = 90): PhoneObservation[] {
  const observations: PhoneObservation[] = []
  const today = new Date()

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today)
    date.setDate(today.getDate() - offset)
    const day = date.getDay()
    const isWeekend = day === 0 || day === 6

    const weekdayOnset = 23 * 60 + 15
    const weekendOnset = 23 * 60 + 45
    const onsetMinutes = isWeekend ? weekendOnset : weekdayOnset
    const wakeMinutes = isWeekend ? 8 * 60 + 45 : 7 * 60 + 5
    const duration = wakeMinutes > onsetMinutes ? wakeMinutes - onsetMinutes : 1440 - onsetMinutes + wakeMinutes

    observations.push({
      observation_date: date.toISOString().slice(0, 10),
      sleep_onset: formatMinutes(onsetMinutes),
      sleep_offset: formatMinutes(wakeMinutes),
      sleep_duration_minutes: duration,
      is_weekend: isWeekend,
      steps: isWeekend ? 5200 + (offset % 4) * 300 : 7600 + (offset % 5) * 420,
    })
  }

  return observations
}
