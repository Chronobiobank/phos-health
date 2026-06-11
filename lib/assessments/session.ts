import type { RiskLevel } from '@/lib/assessments/map-score'
import type { DiagnosticScore } from '@/lib/phos/engine/diagnostic-types'
import type { DailyCueStop } from '@/lib/phos/types'

export const ASSESSMENT_SESSION_KEY = 'phos_assessment_result'

export type AssessmentSessionPayload = {
  assessmentId: string
  photonicAge: number
  calendarAge: number
  lostLightYears: number
  riskLevel: RiskLevel
  lightTimeStart: string
  lightTimeEnd: string
  protocolFocus: string
  protocolHeadline: string
  protocolSupport: string
  confidenceLabel: string
  confidenceScore: number
  confidenceBandMinutes: number
  dailyCueType: string
  dailyCueCopy: string
  cueTimeline: DailyCueStop[]
  consentedChronobiobank: boolean
  domains: DiagnosticScore['domains']
}

export function saveAssessmentSession(payload: AssessmentSessionPayload): void {
  sessionStorage.setItem(ASSESSMENT_SESSION_KEY, JSON.stringify(payload))
}

export function clearAssessmentSession(): void {
  sessionStorage.removeItem(ASSESSMENT_SESSION_KEY)
}

export function loadAssessmentSession(): AssessmentSessionPayload | null {
  const raw = sessionStorage.getItem(ASSESSMENT_SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AssessmentSessionPayload
  } catch {
    return null
  }
}
