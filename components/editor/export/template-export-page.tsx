"use client";

import React, { useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getAvailableTemplates, resolveTemplate } from "@/lib/template-system";
import { useKernelStore } from "@/hooks/use-kernel-store";
import { ExportTemplateCard } from "./export-template-card";
import { TemplatePreviewPanel } from "./template-preview-panel";
import { toast } from "sonner";
import {
  ArrowLeftIcon,
  PrinterIcon,
  PaletteIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
} from "@phosphor-icons/react";

export function TemplateExportPage() {
  const router = useRouter();
  const pathname = usePathname();
  const isDemo = pathname.startsWith("/demo");

  // --- STORE ---
  const activeQuote = useKernelStore((s) => s.activeQuote);
  const activeTemplateId = useKernelStore((s) => s.activeTemplateId);
  const setActiveTemplateId = useKernelStore((s) => s.setActiveTemplateId);
  const billing = useKernelStore((s) => s.billing);

  // --- ETAT LOCAL ---
  const templates = getAvailableTemplates();
  const [selectedId, setSelectedId] = useState<string>(
    activeTemplateId || templates[0]?.id || "minimal-invoice",
  );
  const [exporting, setExporting] = useState(false);
  const [previewScale, setPreviewScale] = useState(0.90);

  const selectedTemplate = resolveTemplate(selectedId);
  const isFreePlan = billing?.plan === "FREE";
  const isSelectedPremiumLocked = selectedTemplate?.tier === "premium" && isFreePlan;

  // Selectionner un template
  const handleSelect = useCallback(
    (id: string) => {
      setSelectedId(id);
      setActiveTemplateId(id);
    },
    [setActiveTemplateId],
  );

  // Exporter le PDF
  const handleExport = useCallback(async () => {
    if (!activeQuote || !selectedId) return;

    if (isSelectedPremiumLocked) {
      router.push(isDemo ? "/demo/billing" : "/billing");
      return;
    }

    setExporting(true);
    const toastId = toast.loading("Generation du PDF...");
    try {
      const response = await fetch("/api/print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...activeQuote, templateId: selectedId }),
      });
      if (!response.ok) throw new Error("Erreur");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
      toast.success("PDF genere avec succes", { id: toastId });
    } catch (error) {
      console.error("Erreur generation PDF:", error);
      toast.error("Echec de la generation", { id: toastId });
    } finally {
      setExporting(false);
    }
  }, [activeQuote, selectedId, isSelectedPremiumLocked, router]);

  // Retour a l'editeur
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const txtEdition = "Retour à l'éditeur";
  const txtChoisirTemplate = "Choisissez votre template d'export";

  // Zoom controls
  const handleZoomIn = () => {
    setPreviewScale((prev) => Math.min(prev + 0.1, 1.0));
  };
  const handleZoomOut = () => {
    setPreviewScale((prev) => Math.max(prev - 0.1, 0.25));
  };

  if (!activeQuote) {
    return (
      <div className="h-screen w-full bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
            Aucun devis à exporter
          </span>
          <div className="mt-4">
            <button
              onClick={() => router.push(isDemo ? "/demo/quotes/new" : "/quotes/new")}
              className="px-4 py-2 rounded-lg text-[9px] font-mono font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
            >
              {txtEdition}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col">
      {/* === HEADER === */}
      <header className="flex items-center h-12 px-3 border-b border-slate-200 bg-white shrink-0 gap-2">
        {/* Retour */}
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[9px] font-mono font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-all"
        >
          <ArrowLeftIcon size={11} weight="bold" className="shrink-0" />
          <span>{txtEdition}</span>
        </button>

        <div className="w-px h-4 bg-slate-300" />

        {/* Titre */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center">
            <PaletteIcon size={12} className="text-indigo-600" />
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-800 tracking-tight">
            {txtChoisirTemplate}
          </span>
        </div>

        <div className="flex-1" />

        {/* Devis info */}
        <div className="flex items-center gap-2 text-[8px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
          <span className="font-bold text-slate-700">{activeQuote?.quote?.number || "N° —"}</span>
          <span className="text-slate-300">&middot;</span>
          <span>{activeQuote?.client?.name || "Sans client"}</span>
          <span className="text-slate-300">&middot;</span>
          <span>{selectedTemplate?.name || "—"}</span>
        </div>

        <div className="w-px h-4 bg-slate-300" />

        {/* Bouton Exporter */}
        <button
          onClick={handleExport}
          disabled={exporting || isSelectedPremiumLocked}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold transition-all border",
            isSelectedPremiumLocked
              ? "bg-amber-500 text-white border-amber-500 hover:bg-amber-600 cursor-pointer"
              : exporting
                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                : "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700",
          )}
        >
          <PrinterIcon size={11} weight="bold" className="shrink-0" />
          <span>
            {isSelectedPremiumLocked
              ? "Passer en PRO"
              : exporting
                ? "Génération..."
                : "Exporter le PDF"}
          </span>
        </button>
      </header>

      {/* === CONTENU SPLIT === */}
      <div className="flex-1 flex min-h-0">
        {/* --- SIDEBAR GAUCHE : GRILLE DE TEMPLATES 3 COLONNES --- */}
        <aside className="shrink-0 w-150 border-r border-slate-200 bg-white overflow-y-auto scrollbar-none">
          <div className="p-3 space-y-3">
            {/* Info plan */}
            {isFreePlan && (
              <div className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-[7px] font-mono text-amber-700 leading-relaxed">
                  Les templates Premium nécessitent un abonnement PRO.
                </p>
              </div>
            )}

            {/* Grille 3 colonnes */}
            <div className="grid grid-cols-3 gap-1.5">
              {templates.map((tpl) => {
                const isSelected = selectedId === tpl.id;
                const isPremiumLocked = tpl.tier === "premium" && isFreePlan;

                return (
                  <ExportTemplateCard
                    key={tpl.id}
                    template={tpl}
                    isSelected={isSelected}
                    isPremiumLocked={isPremiumLocked}
                    onSelect={() => handleSelect(tpl.id)}
                  />
                );
              })}
            </div>
          </div>
        </aside>

        {/* --- PANEL DROIT : APERCU TEMPS REEL AVEC ZOOM --- */}
        <div className="flex-1 bg-slate-100/50 min-h-0 flex flex-col">
          {/* Zoom controls */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-white shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono font-bold text-slate-700 uppercase tracking-wider">
                Aperçu en temps réel
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleZoomOut}
                title="Zoom arrière"
                className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all"
              >
                <MagnifyingGlassMinusIcon size={10} weight="bold" />
              </button>
              <span className="text-[9px] font-mono font-bold text-slate-600 min-w-[36px] text-center">
                {Math.round(previewScale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                title="Zoom avant"
                className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 transition-all"
              >
                <MagnifyingGlassPlusIcon size={10} weight="bold" />
              </button>
              {selectedTemplate && (
                <div className="flex items-center gap-1 ml-2 pl-2 border-l border-slate-200">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedTemplate.colors.primary }} />
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedTemplate.colors.accent }} />
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedTemplate.colors.surface }} />
                  <span className="text-[7px] font-mono text-slate-400 ml-0.5">{selectedTemplate.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Preview avec zoom dynamique */}
          <div className="flex-1 overflow-auto scrollbar-none flex justify-center bg-slate-100/50 py-4">
            <TemplatePreviewPanel
              templateId={selectedId}
              template={selectedTemplate}
              scale={previewScale}
            />
          </div>

        </div>
      </div>
    </div>
  );
}