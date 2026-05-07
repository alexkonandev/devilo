"use client";

import React from "react";
import {
  User,
  EnvelopeSimple,
  Phone,
  Buildings,
  MapPin,
  FileText,
  PencilSimple,
  ArrowUpRight,
  ArrowLeft,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { ClientListItem } from "@/types/client";
import Link from "next/link";

interface ClientInspectorProps {
  client?: ClientListItem;
  onBack?: () => void;
  onEdit?: (client: ClientListItem) => void;
}

export function ClientInspector({
  client,
  onBack,
  onEdit,
}: ClientInspectorProps) {
  if (!client) return <EmptyState />;

  const quotes = client.quotes || [];
  const paid = quotes.filter((q) => q.status === "PAID");
  const revenue = paid.reduce((s, q) => s + (q.totalAmount || 0), 0);
  const convRate = quotes.length
    ? Math.round((paid.length / quotes.length) * 100)
    : 0;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* DENSE HEADER - 48px height */}
      <div className="flex items-center justify-between h-12 px-3 border-b border-slate-200 bg-white shrink-0">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
            >
              <ArrowLeft size={14} />
              Retour
            </button>
          )}
          <div className="w-px h-4 bg-slate-200 mx-1" />
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-indigo-50 flex items-center justify-center">
              <User size={16} className="text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-semibold text-slate-900 leading-tight">
                {client.name}
              </span>
              {client.email && (
                <span className="text-[10px] text-slate-500 leading-tight">
                  {client.email}
                </span>
              )}
            </div>
          </div>
        </div>

        {onEdit && (
          <button
            onClick={() => onEdit(client)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
          >
            <PencilSimple size={14} />
            Éditer
          </button>
        )}
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto">
        {/* KPI STRIP - 40px height */}
        <div className="flex items-center h-10 px-4 gap-6 border-b border-slate-100 bg-slate-50/50">
          <KpiItem label="Devis" value={quotes.length.toString()} />
          <KpiItem label="CA" value={formatCFA(revenue)} />
          <KpiItem label="Conv." value={`${convRate}%`} />
        </div>

        {/* INFO TILES - Compact grid */}
        <div className="grid grid-cols-2 gap-px bg-slate-100 border-b border-slate-200">
          <CompactInfo
            label="Email"
            value={client.email || "---"}
            icon={EnvelopeSimple}
          />
          <CompactInfo
            label="Téléphone"
            value={client.phone || "---"}
            icon={Phone}
          />
          <CompactInfo
            label="RCCM"
            value={client.taxId || "---"}
            icon={Buildings}
          />
          <CompactInfo
            label="Adresse"
            value={client.address || "---"}
            icon={MapPin}
          />
        </div>

        {/* QUOTES LIST - Dense */}
        <div className="divide-y divide-slate-100">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50">
            <FileText size={12} className="text-slate-400" />
            <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide">
              Historique des devis
            </span>
            <span className="ml-auto text-[10px] text-slate-400">
              {quotes.length} total
            </span>
          </div>

          {quotes.length > 0 ? (
            quotes.map((quote) => <QuoteRow key={quote.id} quote={quote} />)
          ) : (
            <div className="py-8 text-center">
              <span className="text-[11px] text-slate-400">Aucun devis</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper components

function KpiItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-slate-400">{label}</span>
      <span className="text-[11px] font-semibold text-slate-700">{value}</span>
    </div>
  );
}

function CompactInfo({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div className="bg-white p-3 flex items-center gap-2.5">
      <Icon size={14} className="text-slate-400 shrink-0" />
      <div className="flex flex-col min-w-0">
        <span className="text-[9px] text-slate-400 uppercase">{label}</span>
        <span className="text-[12px] text-slate-900 truncate">{value}</span>
      </div>
    </div>
  );
}

function QuoteRow({
  quote,
}: {
  quote: {
    id: string;
    number: string;
    status: string;
    createdAt: string;
    totalAmount?: number;
  };
}) {
  const statusColors: Record<string, string> = {
    DRAFT: "bg-amber-400",
    SENT: "bg-indigo-400",
    ACCEPTED: "bg-emerald-400",
    REJECTED: "bg-rose-400",
    PAID: "bg-emerald-500",
  };

  return (
    <Link
      href={`/quotes/${quote.id}`}
      className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors group"
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-1 h-6 rounded-full",
            statusColors[quote.status] || "bg-slate-200",
          )}
        />
        <div className="flex flex-col">
          <span className="text-[12px] font-medium text-slate-900">
            {quote.number}
          </span>
          <span className="text-[10px] text-slate-400">
            {new Date(quote.createdAt).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "short",
            })}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[12px] font-medium text-slate-900">
          {formatCFA(quote.totalAmount || 0)}
        </span>
        <ArrowUpRight
          size={14}
          className="text-slate-300 group-hover:text-indigo-500"
        />
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/50">
      <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center mb-3">
        <User size={20} className="text-slate-300" />
      </div>
      <p className="text-[12px] text-slate-400">Sélectionnez un client</p>
    </div>
  );
}

function formatCFA(amount: number) {
  return new Intl.NumberFormat("fr-CI", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  }).format(amount);
}
