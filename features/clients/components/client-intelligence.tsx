"use client";

import React, { useState } from "react";
import {
  FilePdf,
  WhatsappLogo,
  Stack,
  Lightning,
  ArrowRight,
  ChartLineUp,
  EnvelopeSimple,
  IconProps,
  ArrowsClockwise, // Import de l'icône de chargement
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { ClientListItem } from "@/types/client";
import { toast } from "sonner";
import { SmartRelanceSheet } from "./smart-relance-sheet";

interface ClientIntelligenceProps {
  client?: ClientListItem;
}

export function ClientIntelligence({ client }: ClientIntelligenceProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  if (!client) return <IntelligencePlaceholder />;

  const currentYear = new Date().getFullYear();
  const currentYearRevenue = client.quotes
    .filter((q) => new Date(q.createdAt).getFullYear() === currentYear)
    .reduce((sum, q) => sum + q.totalAmount, 0);

  const growthRatio =
    client.totalSpent > 0
      ? Math.min(
          Math.round((currentYearRevenue / client.totalSpent) * 100),
          100
        )
      : 0;

  const lastQuote = client.quotes?.[0];

  const handleExportAudit = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    const toastId = toast.loading("GÉNÉRATION_AUDIT_EN_COURS", {
      description: "Le moteur Puppeteer prépare votre rapport...",
      className:
        "rounded-none border-slate-900 font-bold text-[10px] uppercase",
    });

    try {
      const response = await fetch(`/api/clients/${client.id}/audit`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Échec de la génération");
      }

      // 1. Récupération du flux binaire
      const blob = await response.blob();

      // 2. Création d'une URL locale sécurisée
      const url = window.URL.createObjectURL(blob);

      // 3. STRATÉGIE DE TÉLÉCHARGEMENT FORCÉ
      const link = document.createElement("a");
      link.href = url;
      // Nettoyage du nom de fichier pour éviter les bugs d'OS
      const safeName = client.name.replace(/[^a-z0-9]/gi, "_").toUpperCase();
      link.setAttribute("download", `AUDIT_STRAT_${safeName}.pdf`);

      // Ajout temporaire au DOM pour déclencher le clic sur certains navigateurs
      document.body.appendChild(link);
      link.click();

      // 4. Nettoyage immédiat
      document.body.removeChild(link);
      // On attend un peu avant de révoquer l'URL pour laisser le temps au navigateur de lancer le process
      setTimeout(() => window.URL.revokeObjectURL(url), 100);

      toast.success("EXPORT_TERMINÉ", {
        id: toastId,
        description: "L'audit a été téléchargé dans votre dossier local.",
        className:
          "rounded-none border-emerald-600 font-bold text-[10px] uppercase",
      });
    } catch (error) {
      console.error("[FRONT_EXPORT_ERROR]:", error);
      toast.error("ERREUR_SYSTÈME", {
        id: toastId,
        description:
          "Vérifiez les logs serveur (Puppeteer a peut-être échoué).",
        className:
          "rounded-none border-red-600 font-bold text-[10px] uppercase",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEmail = () => {
    const subject = lastQuote
      ? `Suivi de votre dossier ${lastQuote.number}`
      : "Suivi de collaboration";
    window.location.href = `mailto:${client.email}?subject=${encodeURIComponent(
      subject
    )}`;
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/22500000000`, "_blank");
  };

  return (
    <div className="flex flex-col h-full bg-white antialiased border-l border-slate-200 w-80 shrink-0 overflow-hidden">
      {/* 1. MOTEUR DE PROFIT */}
      <section className="p-4 bg-white border-b border-slate-200">
        <div className="bg-slate-900 p-5 text-white relative overflow-hidden border border-black shadow-lg shadow-slate-200/50">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">
                Analyse_Revenus
              </span>
              <ChartLineUp
                size={16}
                weight="bold"
                className="text-emerald-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                Valeur_Vie_Client (LTV)
              </label>
              <p className="font-mono text-[22px] font-black tracking-tighter leading-none">
                {new Intl.NumberFormat("fr-CI").format(client.totalSpent)}
                <span className="text-[10px] ml-1 text-slate-500 uppercase font-bold">
                  XOF
                </span>
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-[8px] font-mono text-slate-500 uppercase">
                <span>Ratio_Année_{currentYear}</span>
                <span className="text-emerald-400">{growthRatio}%</span>
              </div>
              <div className="h-[2px] w-full bg-white/10">
                <div
                  className="h-full bg-emerald-500 transition-all duration-1000"
                  style={{ width: `${growthRatio}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CENTRE DE COMMANDE */}
      <section className="flex-1 overflow-y-auto scrollbar-none">
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-900">
            Actions_Stratégiques
          </span>
        </div>

        <div className="divide-y divide-slate-100 border-b border-slate-200">
          <SmartRelanceSheet
            client={client}
            trigger={
              <IntelligenceButton
                icon={Lightning}
                label="Relance_Smart"
                sub={
                  lastQuote ? `Basée sur ${lastQuote.number}` : "Aucune donnée"
                }
                isPrimary
              />
            }
          />
          <IntelligenceButton
            icon={EnvelopeSimple}
            label="Email_Direct"
            sub={client.email || "Non configuré"}
            onClick={handleEmail}
          />
          <IntelligenceButton
            icon={WhatsappLogo}
            label="Lien_WhatsApp"
            sub="Contact Business Direct"
            onClick={handleWhatsApp}
          />

          {/* BOUTON PDF DYNAMIQUE */}
          <IntelligenceButton
            icon={isGenerating ? ArrowsClockwise : FilePdf}
            label="Export_Audit"
            sub={isGenerating ? "Calcul en cours..." : "Générer rapport .PDF"}
            onClick={handleExportAudit}
            isLoading={isGenerating}
          />
        </div>

        {/* 3. RÉPERTOIRE DES DOCUMENTS */}
        <div className="bg-[#fcfcfc] min-h-full">
          <div className="px-5 py-3 border-b border-slate-200 flex justify-between items-center">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
              Actifs_Générés
            </span>
            <span className="text-[8px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500">
              {client.quoteCount} DOCS
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {client.quotes.map((quote) => (
              <DocumentItem
                key={quote.id}
                label={`DEVIS_${quote.number}.pdf`}
                size="PDF"
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// --- SOUS-COMPOSANTS ---

function IntelligenceButton({
  icon: Icon,
  label,
  sub,
  isPrimary,
  onClick,
  isLoading,
}: {
  icon: React.ComponentType<IconProps>;
  label: string;
  sub: string;
  isPrimary?: boolean;
  onClick?: () => void;
  isLoading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        "w-full px-5 py-4 flex items-center justify-between transition-all group border-l-2 border-l-transparent active:bg-slate-100 disabled:opacity-70",
        isPrimary
          ? "bg-indigo-50/20 border-l-indigo-600"
          : "bg-white hover:bg-slate-50"
      )}
    >
      <div className="flex items-start gap-4 text-left truncate">
        <Icon
          size={20}
          weight="duotone"
          className={cn(
            "mt-0.5 shrink-0",
            isPrimary
              ? "text-indigo-600"
              : "text-slate-400 group-hover:text-slate-900",
            isLoading && "animate-spin"
          )}
        />
        <div className="flex flex-col truncate">
          <span
            className={cn(
              "text-[10px] font-black uppercase tracking-widest leading-none mb-1",
              isPrimary ? "text-indigo-600" : "text-slate-900"
            )}
          >
            {label}
          </span>
          <span className="text-[8px] font-bold uppercase text-slate-400 tracking-tight truncate">
            {sub}
          </span>
        </div>
      </div>
      {!isLoading && (
        <ArrowRight
          size={12}
          weight="bold"
          className="text-slate-200 group-hover:text-slate-400 shrink-0"
        />
      )}
    </button>
  );
}

function DocumentItem({ label, size }: { label: string; size: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 bg-white hover:bg-slate-50 transition-colors cursor-pointer group">
      <div className="flex items-center gap-3 truncate">
        <Stack
          size={16}
          weight="duotone"
          className="text-slate-300 group-hover:text-indigo-600"
        />
        <span className="text-[10px] font-bold text-slate-600 truncate uppercase tracking-tighter">
          {label}
        </span>
      </div>
      <span className="text-[8px] font-mono font-bold text-slate-400">
        {size}
      </span>
    </div>
  );
}

function IntelligencePlaceholder() {
  return (
    <div className="h-full w-80 border-l border-slate-200 flex flex-col items-center justify-center p-8 bg-[#fcfcfc] text-center">
      <Lightning
        size={20}
        weight="duotone"
        className="text-slate-200 animate-pulse mb-4"
      />
      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">
        Attente_Signal_Actif
      </p>
    </div>
  );
}
