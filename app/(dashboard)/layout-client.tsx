"use client";

import React, { ReactNode } from "react";
import { SpatialDock } from "@/components/spatial-dock";
import { SpatialStatusBar } from "@/components/spatial-status-bar";

interface SoftwareLayoutProps {
  children: ReactNode;
}

export default function SoftwareLayoutClient({ children }: SoftwareLayoutProps) {
  return (
    <div className="h-screen w-screen bg-slate-50 font-sans text-slate-900">
      <SpatialStatusBar />
      <SpatialDock />
      <main className="h-full w-full overflow-y-auto pt-12 pl-16">
        {children}
      </main>
    </div>
  );
}