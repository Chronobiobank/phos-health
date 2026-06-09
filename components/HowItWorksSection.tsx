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
    title: 'Photonic Age —',
    titleEm: 'your light-age metric',
    body: 'PHOS analyses your light/dark cycle exposure, sleep architecture, and circadian phase to calculate your Photonic Age — a single number that names what you are missing, not just what you have lost.',
  },
  {
    label: '03 — Quantify',
    icon: '◉',
    title: 'Lost Light Years —',
    titleEm: 'the gap that matters',
    body: 'The difference between your Chronological Age and Photonic Age is your Lost Light Years deficit. For an individual, it is personal and motivating. For a company, it is a balance sheet entry.',
  },
  {
    label: '04 — Act',
    icon: '◈',
    title: 'PHOS Platform —',
    titleEm: 'measure and close the gap',
    body: 'PHOS measures both ages, quantifies the deficit across your workforce, and delivers the interventions — light protocols, specialist routing, and circadian nootropics — to close the gap.',
  },
] as const

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="section section--off-white">
      <div className="container">
        <Reveal>
          <p className="label section-intro__eyebrow">The PHOS Method</p>
          <h2 className="display-section section-intro__headline section-intro__headline--relaxed">
            Three nights.
            <br />
            One metric.
            <br />
            <em>Close the gap.</em>
          </h2>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="steps">
            {STEPS.map((step) => (
              <article key={step.label} className="step">
                <span className="step__label">{step.label}</span>
                <span className="step__icon" aria-hidden>
                  {step.icon}
                </span>
                <h3 className="step__title">
                  {step.title} <em>{step.titleEm}</em>
                </h3>
                <p className="step__body">{step.body}</p>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.16} className="section-cta">
          <a href="#cta" className="btn btn--primary">
            Order TipTraQ — get your Photonic Age →
          </a>
          <p className="note section-cta__note">
            TipTraQ assessment from £95 · Results in 48 hours
          </p>
        </Reveal>
      </div>
    </section>
  )
}
