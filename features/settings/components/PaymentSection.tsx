"use client";

import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  BankIcon,
  ShieldCheckIcon,
  WarningIcon,
  EyeIcon,
  EyeSlashIcon,
  CreditCardIcon,
  GlobeIcon,
  DatabaseIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react";
import {
  validateIBAN,
  suggestBICFromIBAN,
  maskIBAN,
  extractCountryCode,
} from "@/lib/iban-validation";
import type {
  UseFormRegister,
  UseFormSetValue,
  FieldErrors,
} from "react-hook-form";
import type { SettingsFormValues } from "@/lib/validations/settings";

// ─── Design System tokens (locaux) ───────────────────────────────────────────
const DS = {
  micro: "text-[9px] uppercase font-bold tracking-tighter",
  label: "text-[10px] uppercase font-bold tracking-wider text-slate-400",
  mono: "font-mono text-[11px] tabular-nums leading-none",
  card: "bg-white border border-slate-100/60",
  input:
    "bg-slate-100/50 border-0 border-b border-slate-200 focus:border-indigo-400 focus:bg-white focus:ring-0 transition-all",
};

// ─── Types & constantes de zone ───────────────────────────────────────────────
export type PaymentZoneKey = "USA" | "EUR" | "AFRI";

export const ZONE_CONFIG: Record<
  PaymentZoneKey,
  { flag: string; label: string }
> = {
  USA: { flag: "🇺🇸", label: "USA" },
  EUR: { flag: "🇪🇺", label: "EUR" },
  AFRI: { flag: "🌍", label: "AFRI" },
};

interface ZoneStateUSA {
  bankName: string;
  bankRoutingNumber: string;
  bankAccountNumber: string;
}
interface ZoneStateEUR {
  bankName: string;
  bankIBAN: string;
  bankBIC: string;
}
interface ZoneStateAFRI {
  bankName: string;
  bankSWIFT: string;
  bankAccountNumber: string;
}

// ─── Air-Gap helpers ──────────────────────────────────────────────────────────
function blockNonNumericKey(e: React.KeyboardEvent<HTMLInputElement>) {
  const allowed = [
    "Backspace",
    "Delete",
    "Tab",
    "ArrowLeft",
    "ArrowRight",
    "Home",
    "End",
    "Control",
    "Meta",
    "c",
    "v",
    "a",
    "x",
  ];
  if (allowed.includes(e.key)) return;
  if (!/^\d$/.test(e.key)) e.preventDefault();
}

function blockNonBICKey(
  e: React.KeyboardEvent<HTMLInputElement>,
  currentLen: number,
) {
  const allowed = [
    "Backspace",
    "Delete",
    "Tab",
    "ArrowLeft",
    "ArrowRight",
    "Home",
    "End",
    "Control",
    "Meta",
  ];
  if (allowed.includes(e.key)) return;
  if (!/^[A-Za-z0-9]$/.test(e.key)) {
    e.preventDefault();
    return;
  }
  const selStart = (e.target as HTMLInputElement).selectionStart ?? currentLen;
  if (selStart < 6 && /^\d$/.test(e.key)) e.preventDefault();
}

function sanitizeNumeric(v: string) {
  return v.replace(/\D/g, "");
}
function sanitizeAlphaNum(v: string) {
  return v.replace(/[^A-Z0-9]/g, "").toUpperCase();
}
function sanitizeBIC(v: string) {
  return v
    .replace(/[^A-Z0-9]/gi, "")
    .toUpperCase()
    .slice(0, 11);
}

function formatRIB(digits: string): string {
  const d = sanitizeNumeric(digits).slice(0, 24);
  const p1 = d.slice(0, 5);
  const p2 = d.slice(5, 10);
  const p3 = d.slice(10, 22);
  const p4 = d.slice(22, 24);
  return [p1, p2, p3, p4].filter(Boolean).join(" ");
}

function ibanDisplay(raw: string): string {
  return raw.replace(/(.{4})/g, "$1 ").trim();
}

export function isValidBIC(v: string): boolean {
  return /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(v);
}

export function isValidRIB(v: string): boolean {
  return /^\d{24}$/.test(v);
}

// ═══════════════════════════════════════════════════════════════════════════════
// BentoPaymentCard
// ═══════════════════════════════════════════════════════════════════════════════

