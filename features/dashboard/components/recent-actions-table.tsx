"use client";

import React, { type ReactNode, useState, useTransition } from "react";
import {
  CheckCircleIcon,
  FileTextIcon,
  ClockAfternoon,
  Tag,
  ArrowRight,
  Check,
} from "@phosphor-icons/react";
import { cn, formatPriceCompact } from "@/lib/utils";
import {
  DS_MICRO,
  DS_LABEL,
  DS_MONO,
  DS_BENTO_CARD,
  DS_SECTION_HEADER,
  DS_ICON_WRAPPER,
  DS_ICON_SM,
} from "@/lib/design-system";
import { QuoteStatus } from "@/app/generated/prisma/enums";
import { sendReminderAction } from "@/actions/send-reminder-action";

// ═══════════════════════════════════════════════════════════════════════════════
// RECENT ACTIONS TABLE — Tableau enrichi Phase 3
// ═══════════════════════════════════════════════════════════════════════════════

interface RecentActionItem {
  id: string;
  clientNom: string;
  projetTitre: string;
  montant: number;
  statut: QuoteStatus;
  date: string;
  delaiJours: number;
  estUrgent: boolean;
  variationMontant: number;
  categorie: string;
  quoteCount: number;
}

interface RecentActionsTableProps {
  items: RecentActionItem[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDelai(delaiJours: number): { label: string; variant: string } {
  if (delaiJours === 0) return { label: "Aujourd'hui", variant: "success" };
  if (delaiJours === 1) return { label: "Hier", variant: "neutral" };
  if (delaiJours <= 7) return { label: `Il y a ${delaiJours}j`, variant: "neutral" };
  return { label: `${delaiJours}j`, variant: "warning" };
}

const CATEGORIE_STYLES: Record<string, string> = {
  Tech: "bg-blue-50 text-blue-700 border-blue-200",
  Créatif: "bg-purple-50 text-purple-700 border-purple-200",
  Marketing: "bg-amber-50 text-amber-700 border-amber-200",
  Content: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Consulting: "bg-rose-50 text-rose-700 border-rose-200",
};

function formatVariation(variation: number): { label: string; isPositive: boolean } {
  const sign = variation > 0 ? "+" : "";
  return {
    label: `${sign}${variation}%`,
    isPositive: variation >= 0,
  };
}

// ─── Composant ────────────────────────────────────────────────────────────────

export function RecentActionsTable({ items }: RecentActionsTableProps) {
  return (
    <div className={cn(DS_BENTO_CARD, "p-0 overflow-hidden bg-white")}>
      <div
        className={cn(
          DS_SECTION_HEADER,
          "px-3 py-2 border-b border-slate-100/60 mb-0",
        )}
      >
        <div className="flex items-center gap-2">
          <div className={cn(DS_ICON_WRAPPER, "bg-slate-100")}>
            <FileTextIcon size={DS_ICON_SM} className="text-slate-500" />
          </div>
          <span className={cn(DS_MICRO, "text-slate-600")}>
            Dernières Actions
          </span>
        </div>
        <span className={cn(DS_MONO, "text-slate-400")}>
          {items.length} entrées
        </span>
      </div>
      <div>
        {/* ── En-tête de colonnes ── */}
        <div className="flex items-center px-3 py-2 bg-slate-50/80 border-b border-slate-100/60">
          <div className={cn(DS_LABEL, "flex-[2.5]")}>Action</div>
          <div className={cn(DS_LABEL, "flex-[1.5]")}>Client</div>
          <div className={cn(DS_LABEL, "flex-[1.2] text-left")}>Montant</div>
          <div className={cn(DS_LABEL, "flex-[1.2] text-left")}>Délai</div>
          <div className={cn(DS_LABEL, "flex-[1.5] text-left")}>Urgence</div>
          <div className={cn(DS_LABEL, "flex-[1.2] text-left")}>Catégorie</div>
          <div className={cn(DS_LABEL, "flex-[1.2] text-center")}>Action</div>
        </div>
        {/* ── Lignes ── */}
        <div className="divide-y divide-slate-100/60">
          {items.map((item): ReactNode => {
            const delai = formatDelai(item.delaiJours);
            const categorieStyle = CATEGORIE_STYLES[item.categorie] ?? "bg-slate-50 text-slate-700 border-slate-200";

            return (
              <div
                key={item.id}
                className="flex items-center px-3 py-2 hover:bg-slate-50/50 transition-colors cursor-pointer group"
              >
                {/* ── Action (icône + titre) ── */}
                <div className="flex-[2.5] flex items-center gap-2 min-w-0">
                  <div
                    className={cn(
                      DS_ICON_WRAPPER,
                      item.statut === "PAID"
                        ? "bg-indigo-50 text-indigo-600"
                        : "bg-slate-50 text-slate-500",
                    )}
                  >
                    {item.statut === "PAID" ? (
                      <CheckCircleIcon size={DS_ICON_SM} weight="bold" />
                    ) : (
                      <FileTextIcon size={DS_ICON_SM} />
                    )}
                  </div>
                  <span className="text-xs font-medium text-slate-900 truncate max-w-[140px]">
                    {item.projetTitre}
                  </span>
                </div>

                {/* ── Client ── */}
                <div className="flex-[1.5] min-w-0">
                  <span className={cn(DS_MONO, "text-slate-600 truncate block")}>
                    {item.clientNom}
                  </span>
                </div>

                {/* ── Montant ── */}
                <div className="flex-[1.2] text-left">
                  <span className={cn(DS_MONO, "font-bold text-slate-900")}>
                    {formatPriceCompact(item.montant)}
                  </span>
                </div>

                {/* ── Délai ── */}
                <div className="flex-[1.2] text-left">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-medium",
                      delai.variant === "success" && "bg-emerald-50 text-emerald-700 border border-emerald-200",
                      delai.variant === "neutral" && "bg-slate-50 text-slate-600 border border-slate-200",
                      delai.variant === "warning" && "bg-amber-50 text-amber-700 border border-amber-200",
                    )}
                  >
                    <ClockAfternoon size={10} className="shrink-0" />
                    {delai.label}
                  </span>
                </div>

                {/* ── Urgence ── */}
                <div className="flex-[1.5] text-left">
                  {item.estUrgent ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                      <span className="text-[10px] font-mono font-medium text-rose-600">
                        En retard
                      </span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-[10px] font-mono font-medium text-emerald-600">
                        Bon
                      </span>
                    </span>
                  )}
                </div>

                {/* ── Catégorie ── */}
                <div className="flex-[1.2] text-left">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-medium border",
                      categorieStyle,
                    )}
                  >
                    <Tag size={10} className="shrink-0" />
                    {item.categorie}
                  </span>
                </div>

                {/* ── Action (bouton Relancer / lien devis) ── */}
                <div className="flex-[1.2] flex justify-center">
                  {item.estUrgent ? (
                    <SendReminderButton quoteId={item.id} />
                  ) : (
                    <a
                      href={`/quotes?id=${item.id}`}
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 rounded-md",
                        "text-[10px] font-mono font-medium uppercase tracking-wide",
                        "bg-slate-50 text-slate-500 border border-slate-200",
                        "hover:bg-slate-100 transition-colors",
                      )}
                    >
                      Voir
                      <ArrowRight size={10} weight="bold" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Bouton de relance avec feedback interactif ──────────────────────────────

function SendReminderButton({ quoteId }: { quoteId: string }) {
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    startTransition(async () => {
      setError(null);
      const result = await sendReminderAction(quoteId);
      if (result.success) {
        setSent(true);
      } else {
        setError(result.error ?? "Erreur lors de l'envoi");
      }
    });
  }

  if (sent) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <Check size={10} weight="bold" />
        Envoyée
      </span>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={cn(
          "inline-flex items-center gap-1 px-2 py-1 rounded-md",
          "text-[10px] font-mono font-medium uppercase tracking-wide",
          "bg-rose-50 text-rose-700 border border-rose-200",
          "hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
        )}
      >
        {isPending ? (
          <>
            <svg className="animate-spin h-2.5 w-2.5 shrink-0" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Envoi…
          </>
        ) : (
          <>
            Relancer
            <ArrowRight size={10} weight="bold" />
          </>
        )}
      </button>
      {error && (
        <span className="text-[9px] text-rose-500 mt-0.5" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
