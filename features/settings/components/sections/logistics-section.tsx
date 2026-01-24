"use client";

import { UseFormReturn } from "react-hook-form";
import { SettingsFormValues } from "@/lib/validations/settings";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Scale, Receipt, FileText, Gavel, ShieldAlert } from "lucide-react";

interface SectionProps {
  form: UseFormReturn<SettingsFormValues>;
}

export function LogisticsSection({ form }: SectionProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const quotePrefix = watch("quotePrefix");
  const nextNumber = watch("nextQuoteNumber");

  const handlePrefixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("quotePrefix", e.target.value.toUpperCase().replace(/\s/g, ""), {
      shouldValidate: true,
    });
  };

  return (
    <section className="space-y-12">
      {/* HEADER : LIGNE TECHNIQUE FINE */}
      <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600">
          04. Protocole & Conformité
        </h2>
        <div className="h-px flex-1 bg-slate-50" />
      </div>

      <div className="grid grid-cols-12 gap-12">
        {/* COLONNE GAUCHE : SÉQUENÇAGE */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
              <Receipt className="w-4 h-4 text-slate-400" />
              <span className="text-[11px] font-bold uppercase tracking-tight text-slate-900">
                Indexation Documents
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-500">
                  Préfixe
                </label>
                <Input
                  {...register("quotePrefix")}
                  onChange={handlePrefixChange}
                  className="rounded-none border-slate-200 font-mono text-[13px] h-10 focus-visible:border-indigo-600 focus-visible:ring-0 uppercase font-bold"
                  placeholder="QT-"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-500">
                  Prochain N°
                </label>
                <Input
                  type="number"
                  {...register("nextQuoteNumber", { valueAsNumber: true })}
                  className="rounded-none border-slate-200 font-mono text-[13px] h-10 focus-visible:border-indigo-600 focus-visible:ring-0 font-bold"
                />
              </div>
            </div>

            {/* PREVIEW : CAO STYLE */}
            <div className="bg-slate-50 border border-dashed border-slate-200 p-4">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold uppercase text-slate-400">
                  Aperçu :
                </span>
                <span className="font-mono text-[13px] font-bold tracking-widest text-indigo-600">
                  {quotePrefix || "????"}-
                  {String(nextNumber || 1).padStart(4, "0")}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 border border-amber-100 bg-amber-50/50 flex gap-3">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[10px] font-medium text-amber-800 leading-snug">
              La continuité de la numérotation est une exigence réglementaire
              OHADA.
            </p>
          </div>
        </div>

        {/* COLONNE DROITE : CADRE LÉGAL */}
        <div className="col-span-12 lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2">
            <Gavel className="w-4 h-4 text-slate-400" />
            <label className="text-[12px] font-semibold text-slate-700 uppercase tracking-tight">
              Mentions Légales (Pied de page)
            </label>
          </div>

          <div className="relative group">
            <Textarea
              {...register("defaultTerms")}
              className="min-h-[280px] rounded-none border-slate-200 font-mono text-[12px] p-5 leading-relaxed resize-none bg-white focus-visible:border-indigo-600 focus-visible:ring-0 transition-colors uppercase"
              placeholder={`LITIGES : TRIBUNAL DE COMMERCE D'ABIDJAN.\nVALIDITÉ : 30 JOURS.`}
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Standard juridique activé
            </span>
            {errors.defaultTerms && (
              <p className="text-[10px] font-bold text-red-500 uppercase italic">
                Saisie obligatoire
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
