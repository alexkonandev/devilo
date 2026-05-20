"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useReminders } from "./use-reminders";
import type { ReminderItem } from "@/actions/reminder-action";
import {
  DS_BENTO_CARD,
  DS_BUTTON,
  DS_MICRO,
  DS_MONO,
} from "@/lib/design-system";
import {
  Bell,
  WarningCircle,
  ClockUser,
  User,
  FileText,
  ArrowRight,
  X,
} from "@phosphor-icons/react";

const TYPE_CONFIG: Record<
  string,
  { icon: React.ElementType; color: string; bg: string }
> = {
  NO_QUOTES_90D: {
    icon: WarningCircle,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  SENT_NO_RESPONSE_14D: {
    icon: ClockUser,
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  VIP_INACTIVE_30D: {
    icon: User,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
};

function ReminderRow({
  reminder,
  onClose,
}: {
  reminder: ReminderItem;
  onClose: () => void;
}) {
  const config = TYPE_CONFIG[reminder.type] || {
    icon: Bell,
    color: "text-slate-600",
    bg: "bg-slate-50",
  };
  const Icon = config.icon;

  const actionHref =
    reminder.type === "NO_QUOTES_90D"
      ? `/quotes/new?clientId=${reminder.clientId}`
      : reminder.quoteId
        ? `/quotes/new?id=${reminder.quoteId}`
        : `/clients`;

  return (
    <div className="px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
            config.bg,
          )}
        >
          <Icon size={14} className={config.color} weight="bold" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className={cn(DS_MONO, "text-[12px] font-bold text-slate-900 truncate")}>
              {reminder.clientName}
            </p>
            <span className={cn(DS_MICRO, "text-slate-400 shrink-0")}>
              J-{reminder.daysSinceLastAction}
            </span>
          </div>
          <p className={cn(DS_MICRO, "text-slate-500 mt-0.5")}>
            {reminder.label}
          </p>
          <Link
            href={actionHref}
            onClick={onClose}
            className={cn(
              "inline-flex items-center gap-1 mt-2 text-[10px] font-bold",
              config.color,
              "hover:underline",
            )}
          >
            {reminder.actionLabel}
            <ArrowRight size={10} weight="bold" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ReminderPopover({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { reminders, totalCount, isLoading, refresh } = useReminders();
  const popoverRef = useRef<HTMLDivElement>(null);

  // Fermeture au clic en dehors
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Délai pour éviter la fermeture immédiate
    setTimeout(() => document.addEventListener("click", handleClick), 0);
    return () => document.removeEventListener("click", handleClick);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className={cn(
        "absolute top-8 right-0 z-50 w-[380px] max-h-[480px] overflow-hidden",
        DS_BENTO_CARD,
        "p-0 shadow-2xl border border-slate-200",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-slate-500" weight="bold" />
          <span className={cn(DS_MONO, "text-[12px] font-bold text-slate-900")}>
            Rappels
          </span>
          {totalCount > 0 && (
            <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 text-[9px] font-bold rounded-full">
              {totalCount}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-slate-100 transition-colors"
        >
          <X size={12} className="text-slate-400" />
        </button>
      </div>

      {/* Content */}
      <div className="overflow-y-auto max-h-[380px]">
        {isLoading && reminders.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className={cn(DS_MICRO, "text-slate-400")}>Analyse en cours...</p>
          </div>
        ) : reminders.length === 0 ? (
          <div className="py-12 text-center">
            <Bell size={24} className="text-slate-200 mx-auto mb-2" weight="duotone" />
            <p className={cn(DS_MICRO, "text-slate-300 italic")}>
              Aucun rappel pour le moment
            </p>
            <p className={cn(DS_MICRO, "text-slate-300 mt-1")}>
              Tout est à jour !
            </p>
          </div>
        ) : (
          reminders.map((reminder) => (
            <ReminderRow
              key={reminder.id}
              reminder={reminder}
              onClose={onClose}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-200 bg-slate-50">
        <span className={cn(DS_MICRO, "text-slate-400")}>
          {totalCount > 0
            ? `${totalCount} action${totalCount > 1 ? "s" : ""} recommandée${totalCount > 1 ? "s" : ""}`
            : "Aucune action requise"}
        </span>
        <button
          onClick={refresh}
          disabled={isLoading}
          className={cn(
            DS_MICRO,
            "text-indigo-600 font-bold hover:text-indigo-700 transition-colors",
            isLoading && "opacity-50 cursor-not-allowed",
          )}
        >
          {isLoading ? "..." : "Rafraîchir"}
        </button>
      </div>
    </div>
  );
}