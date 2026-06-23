"use client";

import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  PlusIcon,
  TrashIcon,
  PrinterIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  PaletteIcon,
  CheckIcon,
  CaretDownIcon,
  EyeIcon,
  LayoutIcon,
} from "@phosphor-icons/react";
import { EditorTheme } from "@/types/editor";
import { ConfirmDialog } from "@/components/shared/ui/confirm-dialog";
import {
  STUDIO_HEADER_LABEL,
  STUDIO_HEADER_BTN,
  STUDIO_HEADER_BTN_SM,
} from "@/lib/design-system";

// ═══════════════════════════════════════════════════════════════
// PROPS
// ═══════════════════════════════════════════════════════════════
interface EditorHeaderProps {
  zoom: number;
  viewMode: "studio" | "preview";
  activeThemeId: string | null;
  isPreview: boolean;

  onNewQuote?: () => void;
  onDeleteQuote?: () => void;
  onPrint?: () => void;

  setZoom: (zoom: number) => void;
  setViewMode: (mode: "studio" | "preview") => void;
  setActiveThemeId: (id: string) => void;

  themes: EditorTheme[];
}

// ═══════════════════════════════════════════════════════════════
// COMPOSANT HEADER
// ═══════════════════════════════════════════════════════════════
export const EditorHeader = ({
  zoom,
  viewMode,
  activeThemeId,
  isPreview,
  onNewQuote,
  onDeleteQuote,
  onPrint,
  setZoom,
  setViewMode,
  setActiveThemeId,
  themes,
}: EditorHeaderProps) => {
  // ─── ÉTAT LOCAL : menu thème + confirm dialog ───
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const onDeleteRef = useRef<() => void>(() => {});

  // --- HANDLERS LOCAUX ---
  const handleNew = () => {
    if (onNewQuote) onNewQuote();
    else console.log("Création d'un nouveau devis...");
  };

  const handleDelete = () => {
    onDeleteRef.current = () => {
      if (onDeleteQuote) onDeleteQuote();
      else console.log("Suppression du devis...");
    };
    setConfirmDeleteOpen(true);
  };

  return (
    <header className="flex items-center h-12 p-3 border-b border-slate-200 bg-white shrink-0 gap-2">
      {/* ═══ MODAL DE CONFIRMATION SUPPRESSION ═══ */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        onConfirm={() => {
          onDeleteRef.current();
          setConfirmDeleteOpen(false);
        }}
        onCancel={() => setConfirmDeleteOpen(false)}
        variant="delete"
        title="SUPPRIMER LE DEVIS"
        description="Êtes-vous sûr de vouloir supprimer ce devis ? Cette action est irréversible."
      />
      {/* ─── BLOC GAUCHE : Nouveau / Supprimer ─── */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleNew}
          className={cn(
            STUDIO_HEADER_BTN,
            "hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-transparent hover:border-indigo-200",
          )}
          title="Créer un nouveau devis"
        >
          <PlusIcon size={11} weight="bold" className="shrink-0" />
          <span className={cn(STUDIO_HEADER_LABEL, "text-slate-600 relative top-[0.5px]")}>Nouveau</span>
        </button>
        <div className="w-px h-4 bg-slate-300" />
        <button
          onClick={handleDelete}
          className={cn(
            STUDIO_HEADER_BTN,
            "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200",
          )}
          title="Supprimer ce devis"
        >
          <TrashIcon size={11} weight="bold" className="shrink-0" />
          <span className={cn(STUDIO_HEADER_LABEL, "text-red-600 relative top-[0.5px]")}>Supprimer</span>
        </button>
      </div>

      {/* ─── COLONNE CENTRALE (flex-1 pour centrer le groupe) ─── */}
      <div className="flex-1 flex justify-center">
        <div className="flex items-center justify-center gap-1 bg-slate-100/80 rounded-lg px-2 py-0.5 border border-slate-200">
          {/* Toggle Mode — segmented control */}
          <div className="flex items-center bg-slate-100 rounded-md p-0.5 gap-0.5 border border-slate-200/50">
            <button
              onClick={() => setViewMode("studio")}
              title="Mode édition avec panneaux latéraux"
              className={cn(
                STUDIO_HEADER_BTN,
                "transition-all duration-200 border",
                !isPreview
                  ? "bg-white text-slate-800 border-slate-200"
                  : "text-slate-500 hover:text-slate-700 border-transparent",
              )}
            >
              <LayoutIcon size={11} weight={!isPreview ? "fill" : "regular"} className="shrink-0" />
              <span className={cn(STUDIO_HEADER_LABEL, "relative top-[0.5px]")}>Studio</span>
            </button>
            <button
              onClick={() => setViewMode("preview")}
              title="Voir le document A4 sans les panneaux"
              className={cn(
                STUDIO_HEADER_BTN,
                "transition-all duration-200 border",
                isPreview
                  ? "bg-white text-slate-800 border-slate-200"
                  : "text-slate-500 hover:text-slate-700 border-transparent",
              )}
            >
              <EyeIcon size={11} weight={isPreview ? "fill" : "regular"} className="shrink-0" />
              <span className={cn(STUDIO_HEADER_LABEL, "relative top-[0.5px]")}>Aperçu</span>
            </button>
          </div>

          <div className="w-px h-4 bg-slate-300" />

          {/* Zoom Controls */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setZoom(Math.max(zoom - 0.1, 0.4))}
              title="Zoom arrière"
              className={cn(
                STUDIO_HEADER_BTN_SM,
                "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200",
              )}
            >
              <MagnifyingGlassMinusIcon size={11} weight="bold" className="shrink-0" />
            </button>
            <div className="min-w-[36px] text-center">
              <span className="text-[9px] font-mono font-bold text-slate-800 bg-white rounded-md px-1.5 h-7 inline-flex items-center justify-center border border-slate-200 leading-none relative top-[0.5px]">
                {Math.round(zoom * 100)}%
              </span>
            </div>
            <button
              onClick={() => setZoom(Math.min(zoom + 0.1, 1.2))}
              title="Zoom avant"
              className={cn(
                STUDIO_HEADER_BTN_SM,
                "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200",
              )}
            >
              <MagnifyingGlassPlusIcon size={11} weight="bold" className="shrink-0" />
            </button>
          </div>

          <div className="w-px h-4 bg-slate-300" />

          {/* Theme Picker */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              title="Changer le thème"
              className={cn(
                STUDIO_HEADER_BTN,
                "px-2 transition-all duration-200 border",
                showThemeMenu
                  ? "bg-indigo-500 text-white border-indigo-500"
                  : "bg-white text-slate-600 hover:text-indigo-700 hover:border-indigo-200 border-slate-200",
              )}
            >
              <PaletteIcon size={11} weight="bold" className="shrink-0" />
              <span className={cn(STUDIO_HEADER_LABEL, "relative top-[0.5px]")}>Thème</span>
              <CaretDownIcon
                size={6}
                weight="bold"
                className={cn(
                  "shrink-0 transition-transform duration-200",
                  showThemeMenu && "rotate-180",
                )}
              />
            </button>

            {/* ━━━ THEME PICKER POPOVER ━━━ */}
            {showThemeMenu && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white border border-slate-200 rounded-lg overflow-hidden z-60 shadow-lg">
                <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50/80">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-indigo-600 font-bold">
                    Moteur de Style
                  </span>
                </div>
                <div className="p-1.5 max-h-[260px] overflow-y-auto scrollbar-none">
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
                          "flex items-center gap-2.5 w-full px-3 py-2 rounded-lg transition-all mb-0.5",
                          isSelected
                            ? "bg-indigo-50 border border-indigo-200 shadow-sm"
                            : "hover:bg-slate-50 border border-transparent",
                        )}
                      >
                        <div
                          className="w-5 h-5 rounded-md border-2 border-white shadow-sm shrink-0 flex items-center justify-center"
                          style={{ backgroundColor: theme.color }}
                        >
                          {isSelected && (
                            <CheckIcon size={10} weight="bold" className="text-white drop-shadow-sm" />
                          )}
                        </div>
                        <span
                          className={cn(
                            "text-[10px] font-mono font-bold uppercase tracking-tight",
                            isSelected ? "text-indigo-600" : "text-slate-600",
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
          </div>
        </div>
      </div>

      {/* ─── BLOC DROITE : Exporter ─── */}
      <div className="flex items-center justify-end">
          <button
            onClick={onPrint}
            className={cn(
              STUDIO_HEADER_BTN,
              "px-3 gap-1.5 bg-slate-900 hover:bg-indigo-700 text-white border border-slate-800",
            )}
          >
            <PrinterIcon size={11} weight="bold" className="shrink-0" />
            <span className={cn(STUDIO_HEADER_LABEL, "text-white relative top-[0.5px]")}>Exporter</span>
          </button>
      </div>
    </header>
  );
};