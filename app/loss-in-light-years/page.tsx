import type { Metadata } from 'next'
import Link from 'next/link'

import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'
import { PhotonicAgeTile } from '@/components/PhotonicAgeTile'

export const metadata: Metadata = {
  title: 'How we quantify loss · PHOS Circadian Health',
  description: 'Quantified circadian misalignment and firm-level financial impact.',
}

export default function LossInLightYearsPage() {
  return (
    <main data-nav-theme="light">
      <Nav />

      <section id="photonic-age" className="detail-page loss-page photonic-age-panel">
        <div className="container detail-page__content loss-page__content">
          <p className="section-number">02</p>
          <h1 className="section-title loss-page__title">How we quantify loss</h1>
          <p className="support">The metric serious firms will compare.</p>

          <PhotonicAgeTile ctaHref="/tiptraq" ctaLabel="How we measure it →" />

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
