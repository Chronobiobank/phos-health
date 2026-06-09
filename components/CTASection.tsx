import { Reveal } from '@/components/Reveal'

const DETAILS = [
  { label: 'TipTraQ device', value: 'Dispatched within 24 hours' },
  { label: 'Assessment nights', value: '3 nights · validated sleep data' },
  { label: 'Photonic Age', value: 'Delivered within 48 hours of return' },
  { label: 'Lost Light Years', value: 'Deficit calculated against chronological age' },
  { label: 'Workforce reporting', value: 'Aggregate deficit · CFO-ready output' },
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
            Your workforce
            <br />
            has a Photonic Age.
            <br />
            <em>Measure the gap.</em>
          </h2>
          <p className="body-base cta__support">
            Order your TipTraQ assessment. Receive your Photonic Age and Lost Light Years in 48
            hours. PHOS measures both — and closes the gap.
          </p>
          <div className="cta__actions">
            <a href="mailto:hello@phos.health" className="btn btn--primary">
              Order TipTraQ →
            </a>
            <a href="mailto:hello@phos.health?subject=Team%20pricing" className="btn btn--ghost">
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