interface BentoPaymentCardProps {
  register: UseFormRegister<SettingsFormValues>;
  errors: FieldErrors<SettingsFormValues>;
  watchedValues: SettingsFormValues;
  setValue: UseFormSetValue<SettingsFormValues>;
  getValues: () => SettingsFormValues;
  className?: string;
}

export function BentoPaymentCard({
  register,
  watchedValues,
  setValue,
  className,
}: BentoPaymentCardProps) {
  const zone: PaymentZoneKey =
    (watchedValues.paymentZone as PaymentZoneKey) || "AFRI";

  const [usaState, setUsaState] = useState<ZoneStateUSA>({
    bankName: watchedValues.bankName || "",
    bankRoutingNumber: watchedValues.bankRoutingNumber || "",
    bankAccountNumber:
      zone === "USA" ? watchedValues.bankAccountNumber || "" : "",
  });
  const [eurState, setEurState] = useState<ZoneStateEUR>({
    bankName: zone === "EUR" ? watchedValues.bankName || "" : "",
    bankIBAN: watchedValues.bankIBAN || "",
    bankBIC: watchedValues.bankBIC || "",
  });
  const [afriState, setAfriState] = useState<ZoneStateAFRI>({
    bankName: zone === "AFRI" ? watchedValues.bankName || "" : "",
    bankSWIFT: watchedValues.bankSWIFT || "",
    bankAccountNumber:
      zone === "AFRI" ? watchedValues.bankAccountNumber || "" : "",
  });

  const [showIBAN, setShowIBAN] = useState(false);
  const [ibanStatus, setIbanStatus] = useState<"empty" | "invalid" | "valid">(
    "empty",
  );
  const [suggestedBIC, setSuggestedBIC] = useState<string | null>(null);

  const syncZoneToRHF = useCallback(
    (z: PaymentZoneKey) => {
      setValue("paymentZone", z, { shouldDirty: true });
      if (z === "USA") {
        setValue("bankName", usaState.bankName);
        setValue("bankRoutingNumber", usaState.bankRoutingNumber);
        setValue("bankAccountNumber", usaState.bankAccountNumber);
        setValue("bankIBAN", null);
        setValue("bankBIC", null);
        setValue("bankSWIFT", null);
      } else if (z === "EUR") {
        setValue("bankName", eurState.bankName);
        setValue("bankIBAN", eurState.bankIBAN);
        setValue("bankBIC", eurState.bankBIC);
        setValue("bankRoutingNumber", null);
        setValue("bankAccountNumber", null);
        setValue("bankSWIFT", null);
      } else {
        setValue("bankName", afriState.bankName);
        setValue("bankSWIFT", afriState.bankSWIFT);
        setValue("bankAccountNumber", afriState.bankAccountNumber);
        setValue("bankIBAN", null);
        setValue("bankBIC", null);
        setValue("bankRoutingNumber", null);
      }
    },
    [usaState, eurState, afriState, setValue],
  );

  const handleZoneChange = useCallback(
    (z: PaymentZoneKey) => {
      syncZoneToRHF(z);
    },
    [syncZoneToRHF],
  );

  const setUSA = useCallback(
    <K extends keyof ZoneStateUSA>(key: K, val: string) => {
      setUsaState((s) => ({ ...s, [key]: val }));
      setValue(key as keyof SettingsFormValues, val, { shouldDirty: true });
    },
    [setValue],
  );

  const setEUR = useCallback(
    <K extends keyof ZoneStateEUR>(key: K, val: string) => {
      setEurState((s) => ({ ...s, [key]: val }));
      setValue(key as keyof SettingsFormValues, val, { shouldDirty: true });
    },
    [setValue],
  );

  const setAFRI = useCallback(
    <K extends keyof ZoneStateAFRI>(key: K, val: string) => {
      setAfriState((s) => ({ ...s, [key]: val }));
      setValue(key as keyof SettingsFormValues, val, { shouldDirty: true });
    },
    [setValue],
  );

  const handleIBANInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = sanitizeAlphaNum(e.target.value).slice(0, 34);
      e.target.value = ibanDisplay(raw);
      setEUR("bankIBAN", raw);
      if (!raw) {
        setIbanStatus("empty");
        setSuggestedBIC(null);
        return;
      }
      if (validateIBAN(raw)) {
        setIbanStatus("valid");
        const bic = suggestBICFromIBAN(raw);
        if (bic) {
          setSuggestedBIC(bic);
          setEUR("bankBIC", bic);
        }
      } else {
        setIbanStatus("invalid");
        setSuggestedBIC(null);
      }
    },
    [setEUR],
  );

  const handleIBANKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const allowed = [
        "Backspace",
        "Delete",
        "Tab",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End",
        "Control",
        "Meta",
        "c",
        "v",
        "a",
        "x",
        " ",
      ];
      if (allowed.includes(e.key)) return;
      if (!/^[A-Za-z0-9]$/.test(e.key)) {
        e.preventDefault();
        return;
      }
      const rawPos = (e.target as HTMLInputElement).value.replace(
        /\s/g,
        "",
      ).length;
      if (rawPos < 2 && /^\d$/.test(e.key)) e.preventDefault();
      if (rawPos >= 2 && rawPos < 4 && /^[A-Za-z]$/.test(e.key))
        e.preventDefault();
    },
    [],
  );

  const handleIBANPaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = sanitizeAlphaNum(e.clipboardData.getData("text")).slice(
        0,
        34,
      );
      (e.target as HTMLInputElement).value = ibanDisplay(pasted);
      setEUR("bankIBAN", pasted);
      if (validateIBAN(pasted)) {
        setIbanStatus("valid");
        const bic = suggestBICFromIBAN(pasted);
        if (bic) {
          setSuggestedBIC(bic);
          setEUR("bankBIC", bic);
        }
      } else {
        setIbanStatus(pasted.length ? "invalid" : "empty");
      }
    },
    [setEUR],
  );

  function handleBICChange(val: string, setter: (v: string) => void) {
    setter(sanitizeBIC(val));
  }

  const handleRIBInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = sanitizeNumeric(e.target.value).slice(0, 24);
      e.target.value = formatRIB(digits);
      setAFRI("bankAccountNumber", digits);
    },
    [setAFRI],
  );

  const handleRIBPaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const digits = sanitizeNumeric(e.clipboardData.getData("text")).slice(
        0,
        24,
      );
      (e.target as HTMLInputElement).value = formatRIB(digits);
      setAFRI("bankAccountNumber", digits);
    },
    [setAFRI],
  );

  const inputCls = cn(
    DS.input,
    "w-full px-3 py-2 text-sm rounded-t overflow-hidden",
  );
  const monoCls = cn(
    DS.input,
    DS.mono,
    "w-full px-3 py-2 text-sm rounded-t overflow-hidden",
  );
  const labelCls =
    "text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block";
  const activeState =
    zone === "USA" ? usaState : zone === "EUR" ? eurState : afriState;
  const showPreview =
    watchedValues.showBankDetailsOnQuotes &&
    (activeState as ZoneStateUSA | ZoneStateEUR | ZoneStateAFRI).bankName;

  return (
    <div className={cn(DS.card, "rounded-lg p-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-emerald-50 flex items-center justify-center">
            <BankIcon size={12} className="text-emerald-500" />
          </div>
          <span className={cn(DS.micro, "text-slate-600")}>
            Coffre-Fort Bancaire
          </span>
        </div>
        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60">
          SÉCURISÉ
        </span>
      </div>

      {/* SegmentedControl */}
      <div className="flex rounded-lg overflow-hidden border border-slate-200 mb-6">
        {(Object.keys(ZONE_CONFIG) as PaymentZoneKey[]).map((z) => (
          <button
            key={z}
            type="button"
            onClick={() => handleZoneChange(z)}
            className={cn(
              "flex-1 py-2 text-[10px] font-bold uppercase tracking-wider transition-all",
              zone === z
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-400 hover:text-slate-700",
            )}
          >
            {ZONE_CONFIG[z].flag} {ZONE_CONFIG[z].label}
          </button>
        ))}
      </div>

      <input type="hidden" {...register("paymentZone")} />

      <div className="space-y-5">
        {/* ═══ USA ══════════════════════════════════════════════════════════ */}
        {zone === "USA" && (
          <>
            <div>
              <label className={labelCls}>Nom de la banque</label>
              <input
                value={usaState.bankName}
                onChange={(e) =>
                  setUSA("bankName", e.target.value.slice(0, 50))
                }
                maxLength={50}
                className={inputCls}
                placeholder="Chase, Bank of America..."
                autoComplete="off"
              />
            </div>
            <div>
              <label className={labelCls}>Routing Number (ACH)</label>
              <input
                value={usaState.bankRoutingNumber}
                onChange={(e) =>
                  setUSA(
                    "bankRoutingNumber",
                    sanitizeNumeric(e.target.value).slice(0, 9),
                  )
                }
                onKeyDown={blockNonNumericKey}
                onPaste={(e) => {
                  e.preventDefault();
                  setUSA(
                    "bankRoutingNumber",
                    sanitizeNumeric(e.clipboardData.getData("text")).slice(
                      0,
                      9,
                    ),
                  );
                }}
                inputMode="numeric"
                maxLength={9}
                className={cn(
                  monoCls,
                  usaState.bankRoutingNumber.length === 9 &&
                    "bg-emerald-50 border-emerald-200",
                  usaState.bankRoutingNumber.length > 0 &&
                    usaState.bankRoutingNumber.length < 9 &&
                    "bg-amber-50 border-amber-200",
                )}
                placeholder="021000021"
                autoComplete="off"
              />
              <div className="mt-1 flex items-center gap-2">
                {usaState.bankRoutingNumber.length > 0 &&
                  usaState.bankRoutingNumber.length < 9 && (
                    <span className="text-[10px] text-amber-600 flex items-center gap-1">
                      <WarningIcon size={9} />{" "}
                      {9 - usaState.bankRoutingNumber.length} chiffre(s)
                      manquant(s)
                    </span>
                  )}
                {usaState.bankRoutingNumber.length === 9 && (
                  <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                    <ShieldCheckIcon size={9} /> Format valide
                  </span>
                )}
              </div>
            </div>
            <div>
              <label className={labelCls}>Account Number</label>
              <input
                value={usaState.bankAccountNumber}
                onChange={(e) =>
                  setUSA(
                    "bankAccountNumber",
                    sanitizeNumeric(e.target.value).slice(0, 17),
                  )
                }
                onKeyDown={blockNonNumericKey}
                onPaste={(e) => {
                  e.preventDefault();
                  setUSA(
                    "bankAccountNumber",
                    sanitizeNumeric(e.clipboardData.getData("text")).slice(
                      0,
                      17,
                    ),
                  );
                }}
                inputMode="numeric"
                maxLength={17}
                className={monoCls}
                placeholder="000123456789"
                autoComplete="off"
              />
            </div>
          </>
        )}

        {/* ═══ EUR ══════════════════════════════════════════════════════════ */}
        {zone === "EUR" && (
          <>
            <div>
              <label className={labelCls}>Nom de la banque</label>
              <input
                value={eurState.bankName}
                onChange={(e) =>
                  setEUR("bankName", e.target.value.slice(0, 50))
                }
                maxLength={50}
                className={inputCls}
                placeholder="BNP Paribas, Société Générale..."
                autoComplete="off"
              />
            </div>
            <div>
              <label className={labelCls}>IBAN</label>
              <div className="relative">
                <input
                  defaultValue={
                    eurState.bankIBAN ? ibanDisplay(eurState.bankIBAN) : ""
                  }
                  onChange={handleIBANInput}
                  onKeyDown={handleIBANKeyDown}
                  onPaste={handleIBANPaste}
                  maxLength={39}
                  className={cn(
                    monoCls,
                    "pr-9",
                    ibanStatus === "valid" &&
                      "bg-emerald-50 border-emerald-200",
                    ibanStatus === "invalid" && "bg-rose-50 border-rose-200",
                  )}
                  placeholder="FR14 2004 1010 0505 0001 3M02 606"
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  type="button"
                  onClick={() => setShowIBAN((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showIBAN ? (
                    <EyeSlashIcon size={12} />
                  ) : (
                    <EyeIcon size={12} />
                  )}
                </button>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                {ibanStatus === "valid" && (
                  <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                    <ShieldCheckIcon size={9} /> Valide ·{" "}
                    {extractCountryCode(eurState.bankIBAN)}
                  </span>
                )}
                {ibanStatus === "invalid" && (
                  <span className="text-[10px] text-rose-600 flex items-center gap-1">
                    <WarningIcon size={9} /> Format invalide (Modulo 97)
                  </span>
                )}
                {eurState.bankIBAN && !showIBAN && ibanStatus !== "empty" && (
                  <span className="ml-auto text-[10px] text-slate-400 font-mono truncate max-w-[160px]">
                    {maskIBAN(eurState.bankIBAN)}
                  </span>
                )}
              </div>
            </div>
            <div>
              <label className={labelCls}>Code BIC / SWIFT</label>
              <input
                value={eurState.bankBIC}
                onChange={(e) =>
                  handleBICChange(e.target.value, (v) => setEUR("bankBIC", v))
                }
                onKeyDown={(e) => blockNonBICKey(e, eurState.bankBIC.length)}
                onPaste={(e) => {
                  e.preventDefault();
                  handleBICChange(e.clipboardData.getData("text"), (v) =>
                    setEUR("bankBIC", v),
                  );
                }}
                maxLength={11}
                className={cn(
                  monoCls,
                  isValidBIC(eurState.bankBIC) &&
                    "bg-emerald-50 border-emerald-200",
                  eurState.bankBIC.length > 0 &&
                    !isValidBIC(eurState.bankBIC) &&
                    "bg-rose-50 border-rose-200",
                )}
                placeholder="BNPAFRPP"
                autoComplete="off"
                spellCheck={false}
              />
              <div className="mt-1 flex items-center gap-2">
                {suggestedBIC && eurState.bankBIC === suggestedBIC && (
                  <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                    <ShieldCheckIcon size={9} /> Suggéré depuis IBAN
                  </span>
                )}
                {eurState.bankBIC.length > 0 &&
                  !isValidBIC(eurState.bankBIC) && (
                    <span className="text-[10px] text-rose-600 flex items-center gap-1">
                      <WarningIcon size={9} /> 8 ou 11 caractères requis
                    </span>
                  )}
                {isValidBIC(eurState.bankBIC) && (
                  <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                    <ShieldCheckIcon size={9} /> Format valide (ISO 9362)
                  </span>
                )}
              </div>
            </div>
          </>
        )}

        {/* ═══ AFRI ═════════════════════════════════════════════════════════ */}
        {zone === "AFRI" && (
          <>
            <div>
              <label className={labelCls}>Nom de la banque</label>
              <input
                value={afriState.bankName}
                onChange={(e) =>
                  setAFRI("bankName", e.target.value.slice(0, 50))
                }
                maxLength={50}
                className={inputCls}
                placeholder="Ecobank, SGCI, NSIA..."
                autoComplete="off"
              />
            </div>
            <div>
              <label className={labelCls}>Code SWIFT</label>
              <input
                value={afriState.bankSWIFT}
                onChange={(e) =>
                  handleBICChange(e.target.value, (v) =>
                    setAFRI("bankSWIFT", v),
                  )
                }
                onKeyDown={(e) => blockNonBICKey(e, afriState.bankSWIFT.length)}
                onPaste={(e) => {
                  e.preventDefault();
                  handleBICChange(e.clipboardData.getData("text"), (v) =>
                    setAFRI("bankSWIFT", v),
                  );
                }}
                maxLength={11}
                className={cn(
                  monoCls,
                  isValidBIC(afriState.bankSWIFT) &&
                    "bg-emerald-50 border-emerald-200",
                  afriState.bankSWIFT.length > 0 &&
                    !isValidBIC(afriState.bankSWIFT) &&
                    "bg-rose-50 border-rose-200",
                )}
                placeholder="SOGECIAB"
                autoComplete="off"
                spellCheck={false}
              />
              <div className="mt-1 flex items-center gap-2">
                {afriState.bankSWIFT.length > 0 &&
                  !isValidBIC(afriState.bankSWIFT) && (
                    <span className="text-[10px] text-rose-600 flex items-center gap-1">
                      <WarningIcon size={9} /> 8 ou 11 caractères requis
                    </span>
                  )}
                {isValidBIC(afriState.bankSWIFT) && (
                  <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                    <ShieldCheckIcon size={9} /> Format valide (ISO 9362)
                  </span>
                )}
              </div>
            </div>
            <div>
              <label className={labelCls}>Numéro de Compte / RIB</label>
              <input
                defaultValue={
                  afriState.bankAccountNumber
                    ? formatRIB(afriState.bankAccountNumber)
                    : ""
                }
                onChange={handleRIBInput}
                onKeyDown={blockNonNumericKey}
                onPaste={handleRIBPaste}
                inputMode="numeric"
                maxLength={29}
                className={cn(
                  monoCls,
                  isValidRIB(afriState.bankAccountNumber) &&
                    "bg-emerald-50 border-emerald-200",
                  afriState.bankAccountNumber.length > 0 &&
                    !isValidRIB(afriState.bankAccountNumber) &&
                    "bg-amber-50 border-amber-200",
                )}
                placeholder="00111 00012 345678901234 56"
                autoComplete="off"
              />
              <div className="mt-1 flex items-center gap-2">
                {afriState.bankAccountNumber.length > 0 &&
                  !isValidRIB(afriState.bankAccountNumber) && (
                    <span className="text-[10px] text-amber-600 flex items-center gap-1">
                      <WarningIcon size={9} />{" "}
                      {24 - afriState.bankAccountNumber.length} chiffre(s)
                      manquant(s)
                    </span>
                  )}
                {isValidRIB(afriState.bankAccountNumber) && (
                  <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                    <ShieldCheckIcon size={9} /> RIB complet (24 chiffres)
                  </span>
                )}
              </div>
            </div>
          </>
        )}

        {/* Toggle affichage devis */}
        <label className="flex items-center gap-2 cursor-pointer pt-1">
          <input
            type="checkbox"
            {...register("showBankDetailsOnQuotes")}
            className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
          />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Afficher sur les devis
          </span>
        </label>

        {/* Preview dynamique */}
        {showPreview && (
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 block mb-2">
              Preview — Bloc Paiement
            </span>
            <div className="bg-white p-2.5 rounded border border-slate-100 font-mono text-[10px] text-slate-600 space-y-1">
              {zone === "USA" && (
                <>
                  <p className="font-semibold text-slate-800 truncate">
                    {usaState.bankName}
                  </p>
                  {usaState.bankRoutingNumber && (
                    <p className="truncate">
                      Routing: {usaState.bankRoutingNumber}
                    </p>
                  )}
                  {usaState.bankAccountNumber && (
                    <p className="truncate">
                      Acc: {usaState.bankAccountNumber}
                    </p>
                  )}
                </>
              )}
              {zone === "EUR" && (
                <>
                  <p className="font-semibold text-slate-800 truncate">
                    {eurState.bankName}
                  </p>
                  {eurState.bankIBAN && (
                    <p className="truncate">
                      IBAN:{" "}
                      {showIBAN
                        ? ibanDisplay(eurState.bankIBAN)
                        : maskIBAN(eurState.bankIBAN)}
                    </p>
                  )}
                  {eurState.bankBIC && (
                    <p className="truncate">BIC: {eurState.bankBIC}</p>
                  )}
                </>
              )}
              {zone === "AFRI" && (
                <>
                  <p className="font-semibold text-slate-800 truncate">
                    {afriState.bankName}
                  </p>
                  {afriState.bankSWIFT && (
                    <p className="truncate">SWIFT: {afriState.bankSWIFT}</p>
                  )}
                  {afriState.bankAccountNumber && (
                    <p className="truncate">
                      RIB: {formatRIB(afriState.bankAccountNumber)}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        <div className="p-3 bg-amber-50 rounded border border-amber-100 flex items-start gap-2">
          <ShieldCheckIcon
            size={11}
            className="text-amber-500 mt-0.5 shrink-0"
          />
          <p className="text-[10px] text-amber-700">
            Données chiffrées. Les coordonnées sont figées au moment de la
            création du devis.
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BentoPaymentTelemetry — helpers déclarés hors composant
// ═══════════════════════════════════════════════════════════════════════════════

function StatusBadge({
  ok,
  label,
  errorLabel,
}: {
  ok: boolean;
  label: string;
  errorLabel?: string;
}) {
  return (
    <span
      className={cn(
        DS.mono,
        "text-[10px]",
        ok ? "text-emerald-600" : "text-rose-500",
      )}
    >
      {ok ? label : errorLabel || "Format invalide"}
    </span>
  );
}

function TelRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-2 bg-slate-50 rounded border border-slate-100">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className={cn(DS.label, "text-slate-500")}>{label}</span>
      </div>
      {children}
    </div>
  );
}

interface BentoPaymentTelemetryProps {
  watchedValues: SettingsFormValues;
  className?: string;
}

export function BentoPaymentTelemetry({
  watchedValues,
  className,
}: BentoPaymentTelemetryProps) {
  const zone: PaymentZoneKey =
    (watchedValues.paymentZone as PaymentZoneKey) || "AFRI";

  const swiftOrBIC = (watchedValues.bankBIC ||
    watchedValues.bankSWIFT ||
    "") as string;
  const swiftValid = isValidBIC(swiftOrBIC);
  const ribRaw = (watchedValues.bankAccountNumber || "") as string;
  const ribValid = isValidRIB(ribRaw);
  const ibanRaw = (watchedValues.bankIBAN || "") as string;
  const ibanValid = ibanRaw ? validateIBAN(ibanRaw) : false;
  const routingOk = /^\d{9}$/.test(watchedValues.bankRoutingNumber || "");

  return (
    <div className={cn(DS.card, "rounded-lg p-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <span className={cn(DS.micro, "text-slate-600")}>
          Statut · {ZONE_CONFIG[zone].flag} {zone}
        </span>
      </div>

      <div className="space-y-3">
        <TelRow
          icon={<BankIcon size={12} className="text-slate-400" />}
          label="Banque"
        >
          <span className={cn(DS.mono, "text-slate-700 truncate block")}>
            {watchedValues.bankName || "Non configurée"}
          </span>
        </TelRow>

        {zone === "USA" && (
          <>
            <TelRow
              icon={<CreditCardIcon size={12} className="text-slate-400" />}
              label="Routing ACH"
            >
              <StatusBadge
                ok={routingOk}
                label="9 chiffres ✓"
                errorLabel={
                  watchedValues.bankRoutingNumber
                    ? "Format invalide"
                    : "Non configuré"
                }
              />
            </TelRow>
            <TelRow
              icon={<DatabaseIcon size={12} className="text-slate-400" />}
              label="Account"
            >
              <span className={cn(DS.mono, "text-slate-700")}>
                {watchedValues.bankAccountNumber
                  ? "Configuré"
                  : "Non configuré"}
              </span>
            </TelRow>
          </>
        )}

        {zone === "EUR" && (
          <>
            <TelRow
              icon={<CreditCardIcon size={12} className="text-slate-400" />}
              label="IBAN"
            >
              <StatusBadge
                ok={ibanValid}
                label={`Valide · ${extractCountryCode(ibanRaw)}`}
                errorLabel={ibanRaw ? "Format invalide" : "Non configuré"}
              />
            </TelRow>
            <TelRow
              icon={<GlobeIcon size={12} className="text-slate-400" />}
              label="BIC / SWIFT"
            >
              <StatusBadge
                ok={swiftValid}
                label="Format valide (ISO 9362)"
                errorLabel={
                  swiftOrBIC ? "8 ou 11 car. requis" : "Non configuré"
                }
              />
            </TelRow>
          </>
        )}

        {zone === "AFRI" && (
          <>
            <TelRow
              icon={<GlobeIcon size={12} className="text-slate-400" />}
              label="SWIFT"
            >
              <StatusBadge
                ok={swiftValid}
                label="Format valide (ISO 9362)"
                errorLabel={
                  swiftOrBIC ? "8 ou 11 car. requis" : "Non configuré"
                }
              />
            </TelRow>
            <TelRow
              icon={<CreditCardIcon size={12} className="text-slate-400" />}
              label="RIB"
            >
              <StatusBadge
                ok={ribValid}
                label="24 chiffres ✓"
                errorLabel={
                  ribRaw ? `${ribRaw.length}/24 chiffres` : "Non configuré"
                }
              />
            </TelRow>
          </>
        )}

        <div className="p-2 bg-emerald-50 rounded border border-emerald-100">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircleIcon size={12} className="text-emerald-500" />
            <span className={cn(DS.label, "text-emerald-600")}>Sécurité</span>
          </div>
          <span className={cn(DS.mono, "text-emerald-700")}>CHIFFRÉ</span>
        </div>
      </div>
    </div>
  );
}
