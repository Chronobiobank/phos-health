export type SpectrumSeverity = 'weak' | 'mild' | 'moderate' | 'severe'

export type SpectrumNodeId =
  | 'sleep-rhythm'
  | 'sleep-apnoea'
  | 'blood-sugar'
  | 'blood-pressure'
  | 'immune-system'
  | 'brain-health'
  | 'cancer-risk'

export type SpectrumNode = {
  id: SpectrumNodeId
  label: string
  labelLines: readonly [string, string]
  score: number
  severity: SpectrumSeverity
  reason: string
  action: string
}

export type TipTraqNightFlags = {
  ahi: number | null
  non_dipper_flag: boolean | null
  rem_delay_flag: boolean | null
  high_sympathetic_flag: boolean | null
}

export type BuildPhotonicRiskSpectrumInput = {
  lostLightYears: number
  lightAlignmentScore: number
  chronotypeEvening: boolean
  hasTipTraq: boolean
  tipTraqNightsCount: number
  meanAhi: number | null
  latestNight: TipTraqNightFlags | null
  hasBloodPanel: boolean
  vitaminDLow: boolean
}
