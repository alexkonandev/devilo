"use client";

import React from "react";
import {
  XIcon,
  TrashIcon,
  PlusIcon,
  PackageIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  DS_MONO,
  DS_LABEL,
  DS_ICON_XS,
  DS_ICON_WRAPPER,
  DS_BUTTON_SECONDARY,
} from "@/lib/design-system";

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════
type DialogVariant = "add" | "delete" | "info";

interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description: string;
  variant?: DialogVariant;
  confirmLabel?: string;
  itemName?: string;
}

// ═══════════════════════════════════════════════════════════════
// ICON PAR VARIANT — compact
// ═══════════════════════════════════════════════════════════════
function DialogIcon({ variant }: { variant: DialogVariant }) {
  switch (variant) {
    case "add":
      return (
        <div className={cn(DS_ICON_WRAPPER, "bg-emerald-100 text-emerald-600")}>
          <PlusIcon size={DS_ICON_XS} weight="bold" />
        </div>
      );
    case "delete":
      return (
        <div className={cn(DS_ICON_WRAPPER, "bg-rose-100 text-rose-600")}>
          <TrashIcon size={DS_ICON_XS} weight="bold" />
        </div>
      );
    case "info":
    default:
      return (
        <div className={cn(DS_ICON_WRAPPER, "bg-indigo-100 text-indigo-600")}>
          <PackageIcon size={DS_ICON_XS} weight="bold" />
        </div>
      );
  }
}

// ═══════════════════════════════════════════════════════════════
// CONFIRM DIALOG — Compact, DS tokens
// ═══════════════════════════════════════════════════════════════
export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  description,
  variant = "info",
  confirmLabel,
  itemName,
}: ConfirmDialogProps) {
  const confirmColors =
    variant === "add"
      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
      : variant === "delete"
        ? "bg-rose-600 hover:bg-rose-700 text-white"
        : "bg-indigo-600 hover:bg-indigo-700 text-white";

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center transition-all duration-200",
        open ? "bg-black/30" : "bg-transparent pointer-events-none",
      )}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative w-full max-w-[260px] mx-auto border border-slate-200 bg-white rounded-md p-3 transition-all duration-200",
          open
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-3 scale-[0.97] pointer-events-none",
        )}
      >
        <button
          onClick={onCancel}
          className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        >
          <XIcon size={10} />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <DialogIcon variant={variant} />
          <h3 className={cn(DS_MONO, "text-[11px] font-bold text-slate-900")}>
            {title}
          </h3>
        </div>

        {itemName && (
          <div className="mb-1.5">
            <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-[8px] font-mono font-bold text-slate-700">
              {itemName}
            </span>
          </div>
        )}

        <p className={cn(DS_LABEL, "text-[9px] text-slate-500 mb-3 leading-relaxed")}>
          {description}
        </p>

        <div className="flex gap-1.5">
          <button
            onClick={onCancel}
            className={cn(DS_BUTTON_SECONDARY, "flex-1 py-1.5 justify-center text-[8px]")}
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              "flex-1 py-1.5 rounded-md text-[8px] font-mono font-bold uppercase tracking-wider transition-all",
              confirmColors,
            )}
          >
            {confirmLabel || (variant === "delete" ? "Supprimer" : variant === "add" ? "Ajouter" : "Confirmer")}
          </button>
        </div>
      </div>
    </div>
  );
}
