"use client";

import {
  ShieldCheck,
  CreditCard,
  Receipt,
  ExternalLink,
  BarChart3,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface BillingPageProps {
  estPro?: boolean;
  quotaUtilise?: number;
}

export default function BillingPage({
  estPro = false,
  quotaUtilise = 0,
}: BillingPageProps) {
  const LIMITE_GRATUITE = 5;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* HEADER : ALIGNÉ SUR SETTINGSFORM (h-16) */}
      <header className="sticky top-0 z-40 h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">
            Gestion Financière
          </h1>
          <div className="flex items-center gap-2 px-2 py-0.5 border border-indigo-100 bg-indigo-50">
            <div className="w-1.5 h-1.5 bg-emerald-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-700">
              Système Opérationnel
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            ID_TERMINAL: {Math.random().toString(36).substring(7).toUpperCase()}
          </span>
        </div>
      </header>

      {/* ZONE DE TRAVAIL : ESPACEMENT AÉRÉ (py-16) */}
      <main className="max-w-7xl mx-auto py-16 px-8 w-full space-y-20">
        <div className="grid grid-cols-12 gap-12">
          {/* COLONNE GAUCHE : LICENCE & CHARGE */}
          <div className="col-span-12 lg:col-span-7 space-y-12">
            {/* 01. ACCRÉDITATION */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-indigo-600" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600">
                  01. Accréditation_Licence
                </span>
              </div>

              <div className="border border-slate-200 p-8 bg-white transition-colors hover:border-slate-300">
                <div className="space-y-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Statut du Plan
                    </span>
                    <h2 className="text-[28px] font-bold tracking-tight text-slate-900 uppercase">
                      {estPro ? "Licence Entreprise" : "Accès Standard"}
                    </h2>
                    <p className="text-[13px] text-slate-500 max-w-lg leading-relaxed font-medium">
                      {estPro
                        ? "Infrastructure dégroupée. Votre terminal dispose d'une capacité de génération illimitée et d'un support prioritaire."
                        : "Capacité actuelle restreinte par le protocole standard. Augmentez votre niveau d'accréditation pour débloquer l'automatisation."}
                    </p>
                  </div>

                  <Button
                    className={cn(
                      "h-10 px-8 rounded-none font-bold uppercase tracking-widest text-[10px] transition-all",
                      estPro
                        ? "bg-white border border-slate-200 text-slate-900 hover:bg-slate-50"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    )}
                  >
                    {estPro ? "Gérer l'abonnement" : "Activer la Licence Pro"}
                  </Button>
                </div>
              </div>
            </section>

            <div className="h-px bg-slate-100" />

            {/* 02. MÉTRIQUES */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 size={14} className="text-indigo-600" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600">
                  02. Métriques_Utilisation
                </span>
              </div>

              <div className="border border-slate-200 p-8 bg-white">
                <div className="flex justify-between items-end mb-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Index de Charge Devis
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-mono font-bold text-slate-900 tracking-tighter">
                        {quotaUtilise.toString().padStart(2, "0")}
                      </span>
                      <span className="text-[12px] font-bold text-slate-300 uppercase tracking-widest">
                        /{" "}
                        {estPro
                          ? "∞"
                          : LIMITE_GRATUITE.toString().padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                  {!estPro && (
                    <div className="px-2 py-1 border border-amber-100 bg-amber-50">
                      <span className="text-[9px] font-black text-amber-600 uppercase">
                        Charge Critique
                      </span>
                    </div>
                  )}
                </div>
                <div className="h-1.5 w-full bg-slate-50 overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-700",
                      estPro ? "bg-indigo-600" : "bg-slate-900"
                    )}
                    style={{
                      width: estPro
                        ? "100%"
                        : `${(quotaUtilise / LIMITE_GRATUITE) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </section>
          </div>

          {/* COLONNE DROITE : ARCHIVES & PAIEMENT */}
          <div className="col-span-12 lg:col-span-5 space-y-12">
            {/* 03. REGISTRE */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Receipt size={14} className="text-indigo-600" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600">
                  03. Registre_Fiscal
                </span>
              </div>
              <div className="border border-slate-200 divide-y divide-slate-100 bg-white">
                <BoutonPortail
                  titre="Portail Client"
                  sousTitre="Accéder aux reçus officiels"
                  icon={ExternalLink}
                />
                <BoutonPortail
                  titre="Historique des Flux"
                  sousTitre="Audit complet des transactions"
                  icon={ChevronRight}
                />
              </div>
            </section>

            <div className="h-px bg-slate-100" />

            {/* 04. PAIEMENT */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard size={14} className="text-indigo-600" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-600">
                  04. Terminal_Paiement
                </span>
              </div>
              <div className="border border-slate-200 p-8 bg-slate-50/50 flex justify-between items-center group cursor-pointer hover:bg-white transition-colors">
                <div className="space-y-3">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    Source de Prélèvement
                  </span>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-5 border border-slate-200 bg-white flex items-center justify-center">
                      <div className="w-4 h-[1px] bg-slate-100" />
                    </div>
                    <span className="text-[13px] font-mono font-bold text-slate-700">
                      {estPro ? "VISA •••• 4242" : "NON CONFIGURÉ"}
                    </span>
                  </div>
                </div>
                <ArrowUpRight
                  size={16}
                  className="text-slate-300 group-hover:text-indigo-600 transition-colors"
                />
              </div>
            </section>

            {/* NOTE LÉGALE */}
            <div className="p-6 border-l-2 border-slate-900 bg-slate-50">
              <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase">
                {"//"} Transactions opérées par Lemon Squeezy Inc.
                <br />
                Conformité RGPD & Chiffrement AES-256 actif.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER : MINIMALISME TECHNIQUE */}
      <footer className="h-10 border-t border-slate-100 px-8 flex items-center justify-between shrink-0 bg-white">
        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
          Build_v3.5.0_PROD
        </span>
        <div className="flex gap-8">
          <button className="text-[9px] font-bold text-slate-400 uppercase hover:text-indigo-600 transition-colors">
            Support Technique
          </button>
          <button className="text-[9px] font-bold text-slate-400 uppercase hover:text-indigo-600 transition-colors">
            Conditions Générales
          </button>
        </div>
      </footer>
    </div>
  );
}

function BoutonPortail({
  titre,
  sousTitre,
  icon: Icon,
}: {
  titre: string;
  sousTitre: string;
  icon: LucideIcon;
}) {
  return (
    <button className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group text-left">
      <div>
        <span className="block text-[12px] font-bold uppercase text-slate-900 tracking-tight">
          {titre}
        </span>
        <span className="text-[10px] font-medium text-slate-400 uppercase">
          {sousTitre}
        </span>
      </div>
      <Icon
        size={14}
        className="text-slate-300 group-hover:text-indigo-600 transition-colors"
      />
    </button>
  );
}
