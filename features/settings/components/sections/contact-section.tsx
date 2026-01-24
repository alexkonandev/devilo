"use client";

import { UseFormReturn } from "react-hook-form";
import { SettingsFormValues } from "@/lib/validations/settings";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, Globe, MapPin } from "lucide-react";

interface SectionProps {
  form: UseFormReturn<SettingsFormValues>;
}

export function ContactSection({ form }: SectionProps) {
  const {
    register,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = form;

  const phoneValue = watch("companyPhone");

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 10);
    if (raw.length > 0 && raw[0] !== "0") raw = "";
    if (raw.length >= 2) {
      const prefix = raw.slice(0, 2);
      if (!["01", "05", "07"].includes(prefix)) raw = raw.slice(0, 1);
    }
    const formatted = raw.match(/.{1,2}/g)?.join(" ") || raw;
    setValue("companyPhone", formatted, { shouldValidate: true });
  };

  const handleDigitalClean = (
    name: keyof SettingsFormValues,
    value: string
  ) => {
    const clean = value.toLowerCase().replace(/\s/g, "");
    setValue(name, clean as any);
  };

  return (
    <section className="space-y-12">
      {/* HEADER : LIGNE FINE & REPÈRE TECHNIQUE */}
      <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600">
          02. Coordonnées & Localisation
        </h2>
        <div className="h-px flex-1 bg-slate-50" />
      </div>

      <div className="grid grid-cols-12 gap-12">
        {/* COLONNE GAUCHE : FLUX DIGITAL */}
        <div className="col-span-12 lg:col-span-6 space-y-8">
          {/* EMAIL */}
          <div className="space-y-2">
            <label className="text-[12px] font-semibold text-slate-700 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Officiel
            </label>
            <Input
              {...register("companyEmail")}
              onBlur={() => trigger("companyEmail")}
              onChange={(e) =>
                handleDigitalClean("companyEmail", e.target.value)
              }
              className="rounded-none border-slate-200 font-mono text-[13px] h-11 focus-visible:border-indigo-600 focus-visible:ring-0 shadow-none transition-colors"
              placeholder="contact@entreprise.ci"
            />
            {errors.companyEmail && (
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight">
                Format invalide
              </p>
            )}
          </div>

          {/* TÉLÉPHONE */}
          <div className="space-y-2">
            <label className="text-[12px] font-semibold text-slate-700 flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400" /> Mobile (+225)
            </label>
            <Input
              {...register("companyPhone")}
              onChange={handlePhoneChange}
              value={phoneValue || ""}
              className="rounded-none border-slate-200 font-mono text-[14px] font-bold h-11 focus-visible:border-indigo-600 focus-visible:ring-0 shadow-none tabular-nums"
              placeholder="07 00 00 00 00"
            />
          </div>

          {/* SITE WEB */}
          <div className="space-y-2">
            <label className="text-[12px] font-semibold text-slate-700 flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-slate-400" /> Site Internet
            </label>
            <Input
              {...register("companyWebsite")}
              onBlur={() => trigger("companyWebsite")}
              onChange={(e) =>
                handleDigitalClean("companyWebsite", e.target.value)
              }
              className="rounded-none border-slate-200 font-mono text-[13px] h-11 focus-visible:border-indigo-600 focus-visible:ring-0 shadow-none"
              placeholder="www.entreprise.ci"
            />
          </div>
        </div>

        {/* COLONNE DROITE : ADRESSE PHYSIQUE */}
        <div className="col-span-12 lg:col-span-6 space-y-6">
          <div className="border border-slate-200 p-6 bg-white space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">
                Siège Social
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  Ville
                </label>
                <Input
                  {...register("companyCity")}
                  className="rounded-none border-slate-200 text-[13px] h-10 uppercase focus-visible:border-indigo-600"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase">
                  Commune
                </label>
                <Input
                  {...register("companyDistrict")}
                  className="rounded-none border-slate-200 text-[13px] h-10 uppercase focus-visible:border-indigo-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                Quartier / Zone
              </label>
              <Input
                {...register("companyArea")}
                className="rounded-none border-slate-200 text-[13px] h-10 uppercase focus-visible:border-indigo-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">
                Détails de localisation
              </label>
              <Textarea
                {...register("companyAddressDetails")}
                className="min-h-[80px] rounded-none border-slate-200 text-[13px] p-3 leading-snug resize-none focus-visible:border-indigo-600 uppercase"
                placeholder="IMMEUBLE, PORTE, REPERES..."
              />
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 border-l border-indigo-600 bg-indigo-50/30">
            <p className="text-[10px] font-medium text-indigo-900 leading-tight">
              L&apos;adresse sera mentionnée sur tous vos documents légaux
              conformément aux normes OHADA.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
