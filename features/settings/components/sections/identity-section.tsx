"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { UseFormReturn, useWatch } from "react-hook-form";
import { SettingsFormValues } from "@/lib/validations/settings";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "sonner";
import {
  ChevronDown,
  ShieldCheck,
  Upload,
  X,
  Check,
  Loader2,
  ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function IdentitySection({
  form,
  initialLogo,
}: {
  form: UseFormReturn<SettingsFormValues>;
  initialLogo?: string | null;
}) {
  const selectedType = useWatch({ control: form.control, name: "taxIdLabel" });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialLogo || null,
  );

  const { startUpload, isUploading } = useUploadThing("companyLogo", {
    onClientUploadComplete: () => {
      toast.success("LOGO ACTUALISÉ", {
        className:
          "rounded-none border-slate-200 bg-white font-bold text-[11px] text-slate-900",
      });
      setSelectedFile(null);
      setTimeout(() => window.location.reload(), 800);
    },
    onUploadError: (e) => {
      toast.error(`ERREUR : ${e.message.toUpperCase()}`);
    },
  });

  useEffect(() => {
    if (
      selectedType === "RCCM" &&
      !form.getValues("taxId")?.startsWith("CI-")
    ) {
      form.setValue("taxId", "CI-");
    }
    form.clearErrors("taxId");
  }, [selectedType, form]);

  const handleTaxIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, "");
    if (selectedType === "NCC") {
      form.setValue(
        "taxId",
        val.slice(0, 7).replace(/[^0-9]/g, "") +
          val.slice(7, 8).replace(/[^A-Z]/g, ""),
        { shouldValidate: true },
      );
    } else if (selectedType === "RCCM") {
      if (!val.startsWith("CI")) val = "CI" + val;
      const parts = [
        val.slice(0, 2),
        val.slice(2, 5),
        val.slice(5, 9),
        val.slice(9, 10),
        val.slice(10, 15),
      ];
      form.setValue("taxId", parts.filter(Boolean).join("-"), {
        shouldValidate: true,
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 2 * 1024 * 1024) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else if (file) {
      toast.error("MAX 2MO AUTORISÉ");
    }
  };

  return (
    <section className="space-y-12">
      <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600">
          01. Identité Officielle
        </h2>
        <div className="h-px flex-1 bg-slate-50" />
      </div>

      <div className="grid grid-cols-12 gap-12">
        {/* COLONNE LOGO RÉDUITE : On passe à col-span-3 et on limite la largeur */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <div className="space-y-1">
            <label className="text-[12px] font-semibold text-slate-700 uppercase tracking-tight">
              Logo de Marque
            </label>
          </div>

          <div className="flex flex-col gap-4">
            {/* Conteneur bridé à 200px pour éviter l'effet "bloc géant" */}
            <div
              className={cn(
                "relative w-full max-w-[200px] aspect-square border border-slate-200 flex items-center justify-center transition-all bg-white",
                selectedFile && "border-indigo-600",
              )}
            >
              {previewUrl ? (
                <div className="relative w-full h-full p-4">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <ImageIcon className="w-6 h-6 text-slate-200" />
              )}

              {isUploading && (
                <div className="absolute inset-0 bg-white/95 flex items-center justify-center z-10">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                </div>
              )}
            </div>

            <div className="max-w-[200px] flex flex-col gap-2">
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileSelect}
              />

              {!selectedFile ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-none border-slate-200 text-[10px] font-bold uppercase h-8 hover:border-slate-900 transition-all"
                >
                  <Upload className="w-3 h-3 mr-2" /> Modifier
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    onClick={() => startUpload([selectedFile])}
                    className="bg-indigo-600 text-white rounded-none text-[10px] font-bold uppercase h-8"
                  >
                    <Check className="w-3 h-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(initialLogo ?? null);
                    }}
                    className="rounded-none border-slate-200 text-[10px] font-bold uppercase h-8"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COLONNE DATA ÉLARGIE : col-span-9 */}
        <div className="col-span-12 lg:col-span-9 space-y-8">
          <div className="space-y-2">
            <label className="text-[12px] font-semibold text-slate-700 uppercase tracking-tight">
              Raison Sociale
            </label>
            <Input
              {...form.register("companyName")}
              className="rounded-none border-slate-200 bg-white text-[14px] font-medium h-12 focus-visible:border-indigo-600 focus-visible:ring-0 shadow-none transition-colors"
              placeholder="Ex: Ivoire Consulting Group"
            />
          </div>

          <div className="border border-slate-200 p-8 space-y-8 bg-white">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span className="text-[11px] font-black uppercase text-slate-900 tracking-wider">
                Certification Fiscale
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase">
                  Registre
                </label>
                <div className="relative">
                  <select
                    {...form.register("taxIdLabel")}
                    className="w-full h-11 border border-slate-200 bg-white px-4 text-[13px] font-bold uppercase outline-none focus:border-indigo-600 rounded-none appearance-none cursor-pointer"
                    defaultValue=""
                  >
                    <option value="" disabled className="text-slate-400">
                      Choisir un registre...
                    </option>
                    <option value="NCC">NCC (Compte Contribuable)</option>
                    <option value="RCCM">RCCM (Registre du Commerce)</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase">
                  Numéro
                </label>
                <Input
                  {...form.register("taxId")}
                  onChange={handleTaxIdChange}
                  value={form.watch("taxId") || ""}
                  className="rounded-none border-slate-200 font-mono text-[13px] font-medium h-11 bg-white focus-visible:border-indigo-600 focus-visible:ring-0 tracking-wider"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-[10px]">
              <span className="font-bold text-slate-400 uppercase italic tracking-tight">
                Format attendu :
              </span>
              <span className="font-mono text-indigo-600">
                {selectedType === "NCC" ? "0000000X" : "CI-XXX-0000-X-00000"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
