"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { SettingsFormValues } from "@/lib/validations/settings";
import { Input } from "@/components/ui/input";
import { BankIcon, CreditCardIcon, BuildingsIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface BankSectionProps {
  register: UseFormRegister<SettingsFormValues>;
  errors: FieldErrors<SettingsFormValues>;
}

export function BankSection({ register, errors }: BankSectionProps) {
  return (
    <section className="space-y-8">
      <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
        <BankIcon className="w-5 h-5 text-indigo-500" weight="duotone" />
        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600">
          02. Identité Bancaire
        </h2>
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed -mt-4">
        Ces informations seront affichées sur vos devis pour faciliter les
        paiements. Elles sont figées au moment de la création du devis.
      </p>

      <div className="space-y-6">
        {/* Nom de la banque */}
        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500 flex items-center gap-2">
            <BuildingsIcon className="w-3.5 h-3.5" weight="duotone" />
            Nom de la banque
          </label>
          <Input
            {...register("bankName")}
            placeholder="Ex: Société Générale, Ecobank, NSIA..."
            className={cn(
              "h-11 bg-slate-50 border-slate-200 text-[12px] font-bold text-slate-900 rounded-xl focus:bg-white focus:border-indigo-400 transition-all",
              errors.bankName && "border-rose-400 focus:border-rose-500",
            )}
          />
          {errors.bankName && (
            <p className="text-[10px] text-rose-500 font-medium">
              {errors.bankName.message}
            </p>
          )}
        </div>

        {/* IBAN */}
        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500 flex items-center gap-2">
            <CreditCardIcon className="w-3.5 h-3.5" weight="duotone" />
            Numéro IBAN
          </label>
          <Input
            {...register("bankIBAN")}
            placeholder="Ex: CI93 0011 1234 5678 9012 3456 7890"
            className={cn(
              "h-11 bg-slate-50 border-slate-200 text-[12px] font-mono font-bold text-slate-900 rounded-xl focus:bg-white focus:border-indigo-400 transition-all uppercase",
              errors.bankIBAN && "border-rose-400 focus:border-rose-500",
            )}
            onChange={(e) => {
              // Formatage automatique: groupe par 4 caractères
              const val = e.target.value
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, "");
              const formatted = val.match(/.{1,4}/g)?.join(" ") || val;
              e.target.value = formatted.slice(0, 35); // Max IBAN length
            }}
          />
          {errors.bankIBAN && (
            <p className="text-[10px] text-rose-500 font-medium">
              {errors.bankIBAN.message}
            </p>
          )}
          <p className="text-[9px] text-slate-400">
            Format international: 2 lettres pays + 2 chiffres de contrôle +
            numéro de compte
          </p>
        </div>

        {/* SWIFT/BIC */}
        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500 flex items-center gap-2">
            <BankIcon className="w-3.5 h-3.5" weight="duotone" />
            Code SWIFT / BIC
          </label>
          <Input
            {...register("bankSWIFT")}
            placeholder="Ex: SOGECIAB"
            className={cn(
              "h-11 bg-slate-50 border-slate-200 text-[12px] font-mono font-bold text-slate-900 rounded-xl focus:bg-white focus:border-indigo-400 transition-all uppercase",
              errors.bankSWIFT && "border-rose-400 focus:border-rose-500",
            )}
            maxLength={11}
          />
          {errors.bankSWIFT && (
            <p className="text-[10px] text-rose-500 font-medium">
              {errors.bankSWIFT.message}
            </p>
          )}
          <p className="text-[9px] text-slate-400">
            Code identifiant international de votre banque (8 ou 11 caractères)
          </p>
        </div>

        {/* BIC (optionnel, redondant avec SWIFT souvent) */}
        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500 flex items-center gap-2">
            <BuildingsIcon className="w-3.5 h-3.5" weight="duotone" />
            Code BIC (optionnel)
          </label>
          <Input
            {...register("bankBIC")}
            placeholder="Ex: 00111"
            className={cn(
              "h-11 bg-slate-50 border-slate-200 text-[12px] font-mono font-bold text-slate-900 rounded-xl focus:bg-white focus:border-indigo-400 transition-all",
              errors.bankBIC && "border-rose-400 focus:border-rose-500",
            )}
          />
          {errors.bankBIC && (
            <p className="text-[10px] text-rose-500 font-medium">
              {errors.bankBIC.message}
            </p>
          )}
          <p className="text-[9px] text-slate-400">
            Code BIC national (si différent du SWIFT)
          </p>
        </div>
      </div>

      {/* Info box */}
      <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4">
        <p className="text-[10px] text-amber-800 leading-relaxed">
          <strong>Note importante :</strong> Les coordonnées bancaires sont
          figées au moment de la création du devis. Si vous modifiez ces
          informations, les devis déjà créés conserveront les anciennes
          coordonnées pour des raisons de traçabilité.
        </p>
      </div>
    </section>
  );
}
