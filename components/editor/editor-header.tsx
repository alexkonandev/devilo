"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  PlusIcon,
  TrashIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  CaretDownIcon,
  EyeIcon,
  LayoutIcon,
  FileTextIcon,
  ClockIcon,
  WarningCircleIcon,
  TicketIcon,
  ArrowRight,
} from "@phosphor-icons/react";
import { ConfirmDialog } from "@/components/shared/ui/confirm-dialog";
import {
  STUDIO_HEADER_LABEL,
  STUDIO_HEADER_BTN,
  STUDIO_HEADER_BTN_SM,
} from "@/lib/design-system";
import { useKernelStore } from "@/hooks/use-kernel-store";
import { listDraftQuotesAction } from "@/actions/quote-editor-action";
import { getAvailableTemplates } from "@/lib/template-system";

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════
interface DraftQuoteItem {
  id: string;
  number: string;
  clientName: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// ═══════════════════════════════════════════════════════════════
// PROPS
// ═══════════════════════════════════════════════════════════════
interface EditorHeaderProps {
  zoom: number;
  viewMode: "studio" | "preview";
  isPreview: boolean;
  activeQuoteNumber?: string;
  activeQuoteClient?: string;

  onNewQuote?: () => void;
  onDeleteQuote?: () => void;
  onPrint?: () => void;
  onSave?: () => void;

  setZoom: (zoom: number) => void;
  setViewMode: (mode: "studio" | "preview") => void;

