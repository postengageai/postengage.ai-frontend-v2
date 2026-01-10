import { LandingHeader } from '@/components/landing/landing-header';
import { HeroSection } from '@/components/landing/hero-section';
import { SocialProofSection } from '@/components/landing/social-proof-section';
import { ProblemSection } from '@/components/landing/problem-section';
import { SolutionSection } from '@/components/landing/solution-section';
import { HowItWorksSection } from '@/components/landing/how-it-works-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { TestimonialsSection } from '@/components/landing/testimonials-section';
import { PricingPreviewSection } from '@/components/landing/pricing-preview-section';
import { CTASection } from '@/components/landing/cta-section';
import { LandingFooter } from '@/components/landing/landing-footer';

export default function LandingPage() {
  return (
    <div className='min-h-screen bg-background'>
      <LandingHeader />
      <main>
        {/* Hook: Emotional entry with live counter + Instagram demo */}
        <HeroSection />

        {/* Trust: Quick brand validation */}
        <SocialProofSection />

        {/* Pain: Show the cost of inaction */}
        <ProblemSection />

        {/* Solution: AI that sounds like you */}
        <SolutionSection />

        {/* Simplicity: 3 steps to start */}
        <HowItWorksSection />

        {/* Reassurance: Control, speed, analytics */}
        <FeaturesSection />

        {/* Proof: Real results from real creators */}
        <TestimonialsSection />

        {/* Value: Simple pricing preview */}
        <PricingPreviewSection />

        {/* Urgency: Final push with live counter */}
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
