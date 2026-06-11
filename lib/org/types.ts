export type EmployerRole = 'admin' | 'viewer'

export type EmployerContext = {
  organisationId: string
  organisationName: string
  role: EmployerRole
}

export type OrgAggregateSnapshot = {
  organisationId: string
  organisationName: string
  memberCount: number
  consentedCount: number
  activeCount: number
  participationPct: number
  avgPhotonicAge: number | null
  avgLostLightYears: number | null
  avgCalendarAge: number | null
  cohortShiftLly: number | null
  estimatedAnnualSavingsGbp: number
  avgConfidenceScore: number | null
  computedAt: string
  isSample: boolean
}
