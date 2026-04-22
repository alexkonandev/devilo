"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  settingsSchema,
  type SettingsFormValues,
} from "@/lib/validations/settings";
import { deleteAccount, updateSettings } from "@/actions/settings-action";
import { toast } from "sonner";

import { IdentitySection } from "./sections/identity-section";
import { BankSection } from "./sections/bank-section";
import { ContactSection } from "./sections/contact-section";
import { FinanceSection } from "./sections/finance-section";
import { LogisticsSection } from "./sections/logistics-section";
import { useState } from "react";

interface SettingsFormProps {
  initialData: SettingsFormValues;
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialData,
  });
  const [isDeleting, setIsDeleting] = useState(false); // État de sécurité pour la suppression
  // 1. Log de validation pour attraper les erreurs AVANT le onSubmit
  const onInvalid = (errors: any) => {
    console.error(
      "%c [VALIDATION_FAILED]",
      "color: #ffffff; background: #ef4444; padding: 2px 4px; border-radius: 2px; font-weight: bold;",
      errors,
    );
    toast.error("ERREUR DE VALIDATION", {
      description: "Certains champs ne respectent pas le schéma requis.",
      className:
        "rounded-none border-red-200 bg-white font-bold text-[11px] uppercase text-red-600",
    });
  };

  const onSubmit = async (data: SettingsFormValues) => {
    // LOG D'ENTRÉE : On vérifie ce qui part au serveur
    console.log(
      "%c [SETTINGS_SUBMIT_START]",
      "color: #ffffff; background: #6366f1; padding: 2px 4px; border-radius: 2px; font-weight: bold;",
      data,
    );

    try {
      const res = await updateSettings(data);

      if (res.success) {
        // LOG DE SUCCÈS
        console.log(
          "%c [SETTINGS_UPDATE_SUCCESS]",
          "color: #ffffff; background: #10b981; padding: 2px 4px; border-radius: 2px; font-weight: bold;",
        );

        toast.success("SYSTÈME À JOUR", {
          className:
            "rounded-none border-slate-200 bg-white font-bold text-[11px] uppercase text-slate-900",
        });

        form.reset(data);
      } else {
        // LOG D'ERREUR BACKEND (ex: Prisma ou Auth)
        console.error(
          "%c [SETTINGS_UPDATE_ERROR]",
          "color: #ffffff; background: #f59e0b; padding: 2px 4px; border-radius: 2px; font-weight: bold;",
          res.error,
        );

        toast.error("ERREUR SYSTÈME", {
          description:
            res.error ||
            "Une erreur inconnue est survenue lors de la sauvegarde.",
        });
      }
    } catch (err) {
      // LOG DE CRASH (Réseau ou exception non gérée)
      console.error(
        "%c [SETTINGS_CRITICAL_EXCEPTION]",
        "color: #ffffff; background: #000000; padding: 2px 4px; border-radius: 2px; font-weight: bold;",
        err,
      );
    }
  };

  // LOGIQUE DE SUPPRESSION (Action irréversible)
  const handleDeleteAccount = async () => {
    // Dans un vrai SaaS, on utiliserait un Dialog de confirmation ici.
    // Pour l'instant, on utilise le confirm natif pour bloquer le thread.
    const confirmed = window.confirm(
      "Êtes-vous absolument certain ? Cette action supprimera vos données Clerk et Prisma définitivement.",
    );

    if (!confirmed) return;

    setIsDeleting(true);
    toast.loading("Purge du compte en cours...", { id: "delete-loading" });

    try {
      const res = await deleteAccount();
      if (res?.success === false) {
        toast.error("ERREUR DE PURGE", {
          description: res.error,
          id: "delete-loading",
        });
        setIsDeleting(false);
      }
      // Si succès, redirect() est géré côté Server Action
    } catch (err) {
      toast.error("ERREUR CRITIQUE", { id: "delete-loading" });
      setIsDeleting(false);
    }
  };
  return (
    <form
      onSubmit={form.handleSubmit(onSubmit, onInvalid)}
      className="flex flex-col  bg-white"
    >
      {/* HEADER : FINESSE ET CLARTÉ (h-16) */}
      <header className="sticky top-0 z-40 h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">
            Configuration
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="bg-gradient-to-b from-indigo-400/30 to-transparent p-[2px] rounded-[10px]">
            <button
              type="submit"
              disabled={form.formState.isSubmitting || !form.formState.isDirty}
              className="cursor-pointer group p-[2px] rounded-[8px] bg-gradient-to-b from-indigo-500 to-indigo-700 shadow-[0_1px_2px_rgba(0,0,0,0.4)] active:shadow-[0_0px_1px_rgba(0,0,0,0.4)] active:scale-[0.98] disabled:opacity-30 disabled:pointer-events-none transition-all"
            >
              <div className="bg-gradient-to-b from-indigo-400/40 to-indigo-600/80 rounded-[6px] px-6 py-1.5">
                <div className="flex gap-2 items-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                    {form.formState.isSubmitting ? "..." : "Enregistrer"}
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* ZONE DE TRAVAIL : ESPACEMENT AÉRÉ */}
      <main className="max-w-7xl mx-auto py-16 px-8 w-full space-y-20">
        <IdentitySection form={form} initialLogo={initialData.companyLogo} />

        <div className="h-px bg-slate-100" />

        <BankSection register={form.register} errors={form.formState.errors} />

        <div className="h-px bg-slate-100" />

        <ContactSection form={form} />

        <div className="h-px bg-slate-100" />

        <FinanceSection form={form} />

        <div className="h-px bg-slate-100" />

        <LogisticsSection form={form} />

        {/* DANGER ZONE : SUPPRESSION DU COMPTE */}
        <div className="pt-12 border-t border-slate-100 flex justify-between items-start">
          <div className="max-w-md">
            <p className="text-[12px] font-bold text-red-600 uppercase tracking-widest">
              Zone de Danger
            </p>
            <p className="text-[13px] text-slate-500 mt-2 leading-relaxed">
              La suppression de votre compte est **définitive**. Toutes vos
              données fiscales, votre catalogue client et l&apos;historique de
              vos devis seront immédiatement effacés. Cette action ne peut pas
              être annulée.
            </p>
          </div>

          {/* Bouton de suppression avec le style "Skeuomorphique" mais en version Alerte/Red */}
          <div className="bg-gradient-to-b from-red-200/40 to-transparent p-[2px] rounded-[10px]">
            <button
              type="button" // CRITIQUE : Empêche de trigger le onSubmit du formulaire
              disabled={isDeleting || form.formState.isSubmitting}
              className="cursor-pointer group p-[2px] rounded-[8px] bg-gradient-to-b from-white to-red-50 shadow-[0_1px_2px_rgba(0,0,0,0.1)] active:shadow-[0_0px_1px_rgba(0,0,0,0.1)] active:scale-[0.98] transition-all border border-red-200"
              onClick={handleDeleteAccount}
            >
              <div className="bg-white group-hover:bg-red-50 rounded-[6px] px-6 py-2 transition-colors">
                <div className="flex gap-2 items-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">
                    Supprimer le compte
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* FOOTER : MINIMALISME TECHNIQUE */}
      <footer className="h-10 bg-white border-t border-slate-100 px-8 flex items-center justify-between shrink-0">
        <div className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
          {initialData.companyName || "ID : NON_DÉFINI"}
        </div>
        <div className="font-mono text-[9px] text-slate-300 uppercase">
          Abidjan_Node // Prod_Build_{new Date().getFullYear()}
        </div>
      </footer>
    </form>
  );
}
