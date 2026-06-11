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
          <h1 className="display-xl" style={{ maxWidth: '22ch' }}>
            Your light is ageing you.
          </h1>

          <p className="display-sm" style={{ marginTop: '24px', maxWidth: '44ch' }}>
            Photonic Age is how old your body clock thinks you are.
          </p>
          <p className="display-sm" style={{ marginTop: '12px', maxWidth: '44ch' }}>
            88,000 people. 8 years. Three journals.
          </p>
          <p className="support" style={{ marginTop: '12px', maxWidth: '44ch' }}>
            Light predicts heart disease, diabetes, and early death.
          </p>

          <div className="copy-actions">
            <Link href="/score" className="btn btn--primary">
              Find your Photonic Age →
            </Link>
            <Link href="/score?context=d3" className="btn btn--outline">
              Already on a D3 protocol? Time it properly. →
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
              <h3 className="fact-tile__head">Brighter nights raised all-cause mortality by 34%.</h3>
            </article>
            <article className="fact-tile">
              <h3 className="fact-tile__head">Night light raised type 2 diabetes risk by 53%.</h3>
            </article>
            <article className="fact-tile">
              <h3 className="fact-tile__head">Five cardiovascular diseases linked to light at night.</h3>
            </article>
          </div>

          <p className="support" style={{ marginTop: 'var(--stack-lg)' }}>
            Same cohort. Same sensors. PNAS. The Lancet. JAMA.
          </p>
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

          <p className="lede" style={{ marginTop: 'var(--stack-lg)' }}>
            Photonic Age is how old your body clock thinks you are.
          </p>
          <p className="support">Epigenetic clocks measure damage already done.</p>
          <p className="support">Photonic Age measures what is causing it.</p>
          <h3 className="display-md" style={{ marginTop: 'var(--stack-lg)' }}>
            The gap between your Photonic Age and your real age is your Lost Light Years.
          </h3>
          <p className="support">That gap is closable. Today.</p>
        </div>
      </section>

      <section id="diagnostic" className="fade-in snap-section photonic-age-panel" data-nav-theme="light">
        <div className="container photonic-age-panel__content">
          <p className="section-number">03</p>
          <h2 className="section-title">What&apos;s your number?</h2>
          <p className="support" style={{ marginTop: '20px' }}>
            Seven questions. Two minutes. No blood test.
          </p>

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
          <p className="section-number" style={{ color: 'rgba(255, 255, 255, 0.72)' }}>
            04
          </p>
          <h2 className="section-title">Your data. Your call. Your legacy.</h2>

          <p className="support" style={{ marginTop: '20px' }}>
            Every assessment you complete enters the Chronobiobank.
          </p>
          <p className="support">The world&apos;s first longitudinal circadian light dataset.</p>
          <p className="support" style={{ marginTop: 'var(--stack-md)' }}>
            Not owned by investors.
          </p>
          <p className="support">Not sold to advertisers.</p>
          <p className="support">Held in charitable trust. Controlled by you.</p>
          <p className="support" style={{ marginTop: 'var(--stack-md)' }}>
            As it grows, researchers can answer questions no dataset has ever been large enough to ask.
          </p>
          <h3 className="display-md" style={{ marginTop: 'var(--stack-lg)' }}>
            You are not a user.
          </h3>
          <p className="support">You are a founding contributor.</p>

          <div className="copy-actions">
            <Link href="/score" className="btn btn--primary">
              Join the Chronobiobank →
            </Link>
          </div>
        </div>
      </section>

      <div className="container" style={{ paddingTop: '48px', paddingBottom: '24px' }}>
        <p className="support" style={{ maxWidth: '58ch', textAlign: 'center', margin: '0 auto' }}>
          Chronobiobank Limited is a registered charity in England and Wales. Your data is held in
          trust. Never sold. Yours to withdraw.
        </p>
      </div>

      <Footer />
    </main>
  )
}
