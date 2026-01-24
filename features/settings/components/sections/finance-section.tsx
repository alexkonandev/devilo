"use client";

import { UseFormReturn } from "react-hook-form";
import { SettingsFormValues } from "@/lib/validations/settings";
import { Input } from "@/components/ui/input";
import { Banknote, Landmark, Percent } from "lucide-react";

interface SectionProps {
  form: UseFormReturn<SettingsFormValues>;
}

export function FinanceSection({ form }: SectionProps) {
  const {
    register,
    setValue,
    formState: { errors },
  } = form;

  const handleVatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseFloat(e.target.value);
    if (isNaN(val) || val < 0) val = 0;
    if (val > 100) val = 100;
    setValue("defaultVatRate", val, { shouldValidate: true });
  };

  return (
    <section className="space-y-12">
      {/* HEADER DE SECTION : LIGNE TECHNIQUE FINE */}
      <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600">
          03. Paramètres Financiers
        </h2>
        <div className="h-px flex-1 bg-slate-50" />
      </div>

      <div className="grid grid-cols-12 gap-12">
        {/* DEVISE : ÉTAT DE LECTURE SEUL PROPRE */}
        <div className="col-span-12 lg:col-span-6 space-y-3">
          <label className="text-[12px] font-semibold text-slate-700 flex items-center gap-2">
            <Landmark className="w-3.5 h-3.5 text-slate-400" /> Devise de
            Référence
          </label>
          <div className="h-11 border border-slate-200 bg-slate-50 flex items-center justify-between px-4 transition-colors">
            <span className="font-mono text-[13px] font-bold text-slate-900">
              XOF • FRANC CFA
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              UEMOA / ZONE 1
            </span>
          </div>
          <input type="hidden" {...register("currency")} value="XOF" />
          <p className="text-[10px] text-slate-400 font-medium italic">
            La devise est verrouillée sur la zone monétaire locale.
          </p>
        </div>

        {/* TVA : PRÉCISION MONOSPACE */}
        <div className="col-span-12 lg:col-span-6 space-y-3">
          <label className="text-[12px] font-semibold text-slate-700 flex items-center gap-2">
            <Percent className="w-3.5 h-3.5 text-slate-400" /> Taux de TVA par
            défaut
          </label>

          <div className="relative group">
            <Input
              type="number"
              step="0.01"
              {...register("defaultVatRate", { valueAsNumber: true })}
              onChange={handleVatChange}
              className="rounded-none border-slate-200 font-mono text-[16px] h-11 pr-12 focus-visible:border-indigo-600 focus-visible:ring-0 bg-white font-bold tabular-nums shadow-none"
              placeholder="18.00"
            />
            <div className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 font-bold border-l border-slate-100">
              %
            </div>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-tight">
              Standard Côte d&apos;Ivoire : 18.00%
            </p>
            {errors.defaultVatRate && (
              <p className="text-[10px] font-bold text-red-500 uppercase italic">
                {errors.defaultVatRate.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* NOTE TECHNIQUE BAS DE PAGE */}
      <div className="flex items-center gap-3 p-4 border border-slate-100 bg-slate-50/50">
        <Banknote className="w-4 h-4 text-slate-400" />
        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
          Les calculs de taxes et conversions monétaires sont certifiés
          conformes au régime fiscal en vigueur.
        </p>
      </div>
    </section>
  );
}
