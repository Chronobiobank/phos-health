function ageBand(calendarAge: number | null | undefined): string | null {
  if (calendarAge == null) return null
  if (calendarAge < 30) return '18-29'
  if (calendarAge < 40) return '30-39'
  if (calendarAge < 50) return '40-49'
  if (calendarAge < 60) return '50-59'
  return '60+'
}

export function buildDeidentifiedPayload(input: {
  tier: string
  photonicAge: number
  lostLightYears: number
  confidenceScore: number
  confidenceBandMinutes: number
  calendarAge: number | null
  d1Source: string | null
  d2Value: number | null
  d3Source: string | null
  region: string | null
  provenance: Record<string, unknown> | null
}): Record<string, unknown> {
  const observationCount = (input.provenance as { observationCount?: number } | null)?.observationCount

  return {
    tier: input.tier,
    photonic_age: input.photonicAge,
    lost_light_years: input.lostLightYears,
    confidence_score: input.confidenceScore,
    confidence_band_minutes: input.confidenceBandMinutes,
    d1_source: input.d1Source,
    d2_social_jet_lag_min: input.d2Value,
    d3_source: input.d3Source,
    age_band: ageBand(input.calendarAge),
    region: input.region ?? 'Unknown',
    observation_count: observationCount ?? null,
  }
}
