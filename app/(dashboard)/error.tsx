"use client";

import { cn } from "@/lib/utils";
import {
  DS_BUTTON,
  DS_BENTO_CARD,
  DS_TITLE,
  DS_MONO,
  DS_PAGE_SHELL,
  DS_PAGE_PADDING,
  DS_PAGE_CONTAINER,
} from "@/lib/design-system";
import { WarningCircle } from "@phosphor-icons/react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className={cn(DS_PAGE_SHELL, "flex items-center justify-center min-h-screen")}>
      <div className={cn(DS_PAGE_CONTAINER, DS_PAGE_PADDING, "max-w-md")}>
        <div className={cn(DS_BENTO_CARD, "p-8 text-center")}>
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-rose-50 flex items-center justify-center">
            <WarningCircle size={24} className="text-rose-500" weight="bold" />
          </div>
          <h1 className={cn(DS_TITLE, "text-base mb-2")}>Erreur inattendue</h1>
          <p className={cn(DS_MONO, "text-xs text-slate-400 mb-6")}>
            {error.message || "Une erreur est survenue sur cette page."}
          </p>
          <button onClick={reset} className={cn(DS_BUTTON, "px-6 py-2")}>
            Réessayer
          </button>
        </div>
      </div>
    </div>
  );
}