'use client'

import { useState, FormEvent } from 'react'
import { Reveal } from '@/components/Reveal'

const PRODUCTS = [
  {
    category: 'Morning Protocol',
    title: 'Light + Cortisol Stack',
    body: 'Timed to your circadian wake window. Supports cortisol awakening response and morning alertness without disrupting your natural rhythm.',
  },
  {
    category: 'Cognitive Window',
    title: 'Focus + Flow Stack',
    body: 'Formulated for delivery at your BodyCloQ cognitive peak. Supports sustained attention, working memory, and processing speed during your biological prime time.',
  },
  {
    category: 'Evening Recovery',
    title: 'Sleep Architecture Stack',
    body: 'Timed to your DLMO — the precise moment your melatonin rises. Supports slow-wave sleep depth and overnight HRV recovery.',
  },
] as const

export function ShopSection() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (email.trim()) setSubmitted(true)
  }

  return (
    <section id="shop" className="section section--white">
      <div className="container">
        <Reveal>
          <p className="label section-intro__eyebrow">Circadian Nootropics</p>
          <h2 className="display-section section-intro__headline copy-wide">
            Supplements that
            <br />
            work with your clock,
            <br />
            <em>not against it.</em>
          </h2>
          <p className="body-base section-intro__support copy-medium">
            Every supplement in the CloQ Shop is timed to your BodyCloQ score. The right
            compound. The right dose. The right time.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="card-grid">
            {PRODUCTS.map((product) => (
              <article key={product.title} className="card card-grid__item">
                <span className="badge badge--coming-soon card__badge">Coming soon</span>
                <p className="label card__category">{product.category}</p>
                <h3 className="display-card card__title">
                  <em>{product.title}</em>
                </h3>
                <p className="body-sm card__body">{product.body}</p>
                <button type="button" className="btn btn--ghost-dark">
                  Notify me
                </button>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.16}>
          <div className="email-capture">
            <p className="label email-capture__eyebrow">Be first to know when the shop opens</p>
            {submitted ? (
              <p className="email-capture__thanks">
                Thank you — we&apos;ll notify you when the shop is live.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="email-capture__form">
                <input
                  type="email"
                  className="input"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-label="Email address"
                />
                <button type="submit" className="btn btn--primary">
                  Notify me →
                </button>
              </form>
            )}
            <p className="note note--xs email-capture__note">
              No spam. One email when the shop is live.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
