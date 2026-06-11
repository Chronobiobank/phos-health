import type { DomainResult, LightTimeCue } from '@/lib/phos/engine/types'

/** Seven-question diagnostic intake (no phone sync required). */
export type DiagnosticAnswers = {
  /** Q1 — calendar age in years */
  calendarAge: number
  /** Q2 — home latitude (decimal degrees, e.g. 51.5 for London) */
  latitude: number
  /** Q3 — weekday wake time HH:MM */
  weekdayWakeTime: string
  /** Q4 — weekday sleep onset HH:MM */
  weekdaySleepOnset: string
  /** Q5 — weekend sleep onset shift vs weekday (minutes later; negative = earlier) */
  weekendSleepShiftMinutes: number
  /** Q6 — average evening screen use in the 2h before bed (hours, 0–6) */
  eveningScreenHours: number
  /** Q7 — average daily outdoor daylight exposure (minutes) */
  outdoorMinutesDaily: number
}

export type ProtocolFocus = 'anchor' | 'weekend_sync' | 'light_hygiene' | 'balanced'

export type ProtocolRecommendation = {
  focus: ProtocolFocus
  headline: string
  support: string
}

export type DiagnosticScore = {
  calendarAge: number
  photonicAge: number
  lostLightYears: number
  confidenceScore: number
  confidenceBandMinutes: number
  confidenceLabel: string
  domains: DomainResult[]
  lightTime: LightTimeCue
  protocol: ProtocolRecommendation
  provenance: {
    source: 'diagnostic'
    latitude: number
    weekdaySleepMidpointMinutes: number
    weekendSleepMidpointMinutes: number
    socialJetLagMinutes: number
  }
}
