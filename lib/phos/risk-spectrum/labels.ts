import type { SpectrumNodeId } from '@/lib/phos/risk-spectrum/types'

export type RiskSpectrumLabel = {
  line1: string
  line2: string
  full: string
}

/**
 * Two-line cluster labels — line1 and line2 kept near 6–7 characters each
 * so every column reads with the same visual weight on the rail.
 */
export const RISK_SPECTRUM_LABELS: Record<SpectrumNodeId, RiskSpectrumLabel> = {
  'sleep-rhythm': { line1: 'Fatigue', line2: 'jet lag', full: 'Fatigue and jet lag' },
  'sleep-apnoea': { line1: 'Snoring', line2: 'apnoea', full: 'Sleep apnoea' },
  'immune-system': { line1: 'Vitamin', line2: 'immune', full: 'Vitamin D and immune' },
  'blood-sugar': { line1: 'Glucose', line2: 'insulin', full: 'Diabetes risk' },
  'blood-pressure': { line1: 'Cardiac', line2: 'disease', full: 'Heart disease risk' },
  'brain-health': { line1: 'Neural', line2: 'health', full: 'Brain health' },
  'cancer-risk': { line1: 'Cancer', line2: 'burden', full: 'Cancer risk' },
}

export function labelLinesForNode(id: SpectrumNodeId): readonly [string, string] {
  const { line1, line2 } = RISK_SPECTRUM_LABELS[id]
  return [line1, line2]
}
