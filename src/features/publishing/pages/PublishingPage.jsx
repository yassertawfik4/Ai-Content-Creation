import { MetaPublishingDashboard } from "@/features/connectors/components/MetaPublishingDashboard";
import { Footer } from "@/features/landing/components/Footer";
import { Navbar } from "@/features/landing/components/Navbar";

export function PublishingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#fef7ff] text-[#1d1b20]">
      <Navbar />
      <main>
        <MetaPublishingDashboard />
      </main>
      <Footer />
    </div>
  );
}
