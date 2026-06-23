"use client";

import React, { useState } from "react";
import {
  PaletteIcon,
  CheckIcon,
  FlagIcon,
  ReceiptIcon,
  CloudCheckIcon,
  HashIcon,
  PercentIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TrendUpIcon,
  PaintBrushIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { DS_MONO, DS_ICON_SM } from "@/lib/design-system";
import { EditorTheme } from "@/types/editor";
import { useKernelStore } from "@/hooks/use-kernel-store";

// ═══════════════════════════════════════════════════════════════
// TOKENS COMPACTS POUR SIDEBAR DROITE
// ═══════════════════════════════════════════════════════════════
const SIDEBAR_CARD = "bg-white border border-slate-200 rounded-md";
const SIDEBAR_LABEL = "text-[8px] font-mono uppercase tracking-wider text-slate-500 mb-1 block";
const SIDEBAR_INPUT =
  "w-full bg-white border border-slate-200 px-2 py-1.5 font-mono text-[10px] text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all";

// ═══════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════
const STATUS_OPTIONS = [
  { id: "DRAFT", name: "Brouillon", color: "#94a3b8" },
  { id: "SENT", name: "Envoyé", color: "#3b82f6" },
  { id: "ACCEPTED", name: "Accepté", color: "#10b981" },
  { id: "REJECTED", name: "Refusé", color: "#ef4444" },
  { id: "PAID", name: "Payé", color: "#6366f1" },
];

const TABS = [
  { id: "finance", label: "Finance", icon: TrendUpIcon },
  { id: "workflow", label: "Workflow", icon: PaintBrushIcon },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface StudioSidebarRightProps {
  availableThemes: EditorTheme[];
  totals: { totalTTC: number; subTotal: number };
}

// ═══════════════════════════════════════════════════════════════
// COMPOSANTS INTERNES COMPACTS
// ═══════════════════════════════════════════════════════════════

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className={SIDEBAR_LABEL}>{children}</label>;
}

function FieldInput({
  type = "text",
  value,
  onChange,
  prefix,
  suffix,
  variant = "default",
}: {
  type?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400">{prefix}</span>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        className={cn(
          SIDEBAR_INPUT,
          "h-7 text-[9px] rounded",
          prefix ? "pl-6" : "pl-2",
          suffix ? "pr-6" : "pr-2",
          variantStyles[variant],
        )}
      />
      {suffix && (
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-semibold text-slate-400">{suffix}</span>
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
    <div className="flex justify-between items-center py-0.5">
      <span className="text-[8px] font-mono uppercase tracking-wider text-slate-400">{label}</span>
      <span
        className={cn(
          "text-[10px] font-mono font-semibold",
          variantStyles[variant],
          bold && "font-bold text-slate-900",
        )}
      >
        {value >= 0 ? "" : "-"}
        {Math.abs(value).toLocaleString("fr-FR")}
        <span className="text-[7px] text-slate-400 ml-0.5">{currency}</span>
      </span>
    </div>
  );
}

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  );
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

function StatusOption({
  status,
  isSelected,
  onClick,
}: {
  status: { id: string; name: string; color: string };
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-2.5 py-2 rounded transition-all text-left",
        isSelected ? "bg-slate-900 text-white" : "hover:bg-slate-50 text-slate-500",
      )}
    >
      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: status.color }} />
      <span className="text-[10px] font-medium flex-1">{status.name}</span>
      {isSelected && <CheckIcon size={10} weight="bold" />}
    </button>
  );
}

