"use client";

import React, { useState, useTransition, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  settingsSchema,
  type SettingsFormValues,
} from "@/lib/validations/settings";
import { updateSettings } from "@/actions/settings-action";
import { type SecurityProfile } from "@/actions/security-action";
import {
  BentoSecurityCard,
  BentoSecurityTelemetry,
} from "@/features/settings/components/SecuritySection";
import { DangerZoneCard } from "@/features/settings/components/DangerZoneSection";
import {
  BentoPaymentCard,
  BentoPaymentTelemetry,
} from "@/features/settings/components/PaymentSection";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  FloppyDiskIcon,
  UserCircleIcon,
  BankIcon,
  ShieldCheckIcon,
  ClockCounterClockwiseIcon,
  CheckCircleIcon,
  CaretRightIcon,
  CommandIcon,
  GearIcon,
  GlobeIcon,
  CalendarIcon,
  DatabaseIcon,
  FileTextIcon,
  BuildingOfficeIcon,
} from "@phosphor-icons/react";

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN SYSTEM - Spatial Intelligence
// ═══════════════════════════════════════════════════════════════════════════════

const DS = {
  micro: "text-[9px] uppercase font-bold tracking-tighter",
  label: "text-[10px] uppercase font-bold tracking-wider text-slate-400",
  mono: "font-mono text-[11px] tabular-nums leading-none",
  card: "bg-white border border-slate-100/60",
  input:
    "bg-slate-100/50 border-0 border-b border-slate-200 focus:border-indigo-400 focus:bg-white focus:ring-0 transition-all",
  button:
    "flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[9px] font-bold uppercase tracking-wider transition-all",
};

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ═══════════════════════════════════════════════════════════════════════════════
// DONNÉES DE RÉFÉRENCE
// ═══════════════════════════════════════════════════════════════════════════════

