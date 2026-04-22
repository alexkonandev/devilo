"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Copy,
  Check,
  PaperPlaneTilt,
  Info,
  ArrowsClockwise,
  Layout,
} from "@phosphor-icons/react";
import { RELANCE_TEMPLATES, TemplateType } from "../relance-templates";
import { ClientListItem } from "@/types/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SmartRelanceSheetProps {
  client: ClientListItem;
  trigger: React.ReactNode;
}

export function SmartRelanceSheet({ client, trigger }: SmartRelanceSheetProps) {
  const [activeTemplate, setActiveTemplate] = useState<TemplateType>("SOFT");
  const [isCopied, setIsCopied] = useState(false);

  const lastQuote = client.quotes?.[0];

  const parseTemplate = (text: string) => {
    if (!lastQuote) return "AUCUNE DONNÉE DE DEVIS DISPONIBLE";

    return text
      .replace(/{{NAME}}/g, client.name)
      .replace(/{{NUMBER}}/g, lastQuote.number)
      .replace(
        /{{AMOUNT}}/g,
        new Intl.NumberFormat("fr-CI").format(lastQuote.totalAmount)
      );
  };

  const currentContent = parseTemplate(RELANCE_TEMPLATES[activeTemplate].body);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setIsCopied(true);
    toast.success("SCRIPT_COPIÉ", {
      className:
        "rounded-none border-slate-200 font-bold text-[10px] uppercase tracking-widest",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-150 sm:w-175 sm:max-w-none rounded-none border-l border-slate-200 p-0 flex flex-col gap-0 bg-white shadow-2xl outline-none">
        {/* HEADER */}
        <SheetHeader className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-900 flex items-center justify-center border border-black shrink-0">
              <PaperPlaneTilt weight="bold" size={20} className="text-white" />
            </div>
            <div className="flex flex-col text-left">
              <SheetTitle className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-900">
                Smart_Relance_System
              </SheetTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  Target: {client.name}
                </span>
              </div>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 p-8 space-y-10 overflow-y-auto scrollbar-none">
          {/* SÉLECTEUR DE TONALITÉ */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Layout size={14} weight="bold" className="text-slate-400" />
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-900">
                Configuration_Tonalité
              </label>
            </div>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 border border-slate-200">
              {(Object.keys(RELANCE_TEMPLATES) as TemplateType[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveTemplate(key)}
                  className={cn(
                    "h-9 text-[9px] font-black uppercase tracking-widest transition-all outline-none",
                    activeTemplate === key
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {RELANCE_TEMPLATES[key].label}
                </button>
              ))}
            </div>
          </div>

          {/* ZONE DE PRÉVISUALISATION - RÉPARÉE */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              {/* BOUTON COPIER : Discret et bien placé */}
              <button
                onClick={handleCopy}
                className={cn(
                  "flex items-center gap-2 px-3 py-1 border transition-all active:scale-95 outline-none",
                  isCopied
                    ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-900 hover:text-white hover:border-slate-900"
                )}
              >
                {isCopied ? (
                  <Check size={12} weight="bold" />
                ) : (
                  <Copy size={12} weight="bold" />
                )}
                <span className="text-[9px] font-black uppercase tracking-widest">
                  {isCopied ? "Copié" : "Copier"}
                </span>
              </button>
            </div>

            <textarea
              readOnly
              value={currentContent}
              className="w-full h-90 border border-slate-200 p-6 text-[12px] font-mono leading-relaxed bg-slate-50/30 outline-none resize-none scrollbar-none border-dashed"
            />
          </div>

          
        </div>

        
      </SheetContent>
    </Sheet>
  );
}
