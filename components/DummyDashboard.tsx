const SUMMARY = [
  { value: '43', label: 'Calendar Age' },
  { value: '47.2', label: 'Photonic Age', highlight: true },
  { value: '4.2', label: 'Lost Light Years', accent: true },
] as const

const METRICS = [
  { label: 'Light Time', value: '2.9 h', note: 'Bright light per day' },
  { label: 'Dark Time', value: '6.8 h', note: 'True dark per night' },
  { label: 'Sleep efficiency', value: '84%', note: 'Three-night average' },
  { label: 'Social jet lag', value: '38 min', note: 'Workday vs free-day shift' },
  { label: 'Circadian alignment', value: '62%', note: 'Phase vs internal clock' },
  { label: 'Recovery index', value: '71', note: 'Overnight restoration score' },
] as const

export function DummyDashboard() {
  return (
    <div className="dummy-dashboard">
      <div className="dummy-dashboard__summary">
        {SUMMARY.map((item) => (
          <div
            key={item.label}
            className={[
              'dummy-dashboard__stat',
              'highlight' in item && item.highlight ? 'dummy-dashboard__stat--hero' : '',
              'accent' in item && item.accent ? 'dummy-dashboard__stat--accent' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <p className="dummy-dashboard__stat-value">{item.value}</p>
            <p className="dummy-dashboard__stat-label">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="dummy-dashboard__grid">
        {METRICS.map((metric) => (
          <div key={metric.label} className="dummy-dashboard__metric">
            <p className="dummy-dashboard__metric-value">{metric.value}</p>
            <p className="dummy-dashboard__metric-label">{metric.label}</p>
            <p className="dummy-dashboard__metric-note">{metric.note}</p>
          </div>
        ))}
      </div>

      <p className="support dummy-dashboard__sample">Sample data from a three-night TipTraQ study.</p>
    </div>
  )
}
