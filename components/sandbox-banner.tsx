"use client";

import React, { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { FlaskIcon, ArrowRightIcon, ArrowClockwiseIcon } from "@phosphor-icons/react";
import { notify } from "@/lib/notifications";

interface SandboxBannerProps {
  isDemoMode: boolean;
}

const DEMO_RESET_ENDPOINT = "/api/demo/reset";
const DEMO_RESET_TOKEN = "demo-reset";
const RESET_COOLDOWN_MS = 10_000;

export function SandboxBanner({ isDemoMode }: SandboxBannerProps) {
  const router = useRouter();
  const [isResetting, setIsResetting] = useState(false);
  const [lastResetAt, setLastResetAt] = useState<number | null>(null);
  const [justReset, setJustReset] = useState(false);
  const cooldownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isOnCooldown = lastResetAt !== null && Date.now() - lastResetAt < RESET_COOLDOWN_MS;

  const handleReset = useCallback(async () => {
    if (isResetting || isOnCooldown) return;

    const confirmed = window.confirm(
      "Réinitialiser les données de test ?\n\nTous les clients et devis créés en mode démo seront remplacés par les données d'origine."
    );
    if (!confirmed) return;

    setIsResetting(true);

    try {
      const res = await fetch(DEMO_RESET_ENDPOINT, {
        method: "POST",
        headers: {
          "x-demo-mode": "true",
          "x-demo-reset-token": DEMO_RESET_TOKEN,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Erreur inconnue");
      }

      setLastResetAt(Date.now());
      setJustReset(true);
      notify.success("Les données de démo ont été réinitialisées", "4 clients et 6 devis d'origine restaurés");
      router.refresh();

      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
      cooldownTimerRef.current = setTimeout(() => {
        setJustReset(false);
        setLastResetAt(null);
      }, RESET_COOLDOWN_MS);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Erreur inconnue";
      notify.error("Échec de la réinitialisation", errMsg);
    } finally {
      setIsResetting(false);
    }
  }, [isResetting, isOnCooldown, router]);

  if (!isDemoMode) return null;

  return (
    <div className="relative z-[60] flex items-center justify-center gap-3 px-4 py-1.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white border-b border-indigo-700/40">
      <div className="flex items-center gap-2 min-w-0">
        <span className="flex items-center gap-1.5 shrink-0">
          <FlaskIcon size={12} weight="fill" className="text-indigo-100" />
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest bg-white/15 border border-white/20 rounded px-1.5 py-0.5">
            Mode Démo (Sandbox)
          </span>
        </span>
        <span className="text-[10px] font-medium text-indigo-50 truncate hidden sm:inline">
          {"Vous testez Factouro en accès libre. Aucune inscription n'est requise."}
        </span>
      </div>

      <button
        type="button"
        onClick={handleReset}
        disabled={isResetting || isOnCooldown}
        className={cn(
          "flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-md",
          "border border-white/25 text-[9px] font-mono font-bold uppercase tracking-wider",
          "transition-all active:scale-[0.98]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          justReset
            ? "bg-emerald-500/30 text-emerald-50 border-emerald-300/40"
            : "bg-white/10 text-white hover:bg-white/20"
        )}
        title="Réinitialiser les données de démo à leur état d'origine"
      >
        <ArrowClockwiseIcon size={10} weight="bold" className={isResetting ? "animate-spin" : undefined} />
        {isResetting ? "Réinitialisation..." : justReset ? "Réinitialisé ✓" : "Réinitialiser les données de test"}
      </button>

      <Link
        href="/sign-up"
        className={cn(
          "flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-md",
          "bg-white text-indigo-700 hover:bg-indigo-50",
          "text-[9px] font-mono font-bold uppercase tracking-wider",
          "transition-all hover:scale-[1.03] active:scale-[0.98]",
          "shadow-sm"
        )}
      >
        Créer un vrai compte
        <ArrowRightIcon size={10} weight="bold" />
      </Link>
    </div>
  );
}