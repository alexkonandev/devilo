"use client";

import React, { useMemo } from "react";
import { useKernelStore } from "@/hooks/use-kernel-store";
import { generateQuoteHTML } from "@/lib/print-template";
import { resolveTemplate, type TemplateDefinition } from "@/lib/template-system";

interface TemplatePreviewPanelProps {
  templateId: string;
  template: TemplateDefinition | null;
  scale?: number;
}

export function TemplatePreviewPanel({
  templateId,
  template,
  scale = 0.90
}: TemplatePreviewPanelProps) {
  const activeQuote = useKernelStore((s) => s.activeQuote);

  const htmlContent = useMemo(() => {
    if (!activeQuote) return "";
    const resolved = template || resolveTemplate(templateId || "minimal-invoice");
    return generateQuoteHTML(activeQuote, resolved);
  }, [activeQuote, templateId, template]);

  if (!activeQuote) {
    return (
      <div className="h-full flex items-center justify-center">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
          Aucun devis actif
        </span>
      </div>
    );
  }

  if (!templateId && !template) {
    return (
      <div className="h-full flex items-center justify-center">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
          Sélectionnez un template
        </span>
      </div>
    );
  }

  return (
    <div className="relative origin-top flex flex-col"
      style={{
        width: "210mm",
        transform: `scale(${scale})`,
        transformOrigin: "top center",
        gap: "16px",
      }}
    >
      <div
        dangerouslySetInnerHTML={{ __html: htmlContent }}
        className="print-color-adjust-exact"
      />
    </div>
  );
}