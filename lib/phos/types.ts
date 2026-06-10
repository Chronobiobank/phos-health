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

export type PhosSnapshot = {
  subjectName: string
  calendarAge: number
  photonicAge: number
  lostLightYears: number
  nightsCount: number
  confidenceScore: number | null
  confidenceLabel: string | null
  chronotype: string | null
  lightWindow: { start: string; end: string } | null
  metrics: PhosMetric[]
  nights: PhosNightRow[]
  isSample: boolean
  canUpload: boolean
}
