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
import { SettingsHeader } from "@/features/settings/components/settings-header";
import {
  DS_PAGE_SHELL,
  DS_PAGE_PADDING,
} from "@/lib/design-system";

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
    <div className={cn(DS_PAGE_SHELL, DS_PAGE_PADDING)}>
      {/* Header sticky avec boutons save/cancel intégrés */}
      <SettingsHeader
        isDirty={isDirty}
        isPending={isPending}
        onSave={handleSave}
        onReset={handleReset}
      />

      <div className="max-w-3xl mx-auto">
        {/* Formulaire global — bento cards empilées verticalement */}
        <form onSubmit={handleSave}>
          <div className="space-y-4">
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
          </div>
        </form>
      </div>
    </div>
  );
}