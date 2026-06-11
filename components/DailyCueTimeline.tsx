import type { DailyCueStop } from '@/lib/phos/types'

type DailyCueTimelineProps = {
  stops?: DailyCueStop[]
}

const DEFAULT_STOPS: DailyCueStop[] = [
  { time: '08:30', label: 'Anchor', icon: 'anchor', active: true },
  { time: '15:00', label: 'Peak', icon: 'peak' },
  { time: '19:30', label: 'Fuel', icon: 'fuel' },
  { time: '21:30', label: 'Dim', icon: 'dim' },
]

function CueIcon({ icon, active }: { icon: DailyCueStop['icon']; active?: boolean }) {
  const className = active ? 'daily-cue-timeline__icon daily-cue-timeline__icon--active' : 'daily-cue-timeline__icon'

  if (icon === 'anchor') {
    return (
      <span className={className} aria-hidden="true">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </span>
    )
  }

  if (icon === 'peak') {
    return (
      <span className={className} aria-hidden="true">
        <svg viewBox="0 0 24 24" width="14" height="14">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 3v18" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 3a9 9 0 0 1 0 18" fill="currentColor" fillOpacity="0.35" />
        </svg>
      </span>
    )
  }

  if (icon === 'fuel') {
    return (
      <span className={className} aria-hidden="true">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M6 4v16M6 8c0 2 1.5 3 3 3M9 11v9" />
          <path d="M14 4v16M14 8h3M17 8v8M14 16h3" />
        </svg>
      </span>
    )
  }

  return (
    <span className={className} aria-hidden="true">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 14.5A7.5 7.5 0 1 1 12 6v2.5" />
      </svg>
    </span>
  )
}

export function DailyCueTimeline({ stops = DEFAULT_STOPS }: DailyCueTimelineProps) {
  return (
    <div className="daily-cue-timeline" aria-label="Daily cue schedule from anchor to dim.">
      <div className="daily-cue-timeline__track" aria-hidden="true" />
      <ol className="daily-cue-timeline__stops">
        {stops.map((stop) => (
          <li
            key={`${stop.label}-${stop.time}`}
            className={`daily-cue-timeline__stop${stop.active ? ' daily-cue-timeline__stop--active' : ''}`}
          >
            <CueIcon icon={stop.icon} active={stop.active} />
            <p className="daily-cue-timeline__time">{stop.time}</p>
            <p className="daily-cue-timeline__label">{stop.label}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
