import type { PhosMetric } from '@/lib/phos/types'
import { metricLabelLines, metricNoteLines } from '@/lib/phos/metric-display'

type DashboardMetricTileProps = {
  metric: PhosMetric
}

export function DashboardMetricTile({ metric }: DashboardMetricTileProps) {
  const labelLines = metricLabelLines(metric)
  const noteLines = metricNoteLines(metric)

  return (
    <div className="phos-dashboard__metric dash-card dash-tile">
      <p className="dash-card__metric">{metric.value}</p>
      <span className="dash-card__label-stack" aria-label={metric.label}>
        <span className="dash-card__label-line">{labelLines[0]}</span>
        <span className="dash-card__label-line">{labelLines[1]}</span>
      </span>
      <span className="dash-card__copy-stack" aria-label={metric.note}>
        <span className="dash-card__copy-line">{noteLines[0]}</span>
        <span className="dash-card__copy-line">{noteLines[1]}</span>
      </span>
    </div>
  )
}
