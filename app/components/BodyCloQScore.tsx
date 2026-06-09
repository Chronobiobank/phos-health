'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, useSpring, useMotionValueEvent, AnimatePresence } from 'framer-motion'

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
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const CX = 160
const CY = 160

function TickMarks() {
  return (
    <g>
      {Array.from({ length: 60 }, (_, i) => {
        const angle = (i * 6 - 90) * (Math.PI / 180)
        const isMajor = i % 10 === 0
        const innerR = 108
        const outerR = innerR + (isMajor ? 8 : 4)
        const x1 = CX + innerR * Math.cos(angle)
        const y1 = CY + innerR * Math.sin(angle)
        const x2 = CX + outerR * Math.cos(angle)
        const y2 = CY + outerR * Math.sin(angle)
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="white"
            strokeWidth={1}
            opacity={isMajor ? 0.3 : 0.15}
          />
        )
      })}
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
        <p className="label mb-10 text-lilac">The BodyCloQ Score</p>
        <h2 className="display-section mb-16 max-w-xl text-white md:mb-20">
          One number.
          <br />
          Everything your body clock
          <br />
          is <em>trying to tell you.</em>
        </h2>

        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[2fr_3fr] lg:gap-16">
          {/* LEFT — Score ring */}
          <div className="mx-auto w-full max-w-[320px] lg:mx-0">
            <div className="relative mx-auto h-[260px] w-[260px] min-h-[260px] sm:h-[320px] sm:w-[320px] sm:min-h-[320px]">
              <svg
                viewBox="0 0 320 320"
                className="h-full w-full"
                aria-hidden
              >
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

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="font-display text-[72px] italic leading-none text-white tabular-nums sm:text-[88px]"
                  aria-live="polite"
                  aria-label={`BodyCloQ score ${displayScore}`}
                >
                  {displayScore}
                </span>
                <span className="label mt-2 text-lilac">BodyCloQ Score</span>
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full transition-colors duration-300"
                    style={{ backgroundColor: band.color }}
                    aria-hidden
                  />
                  <span
                    className="font-mono text-[11px] uppercase tracking-wider transition-colors duration-300"
                    style={{ color: band.color }}
                  >
                    {band.label}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 w-full bg-black/20 px-5 py-4">
              <p className="label mb-2 text-lilac">Cognitive Peak Window Today</p>
              <AnimatePresence mode="wait">
                <motion.p
                  key={`${peak.start}-${peak.end}`}
                  initial={hasInteracted ? { opacity: 0 } : false}
                  animate={{ opacity: 1 }}
                  exit={hasInteracted ? { opacity: 0 } : undefined}
                  transition={{ duration: 0.4 }}
                  className="font-display text-[24px] italic text-white sm:text-[28px]"
                >
                  {peak.start} — {peak.end}
                </motion.p>
              </AnimatePresence>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-white/40">
                Your biological prime time
              </p>
            </div>
          </div>

          {/* RIGHT — Metric sliders */}
          <div>
            {METRICS.map((metric) => {
              const value = values[metric.id]
              const fillPct = `${(((value - metric.min) / (metric.max - metric.min)) * 100).toFixed(1)}%`
              return (
                <div key={metric.id} className="metric-row">
                  <div className="metric-label-row">
                    <span className="font-mono text-[11px] text-white">{metric.label}</span>
                    <span className="font-mono text-[11px] text-lilac">{metric.format(value)}</span>
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
                  <p className="mt-2 font-mono text-[10px] text-white/30">{metric.sublabel}</p>
                </div>
              )
            })}

            <AnimatePresence>
              {showCTA && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
                  className="mt-8 flex flex-col gap-6 border-t border-white/[0.08] pt-6 sm:flex-row sm:items-center sm:justify-between"
                >
                  <p className="max-w-sm font-mono text-[12px] leading-relaxed text-white/50">
                    Your real BodyCloQ score requires 3 nights of TipTraQ data. This is a
                    simulated preview.
                  </p>
                  <a href="mailto:hello@cloq.health" className="btn btn--primary shrink-0">
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
