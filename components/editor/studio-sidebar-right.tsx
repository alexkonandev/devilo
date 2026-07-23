"use client";

import React, { useState, useEffect } from "react";
import {
  FlagIcon,
  CalendarIcon,
  CaretDown,
  X,
  Check,
  NotePencil,
  PaperPlaneRight,
  WarningCircleIcon,
  NotePencilIcon,
  ClockIcon,
  ClockCounterClockwiseIcon,
  PlusIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useKernelStore } from "@/hooks/use-kernel-store";
import {
  STUDIO_LABEL,
  STUDIO_MONO,
  DS_ICON_WRAPPER,
  DS_ICON_XS,
} from "@/lib/design-system";
import { MAX_QUOTE_LINES } from "@/lib/constants";
import {
  searchClients,
  getClientMetrics,
  getClientHistory,
} from "@/app/actions/studio";
import { notify } from "@/lib/notifications";

// ═══════════════════════════════════════════════════════════════
// TOKENS COMPACTS POUR SIDEBAR DROITE
// ═══════════════════════════════════════════════════════════════
const SIDEBAR_CARD = "bg-white border border-slate-200 rounded-md";
const SIDEBAR_LABEL = STUDIO_LABEL;

// ═══════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════
const STATUS_OPTIONS = [
  { id: "DRAFT", name: "Brouillon", color: "#c9a84c" },
  { id: "SENT", name: "Envoyé", color: "#3b82f6" },
  { id: "REJECTED", name: "Refusé", color: "#ef4444" },
  { id: "PAID", name: "Payé", color: "#22c55e" },
];

interface StudioSidebarRightProps {
  totals: { totalTTC: number; subTotal: number };
  userId: string;
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
  }).format(date);
}


function computeDueDate(issueDateStr: string, validityDays: number): string {
  if (!issueDateStr) return "";
  const issue = new Date(issueDateStr);
  if (isNaN(issue.getTime())) return "";
  const due = new Date(issue);
  due.setDate(due.getDate() + validityDays);
  return due.toISOString().split("T")[0];
}

function getDaysUntil(dueDateStr: string): number {
  if (!dueDateStr) return Infinity;
  const due = new Date(dueDateStr + "T23:59:59");
  const now = new Date();
  const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

function getValidityStatus(daysUntil: number): { label: string; color: string; bg: string; dot: string } {
  if (daysUntil < 0) {
    return { label: "Expiré", color: "text-rose-600", bg: "bg-rose-50", dot: "bg-rose-500" };
  }
  if (daysUntil <= 7) {
    return { label: "Expire bientôt", color: "text-amber-600", bg: "bg-amber-50", dot: "bg-amber-500" };
  }
  return { label: "Valide", color: "text-emerald-600", bg: "bg-emerald-50", dot: "bg-emerald-500" };
}

function computeProgress(issueDateStr: string, dueDateStr: string): number {
  if (!issueDateStr || !dueDateStr) return 0;
  const issue = new Date(issueDateStr);
  const due = new Date(dueDateStr + "T23:59:59");
  const now = new Date();
  const total = due.getTime() - issue.getTime();
  const elapsed = now.getTime() - issue.getTime();
  if (total <= 0) return 0;
  return Math.min(Math.max(Math.round((elapsed / total) * 100), 0), 100);
}

// ═══════════════════════════════════════════════════════════════
// COMPOSANTS INTERNES COMPACTS
// ═══════════════════════════════════════════════════════════════

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className={SIDEBAR_LABEL}>{children}</label>;
}


