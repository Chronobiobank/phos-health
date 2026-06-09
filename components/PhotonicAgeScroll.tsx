'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const CHRONO_AGE = 43
const PHOTONIC_AGE = 47.2
const LOST_YEARS = 4.2

const CAPTIONS = [
  'What the calendar says.',
  'What your light history says.',
  'The gap is your Lost Light Years.',
] as const

function stageProgress(progress: number, start: number, end: number): number {
  if (progress <= start) return 0
  if (progress >= end) return 1
  return (progress - start) / (end - start)
}

export function PhotonicAgeScroll() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(false)

  const update = useCallback(() => {
    rafRef.current = null
    const el = sectionRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const scrollable = el.offsetHeight - window.innerHeight
    if (scrollable <= 0) return
    const p = Math.min(1, Math.max(0, -rect.top / scrollable))
    setProgress(p)
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setReduceMotion(true)
      return
    }
    const onScroll = () => {
      if (rafRef.current === null) {
        rafRef.current = window.requestAnimationFrame(update)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    update()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current)
    }
  }, [update])

  /* Choreography: chrono settles first, photonic counts up and overshoots,
     lost years resolves last. */
  const chronoIn = stageProgress(progress, 0.02, 0.18)
  const photonicCount = stageProgress(progress, 0.22, 0.55)
  const lostIn = stageProgress(progress, 0.62, 0.8)

  const photonicValue = reduceMotion
    ? PHOTONIC_AGE
    : CHRONO_AGE + (PHOTONIC_AGE - CHRONO_AGE) * photonicCount

  const stage = reduceMotion || lostIn > 0 ? 2 : photonicCount > 0 ? 1 : 0

  const chronoStyle = reduceMotion
    ? undefined
    : { opacity: chronoIn, transform: `translateY(${(1 - chronoIn) * 14}px)` }
  const photonicStyle = reduceMotion
    ? undefined
    : {
        opacity: stageProgress(progress, 0.2, 0.3),
        transform: `translateY(${(1 - stageProgress(progress, 0.2, 0.3)) * 14}px)`,
      }
  const lostStyle = reduceMotion
    ? undefined
    : { opacity: lostIn, transform: `translateY(${(1 - lostIn) * 14}px)` }

  return (
    <div ref={sectionRef} className={`scrolly${reduceMotion ? ' scrolly--static' : ''}`}>
      <div className="scrolly__stage">
        <p className="scrolly__caption" aria-live="polite">
          {CAPTIONS[stage]}
        </p>

        <div className="scrolly__columns">
          <div className="scrolly__col" style={chronoStyle}>
            <span className="label">Chronological Age</span>
            <span className="scrolly__value" style={{ color: 'var(--corona)' }}>
              {CHRONO_AGE}
            </span>
          </div>

          <div className="scrolly__col scrolly__col--mid" style={photonicStyle}>
            <span className="label">Photonic Age</span>
            <span className="scrolly__value" style={{ color: 'var(--stellar)' }}>
              {photonicValue.toFixed(1)}
            </span>
          </div>

          <div className="scrolly__col" style={lostStyle}>
            <span className="label">Lost Light Years</span>
            <span className="scrolly__value text-spectrum">{LOST_YEARS.toFixed(1)}</span>
          </div>
        </div>

        <p className="label scrolly__footnote" style={reduceMotion ? undefined : { opacity: lostIn }}>
          Example: senior professional, London, 43 years old · three-night TipTraQ study
        </p>
      </div>
    </div>
  )
}
