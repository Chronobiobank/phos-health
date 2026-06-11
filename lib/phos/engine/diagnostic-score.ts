import type { DiagnosticAnswers, DiagnosticScore, ProtocolRecommendation } from '@/lib/phos/engine/diagnostic-types'
import type { DomainResult, LightTimeCue } from '@/lib/phos/engine/types'
import {
  addMinutesToClock,
  circularMinutesDiff,
  formatMinutesAsClock,
  normalizeMinutes,
  parseClockToMinutes,
  sleepMidpointMinutes,
} from '@/lib/phos/engine/time'

const IDEAL_SLEEP_MIDPOINT_MINUTES = 3 * 60 + 30
const MAX_LOST_LIGHT_YEARS = 14

function round1(value: number): number {
  return Math.round(value * 10) / 10
}

function confidenceLabel(score: number): string {
  if (score >= 80) return 'High'
  if (score >= 55) return 'Moderate'
  return 'Wide'
}

function buildLightTimeCue(wakeTime: string): LightTimeCue {
  const anchor = addMinutesToClock(wakeTime, 30)
  const peak = addMinutesToClock(anchor, 390)
  const fuel = addMinutesToClock(anchor, 660)
  const dim = addMinutesToClock(anchor, 780)

  return {
    start: anchor,
    end: peak,
    cueType: 'Anchor',
    cueCopy: `Catch first light, before ${anchor}.`,
    timeline: [
      { time: anchor, label: 'Anchor', icon: 'anchor', active: true },
      { time: peak, label: 'Peak', icon: 'peak' },
      { time: fuel, label: 'Fuel', icon: 'fuel' },
      { time: dim, label: 'Dim', icon: 'dim' },
    ],
  }
}

/** D1 — body clock phase drift from ideal 03:30 sleep midpoint. */
export function computeD1PhaseDrift(sleepMidpointMinutes: number): {
  phaseDeviationHours: number
  contribution: number
} {
  const normalized = normalizeMinutes(sleepMidpointMinutes)
  const phaseDeviationHours =
    circularMinutesDiff(normalized, IDEAL_SLEEP_MIDPOINT_MINUTES) / 60
  const contribution = Math.min(2.8, phaseDeviationHours * 0.55)
  return { phaseDeviationHours, contribution }
}

/** D2 — social jet lag between weekday and weekend midpoints. */
export function computeD2SocialJetLag(weekdayMidpoint: number, weekendMidpoint: number): {
  jetLagMinutes: number
  contribution: number
} {
  const jetLagMinutes = circularMinutesDiff(
    normalizeMinutes(weekdayMidpoint),
    normalizeMinutes(weekendMidpoint),
  )
  const contribution = Math.min(1.8, jetLagMinutes / 45)
  return { jetLagMinutes, contribution }
}

/** D3 — personal light load from latitude, screen habits, and outdoor exposure. */
export function computeD3PersonalLight(input: {
  latitude: number
  eveningScreenHours: number
  outdoorMinutesDaily: number
}): {
  latitudePenalty: number
  screenPenalty: number
  outdoorPenalty: number
  contribution: number
} {
  const { latitude, eveningScreenHours, outdoorMinutesDaily } = input
  const absLat = Math.abs(latitude)

  const latitudePenalty = absLat > 55 ? 0.4 : absLat > 50 ? 0.35 : absLat > 45 ? 0.2 : 0.1

  const clampedScreen = Math.max(0, Math.min(6, eveningScreenHours))
  const screenPenalty = Math.min(0.5, clampedScreen * 0.1)

  const outdoorPenalty =
    outdoorMinutesDaily >= 60 ? 0.05 : outdoorMinutesDaily >= 30 ? 0.15 : outdoorMinutesDaily >= 15 ? 0.28 : 0.45

  const contribution = Math.min(1.6, latitudePenalty + screenPenalty + outdoorPenalty)

  return { latitudePenalty, screenPenalty, outdoorPenalty, contribution }
}

