"use client";

import React from "react";
import Link from "next/link";
import {
  FileTextIcon,
  UsersThreeIcon,
  CreditCardIcon,
  PlusIcon,
  ArrowRightIcon,
  ClockIcon,
} from "@phosphor-icons/react";
import { cn, formatPriceCompact } from "@/lib/utils";
import { STUDIO_V2_CARD, STUDIO_V2_ICON_WRAP } from "@/lib/design-system";

interface HomeViewProps {
  firstName: string;
  recentQuotes: Array<{
    id: string;
    projetTitre: string;
    clientNom: string;
    montant: number;
    statut: string;
    date: string;
  }>;
  stats: {
    totalQuotes: number;
    totalClients: number;
    pendingQuotes: number;
  };
}

const QUICK_ACTIONS = [
  {
    label: "Mes Devis",
    href: "/quotes",
    icon: FileTextIcon,
    color: "bg-indigo-50 text-indigo-600",
    desc: "Gérer mes devis",
  },
  {
    label: "Mes Clients",
    href: "/clients",
    icon: UsersThreeIcon,
    color: "bg-emerald-50 text-emerald-600",
    desc: "Mon portefeuille client",
  },
  {
    label: "Mon abonnement",
    href: "/billing",
    icon: CreditCardIcon,
    color: "bg-amber-50 text-amber-600",
    desc: "Gérer mon abonnement",
  },
];

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-600 border-slate-200",
  SENT: "bg-amber-50 text-amber-600 border-amber-200",
  PAID: "bg-emerald-50 text-emerald-600 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-600 border-rose-200",
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyé",
  PAID: "Payé",
  REJECTED: "Refusé",
};

export function HomeView({ firstName, recentQuotes, stats }: HomeViewProps) {
  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col h-full w-full bg-slate-50">
      {/* Header */}
      <div className="shrink-0 px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Bonjour{firstName ? `, ${firstName}` : ""}
            </h1>
            <p className="text-[11px] font-mono text-slate-500 capitalize">{today}</p>
          </div>
          <Link
            href="/quotes/new"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-[11px] font-bold rounded-xl hover:bg-indigo-700 transition-all border border-indigo-600"
          >
            <PlusIcon size={14} weight="bold" />
            Nouveau Devis
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={cn(STUDIO_V2_CARD, "group hover:border-indigo-300 transition-all")}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div className={cn(STUDIO_V2_ICON_WRAP, action.color)}>
                  <action.icon size={16} weight="fill" />
                </div>
                <span className="text-[11px] font-bold font-mono text-slate-900">{action.label}</span>
              </div>
              <p className="text-[9px] font-mono text-slate-500 mb-2">{action.desc}</p>
              <div className="flex items-center gap-1 text-[8px] font-mono font-bold text-indigo-600 opacity-60 transition-opacity">
                Accéder <ArrowRightIcon size={10} weight="bold" />
              </div>
            </Link>
          ))}
        </div>

        {/* Stats mini */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl">
            <FileTextIcon size={12} className="text-indigo-500" weight="fill" />
            <span className="text-[10px] font-mono font-bold text-slate-900 tabular-nums">{stats.totalQuotes}</span>
            <span className="text-[7px] font-mono uppercase tracking-wider text-slate-500 font-semibold">devis</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl">
            <UsersThreeIcon size={12} className="text-emerald-500" weight="fill" />
            <span className="text-[10px] font-mono font-bold text-slate-900 tabular-nums">{stats.totalClients}</span>
            <span className="text-[7px] font-mono uppercase tracking-wider text-slate-500 font-semibold">clients</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl">
            <ClockIcon size={12} className="text-amber-500" weight="fill" />
            <span className="text-[10px] font-mono font-bold text-slate-900 tabular-nums">{stats.pendingQuotes}</span>
            <span className="text-[7px] font-mono uppercase tracking-wider text-slate-500 font-semibold">en attente</span>
          </div>
        </div>

        {/* Recent Quotes */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[11px] font-bold font-mono text-slate-700 uppercase tracking-wider">Derniers devis</h2>
            {recentQuotes.length > 0 && (
              <Link href="/quotes" className="text-[9px] font-mono font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                Voir tout →
              </Link>
            )}
          </div>

          {recentQuotes.length > 0 ? (
            <div className="space-y-1.5">
              {recentQuotes.slice(0, 5).map((quote) => (
                <Link
                  key={quote.id}
                  href={`/quotes/${quote.id}`}
                  className={cn(STUDIO_V2_CARD, "flex items-center gap-3 py-2.5 px-3 hover:border-indigo-300 transition-all")}
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center">
                    <FileTextIcon size={12} className="text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-mono font-bold text-slate-900 truncate">{quote.projetTitre}</p>
                    <p className="text-[8px] font-mono text-slate-500">{quote.clientNom}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono font-bold text-slate-900 tabular-nums">{formatPriceCompact(quote.montant)}</p>
                    <span className={cn(
                      "inline-flex items-center px-1 py-0.5 rounded text-[6px] font-bold uppercase tracking-wider font-mono border",
                      STATUS_BADGE[quote.statut] ?? "bg-slate-100 text-slate-600 border-slate-200"
                    )}>
                      {STATUS_LABEL[quote.statut] ?? quote.statut}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className={cn(STUDIO_V2_CARD, "flex flex-col items-center justify-center py-10")}>
              <FileTextIcon size={28} className="text-slate-300 mb-2" />
              <p className="text-[11px] font-mono font-bold text-slate-400">Aucun devis pour le moment</p>
              <p className="text-[9px] font-mono text-slate-400 mt-1 mb-3">Créez votre premier devis pour démarrer</p>
              <Link
                href="/quotes/new"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-[10px] font-bold rounded-xl hover:bg-indigo-700 transition-all"
              >
                <PlusIcon size={12} weight="bold" />
                Créer un devis
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}