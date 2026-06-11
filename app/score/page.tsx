import type { Metadata } from 'next'

import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'
import { ScoreFlow } from '@/components/score/ScoreFlow'

export const metadata: Metadata = {
  title: 'Photonic Age diagnostic · PHOS',
  description: 'Seven questions. Your Photonic Age and protocol.',
}

export default function ScorePage() {
  return (
    <main data-nav-theme="light">
      <Nav />
      <ScoreFlow />
      <Footer />
    </main>
  )
}