export function recommendProtocol(domains: DomainResult[]): ProtocolRecommendation {
  const sorted = [...domains].sort(
    (a, b) => b.lostLightYearsContribution - a.lostLightYearsContribution,
  )
  const top = sorted[0]

  if (!top || top.lostLightYearsContribution <= 0.4) {
    return {
      focus: 'balanced',
      headline: 'Hold your rhythm.',
      support: 'Keep morning light and a steady sleep window.',
    }
  }

  if (top.key === 'd1') {
    return {
      focus: 'anchor',
      headline: 'Reset your anchor window.',
      support: 'Fix wake time and catch first outdoor light within 30 minutes.',
    }
  }

  if (top.key === 'd2') {
    return {
      focus: 'weekend_sync',
      headline: 'Close the weekend gap.',
      support: 'Keep sleep onset within 45 minutes of your weekday time.',
    }
  }

  return {
    focus: 'light_hygiene',
    headline: 'Recover your light budget.',
    support: 'Cut evening screens and add outdoor minutes before noon.',
  }
}

function weekendSleepOnset(weekdayOnset: string, shiftMinutes: number): string {
  const onset = parseClockToMinutes(weekdayOnset)
  if (onset == null) return weekdayOnset
  return formatMinutesAsClock(onset + shiftMinutes)
}

/**
 * Pure diagnostic score from seven self-reported answers.
 * Produces Photonic Age, Lost Light Years, Light Time, and a protocol focus.
 */
export function scoreFromDiagnostic(answers: DiagnosticAnswers): DiagnosticScore {
  if (answers.calendarAge < 16 || answers.calendarAge > 100) {
    throw new Error('calendarAge must be between 16 and 100.')
  }
  if (answers.latitude < -90 || answers.latitude > 90) {
    throw new Error('latitude must be between -90 and 90.')
  }
  if (parseClockToMinutes(answers.weekdayWakeTime) == null) {
    throw new Error('weekdayWakeTime must be HH:MM.')
  }
  if (parseClockToMinutes(answers.weekdaySleepOnset) == null) {
    throw new Error('weekdaySleepOnset must be HH:MM.')
  }

  const weekdayMidpoint = sleepMidpointMinutes(answers.weekdaySleepOnset, answers.weekdayWakeTime)
  const weekendOnset = weekendSleepOnset(answers.weekdaySleepOnset, answers.weekendSleepShiftMinutes)
  const weekendMidpoint = sleepMidpointMinutes(weekendOnset, answers.weekdayWakeTime)

  const d1 = computeD1PhaseDrift(weekdayMidpoint)
  const d2 = computeD2SocialJetLag(weekdayMidpoint, weekendMidpoint)
  const d3 = computeD3PersonalLight({
    latitude: answers.latitude,
    eveningScreenHours: answers.eveningScreenHours,
    outdoorMinutesDaily: answers.outdoorMinutesDaily,
  })

  const confidenceScore = 34
  const confidenceBandMinutes = 150

  const domains: DomainResult[] = [
    {
      key: 'd1',
      label: 'Body clock phase',
      value: round1(d1.phaseDeviationHours),
      unit: 'h drift',
      source: 'diagnostic_sleep_midpoint',
      confidence: 30,
      lostLightYearsContribution: round1(d1.contribution),
    },
    {
      key: 'd2',
      label: 'Social jet lag',
      value: Math.round(d2.jetLagMinutes),
      unit: 'min',
      source: 'diagnostic_weekend_shift',
      confidence: 32,
      lostLightYearsContribution: round1(d2.contribution),
    },
    {
      key: 'd3',
      label: 'Personal light',
      value: round1(d3.contribution),
      unit: 'index',
      source: 'diagnostic_light_exposure',
      confidence: 28,
      lostLightYearsContribution: round1(d3.contribution),
    },
  ]

  const lostLightYears = round1(
    Math.min(MAX_LOST_LIGHT_YEARS, domains.reduce((sum, domain) => sum + domain.lostLightYearsContribution, 0)),
  )
  const photonicAge = round1(answers.calendarAge + lostLightYears)
  const lightTime = buildLightTimeCue(answers.weekdayWakeTime)
  const protocol = recommendProtocol(domains)

  return {
    calendarAge: answers.calendarAge,
    photonicAge,
    lostLightYears,
    confidenceScore,
    confidenceBandMinutes,
    confidenceLabel: confidenceLabel(confidenceScore),
    domains,
    lightTime,
    protocol,
    provenance: {
      source: 'diagnostic',
      latitude: answers.latitude,
      weekdaySleepMidpointMinutes: weekdayMidpoint,
      weekendSleepMidpointMinutes: weekendMidpoint,
      socialJetLagMinutes: d2.jetLagMinutes,
    },
  }
}
