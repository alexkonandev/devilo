"use client";

import React from "react";
import PrintableQuote from "@/components/pdf/printable-quote";
import { EditorActiveQuote } from "@/types/editor";

interface QuoteVisualizerProps {
  data: EditorActiveQuote | null;
  printRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * QuoteVisualizer — Spatial Intelligence Edition
 *
 * This component is now PURELY a pass-through renderer.
 * All chrome (status bar, zoom controls) was moved to:
 *   - FloatingToolbar     → zoom, view mode, theme, focus
 *   - QuoteEditorLayout   → canvas, elevation shadows, ambient glow
 *
 * This keeps the document tree clean for `window.print()`.
 *
 * Le rendu A4 utilise désormais le templateId actif depuis le store
 * via PrintableQuote, qui résout le TemplateDefinition correspondant.
 */
export const QuoteVisualizer = ({
  data,
  printRef,
}: QuoteVisualizerProps) => {
  // Loading state
  if (!data) {
    return (
      <div className="w-[210mm] min-h-[297mm] bg-white flex items-center justify-center ">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 border-2 border-indigo-100 rounded-full" />
            <div className="absolute inset-0 border-2 border-t-indigo-500 rounded-full animate-spin" />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-300">
            Initialisation…
          </span>
        </div>
      </div>
    );
  }

  return (
    <PrintableQuote
      ref={printRef}
      quote={data}
    />
  );
};
