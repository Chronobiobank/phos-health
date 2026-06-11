import type { MemberTier } from '@/lib/phos/engine/types'

export type PhosMetric = {
  label: string
  value: string
  note: string
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
  isSample: boolean
  hasPhoneData: boolean
  canUpload: boolean
  onboardingPath: string
}
