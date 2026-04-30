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
  Envelope,
  Phone,
  MapPin,
  IdentificationCard,
  Hash,
  PencilSimple,
} from "@phosphor-icons/react";
import { upsertClient } from "@/actions/client-action";
import { toast } from "sonner";
import { ClientListItem } from "@/types/client";
function SpatialInput({
  name,
  label,
  type = "text",
  placeholder,
  required,
  defaultValue,
  icon,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
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
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-400 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all"
        />
      </div>
    </div>
  );
}

interface EditClientDialogProps {
  client: ClientListItem;
  trigger: React.ReactNode;
}

export function EditClientDialog({ client, trigger }: EditClientDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await upsertClient({
        id: client.id,
        name: formData.get("name") as string,
        email: (formData.get("email") as string) || "",
        address: (formData.get("address") as string) || "",
        taxId: (formData.get("taxId") as string) || "",
      });

      if (res.success) {
        toast.success("Dossier mis à jour");
        setOpen(false);
      } else {
        toast.error("Erreur de mise à jour", {
          description: res.error,
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="max-w-[440px] p-0 overflow-hidden bg-white border border-slate-200/60 rounded-xl shadow-xl">
        {/* HEADER */}
        <DialogHeader className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center border border-indigo-200/60">
              <PencilSimple size={15} weight="duotone" />
            </div>
            <div>
              <DialogTitle className="text-sm font-black text-slate-900 tracking-tight">
                Édition Dossier
              </DialogTitle>
              <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                ID: {client.id.slice(0, 8)}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3">
          <SpatialInput
            name="name"
            label="Nom / Raison Sociale"
            defaultValue={client.name}
            required
            placeholder="Ex: Acme Corp"
            icon={<IdentificationCard />}
          />

          <div className="grid grid-cols-2 gap-3">
            <SpatialInput
              name="email"
              label="Email"
              type="email"
              defaultValue={client.email || ""}
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
            name="taxId"
            label="Identifiant Fiscal"
            defaultValue={client.taxId || ""}
            placeholder="RCCM / IFU"
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
                defaultValue={client.address || ""}
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
              {isPending ? "Sauvegarde..." : "Mettre à jour"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
