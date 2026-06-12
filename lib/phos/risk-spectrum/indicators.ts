import type { SpectrumSeverity } from '@/lib/phos/risk-spectrum/types'

export const SPECTRUM_SEVERITY_STYLES: Record<
  SpectrumSeverity,
  { fill: string; border: string; borderWidth: number; size: number }
> = {
  weak: { fill: '#E8EAED', border: '#B0B5BE', borderWidth: 1.5, size: 9 },
  mild: { fill: '#F6E4EA', border: '#D4A8B4', borderWidth: 1.5, size: 11 },
  moderate: { fill: '#C07070', border: '#8A4545', borderWidth: 2, size: 13 },
  severe: { fill: '#6E3838', border: '#4A2424', borderWidth: 2, size: 16 },
}

export const SPECTRUM_MAX_DOT_PX = Math.max(
  ...Object.values(SPECTRUM_SEVERITY_STYLES).map((style) => style.size),
)

export const SPECTRUM_SEVERITY_LABELS: { severity: SpectrumSeverity; label: string }[] = [
  { severity: 'weak', label: 'Weak' },
  { severity: 'mild', label: 'Mild' },
  { severity: 'moderate', label: 'Moderate' },
  { severity: 'severe', label: 'Severe' },
]

export function dotStyleForSeverity(severity: SpectrumSeverity) {
  const style = SPECTRUM_SEVERITY_STYLES[severity]
  return {
    size: style.size,
    fill: style.fill,
    border: style.border,
    borderWidth: style.borderWidth,
  }
}

export function spectrumDotWrapStyle(size: number) {
  return { width: size, height: size, minWidth: size, minHeight: size }
}

export function isElevatedSeverity(severity: SpectrumSeverity): boolean {
  return severity === 'mild' || severity === 'moderate' || severity === 'severe'
}

export function meanAhiFromValues(ahiValues: number[]): number | null {
  const valid = ahiValues.filter((value) => typeof value === 'number' && !Number.isNaN(value))
  if (valid.length === 0) return null
  const sum = valid.reduce((acc, value) => acc + value, 0)
  return Math.round((sum / valid.length) * 10) / 10
}

/** WHO-style AHI bands for TipTraQ night means. */
export function severityFromMeanAhi(meanAhi: number | null, hasTipTraq: boolean): SpectrumSeverity {
  if (!hasTipTraq || meanAhi == null || Number.isNaN(meanAhi)) return 'weak'
  if (meanAhi >= 30) return 'severe'
  if (meanAhi >= 15) return 'moderate'
  if (meanAhi >= 5) return 'mild'
  return 'weak'
}

function scoreForSeverity(severity: SpectrumSeverity): number {
  switch (severity) {
    case 'weak':
      return 22
    case 'mild':
      return 42
    case 'moderate':
      return 68
    case 'severe':
      return 92
  }
}

export { scoreForSeverity }
