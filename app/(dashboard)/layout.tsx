"use client";

import React, { ReactNode } from "react";
import { SpatialDock } from "@/components/spatial-dock";
import { SpatialStatusBar } from "@/components/spatial-status-bar";
import { AnimatedBackground } from "@/features/dashboard/components/animated-background";
import { useSpatialMouse } from "@/features/dashboard/hooks/use-spatial-mouse";

interface SoftwareLayoutProps {
  children: ReactNode;
}

export default function SoftwareLayout({ children }: SoftwareLayoutProps) {
  // Global mouse tracking for the entire spatial experience
  const { x: mouseX, y: mouseY } = useSpatialMouse();

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* ═══ GLOBAL Z=0 : VOID ═══ */}
      <AnimatedBackground mouseX={mouseX} mouseY={mouseY} />

      {/* ═══ GLOBAL Z=50 : HUD ═══ */}
      <SpatialStatusBar />
      <SpatialDock />

      {/* ═══ APP CONTENT LAYER ═══
          - h-[calc(100vh-2.5rem)] : viewport strict moins la top bar h-10
          - pt-10 : sous la Top Bar h-10
          - pl-16 : rail sidebar w-16
          - overflow-hidden : pas de scroll global, scroll segmenté dans les panneaux
      */}
      <main className="relative z-10 h-full w-full overflow-hidden pt-10 pl-16">
        {children}
      </main>
    </div>
  );
}
