'use client'

import { motion } from 'framer-motion'

const STATS = [
  { number: '£103bn', label: 'Annual UK presenteeism cost' },
  { number: '44', label: 'Productivity days lost per employee per year' },
  { number: '6hrs', label: 'Variation in biological peak time between individuals' },
  { number: '0', label: 'Wellness platforms that measure your body clock' },
] as const

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0, 0, 0.2, 1] as const, delay },
})

export function HeroSection() {
  return (
    <>
      <section className="section--black min-h-screen pt-[var(--nav-height)]">
        <div className="container grid min-h-[calc(100vh-var(--nav-height))] grid-cols-1 items-center gap-12 py-16 lg:grid-cols-[3fr_2fr] lg:py-24">
          <div>
            <motion.p
              className="label mb-10 text-silver"
              {...fadeUp(0)}
            >
              Circadian Nootropics · CloQ Health
            </motion.p>

            <motion.h1
              className="display-hero mb-8 text-white"
              {...fadeUp(0.08)}
            >
              Your body has
              <br />
              a clock.
              <br />
              Most people
              <br />
              <em>ignore it.</em>
            </motion.h1>

            <motion.p
              className="body-base mb-12 max-w-[460px] text-silver"
              {...fadeUp(0.16)}
            >
              BodyCloQ measures your circadian rhythm
              <br className="hidden sm:block" />
              across three nights — and turns it into a
              <br className="hidden sm:block" />
              score, a daily cue, and a clear action plan
              <br className="hidden sm:block" />
              for peak cognitive performance.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-4"
              {...fadeUp(0.24)}
            >
              <a href="#cta" className="btn btn--primary">
                Get your BodyCloQ score →
              </a>
              <a href="#how-it-works" className="btn btn--ghost">
                See how it works
              </a>
            </motion.div>
          </div>

          <div className="relative flex flex-col items-end justify-end overflow-hidden">
            <span className="hero-ghost" aria-hidden>
              3
            </span>
            <p className="label relative z-10 text-silver">Nights to your score</p>
          </div>
        </div>
      </section>

      <div className="stat-strip">
        {STATS.map((stat) => (
          <div key={stat.label} className="stat-strip__item">
            <span className="stat-strip__number">{stat.number}</span>
            <span className="stat-strip__label">{stat.label}</span>
          </div>
        ))}
      </div>
    </>
  )
}
