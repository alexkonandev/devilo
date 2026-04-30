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
function SpatialInput({
  name,
  label,
  type = "text",
  placeholder,
  required,
  icon,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors [&>svg]:w-3.5 [&>svg]:h-3.5">
            {icon}
          </div>
        )}
        <input
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-400 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all"
        />
      </div>
    </div>
  );
}

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
        taxId: (formData.get("siret") as string) || "", // Maps to taxId in backend
      });

      if (res.success) {
        toast.success("Client créé avec succès");
        setOpen(false);
      } else {
        toast.error("Erreur", { description: res.error });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-sm shadow-indigo-600/20">
          <Plus size={13} weight="bold" />
          Nouveau client
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-[440px] p-0 overflow-hidden bg-white border border-slate-200/60 rounded-xl shadow-xl">
        {/* HEADER */}
        <DialogHeader className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center border border-indigo-200/60">
              <UserPlus size={15} weight="duotone" />
            </div>
            <div>
              <DialogTitle className="text-sm font-black text-slate-900 tracking-tight">
                Nouveau Client
              </DialogTitle>
              <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                Nouvelle fiche partenaire
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          <SpatialInput
            name="name"
            label="Nom / Raison Sociale"
            required
            placeholder="Ex: Acme Corp"
            icon={<IdentificationCard />}
          />

          <div className="grid grid-cols-2 gap-3">
            <SpatialInput
              name="email"
              label="Email"
              type="email"
              placeholder="contact@acme.com"
              icon={<Envelope />}
            />
            <SpatialInput
              name="phone"
              label="Téléphone"
              placeholder="+33 6..."
              icon={<Phone />}
            />
          </div>

          <SpatialInput
            name="siret"
            label="Identifiant Fiscal / SIRET"
            placeholder="000 000 000"
            icon={<Hash />}
          />

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
              Adresse
            </label>
            <div className="relative group">
              <div className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-indigo-400 transition-colors">
                <MapPin size={13} />
              </div>
              <textarea
                name="address"
                rows={2}
                className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-400 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all resize-none"
                placeholder="Adresse complète..."
              />
            </div>
          </div>

          {/* FOOTER */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isPending ? "Création..." : "Enregistrer le client"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
