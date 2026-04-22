"use client";

import React, { useState } from "react";
import {
  PrinterIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  PaletteIcon,
  CheckIcon,
  CaretDownIcon,
  EyeIcon,
  LayoutIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useKernelStore } from "@/hooks/use-kernel-store";
import { EditorTheme } from "@/types/editor";

interface FloatingToolbarProps {
  onPrint: () => void;
  onSave: () => void; // Nouvelle action pour la sauvegarde manuelle
  themes: EditorTheme[];
}

export const FloatingToolbar = ({ onPrint, themes }: FloatingToolbarProps) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  // Connexion au Kernel Store
  const {
    zoom,
    setZoom,
    activeThemeId,
    setActiveThemeId,
    viewMode,
    setViewMode,
  } = useKernelStore();

  const isPreview = viewMode === "preview";

  return (
    <div className="flex flex-col items-center gap-2 relative">
      {/* ━━━ THEME PICKER POPOVER ━━━ */}
      {showThemeMenu && (
        <div className="absolute bottom-full mb-4 w-64 bg-white shadow-2xl border-2 border-slate-200 rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-200 z-60">
          <div className="px-4 py-4 border-b-2 border-slate-100 bg-slate-50/50">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600">
              Moteur de Style
            </span>
          </div>

          <div className="p-2 max-h-[300px] overflow-y-auto scrollbar-none">
            {themes.map((theme) => {
              const isSelected = activeThemeId === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => {
                    setActiveThemeId(theme.id);
                    setShowThemeMenu(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-all group mb-1 last:mb-0",
                    isSelected
                      ? "bg-indigo-50 border-2 border-indigo-100"
                      : "hover:bg-slate-50 border-2 border-transparent",
                  )}
                >
                  <div
                    className="w-5 h-5 rounded-xl border-2 border-white shrink-0 flex items-center justify-center shadow-md"
                    style={{ backgroundColor: theme.color }}
                  >
                    {isSelected && (
                      <CheckIcon
                        size={10}
                        weight="bold"
                        className="text-white"
                      />
                    )}
                  </div>

                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-tight",
                      isSelected
                        ? "text-indigo-600"
                        : "text-slate-600 group-hover:text-slate-900",
                    )}
                  >
                    {theme.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ━━━ MAIN TOOLBAR PILL - Glassmorphic ━━━ */}
      <div
        className={cn(
          "flex items-center h-12 px-2 gap-0.5 bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12),0_2px_8px_-2px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.6)] transition-all",
        )}
      >
        {/* Toggle Mode */}
        <div className="flex items-center gap-1 pr-2 border-r-2 border-slate-100">
          <ToolBtn
            active={isPreview}
            onClick={() => setViewMode(isPreview ? "studio" : "preview")}
            title={isPreview ? "Revenir à l'édition" : "Voir l'aperçu PDF"}
          >
            {isPreview ? (
              <LayoutIcon size={18} weight="fill" className="text-indigo-600" />
            ) : (
              <EyeIcon size={18} weight="bold" />
            )}
          </ToolBtn>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 px-2 border-r-2 border-slate-100 text-slate-600">
          <ToolBtn
            onClick={() => setZoom(Math.max(zoom - 0.1, 0.4))}
            title="Zoom arrière"
          >
            <MagnifyingGlassMinusIcon size={16} weight="bold" />
          </ToolBtn>

          <div className="w-12 text-center">
            <span className="text-[11px] font-mono font-black text-slate-800">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <ToolBtn
            onClick={() => setZoom(Math.min(zoom + 0.1, 1.2))}
            title="Zoom avant"
          >
            <MagnifyingGlassPlusIcon size={16} weight="bold" />
          </ToolBtn>
        </div>

        {/* Theme Picker */}
        <div className="flex items-center pl-1 border-r-2 border-slate-100 pr-2">
          <ToolBtn
            active={showThemeMenu}
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            title="Changer le thème"
          >
            <PaletteIcon size={18} weight="bold" />
            <CaretDownIcon
              size={10}
              weight="bold"
              className={cn(
                "ml-1.5 transition-transform duration-200",
                showThemeMenu && "rotate-180",
              )}
            />
          </ToolBtn>
        </div>

        {/* Print / Export Action */}
        <button
          onClick={onPrint}
          className={cn(
            "flex items-center gap-2.5 px-6 py-2.5 rounded-xl transition-all active:scale-95 shadow-lg ml-1",
            "bg-slate-900 hover:bg-indigo-600 text-white shadow-slate-900/20",
          )}
        >
          <PrinterIcon size={16} weight="bold" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">
            Exporter
          </span>
        </button>
      </div>
    </div>
  );
};

// ━━━ COMPOSANT INTERNE : ToolBtn ━━━
function ToolBtn({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "group relative flex items-center p-2.5 rounded-xl transition-all duration-200",
        active
          ? "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200"
          : "text-slate-400 hover:text-slate-900 hover:bg-slate-50",
      )}
    >
      {children}
    </button>
  );
}
