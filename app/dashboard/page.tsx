import type { Metadata } from 'next'
import Link from 'next/link'

import { DummyDashboard } from '@/components/DummyDashboard'
import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'

export const metadata: Metadata = {
  title: 'Dashboard · PHOS Circadian Health',
  description: 'Sample Photonic Age dashboard from a three-night TipTraQ study.',
}

export default function DashboardPage() {
  return (
    <main data-nav-theme="light">
      <Nav />

      <section className="dashboard-page">
        <div className="container dashboard-page__content">
          <p className="section-number">Sample dashboard</p>
          <h1 className="section-title">Your Photonic Age</h1>
          <p className="support">Night-shift A&E registrar, London · age 43 · three nights of TipTraQ data.</p>

          <DummyDashboard />

          <div className="dashboard-page__actions">
            <Link href="/" className="btn btn--outline">
              Back to home
            </Link>
            <a href="mailto:hello@phos.org.uk?subject=Book%20free%20demo" className="btn btn--primary">
              Book free demo →
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
