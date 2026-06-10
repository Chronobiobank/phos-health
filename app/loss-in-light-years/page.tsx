import type { Metadata } from 'next'
import Link from 'next/link'

import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'
import { LossDualPanel } from '@/components/LossDualPanel'

export const metadata: Metadata = {
  title: 'Measure loss. Reverse it. · PHOS Circadian Health',
  description: 'Quantified circadian misalignment and firm-level financial impact.',
}

export default function LossInLightYearsPage() {
  return (
    <main data-nav-theme="light">
      <Nav />

      <section id="photonic-age" className="detail-page loss-page photonic-age-panel">
        <div className="container detail-page__content loss-page__content">
          <p className="section-number">02</p>
          <h1 className="section-title loss-page__title">Measure loss. Reverse it.</h1>
          <p className="support">The CFO sees the leak. HR sees what changes daily.</p>

          <LossDualPanel ctaHref="/dashboard" ctaLabel="View dashboard →" />

          <div className="detail-page__actions">
            <Link href="/research/photonic-age" className="btn btn--outline">
              Read the methodology →
            </Link>
            <Link href="/" className="btn btn--outline">
              Back to home
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
