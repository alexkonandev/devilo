"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Currency } from "@/app/generated/prisma/enums";
import { ReceiptIcon, CaretRightIcon } from "@phosphor-icons/react";
import type {
  UseFormRegister,
  UseFormSetValue,
  FieldErrors,
} from "react-hook-form";
import type { SettingsFormValues } from "@/lib/validations/settings";
import {
  DS_BENTO_CARD,
  DS_MONO,
  DS_MICRO,
  DS_INPUT,
  DS_LABEL,
  DS_ICON_WRAPPER,
  DS_ICON_SM,
  DS_ROUNDED,
} from "@/lib/design-system";

// ─── Données de référence ─────────────────────────────────────────────────────

export const CURRENCIES = [
  { code: "XOF", name: "Franc CFA", symbol: "CFA", region: "UEMOA" },
  { code: "EUR", name: "Euro", symbol: "€", region: "Europe" },
  { code: "USD", name: "Dollar Américain", symbol: "$", region: "Amérique" },
  { code: "GBP", name: "Livre Sterling", symbol: "£", region: "Royaume-Uni" },
  { code: "JPY", name: "Yen Japonais", symbol: "¥", region: "Asie" },
  { code: "CAD", name: "Dollar Canadien", symbol: "C$", region: "Amérique" },
  { code: "AUD", name: "Dollar Australien", symbol: "A$", region: "Océanie" },
  { code: "CHF", name: "Franc Suisse", symbol: "CHF", region: "Europe" },
  { code: "CNY", name: "Yuan Chinois", symbol: "¥", region: "Asie" },
  { code: "INR", name: "Roupie Indienne", symbol: "₹", region: "Asie" },
];

export const TAX_LABELS = {
  XOF: "NCC",
  EUR: { FR: "SIRET", DE: "Steuernummer", IT: "Partita IVA" },
  USD: "EIN",
  GBP: "VAT",
  JPY: "法人番号",
  CAD: "BN",
  AUD: "ABN",
  CHF: "UID",
  CNY: "统一社会信用代码",
  INR: "GSTIN",
};

export const TAX_LABEL_OPTIONS = [
  { value: "NCC", label: "NCC - Numéro de Contribuable", country: "CI" },
  { value: "SIRET", label: "SIRET - France", country: "FR" },
  { value: "RCCM", label: "RCCM - Registre Commerce", country: "CI" },
  { value: "NIF", label: "NIF - Numéro Identification", country: "FR" },
  { value: "EIN", label: "EIN - Employer ID", country: "US" },
  { value: "VAT", label: "VAT - VAT Number", country: "UK" },
  { value: "TVA", label: "TVA - Numéro TVA", country: "FR" },
  { value: "Steuernummer", label: "Steuernummer - Allemagne", country: "DE" },
  { value: "Partita IVA", label: "Partita IVA - Italie", country: "IT" },
];

export const TAX_MASKS: Record<string, string> = {
  NCC: "CI-ABJ-2023-A-12345",
  SIRET: "123 456 789 00012",
  RCCM: "CI-ABJ-2023-B-12345",
  NIF: "FR 12 345678901",
  EIN: "12-3456789",
  VAT: "GB123456789",
  TVA: "FR 12 345678901",
  Steuernummer: "123/456/78901",
  "Partita IVA": "IT12345678901",
};

// ═══════════════════════════════════════════════════════════════════════════════
// BentoFiscalCard
// ═══════════════════════════════════════════════════════════════════════════════

interface BentoFiscalCardProps {
  register: UseFormRegister<SettingsFormValues>;
  errors: FieldErrors<SettingsFormValues>;
  watchedValues: SettingsFormValues;
  setValue: UseFormSetValue<SettingsFormValues>;
  className?: string;
}

