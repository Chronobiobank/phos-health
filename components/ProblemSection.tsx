import { Reveal } from '@/components/Reveal'

const STATEMENTS = [
  {
    heading: 'Your people are present. Their brains aren\u2019t.',
    body: 'The average professional operates at peak cognitive capacity for less than 3 hours a day. Most firms schedule their most important work in the remaining 5.',
  },
  {
    heading: 'Your calendar was built for convenience. Not biology.',
    body: 'Circadian science shows a 6-hour variation in cognitive peak time between individuals. Your 9am board meeting hits one person at their sharpest \u2014 and another in biological night.',
  },
  {
    heading: 'Your competitors are starting to know the difference.',
    body: 'The firms winning the next decade aren\u2019t working harder. They\u2019re working at the right time.',
  },
] as const

export function ProblemSection() {
  return (
    <section id="problem" className="section section--white">
      <div className="container">
        <Reveal>
          <p className="label section-intro__eyebrow">The Problem</p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="card-grid">
            {STATEMENTS.map((item) => (
              <article key={item.heading} className="card card-grid__item">
                <h2 className="display-card card__title">{item.heading}</h2>
                <p className="body-base">{item.body}</p>
              </article>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
