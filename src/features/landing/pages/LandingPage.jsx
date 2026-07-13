import { Navbar } from '../components/Navbar'
import { HeroSection } from '../components/HeroSection'
import { FeaturesSection } from '../components/FeaturesSection'
import { WhyChooseSection } from '../components/WhyChooseSection'
import { SocialSection } from '../components/SocialSection'
import { Footer } from '../components/Footer'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <WhyChooseSection />
        <SocialSection />
      </main>
      <Footer />
    </div>
  )
}
