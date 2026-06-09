import { Nav } from '@/components/Nav'
import { HeroSection } from '@/components/HeroSection'
import { ProblemSection } from '@/components/ProblemSection'
import { StatStrip } from '@/components/StatStrip'
import { HowItWorksSection } from '@/components/HowItWorksSection'
import { PhotonicAgeSection } from '@/components/PhotonicAgeSection'
import { ShopSection } from '@/components/ShopSection'
import { CTASection } from '@/components/CTASection'
import { Footer } from '@/components/Footer'

export default function Home() {
  return (
    <main>
      <Nav />
      <HeroSection />
      <ProblemSection />
      <StatStrip />
      <HowItWorksSection />
      <PhotonicAgeSection />
      <ShopSection />
      <CTASection />
      <Footer />
    </main>
  )
}
