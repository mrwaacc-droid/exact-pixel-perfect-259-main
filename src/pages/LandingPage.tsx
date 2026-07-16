import { Navigation } from "@/components/landing/Navigation";
import { Hero } from "@/components/landing/Hero";
import { InstitutionStrip } from "@/components/landing/InstitutionStrip";
import { LearningJourney } from "@/components/landing/LearningJourney";
import { ClassroomExperience } from "@/components/landing/ClassroomExperience";
import { LiveHybridClassrooms } from "@/components/landing/LiveHybridClassrooms";
import { AccessibilityExperience } from "@/components/landing/AccessibilityExperience";
import { InstitutionControl } from "@/components/landing/InstitutionControl";
import { RoleSelector } from "@/components/landing/RoleSelector";
import { Solutions } from "@/components/landing/Solutions";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main
      id="main-content"
      className="cinematic-page min-h-screen text-body"
    >
      <div className="cinematic-grain" />
      <Navigation />
      <Hero />
      <InstitutionStrip />
      <LearningJourney />
      <ClassroomExperience />
      <LiveHybridClassrooms />
      <AccessibilityExperience />
      <InstitutionControl />
      <RoleSelector />
      <Solutions />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
