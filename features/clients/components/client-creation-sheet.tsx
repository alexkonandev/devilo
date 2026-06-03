"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { clientSchema } from "@/lib/validations/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { upsertClient } from "@/actions/client-action";
import { notify } from "@/lib/notifications";
import { cn } from "@/lib/utils";
import {
  DS_MICRO,
  DS_LABEL,
  DS_MONO,
  DS_INPUT,
  DS_BUTTON,
  DS_BUTTON_SECONDARY,
  DS_BENTO_CARD,
  DS_SECTION_TITLE,
  DS_GAP_SECTIONS,
} from "@/lib/design-system";
import {
  UserPlus,
  IdentificationBadge,
  EnvelopeSimple,
  Phone,
  MapPin,
  Spinner,
} from "@phosphor-icons/react";

// ─── Schéma de création dérivé du clientSchema existant ──────────────────────
// On ne garde que name, email, phone — et on retire .optional() sur name
// pour le rendre obligatoire en création.

// Dérivé du clientSchema existant (email, phone, address) avec name rendu
// strictement obligatoire en création (le schéma de base le traite comme optional() ou "").
const creationSchema = clientSchema
  .pick({ email: true, phone: true, address: true })
  .extend({
    name: z.string().min(1, "Le nom du client est obligatoire"),
  });

type CreationFormValues = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface ClientCreationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function ClientCreationSheet({
  open,
  onOpenChange,
  onSuccess,
}: ClientCreationSheetProps) {
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreationFormValues>({
    resolver: zodResolver(creationSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  const onSubmit = async (data: CreationFormValues) => {
    setIsSaving(true);
    try {
      // S'assurer qu'aucun null n'est envoyé — utiliser ?? ""
      const payload = {
        name: data.name ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        address: data.address ?? "",
      };

      const res = await upsertClient(payload);

      if (res.success) {
        notify.success("Client créé", "Le client a été ajouté avec succès");
        reset();
        onOpenChange(false);
        onSuccess?.();
      } else {
        notify.error("Erreur", res.error ?? "Échec de la création");
      }
    } catch {
      notify.error("Erreur", "Impossible de créer le client");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
    }
    onOpenChange(open);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-sm p-0 flex flex-col">
        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <SheetHeader className="px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center border border-indigo-200/60">
              <UserPlus size={15} weight="duotone" />
            </div>
            <div>
              <SheetTitle className="text-sm font-black text-slate-900 tracking-tight">
                Nouveau Client
              </SheetTitle>
              <SheetDescription className="text-[9px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                Création rapide
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* ── FORM ───────────────────────────────────────────────────────── */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 flex flex-col overflow-y-auto"
        >
          <div className={cn("flex-1 px-5 py-4", DS_GAP_SECTIONS)}>
            {/* ── Section Identité ──────────────────────────────────────── */}
            <div>
              <p className={cn(DS_SECTION_TITLE, "mb-3")}>Identité</p>
              <div>
                <label className={cn(DS_LABEL, "mb-1 block")}>
                  Nom / Raison sociale <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <IdentificationBadge
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    {...register("name")}
                    placeholder="Ex: Acme Corporation"
                    className={cn(
                      DS_INPUT,
                      "w-full pl-9 pr-3 py-2 text-sm rounded-lg",
                      errors.name && "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                    )}
                    autoFocus
                  />
                </div>
                {errors.name && (
                  <p className="text-[10px] text-rose-500 mt-1 font-mono">
                    {errors.name.message}
                  </p>
                )}
              </div>
            </div>

            {/* ── Section Contact ───────────────────────────────────────── */}
            <div>
              <p className={cn(DS_SECTION_TITLE, "mb-3")}>Contact</p>
              <div className="space-y-3">
                {/* Email */}
                <div>
                  <label className={cn(DS_LABEL, "mb-1 block")}>Email</label>
                  <div className="relative">
                    <EnvelopeSimple
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      {...register("email")}
                      type="email"
                      placeholder="client@exemple.com"
                      className={cn(
                        DS_INPUT,
                        "w-full pl-9 pr-3 py-2 text-sm rounded-lg",
                        errors.email && "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                      )}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[10px] text-rose-500 mt-1 font-mono">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Téléphone */}
                <div>
                  <label className={cn(DS_LABEL, "mb-1 block")}>Téléphone</label>
                  <div className="relative">
                    <Phone
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      {...register("phone")}
                      type="tel"
                      placeholder="+225 01 23 45 67"
                      className={cn(
                        DS_INPUT,
                        "w-full pl-9 pr-3 py-2 text-sm rounded-lg",
                        errors.phone && "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                      )}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-[10px] text-rose-500 mt-1 font-mono">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Section Adresse ────────────────────────────────────────── */}
            <div>
              <p className={cn(DS_SECTION_TITLE, "mb-3")}>Adresse</p>
              <div>
                <label className={cn(DS_LABEL, "mb-1 block")}>Adresse</label>
                <div className="relative">
                  <MapPin
                    size={14}
                    className="absolute left-3 top-3 text-slate-400"
                  />
                  <textarea
                    {...register("address")}
                    rows={3}
                    placeholder="Rue, ville, code postal…"
                    className={cn(
                      DS_INPUT,
                      "w-full pl-9 pr-3 py-2 text-sm rounded-lg resize-none",
                      errors.address && "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
                    )}
                  />
                </div>
                {errors.address && (
                  <p className="text-[10px] text-rose-500 mt-1 font-mono">
                    {errors.address.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── FOOTER ───────────────────────────────────────────────────── */}
          <SheetFooter className="px-5 py-4 border-t border-slate-100 shrink-0">
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                className={cn(
                  DS_BUTTON_SECONDARY,
                  "text-[10px] px-4 py-2 rounded-lg"
                )}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className={cn(
                  DS_BUTTON,
                  "min-w-[100px] justify-center text-[10px] rounded-lg"
                )}
              >
                {isSaving ? (
                  <Spinner size={14} className="animate-spin" />
                ) : (
                  <>
                    <UserPlus size={12} weight="bold" />
                    Créer
                  </>
                )}
              </button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}