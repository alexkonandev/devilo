"use client";

import React, { useState } from "react";
import { ClientListItem } from "@/types/client";
import { cn } from "@/lib/utils";
import { DS_MONO, DS_MICRO } from "@/lib/design-system";
import {
  ArrowSquareOut,
  EnvelopeSimple,
  DotsThreeVertical,
} from "@phosphor-icons/react";
import Link from "next/link";

interface ClientRowInlineProps {
  client: ClientListItem;
  isSelected?: boolean;
  onSelect?: (client: ClientListItem) => void;
}

function formatCompact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".0", "")}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toString();
}

function healthColor(score: number) {
  if (score >= 80) return { bg: "bg-emerald-500", text: "text-emerald-600" };
  if (score >= 50) return { bg: "bg-indigo-500", text: "text-indigo-600" };
  if (score >= 30) return { bg: "bg-amber-500", text: "text-amber-600" };
  return { bg: "bg-rose-500", text: "text-rose-600" };
}

function healthScore(client: ClientListItem): number {
  const quotes = client.quotes || [];
  if (quotes.length === 0) return 50;
  const paid = quotes.filter((q) => q.status === "PAID");
  const conv = paid.length / quotes.length;
  const rev = Math.min(
    100,
    paid.reduce((s, q) => s + q.totalAmount, 0) / 100_000,
  );
  return Math.round(rev * 0.5 + conv * 50);
}

export function ClientRowInline({
  client,
  isSelected,
  onSelect,
}: ClientRowInlineProps) {
  const [copied, setCopied] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const paid = (client.quotes || []).filter((q) => q.status === "PAID");
  const revenue = paid.reduce((s, q) => s + q.totalAmount, 0);
  const quotesCount = client.quotes?.length ?? 0;
  const convRate = quotesCount
    ? Math.round((paid.length / quotesCount) * 100)
    : 0;
  const score = healthScore(client);
  const hc = healthColor(score);

  const copyEmail = () => {
    if (client.email) {
      navigator.clipboard.writeText(client.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    }
  };

  return (
    <div
      className={cn(
        "group flex items-center h-8 px-3 border-b border-slate-100",
        "hover:bg-slate-50 transition-colors cursor-pointer select-none",
        isSelected && "bg-indigo-50 hover:bg-indigo-100",
      )}
      onClick={() => onSelect?.(client)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Checkbox */}
      <div className="w-5 flex items-center mr-2">
        <div
          className={cn(
            "w-4 h-4 border rounded",
            isSelected
              ? "bg-indigo-600 border-indigo-600"
              : "border-slate-300 group-hover:border-slate-400",
          )}
        />
      </div>

      {/* Pastille health */}
      <div
        className={cn("w-2 h-2 rounded-full mr-2", hc.bg)}
        title={`Health: ${score}`}
      />

      {/* Avatar compact */}
      <div className="w-5 h-5 rounded bg-indigo-100 border border-indigo-200 flex items-center justify-center text-[8px] font-black text-indigo-600 shrink-0 mr-2">
        {client.name.slice(0, 2).toUpperCase()}
      </div>

      {/* Nom - largeur flexible mais contrainte */}
      <div className="w-36 shrink-0 mr-4">
        <span className="text-[12px] font-bold text-slate-800 truncate block">
          {client.name}
        </span>
      </div>

      {/* CA */}
      <div className="w-16 shrink-0 mr-4">
        <span
          className={cn(
            DS_MONO,
            "text-[12px] font-bold text-slate-900 tabular-nums",
          )}
        >
          {formatCompact(revenue)}
        </span>
      </div>

      {/* Devis count */}
      <div className="w-12 shrink-0 mr-4">
        <span className={cn(DS_MICRO, "text-[11px] text-slate-600")}>
          {quotesCount} devis
        </span>
      </div>

      {/* Conversion */}
      <div className="w-12 shrink-0 mr-4">
        <span
          className={cn(
            DS_MONO,
            "text-[11px] font-bold",
            convRate > 50 ? "text-emerald-600" : "text-slate-600",
          )}
        >
          {convRate}%
        </span>
      </div>

      {/* Health score */}
      <div className="w-10 shrink-0 mr-4">
        <span className={cn(DS_MONO, "text-[11px] font-bold", hc.text)}>
          {score}
        </span>
      </div>

      {/* Email - prend l'espace restant */}
      <div className="flex-1 min-w-0 mr-4">
        {client.email ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyEmail();
            }}
            className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <EnvelopeSimple size={10} />
            <span className="truncate">{client.email}</span>
            {copied && <span className="text-emerald-500 ml-1">copié!</span>}
          </button>
        ) : (
          <span className="text-[11px] text-slate-300">—</span>
        )}
      </div>

      {/* Actions - affichées au hover */}
      <div
        className={cn(
          "w-16 flex items-center justify-end gap-1 transition-opacity",
          showActions ? "opacity-100" : "opacity-0",
        )}
      >
        <button
          onClick={(e) => e.stopPropagation()}
          className="p-1 hover:bg-slate-200 rounded"
        >
          <DotsThreeVertical size={14} className="text-slate-400" />
        </button>
        <Link
          href={`/clients?id=${client.id}`}
          onClick={(e) => e.stopPropagation()}
          className="p-1 hover:bg-slate-200 rounded"
        >
          <ArrowSquareOut size={14} className="text-slate-400" />
        </Link>
      </div>
    </div>
  );
}

export default ClientRowInline;
