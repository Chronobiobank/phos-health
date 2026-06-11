import type { Metadata } from 'next'

import { DashboardView } from '@/components/dashboard/DashboardView'

export const metadata: Metadata = {
  title: 'Dashboard · PHOS Circadian Health',
  description: 'Your Photonic Age, confidence band, and daily cues.',
}

export default function DashboardPage() {
  return (
    <section className="dashboard-page">
      <div className="container dashboard-page__content">
        <DashboardView />
      </div>
    </section>
  )
}
