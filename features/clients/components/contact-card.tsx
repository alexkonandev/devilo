"use client";

import React from "react";
import { ClientListItem } from "@/types/client";
import { cn } from "@/lib/utils";
import { DS_MONO, DS_LABEL, DS_BENTO_CARD } from "@/lib/design-system";
import {
  EnvelopeSimple,
  Phone,
  MapPin,
  PencilSimple,
  Trash,
  Copy,
  Check,
} from "@phosphor-icons/react";

// ═══════════════════════════════════════════════════════════════
// CONTACT CARD — Carte de visite individuelle (palette DS)
// ═══════════════════════════════════════════════════════════════

interface ContactCardProps {
  client: ClientListItem;
  isSelected: boolean;
  copiedEmailId: string | null;
  onSelect: (client: ClientListItem) => void;
  onEdit: (client: ClientListItem) => void;
  onDelete: (client: ClientListItem) => void;
  onCopyEmail: (clientId: string, email: string) => void;
}

export function ContactCard({
  client,
  isSelected,
  copiedEmailId,
  onSelect,
  onEdit,
  onDelete,
  onCopyEmail,
}: ContactCardProps) {
  const initials = client.name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isCopying = copiedEmailId === client.id;

  return (
    <div
      onClick={() => onSelect(client)}
      className={cn(
        DS_BENTO_CARD,
        "group relative p-4 cursor-pointer transition-all",
        "hover:border-indigo-300 hover:shadow-sm hover:-translate-y-0.5",
        isSelected
          ? "border-indigo-400 ring-1 ring-indigo-200 bg-indigo-50/30"
          : "border-slate-200"
      )}
    >
      {/* Actions rapides (apparaissent au hover) */}
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(client);
          }}
          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors"
          title="Modifier"
        >
          <PencilSimple size={12} weight="bold" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(client);
          }}
          className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
          title="Supprimer"
        >
          <Trash size={12} weight="bold" />
        </button>
      </div>

      {/* Avatar / Initiales */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold",
            isSelected
              ? "bg-indigo-100 text-indigo-700"
              : "bg-slate-100 text-slate-600"
          )}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              "text-sm font-semibold truncate leading-tight",
              isSelected ? "text-indigo-900" : "text-slate-800"
            )}
          >
            {client.name}
          </h3>
          {client.tags && client.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {client.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-1.5 py-0.5 rounded text-[7px] font-mono font-bold uppercase tracking-wide bg-slate-100 text-slate-500 border border-slate-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Coordonnées */}
      <div className="space-y-1.5">
        {client.email && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded bg-slate-50 flex items-center justify-center shrink-0">
              <EnvelopeSimple size={10} className="text-slate-400" />
            </div>
            <span
              className={cn(
                DS_MONO,
                "text-[10px] text-slate-500 truncate flex-1 cursor-pointer hover:text-indigo-600",
                isCopying && "text-indigo-600"
              )}
              onClick={(e) => {
                e.stopPropagation();
                if (client.email) onCopyEmail(client.id, client.email);
              }}
              title={isCopying ? "Copié !" : "Copier l'email"}
            >
              {client.email}
            </span>
            {isCopying ? (
              <Check size={10} className="text-indigo-500 shrink-0" weight="bold" />
            ) : (
              <Copy size={9} className="text-slate-300 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
        )}

        {client.phone && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded bg-slate-50 flex items-center justify-center shrink-0">
              <Phone size={10} className="text-slate-400" />
            </div>
            <span className={cn(DS_MONO, "text-[10px] text-slate-500 truncate")}>
              {client.phone}
            </span>
          </div>
        )}

        {client.address && (
          <div className="flex items-start gap-2 min-w-0">
            <div className="w-5 h-5 rounded bg-slate-50 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin size={10} className="text-slate-400" />
            </div>
            <span className={cn(DS_MONO, "text-[10px] text-slate-400 truncate leading-snug")}>
              {client.address}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}