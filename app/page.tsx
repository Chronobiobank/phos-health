'use client'

import { useEffect } from 'react'
import Link from 'next/link'

import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'

export default function Home() {
  useEffect(() => {
    const elements = document.querySelectorAll('.fade-in')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 },
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <main>
      <Nav />

      <section id="hero" className="fade-in hero snap-section" data-nav-theme="dark">
        <div className="hero__veil" aria-hidden="true" />
        <div className="container hero__content">
          <h1 className="display-xl">Your light is ageing you.</h1>
          <p className="lede">Photonic Age is how old your body clock thinks you are.</p>
          <p className="support">88,000 people. Three journals. Light predicts early death.</p>
          <div className="copy-actions">
            <Link href="/score" className="btn btn--primary">
              Find your Photonic Age →
            </Link>
            <Link href="/score?context=d3" className="btn btn--outline">
              On D3? Time it properly. →
            </Link>
          </div>
        </div>
      </section>

      <section id="science" className="fade-in snap-section biology-panel" data-nav-theme="dark">
        <div className="container biology-panel__content">
          <p className="section-number">01</p>
          <h2 className="section-title">This isn&apos;t wellness. It&apos;s survival.</h2>
          <div className="fact-tiles">
            <article className="fact-tile">
              <h3 className="fact-tile__head">Brighter nights raised mortality by 34%.</h3>
            </article>
            <article className="fact-tile">
              <h3 className="fact-tile__head">Night light raised diabetes risk by 53%.</h3>
            </article>
            <article className="fact-tile">
              <h3 className="fact-tile__head">Five heart diseases linked to light at night.</h3>
            </article>
          </div>
          <p className="support">Same cohort. PNAS. The Lancet. JAMA.</p>
        </div>
      </section>

      <section
        id="metric"
        className="fade-in snap-section photonic-age-panel"
        data-nav-theme="light"
      >
        <div className="container photonic-age-panel__content">
          <p className="section-number">02</p>
          <h2 className="section-title">One number. Upstream of everything.</h2>
          <p className="lede">Epigenetic clocks measure damage already done.</p>
          <h3 className="display-md">Photonic Age measures what is causing it.</h3>
          <p className="support">Lost Light Years. Closable today.</p>
        </div>
      </section>

      <section id="diagnostic" className="fade-in snap-section photonic-age-panel" data-nav-theme="light">
        <div className="container photonic-age-panel__content">
          <p className="section-number">03</p>
          <h2 className="section-title">What&apos;s your number?</h2>
          <p className="support">Seven questions. Two minutes. No blood test.</p>
          <div className="copy-actions">
            <Link href="/score" className="btn btn--primary">
              Calculate now →
            </Link>
          </div>
        </div>
      </section>

      <section
        id="chronobiobank"
        className="fade-in snap-section hibernation-panel"
        data-nav-theme="dark"
      >
        <div className="hibernation-panel__veil" aria-hidden="true" />
        <div className="container hibernation-panel__content">
          <p className="section-number">04</p>
          <h2 className="section-title">Your data. Your call. Your legacy.</h2>
          <p className="lede">Every assessment feeds the Chronobiobank.</p>
          <div className="fact-tiles">
            <article className="fact-tile">
              <h3 className="fact-tile__head">Not owned by investors.</h3>
            </article>
            <article className="fact-tile">
              <h3 className="fact-tile__head">Not sold to advertisers.</h3>
            </article>
            <article className="fact-tile">
              <h3 className="fact-tile__head">Held in trust. Controlled by you.</h3>
            </article>
          </div>
          <h3 className="display-md">You are a founding contributor.</h3>
          <p className="support">First longitudinal circadian light dataset.</p>
          <div className="copy-actions">
            <Link href="/score" className="btn btn--primary">
              Join the Chronobiobank →
            </Link>
          </div>
        </div>
      </section>

      <div className="container trust-line">
        <p className="support trust-line__copy">
          Chronobiobank Limited is a registered charity. Your data is held in trust.
        </p>
      </div>

      <Footer />
    </main>
  )
}
