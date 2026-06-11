import { formToDiagnosticAnswers } from '@/lib/assessments/map-score'
import type { AssessmentSessionPayload } from '@/lib/assessments/session'
import { scoreFromDiagnostic } from '@/lib/phos/engine/diagnostic-score'

export type AssessmentDbRow = {
  chronological_age: number
  postcode_lat: number
  sleep_time: string
  wake_time: string
  screen_after_9pm: boolean
  outdoor_hours: number
  current_d3: boolean
  current_d3_dose: number | null
  risk_level: string
  consented_chronobiobank: boolean
}

function clockFromDbTime(value: string): string {
  return value.slice(0, 5)
}

export function sessionFromAssessmentRow(id: string, row: AssessmentDbRow): AssessmentSessionPayload {
  const score = scoreFromDiagnostic(
    formToDiagnosticAnswers({
      chronological_age: row.chronological_age,
      postcode_lat: Number(row.postcode_lat),
      sleep_time: clockFromDbTime(row.sleep_time),
      wake_time: clockFromDbTime(row.wake_time),
      screen_after_9pm: row.screen_after_9pm,
      outdoor_hours: Number(row.outdoor_hours),
      current_d3: row.current_d3,
      current_d3_dose: row.current_d3_dose,
      consented_chronobiobank: false,
    }),
  )

  return {
    assessmentId: id,
    photonicAge: score.photonicAge,
    calendarAge: score.calendarAge,
    lostLightYears: score.lostLightYears,
    riskLevel: row.risk_level as AssessmentSessionPayload['riskLevel'],
    lightTimeStart: score.lightTime.start,
    lightTimeEnd: score.lightTime.end,
    protocolFocus: score.protocol.focus,
    protocolHeadline: score.protocol.headline,
    protocolSupport: score.protocol.support,
    confidenceLabel: score.confidenceLabel,
    confidenceScore: score.confidenceScore,
    confidenceBandMinutes: score.confidenceBandMinutes,
    dailyCueType: score.lightTime.cueType,
    dailyCueCopy: score.lightTime.cueCopy,
    cueTimeline: score.lightTime.timeline,
    consentedChronobiobank: row.consented_chronobiobank,
    domains: score.domains,
  }
}
