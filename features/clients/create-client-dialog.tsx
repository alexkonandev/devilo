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
import { SpatialInput } from "@/features/settings/components/spatial-input"; // Using standard spatial input if possible, or style similar

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
        <button className="group flex items-center gap-2.5 px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/40">
            <Plus size={16} weight="bold" />
            Ajouter un client
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-[480px] p-0 overflow-hidden bg-[#0A0E1A]/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl text-white">
        
        {/* HEADER */}
        <DialogHeader className="p-6 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <UserPlus size={20} weight="fill" />
              </div>
              <div>
                <DialogTitle className="text-sm font-black uppercase tracking-widest text-white">
                  Nouveau Client
                </DialogTitle>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                  Création d'une nouvelle fiche partenaire
                </div>
              </div>
          </div>
        </DialogHeader>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
           
           <SpatialInput 
                name="name" 
                label="Nom / Raison Sociale" 
                required 
                placeholder="Ex: Acme Corp"
                icon={<IdentificationCard />}
           />

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

           <div className="space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 ml-1">Adresse</label>
              <div className="relative group">
                  <div className="absolute left-3 top-3 text-slate-400 group-focus-within:text-indigo-400 transition-colors">
                      <MapPin size={16} />
                  </div>
                  <textarea 
                      name="address"
                      rows={3}
                      className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all resize-none"
                      placeholder="Adresse complète..."
                  />
              </div>
           </div>

           {/* FOOTER ACTIONS */}
           <div className="pt-2 flex flex-col gap-3">
              <button 
                  type="submit" 
                  disabled={isPending}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/20"
              >
                  {isPending ? "Création..." : "Enregistrer le client"}
              </button>
           </div>

        </form>

      </DialogContent>
    </Dialog>
  );
}