export function BentoFiscalCard({
  register,
  errors,
  watchedValues,
  setValue,
  className,
}: BentoFiscalCardProps) {
  const [currencySearch, setCurrencySearch] = useState("");
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showTaxLabelDropdown, setShowTaxLabelDropdown] = useState(false);
  const [taxMask, setTaxMask] = useState<string>("CI-ABJ-2023-A-12345");

  const filteredCurrencies = CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
      c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
      c.symbol.toLowerCase().includes(currencySearch.toLowerCase()),
  );

  const selectedCurrency = CURRENCIES.find((c) => c.code === watchedValues.currency);

  const suggestedTaxLabel = useMemo(() => {
    const currency = watchedValues.currency;
    if (!currency) return "NCC";
    const taxConfig = TAX_LABELS[currency as keyof typeof TAX_LABELS];
    if (typeof taxConfig === "string") return taxConfig;
    if (typeof taxConfig === "object") return (taxConfig as Record<string, string>).FR || "NCC";
    return "NCC";
  }, [watchedValues.currency]);

  void suggestedTaxLabel;

  return (
    <div className={cn(DS_BENTO_CARD, "p-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div className={cn(DS_ICON_WRAPPER, "bg-amber-50")}>
            <ReceiptIcon size={DS_ICON_SM} className="text-amber-500" />
          </div>
          <span className={cn(DS_MICRO)}>Configuration Fiscale</span>
        </div>
      </div>

      <div className="space-y-3">
        {/* Row 1 : Devise + Taux TVA */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={DS_LABEL}>Devise</label>
            <div className="relative">
              <button type="button" onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                className={cn(DS_INPUT, DS_ROUNDED, DS_MONO, "w-full text-xs text-left flex items-center justify-between")}>
                <span>{selectedCurrency ? `${selectedCurrency.code} - ${selectedCurrency.name}` : "Sélectionner..."}</span>
                <CaretRightIcon size={10} className="text-slate-600" />
              </button>
              {showCurrencyDropdown && (
                <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-slate-100 rounded-md max-h-40 overflow-y-auto shadow-sm">
                  <input type="text" value={currencySearch} onChange={(e) => setCurrencySearch(e.target.value)}
                    placeholder="Rechercher..." className="w-full px-2 py-1.5 text-[10px] border-b border-slate-100 focus:outline-none" />
                  {filteredCurrencies.map((currency) => (
                    <button key={currency.code} type="button"
                      onClick={() => { setValue("currency", currency.code as Currency); setShowCurrencyDropdown(false); setCurrencySearch(""); if (!watchedValues.taxIdLabel || watchedValues.taxIdLabel === "NCC") { const taxConfig = TAX_LABELS[currency.code as keyof typeof TAX_LABELS]; const suggestedLabel = typeof taxConfig === "string" ? taxConfig : (taxConfig as Record<string, string>)?.FR || "NCC"; setValue("taxIdLabel", suggestedLabel); } }}
                      className="w-full px-2 py-1.5 text-[10px] text-left hover:bg-slate-50 flex items-center justify-between">
                      <span className="font-mono">{currency.code}</span>
                      <span className="text-slate-700">{currency.name}</span>
                      <span className="text-slate-600">{currency.symbol}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className={DS_LABEL}>Taux TVA (%)</label>
            <input {...register("defaultVatRate", { valueAsNumber: true })} type="number" step="0.01"
              className={cn(DS_INPUT, DS_ROUNDED, DS_MONO, "w-full text-xs text-right")} placeholder="18.00" />
            {errors.defaultVatRate && <p className="mt-0.5 text-[9px] text-rose-500">{errors.defaultVatRate.message}</p>}
          </div>
        </div>

        {/* Row 2 : Label + Numéro fiscal */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={DS_LABEL}>Label</label>
            <div className="relative">
              <button type="button" onClick={() => setShowTaxLabelDropdown(!showTaxLabelDropdown)}
                className={cn(DS_INPUT, DS_ROUNDED, DS_MONO, "w-full text-xs text-left flex items-center justify-between uppercase")}>
                <span>{watchedValues.taxIdLabel || "Sélectionner..."}</span>
                <CaretRightIcon size={10} className="text-slate-600" />
              </button>
              {showTaxLabelDropdown && (
                <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-slate-100 rounded-md max-h-40 overflow-y-auto shadow-sm">
                  {TAX_LABEL_OPTIONS.map((option) => (
                    <button key={option.value} type="button"
                      onClick={() => { setValue("taxIdLabel", option.value); setShowTaxLabelDropdown(false); if (TAX_MASKS[option.value]) setTaxMask(TAX_MASKS[option.value]); }}
                      className="w-full px-2 py-1.5 text-[10px] text-left hover:bg-slate-50 flex items-center justify-between">
                      <span className="font-mono">{option.value}</span>
                      <span className="text-slate-600">{option.label.split(" - ")[1]}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className={DS_LABEL}>Numéro</label>
            <div className="relative">
              <input {...register("taxId")} className={cn(DS_INPUT, DS_ROUNDED, DS_MONO, "w-full text-xs")}
                placeholder={taxMask || "CI-ABJ-2023-A-12345"}
                onInput={(e) => { const target = e.target as HTMLInputElement; const cleaned = target.value.replace(/\s+/g, " ").replace(/-+/g, "-").replace(/\/+/g, "/").trim(); setValue("taxId", cleaned); }} />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] text-slate-500">{watchedValues.taxIdLabel || "NCC"}</span>
            </div>
            {errors.taxId && <p className="mt-0.5 text-[9px] text-rose-500">{errors.taxId.message}</p>}
          </div>
        </div>

        {/* Row 3 : Préfixe Devis + Prochain N° */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={DS_LABEL}>Préfixe Devis</label>
            <input {...register("quotePrefix")} className={cn(DS_INPUT, DS_ROUNDED, DS_MONO, "w-full text-xs uppercase")} placeholder="QT-" />
            {errors.quotePrefix && <p className="mt-0.5 text-[9px] text-rose-500">{errors.quotePrefix.message}</p>}
          </div>
          <div>
            <label className={DS_LABEL}>Prochain N°</label>
            <input {...register("nextQuoteNumber", { valueAsNumber: true })} type="number"
              className={cn(DS_INPUT, DS_ROUNDED, DS_MONO, "w-full text-xs")} placeholder="1" />
            {errors.nextQuoteNumber && <p className="mt-0.5 text-[9px] text-rose-500">{errors.nextQuoteNumber.message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}