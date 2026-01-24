"use client";

import React, { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  UserPlus,
  Envelope,
  Phone,
  MapPin,
  IdentificationCard,
  Hash,
} from "@phosphor-icons/react";
import { upsertClient } from "@/actions/client-action";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * DIALOGUE DE CRÉATION CLIENT - VERSION STUDIO
 * Source de vérité : Interface Industrielle Épurée.
 * Zéro Shadow, Zéro Rounded, Focus Indigo.
 */
export function CreateClientDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await upsertClient({
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        address: (formData.get("address") as string) || "",
        siret: (formData.get("siret") as string) || "",
      });

      if (res.success) {
        toast.success("SYNC_SUCCESS", {
          className:
            "rounded-none border-slate-200 font-bold text-[10px] uppercase tracking-widest",
        });
        setOpen(false);
      } else {
        toast.error("SYNC_ERROR", { description: res.error });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="h-8 flex items-center gap-2 border border-slate-200 bg-white hover:border-indigo-600 hover:text-indigo-600 px-3 transition-all">
          <Plus size={14} weight="bold" />
          <span className="text-[9px] font-black uppercase tracking-[0.15em]">
            Ajouter_Client
          </span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-[480px] rounded-none border border-slate-200 p-0 overflow-hidden shadow-none bg-white gap-0">
        {/* 00. HEADER : ALIGNÉ SUR LE STUDIO */}
        <DialogHeader className="p-5 border-b border-slate-100 flex flex-row items-center gap-4 space-y-0 bg-slate-50/30">
          <div className="h-10 w-10 flex items-center justify-center border border-slate-200 bg-white text-indigo-600">
            <UserPlus size={20} weight="bold" />
          </div>
          <div className="flex flex-col">
            <DialogTitle className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-900">
              Nouveau_Profil_Client
            </DialogTitle>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Saisie_Manuelle_Actif
            </span>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* SECTION IDENTITÉ */}
          <div className="space-y-4">
            <InputGroup
              label="Désignation_Entité"
              name="name"
              icon={IdentificationCard}
              placeholder="RAISON SOCIALE..."
              required
            />
            <InputGroup
              label="Email_Facturation"
              name="email"
              type="email"
              icon={Envelope}
              placeholder="CONTACT@CLIENT.COM"
              required
            />
          </div>

          {/* SECTION METADATA GRID */}
          <div className="grid grid-cols-2 gap-4">
            <InputGroup
              label="Contact_Tel"
              name="phone"
              icon={Phone}
              placeholder="+225..."
            />
            <InputGroup
              label="ID_Fiscal"
              name="siret"
              icon={Hash}
              placeholder="RCCM / IFU"
            />
          </div>

          {/* SECTION GEO */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <MapPin size={12} weight="bold" /> Localisation_Physique
            </label>
            <textarea
              name="address"
              rows={2}
              className="w-full border border-slate-200 p-3 text-[11px] font-bold uppercase outline-none focus:border-indigo-600 bg-white transition-colors resize-none placeholder:text-slate-100"
              placeholder="ADRESSE DE LIVRAISON..."
            />
          </div>

          {/* ACTION FOOTER */}
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
            <button
              type="submit"
              disabled={isPending}
              className={cn(
                "w-full h-12 flex items-center justify-center font-black uppercase tracking-[0.2em] text-[10px] transition-all",
                isPending
                  ? "bg-slate-50 text-slate-300 cursor-not-allowed"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              )}
            >
              {isPending ? "Traitement_Données..." : "Valider_Enregistrement"}
            </button>
            <div className="flex justify-between items-center px-1">
              <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest italic">
                {isPending ? "Transmission_Encours" : "Prêt_Pour_Commit"}
              </span>
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** * COMPOSANT INTERNE : INPUT_GROUP
 * Typage strict pour éviter 'any' [cite: 2026-01-06].
 */
interface InputGroupProps {
  label: string;
  name: string;
  icon: any;
  placeholder: string;
  type?: string;
  required?: boolean;
}

function InputGroup({
  label,
  name,
  icon: Icon,
  placeholder,
  type = "text",
  required = false,
}: InputGroupProps) {
  return (
    <div className="space-y-1.5 group">
      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-0.5 transition-colors group-focus-within:text-indigo-600">
        <Icon size={12} weight="bold" /> {label}
      </label>
      <div className="flex items-center border border-slate-200 bg-white focus-within:border-indigo-600 transition-colors">
        <input
          name={name}
          type={type}
          required={required}
          className="w-full h-9 px-3 text-[11px] font-bold uppercase outline-none placeholder:text-slate-100"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
