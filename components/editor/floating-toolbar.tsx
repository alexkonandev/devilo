"use client";

import React, { useState } from "react";
import {
  PrinterIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  CircleNotchIcon,
  EyeIcon,
  PencilSimpleIcon,
  LayoutIcon,
  CloudCheckIcon,
  CaretDownIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EditorTheme } from "@/types/editor";

interface FloatingToolbarProps {
  zoom: number;
  setZoom: (zoom: number) => void;
  onPrint: () => void;
  onSave: () => void;
  isSaving: boolean;
  viewMode: "studio" | "preview";
  setViewMode: (mode: "studio" | "preview") => void;
  themes: EditorTheme[];
  activeThemeId: string;
  onThemeChange: (id: string) => void;
}

export const FloatingToolbar = ({
  zoom,
  setZoom,
  onPrint,
  onSave,
  isSaving,
  viewMode,
  setViewMode,
  themes,
  activeThemeId,
  onThemeChange,
}: FloatingToolbarProps) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 01. THEME PICKER (Figma-Style Overlay) */}
      {showThemeMenu && (
        <div className="mb-2 w-56 bg-white border border-slate-200/60   overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col p-1">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  onThemeChange(theme.id);
                  setShowThemeMenu(false);
                }}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors text-left",
                  activeThemeId === theme.id
                    ? "bg-slate-100"
                    : "hover:bg-slate-50"
                )}
              >
                <div
                  className="w-4 h-4  border border-black/5"
                  style={{ backgroundColor: theme.color }}
                />
                <span className="text-[12px] font-medium text-slate-700">
                  {theme.name}
                </span>
                {activeThemeId === theme.id && (
                  <div className="ml-auto w-1.5 h-1.5 bg-indigo-500 " />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 02. MAIN TOOLBAR (The Pill) */}
      <div className="flex items-center h-12 px-2 bg-white/90 backdrop-blur-md border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.08)] ">
        {/* TOOLS GROUP */}
        <div className="flex items-center gap-1 pr-2 border-r border-slate-200">
          <button
            onClick={() => setViewMode("studio")}
            className={cn(
              "p-2  transition-all",
              viewMode === "studio"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-100"
            )}
          >
            <PencilSimpleIcon
              size={18}
              weight={viewMode === "studio" ? "fill" : "bold"}
            />
          </button>
          <button
            onClick={() => setViewMode("preview")}
            className={cn(
              "p-2  transition-all",
              viewMode === "preview"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-100"
            )}
          >
            <EyeIcon
              size={18}
              weight={viewMode === "preview" ? "fill" : "bold"}
            />
          </button>
        </div>

        {/* ZOOM GROUP */}
        <div className="flex items-center gap-1 px-3 border-r border-slate-200">
          <button
            onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))}
            className="p-1.5 text-slate-400 hover:text-slate-900"
          >
            <MagnifyingGlassMinusIcon size={16} weight="bold" />
          </button>
          <span className="text-[11px] font-bold text-slate-700 w-10 text-center select-none font-mono">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(zoom + 0.1, 1.5))}
            className="p-1.5 text-slate-400 hover:text-slate-900"
          >
            <MagnifyingGlassPlusIcon size={16} weight="bold" />
          </button>
        </div>

        {/* STYLE SELECTOR */}
        <div className="flex items-center px-1 border-r border-slate-200">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5  transition-all",
              showThemeMenu
                ? "bg-slate-100"
                : "hover:bg-slate-100 text-slate-600"
            )}
          >
            <LayoutIcon size={18} weight="bold" />
            <CaretDownIcon
              size={10}
              weight="bold"
              className={cn(
                "transition-transform",
                showThemeMenu && "rotate-180"
              )}
            />
          </button>
        </div>

        {/* FINAL ACTIONS */}
        <div className="flex items-center gap-2 pl-2">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="p-2.5 text-slate-500 hover:text-indigo-600 transition-colors"
          >
            {isSaving ? (
              <CircleNotchIcon size={18} className="animate-spin" />
            ) : (
              <CloudCheckIcon size={20} weight="bold" />
            )}
          </button>

          <button
            onClick={onPrint}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white  transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            <PrinterIcon size={16} weight="bold" />
            <span className="text-[11px] font-black uppercase tracking-wider">
              Imprimer
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
