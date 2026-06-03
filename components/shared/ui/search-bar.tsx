// ═══════════════════════════════════════════════════════════════════════════════
// SEARCH BAR — Composant de recherche réutilisable (Clients, Devis, Catalogue…)
// Comportement identique partout : focus via Ctrl+K / Cmd+K, icône, clear button
// ═══════════════════════════════════════════════════════════════════════════════

"use client";

import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { MagnifyingGlassIcon, XCircleIcon } from "@phosphor-icons/react";
import { DS_INPUT } from "@/lib/design-system";

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  /** Affiche un spinner de chargement à droite */
  isLoading?: boolean;
  /** Largeur du conteneur (tailwind) */
  width?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Rechercher...",
  className,
  isLoading = false,
  width = "w-56",
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Raccourci clavier : Ctrl+K / Cmd+K pour focus la recherche
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={cn("relative", width, className)}>
      <MagnifyingGlassIcon
        size={12}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          DS_INPUT,
          "w-full pl-8 pr-8 py-1.5 rounded-md text-[11px]",
        )}
      />
      {isLoading && (
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
          <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {!isLoading && value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          <XCircleIcon size={12} />
        </button>
      )}
    </div>
  );
}