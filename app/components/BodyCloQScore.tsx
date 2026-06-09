'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, useSpring, useMotionValueEvent, AnimatePresence } from 'framer-motion'
import { TICK_MARKS } from '@/app/components/tick-marks-data'

interface MetricState {
  circadian_amplitude: number
  rem_latency: number
  hrv_overnight: number
  social_jet_lag: number
  sleep_efficiency: number
  recovery_index: number
}

type MetricKey = keyof MetricState

interface MetricConfig {
  id: MetricKey
  label: string
  sublabel: string
  min: number
  max: number
  default: number
  weight: number
  unit: string
  format: (v: number) => string
}

const DEFAULTS: MetricState = {
  circadian_amplitude: 78,
  rem_latency: 78,
  hrv_overnight: 72,
  social_jet_lag: 28,
  sleep_efficiency: 89,
  recovery_index: 82,
}

const METRICS: MetricConfig[] = [
  {
    id: 'circadian_amplitude',
    label: 'Circadian Amplitude',
    sublabel: 'How strongly your biological clock oscillates',
    min: 0,
    max: 100,
    default: DEFAULTS.circadian_amplitude,
    weight: 0.25,
    unit: '',
    format: (v) => `${v}`,
  },
  {
    id: 'rem_latency',
    label: 'REM Latency',
    sublabel: 'Time to first REM cycle — lower is better',
    min: 40,
    max: 200,
    default: DEFAULTS.rem_latency,
    weight: 0.2,
    unit: 'min',
    format: (v) => `${v} min`,
  },
  {
    id: 'hrv_overnight',
    label: 'HRV Overnight',
    sublabel: 'Heart rate variability — autonomic balance',
    min: 20,
    max: 120,
    default: DEFAULTS.hrv_overnight,
    weight: 0.2,
    unit: 'ms',
    format: (v) => `${v} ms`,
  },
  {
    id: 'social_jet_lag',
    label: 'Social Jet Lag',
    sublabel: 'Gap between biological and social schedule',
    min: 0,
    max: 180,
    default: DEFAULTS.social_jet_lag,
    weight: 0.15,
    unit: 'min',
    format: (v) => `${v} min`,
  },
  {
    id: 'sleep_efficiency',
    label: 'Sleep Efficiency',
    sublabel: 'Percentage of time in bed actually sleeping',
    min: 50,
    max: 100,
    default: DEFAULTS.sleep_efficiency,
    weight: 0.12,
    unit: '%',
    format: (v) => `${v}%`,
  },
  {
    id: 'recovery_index',
    label: 'Recovery Index',
    sublabel: 'Overnight restoration efficiency',
    min: 0,
    max: 100,
    default: DEFAULTS.recovery_index,
    weight: 0.08,
    unit: '',
    format: (v) => `${v}`,
  },
]

function calculateScore(values: MetricState): number {
  const circadian = values.circadian_amplitude * 0.25
  const rem = (100 - ((values.rem_latency - 40) / 160) * 100) * 0.2
  const hrv = ((values.hrv_overnight - 20) / 100) * 100 * 0.2
  const sjl = (100 - (values.social_jet_lag / 180) * 100) * 0.15
  const efficiency = ((values.sleep_efficiency - 50) / 50) * 100 * 0.12
  const recovery = values.recovery_index * 0.08
  return Math.round(
    Math.min(100, Math.max(0, circadian + rem + hrv + sjl + efficiency + recovery)),
  )
}

function getScoreBand(score: number): { color: string; label: string } {
  if (score <= 39) return { color: '#e05252', label: 'NEEDS ATTENTION' }
  if (score <= 59) return { color: '#e0922a', label: 'DEVELOPING' }
  if (score <= 74) return { color: '#c8a2c8', label: 'GOOD' }
  if (score <= 89) return { color: '#28c87a', label: 'STRONG' }
  return { color: '#c8a2c8', label: 'OPTIMAL' }
}

function formatPeakTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24
  const m = totalMinutes % 60
  const period = h >= 12 ? 'pm' : 'am'
  const h12 = h % 12 || 12
  return `${h12}:${m.toString().padStart(2, '0')}${period}`
}

function getCognitivePeakWindow(score: number): { start: string; end: string } {
  const baseMinutes = 10 * 60
  const shifts = Math.max(0, Math.floor((score - 50) / 10)) * 15
  const startMinutes = baseMinutes - shifts
  const endMinutes = startMinutes + 135
  return {
    start: formatPeakTime(startMinutes),
    end: formatPeakTime(endMinutes),
  }
}

const RADIUS = 120
const CIRCUMFERENCE = 753.98
const CX = 160
const CY = 160

function TickMarks() {
  return (
    <g>
      {TICK_MARKS.map((tick) => (
        <line
          key={tick.key}
          x1={tick.x1}
          y1={tick.y1}
          x2={tick.x2}
          y2={tick.y2}
          stroke="white"
          strokeWidth={1}
          opacity={tick.opacity}
        />
      ))}
    </g>
  )
}

