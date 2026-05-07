"use client";

import React, { useState, useTransition, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  settingsSchema,
  type SettingsFormValues,
} from "@/lib/validations/settings";
import { updateSettings } from "@/actions/settings-action";
import { type SecurityProfile } from "@/actions/security-action";
import {
  BentoProfileCard,
  BentoProfileTelemetry,
} from "@/features/settings/components/ProfileSection";
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
import { useKernelStore } from "@/hooks/use-kernel-store";
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

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

type SettingsSection = "profile" | "documents" | "payment" | "security";

interface SpatialSettingsViewProps {
  initialData: SettingsFormValues;
  securityProfile: SecurityProfile;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT — Orchestrateur layout
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
  const setSettings = useKernelStore((s) => s.setSettings);

  // Score de sécurité réactif côté client
  // Logique miroir de security-action.ts : 50pts email + 50pts companyName
  const [liveScore, setLiveScore] = useState(securityProfile.score);

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

  const watchedValues = watch();

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
          // Sync le store global pour propager aux autres composants
          setSettings(data);
          // Recalcul local du score (miroir security-action.ts)
          const newScore =
            (securityProfile.emailVerified ? 50 : 0) +
            (data.companyName ? 50 : 0);
          setLiveScore(newScore);
        } else {
          toast.error("ERREUR SYSTÈME", { description: res.error });
        }
      } catch {
        toast.error("ERREUR CRITIQUE");
      }
    });
  };

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
    <div className="h-full grid grid-rows-[auto_1fr] overflow-hidden bg-slate-50">
      <TelemetryHUD
        isDirty={isDirty}
        isPending={isPending}
        lastSaved={lastSaved}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSave={handleSubmit(onSubmit)}
        watchedValues={watchedValues}
        securityScore={liveScore}
      />

      <div className="grid grid-cols-[200px_1fr] overflow-hidden">
        <SettingsSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          formDirty={isDirty}
          searchResults={filteredSections}
          setSearchQuery={setSearchQuery}
        />

        <main className="h-full overflow-y-auto p-4">
          <div className="max-w-6xl mx-auto">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-12 gap-4 max-h-[calc(100vh-140px)]">
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
  securityScore: number;
}

function TelemetryHUD({
  isDirty,
  isPending,
  lastSaved,
  searchQuery,
  setSearchQuery,
  onSave,
  securityScore,
}: TelemetryHUDProps) {
  const scoreLabel =
    securityScore >= 75
      ? "Excellent"
      : securityScore >= 50
        ? "Correct"
        : "Faible";
  const scoreColor =
    securityScore >= 75
      ? "text-emerald-600"
      : securityScore >= 50
        ? "text-amber-600"
        : "text-rose-600";
  const scoreBg =
    securityScore >= 75
      ? "bg-emerald-50"
      : securityScore >= 50
        ? "bg-amber-50"
        : "bg-rose-50";

  const hudItems = [
    {
      icon: ShieldCheckIcon,
      label: "Score Sécurité",
      value: `${securityScore}%`,
      subtext: scoreLabel,
      color: scoreColor,
      bg: scoreBg,
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
// ZONE 2A: SETTINGS SIDEBAR (200px)
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
