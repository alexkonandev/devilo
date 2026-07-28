"use client";

import React, { useCallback, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { UploadSimple, XIcon, SpinnerIcon } from "@phosphor-icons/react";
import { uploadFiles } from "@/lib/uploadthing";
import { updateCompanyLogo } from "@/actions/logo-action";
import type { UseFormSetValue } from "react-hook-form";
import type { SettingsFormValues } from "@/lib/validations/settings";
import { DS_LABEL, DS_ROUNDED } from "@/lib/design-system";

// ═══════════════════════════════════════════════════════════════════════════════
// LogoUploadField — Zone cliquable carrée, upload invisible, croix rouge de retrait
// + panneau d'infos à droite (taille max, remplacer, supprimer)
// ═══════════════════════════════════════════════════════════════════════════════

interface LogoUploadFieldProps {
  value: string;
  setValue: UseFormSetValue<SettingsFormValues>;
  label?: string;
}

export function LogoUploadField({
  value,
  setValue,
  label = "Logo",
}: LogoUploadFieldProps) {
  const [uploading, setUploading] = useState(false);

  const triggerUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.display = "none";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) { input.remove(); return; }
      setUploading(true);
      try {
        const res = await uploadFiles("companyLogo", { files: [file] });
        if (res?.[0]?.url) {
          setValue("companyLogo", res[0].url);
          updateCompanyLogo(res[0].url);
        }
      } catch (error) {
        console.error("[UPLOAD_ERROR]:", error);
      } finally {
        setUploading(false);
        input.remove();
      }
    };
    document.body.appendChild(input);
    input.click();
  }, [setValue]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setValue("companyLogo", "");
    updateCompanyLogo("");
  }, [setValue]);

  return (
    <div>
      <label className={cn(DS_LABEL, "block mb-0.5")}>{label}</label>
      <div className="flex gap-3 items-center">
        {/* Carré logo */}
        <button
          type="button"
          onClick={triggerUpload}
          disabled={uploading}
          className={cn(
            "relative shrink-0 w-full max-w-[100px] aspect-square rounded-md border-2 border-dashed transition-all duration-200",
            value
              ? "border-slate-200 bg-slate-50 hover:border-slate-300"
              : "border-slate-300 bg-slate-50/50 hover:border-indigo-400 hover:bg-indigo-50/40",
            uploading && "opacity-60 cursor-wait",
          )}
        >
          {uploading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <SpinnerIcon size={16} className="animate-spin text-slate-400" />
            </div>
          ) : value ? (
            <>
              <Image
                src={value}
                alt="Logo"
                fill
                className="object-contain p-1"
                sizes="100px"
              />
              {/* Croix rouge de retrait */}
              <span
                onClick={handleRemove}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors z-10"
              >
                <XIcon size={8} weight="bold" />
              </span>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
              <UploadSimple size={16} className="text-slate-400" />
              <span className="text-[8px] font-sans font-medium text-slate-400 leading-tight">Ajouter</span>
            </div>
          )}
        </button>

        {/* Panneau d'infos — visible uniquement quand un logo est présent */}
        {value && (
            <div className="flex-1 min-w-0 space-y-3">
            {/* Format & taille max */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-sans text-slate-500 leading-tight">
                PNG / JPG · Max 2 Mo
              </span>
            </div>
            {/* Boutons d'action */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={triggerUpload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-sans font-semibold transition-all"
              >
                <UploadSimple size={11} />
                Remplacer
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-600 text-[11px] font-sans font-semibold transition-all"
              >
                <XIcon size={11} />
                Supprimer
              </button>
            </div>
          </div>
        )}
      </div>
      {value && (
        <p className="mt-0.5 text-[7px] text-slate-400">Cliquez sur le logo pour remplacer</p>
      )}
    </div>
  );
}