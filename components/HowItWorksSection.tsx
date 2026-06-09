import { Reveal } from '@/components/Reveal'

const STEPS = [
  {
    label: '01 — Measure',
    icon: '◌',
    title: 'TipTraQ —',
    titleEm: '3 nights at home',
    body: 'Dispatch a TipTraQ device to your home. Three nights of validated sleep data — FDA-cleared, validated at Duke University Hospital. No clinic visit. No wires. Return by post.',
  },
  {
    label: '02 — Score',
    icon: '◎',
    title: 'BodyCloQ —',
    titleEm: 'your circadian score',
    body: 'CloQ analyses your sleep architecture, HRV, and circadian phase to generate your BodyCloQ score — a single number that captures when your biology is at its best and where it needs support.',
  },
  {
    label: '03 — Optimise',
    icon: '◉',
    title: 'Q —',
    titleEm: 'daily circadian cues',
    body: 'Q delivers one personalised cue each day. When to take your first light. When your cognitive window opens. When to schedule the meeting that matters. Three sentences. Always actionable.',
  },
  {
    label: '04 — Act',
    icon: '◈',
    title: 'Specialists + Shop —',
    titleEm: 'specialists and nootropics',
    body: 'Where your score suggests specialist support, Q privately routes you to UK specialists. Where optimisation is the goal, the CloQ Shop delivers circadian nootropics — supplements and devices timed to your biology.',
  },
] as const

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="section section--off-white">
      <div className="container">
        <Reveal>
          <p className="label mb-10 text-silver">The CloQ Method</p>
          <h2 className="display-section mb-16 max-w-[640px] text-black md:mb-20">
            Three nights.
            <br />
            One score.
            <br />
            <em>Daily cues for life.</em>
          </h2>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="steps">
            {STEPS.map((step) => (
              <article key={step.label} className="step">
                <span className="step__label">{step.label}</span>
                <span className="step__icon text-eggplant" aria-hidden>
                  {step.icon}
                </span>
                <h3 className="step__title text-black">
                  {step.title} <em>{step.titleEm}</em>
                </h3>
                <p className="step__body">{step.body}</p>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.16} className="mt-16 flex flex-col items-center text-center md:mt-20">
          <a href="#cta" className="btn btn--primary">
            Order TipTraQ — get your BodyCloQ score →
          </a>
          <p className="mt-4 font-mono text-[11px] text-silver">
            TipTraQ assessment from £95 · Results in 48 hours
          </p>
        </Reveal>
      </div>
    </section>
  )
}
