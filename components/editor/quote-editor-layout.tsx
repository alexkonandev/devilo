"use client";

import React, { useState, createContext, useContext } from "react";
import { cn } from "@/lib/utils";
import { PlusIcon, TrashIcon } from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// 1. CONTEXTE FOCUS
// ═══════════════════════════════════════════════════════════════
interface FocusContextType {
  focusMode: boolean;
  setFocusMode: (value: boolean) => void;
  toggleFocus: () => void;
}

const FocusContext = createContext<FocusContextType | undefined>(undefined);

export const useFocusMode = () => {
  const context = useContext(FocusContext);
  if (!context)
    throw new Error("useFocusMode must be used within FocusProvider");
  return context;
};

// ═══════════════════════════════════════════════════════════════
// 2. LAYOUT PRINCIPAL
// ═══════════════════════════════════════════════════════════════
interface QuoteEditorLayoutProps {
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
  bottomToolbar: React.ReactNode;
  children: React.ReactNode;
  zoom: number;
  onNewQuote?: () => void;
  onDeleteQuote?: () => void;
}

export const QuoteEditorLayout = ({
  leftSidebar,
  rightSidebar,
  bottomToolbar,
  children,
  zoom,
  onNewQuote,
  onDeleteQuote,
}: QuoteEditorLayoutProps) => {
  const [focusMode, setFocusMode] = useState(false);
  const toggleFocus = () => setFocusMode((prev) => !prev);
  const showPanels = !focusMode;

  // Déclencheur du soft-occlusion à partir de 0.9
  const isZoomed = zoom > 0.9;

  // --- LOGIQUE MÉTIER LOCALE ---
  const handleNew = () => {
    if (onNewQuote) onNewQuote();
    else console.log("Création d'un nouveau devis...");
  };

  const handleDelete = () => {
    const isConfirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer ce devis ? Cette action est irréversible.",
    );
    if (isConfirmed) {
      if (onDeleteQuote) onDeleteQuote();
      else console.log("Suppression du devis...");
    }
  };

  return (
    <FocusContext.Provider value={{ focusMode, setFocusMode, toggleFocus }}>
      <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-slate-50">
        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TOP BAR : ACTIONS DU DOCUMENT (Centrée en haut)                 */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div
          className={
            "fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
          }
        >
          <div className="flex items-center gap-1 p-1.5 bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-sm transition-all hover:shadow-md">
            {/* BOUTON CRÉER */}
            <button
              onClick={handleNew}
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl hover:bg-slate-100 transition-all group active:scale-95"
              title="Créer un nouveau devis"
            >
              <PlusIcon className="w-4 h-4 text-slate-500 group-hover:text-slate-900" />
              <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900">
                Nouveau
              </span>
            </button>

            <div className="w-[1px] h-4 bg-slate-200/60 mx-1" />

            {/* BOUTON SUPPRIMER */}
            <button
              onClick={handleDelete}
              className="p-1.5 px-3 rounded-xl hover:bg-red-50 transition-all group active:scale-95 flex items-center justify-center"
              title="Supprimer ce devis"
            >
              <TrashIcon className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* ZONE DU DOCUMENT                                                */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="absolute inset-0 overflow-auto scrollbar-hide flex flex-col items-center select-text">
          <div
            className={cn(
              "flex-none pl-16 min-h-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
              // pt-28 (112px) donne de l'espace en haut pour la Top Bar
              // pb-[280px] assure qu'on peut scroller confortablement en bas
              isZoomed ? "pt-18 pb-[280px]" : "pt-18 pb-0",
            )}
          >
            <div
              className="relative transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] origin-top will-change-transform"
              style={{ transform: `scale(${zoom})` }}
            >
              <article
                id="printable-content"
                className="relative bg-white shadow-[0_32px_96px_-20px_rgba(0,0,0,0.15),0_8px_24px_-12px_rgba(0,0,0,0.08)] rounded-sm ring-1 ring-slate-900/5"
              >
                {children}
              </article>
            </div>
          </div>
        </div>

        {/* --- SIDEBAR GAUCHE --- */}
        {leftSidebar && (
          <aside
            className={cn(
              "fixed top-0 left-0 bottom-0 z-30 w-[360px] transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
              !showPanels || isZoomed
                ? "opacity-0 -translate-x-12 pointer-events-none"
                : "opacity-100 translate-x-0 pointer-events-auto",
            )}
          >
            <div className="h-full w-full">{leftSidebar}</div>
          </aside>
        )}

        {/* --- SIDEBAR DROITE --- */}
        {rightSidebar && (
          <aside
            className={cn(
              "fixed top-0 right-3 bottom-0 z-30 w-[300px] transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
              !showPanels || isZoomed
                ? "opacity-0 translate-x-12 pointer-events-none"
                : "opacity-100 translate-x-0 pointer-events-auto",
            )}
          >
            <div className="h-full w-full">{rightSidebar}</div>
          </aside>
        )}

        {/* --- TOOLBAR INFERIEURE --- */}
        <nav
          className={cn(
            "fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
            isZoomed && showPanels
              ? "opacity-10 hover:opacity-100 scale-95 hover:scale-100"
              : "opacity-100 scale-100",
          )}
        >
          {bottomToolbar}
        </nav>
      </div>
    </FocusContext.Provider>
  );
};
