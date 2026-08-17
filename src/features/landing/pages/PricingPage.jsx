import { Footer } from '../components/Footer'
import { Navbar } from '../components/Navbar'
import { PricingSection } from '../components/PricingSection'

export function PricingPage() {
  return (
    <div className="min-h-screen bg-[#fef7ff]">
      <Navbar />
      <main className="pt-[72px]">
        <PricingSection />
      </main>
      <Footer />
    </div>
  )
}
