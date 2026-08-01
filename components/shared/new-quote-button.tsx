// ═══════════════════════════════════════════════════════════════════════════════
// NEW QUOTE BUTTON — Bouton réutilisable qui évite le flash blanc
// en naviguant directement vers le dernier brouillon s'il existe.
// ═══════════════════════════════════════════════════════════════════════════════

"use client";

import React, { forwardRef, useState, type ReactNode, type ButtonHTMLAttributes } from "react";
import { useRouter } from "next/navigation";
import { CircleNotch } from "@phosphor-icons/react";

interface NewQuoteButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

/**
 * Bouton "Nouveau Devis" intelligent.
 *
 * Avant de naviguer, il interroge `/api/quotes/last-draft` :
 * - Si un brouillon DRAFT existe → navigation directe vers `/quotes/{id}`
 * - Sinon → navigation vers `/quotes/new`
 *
 * Évite le flash blanc causé par la redirection serveur quotes/new → quotes/[id].
 *
 * Utilise forwardRef pour être compatible avec TooltipTrigger asChild de Radix UI.
 */
export const NewQuoteButton = forwardRef<HTMLButtonElement, NewQuoteButtonProps>(
  function NewQuoteButton({ children, className, ...props }, ref) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
      if (loading) return;
      setLoading(true);

      try {
        const res = await fetch("/api/quotes/last-draft");
        const { quoteId } = await res.json();

        if (quoteId) {
          router.push(`/quotes/${quoteId}`);
        } else {
          router.push("/quotes/new");
        }
      } catch {
        // Fallback silencieux en cas d'erreur réseau
        router.push("/quotes/new");
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={className}
        {...props}
      >
        {loading ? (
          <CircleNotch size={20} className="animate-spin" />
        ) : (
          children
        )}
      </button>
    );
  }
);