function ChipSelector({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string | number;
  onChange: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1">
      {options.map((opt) => {
        const isSelected = value === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={cn(
              "py-1.5 px-2 rounded text-[9px] font-semibold transition-all",
              isSelected
                ? "bg-indigo-50 text-indigo-600 border border-indigo-200"
                : "bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function StatusTimeline({
  statuses,
  activeId,
  onSelect,
}: {
  statuses: { id: string; name: string; color: string }[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const mainStatuses = statuses.filter((s) => s.id === "DRAFT" || s.id === "SENT");
  const decisionStatuses = statuses.filter((s) => s.id === "REJECTED" || s.id === "PAID");

  const getStatusIcon = (id: string) => {
    switch (id) {
      case "DRAFT": return NotePencil;
      case "SENT": return PaperPlaneRight;
      case "REJECTED": return X;
      case "PAID": return Check;
      default: return NotePencil;
    }
  };

  const isPastStatus = (statusId: string): boolean => {
    if (activeId === statusId) return false;
    if (statusId === "DRAFT") return activeId !== "DRAFT";
    if (statusId === "SENT") return activeId === "PAID" || activeId === "REJECTED";
    return false;
  };

  const isFutureStatus = (statusId: string): boolean => {
    if (activeId === statusId) return false;
    if (statusId === "DRAFT") return false;
    if (statusId === "SENT") return activeId === "DRAFT";
    return false;
  };

  const isDecisionFuture = (): boolean => {
    return activeId === "DRAFT" || activeId === "SENT" || activeId === "DRAFT";
  };

  const decisionTimelineColor =
    activeId === "PAID" ? "bg-emerald-500" :
    activeId === "REJECTED" ? "bg-red-500" :
    null;

  const decisionBorderColor =
    activeId === "PAID" ? "border-emerald-400" :
    activeId === "REJECTED" ? "border-red-400" :
    null;

  const decisionTextColor =
    activeId === "PAID" ? "text-emerald-600" :
    activeId === "REJECTED" ? "text-red-600" :
    null;

  const decisionIconColor =
    activeId === "PAID" ? "#22c55e" :
    activeId === "REJECTED" ? "#ef4444" :
    null;

  return (
    <div className="px-3 py-2.5">
      {/* ━━━ Chemin principal : DRAFT → SENT ━━━ */}
      <div className="relative pl-6">
        {/* Ligne verticale de connexion */}
        <div className={cn(
          "absolute left-[9px] top-2 bottom-2 w-0.5 transition-colors duration-300",
          decisionTimelineColor || "bg-slate-200",
        )} />

        {mainStatuses.map((status, index) => {
          const Icon = getStatusIcon(status.id);
          const isSelected = activeId === status.id;
          const isPast = isPastStatus(status.id);
          const isFuture = isFutureStatus(status.id);
          const iconColor = isSelected ? status.color : isPast ? (decisionIconColor || status.color) : "#cbd5e1";

          return (
            <button
              key={status.id}
              onClick={() => onSelect(status.id)}
              className={cn(
                "relative flex items-center gap-3 py-2 group text-left w-full transition-all",
                isSelected && "font-bold",
              )}
            >
              {/* Cercle + icône */}
              <div
                className={cn(
                  "relative z-10 flex items-center justify-center w-[18px] h-[18px] rounded-full transition-all shrink-0",
                  isSelected && "shadow-sm",
                )}
                style={{
                  backgroundColor: isSelected ? `${hexToRgba(status.color, 0.1)}` : "transparent",
                }}
              >
                <Icon
                  size={12}
                  weight={isSelected ? "fill" : "bold"}
                  style={{ color: iconColor }}
                />
              </div>

              {/* Nom du statut */}
              <div className="flex-1 min-w-0">
                <span
                  className={cn(
                    STUDIO_MONO,
                    "text-[10px] transition-all duration-200",
                    isSelected && "font-bold text-slate-900",
                    isPast && (decisionIconColor ? "" : "text-slate-500"),
                    isFuture && "text-slate-300",
                    !isSelected && !isPast && !isFuture && "text-slate-400",
                  )}
                style={{ color: isPast && decisionIconColor ? decisionIconColor : undefined }}
                >
                  {status.name}
                </span>
              </div>

              {/* Dot de sélection */}
              {isSelected && (
                <div className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: status.color }} />
              )}
            </button>
          );
        })}
      </div>

      {/* ━━━ Séparateur "Décision" ━━━ */}
      <div className="flex items-center gap-2 my-2 px-1">
        <div className={cn("flex-1 border-t border-dashed transition-colors duration-300", decisionBorderColor || "border-slate-300")} />
        <span className={cn("text-[7px] font-mono uppercase tracking-widest font-semibold transition-colors duration-300", decisionTextColor || "text-slate-400")}>Décision</span>
        <div className={cn("flex-1 border-t border-dashed transition-colors duration-300", decisionBorderColor || "border-slate-300")} />
      </div>

      {/* ━━━ Branches : Refusé | Payé côte à côte ━━━ */}
      <div className="grid grid-cols-2 gap-2">
        {decisionStatuses.map((status) => {
          const Icon = getStatusIcon(status.id);
          const isSelected = activeId === status.id;

          return (
            <button
              key={status.id}
              onClick={() => onSelect(status.id)}
              className={cn(
                "flex items-center gap-1.5 py-2 px-2.5 rounded-lg border-2 transition-all text-left",
                isSelected
                  ? "shadow-sm"
                  : "border-transparent bg-slate-50/40 hover:bg-slate-100 hover:border-slate-300",
              )}
              style={{
                borderColor: isSelected ? status.color : undefined,
                backgroundColor: isSelected ? `${hexToRgba(status.color, 0.06)}` : undefined,
              }}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-[18px] h-[18px] rounded-full transition-all shrink-0",
                )}
                style={{
                  backgroundColor: isSelected ? `${hexToRgba(status.color, 0.1)}` : "transparent",
                }}
              >
                <Icon
                  size={12}
                  weight={isSelected ? "fill" : "bold"}
                  style={{ color: isSelected ? status.color : "#cbd5e1" }}
                />
              </div>

              <span
                className={cn(
                  STUDIO_MONO,
                  "text-[10px] transition-all duration-200",
                  isSelected ? "font-bold" : "font-medium text-slate-500",
                )}
                style={{ color: isSelected ? status.color : undefined }}
              >
                {status.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// BANNIÈRES LIMITE DE LIGNES
// ═══════════════════════════════════════════════════════════════
const WARN_ITEMS_THRESHOLD = 12;

function ItemsProximityWarningBanner({ current }: { current: number }) {
  return (
    <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-md">
      <div className="flex items-start gap-1.5">
        <WarningCircleIcon size={10} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-[8px] font-mono text-amber-800 leading-relaxed">
            Vous approchez de la limite de {MAX_QUOTE_LINES} lignes ({current}/{MAX_QUOTE_LINES}).
            Afin de garantir un devis lisible (1 page max), supprimez des lignes inutiles ou regroupez des prestations.
          </p>
        </div>
      </div>
    </div>
  );
}

function ItemsLimitBanner() {
  return (
    <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-md">
      <div className="flex items-start gap-1.5">
        <WarningCircleIcon size={10} className="text-red-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-[8px] font-mono text-red-800 leading-relaxed">
            Limite de {MAX_QUOTE_LINES} lignes atteinte. Pour ajouter une nouvelle ligne, veuillez d'abord en supprimer une existante.
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// VALIDITY BLOCK — Bloc unifié "Période de validité"
// ═══════════════════════════════════════════════════════════════

const VALIDITY_CHIPS = [
  { id: "15", label: "15j" },
  { id: "30", label: "30j" },
  { id: "45", label: "45j" },
  { id: "60", label: "60j" },
  { id: "90", label: "90j" },
];

interface ValidityBlockProps {
  validityDays: number;
  issueDate: string;
  onValidityDaysChange: (days: number) => void;
}

function ValidityBlock({
  validityDays,
  issueDate,
  onValidityDaysChange,
}: ValidityBlockProps) {
  const effectiveDueDate = React.useMemo(
    () => computeDueDate(issueDate, validityDays),
    [issueDate, validityDays],
  );

  const daysUntil = React.useMemo(() => getDaysUntil(effectiveDueDate), [effectiveDueDate]);
  const status = React.useMemo(() => getValidityStatus(daysUntil), [daysUntil]);
  const progress = React.useMemo(
    () => computeProgress(issueDate, effectiveDueDate),
    [issueDate, effectiveDueDate],
  );

  const isFutureIssue = React.useMemo(() => {
    if (!issueDate) return false;
    const d = new Date(issueDate);
    const now = new Date();
    return d > now;
  }, [issueDate]);

  const hasValidData = issueDate && effectiveDueDate && !isFutureIssue;

  const issuedLabel = React.useMemo(() => {
    if (!issueDate) return "—";
    const d = new Date(issueDate);
    return isNaN(d.getTime()) ? "—" : formatDateShort(d);
  }, [issueDate]);

  const handleChipClick = (daysStr: string) => {
    const days = parseInt(daysStr, 10);
    onValidityDaysChange(days);
  };

  const barColor =
    !hasValidData ? "bg-slate-300" :
    daysUntil < 0 ? "bg-rose-500" :
    daysUntil <= 7 ? "bg-amber-500" :
    "bg-emerald-500";

  const barWidth = React.useMemo(() => {
    if (!hasValidData) return 0;
    if (daysUntil < 0) return 100;
    if (progress <= 2) return 3;
    return Math.min(progress, 100);
  }, [hasValidData, daysUntil, progress]);

  return (
    <div className={cn(SIDEBAR_CARD, "flex flex-col")}>
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100 bg-slate-50/30">
        <span className="text-slate-400"><CalendarIcon size={10} /></span>
        <span className="text-[10px] font-mono text-slate-700">Validité</span>
      </div>

      <div className="p-2 space-y-2.5">
        <div className="relative pt-4 pb-1">
          <div className="absolute left-0 right-0 top-[18px] h-1.5 bg-emerald-100 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-700", barColor)}
              style={{ width: `${barWidth}%` }}
            />
          </div>

          <div className="flex justify-between relative">
            {hasValidData && daysUntil >= 0 ? (
              <div
                className="flex flex-col items-center absolute"
                style={{
                  left: `${Math.min(barWidth, 85)}%`,
                  transform: "translateX(-50%)",
                }}
              >
                  <div className={cn(
                  "w-2.5 h-2.5 rounded-full border-2 border-black shadow-sm z-10",
                  "bg-emerald-500",
                )} />
              </div>
            ) : hasValidData && daysUntil < 0 ? (
              <div className="absolute"
                style={{ left: `${Math.max(Math.min(barWidth, 100), 5)}%`, transform: "translateX(-50%)" }}
              >
                <div className="w-2.5 h-2.5 rounded-full border-2 border-black shadow-sm z-10 bg-rose-500" />
              </div>
            ) : null}
          </div>

          <div className="flex justify-between mt-3">
            <div className="flex flex-col items-start">
              <span className="text-[7px] font-mono text-slate-600 whitespace-nowrap">
                {issuedLabel}
              </span>
              <span className="text-[6px] font-mono text-slate-500">Émission</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[7px] font-mono text-slate-600 whitespace-nowrap">
                {effectiveDueDate ? formatDateShort(new Date(effectiveDueDate)) : "—"}
              </span>
              <span className="text-[6px] font-mono text-slate-500">Échéance</span>
            </div>
          </div>
        </div>

        <div className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded",
          !hasValidData ? "bg-slate-50" : status.bg,
        )}>
          <div className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            !hasValidData ? "bg-slate-400" : status.dot,
          )} />
          <span className={cn(
            "text-[8px] font-mono font-bold uppercase tracking-wider",
            !hasValidData ? "text-slate-500" : status.color,
          )}>
            {!hasValidData ? "Non définie" : status.label}
          </span>
          {hasValidData && daysUntil >= 0 && daysUntil !== Infinity && (
            <span className={cn("text-[8px] font-mono", status.color)}>
              — {daysUntil} jour{daysUntil > 1 ? "s" : ""} restant{daysUntil > 1 ? "s" : ""}
            </span>
          )}
          {hasValidData && daysUntil < 0 && (
            <span className={cn("text-[8px] font-mono", status.color)}>
              — Dépassé de {Math.abs(daysUntil)} jour{Math.abs(daysUntil) > 1 ? "s" : ""}
            </span>
          )}
          {isFutureIssue && (
            <span className="text-[8px] font-mono text-slate-500">
              — Pas encore en vigueur
            </span>
          )}
        </div>

        <div>
          <FieldLabel>Durée de validité</FieldLabel>
          <div className="grid grid-cols-5 gap-1 mt-0.5">
            {VALIDITY_CHIPS.map((chip) => {
              const isSelected = validityDays === parseInt(chip.id, 10);
              return (
                <button
                  key={chip.id}
                  onClick={() => handleChipClick(chip.id)}
                  className={cn(
                    "py-1.5 px-1 rounded text-[9px] font-semibold transition-all text-center",
                    isSelected
                      ? "bg-indigo-50 text-indigo-600 border border-indigo-200"
                      : "bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300",
                  )}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export const StudioSidebarRight = ({
  totals,
  userId,
}: StudioSidebarRightProps) => {
  const {
    activeQuote,
    userSettings,
    updateField,
    addItem,
  } = useKernelStore();

  const [clientHistoryItems, setClientHistoryItems] = useState<
    Array<{
      id: string;
      title: string;
      subtitle: string;
      unitPrice: number;
      quantity: number;
    }>
  >([]);

  const isAtMaxItems = (activeQuote?.items?.length ?? 0) >= MAX_QUOTE_LINES;

  useEffect(() => {
    const abortController = new AbortController();
    const loadHistory = async () => {
      if (!activeQuote?.client.name) {
        setClientHistoryItems([]);
        return;
      }
      if (abortController.signal.aborted) return;
      try {
        const clients = await searchClients(activeQuote.client.name, userId);
        if (abortController.signal.aborted) return;
        const selectedClient = clients.find(
          (c) => c.name === activeQuote.client.name,
        );
        if (selectedClient) {
          const history = await getClientHistory(selectedClient.id, userId);
          if (abortController.signal.aborted) return;
          setClientHistoryItems(history);
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error("Error loading client history:", error);
        }
      }
    };
    loadHistory();
    return () => abortController.abort();
  }, [activeQuote?.client.name, userId]);

  if (!activeQuote || !activeQuote.financials) return null;

  const currency = activeQuote.currency || userSettings?.currency || "XOF";
  const { vatRatePercent, discountAmount } = activeQuote.financials;

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 text-[10px]">
      {/* ━━━ HEADER SIDEBAR ━━━ */}
      <div className="flex items-center justify-between gap-1.5 px-3 py-2.5 border-b border-slate-200 bg-slate-50/40 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono font-semibold text-slate-700">
            Propriétés du devis
          </span>
        </div>
      </div>

      {/* ━━━ CONTENU SCROLLABLE ━━━ */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-2 pt-2 pb-2 space-y-1.5">
        {/* ═══ AVERTISSEMENT LIMITE DE LIGNES ═══ */}
        {(() => {
          const itemCount = activeQuote.items?.length ?? 0;
          const isAtMaxItems = itemCount >= MAX_QUOTE_LINES;
          if (isAtMaxItems) {
            return <ItemsLimitBanner />;
          }
          if (itemCount >= WARN_ITEMS_THRESHOLD) {
            return <ItemsProximityWarningBanner current={itemCount} />;
          }
          return null;
        })()}
        {/* ═══ STATUT DOCUMENT ═══ */}
        <div className={cn(SIDEBAR_CARD, "flex flex-col")}>
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100 bg-slate-50/30">
            <span className="text-slate-400 text-[10px]">
              <FlagIcon size={10} />
            </span>
            <span className="text-[10px] font-mono text-slate-700">
              Statut{" "}
            </span>
          </div>
          <StatusTimeline
            statuses={STATUS_OPTIONS}
            activeId={activeQuote.quote.status}
            onSelect={(id: string) => updateField("quote", "status", id)}
          />
        </div>

        {/* ═══ PÉRIODE DE VALIDITÉ (unifié) ═══ */}
        <ValidityBlock
          validityDays={activeQuote.validityDays}
          issueDate={activeQuote.quote.issueDate}
          onValidityDaysChange={(days: number) =>
            updateField(null, "validityDays", days)
          }
        />

        {/* ═══ HISTORIQUE CLIENT ═══ */}
        <div className={cn(SIDEBAR_CARD, "flex flex-col")}>
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100 bg-slate-50/30">
            <span className="text-slate-400">
              <ClockIcon size={10} />
            </span>
            <span className="text-[10px] font-mono text-slate-700">
              Historique
            </span>
          </div>
          <div className="p-2">
            {clientHistoryItems.length > 0 ? (
              <div className="space-y-0.5">
                {clientHistoryItems.map((histItem) => (
                  <button
                    key={histItem.id}
                    onClick={() => {
                      if (isAtMaxItems) {
                        notify.info(
                          "Limite de 15 lignes atteinte. Supprimez une ligne existante avant d'en ajouter une nouvelle."
                        );
                        return;
                      }
                      addItem({
                        title: histItem.title,
                        subtitle: histItem.subtitle,
                        unitPrice: histItem.unitPrice,
                        quantity: 1,
                        baseCost: 0,
                      });
                      notify.success("LIGNE AJOUTÉE", histItem.title);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between p-1.5 rounded-md border transition-all",
                      isAtMaxItems
                        ? "border-slate-100 opacity-50 cursor-not-allowed"
                        : "border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30"
                    )}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div
                        className={cn(DS_ICON_WRAPPER, "bg-slate-100 shrink-0")}
                      >
                        <ClockCounterClockwiseIcon size={DS_ICON_XS} />
                      </div>
                      <span className="text-[10px] font-mono text-slate-700 truncate">
                        {histItem.title}
                      </span>
                    </div>
                    <PlusIcon size={12} className="text-slate-400 shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-slate-100 mb-1.5">
                  <ClockIcon size={12} className="text-slate-400" />
                </div>
                <p className="text-[10px] font-mono text-slate-700 mb-0.5">
                  Aucun historique
                </p>
                <p className="text-[8px] font-mono text-slate-500">
                  Les anciennes prestations réapparaîtront ici
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ━━━ FOOTER: CARD FINANCIÈRE ━━━ */}
      <div className="shrink-0 border-t border-slate-200">
        <div className="px-2 py-1.5">
          <div className="flex gap-1 mt-1">
            <div className="flex-1">
              <span className={STUDIO_LABEL}>Remise</span>
              <div className="relative mt-0.5">
                <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[8px] text-slate-400 font-semibold">
                  -
                </span>
                <input
                  type="number"
                  value={discountAmount}
                  onChange={(e) =>
                    updateField(
                      "financials",
                      "discountAmount",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 pl-3.5 font-mono text-[9px] text-rose-600 text-right focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
              </div>
            </div>
            <div className="shrink-0">
              <span className={STUDIO_LABEL}>TVA (%)</span>
              <div className="relative mt-0.5">
                <input
                  type="number"
                  value={vatRatePercent}
                  onChange={(e) =>
                    updateField(
                      "financials",
                      "vatRatePercent",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-14 bg-white border border-slate-200 rounded px-1.5 py-1 font-mono text-[9px] text-slate-900 text-right focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="mt-1 h-0.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
              style={{
                width: `${Math.min((totals.totalTTC / 1000000) * 100, 100)}%`,
              }}
            />
          </div>

          <div className="mt-1 pt-1.5 border-t border-slate-100 flex items-center justify-between">
            <span className={STUDIO_LABEL}>Total TTC</span>
            <span className="font-mono text-base font-bold text-slate-900 leading-none tracking-tight">
              {new Intl.NumberFormat("fr-FR")
                .format(Math.floor(totals.totalTTC))
                .replace(/\s/g, "\u00A0")}
              <span
                className={cn(STUDIO_MONO, "font-semibold text-slate-600 ml-1")}
              >
                {currency}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};