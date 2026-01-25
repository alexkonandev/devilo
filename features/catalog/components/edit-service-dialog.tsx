"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CatalogService } from "@/types/catalog";
import { updateServiceAction } from "@/actions/catalog-action";
import { PencilSimple, CurrencyDollar, Check } from "@phosphor-icons/react";
import { notify } from "@/lib/notifications";

// Import du widget d'intelligence financière
import { MarginCalculator } from "./margin-calculator";

interface EditServiceDialogProps {
  service: CatalogService;
  trigger?: React.ReactNode;
}

export function EditServiceDialog({
  service,
  trigger,
}: EditServiceDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // État local du formulaire
  const [formData, setFormData] = useState({
    title: service.title,
    subtitle: service.subtitle,
    unitPrice: service.unitPrice,
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await updateServiceAction(service.id, {
        title: formData.title,
        subtitle: formData.subtitle,
        unitPrice: formData.unitPrice,
      });

      if (result.success) {
        notify.success("MISE_A_JOUR_REUSSIE", "L'actif a été optimisé.");
        setOpen(false);
      } else {
        notify.error("ERREUR_UPDATE", result.error || "Échec de la mutation.");
      }
    } catch (error) {
      notify.error("CRITICAL_ERROR", "Action interrompue.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <button className="p-1.5 bg-slate-50 hover:bg-slate-900 hover:text-white transition-colors">
            <PencilSimple size={14} weight="bold" />
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] rounded-none border-2 border-slate-900 bg-white p-0 overflow-hidden shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
        <DialogHeader className="p-6 bg-slate-900 text-white">
          <DialogTitle className="text-[14px] font-black uppercase tracking-widest flex items-center gap-2">
            <PencilSimple size={18} />
            Service_Optimization_Studio
          </DialogTitle>
        </DialogHeader>

        {/* 1. CALCULATEUR DYNAMIQUE (Widget d'aide à la décision) */}
        <MarginCalculator
          originalPrice={service.unitPrice} // Prix avant modif ou prix d'import
          sellingPrice={formData.unitPrice} // Prix en cours de saisie
        />

        <form onSubmit={handleUpdate} className="p-6 space-y-6">
          {/* CHAMP : TITRE */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-tighter text-slate-400">
              Désignation_Commerciale
            </Label>
            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="rounded-none border-slate-200 focus-visible:ring-0 focus-visible:border-indigo-600 font-bold uppercase h-10"
              required
            />
          </div>

          {/* CHAMP : PRIX (Le levier de profit) */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-tighter text-slate-400">
              Tarification_Unitaire (CFA)
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <CurrencyDollar size={16} />
              </div>
              <Input
                type="number"
                value={formData.unitPrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    unitPrice: parseFloat(e.target.value) || 0,
                  })
                }
                className="pl-10 rounded-none border-slate-200 focus-visible:ring-0 focus-visible:border-indigo-600 font-mono font-black h-10"
                required
              />
            </div>
          </div>

          {/* CHAMP : SUBTITLE */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-tighter text-slate-400">
              Description_Synthétique
            </Label>
            <Textarea
              value={formData.subtitle}
              onChange={(e) =>
                setFormData({ ...formData, subtitle: e.target.value })
              }
              className="rounded-none border-slate-200 focus-visible:ring-0 focus-visible:border-indigo-600 min-h-[80px] text-[12px] resize-none"
            />
          </div>

          {/* ACTIONS */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-none border-slate-900 border text-[10px] font-black uppercase h-11"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-none bg-slate-900 hover:bg-indigo-600 text-white text-[10px] font-black uppercase gap-2 h-11 transition-colors"
            >
              {isLoading ? (
                "Sync_En_Cours..."
              ) : (
                <>
                  <Check size={14} weight="bold" /> Valider_Changements
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
