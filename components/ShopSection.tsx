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
          <p className="label mb-10 text-silver">Circadian Nootropics</p>
          <h2 className="display-section mb-6 max-w-[640px] text-eggplant">
            Supplements that
            <br />
            work with your clock,
            <br />
            <em>not against it.</em>
          </h2>
          <p className="body-base mb-16 max-w-[480px] text-silver md:mb-20">
            Every supplement in the CloQ Shop is timed
            to your BodyCloQ score. The right compound.
            The right dose. The right time.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mb-16 grid gap-px bg-silver md:grid-cols-3 md:mb-20">
            {PRODUCTS.map((product) => (
              <article key={product.title} className="card">
                <span className="badge badge--coming-soon mb-6">Coming soon</span>
                <p className="label mb-4 text-silver">{product.category}</p>
                <h3 className="display-card mb-4 text-eggplant">
                  <em>{product.title}</em>
                </h3>
                <p className="body-sm mb-8 flex-1 text-silver">{product.body}</p>
                <button type="button" className="btn btn--ghost-dark">
                  Notify me
                </button>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.16}>
          <div className="bg-off-white px-8 py-12 text-center md:px-12 md:py-14">
            <p className="label mb-6 text-silver">Be first to know when the shop opens</p>
            {submitted ? (
              <p className="font-mono text-[14px] text-eggplant">
                Thank you — we&apos;ll notify you when the shop is live.
              </p>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col items-center justify-center gap-4 sm:flex-row"
              >
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
            <p className="mt-4 font-mono text-[10px] text-silver">
              No spam. One email when the shop is live.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
