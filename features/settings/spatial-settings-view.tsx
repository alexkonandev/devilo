"use client";

import React, { useState, useTransition } from "react";
import { useForm, UseFormRegister, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { FloppyDiskIcon, WarningIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  settingsSchema,
  type SettingsFormValues,
} from "@/lib/validations/settings";
import { updateSettings, deleteAccount } from "@/actions/settings-action";

// Components
import { SpatialTabNav, SettingsTab } from "./components/spatial-tab-nav";
import { SpatialCard } from "../dashboard/components/spatial-card";
import { SpatialInput } from "./components/spatial-input";
import { BankSection } from "./components/sections/bank-section";

interface SpatialSettingsViewProps {
  initialData: SettingsFormValues;
}

export function SpatialSettingsView({ initialData }: SpatialSettingsViewProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("identity");
  const [isPending, startTransition] = useTransition();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialData,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = form;

  const onSubmit = (data: SettingsFormValues) => {
    startTransition(async () => {
      try {
        const res = await updateSettings(data);
        if (res.success) {
          toast.success("CONFIGURATION MISE À JOUR", {
            description: "Les paramètres système ont été sauvegardés.",
          });
          reset(data); // Reset dirty state
        } else {
          toast.error("ERREUR SYSTÈME", {
            description: res.error || "Impossible de sauvegarder les données.",
          });
        }
      } catch (err) {
        toast.error("ERREUR CRITIQUE", {
          description: "Erreur réseau inconnue.",
        });
      }
    });
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.",
      )
    )
      return;

    try {
      await deleteAccount();
    } catch (e) {
      toast.error("Erreur lors de la suppression");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 min-h-[600px] items-start pt-12">
      {/* ── LEFT : NAVIGATION ── */}
      <div className="shrink-0 lg:sticky lg:top-32 self-start w-full lg:w-auto">
        <SpatialTabNav activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* ── RIGHT : ACTIVE PANEL ── */}
      <div className="flex-1 w-full max-w-3xl perspective-[2000px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <SpatialCard
            depth={2}
            variant="glass"
            className="p-8 lg:p-12 min-h-[500px] relative overflow-hidden"
          >
            {/* Save Button (Floating) */}
            <div className="absolute top-8 right-8 z-20">
              <button
                type="submit"
                disabled={!isDirty || isPending}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all duration-300 shadow-lg",
                  isDirty && !isPending
                    ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/30 scale-100 opacity-100 cursor-pointer"
                    : "bg-slate-100 text-slate-400 shadow-none scale-95 opacity-50 cursor-not-allowed",
                )}
              >
                {isPending ? (
                  <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                ) : (
                  <FloppyDiskIcon size={16} weight="bold" />
                )}
                {isPending ? "Saving..." : "Sauvegarder"}
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -20, scale: 0.98 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="h-full"
              >
                <PanelContent
                  activeTab={activeTab}
                  register={register}
                  errors={errors}
                  onDelete={handleDelete}
                />
              </motion.div>
            </AnimatePresence>
          </SpatialCard>
        </form>
      </div>
    </div>
  );
}

function PanelContent({
  activeTab,
  register,
  errors,
  onDelete,
}: {
  activeTab: SettingsTab;
  register: UseFormRegister<SettingsFormValues>;
  errors: FieldErrors<SettingsFormValues>;
  onDelete: () => void;
}) {
  switch (activeTab) {
    case "identity":
      return (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 italic tracking-tight mb-2">
              Identité Légale
            </h2>
            <p className="text-slate-400 text-sm">
              Informations visibles sur vos documents officiels.
            </p>
          </div>

          <div className="grid gap-6">
            <SpatialInput
              label="Nom de l'entreprise"
              {...register("companyName")}
              error={errors.companyName?.message}
              placeholder="Ex: Acme Corp"
            />
            <SpatialInput
              label="Logo URL"
              {...register("companyLogo")}
              error={errors.companyLogo?.message}
              placeholder="https://..."
            />
            <SpatialInput
              label="Site Web"
              {...register("companyWebsite")}
              error={errors.companyWebsite?.message}
              placeholder="www.acme.com"
            />
          </div>
        </div>
      );

    case "banking":
      return <BankSection register={register} errors={errors} />;

    case "contact":
      return (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 italic tracking-tight mb-2">
              Points de Contact
            </h2>
            <p className="text-slate-400 text-sm">
              Coordonnées pour vos clients et partenaires.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <SpatialInput
                label="Email Principal"
                type="email"
                {...register("companyEmail")}
                error={errors.companyEmail?.message}
              />
            </div>
            <SpatialInput
              label="Téléphone"
              type="tel"
              {...register("companyPhone")}
              error={errors.companyPhone?.message}
            />
            <SpatialInput
              label="Ville / Localité"
              {...register("companyCity")}
              error={errors.companyCity?.message}
            />
            <div className="md:col-span-2">
              <SpatialInput
                label="Adresse Complète"
                {...register("companyAddressDetails")}
                error={errors.companyAddressDetails?.message}
                placeholder="Rue, Numéro, Bâtiment..."
              />
            </div>
          </div>
        </div>
      );

    case "finance":
      return (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 italic tracking-tight mb-2">
              Paramètres Fiscaux
            </h2>
            <p className="text-slate-400 text-sm">
              Configuration de base pour la facturation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SpatialInput
              label="Devise (Code ISO)"
              {...register("currency")}
              error={errors.currency?.message}
              maxLength={3}
              className="uppercase"
            />
            <SpatialInput
              label="Taux TVA (%)"
              type="number"
              step="0.01"
              {...register("defaultVatRate", { valueAsNumber: true })}
              error={errors.defaultVatRate?.message}
            />
            <SpatialInput
              label="Label Identifiant"
              {...register("taxIdLabel")}
              error={errors.taxIdLabel?.message}
              placeholder="Ex: SIRET, NCC..."
            />
            <SpatialInput
              label="Numéro Fiscal"
              {...register("taxId")}
              error={errors.taxId?.message}
            />
          </div>
        </div>
      );

    case "logistics":
      return (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 italic tracking-tight mb-2">
              Logistique & Séquences
            </h2>
            <p className="text-slate-400 text-sm">
              Gestion des numérotations et conditions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SpatialInput
              label="Préfixe Devis"
              {...register("quotePrefix")}
              error={errors.quotePrefix?.message}
            />
            <SpatialInput
              label="Prochain Numéro"
              type="number"
              {...register("nextQuoteNumber", { valueAsNumber: true })}
              error={errors.nextQuoteNumber?.message}
            />
            <div className="md:col-span-2">
              <SpatialInput
                label="Conditions Générales"
                {...register("defaultTerms")}
                error={errors.defaultTerms?.message}
                placeholder="Texte libre..."
              />
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-slate-200/60">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-rose-50 border border-rose-200">
              <div className="p-2 bg-rose-100 text-rose-500 rounded-lg">
                <WarningIcon size={20} weight="bold" />
              </div>
              <div className="flex justify-between w-full">
                <div>
                  <h4 className="text-xs font-bold text-rose-600 uppercase tracking-widest mb-1">
                    Zone Danger
                  </h4>
                  <p className="text-[11px] text-rose-400 mb-3 leading-relaxed">
                    La suppression du compte est irréversible.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onDelete}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors shadow-lg shadow-rose-600/20"
                >
                  Supprimer le compte
                </button>
              </div>
            </div>
          </div>
        </div>
      );
  }
}
