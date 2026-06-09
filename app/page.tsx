import { Nav } from '@/components/Nav'
import { HeroSection } from '@/components/HeroSection'
import { HowItWorksSection } from '@/components/HowItWorksSection'
import { BodyCloQSection } from '@/components/BodyCloQSection'
import { ShopSection } from '@/components/ShopSection'
import { CTASection } from '@/components/CTASection'
import { Footer } from '@/components/Footer'

export default function Home() {
  return (
    <main>
      <Nav />
      <HeroSection />
      <HowItWorksSection />
      <BodyCloQSection />
      <ShopSection />
      <CTASection />
      <Footer />
    </main>
  )
}
