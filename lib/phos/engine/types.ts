export type MemberTier = 'free' | 'basic' | 'premium'

export type PhoneObservation = {
  observation_date: string
  sleep_onset: string | null
  sleep_offset: string | null
  sleep_duration_minutes: number | null
  is_weekend: boolean
  steps: number | null
}

export type DomainKey = 'd1' | 'd2' | 'd3'

export type DomainResult = {
  key: DomainKey
  label: string
  value: number
  unit: string
  source: string
  confidence: number
  lostLightYearsContribution: number
}

export type LightTimeCue = {
  start: string
  end: string
  cueType: string
  cueCopy: string
  timeline: Array<{
    time: string
    label: string
    icon: 'anchor' | 'peak' | 'fuel' | 'dim'
    active?: boolean
  }>
}

export type PhotonicAgeComputation = {
  tier: MemberTier
  calendarAge: number
  photonicAge: number
  lostLightYears: number
  confidenceScore: number
  confidenceBandMinutes: number
  confidenceLabel: string
  domains: DomainResult[]
  lightTime: LightTimeCue
  provenance: Record<string, unknown>
}

export type PremiumD1Input = {
  mluxPhaseMinutes: number | null
  confidenceScore: number | null
  confidenceBandMinutes: number | null
  confidenceLabel: string | null
  chronotype: string | null
  lightWindowStart: string | null
  lightWindowEnd: string | null
}
