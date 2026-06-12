import type { PhosMetric } from '@/lib/phos/types'

export function chronotypeNoteLines(chronotype: string | null | undefined): readonly [string, string] {
  if (!chronotype) return ['Still', 'pending']

  if (/morning/i.test(chronotype)) return ['Morning', 'type']
  if (/evening/i.test(chronotype)) return ['Evening', 'type']
  if (/intermediate|mid/i.test(chronotype)) return ['Mid', 'range']

  const parts = chronotype.trim().split(/\s+/)
  if (parts.length >= 2) return [parts[0], parts.slice(1).join(' ')]
  return [parts[0], 'type']
}

export function tipTraqSleepEfficiencyMetric(nights: number, avgEfficiency: number): PhosMetric {
  return {
    label: 'Sleep efficiency',
    labelLines: ['Sleep', 'efficiency'],
    value: `${avgEfficiency}%`,
    note: `${nights}-night average`,
    noteLines: [`${nights}-night`, 'avg.'],
  }
}

export function tipTraqTotalSleepMetric(avgTstMinutes: number): PhosMetric {
  const hours = Math.floor(avgTstMinutes / 60)
  const minutes = avgTstMinutes % 60

  return {
    label: 'Total sleep',
    labelLines: ['Total', 'sleep'],
    value: `${hours}h ${minutes}m`,
    note: 'Per night',
    noteLines: ['Every', 'night'],
  }
}

export function tipTraqBodyClockMetric(
  phaseTime: string | null,
  chronotype: string | null,
): PhosMetric {
  return {
    label: 'Body clock phase',
    labelLines: ['Body', 'clock'],
    value: phaseTime ?? 'Pending',
    note: chronotype ?? 'Calibrating',
    noteLines: chronotypeNoteLines(chronotype),
  }
}

export function metricLabelLines(metric: PhosMetric): readonly [string, string] {
  if (metric.labelLines) return metric.labelLines
  const words = metric.label.trim().split(/\s+/)
  if (words.length >= 2) return [words[0], words.slice(1).join(' ')]
  return [metric.label, ' ']
}

export function metricNoteLines(metric: PhosMetric): readonly [string, string] {
  if (metric.noteLines) return metric.noteLines
  const words = metric.note.trim().split(/\s+/)
  if (words.length >= 2) return [words[0], words.slice(1).join(' ')]
  return [metric.note, ' ']
}
