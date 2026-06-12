import type { MemberTier } from '@/lib/phos/engine/types'
import type { SpectrumNode } from '@/lib/phos/risk-spectrum/types'

export type PhosMetric = {
  label: string
  labelLines?: readonly [string, string]
  value: string
  note: string
  noteLines?: readonly [string, string]
}

export type PhosNightRow = {
  id: string
  date: string
  sleepEfficiency: number | null
  tstMinutes: number | null
  dlmoTime: string | null
}

export type DailyCueStop = {
  time: string
  label: string
  icon: 'anchor' | 'peak' | 'fuel' | 'dim'
  active?: boolean
}

export type PhosSnapshot = {
  subjectName: string
  calendarAge: number
  photonicAge: number
  lostLightYears: number
  nightsCount: number
  tier: MemberTier
  confidenceScore: number | null
  confidenceLabel: string | null
  confidenceBandMinutes: number | null
  chronotype: string | null
  lightWindow: { start: string; end: string } | null
  dailyCueType: string | null
  dailyCueCopy: string | null
  cueTimeline: DailyCueStop[]
  metrics: PhosMetric[]
  nights: PhosNightRow[]
  riskSpectrum: SpectrumNode[]
  isSample: boolean
  hasPhoneData: boolean
  canUpload: boolean
  onboardingPath: string
}
