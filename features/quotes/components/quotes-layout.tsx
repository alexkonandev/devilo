"use client";

import React from "react";

interface QuotesLayoutProps {
  explorer: React.ReactNode; // RADAR : Liste & Flux
  inspector: React.ReactNode; // FOCUS : Work Product (Document / Détails)
  intelligence: React.ReactNode; // STRATÉGIE : Profit & Data
}

export function QuotesLayout({
  explorer,
  inspector,
  intelligence,
}: QuotesLayoutProps) {
  return (
    /**
     * Viewport 100% - Hauteur calculée moins le Header Studio (2.5rem / 40px)
     * Utilisation de 'bg-white' comme base neutre
     */
    <div className="flex h-[calc(100vh-2.5rem)] w-full overflow-hidden bg-white antialiased">
      {/* 1. RADAR : EXPLORATEUR (G) - Standard 320px */}
      <aside className="w-80 shrink-0 border-r border-slate-200 flex flex-col bg-slate-50/30 overflow-hidden">
        {explorer}
      </aside>

      {/* 2. FOCUS : INSPECTEUR (C) - Zone de production extensible */}
      <main className="flex-1 min-w-0 flex flex-col bg-white overflow-hidden relative">
        {inspector}
      </main>

      {/* 3. STRATÉGIE : INTELLIGENCE (D) - Standard 320px */}
      <aside className="w-80 shrink-0 border-l border-slate-200 flex flex-col bg-slate-50/30 overflow-hidden">
        {intelligence}
      </aside>
    </div>
  );
}
