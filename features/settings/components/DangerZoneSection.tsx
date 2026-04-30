"use client";

import React, { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { WarningIcon, TrashIcon } from "@phosphor-icons/react";
import { deleteAccountSecure } from "@/actions/security-action";

const DS = {
  micro: "text-[9px] uppercase font-bold tracking-tighter",
  label: "text-[10px] uppercase font-bold tracking-wider text-slate-400",
  input:
    "bg-slate-100/50 border-0 border-b border-slate-200 focus:border-indigo-400 focus:bg-white focus:ring-0 transition-all",
  button:
    "flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[9px] font-bold uppercase tracking-wider transition-all",
};

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
      <div
        className={cn(
          "rounded-lg p-4 border border-rose-200/60 bg-rose-50/30",
          className,
        )}
      >
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded bg-rose-100 flex items-center justify-center shrink-0">
            <WarningIcon size={12} className="text-rose-500" weight="bold" />
          </div>
          <div className="flex-1">
            <h4 className={cn(DS.micro, "text-rose-600 mb-1")}>
              Zone de Danger
            </h4>
            <p className="text-[11px] text-rose-500/80 mb-3 leading-relaxed">
              Suppression définitive du compte. Toutes les données (clients,
              devis, historique) seront effacées immédiatement et de façon
              irréversible.
            </p>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className={cn(DS.button, "bg-rose-600 hover:bg-rose-500")}
            >
              <TrashIcon size={12} weight="bold" />
              Supprimer définitivement
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl border border-rose-200 shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <WarningIcon size={18} className="text-rose-600" weight="bold" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Confirmer la suppression
                </h2>
                <p className="text-[11px] text-slate-500">
                  Cette action est irréversible.
                </p>
              </div>
            </div>

            <div className="p-3 bg-rose-50 rounded-lg border border-rose-100 mb-5">
              <p className="text-[11px] text-rose-700 leading-relaxed">
                Votre compte, tous vos clients, devis et fichiers seront
                supprimés définitivement. Aucune restauration ne sera possible.
              </p>
            </div>

            <div className="mb-4">
              <label className={cn(DS.label, "mb-2 block text-slate-600")}>
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
                  DS.input,
                  "w-full px-3 py-2 text-sm rounded-t",
                  isMatch && inputEmail ? "bg-rose-50 border-rose-300" : "",
                )}
                autoComplete="off"
                autoFocus
              />
              {error && (
                <p className="mt-1 text-[10px] text-rose-600 flex items-center gap-1">
                  <WarningIcon size={9} /> {error}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setInputEmail("");
                  setError("");
                }}
                className="flex-1 px-3 py-2 text-[11px] font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition-all"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!isMatch || isPending}
                className={cn(
                  "flex-1 px-3 py-2 text-[11px] font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center gap-2",
                  isMatch && !isPending
                    ? "bg-rose-600 hover:bg-rose-700 text-white"
                    : "bg-rose-200 text-rose-400 cursor-not-allowed",
                )}
              >
                <TrashIcon size={11} weight="bold" />
                {isPending ? "Suppression…" : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
