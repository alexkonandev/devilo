"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  settingsSchema,
  type SettingsFormValues,
} from "@/lib/validations/settings";
import { updateSettings } from "@/actions/settings-action";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

import { IdentitySection } from "./sections/identity-section";
import { ContactSection } from "./sections/contact-section";
import { FinanceSection } from "./sections/finance-section";
import { LogisticsSection } from "./sections/logistics-section";

interface SettingsFormProps {
  initialData: SettingsFormValues;
}

export function SettingsForm({ initialData }: SettingsFormProps) {
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: SettingsFormValues) => {
    const res = await updateSettings(data);
    if (res.success) {
      toast.success("SYSTÈME À JOUR", {
        className:
          "rounded-none border-slate-200 bg-white font-bold text-[11px] uppercase text-slate-900",
      });
      form.reset(data);
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col min-h-screen bg-white"
    >
      {/* HEADER : FINESSE ET CLARTÉ (h-16) */}
      <header className="sticky top-0 z-40 h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">
            Configuration
          </h1>
          <div className="flex items-center gap-2 px-2 py-0.5 border border-indigo-100 bg-indigo-50">
            <ShieldCheck className="w-3 h-3 text-indigo-600" />
            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-700">
              Certifié
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {form.formState.isDirty && (
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-tight">
              Modifications non enregistrées
            </span>
          )}
          <Button
            type="submit"
            disabled={form.formState.isSubmitting || !form.formState.isDirty}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-none text-[11px] font-bold uppercase h-9 px-6 transition-colors disabled:opacity-20"
          >
            {form.formState.isSubmitting ? "..." : "Enregistrer"}
          </Button>
        </div>
      </header>

      {/* ZONE DE TRAVAIL : ESPACEMENT AÉRÉ */}
      <main className="max-w-7xl mx-auto py-16 px-8 w-full space-y-20">
        <IdentitySection form={form} initialLogo={initialData.companyLogo} />

        <div className="h-px bg-slate-100" />

        <ContactSection form={form} />

        <div className="h-px bg-slate-100" />

        <FinanceSection form={form} />

        <div className="h-px bg-slate-100" />

        <LogisticsSection form={form} />

        {/* VALIDATION FINALE : ÉPURÉE */}
        <div className="pt-12 border-t border-slate-900 flex justify-between items-start pb-32">
          <div className="max-w-sm">
            <p className="text-[12px] font-bold text-slate-900 uppercase">
              Confirmation
            </p>
            <p className="text-[13px] text-slate-500 mt-1 leading-relaxed">
              L&apos;application des réglages synchronise vos paramètres fiscaux
              sur l&apos;ensemble du système.
            </p>
          </div>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting || !form.formState.isDirty}
            className="bg-slate-900 text-white rounded-none h-11 px-10 font-bold uppercase text-[12px] hover:bg-indigo-600 transition-colors"
          >
            {form.formState.isSubmitting
              ? "Mise à jour..."
              : "Appliquer les réglages"}
          </Button>
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