  isSaving?: boolean;
  isZoomed?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// COMPOSANT HEADER
// ═══════════════════════════════════════════════════════════════
export const EditorHeader = ({
  zoom,
  viewMode,
  isPreview,
  activeQuoteNumber,
  activeQuoteClient,
  onNewQuote,
  onDeleteQuote,
  onPrint,
  onSave,
  setZoom,
  setViewMode,
  isSaving,
  isZoomed,
}: EditorHeaderProps) => {
  // ─── ÉTAT LOCAL : confirm dialog ───
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const onDeleteRef = useRef<() => void>(() => {});

  // ─── STORE ───
  const activeQuote = useKernelStore((s) => s.activeQuote);
  const billing = useKernelStore((s) => s.billing);

  // ─── QUOTA ───
  const isFreePlan = billing?.plan === "FREE";
  const quotaExceeded =
    isFreePlan && billing && billing.quotaUsed >= billing.quotaLimit;
  const quotaWarning =
    isFreePlan &&
    billing &&
    billing.quotaUsed >= billing.quotaLimit - 1 &&
    !quotaExceeded;
  const remainingQuota = billing ? billing.quotaLimit - billing.quotaUsed : 0;

  // ─── COMPTEUR DE LIGNES ───
  const MAX_ITEMS = 15;
  const WARN_ITEMS_THRESHOLD = 12;
  const itemCount = activeQuote?.items?.length ?? 0;
  const isItemLimitReached = itemCount >= MAX_ITEMS;
  const isItemWarning =
    itemCount >= WARN_ITEMS_THRESHOLD && !isItemLimitReached;

  // ─── ÉTAT : sélecteur de devis ───
  const router = useRouter();
  const [showQuoteSelector, setShowQuoteSelector] = useState(false);
  const [draftQuotes, setDraftQuotes] = useState<DraftQuoteItem[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const quoteSelectorRef = useRef<HTMLDivElement>(null);

  // Charger les brouillons au montage ou quand le client change
  useEffect(() => {
    const loadDrafts = async () => {
      setLoadingDrafts(true);
      const clientName = activeQuote?.client?.name || undefined;
      const result = await listDraftQuotesAction(10, clientName);
      if (result.success) {
        setDraftQuotes(result.data);
      }
      setLoadingDrafts(false);
    };
    loadDrafts();
  }, [activeQuote?.client?.name]);

  // Fermer le sélecteur au clic en dehors
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        quoteSelectorRef.current &&
        !quoteSelectorRef.current.contains(e.target as Node)
      ) {
        setShowQuoteSelector(false);
      }
    };
    if (showQuoteSelector) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showQuoteSelector]);

  const handleSelectQuote = (quoteId: string) => {
    setShowQuoteSelector(false);
    router.push(`/quotes/${quoteId}`);
  };

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
      {/* ─── BLOC GAUCHE : Nouveau / Supprimer / Sélecteur de devis ─── */}
      <div className="flex items-center gap-1.5">
        {/* ── SÉLECTEUR DE DEVIS ── */}
        <div className="relative" ref={quoteSelectorRef}>
          <button
            onClick={() => setShowQuoteSelector(!showQuoteSelector)}
            className={cn(
              STUDIO_HEADER_BTN,
              "px-2 gap-1.5 transition-all duration-200 border",
              showQuoteSelector
                ? "bg-indigo-500 text-white border-indigo-500"
                : "bg-white text-slate-600 hover:text-indigo-700 hover:border-indigo-200 border-slate-200"
            )}
            title="Changer de devis"
          >
            <FileTextIcon size={11} weight="bold" className="shrink-0" />
            <span
              className={cn(
                STUDIO_HEADER_LABEL,
                "relative top-[0.5px] max-w-[80px] truncate"
              )}
            >
              {activeQuote?.quote?.number || "Devis"}
            </span>
            <CaretDownIcon
              size={6}
              weight="bold"
              className={cn(
                "shrink-0 transition-transform duration-200",
                showQuoteSelector && "rotate-180"
              )}
            />
          </button>

          {/* ━━━ POPOVER SÉLECTEUR DE DEVIS ━━━ */}
          {showQuoteSelector && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg overflow-hidden z-60 shadow-lg">
              <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50/80">
                <span className="text-[9px] font-mono uppercase tracking-wider text-indigo-600 font-bold">
                  {loadingDrafts ? "Chargement..." : "Mes devis"}
                </span>
              </div>
              <div className="p-1.5 max-h-[280px] overflow-y-auto scrollbar-none">
                {draftQuotes.length === 0 && !loadingDrafts && (
                  <div className="text-center py-4">
                    <p className="text-[10px] font-mono text-slate-500">
                      Aucun brouillon
                    </p>
                  </div>
                )}
                {draftQuotes.map((dq) => (
                  <button
                    key={dq.id}
                    onClick={() => handleSelectQuote(dq.id)}
                    className={cn(
                      "flex items-center gap-2.5 w-full px-3 py-2 rounded-lg transition-all mb-0.5",
                      activeQuote?.quote?.number === dq.number
                        ? "bg-indigo-50 border border-indigo-200 shadow-sm"
                        : "hover:bg-slate-50 border border-transparent"
                    )}
                  >
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-[10px] font-mono font-bold text-slate-800 truncate">
                        {dq.number}
                      </p>
                      <p className="text-[8px] font-mono text-slate-500 truncate">
                        {dq.clientName || "Sans client"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <ClockIcon size={8} className="text-slate-400" />
                      <span className="text-[7px] font-mono text-slate-400">
                        {new Date(dq.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={handleNew}
          className={cn(
            STUDIO_HEADER_BTN,
            "hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 border border-transparent hover:border-indigo-200"
          )}
          title="Créer un nouveau devis"
        >
          <PlusIcon size={11} weight="bold" className="shrink-0" />
          <span
            className={cn(
              STUDIO_HEADER_LABEL,
              "text-slate-600 relative top-[0.5px]"
            )}
          >
            Nouveau
          </span>
        </button>
        <div className="w-px h-4 bg-slate-300" />
        <button
          onClick={handleDelete}
          className={cn(
            STUDIO_HEADER_BTN,
            "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
          )}
          title="Supprimer ce devis"
        >
          <TrashIcon size={11} weight="bold" className="shrink-0" />
          <span
            className={cn(
              STUDIO_HEADER_LABEL,
              "text-red-600 relative top-[0.5px]"
            )}
          >
            Supprimer
          </span>
        </button>
      </div>

      {/* ─── COLONNE CENTRALE (flex-1 pour centrer le groupe) ─── */}
      <div className="flex-1 flex justify-center">
        <div className="flex items-center justify-center gap-1 bg-slate-100/80 rounded-lg px-1.5 my-1 border border-slate-200">
          {/* Toggle Mode — segmented control */}
          <div className="flex items-center bg-white rounded-md p-0.5 gap-0.5 border border-slate-200/50">
            <button
              onClick={() => setViewMode("studio")}
              disabled={isZoomed}
              title="Mode édition avec panneaux latéraux"
              className={cn(
                STUDIO_HEADER_BTN,
                "transition-all duration-200 border",
                isZoomed && "opacity-50 cursor-not-allowed",
                !isZoomed && !isPreview
                  ? "bg-white text-slate-800 border-slate-200"
                  : !isZoomed &&
                      "text-slate-500 hover:text-slate-700 border-transparent"
              )}
            >
              <LayoutIcon
                size={11}
                weight={!isPreview ? "fill" : "regular"}
                className="shrink-0"
              />
            </button>
            <button
              onClick={() => setViewMode("preview")}
              disabled={isZoomed}
              title="Voir le document A4 sans les panneaux"
              className={cn(
                STUDIO_HEADER_BTN,
                "transition-all duration-200 border",
                isZoomed && "opacity-50 cursor-not-allowed",
                !isZoomed && isPreview
                  ? "bg-white text-slate-800 border-slate-200"
                  : !isZoomed &&
                      "text-slate-500 hover:text-slate-700 border-transparent"
              )}
            >
              <EyeIcon
                size={11}
                weight={isPreview ? "fill" : "regular"}
                className="shrink-0"
              />
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
                "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200"
              )}
            >
              <MagnifyingGlassMinusIcon
                size={11}
                weight="bold"
                className="shrink-0"
              />
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
                "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200"
              )}
            >
              <MagnifyingGlassPlusIcon
                size={11}
                weight="bold"
                className="shrink-0"
              />
            </button>
          </div>
        </div>
      </div>

      {/* ─── INDICATEUR DE QUOTA ─── */}
      {isFreePlan && quotaExceeded && (
        <a
          href="/billing"
          className={cn(
            STUDIO_HEADER_BTN,
            "px-2 gap-1 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700"
          )}
          title="Limite de devis atteinte"
        >
          <WarningCircleIcon
            size={11}
            weight="fill"
            className="shrink-0 text-red-600"
          />
          <span
            className={cn(
              STUDIO_HEADER_LABEL,
              "text-red-700 relative top-[0.5px]"
            )}
          >
            Limite atteinte
          </span>
        </a>
      )}
      {isFreePlan && quotaWarning && !quotaExceeded && (
        <a
          href="/billing"
          className={cn(
            STUDIO_HEADER_BTN,
            "px-2 gap-1 border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800"
          )}
          title="Plus que {remainingQuota} devis restant{remainingQuota > 1 ? 's' : ''}"
        >
          <WarningCircleIcon
            size={11}
            weight="fill"
            className="shrink-0 text-amber-600"
          />
          <span
            className={cn(
              STUDIO_HEADER_LABEL,
              "text-amber-800 relative top-[0.5px]"
            )}
          >
            {remainingQuota} restant{remainingQuota > 1 ? "s" : ""}
          </span>
        </a>
      )}

      {/* ─── BLOC DROITE : Continuer vers l'export ─── */}
      <button
        onClick={() => router.push("/quotes/new/export")}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[9px] font-mono font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-all"
        title="Personnaliser le template et exporter le devis"
      >
        <span className="whitespace-nowrap">
          Continuer vers l'export
        </span>
        <ArrowRight
          size={11}
          weight="bold"
          className="shrink-0"
        />
      </button>
    </header>
  );
};