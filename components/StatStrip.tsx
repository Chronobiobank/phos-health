const STATS = [
  { number: '£103bn', label: 'Annual UK presenteeism cost' },
  { number: '44', label: 'Productivity days lost per employee per year' },
  { number: '6hrs', label: 'Variation in biological peak time between individuals' },
  { number: '0', label: 'Wellness platforms that measure your body clock' },
] as const

export function StatStrip() {
  return (
    <div className="stat-strip">
      {STATS.map((stat) => (
        <div key={stat.label} className="stat-strip__item">
          <span className="stat-strip__number">{stat.number}</span>
          <span className="stat-strip__label">{stat.label}</span>
        </div>
      ))}
    </div>
  )
}
