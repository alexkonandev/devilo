"use client";

import React, { ReactNode } from "react";
import { SpatialDock } from "@/components/spatial-dock";
import { SpatialStatusBar } from "@/components/spatial-status-bar";
import { SandboxBanner } from "@/components/sandbox-banner";
import { cn } from "@/lib/utils";

interface SoftwareLayoutProps {
  children: ReactNode;
  isDemoMode?: boolean;
}

export default function SoftwareLayoutClient({
  children,
  isDemoMode = false,
}: SoftwareLayoutProps) {
  return (
    <div className="h-screen w-screen bg-slate-50 font-sans text-slate-900">
      <SandboxBanner isDemoMode={isDemoMode} />
      <SpatialStatusBar isDemoMode={isDemoMode} />
      <SpatialDock isDemoMode={isDemoMode} />
      <main className={cn(
        "h-full w-full overflow-y-auto pl-16",
        isDemoMode ? "pt-[68px]" : "pt-10",
      )}>
        {children}
      </main>
    </div>
  );
}