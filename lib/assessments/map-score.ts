import type { DiagnosticAnswers } from '@/lib/phos/engine/diagnostic-types'
import { scoreFromDiagnostic } from '@/lib/phos/engine/diagnostic-score'

export type AssessmentFormInput = {
  chronological_age: number
  postcode_lat: number
  sleep_time: string
  wake_time: string
  screen_after_9pm: boolean
  outdoor_hours: number
  current_d3: boolean
  current_d3_dose: number | null
  consented_chronobiobank: boolean
}

export type RiskLevel = 'low' | 'elevated' | 'high'

function toClock(value: string): string {
  const trimmed = value.trim()
  const match = /^(\d{1,2}):(\d{2})$/.exec(trimmed)
  if (!match) return trimmed
  return `${match[1].padStart(2, '0')}:${match[2]}`
}

function toPgTime(value: string): string {
  const clock = toClock(value)
  return clock.length === 5 ? `${clock}:00` : clock
}

export function riskLevelFromLostLightYears(lostLightYears: number): RiskLevel {
  if (lostLightYears < 2) return 'low'
  if (lostLightYears <= 4) return 'elevated'
  return 'high'
}

export function formToDiagnosticAnswers(input: AssessmentFormInput): DiagnosticAnswers {
  return {
    calendarAge: input.chronological_age,
    latitude: Number(input.postcode_lat),
    weekdayWakeTime: toClock(input.wake_time),
    weekdaySleepOnset: toClock(input.sleep_time),
    weekendSleepShiftMinutes: input.screen_after_9pm ? 90 : 30,
    eveningScreenHours: input.screen_after_9pm ? 3.5 : 0.25,
    outdoorMinutesDaily: Math.round(input.outdoor_hours * 60),
  }
}

export function buildAssessmentRow(input: AssessmentFormInput) {
  const score = scoreFromDiagnostic(formToDiagnosticAnswers(input))

  return {
    chronological_age: input.chronological_age,
    postcode_lat: Number(input.postcode_lat.toFixed(4)),
    sleep_time: toPgTime(input.sleep_time),
    wake_time: toPgTime(input.wake_time),
    screen_after_9pm: input.screen_after_9pm,
    outdoor_hours: Number(input.outdoor_hours.toFixed(1)),
    current_d3: input.current_d3,
    current_d3_dose: input.current_d3 ? input.current_d3_dose : null,
    photonic_age: score.photonicAge,
    lost_light_years: score.lostLightYears,
    light_time_start: toPgTime(score.lightTime.start),
    light_time_end: toPgTime(score.lightTime.end),
    risk_level: riskLevelFromLostLightYears(score.lostLightYears),
    protocol_recommended: score.protocol.focus,
    consented_chronobiobank: input.consented_chronobiobank,
    score,
  }
}
