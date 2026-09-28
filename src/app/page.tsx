import { ClientExperienceSection } from "@/components/homepage/client-experience-section";
import { FeaturesSection } from "@/components/homepage/features-section";
import { HeroSection } from "@/components/homepage/hero-section";
import { ReadinessSection } from "@/components/homepage/readiness-section";
import { SecuritySection } from "@/components/homepage/security-section";
import { SiteFooter } from "@/components/homepage/site-footer";
import { SiteHeader } from "@/components/homepage/site-header";
import { WorkflowSection } from "@/components/homepage/workflow-section";

export default function Home() {
  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />

      <main>
        <HeroSection />
        <WorkflowSection />
        <FeaturesSection />
        <ClientExperienceSection />
        <ReadinessSection />
        <SecuritySection />
      </main>

      <SiteFooter />
    </div>
  );
}