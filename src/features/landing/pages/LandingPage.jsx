import { Navbar } from '../components/Navbar'
import { HeroSection } from '../components/HeroSection'
import { MarketingTeamSection } from '../components/MarketingTeamSection'
import { SocialBand } from '../components/SocialBand'
import { PipelineSection } from '../components/PipelineSection'
import { ImpactBentoSection } from '../components/ImpactBentoSection'
import { CtaSection } from '../components/CtaSection'
import { Footer } from '../components/Footer'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fef7ff]">
      <Navbar />
      <main>
        <HeroSection />
        <MarketingTeamSection />
        <PipelineSection />
        <SocialBand id="connectors" />
        <ImpactBentoSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
