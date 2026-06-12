import { describe, expect, it } from 'vitest'

import { RISK_SPECTRUM_LABELS } from '@/lib/phos/risk-spectrum/labels'

function visualLength(text: string): number {
  return text.replace(/\s/g, '').length
}

describe('RISK_SPECTRUM_LABELS', () => {
  it('keeps display lines within one character for visual symmetry', () => {
    const entries = Object.values(RISK_SPECTRUM_LABELS)
    const line1Lengths = entries.map(({ line1 }) => visualLength(line1))
    const line2Lengths = entries.map(({ line2 }) => visualLength(line2))

    expect(Math.max(...line1Lengths) - Math.min(...line1Lengths)).toBeLessThanOrEqual(1)
    expect(Math.max(...line2Lengths) - Math.min(...line2Lengths)).toBeLessThanOrEqual(1)

    for (const { line1, line2 } of entries) {
      expect(Math.abs(visualLength(line1) - visualLength(line2))).toBeLessThanOrEqual(1)
    }
  })
})
