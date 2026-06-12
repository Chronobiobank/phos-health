import { DashboardPanelTiles } from '@/components/dashboard/DashboardPanel'

type PhotonicAgeSummaryRowProps = {
  calendarAge: number | string
  photonicAge: number | string
  lostLightYears: number | string
}

/** Calendar age and Photonic age flank lost light years in the centre. */
export function PhotonicAgeSummaryRow({
  calendarAge,
  photonicAge,
  lostLightYears,
}: PhotonicAgeSummaryRowProps) {
  return (
    <DashboardPanelTiles columns={3} className="phos-dashboard__summary">
      <div className="phos-dashboard__stat dash-card dash-tile">
        <p className="dash-card__metric">{calendarAge}</p>
        <p className="dash-card__label">Calendar age</p>
      </div>
      <div className="phos-dashboard__stat phos-dashboard__stat--centre dash-card dash-tile dash-card--featured">
        <p className="dash-card__metric">{lostLightYears}</p>
        <p className="dash-card__label">Lost light years</p>
      </div>
      <div className="phos-dashboard__stat dash-card dash-tile">
        <p className="dash-card__metric">{photonicAge}</p>
        <p className="dash-card__label">Photonic age</p>
      </div>
    </DashboardPanelTiles>
  )
}
