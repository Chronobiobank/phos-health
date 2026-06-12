import type { Metadata } from 'next'

import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'
import { PathwayView } from '@/components/pathway/PathwayView'
import { normalizePathwayLane } from '@/lib/pathway/lanes'

export const metadata: Metadata = {
  title: 'Your pathway · PHOS',
  description: 'Signpost guidance for your circadian signal. Information you choose to act on.',
}

type PathwayPageProps = {
  searchParams: Promise<{ lane?: string }>
}

export default async function PathwayPage({ searchParams }: PathwayPageProps) {
  const { lane: laneParam } = await searchParams
  const lane = normalizePathwayLane(laneParam)

  return (
    <main className="pathway-shell" data-nav-theme="light">
      <Nav />
      <PathwayView lane={lane} />
      <Footer />
    </main>
  )
}
