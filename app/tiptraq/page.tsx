import type { Metadata } from 'next'
import Link from 'next/link'

import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'

export const metadata: Metadata = {
  title: 'TipTraQ · PHOS Circadian Health',
  description: 'Three nights at home. Clinical analysis. HR dashboard in 48 hours.',
}

export default function TipTraqPage() {
  return (
    <main data-nav-theme="dark">
      <Nav />

      <section id="tiptraq" className="detail-page tiptraq-page tiptraq-panel">
        <img
          className="tiptraq-panel__image"
          src="/tiptraq/tiptraq.jpg"
          alt=""
          aria-hidden="true"
        />
        <div className="tiptraq-panel__veil" aria-hidden="true" />
        <div className="container detail-page__content tiptraq-page__content">
          <p className="section-number" style={{ color: 'rgba(255, 255, 255, 0.72)' }}>
            03
          </p>
          <h1 className="section-title">TipTraQ at home</h1>
          <p className="support">Dashboard in 48 hours.</p>

          <div className="tiptraq-page__steps">
            <p className="support">Three nights on TipTraQ at home.</p>
            <p className="support">Clinical analysis by PHOS.</p>
            <p className="support">Firm dashboard inside 48 hours.</p>
          </div>

          <div className="detail-page__actions">
            <Link href="/dashboard" className="btn btn--primary">
              View demo dashboard →
            </Link>
            <Link href="/for-firms" className="btn btn--outline">
              Model your firm →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
