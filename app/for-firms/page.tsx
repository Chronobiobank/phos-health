import type { Metadata } from 'next'
import Link from 'next/link'

import { CostCalculator } from '@/components/CostCalculator'
import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'

export const metadata: Metadata = {
  title: 'Model your firm · PHOS Circadian Health',
  description: 'Estimate annual circadian misalignment cost across your professional workforce.',
}

export default function ForFirmsPage() {
  return (
    <main data-nav-theme="light">
      <Nav />

      <section id="model-your-firm" className="detail-page for-firms-page model-firm-panel">
        <div className="container detail-page__content">
          <p className="section-number">04</p>
          <h1 className="section-title">Model your firm</h1>
          <p className="support">From £495 per professional.</p>

          <CostCalculator />

          <div className="detail-page__actions">
            <Link href="/org" className="btn btn--primary">
              Employer dashboard →
            </Link>
            <Link href="/org/join" className="btn btn--outline">
              Join with invite code
            </Link>
            <Link href="/contact" className="btn btn--outline">
              Book free demo →
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
