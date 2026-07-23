"use client";

import React, { ReactNode } from "react";

interface OnboardingLayoutProps {
  children: ReactNode;
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="h-screen w-screen bg-slate-50 font-sans text-slate-900">
      <main className="h-full w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}