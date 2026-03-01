import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { ServicesTeaser } from "@/components/sections/ServicesTeaser";
import { SaaSBanner } from "@/components/sections/SaaSBanner";
import { PortfolioTeaser } from "@/components/sections/PortfolioTeaser";
import { WhyVixingo } from "@/components/sections/WhyVixingo";
import { BlogTeaser } from "@/components/sections/BlogTeaser";
import { TeamPreview } from "@/components/sections/TeamPreview";
import { ContactCTA } from "@/components/sections/ContactCTA";
import { ChatWidget } from "@/components/chat/ChatWidget";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <ServicesTeaser />
        <SaaSBanner />
        <PortfolioTeaser />
        <WhyVixingo />
        <BlogTeaser />
        <TeamPreview />
        <ContactCTA />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
