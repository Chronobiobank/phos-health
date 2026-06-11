export type ResearchConsentStatus = {
  granted: boolean
  grantedAt: string | null
  revokedAt: string | null
}

export type ResearchContributionStatus = {
  active: boolean
  pseudonymId: string | null
  contributedAt: string | null
  withdrawnAt: string | null
  tier: string | null
}

export type ChronobiobankMemberState = {
  consent: ResearchConsentStatus
  contribution: ResearchContributionStatus
}
