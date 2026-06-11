import type { Metadata } from 'next'

import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'
import { ProtocolView } from '@/components/protocol/ProtocolView'

export const metadata: Metadata = {
  title: 'Your protocol · PHOS',
  description: 'Your Photonic Age protocol recommendation.',
}

export default function ProtocolPage() {
  return (
    <main data-nav-theme="light">
      <Nav />
      <ProtocolView />
      <Footer />
    </main>
  )
}
