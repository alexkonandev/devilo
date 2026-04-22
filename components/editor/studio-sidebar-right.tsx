"use client";

import React, { useState } from "react";
import {
  PaletteIcon,
  CheckIcon,
  FlagIcon,
  ReceiptIcon,
  CaretDownIcon,
  CloudCheckIcon,
  ClockCounterClockwiseIcon,
  HashIcon,
  PercentIcon,
  TagIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TimerIcon,
  TrendUpIcon,
  FileTextIcon,
  PaintBrushIcon,
  DownloadIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { EditorTheme } from "@/types/editor";
import { useKernelStore } from "@/hooks/use-kernel-store";

// ═══════════════════════════════════════════════════════════════
// DS TOKENS - Design System Épuré
// ═══════════════════════════════════════════════════════════════
const ISLAND = cn(
  "bg-white/80 backdrop-blur-sm border border-slate-200/60 shadow-sm rounded-2xl overflow-hidden transition-all duration-300",
);

const MICRO_LABEL =
  "text-[7px] font-bold uppercase tracking-[0.25em] text-slate-400";
const COMPACT_LABEL = "text-[9px] font-semibold text-slate-500 block mb-1";

const STATUS_OPTIONS = [
  { id: "DRAFT", name: "Brouillon", color: "#94a3b8" },
  { id: "SENT", name: "Envoyé", color: "#3b82f6" },
  { id: "ACCEPTED", name: "Accepté", color: "#10b981" },
  { id: "REJECTED", name: "Refusé", color: "#ef4444" },
  { id: "PAID", name: "Payé", color: "#6366f1" },
];

const TABS = [
  { id: "finance", label: "Finance", icon: TrendUpIcon },
  { id: "legal", label: "Légal", icon: FileTextIcon },
  { id: "workflow", label: "Workflow", icon: PaintBrushIcon },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface StudioSidebarRightProps {
  availableThemes: EditorTheme[];
  totals: { totalTTC: number; subTotal: number };
}

export const StudioSidebarRight = ({
  availableThemes,
  totals,
}: StudioSidebarRightProps) => {
  const {
    activeQuote,
    activeThemeId,
    setActiveThemeId,
    userSettings,
    updateField,
    isSaving,
  } = useKernelStore();

  const [activeTab, setActiveTab] = useState<TabId>("finance");
  const [expandedCard, setExpandedCard] = useState<string | null>("summary");

  if (!activeQuote || !activeQuote.financials) return null;

  const currency = activeQuote.currency || userSettings?.currency || "XOF";
  const { vatRatePercent, discountAmount } = activeQuote.financials;

  const totalHTapresRemise = Math.max(
    0,
    totals.subTotal - (discountAmount || 0),
  );
  const vatAmount = (totalHTapresRemise * (vatRatePercent || 0)) / 100;

  const toggleCard = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-50/80 to-white border-l border-slate-200/60">
      {/* ━━━ HERO TTC - Compact & Élégant ━━━ */}
      <div className="p-4 shrink-0">
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 shadow-xl shadow-slate-900/10">
          {/* Gradient subtil */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />

          <div className="relative px-5 py-5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className={cn(MICRO_LABEL, "text-slate-500 mb-1")}>
                Total TTC
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {currency}
              </span>
            </div>
            <div className="text-right">
              <span className="font-mono text-[28px] font-black italic text-white leading-none tracking-tight">
                {new Intl.NumberFormat("fr-FR")
                  .format(Math.floor(totals.totalTTC))
                  .replace(/\s/g, "\u00A0")}
              </span>
            </div>
          </div>

          {/* Barre de progression subtile */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
              style={{
                width: `${Math.min((totals.totalTTC / 1000000) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* ━━━ TABS NAVIGATION - Minimaliste ━━━ */}
      <div className="px-4 pb-3 shrink-0">
        <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-200/50",
                )}
              >
                <Icon size={14} weight={isActive ? "fill" : "regular"} />
                <span
                  className={cn(
                    "text-[10px] font-semibold",
                    isActive && "font-bold",
                  )}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ━━━ CONTENT: Tab Panels ━━━ */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-4 pb-4 space-y-3">
        {/* ═══════════════════════════════════════════════════════════════
            TAB 1: FINANCE & TAXES
        ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "finance" && (
          <div className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-200">
            {/* Synthèse Financière */}
            <CompactCard
              title="Synthèse"
              icon={
                <ReceiptIcon
                  size={14}
                  weight="light"
                  className="text-slate-400"
                />
              }
              isOpen={expandedCard === "summary"}
              onToggle={() => toggleCard("summary")}
              badge={`${totals.subTotal.toLocaleString()} ${currency}`}
            >
              <div className="p-3 space-y-2">
                <MicroRow
                  label="Base HT"
                  value={totals.subTotal}
                  currency={currency}
                />
                <MicroRow
                  label="Remise"
                  value={-discountAmount}
                  currency={currency}
                  variant="negative"
                />
                <MicroRow
                  label={`TVA (${vatRatePercent}%)`}
                  value={vatAmount}
                  currency={currency}
                  variant="highlight"
                />
                <div className="pt-2 border-t border-slate-100">
                  <MicroRow
                    label="Net TTC"
                    value={totals.totalTTC}
                    currency={currency}
                    bold
                  />
                </div>
              </div>
            </CompactCard>

            {/* Paramètres fiscaux */}
            <CompactCard
              title="Paramètres fiscaux"
              icon={
                <PercentIcon
                  size={14}
                  weight="light"
                  className="text-slate-400"
                />
              }
              isOpen={expandedCard === "tax"}
              onToggle={() => toggleCard("tax")}
              badge={`${vatRatePercent}%`}
            >
              <div className="p-3 space-y-3">
                <CompactField label="Taux TVA (%)">
                  <CompactInput
                    type="number"
                    value={vatRatePercent}
                    onChange={(e) =>
                      updateField(
                        "financials",
                        "vatRatePercent",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    suffix="%"
                  />
                </CompactField>

                <CompactField label={`Remise (${currency})`}>
                  <CompactInput
                    type="number"
                    value={discountAmount}
                    onChange={(e) =>
                      updateField(
                        "financials",
                        "discountAmount",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    prefix="-"
                    variant="negative"
                  />
                </CompactField>
              </div>
            </CompactCard>

            {/* Devise */}
            <CompactCard
              title="Devise"
              icon={
                <CurrencyDollarIcon
                  size={14}
                  weight="light"
                  className="text-slate-400"
                />
              }
              isOpen={expandedCard === "currency"}
              onToggle={() => toggleCard("currency")}
              badge={currency}
            >
              <div className="p-3">
                <div className="grid grid-cols-2 gap-2">
                  {["XOF", "EUR", "USD", "GBP"].map((curr) => (
                    <button
                      key={curr}
                      onClick={() => updateField(null, "currency", curr)}
                      className={cn(
                        "py-2 px-3 rounded-xl text-[10px] font-semibold transition-all",
                        currency === curr
                          ? "bg-indigo-50 text-indigo-600 border border-indigo-200"
                          : "bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300",
                      )}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>
            </CompactCard>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB 2: LOGISTIQUE & LÉGAL
        ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "legal" && (
          <div className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-200">
            {/* Conditions de règlement */}
            <CompactCard
              title="Échéance & Validité"
              icon={
                <CalendarIcon
                  size={14}
                  weight="light"
                  className="text-slate-400"
                />
              }
              isOpen={expandedCard === "payment"}
              onToggle={() => toggleCard("payment")}
              badge={
                activeQuote.quote.dueDate || `${activeQuote.validityDays}j`
              }
            >
              <div className="p-3 space-y-3">
                <CompactField label="Date d'échéance">
                  <CompactInput
                    type="date"
                    value={activeQuote.quote.dueDate || ""}
                    onChange={(e) =>
                      updateField("quote", "dueDate", e.target.value)
                    }
                  />
                </CompactField>

                <CompactField label="Validité (jours)">
                  <div className="flex items-center gap-2">
                    {[15, 30, 45, 60].map((days) => (
                      <button
                        key={days}
                        onClick={() => updateField(null, "validityDays", days)}
                        className={cn(
                          "flex-1 py-2 rounded-xl text-[10px] font-semibold transition-all",
                          activeQuote.validityDays === days
                            ? "bg-indigo-50 text-indigo-600 border border-indigo-200"
                            : "bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300",
                        )}
                      >
                        {days}j
                      </button>
                    ))}
                  </div>
                </CompactField>
              </div>
            </CompactCard>

            {/* Indexation */}
            <CompactCard
              title="Référence"
              icon={
                <HashIcon size={14} weight="light" className="text-slate-400" />
              }
              isOpen={expandedCard === "index"}
              onToggle={() => toggleCard("index")}
              badge={activeQuote.quote.number}
            >
              <div className="p-3">
                <CompactField label="N° Devis">
                  <CompactInput
                    value={activeQuote.quote.number}
                    onChange={(e) =>
                      updateField("quote", "number", e.target.value)
                    }
                  />
                </CompactField>
              </div>
            </CompactCard>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB 3: WORKFLOW
        ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "workflow" && (
          <div className="space-y-3 animate-in fade-in slide-in-from-right-2 duration-200">
            {/* Statut */}
            <CompactCard
              title="Statut document"
              icon={
                <FlagIcon size={14} weight="light" className="text-slate-400" />
              }
              isOpen={expandedCard === "status"}
              onToggle={() => toggleCard("status")}
              badge={
                STATUS_OPTIONS.find((s) => s.id === activeQuote.quote.status)
                  ?.name
              }
            >
              <div className="p-2 space-y-1">
                {STATUS_OPTIONS.map((status) => {
                  const isSelected = activeQuote.quote.status === status.id;
                  return (
                    <button
                      key={status.id}
                      onClick={() => updateField("quote", "status", status.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left",
                        isSelected
                          ? "bg-slate-900 text-white"
                          : "hover:bg-slate-50 text-slate-500",
                      )}
                    >
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: status.color }}
                      />
                      <span className="text-[11px] font-medium flex-1">
                        {status.name}
                      </span>
                      {isSelected && <CheckIcon size={12} weight="bold" />}
                    </button>
                  );
                })}
              </div>
            </CompactCard>

            {/* Thème */}
            <CompactCard
              title="Thème visuel"
              icon={
                <PaletteIcon
                  size={14}
                  weight="light"
                  className="text-slate-400"
                />
              }
              isOpen={expandedCard === "theme"}
              onToggle={() => toggleCard("theme")}
              badge={availableThemes.find((t) => t.id === activeThemeId)?.name}
            >
              <div className="p-2 grid grid-cols-2 gap-1.5">
                {availableThemes.map((theme) => {
                  const isSelected = activeThemeId === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => setActiveThemeId(theme.id)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all text-left",
                        isSelected
                          ? "bg-indigo-50 border border-indigo-200"
                          : "hover:bg-slate-50 border border-transparent",
                      )}
                    >
                      <div
                        className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: theme.color }}
                      />
                      <span
                        className={cn(
                          "text-[10px] font-medium truncate",
                          isSelected ? "text-indigo-700" : "text-slate-600",
                        )}
                      >
                        {theme.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CompactCard>
          </div>
        )}
      </div>

      {/* ━━━ FOOTER: Status Sauvegarde ━━━ */}
      <div className="mt-auto px-4 py-3 border-t border-slate-200/60 bg-white/50 backdrop-blur-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-all duration-300",
              isSaving ? "bg-amber-400 animate-pulse" : "bg-emerald-500",
            )}
          />
          <span className="text-[9px] font-medium text-slate-400">
            {isSaving ? "Sauvegarde..." : "Synchronisé"}
          </span>
        </div>
        <CloudCheckIcon
          size={14}
          className={cn(
            "transition-colors",
            isSaving ? "text-slate-300" : "text-emerald-500",
          )}
        />
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPOSANTS INTERNES - Design Compact
// ═══════════════════════════════════════════════════════════════

function CompactCard({
  title,
  icon,
  children,
  isOpen,
  onToggle,
  badge,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  badge?: string | React.ReactNode;
}) {
  return (
    <div className={cn(ISLAND, "flex flex-col")}>
      <button
        onClick={onToggle}
        className="px-4 py-3 flex items-center justify-between group hover:bg-slate-50/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-slate-400">{icon}</span>
          <div className="flex flex-col items-start">
            <span className="text-[11px] font-semibold text-slate-700">
              {title}
            </span>
            {!isOpen && badge && (
              <span className="text-[9px] text-indigo-500 font-medium">
                {badge}
              </span>
            )}
          </div>
        </div>
        <CaretDownIcon
          size={10}
          className={cn(
            "text-slate-400 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-200 ease-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden border-t border-slate-100/60 bg-slate-50/30">
          {children}
        </div>
      </div>
    </div>
  );
}

function CompactField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={COMPACT_LABEL}>{label}</label>
      {children}
    </div>
  );
}

function CompactInput({
  type = "text",
  value,
  onChange,
  prefix,
  suffix,
  variant = "default",
}: {
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  prefix?: string;
  suffix?: string;
  variant?: "default" | "negative" | "positive";
}) {
  const variantStyles = {
    default: "text-slate-900",
    negative: "text-rose-600",
    positive: "text-emerald-600",
  };

  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-400">
          {prefix}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={cn(
          "w-full bg-white border border-slate-200 rounded-xl h-9 text-[11px] font-medium outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all",
          prefix ? "pl-7" : "pl-3",
          suffix ? "pr-7" : "pr-3",
          variantStyles[variant],
        )}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400">
          {suffix}
        </span>
      )}
    </div>
  );
}

function MicroRow({
  label,
  value,
  currency,
  variant = "default",
  bold = false,
}: {
  label: string;
  value: number;
  currency: string;
  variant?: "default" | "negative" | "highlight";
  bold?: boolean;
}) {
  const variantStyles = {
    default: "text-slate-600",
    negative: "text-rose-500",
    highlight: "text-indigo-600",
  };

  return (
    <div className="flex justify-between items-center">
      <span className="text-[10px] text-slate-400">{label}</span>
      <span
        className={cn(
          "text-[11px] font-mono font-semibold",
          variantStyles[variant],
          bold && "font-bold text-slate-900",
        )}
      >
        {value >= 0 ? "" : "-"}
        {Math.abs(value).toLocaleString("fr-FR")}
        <span className="text-[9px] text-slate-400 ml-0.5">{currency}</span>
      </span>
    </div>
  );
}
