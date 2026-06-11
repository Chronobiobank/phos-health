import type { DiagnosticAnswers } from '@/lib/phos/engine/diagnostic-types'
import type { PhoneObservation } from '@/lib/phos/engine/types'
import { formatMinutesAsClock, parseClockToMinutes, sleepDurationMinutes } from '@/lib/phos/engine/time'

function formatDate(offsetDays: number): string {
  const date = new Date()
  date.setDate(date.getDate() - offsetDays)
  return date.toISOString().slice(0, 10)
}

function stepsFromOutdoorMinutes(outdoorMinutesDaily: number): number {
  if (outdoorMinutesDaily >= 60) return 8200
  if (outdoorMinutesDaily >= 30) return 7000
  if (outdoorMinutesDaily >= 15) return 5800
  return 4200
}

/** Map diagnostic answers to synthetic phone observations for engine parity checks. */
export function observationsFromDiagnostic(answers: DiagnosticAnswers, days = 14): PhoneObservation[] {
  const weekdayDuration = sleepDurationMinutes(answers.weekdaySleepOnset, answers.weekdayWakeTime)
  const weekdayOnsetMinutes = parseClockToMinutes(answers.weekdaySleepOnset) ?? 0
  const weekendOnset = formatMinutesAsClock(weekdayOnsetMinutes + answers.weekendSleepShiftMinutes)
  const weekendDuration = sleepDurationMinutes(weekendOnset, answers.weekdayWakeTime)

  const steps = stepsFromOutdoorMinutes(answers.outdoorMinutesDaily)
  const observations: PhoneObservation[] = []

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date()
    date.setDate(date.getDate() - offset)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6

    observations.push({
      observation_date: formatDate(offset),
      sleep_onset: isWeekend ? weekendOnset : answers.weekdaySleepOnset,
      sleep_offset: answers.weekdayWakeTime,
      sleep_duration_minutes: isWeekend ? weekendDuration : weekdayDuration,
      is_weekend: isWeekend,
      steps,
    })
  }

  return observations
}
