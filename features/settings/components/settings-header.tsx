"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ConfigHeader } from "@/components/shared/layout/config-header";
import {
  FloppyDiskIcon,
  SpinnerIcon,
  SlidersIcon,
  XIcon,
} from "@phosphor-icons/react";

// ═══════════════════════════════════════════════════════════════════════════════
// SettingsHeader — barre sticky avec ConfigHeader + boutons save/cancel
// ═══════════════════════════════════════════════════════════════════════════════

interface SettingsHeaderProps {
  isDirty: boolean;
  isPending: boolean;
  onSave: () => void;
  onReset: () => void;
}

export function SettingsHeader({
  isDirty,
  isPending,
  onSave,
  onReset,
}: SettingsHeaderProps) {
  return (
    <div
      className={cn(
        "-mx-4 -mt-4  pt-4 pb-4  px-4 ",
        isDirty ? "sticky top-0 z-2 pt-0 mb-4" : ""
      )}
    >
      <div className="max-w-3xl mx-auto">
        <ConfigHeader
          title="Paramètres"
          description="Identité · Fiscalité · Sécurité"
          category={{ icon: SlidersIcon, label: "Configuration" }}
          accent="indigo"
          actions={
            <div className="flex items-center gap-1.5">
              {isDirty && (
                <button
                  type="button"
                  onClick={onReset}
                  disabled={isPending}
                  className="flex items-center justify-center w-7 h-7 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-md transition-all"
                >
                  <XIcon size={10} weight="bold" />
                </button>
              )}
              <button
                type="button"
                onClick={onSave}
                disabled={!isDirty || isPending}
                className={cn(
                  "flex items-center justify-center w-7 h-7 rounded-md transition-all",
                  isDirty
                    ? "bg-slate-900 hover:bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-300 cursor-not-allowed"
                )}
              >
                {isPending ? (
                  <SpinnerIcon size={10} className="animate-spin" />
                ) : (
                  <FloppyDiskIcon size={10} weight="bold" />
                )}
              </button>
            </div>
          }
        />
      </div>
    </div>
  );
}