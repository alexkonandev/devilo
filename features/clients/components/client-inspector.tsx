"use client";

import React from "react";
import {
  User,
  Mail,
  Building2,
  MapPin,
  History,
  ShieldCheck,
  ArrowUpRight,
  Clock,
  PencilLine, // Ajout pour le bouton d'édition
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ClientListItem } from "@/types/client";
import { EditClientDialog } from "../edit-client-dialog"; // Import du nouveau modal
interface ClientInspectorProps {
  client?: ClientListItem;
}

/**
 * Mapper pour la cohérence des statuts en français
 */
const TRADUCTION_STATUTS: Record<string, string> = {
  DRAFT: "BROUILLON",
  SENT: "ENVOYÉ",
  ACCEPTED: "ACCEPTÉ",
  REJECTED: "REFUSÉ",
  PAID: "PAYÉ",
};

export function ClientInspector({ client }: ClientInspectorProps) {
  if (!client) return <EmptyState />;

  return (
    <div className="flex flex-col h-full bg-white antialiased">
      {/* 1. HEADER : SÉPARATEUR SLATE-200 */}
      <div className="h-15 border-b border-slate-200 flex items-center justify-between px-6 shrink-0 bg-white">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 border border-slate-200 flex items-center justify-center relative bg-slate-50/50">
            <User className="text-slate-400 w-5 h-5" />
            <div className="absolute -right-1 -bottom-1 w-4 h-4 bg-white border border-slate-200 flex items-center justify-center">
              <ShieldCheck className="text-indigo-600 w-2.5 h-2.5" />
            </div>
          </div>
          <div className="flex flex-col">
            <h2 className="text-[16px] font-black text-slate-900 uppercase tracking-tight leading-none">
              {client.name}
            </h2>
          </div>
        </div>

        {/* Bouton d'édition : Icone uniquement pour plus de densité visuelle */}
        <EditClientDialog
          client={client}
          trigger={
            <button
              title="Modifier le dossier"
              className="h-8 w-8 flex items-center justify-center border border-slate-200 text-slate-900 hover:border-indigo-600 hover:text-indigo-600 transition-all active:scale-95"
            >
              <PencilLine size={16} />
            </button>
          }
        />
      </div>

      {/* 2. BODY : DATA GRID & FLUX */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-none">
        {/* DATA GRID : SÉPARATEURS SLATE-200 */}
        <div className="grid grid-cols-3 gap-px bg-slate-200 border border-slate-200 shadow-sm">
          <InfoTile
            label="Protocole_Mail"
            value={client.email || "ENTRÉE_NULLE"}
            icon={Mail}
          />
          <InfoTile
            label="Registre_Légal"
            value={client.taxId || "---"}
            icon={Building2}
            isMono
          />
          <InfoTile
            label="Position_Géo"
            value={client.address || "NON_RENSEIGNÉE"}
            icon={MapPin}
          />
        </div>

        {/* REGISTRE DES FLUX */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <History size={14} className="text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
                Journal_Activités
              </span>
            </div>
          </div>

          <div className="divide-y divide-slate-100 border-x border-b border-slate-200">
            {client.quotes && client.quotes.length > 0 ? (
              client.quotes.map((quote) => (
                <ActivityRow
                  key={quote.id}
                  label={quote.number}
                  amount={quote.totalAmount || 0}
                  status={TRADUCTION_STATUTS[quote.status] || quote.status}
                  date={new Date(quote.createdAt)
                    .toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "short",
                    })
                    .toUpperCase()}
                  isPending={
                    quote.status === "DRAFT" || quote.status === "SENT"
                  }
                  isError={quote.status === "REJECTED"}
                />
              ))
            ) : (
              <div className="p-12 text-center bg-slate-50/30">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
                  Aucune_Activité_Détectée
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoTile({
  label,
  value,
  icon: Icon,
  isMono,
}: {
  label: string;
  value: string;
  icon: any;
  isMono?: boolean;
}) {
  return (
    <div className="bg-white p-5 space-y-2 group">
      <div className="flex items-center gap-2">
        <Icon
          size={12}
          className="text-slate-400 group-hover:text-indigo-600 transition-colors"
        />
        <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
          {label}
        </span>
      </div>
      <p
        className={cn(
          "text-[11px] font-bold text-slate-900 truncate uppercase",
          isMono && "font-mono tracking-tighter"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function ActivityRow({ label, amount, status, date, isPending, isError }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-white hover:bg-slate-50/50 transition-all group border-l-2 border-l-transparent hover:border-l-indigo-600">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "w-1 h-3",
            isPending
              ? "bg-amber-400"
              : isError
              ? "bg-rose-500"
              : "bg-emerald-500"
          )}
        />
        <div className="flex flex-col">
          <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">
            {label}
          </span>
          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-tighter">
            {date}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-[11px] font-mono font-black text-slate-950 leading-none">
            {new Intl.NumberFormat("fr-CI", {
              style: "currency",
              currency: "XOF",
              minimumFractionDigits: 0,
            }).format(amount)}
          </p>
          <p
            className={cn(
              "text-[8px] font-black uppercase mt-1 tracking-widest",
              isPending
                ? "text-amber-500"
                : isError
                ? "text-rose-500"
                : "text-emerald-500"
            )}
          >
            {status}
          </p>
        </div>
        <ArrowUpRight
          size={14}
          className="text-slate-400 group-hover:text-indigo-600"
        />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-20 bg-white">
      <div className="w-12 h-12 border border-slate-200 flex items-center justify-center mb-4">
        <Clock size={20} className="text-slate-400" />
      </div>
      <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-300">
        En_Attente_De_Sélection
      </p>
    </div>
  );
}
