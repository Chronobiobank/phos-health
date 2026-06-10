export function QDailyPanel() {
  return (
    <article
      className="impact-card impact-card--compact loss-metric-card q-light-card"
      aria-label="Today's peak light window from 09:20 to 14:55, five hours thirty-five minutes."
    >
      <div className="impact-card__metric impact-card__metric--solo impact-card__metric--compact">
        <p className="impact-card__eyebrow">Today&apos;s light time</p>
        <p className="impact-card__figure impact-card__figure--time">09:20 to 14:55</p>
        <p className="impact-card__summary">5h 35min peak window</p>
      </div>
    </article>
  )
}
