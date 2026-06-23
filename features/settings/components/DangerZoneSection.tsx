"use client";

import React, { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { WarningIcon, TrashIcon } from "@phosphor-icons/react";
import { deleteAccountSecure } from "@/actions/security-action";
import {
  DS_LABEL,
  DS_MONO,
  DS_MICRO,
  DS_INPUT,
  DS_BUTTON,
  DS_BUTTON_SECONDARY,
  DS_ICON_SM,
  DS_ICON_XS,
  DS_ICON_WRAPPER,
  DS_ROUNDED,
} from "@/lib/design-system";

interface DangerZoneCardProps {
  userEmail: string;
  className?: string;
}

export function DangerZoneCard({ userEmail, className }: DangerZoneCardProps) {
  const [open, setOpen] = useState(false);
  const [inputEmail, setInputEmail] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const isMatch =
    inputEmail.toLowerCase().trim() === userEmail.toLowerCase().trim();

  const handleConfirm = () => {
    if (!isMatch) {
      setError("L'email ne correspond pas.");
      return;
    }
    setError("");
    startTransition(async () => {
      const res = await deleteAccountSecure(inputEmail);
      if (res && !res.success) {
        setError(
          res.error === "EMAIL_MISMATCH"
            ? "Email incorrect."
            : (res.error ?? "Erreur inconnue."),
        );
      }
    });
  };

  return (
    <>
      <div className={cn("rounded-md border border-rose-200 bg-rose-50/30 p-2", className)}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className={cn(DS_ICON_WRAPPER, "bg-rose-100 shrink-0 w-5 h-5")}>
                <WarningIcon size={DS_ICON_XS} className="text-rose-500" weight="bold" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className={cn(DS_MICRO, "text-rose-600")}>Zone de Danger</span>
                <span className="text-[9px] text-rose-500 leading-tight">
                  Supprime définitivement votre compte et toutes les données associées.
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={cn(DS_BUTTON, "bg-rose-600 hover:bg-rose-500 h-6 text-[8px] px-2 shrink-0")}
          >
            <TrashIcon size={8} weight="bold" />
            Supprimer
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-md border border-rose-200 w-full max-w-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <WarningIcon size={14} className="text-rose-600" weight="bold" />
              </div>
              <div>
                <h2 className={cn(DS_MICRO, "text-slate-900")}>Confirmer la suppression</h2>
                <p className="text-[9px] text-slate-600">Action irréversible</p>
              </div>
            </div>

            <div className="mb-3">
              <label className={cn(DS_LABEL, "mb-1.5 block text-slate-600")}>
                Saisissez votre email pour confirmer
              </label>
              <input
                type="email"
                value={inputEmail}
                onChange={(e) => {
                  setInputEmail(e.target.value);
                  setError("");
                }}
                placeholder={userEmail || "votre@email.com"}
                className={cn(
                  DS_INPUT,
                  DS_ROUNDED,
                  "font-sans w-full text-xs",
                  isMatch && inputEmail ? "bg-rose-50 border-rose-300" : "",
                )}
                autoComplete="off"
                autoFocus
              />
              {error && (
                <p className="mt-1 text-[9px] text-rose-600 flex items-center gap-1">
                  <WarningIcon size={DS_ICON_XS} /> {error}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setInputEmail("");
                  setError("");
                }}
                className={DS_BUTTON_SECONDARY}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!isMatch || isPending}
                className={cn(
                  DS_BUTTON,
                  "bg-rose-600 hover:bg-rose-700 disabled:bg-rose-200 disabled:text-rose-400 disabled:cursor-not-allowed flex-1 justify-center",
                )}
              >
                <TrashIcon size={DS_ICON_SM} weight="bold" />
                {isPending ? "Suppression…" : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}