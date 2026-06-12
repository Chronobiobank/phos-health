import { describe, expect, it } from 'vitest'

import {
  chronotypeNoteLines,
  tipTraqBodyClockMetric,
  tipTraqSleepEfficiencyMetric,
  tipTraqTotalSleepMetric,
} from '@/lib/phos/metric-display'

function visualLength(text: string): number {
  return text.replace(/\s/g, '').length
}

describe('TipTraQ dashboard metric display', () => {
  it('keeps label and note lines within one character for symmetry', () => {
    const metrics = [
      tipTraqSleepEfficiencyMetric(3, 25),
      tipTraqTotalSleepMetric(141),
      tipTraqBodyClockMetric('19:52', 'Morning type'),
    ]

    const labelLine1 = metrics.map((metric) => visualLength(metric.labelLines![0]))
    const labelLine2 = metrics.map((metric) => visualLength(metric.labelLines![1]))
    const noteLine1 = metrics.map((metric) => visualLength(metric.noteLines![0]))
    const noteLine2 = metrics.map((metric) => visualLength(metric.noteLines![1]))

    expect(Math.max(...labelLine1) - Math.min(...labelLine1)).toBeLessThanOrEqual(1)
    expect(Math.max(...noteLine1) - Math.min(...noteLine1)).toBeLessThanOrEqual(2)
    expect(Math.max(...noteLine2) - Math.min(...noteLine2)).toBeLessThanOrEqual(1)

    for (const metric of metrics) {
      expect(metric.labelLines).toHaveLength(2)
      expect(metric.noteLines).toHaveLength(2)
    }
  })

  it('maps chronotype notes to two balanced lines', () => {
    expect(chronotypeNoteLines('Morning type')).toEqual(['Morning', 'type'])
    expect(chronotypeNoteLines('Evening type')).toEqual(['Evening', 'type'])
    expect(chronotypeNoteLines(null)).toEqual(['Still', 'pending'])
  })
})
