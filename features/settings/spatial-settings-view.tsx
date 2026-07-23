"use client";

import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  settingsSchema,
  type SettingsFormValues,
} from "@/lib/validations/settings";
import { updateSettings } from "@/actions/settings-action";
import { type SecurityProfile } from "@/actions/security-action";
import { BentoIdentityCard } from "@/features/settings/components/IdentitySection";
import { BentoFiscalCard } from "@/features/settings/components/FiscalSection";
import {
  BentoSecurityCard,
} from "@/features/settings/components/SecuritySection";
import { DangerZoneCard } from "@/features/settings/components/DangerZoneSection";
import { toast } from "sonner";
import { useKernelStore } from "@/hooks/use-kernel-store";
import { cn } from "@/lib/utils";
import { SlidersIcon, FloppyDiskIcon, XIcon, SpinnerIcon } from "@phosphor-icons/react";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface SpatialSettingsViewProps {
  initialData: SettingsFormValues;
  securityProfile: SecurityProfile;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT — Layout vertical centré, bento cards empilées
// ═══════════════════════════════════════════════════════════════════════════════

export function SpatialSettingsView({
  initialData,
  securityProfile,
}: SpatialSettingsViewProps) {
  const [isPending, startTransition] = useTransition();
  const setSettings = useKernelStore((s) => s.setSettings);

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
          reset(data);
          setSettings(data);
        } else {
          toast.error("ERREUR SYSTÈME", { description: res.error });
        }
      } catch {
        toast.error("ERREUR CRITIQUE");
      }
    });
  };

  const handleReset = () => {
    reset(initialData);
    toast.info("Modifications annulées");
  };

  const handleSave = handleSubmit(onSubmit);

  return (
    <div className="flex flex-col h-full w-full bg-slate-50">
      {/* === HEADER === */}
      <header className="flex items-center h-12 px-3 border-b border-slate-200 bg-white shrink-0 gap-2">
        <div className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center">
          <SlidersIcon size={12} className="text-indigo-600" weight="bold" />
        </div>
        <span className="text-[10px] font-mono font-bold text-slate-800 tracking-tight">
          Paramètres
        </span>
        <span className="text-[8px] font-mono text-slate-400">
          Identité · Fiscalité · Sécurité
        </span>
        <div className="flex-1" />
        {isDirty && (
          <button
            type="button"
            onClick={handleReset}
            disabled={isPending}
            className="flex items-center justify-center w-7 h-7 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-md transition-all"
          >
            <XIcon size={10} weight="bold" />
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || isPending}
          className={cn(
            "flex items-center justify-center w-7 h-7 rounded-md transition-all",
            isDirty
              ? "bg-slate-900 hover:bg-slate-800 text-white"
              : "bg-slate-100 text-slate-300 cursor-not-allowed"
          )}
        >
          {isPending ? (
            <SpinnerIcon size={10} className="animate-spin" />
          ) : (
            <FloppyDiskIcon size={10} weight="bold" />
          )}
        </button>
      </header>

      {/* === CONTENU === */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
        <form onSubmit={handleSave} className="space-y-4">
          <BentoIdentityCard
            register={register}
            errors={errors}
            watchedValues={watchedValues}
            setValue={setValue}
          />

          <BentoFiscalCard
            register={register}
            errors={errors}
            watchedValues={watchedValues}
            setValue={setValue}
          />

          <BentoSecurityCard
            securityProfile={securityProfile}
          />

          <DangerZoneCard
            userEmail={watchedValues.companyEmail || ""}
          />
        </form>
      </div>
    </div>
  );
}