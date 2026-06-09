import { Reveal } from '@/components/Reveal'

const DETAILS = [
  { label: 'TipTraQ device', value: 'Dispatched within 24 hours' },
  { label: 'Assessment nights', value: '3 nights · validated sleep data' },
  { label: 'BodyCloQ score', value: 'Delivered within 48 hours of return' },
  { label: 'Daily Q cues', value: 'Personalised · starts day one' },
  { label: 'Specialist routing', value: 'Private · never shared with employer' },
  { label: 'Shop access', value: 'Early access to circadian nootropics' },
  { label: 'UK specialist network', value: 'Direct routes to sleep, metabolic & cognitive specialists' },
] as const

export function CTASection() {
  return (
    <section id="cta" className="section section--black">
      <div className="container two-col">
        <Reveal>
          <p className="label section-intro__eyebrow">Get started</p>
          <h2 className="display-section display-section--lg cta__headline">
            Three nights.
            <br />
            One score.
            <br />
            <em>Make time count.</em>
          </h2>
          <p className="body-base cta__support">
            Order your TipTraQ assessment. Receive your BodyCloQ score in 48 hours. Let Q
            deliver your first cue the same day.
          </p>
          <div className="cta__actions">
            <a href="mailto:hello@cloq.health" className="btn btn--primary">
              Order TipTraQ →
            </a>
            <a href="mailto:hello@cloq.health?subject=Team%20pricing" className="btn btn--ghost">
              Request team pricing
            </a>
          </div>
          <p className="note note--xs cta__note">
            Assessment from £95 · Delivered to your door · UK only
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <div>
            {DETAILS.map((row) => (
              <div key={row.label} className="detail-row">
                <span className="detail-row__label">{row.label}</span>
                <span className="detail-row__value">{row.value}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
