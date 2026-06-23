"use client";

import React, { useState, createContext, useContext } from "react";
import { cn } from "@/lib/utils";
import {
  DS_PAGE_SHELL,
  DS_LABEL,
} from "@/lib/design-system";
import { useKernelStore } from "@/hooks/use-kernel-store";
import { EditorTheme } from "@/types/editor";
import { EditorHeader } from "@/components/editor/editor-header";

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
// 2. LAYOUT PRINCIPAL — Bento Standard unifié
// ═══════════════════════════════════════════════════════════════
interface QuoteEditorLayoutProps {
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
  children: React.ReactNode;
  zoom: number;
  onNewQuote?: () => void;
  onDeleteQuote?: () => void;
  onPrint?: () => void;
  themes: EditorTheme[];
}

export const QuoteEditorLayout = ({
  leftSidebar,
  rightSidebar,
  children,
  zoom,
  onNewQuote,
  onDeleteQuote,
  onPrint,
  themes,
}: QuoteEditorLayoutProps) => {
  const [focusMode, setFocusMode] = useState(false);
  const toggleFocus = () => setFocusMode((prev) => !prev);
  const showPanels = !focusMode;

  // ─── STORE KERNEL ───
  const {
    setZoom,
    activeThemeId,
    setActiveThemeId,
    viewMode,
    setViewMode,
  } = useKernelStore();

  const isPreview = viewMode === "preview";

  // Soft-occlusion : on cache les panneaux latéraux si zoom > 90%
  const isZoomed = zoom > 0.9;

  return (
    <FocusContext.Provider value={{ focusMode, setFocusMode, toggleFocus }}>
      <div className={cn(DS_PAGE_SHELL, "flex flex-col")}>
        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TOP BAR : ACTIONS DU DOCUMENT + CONTROLES D'ÉDITION           */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <EditorHeader
          zoom={zoom}
          viewMode={viewMode}
          activeThemeId={activeThemeId}
          isPreview={isPreview}
          onNewQuote={onNewQuote}
          onDeleteQuote={onDeleteQuote}
          onPrint={onPrint}
          setZoom={setZoom}
          setViewMode={setViewMode}
          setActiveThemeId={setActiveThemeId}
          themes={themes}
        />

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* ZONE DE CONTENU PRINCIPALE                                     */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="flex-1 flex min-h-0 relative">
          {/* --- SIDEBAR GAUCHE --- */}
          {leftSidebar && (showPanels && !isZoomed) && (
            <aside className="shrink-0 w-[360px] border-r border-slate-200 bg-white overflow-y-auto animate-in fade-in slide-in-from-left-2 duration-300">
              <div className="h-full w-full">{leftSidebar}</div>
            </aside>
          )}

          {/* --- ZONE DU DOCUMENT AVEC SCROLL CENTRÉ --- */}
          <div className="flex-1 flex flex-col min-h-0 overflow-auto scrollbar-hide">
            <div className="flex-1 flex items-start justify-center py-8">
              <div
                className="relative transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] origin-top will-change-transform"
                style={{ transform: `scale(${zoom})` }}
              >
                <article
                  id="printable-content"
                  className="relative bg-white border border-slate-200 shadow-sm"
                >
                  {children}
                </article>
              </div>
            </div>
          </div>

          {/* --- SIDEBAR DROITE --- */}
          {rightSidebar && (showPanels && !isZoomed) && (
            <aside className="shrink-0 w-[300px] border-l border-slate-200 bg-white overflow-y-auto animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="h-full w-full">{rightSidebar}</div>
            </aside>
          )}
        </div>
      </div>
    </FocusContext.Provider>
  );
};