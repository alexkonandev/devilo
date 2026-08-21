"use client";

import React from "react";
import LandingNav from "@/components/landing/landing-nav";
import LandingHero from "@/components/landing/landing-hero";
import LandingFeatures from "@/components/landing/landing-features";
import LandingWorkflow from "@/components/landing/landing-workflow";
import LandingFaq from "@/components/landing/landing-faq";
import LandingCta from "@/components/landing/landing-cta";
import LandingFooter from "@/components/landing/landing-footer";

interface LandingPageViewProps {
  userId: string | null;
  hasQuote: boolean;
}

export default function LandingPageView({ userId, hasQuote }: LandingPageViewProps) {
  return (
    <div className="min-h-screen bg-[var(--lp-bg)] text-[var(--lp-text)] font-sans antialiased">
      <LandingNav userId={userId} />
      <LandingHero userId={userId} />
      <LandingWorkflow />
      <LandingFeatures />
      <LandingFaq />
      <LandingCta userId={userId} hasQuote={hasQuote} />
      <LandingFooter />
    </div>
  );
}