const CURRENCIES = [
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

const TAX_LABELS = {
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

const TAX_LABEL_OPTIONS = [
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

const TAX_MASKS = {
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

const COUNTRIES = [
  {
    code: "CI",
    name: "Côte d'Ivoire",
    flag: "🇨🇮",
    dialCode: "+225",
    currency: "XOF",
  },
  { code: "FR", name: "France", flag: "🇫🇷", dialCode: "+33", currency: "EUR" },
  {
    code: "US",
    name: "États-Unis",
    flag: "🇺🇸",
    dialCode: "+1",
    currency: "USD",
  },
  {
    code: "GB",
    name: "Royaume-Uni",
    flag: "🇬🇧",
    dialCode: "+44",
    currency: "GBP",
  },
  {
    code: "DE",
    name: "Allemagne",
    flag: "🇩🇪",
    dialCode: "+49",
    currency: "EUR",
  },
  { code: "IT", name: "Italie", flag: "🇮🇹", dialCode: "+39", currency: "EUR" },
  { code: "CA", name: "Canada", flag: "🇨🇦", dialCode: "+1", currency: "CAD" },
  {
    code: "AU",
    name: "Australie",
    flag: "🇦🇺",
    dialCode: "+61",
    currency: "AUD",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES - Mapping Prisma User Model
// ═══════════════════════════════════════════════════════════════════════════════

type SettingsSection = "profile" | "documents" | "payment" | "security";

interface SpatialSettingsViewProps {
  initialData: SettingsFormValues;
  securityProfile: SecurityProfile;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT - Architecture Basée sur le Schéma Prisma
// ═══════════════════════════════════════════════════════════════════════════════
// Grid: [Telemetry] [Sidebar 200px | Main-Grid 1fr]
// ═══════════════════════════════════════════════════════════════════════════════

export function SpatialSettingsView({
  initialData,
  securityProfile,
}: SpatialSettingsViewProps) {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");
  const [isPending, startTransition] = useTransition();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialData,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
    getValues,
  } = form;

  // Watch values for KPI display
  const watchedValues = watch();

  // Calcul de la complétude du profil
  const profileCompleteness = useMemo(() => {
    const requiredFields = [
      "companyName",
      "taxId",
      "companyEmail",
      "companyPhone",
      "companyCity",
      "companyAddressDetails",
    ];

    const filledFields = requiredFields.filter((field) => {
      const value = watchedValues[field as keyof SettingsFormValues];
      return value && typeof value === "string" && value.trim() !== "";
    }).length;

    return Math.round((filledFields / requiredFields.length) * 100);
  }, [watchedValues]);

  // Auto-suggestion du label fiscal selon la devise
  const suggestedTaxLabel = useMemo(() => {
    const currency = watchedValues.currency;
    if (!currency) return "NCC";

    const taxConfig = TAX_LABELS[currency as keyof typeof TAX_LABELS];
    if (typeof taxConfig === "string") return taxConfig;
    if (typeof taxConfig === "object") return taxConfig.FR || "NCC";
    return "NCC";
  }, [watchedValues.currency]);

  // Normalisation du site web
  const normalizeWebsite = useCallback((url: string) => {
    if (!url) return url;
    const trimmed = url.trim();
    if (
      trimmed &&
      !trimmed.startsWith("http://") &&
      !trimmed.startsWith("https://")
    ) {
      return `https://${trimmed}`;
    }
    return trimmed;
  }, []);

  // Normalisation du téléphone
  const normalizePhone = useCallback((phone: string) => {
    if (!phone) return phone;
    const cleaned = phone.replace(/\s+/g, "").replace(/[^\d+]/g, "");
    return cleaned;
  }, []);

  const onSubmit = (data: SettingsFormValues) => {
    startTransition(async () => {
      try {
        const res = await updateSettings(data);
        if (res.success) {
          toast.success("SYNC OK", {
            description: "Configuration sauvegardée",
          });
          setLastSaved(new Date());
          reset(data);
        } else {
          toast.error("ERREUR SYSTÈME", { description: res.error });
        }
      } catch {
        toast.error("ERREUR CRITIQUE");
      }
    });
  };

  // Filter sections based on search
  const filteredSections = useMemo(() => {
    if (!searchQuery) return null;
    const allFields = [
      {
        section: "profile",
        label: "Identité & Branding",
        keywords: "nom entreprise logo taxe email téléphone site web",
      },
      {
        section: "documents",
        label: "Paramètres Opérationnels",
        keywords: "devis préfixe numéro devise tva conditions",
      },
      {
        section: "payment",
        label: "Coffre-Fort Bancaire",
        keywords: "banque iban swift bic paiement",
      },
      {
        section: "security",
        label: "Sécurité",
        keywords: "mot de passe authentification suppression compte",
      },
    ];
    return allFields.filter(
      (f) =>
        f.keywords.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.label.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  return (
    // ═══════════════════════════════════════════════════════════════════════════
    // GRID GLOBAL - 2 Lignes Strictes
    // ═══════════════════════════════════════════════════════════════════════════
    <div className="h-full grid grid-rows-[auto_1fr] overflow-hidden bg-slate-50">
      {/* ═══ ZONE 1: TELEMETRY HUD (3 KPIs + Search + Sync Status) ═══ */}
      <TelemetryHUD
        isDirty={isDirty}
        isPending={isPending}
        lastSaved={lastSaved}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSave={handleSubmit(onSubmit)}
        watchedValues={watchedValues}
      />

      {/* ═══ ZONE 2: SETTINGS WORKSPACE ═══ */}
      <div className="grid grid-cols-[200px_1fr] overflow-hidden">
        {/* ─── Colonne Gauche: Navigation (200px) ─── */}
        <SettingsSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          formDirty={isDirty}
          searchResults={filteredSections}
          setSearchQuery={setSearchQuery}
        />

        {/* ─── Colonne Droite: Main Configuration Space ─── */}
        <main className="h-full overflow-y-auto p-4">
          <div className="max-w-6xl mx-auto">
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Layout optimisé pour zéro scroll sur 1080p */}
              <div className="grid grid-cols-12 gap-4 max-h-[calc(100vh-140px)]">
                {/* SECTION 1: IDENTITÉ & BRANDING (Onglet Profil) */}
                {activeSection === "profile" && (
                  <>
                    <BentoProfileCard
                      register={register}
                      errors={errors}
                      watchedValues={watchedValues}
                      setValue={setValue}
                      className="col-span-12 lg:col-span-8"
                    />
                    <BentoProfileTelemetry
                      watchedValues={watchedValues}
                      className="col-span-12 lg:col-span-4"
                    />
                  </>
                )}

                {/* SECTION 3: COFFRE-FORT BANCAIRE (Onglet Paiement) */}
                {activeSection === "payment" && (
                  <>
                    <BentoPaymentCard
                      register={register}
                      errors={errors}
                      watchedValues={watchedValues}
                      setValue={setValue}
                      getValues={getValues}
                      className="col-span-12 lg:col-span-8"
                    />
                    <BentoPaymentTelemetry
                      watchedValues={watchedValues}
                      className="col-span-12 lg:col-span-4"
                    />
                  </>
                )}

                {/* SECTION 4: SÉCURITÉ (Onglet Sécurité) */}
                {activeSection === "security" && (
                  <>
                    <BentoSecurityCard
                      showPassword={showPassword}
                      setShowPassword={setShowPassword}
                      securityProfile={securityProfile}
                      className="col-span-12 lg:col-span-6"
                    />
                    <BentoSecurityTelemetry
                      securityProfile={securityProfile}
                      className="col-span-12 lg:col-span-6"
                    />

                    {/* DEEP FOOTER - DANGER ZONE */}
                    <div className="col-span-12 mt-12 border-t border-slate-200/60 pt-8 pb-4">
                      <h3 className="text-[10px] font-mono text-red-500 mb-4">
                        DANGER ZONE
                      </h3>
                      <DangerZoneCard
                        userEmail={watchedValues.companyEmail || ""}
                        className=""
                      />
                    </div>
                  </>
                )}
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ZONE 1: TELEMETRY HUD
// ═══════════════════════════════════════════════════════════════════════════════

interface TelemetryHUDProps {
  isDirty: boolean;
  isPending: boolean;
  lastSaved: Date | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSave: () => void;
  watchedValues: SettingsFormValues;
}

function TelemetryHUD({
  isDirty,
  isPending,
  lastSaved,
  searchQuery,
  setSearchQuery,
  onSave,
  watchedValues,
}: TelemetryHUDProps) {
  const hudItems = [
    {
      icon: ShieldCheckIcon,
      label: "Score Sécurité",
      value: "92%",
      subtext: "Excellent",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      icon: CheckCircleIcon,
      label: "État Compte",
      value: "PRO",
      subtext: "Tous actifs",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      icon: ClockCounterClockwiseIcon,
      label: "Dernière Sync",
      value: lastSaved
        ? lastSaved.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "--:--",
      subtext: isDirty ? "Modifications" : "À jour",
      color: isDirty ? "text-amber-600" : "text-slate-600",
      bg: isDirty ? "bg-amber-50" : "bg-slate-50",
    },
  ];

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-4 px-4 py-3 border-b border-slate-200/60 bg-white shrink-0">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {hudItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2 p-2 rounded border border-slate-100/60 bg-slate-50/50"
          >
            <div
              className={cn(
                "w-7 h-7 rounded flex items-center justify-center shrink-0",
                item.bg,
              )}
            >
              <item.icon size={12} className={item.color} weight="bold" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1">
                <span
                  className={cn(
                    "text-[13px] font-bold tabular-nums truncate",
                    item.color,
                  )}
                >
                  {item.value}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className={cn(DS.micro, "text-slate-500")}>
                  {item.label}
                </span>
                <span className="text-[8px] text-slate-300">·</span>
                <span className="text-[9px] text-slate-400 truncate">
                  {item.subtext}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Actions */}
      <div className="flex items-center gap-2">
        <div className="relative w-56">
          <CommandIcon
            size={12}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
            className="w-full h-7 pl-8 pr-3 bg-slate-100 border border-slate-100/60 hover:border-slate-300 focus:border-indigo-400/60 focus:bg-white rounded text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-all"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-400 font-mono border border-slate-100 rounded px-1">
            ⌘K
          </span>
        </div>
        <button
          onClick={onSave}
          disabled={!isDirty || isPending}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded text-[9px] font-bold uppercase tracking-wider transition-all",
            isDirty && !isPending
              ? "bg-indigo-600 hover:bg-indigo-500 text-white"
              : "bg-slate-100 text-slate-400 cursor-not-allowed",
          )}
        >
          {isPending ? (
            <span className="w-3 h-3 border border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          ) : (
            <FloppyDiskIcon size={12} weight="bold" />
          )}
          {isPending ? "Sync..." : "Sauver"}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ZONE 2A: SETTINGS SIDEBAR (200px) - 4 entrées seulement
// ═══════════════════════════════════════════════════════════════════════════════

interface SettingsSidebarProps {
  activeSection: SettingsSection;
  setActiveSection: (s: SettingsSection) => void;
  formDirty: boolean;
  searchResults: { section: string; label: string }[] | null;
  setSearchQuery: (q: string) => void;
}

function SettingsSidebar({
  activeSection,
  setActiveSection,
  formDirty,
  searchResults,
  setSearchQuery,
}: SettingsSidebarProps) {
  const navItems: {
    key: SettingsSection;
    label: string;
    icon: React.ElementType;
    badge?: string;
    status?: "active" | "warning";
  }[] = [
    { key: "profile", label: "Profil", icon: UserCircleIcon, status: "active" },
    { key: "payment", label: "Paiement", icon: BankIcon },
    { key: "security", label: "Sécurité", icon: ShieldCheckIcon },
  ];

  return (
    <div className="flex flex-col bg-white border-r border-slate-200/60 overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-slate-200/60 bg-slate-50/30">
        <div className="flex items-center gap-1.5">
          <GearIcon size={13} className="text-slate-500" weight="bold" />
          <span className={cn(DS.micro, "text-slate-600")}>PARAMÈTRES</span>
          {formDirty && (
            <span
              className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"
              title="Modifications"
            />
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-2">
        {searchResults ? (
          <div className="space-y-0.5">
            <div className={cn(DS.label, "px-2 py-1.5")}>Résultats</div>
            {searchResults.length === 0 ? (
              <p className="px-2 py-3 text-xs text-slate-400">Aucun résultat</p>
            ) : (
              searchResults.map((result) => (
                <button
                  key={result.section}
                  onClick={() => {
                    setActiveSection(result.section as SettingsSection);
                    setSearchQuery("");
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs text-slate-600 hover:bg-slate-50 transition-all"
                >
                  <CaretRightIcon size={12} className="text-slate-300" />
                  {result.label}
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-0.5">
            <div className={cn(DS.label, "px-2 py-1.5")}>Navigation</div>
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-2 rounded text-left text-xs transition-all",
                  activeSection === item.key
                    ? "bg-indigo-50 text-indigo-700 font-medium border border-indigo-200/60"
                    : "text-slate-600 hover:bg-slate-50",
                )}
              >
                <item.icon
                  size={12}
                  className={
                    activeSection === item.key
                      ? "text-indigo-500"
                      : "text-slate-400"
                  }
                />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="px-1 py-0.5 rounded text-[8px] font-bold bg-indigo-100 text-indigo-600">
                    {item.badge}
                  </span>
                )}
                {item.status === "active" && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                    title="Actif"
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-slate-200/60 bg-slate-50/30">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[9px] text-slate-500">Node OK</span>
          </div>
          <span className="text-slate-300">|</span>
          <span className={cn(DS.mono, "text-[9px] text-slate-400")}>
            v2.4.1
          </span>
        </div>
      </div>
    </div>
  );
}
// SECTION 1: IDENTITÉ & BRANDING (Mapping Prisma User)
// ═══════════════════════════════════════════════════════════════════════════════

function BentoProfileCard({
  register,
  errors,
  watchedValues,
  setValue,
  className,
}: any) {
  const [currencySearch, setCurrencySearch] = useState("");
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showTaxLabelDropdown, setShowTaxLabelDropdown] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [taxMask, setTaxMask] = useState<string>("CI-ABJ-2023-A-12345");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]); // CI par défaut

  // Normalisation du site web
  const normalizeWebsite = useCallback((url: string) => {
    if (!url) return url;
    const trimmed = url.trim();
    if (
      trimmed &&
      !trimmed.startsWith("http://") &&
      !trimmed.startsWith("https://")
    ) {
      return `https://${trimmed}`;
    }
    return trimmed;
  }, []);

  // Normalisation du téléphone
  const normalizePhone = useCallback((phone: string) => {
    if (!phone) return phone;
    const cleaned = phone.replace(/\s+/g, "").replace(/[^\d+]/g, "");
    return cleaned;
  }, []);

  // Formatage de l'adresse pour le PDF
  const formatAddressForPDF = useCallback(() => {
    const address = watchedValues.companyAddressDetails || "";
    const city = watchedValues.companyCity || "Abidjan";
    return address ? `${address}, ${city}` : city;
  }, [watchedValues]);

  // Calcul de la longueur de l'adresse pour le sanity check
  const getAddressLength = useCallback(() => {
    const address = formatAddressForPDF();
    return address.length;
  }, [formatAddressForPDF]);

  const filteredCurrencies = CURRENCIES.filter(
    (currency) =>
      currency.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
      currency.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
      currency.symbol.toLowerCase().includes(currencySearch.toLowerCase()),
  );

  const selectedCurrency = CURRENCIES.find(
    (c) => c.code === watchedValues.currency,
  );

  // Auto-suggestion du label fiscal selon la devise
  const suggestedTaxLabel = useMemo(() => {
    const currency = watchedValues.currency;
    if (!currency) return "NCC";

    const taxConfig = TAX_LABELS[currency as keyof typeof TAX_LABELS];
    if (typeof taxConfig === "string") return taxConfig;
    if (typeof taxConfig === "object") return taxConfig.FR || "NCC";
    return "NCC";
  }, [watchedValues.currency]);

  return (
    <div
      className={cn(
        DS.card,
        "rounded-lg p-4 overflow-y-auto max-h-[calc(100vh-200px)]",
        className,
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-indigo-50 flex items-center justify-center">
            <BuildingOfficeIcon size={12} className="text-indigo-500" />
          </div>
          <span className={cn(DS.micro, "text-slate-600 tracking-wider")}>
            Identité & Branding
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-200/60">
            ACTIF
          </span>
          <span
            className={cn(
              DS.mono,
              "text-[9px] px-1.5 py-0.5 rounded",
              watchedValues.companyName &&
                watchedValues.taxId &&
                watchedValues.companyCity
                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                : "bg-amber-50 text-amber-600 border border-amber-200",
            )}
          >
            {watchedValues.companyName &&
            watchedValues.taxId &&
            watchedValues.companyCity
              ? "COMPLET"
              : "INCOMPLET"}
          </span>
        </div>
      </div>

      {/* Branding Preview HUD */}
      <div className="mb-4 p-3 bg-slate-50 rounded border border-slate-100">
        <div className="flex items-center gap-2 mb-2">
          <FileTextIcon size={12} className="text-slate-400" />
          <span className={cn(DS.micro, "text-slate-600")}>
            Aperçu En-tête Devis
          </span>
        </div>
        <div className="bg-white p-3 rounded border border-slate-100 text-xs">
          <div className="font-bold text-slate-900 mb-1">
            {watchedValues.companyName || "Nom de l'entreprise"}
          </div>
          <div className="flex items-center gap-3 text-slate-600">
            <span className={cn(DS.mono)}>
              {watchedValues.taxIdLabel || "NCC"}:{" "}
              {watchedValues.taxId || "0000000A"}
            </span>
            <span>•</span>
            <span>{watchedValues.companyCity || "VILLE"}</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Informations Entreprise */}
        <div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">
                Nom Entreprise
              </label>
              <input
                {...register("companyName")}
                className={cn(DS.input, "w-full px-3 py-2 text-sm rounded-t")}
                placeholder="ACME Corporation"
              />
              {errors.companyName && (
                <p className="mt-1 text-[10px] text-rose-500">
                  {errors.companyName.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">
                Devise
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                  className={cn(
                    DS.input,
                    DS.mono,
                    "w-full px-3 py-2 text-sm rounded-t text-left flex items-center justify-between",
                  )}
                >
                  <span>
                    {selectedCurrency
                      ? `${selectedCurrency.code} - ${selectedCurrency.name}`
                      : "Sélectionner..."}
                  </span>
                  <CaretRightIcon size={12} className="text-slate-400" />
                </button>

                {showCurrencyDropdown && (
                  <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-slate-100 rounded shadow-lg max-h-48 overflow-y-auto">
                    <input
                      type="text"
                      value={currencySearch}
                      onChange={(e) => setCurrencySearch(e.target.value)}
                      placeholder="Rechercher une devise..."
                      className="w-full px-3 py-2 text-xs border-b border-slate-100 focus:outline-none"
                    />
                    {filteredCurrencies.map((currency) => (
                      <button
                        key={currency.code}
                        type="button"
                        onClick={() => {
                          setValue("currency", currency.code);
                          setShowCurrencyDropdown(false);
                          setCurrencySearch("");
                          // Auto-suggestion du label fiscal
                          if (
                            !watchedValues.taxIdLabel ||
                            watchedValues.taxIdLabel === "NCC"
                          ) {
                            const taxConfig =
                              TAX_LABELS[
                                currency.code as keyof typeof TAX_LABELS
                              ];
                            const suggestedLabel =
                              typeof taxConfig === "string"
                                ? taxConfig
                                : taxConfig.FR || "NCC";
                            setValue("taxIdLabel", suggestedLabel);
                          }
                        }}
                        className="w-full px-3 py-2 text-xs text-left hover:bg-slate-50 flex items-center justify-between"
                      >
                        <span className="font-mono">{currency.code}</span>
                        <span className="text-slate-600">{currency.name}</span>
                        <span className="text-slate-400">
                          {currency.symbol}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Gestionnaire de Logo Pro */}
        <div>
          <h4 className={cn(DS.label, "mb-3")}>Logo Professionnel</h4>
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-indigo-400 transition-colors">
            <div className="text-center">
              {watchedValues.companyLogo ? (
                <div className="space-y-3">
                  <div className="w-16 h-16 mx-auto bg-slate-100 rounded flex items-center justify-center">
                    <img
                      src={watchedValues.companyLogo}
                      alt="Logo"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-slate-600">Logo chargé</p>
                    <button
                      type="button"
                      onClick={() => setValue("companyLogo", "")}
                      className="text-xs text-rose-600 hover:text-rose-700"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 mx-auto bg-slate-100 rounded flex items-center justify-center">
                    <BuildingOfficeIcon size={24} className="text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-slate-600">
                      Glissez-déposez votre logo
                    </p>
                    <p className="text-[9px] text-slate-400">
                      PNG ou SVG, max 2MB
                    </p>
                    <button
                      type="button"
                      className="text-xs text-indigo-600 hover:text-indigo-700"
                    >
                      Parcourir
                    </button>
                  </div>
                </div>
              )}
            </div>
            <input
              {...register("companyLogo")}
              type="url"
              className="hidden"
              placeholder="https://..."
            />
          </div>
          <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200">
            <p className="text-[10px] text-amber-700">
              <strong>Safe Area:</strong> Votre logo sera redimensionné pour
              s'adapter aux en-têtes de devis.
            </p>
          </div>
        </div>

        {/* Identifiant Fiscal - Duo Fixe + Masqué */}
        <div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">
                Label
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTaxLabelDropdown(!showTaxLabelDropdown)}
                  className={cn(
                    DS.input,
                    DS.mono,
                    "w-full px-3 py-2 text-sm rounded-t text-left flex items-center justify-between uppercase",
                  )}
                >
                  <span>{watchedValues.taxIdLabel || "Sélectionner..."}</span>
                  <CaretRightIcon size={12} className="text-slate-400" />
                </button>

                {showTaxLabelDropdown && (
                  <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-slate-100 rounded shadow-lg max-h-48 overflow-y-auto">
                    {TAX_LABEL_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setValue("taxIdLabel", option.value);
                          setShowTaxLabelDropdown(false);
                          // Auto-suggestion du masque
                          if (
                            TAX_MASKS[option.value as keyof typeof TAX_MASKS]
                          ) {
                            setTaxMask(
                              TAX_MASKS[option.value as keyof typeof TAX_MASKS],
                            );
                          }
                        }}
                        className="w-full px-3 py-2 text-xs text-left hover:bg-slate-50 flex items-center justify-between"
                      >
                        <span className="font-mono">{option.value}</span>
                        <span className="text-slate-600">
                          {option.label.split(" - ")[1]}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">
                Numéro
              </label>
              <div className="relative">
                <input
                  {...register("taxId")}
                  className={cn(
                    DS.input,
                    DS.mono,
                    "w-full px-3 py-2 text-sm rounded-t",
                  )}
                  placeholder={taxMask || "CI-ABJ-2023-A-12345"}
                  onInput={(e) => {
                    const target = e.target as HTMLInputElement;
                    const value = target.value;
                    // Nettoyage automatique des caractères mal placés
                    const cleaned = value
                      .replace(/\s+/g, " ") // Normalise les espaces
                      .replace(/-+/g, "-") // Normalise les tirets
                      .replace(/\/+/g, "/") // Normalise les slashes
                      .trim();
                    setValue("taxId", cleaned);
                  }}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-400">
                  {watchedValues.taxIdLabel || "NCC"}
                </span>
              </div>
              {errors.taxId && (
                <p className="mt-1 text-[10px] text-rose-500">
                  {errors.taxId.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Contact */}
        <div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">
                Email Professionnel
              </label>
              <input
                {...register("companyEmail")}
                type="email"
                className={cn(DS.input, "w-full px-3 py-2 text-sm rounded-t")}
                placeholder="contact@acme.com"
              />
              {errors.companyEmail && (
                <p className="mt-1 text-[10px] text-rose-500">
                  {errors.companyEmail.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">
                Téléphone
              </label>
              <div className="relative">
                <div className="flex">
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="flex items-center gap-1 px-2 py-2 bg-slate-100 border-b border-slate-200 rounded-l text-xs"
                  >
                    <span>{selectedCountry.flag}</span>
                    <CaretRightIcon size={10} className="text-slate-400" />
                  </button>
                  <input
                    {...register("companyPhone")}
                    type="tel"
                    className={cn(
                      DS.input,
                      DS.mono,
                      "flex-1 px-3 py-2 text-sm rounded-l-none",
                    )}
                    placeholder={`${selectedCountry.dialCode} 05 54 86 78 34`}
                    onChange={(e) => {
                      let value = e.target.value;
                      // Formatage automatique selon le pays
                      if (selectedCountry.code === "CI") {
                        // Format CI: +225 05 54 86 78 34
                        value = value.replace(/\D/g, "");
                        if (value.length > 8) {
                          value = value.slice(-8);
                        }
                        if (value.length >= 4) {
                          value =
                            value.slice(0, 2) +
                            " " +
                            value.slice(2, 4) +
                            " " +
                            value.slice(4, 6) +
                            " " +
                            value.slice(6);
                        }
                        value = selectedCountry.dialCode + " " + value;
                      } else {
                        value = normalizePhone(value);
                      }
                      setValue("companyPhone", value);
                    }}
                  />
                </div>

                {showCountryDropdown && (
                  <div className="absolute top-full left-0 z-10 mt-1 bg-white border border-slate-100 rounded shadow-lg max-h-32 overflow-y-auto">
                    {COUNTRIES.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => {
                          setSelectedCountry(country);
                          setShowCountryDropdown(false);
                          // Mettre à jour le préfixe du téléphone
                          if (watchedValues.companyPhone) {
                            const phoneWithoutCode =
                              watchedValues.companyPhone.replace(
                                /^\+\d+\s*/,
                                "",
                              );
                            setValue(
                              "companyPhone",
                              country.dialCode + " " + phoneWithoutCode,
                            );
                          }
                        }}
                        className="w-full px-3 py-2 text-xs text-left hover:bg-slate-50 flex items-center gap-2"
                      >
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                        <span className="text-slate-400">
                          {country.dialCode}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.companyPhone && (
                <p className="mt-1 text-[10px] text-rose-500">
                  {errors.companyPhone.message}
                </p>
              )}
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">
                Site Web
              </label>
              <div className="relative">
                <input
                  {...register("companyWebsite")}
                  className={cn(DS.input, "w-full px-3 py-2 text-sm rounded-t")}
                  placeholder="www.acme.com"
                  onChange={(e) => {
                    const normalized = normalizeWebsite(e.target.value);
                    setValue("companyWebsite", normalized);
                  }}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-400">
                  https:// auto
                </span>
              </div>
              {errors.companyWebsite && (
                <p className="mt-1 text-[10px] text-rose-500">
                  {errors.companyWebsite.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Adresse - Fusion Smart-Merge */}
        <div>
          <div className="space-y-6">
            {/* Adresse & Précisions */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">
                Adresse & Précisions
              </label>
              <textarea
                {...register("companyAddressDetails")}
                rows={2}
                className={cn(
                  DS.input,
                  "w-full px-3 py-2 text-sm rounded resize-none",
                )}
                placeholder="Rue Prince, Lot 123, Immeuble ABC..."
                onChange={(e) => {
                  setValue("companyAddressDetails", e.target.value);
                  // Auto-redimensionnement
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
              />
            </div>

            {/* Localisation */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">
                Ville
              </label>
              <input
                {...register("companyCity")}
                className={cn(DS.input, "w-full px-3 py-2 text-sm rounded-t")}
                placeholder="ABIDJAN"
              />
            </div>

            {/* Preview Ready - Simulation en-tête PDF */}
            <div className="p-3 bg-slate-50 rounded border border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <FileTextIcon size={12} className="text-slate-400" />
                <span className={cn(DS.micro, "text-slate-600")}>
                  Aperçu En-tête PDF
                </span>
                {getAddressLength() > 80 && (
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                    TROP LONG
                  </span>
                )}
              </div>
              <div className="bg-white p-3 rounded border border-slate-100">
                <div className={cn(DS.mono, "text-xs text-slate-700")}>
                  {watchedValues.companyName || "Studio Digital Ivoire"} —{" "}
                  {watchedValues.taxIdLabel || "NCC"} :{" "}
                  {watchedValues.taxId || "CI-ABJ-2023-A-12345"} —{" "}
                  {formatAddressForPDF()}
                </div>
              </div>
              {getAddressLength() > 80 && (
                <p className="mt-2 text-[10px] text-amber-700">
                  ⚠️ L'adresse est trop longue pour une ligne de devis et risque
                  de casser le layout.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Paramètres Opérationnels */}
        <div>
          <div className="space-y-6">
            {/* Paramètres Devis */}
            <div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">
                    Préfixe Devis
                  </label>
                  <input
                    {...register("quotePrefix")}
                    className={cn(
                      DS.input,
                      DS.mono,
                      "w-full px-3 py-2 text-sm rounded-t uppercase",
                    )}
                    placeholder="INV-"
                  />
                  {errors.quotePrefix && (
                    <p className="mt-1 text-[10px] text-rose-500">
                      {errors.quotePrefix.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">
                    Prochain N°
                  </label>
                  <input
                    {...register("nextQuoteNumber", { valueAsNumber: true })}
                    type="number"
                    className={cn(
                      DS.input,
                      DS.mono,
                      "w-full px-3 py-2 text-sm rounded-t",
                    )}
                    placeholder="1"
                  />
                  {errors.nextQuoteNumber && (
                    <p className="mt-1 text-[10px] text-rose-500">
                      {errors.nextQuoteNumber.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Paramètres Financiers */}
            <div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">
                    Devise
                  </label>
                  <input
                    {...register("currency")}
                    className={cn(
                      DS.input,
                      DS.mono,
                      "w-full px-3 py-2 text-sm rounded-t text-center uppercase",
                    )}
                    maxLength={3}
                    placeholder="XOF"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5 block">
                    Taux TVA (%)
                  </label>
                  <input
                    {...register("defaultVatRate", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className={cn(
                      DS.input,
                      DS.mono,
                      "w-full px-3 py-2 text-sm rounded-t text-right",
                    )}
                    placeholder="18.00"
                  />
                  {errors.defaultVatRate && (
                    <p className="mt-1 text-[10px] text-rose-500">
                      {errors.defaultVatRate.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Conditions Générales */}
            <div>
              <h4 className={cn(DS.label, "mb-3")}>Conditions Générales</h4>
              <textarea
                {...register("defaultTerms")}
                rows={4}
                className={cn(
                  DS.input,
                  "w-full px-3 py-2 text-xs rounded resize-none",
                )}
                placeholder="Conditions de paiement, délais, clauses..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BentoProfileTelemetry({ watchedValues, className }: any) {
  return (
    <div className={cn(DS.card, "rounded-lg p-4", className)}>
      <div className="space-y-3">
        <div className="p-2 bg-slate-50 rounded border border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <DatabaseIcon size={12} className="text-slate-400" />
            <span className={cn(DS.label, "text-slate-500")}>ID Compte</span>
          </div>
          <span className={cn(DS.mono, "text-slate-700 uppercase")}>
            {watchedValues.companyName
              ? watchedValues.companyName
                  .replace(/\s+/g, "")
                  .slice(0, 6)
                  .toUpperCase()
              : "---"}
          </span>
        </div>

        <div className="p-2 bg-slate-50 rounded border border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <CalendarIcon size={12} className="text-slate-400" />
            <span className={cn(DS.label, "text-slate-500")}>
              Préfixe Devis
            </span>
          </div>
          <span className={cn(DS.mono, "text-slate-700")}>
            {watchedValues.quotePrefix || "—"}
          </span>
        </div>

        <div className="p-2 bg-slate-50 rounded border border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <GlobeIcon size={12} className="text-slate-400" />
            <span className={cn(DS.label, "text-slate-500")}>Localisation</span>
          </div>
          <span className={cn(DS.mono, "text-slate-700")}>UEMOA / XOF</span>
        </div>

        <div className="p-2 bg-emerald-50 rounded border border-emerald-100">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircleIcon size={12} className="text-emerald-500" />
            <span className={cn(DS.label, "text-emerald-600")}>Statut</span>
          </div>
          <span className={cn(DS.mono, "text-emerald-700")}>VÉRIFIÉ</span>
        </div>
      </div>
    </div>
  );
}

// SECTION 3 & 4 extraites dans features/settings/components/
// → PaymentSection.tsx (BentoPaymentCard, BentoPaymentTelemetry)
// → SecuritySection.tsx (BentoSecurityCard, BentoSecurityTelemetry)
// → DangerZoneSection.tsx (DangerZoneCard)