function ThemeOption({
  theme,
  isSelected,
  onClick,
}: {
  theme: EditorTheme;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-2 py-2 rounded transition-all text-left",
        isSelected ? "bg-indigo-50 border border-indigo-200" : "hover:bg-slate-50 border border-transparent",
      )}
    >
      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: theme.color }} />
      <span className={cn("text-[9px] font-medium truncate", isSelected ? "text-indigo-700" : "text-slate-600")}>
        {theme.name}
      </span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
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

  if (!activeQuote || !activeQuote.financials) return null;

  const currency = activeQuote.currency || userSettings?.currency || "XOF";
  const { vatRatePercent, discountAmount } = activeQuote.financials;

  const totalHTapresRemise = Math.max(0, totals.subTotal - (discountAmount || 0));
  const vatAmount = (totalHTapresRemise * (vatRatePercent || 0)) / 100;

  const CURRENCY_OPTIONS = [
    { id: "XOF", label: "XOF" },
    { id: "EUR", label: "EUR" },
    { id: "USD", label: "USD" },
    { id: "GBP", label: "GBP" },
  ];

  const VALIDITY_OPTIONS = [
    { id: "15", label: "15j" },
    { id: "30", label: "30j" },
    { id: "45", label: "45j" },
    { id: "60", label: "60j" },
  ];

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 text-[10px]">
      {/* ━━━ HERO TTC ━━━ */}
      <div className="p-2 shrink-0">
        <div className="rounded-md bg-white border border-slate-200 px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[7px] font-mono uppercase tracking-widest text-slate-500">Total TTC</span>
              <span className="text-[7px] font-mono text-slate-400">{currency}</span>
            </div>
            <div className="text-right">
              <span className="font-mono text-lg font-bold text-slate-900 leading-none tracking-tight">
                {new Intl.NumberFormat("fr-FR")
                  .format(Math.floor(totals.totalTTC))
                  .replace(/\s/g, "\u00A0")}
              </span>
            </div>
          </div>
          <div className="mt-2 h-0.5 bg-slate-200">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min((totals.totalTTC / 1000000) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* ━━━ TABS ━━━ */}
      <div className="px-2 pb-1.5 shrink-0">
        <div className="flex p-0.5 bg-slate-100 rounded-md">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1 py-1 rounded-md transition-all",
                  isActive ? "bg-white text-slate-900 border border-slate-200" : "text-slate-400 hover:text-slate-600",
                )}
              >
                <Icon size={10} weight={isActive ? "fill" : "regular"} />
                <span className={cn("text-[7px] font-mono uppercase tracking-wider", isActive && "font-bold")}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ━━━ CONTENT SCROLLABLE ━━━ */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-2 pb-2 space-y-1.5">
        {/* ═══ TAB FINANCE ═══ */}
        {activeTab === "finance" && (
          <div className="space-y-1.5">
            <div className={cn(SIDEBAR_CARD, "flex flex-col")}>
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100 bg-slate-50/30">
                <span className="text-slate-400 text-[10px]"><ReceiptIcon size={10} /></span>
                <span className="text-[10px] font-mono text-slate-700">Synthèse</span>
              </div>
              <div className="p-2 space-y-0.5">
                <MicroRow label="HT" value={totals.subTotal} currency={currency} />
                <MicroRow label={`Remise (-${discountAmount})`} value={-discountAmount} currency={currency} variant="negative" />
                <MicroRow label={`TVA (${vatRatePercent}%)`} value={vatAmount} currency={currency} variant="highlight" />
                <div className="pt-1.5 border-t border-slate-100">
                  <MicroRow label="Net TTC" value={totals.totalTTC} currency={currency} bold />
                </div>
              </div>
            </div>

            <div className={cn(SIDEBAR_CARD, "flex flex-col")}>
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100 bg-slate-50/30">
                <span className="text-slate-400 text-[10px]"><PercentIcon size={10} /></span>
                <span className="text-[10px] font-mono text-slate-700">Paramètres fiscaux</span>
              </div>
              <div className="p-2 space-y-2">
                <FieldGroup label="Taux TVA (%)">
                  <FieldInput
                    type="number"
                    value={vatRatePercent}
                    onChange={(e) => updateField("financials", "vatRatePercent", parseFloat(e.target.value) || 0)}
                    suffix="%"
                  />
                </FieldGroup>
                <FieldGroup label={`Remise (${currency})`}>
                  <FieldInput
                    type="number"
                    value={discountAmount}
                    onChange={(e) => updateField("financials", "discountAmount", parseFloat(e.target.value) || 0)}
                    prefix="-"
                    variant="negative"
                  />
                </FieldGroup>
              </div>
            </div>

            <div className={cn(SIDEBAR_CARD, "flex flex-col")}>
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100 bg-slate-50/30">
                <span className="text-slate-400 text-[10px]"><HashIcon size={10} /></span>
                <span className="text-[10px] font-mono text-slate-700">Référence</span>
              </div>
              <div className="p-2">
                <FieldGroup label="N° Devis">
                  <div className="flex items-center gap-2 px-2.5 py-2 bg-slate-50 border border-slate-200 rounded">
                    <span className="font-mono text-[11px] font-semibold text-slate-800 tracking-tight">
                      {activeQuote.quote.number}
                    </span>
                  </div>
                  <p className="mt-1 text-[7px] text-slate-400 italic leading-tight">
                    Numérotation automatique — configurable dans{" "}
                    <span className="font-semibold text-slate-500">Réglages → Branding</span>
                  </p>
                </FieldGroup>
              </div>
            </div>

            <div className={cn(SIDEBAR_CARD, "flex flex-col")}>
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100 bg-slate-50/30">
                <span className="text-slate-400 text-[10px]"><CurrencyDollarIcon size={10} /></span>
                <span className="text-[10px] font-mono text-slate-700">Devise</span>
              </div>
              <div className="p-2">
                <ChipSelector options={CURRENCY_OPTIONS} value={currency} onChange={(c) => updateField(null, "currency", c)} />
              </div>
            </div>
          </div>
        )}

        {/* ═══ TAB WORKFLOW ═══ */}
        {activeTab === "workflow" && (
          <div className="space-y-1.5">
            <div className={cn(SIDEBAR_CARD, "flex flex-col")}>
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100 bg-slate-50/30">
                <span className="text-slate-400 text-[10px]"><FlagIcon size={10} /></span>
                <span className="text-[10px] font-mono text-slate-700">Statut document</span>
              </div>
              <div className="p-1.5 space-y-0.5">
                {STATUS_OPTIONS.map((status) => (
                  <StatusOption
                    key={status.id}
                    status={status}
                    isSelected={activeQuote.quote.status === status.id}
                    onClick={() => updateField("quote", "status", status.id)}
                  />
                ))}
              </div>
            </div>

            <div className={cn(SIDEBAR_CARD, "flex flex-col")}>
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100 bg-slate-50/30">
                <span className="text-slate-400 text-[10px]"><CalendarIcon size={10} /></span>
                <span className="text-[10px] font-mono text-slate-700">Échéance & Validité</span>
              </div>
              <div className="p-2 space-y-2">
                <FieldGroup label="Date d'échéance">
                  <FieldInput
                    type="date"
                    value={activeQuote.quote.dueDate || ""}
                    onChange={(e) => updateField("quote", "dueDate", e.target.value)}
                  />
                </FieldGroup>
                <FieldGroup label="Validité (jours)">
                  <ChipSelector
                    options={VALIDITY_OPTIONS}
                    value={`${activeQuote.validityDays}`}
                    onChange={(days) => updateField(null, "validityDays", parseInt(days, 10))}
                  />
                </FieldGroup>
              </div>
            </div>

            <div className={cn(SIDEBAR_CARD, "flex flex-col")}>
              <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100 bg-slate-50/30">
                <span className="text-slate-400 text-[10px]"><PaletteIcon size={10} /></span>
                <span className="text-[10px] font-mono text-slate-700">Thème visuel</span>
              </div>
              <div className="p-1.5 grid grid-cols-2 gap-1">
                {availableThemes.map((theme) => (
                  <ThemeOption
                    key={theme.id}
                    theme={theme}
                    isSelected={activeThemeId === theme.id}
                    onClick={() => setActiveThemeId(theme.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ━━━ FOOTER: Status Sauvegarde ━━━ */}
      <div className="mt-auto px-3 py-2 border-t border-slate-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              "w-1 h-1 rounded-full transition-all duration-300",
              isSaving ? "bg-amber-400 animate-pulse" : "bg-emerald-500",
            )}
          />
          <span className="text-[8px] font-mono uppercase tracking-wider text-slate-400">
            {isSaving ? "Sauvegarde..." : "Synchronisé"}
          </span>
        </div>
        <CloudCheckIcon
          size={12}
          className={cn("transition-colors", isSaving ? "text-slate-300" : "text-emerald-500")}
        />
      </div>
    </div>
  );
};