export default function BodyCloQScore() {
  const [values, setValues] = useState<MetricState>(DEFAULTS)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [showCTA, setShowCTA] = useState(false)
  const [displayScore, setDisplayScore] = useState(() => calculateScore(DEFAULTS))
  const ctaTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const score = useMemo(() => calculateScore(values), [values])
  const band = getScoreBand(score)
  const peak = getCognitivePeakWindow(score)

  const springScore = useSpring(calculateScore(DEFAULTS), { stiffness: 120, damping: 20 })

  useEffect(() => {
    springScore.set(score)
  }, [score, springScore])

  useMotionValueEvent(springScore, 'change', (v) => {
    setDisplayScore(Math.round(v))
  })

  const handleSliderChange = useCallback(
    (metric: MetricKey, value: number) => {
      setValues((prev) => ({ ...prev, [metric]: value }))
      if (!hasInteracted) {
        setHasInteracted(true)
        ctaTimerRef.current = setTimeout(() => setShowCTA(true), 1500)
      }
    },
    [hasInteracted],
  )

  useEffect(
    () => () => {
      if (ctaTimerRef.current) clearTimeout(ctaTimerRef.current)
    },
    [],
  )

  const arcOffset = CIRCUMFERENCE * (1 - score / 100)

  return (
    <section className="section section--eggplant bodycloq-score" id="bodycloq-score">
      <div className="container">
        <p className="label section-intro__eyebrow">The BodyCloQ Score</p>
        <h2 className="display-section section-intro__headline section-intro__headline--relaxed copy-wide">
          One number.
          <br />
          Everything your body clock
          <br />
          is <em>trying to tell you.</em>
        </h2>

        <div className="bodycloq-score__layout">
          <div className="bodycloq-score__ring-wrap">
            <div className="bodycloq-score__ring">
              <svg viewBox="0 0 320 320" aria-hidden>
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#c8a2c8" />
                    <stop offset="100%" stopColor="#523b50" />
                  </linearGradient>
                </defs>
                <circle
                  cx={CX}
                  cy={CY}
                  r={140}
                  fill="none"
                  stroke="#3a2838"
                  strokeWidth={2}
                />
                <circle
                  cx={CX}
                  cy={CY}
                  r={RADIUS}
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth={16}
                />
                <TickMarks />
                <circle
                  cx={CX}
                  cy={CY}
                  r={RADIUS}
                  fill="none"
                  stroke="url(#scoreGradient)"
                  strokeWidth={16}
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={arcOffset}
                  transform={`rotate(-90 ${CX} ${CY})`}
                  style={{
                    transition: hasInteracted
                      ? 'stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
                      : 'none',
                  }}
                />
              </svg>

              <div className="bodycloq-score__ring-center">
                <span
                  className="bodycloq-score__number"
                  aria-live="polite"
                  aria-label={`BodyCloQ score ${displayScore}`}
                >
                  {displayScore}
                </span>
                <span className="label bodycloq-score__score-label">BodyCloQ Score</span>
                <div className="bodycloq-score__band">
                  <span
                    className="bodycloq-score__band-dot"
                    style={{ backgroundColor: band.color }}
                    aria-hidden
                  />
                  <span className="bodycloq-score__band-label" style={{ color: band.color }}>
                    {band.label}
                  </span>
                </div>
              </div>
            </div>

            <div className="bodycloq-score__peak">
              <p className="label bodycloq-score__peak-label">Cognitive Peak Window Today</p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={`${peak.start}-${peak.end}`}
                  initial={hasInteracted ? { opacity: 0 } : false}
                  animate={{ opacity: 1 }}
                  exit={hasInteracted ? { opacity: 0 } : undefined}
                  transition={{ duration: 0.4 }}
                  className="bodycloq-score__peak-time"
                >
                  {peak.start} — {peak.end}
                </motion.p>
              </AnimatePresence>
              <p className="bodycloq-score__peak-sub">Your biological prime time</p>
            </div>
          </div>

          <div>
            {METRICS.map((metric) => {
              const value = values[metric.id]
              const fillPct = `${(((value - metric.min) / (metric.max - metric.min)) * 100).toFixed(1)}%`
              return (
                <div key={metric.id} className="metric-row">
                  <div className="metric-label-row">
                    <span className="metric-label">{metric.label}</span>
                    <span className="metric-value">{metric.format(value)}</span>
                  </div>
                  <input
                    type="range"
                    min={metric.min}
                    max={metric.max}
                    value={value}
                    aria-label={metric.label}
                    style={{ '--fill-pct': fillPct } as React.CSSProperties}
                    onChange={(e) => handleSliderChange(metric.id, Number(e.target.value))}
                  />
                  <p className="metric-sublabel">{metric.sublabel}</p>
                </div>
              )
            })}

            <AnimatePresence>
              {showCTA && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
                  className="bodycloq-score__cta"
                >
                  <p className="bodycloq-score__cta-copy">
                    Your real BodyCloQ score requires 3 nights of TipTraQ data. This is a
                    simulated preview.
                  </p>
                  <a href="mailto:hello@cloq.health" className="btn btn--primary">
                    Get your real score →
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
