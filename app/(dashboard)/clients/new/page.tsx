"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ArrowLeftIcon,
  UserPlusIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { upsertClient } from "@/actions/client-action";
import { toast } from "sonner";

// ═══════════════════════════════════════════════════════════════════════════════
// DESIGN SYSTEM TOKENS
// ═══════════════════════════════════════════════════════════════════════════════

import {
  DS_MICRO,
  DS_LABEL,
  DS_MONO,
  DS_CARD,
  DS_INPUT,
  DS_BUTTON,
  DS_BENTO_CARD,
  DS_SECTION_HEADER,
  DS_ICON_WRAPPER,
  DS_ICON_SM,
  DS_ICON_XS,
  DS_GAP_GRID,
  DS_GAP_ITEMS,
  DS_PAGE_SHELL,
  DS_PAGE_PADDING,
  DS_PAGE_CONTAINER,
} from "@/lib/design-system";

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ═══════════════════════════════════════════════════════════════════════════════
// SCHEMA
// ═══════════════════════════════════════════════════════════════════════════════

const clientSchema = z.object({
  name: z.string().min(2, "Nom trop court"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  taxId: z.string().optional().or(z.literal("")),
});

type ClientFormData = z.infer<typeof clientSchema>;

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function NewClientPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      email: "",
      address: "",
      taxId: "",
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    setIsSaving(true);

    try {
      const res = await upsertClient(data);
      if (res.success) {
        toast.success("Client créé avec succès");
        router.push(`/clients?id=${res.data?.id || ""}`);
      } else {
        toast.error("Erreur", { description: res.error });
      }
    } catch {
      toast.error("Erreur de création");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={cn(DS_PAGE_SHELL, DS_PAGE_PADDING)}>
      <div className={cn(DS_PAGE_CONTAINER, "max-w-2xl")}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
          className={cn(DS_SECTION_HEADER, "mb-6")}
        >
          <button
            onClick={() => router.push("/clients")}
            className={cn(
              DS_BUTTON,
              "bg-slate-100 text-slate-700 hover:bg-slate-200"
            )}
          >
            <ArrowLeftIcon size={DS_ICON_SM} weight="bold" />
            Retour
          </button>
          <h1 className="text-base font-bold text-slate-900">
            Nouveau Client
          </h1>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3, ease: EASE_OUT_EXPO }}
          className={DS_BENTO_CARD}
        >
          <form onSubmit={handleSubmit(onSubmit)} className={DS_GAP_GRID}>
            {/* Section: Identité */}
            <div className="col-span-2">
              <p className={cn(DS_MICRO, "text-slate-400 mb-3")}>Identité</p>
              <div className={DS_GAP_ITEMS}>
                <div>
                  <label className={cn(DS_LABEL, "mb-1 block")}>
                    Nom / Raison sociale *
                  </label>
                  <input
                    {...register("name")}
                    placeholder="Ex: ACME Corporation"
                    className={cn(DS_INPUT, "w-full py-2 px-3 rounded text-sm")}
                  />
                  {errors.name && (
                    <p className="text-[10px] text-rose-500 mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section: Contact */}
            <div className="col-span-2">
              <p className={cn(DS_MICRO, "text-slate-400 mb-3")}>Contact</p>
              <div className={cn("grid grid-cols-2", DS_GAP_GRID)}>
                <div>
                  <label className={cn(DS_LABEL, "mb-1 block")}>Email</label>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="client@exemple.com"
                    className={cn(DS_INPUT, "w-full py-2 px-3 rounded text-sm")}
                  />
                </div>
                <div>
                  <label className={cn(DS_LABEL, "mb-1 block")}>
                    ID Fiscal
                  </label>
                  <input
                    {...register("taxId")}
                    placeholder="RCCM, SIRET..."
                    className={cn(
                      DS_INPUT,
                      DS_MONO,
                      "w-full py-2 px-3 rounded text-sm"
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Section: Adresse */}
            <div className="col-span-2">
              <p className={cn(DS_MICRO, "text-slate-400 mb-3")}>Adresse</p>
              <textarea
                {...register("address")}
                rows={3}
                placeholder="Adresse complète..."
                className={cn(
                  DS_INPUT,
                  "w-full py-2 px-3 rounded text-sm resize-none"
                )}
              />
            </div>

            {/* Actions */}
            <div className="col-span-2 flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => router.push("/clients")}
                className={cn(
                  DS_BUTTON,
                  "bg-slate-100 text-slate-700 hover:bg-slate-200"
                )}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className={cn(DS_BUTTON, "min-w-[120px] justify-center")}
              >
                {isSaving ? (
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlusIcon size={DS_ICON_SM} weight="bold" />
                    Créer
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={cn(
            DS_CARD,
            "mt-4 p-3 flex items-start gap-3 rounded-lg border border-slate-200/60"
          )}
        >
          <div className={cn(DS_ICON_WRAPPER, "bg-indigo-50 mt-0.5")}>
            <CheckCircleIcon size={12} className="text-indigo-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-700">
              Création rapide
            </p>
            <p className={cn(DS_LABEL, "text-slate-500 mt-0.5")}>
              Le client sera automatiquement ajouté à votre carnet et pourra
              être sélectionné lors de la création de devis.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
