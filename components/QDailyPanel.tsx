import { DayWindowArc } from '@/components/DayWindowArc'

export function QDailyPanel() {
  return (
    <article
      className="impact-card impact-card--evidence impact-card--q-window loss-metric-card dash-card"
      aria-label="Today's peak light window from 09:20 to 14:55, five hours thirty-five minutes."
    >
      <div className="impact-card__q-body">
        <p className="dash-card__label impact-card__eyebrow--evidence">Today&apos;s light time</p>
        <DayWindowArc startMinutes={9 * 60 + 20} endMinutes={14 * 60 + 55} />
        <p className="dash-card__metric impact-card__figure--time">09:20 to 14:55</p>
        <p className="dash-card__support impact-card__summary">5h 35min peak window</p>
      </div>
    </article>
  )
}
