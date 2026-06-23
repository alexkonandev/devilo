"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  UserIcon,
  PlusIcon,
  ListBulletsIcon,
  MagnifyingGlassIcon,
  CaretLeftIcon,
  PackageIcon,
  TrashIcon,
  UserPlusIcon,
  XIcon,
  GlobeIcon,
  TrendUpIcon,
  ShieldCheckIcon,
  WarningCircleIcon,
  CheckCircleIcon,
  ClockCounterClockwiseIcon,
  CurrencyDollarIcon,
  IdentificationBadgeIcon,
  ClockIcon,
  TagIcon,
  SparkleIcon,
  StarIcon,
  FireIcon,
  EyeIcon,
  CheckSquare,
  Square,
  PhoneIcon,
  NotePencilIcon,
} from "@phosphor-icons/react";
import { useKernelStore } from "@/hooks/use-kernel-store";
import { useDebounce } from "@/hooks/use-debounce";
import { EditorCatalogOffer, EditorClient } from "@/types/editor";
import { cn } from "@/lib/utils";
import {
  DS_MONO,
  DS_MICRO,
  DS_ICON_SM,
  DS_ICON_XS,
  DS_ICON_WRAPPER,
} from "@/lib/design-system";
import {
  searchClients,
  getClientMetrics,
  getClientHistory,
} from "@/app/actions/studio";
import { notify } from "@/lib/notifications";
import { ConfirmDialog } from "@/components/shared/ui/confirm-dialog";
import { SuccessFeedback } from "@/components/shared/ui/success-feedback";
import { CreateClientDialog } from "@/components/editor/create-client-dialog";

// ═══════════════════════════════════════════════════════════════
// TOKENS COMPACTS POUR SIDEBAR — ACCESSIBILITÉ AMÉLIORÉE
// ═══════════════════════════════════════════════════════════════
const SIDEBAR_CARD = "bg-white border border-slate-200 rounded-md p-3";
const SIDEBAR_TAB_ACTIVE = "bg-white text-slate-900 border border-slate-200";
const SIDEBAR_TAB_INACTIVE = "text-slate-500 hover:text-slate-800";
const SIDEBAR_INPUT =
  "w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 font-mono text-[10px] text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all";
const SIDEBAR_LABEL = "text-[8px] font-mono uppercase tracking-wider text-slate-600 mb-1 block";

// Sous-tabs distincts (Inventaire / Suggestion) — Style "pastille" colorée
// Niveau hiérarchique inférieur aux tabs principaux (carte vs pill)
const SUBTAB_BAR = "flex items-center gap-1";
const SUBTAB_ACTIVE = "bg-indigo-600 text-white rounded-full px-2.5 py-0.5";
const SUBTAB_INACTIVE = "text-slate-400 hover:text-slate-600 px-2 py-0.5 rounded-full transition-colors";

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════
type ActiveTab = "client" | "lignes" | "catalogue";
type CatalogTab = "inventory" | "suggestion";

interface StudioSidebarLeftProps {
  onBack?: () => void;
  catalogItems: EditorCatalogOffer[];
  platformCatalog: EditorCatalogOffer[];
  initialClients: EditorClient[];
  userId: string;
}

// ═══════════════════════════════════════════════════════════════
// NAV TAB — Compact (TABS PRINCIPAUX)
// ═══════════════════════════════════════════════════════════════
function NavTab({
  icon: Icon,
  label,
  selected,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-center gap-1 py-1 rounded-md transition-all",
        selected ? SIDEBAR_TAB_ACTIVE : SIDEBAR_TAB_INACTIVE,
      )}
    >
      <Icon size={10} weight={selected ? "fill" : "regular"} />
      <span className={cn("text-[7px] font-mono uppercase tracking-wider", selected && "font-bold")}>{label}</span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// SOUS-TABS — Inventaire vs Suggestion (style distinct)
// ═══════════════════════════════════════════════════════════════
function SubTabButton({
  icon: Icon,
  label,
  selected,
  onClick,
  variant = "default",
}: {
  icon: React.ElementType;
  label: string;
  selected: boolean;
  onClick: () => void;
  variant?: "default" | "suggestion";
}) {
  const activeStyles =
    variant === "suggestion"
      ? "bg-violet-600 text-white rounded-full px-2.5 py-0.5"
      : SUBTAB_ACTIVE;
  const inactiveStyles =
    variant === "suggestion"
      ? "text-slate-400 hover:text-violet-600 px-2 py-0.5 rounded-full transition-colors"
      : SUBTAB_INACTIVE;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-1 text-[7px] font-mono uppercase tracking-wider font-medium transition-all",
        selected ? activeStyles : inactiveStyles,
      )}
    >
      <Icon size={7} weight={selected ? "fill" : "regular"} />
      <span>{label}</span>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMPOSANTS COMPACTS INTERNES
// ═══════════════════════════════════════════════════════════════

/** Champ compact avec label au-dessus */
function CompactField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={SIDEBAR_LABEL}>{label}</label>
      {children}
    </div>
  );
}

/** Input compact sidebar */
function CompactInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className={SIDEBAR_INPUT}
    />
  );
}

/** Textarea compact sidebar */
function CompactTextarea({
  value,
  onChange,
  placeholder,
}: {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      rows={2}
      className={cn(SIDEBAR_INPUT, "resize-none")}
    />
  );
}

/** Alert box compacte */
function CompactAlert({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-2 rounded-md bg-amber-50 border border-amber-200">
      <div className="flex items-start gap-1.5">
        <span className="mt-0.5 shrink-0 text-amber-600">{icon}</span>
        <div>
          <p className="text-[9px] font-mono font-bold text-amber-900">{title}</p>
          <p className="text-[8px] font-mono text-amber-700 mt-0.5">{description}</p>
        </div>
      </div>
    </div>
  );
}

/** Badge de suggestion avec score de pertinence */
function SuggestionBadge({ score }: { score: number }) {
  const color =
    score >= 85
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : score >= 60
        ? "bg-amber-100 text-amber-700 border-amber-200"
        : "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span className={cn("px-1.5 py-0.5 rounded-full text-[6px] font-mono font-bold border", color)}>
      Match {score}%
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export const StudioSidebarLeft = ({
  onBack,
  catalogItems,
  platformCatalog,
  initialClients,
  userId,
}: StudioSidebarLeftProps) => {
  const { activeQuote, updateField, addItem, updateItem, removeItem } =
    useKernelStore();

  const [activeTab, setActiveTab] = useState<ActiveTab>("client");
  const [catalogTab, setCatalogTab] = useState<CatalogTab>("inventory");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const debouncedSearch = useDebounce(clientSearch, 150);

  // ── État sélection multiple des lignes ──
  const [selectedItemIndices, setSelectedItemIndices] = useState<Set<number>>(new Set());

  const toggleItemSelection = (idx: number) => {
    setSelectedItemIndices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) newSet.delete(idx);
      else newSet.add(idx);
      return newSet;
    });
  };

  const selectAllItems = () => {
    if (!activeQuote) return;
    setSelectedItemIndices(new Set(activeQuote.items.map((_, i) => i)));
  };

  const clearItemSelection = () => setSelectedItemIndices(new Set());

  // ── État sélection multiple catalogue (Inventaire & Suggestion) ──
  const [selectedCatalogIndices, setSelectedCatalogIndices] = useState<Set<number>>(new Set());

  const toggleCatalogSelection = (idx: number) => {
    setSelectedCatalogIndices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) newSet.delete(idx);
      else newSet.add(idx);
      return newSet;
    });
  };

  const selectAllCatalog = (length: number) => {
    setSelectedCatalogIndices(new Set(Array.from({ length }, (_, i) => i)));
  };

  const clearCatalogSelection = () => setSelectedCatalogIndices(new Set());

  // ── État ConfirmDialog (useRef pour éviter stale closure) ──
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogVariant, setConfirmDialogVariant] = useState<"add" | "delete" | "info">("info");
  const [confirmDialogTitle, setConfirmDialogTitle] = useState("");
  const [confirmDialogDescription, setConfirmDialogDescription] = useState("");
  const [confirmDialogItemName, setConfirmDialogItemName] = useState<string | undefined>(undefined);
  const onConfirmRef = useRef<() => void>(() => {});

  // ── État SuccessFeedback ──
  const [feedback, setFeedback] = useState<{
    open: boolean;
    title: string;
    description?: string;
    variant: "success" | "error" | "info";
  }>({ open: false, title: "", variant: "success" });

  const showConfirm = (opts: {
    variant: "add" | "delete" | "info";
    title: string;
    description: string;
    itemName?: string;
    onConfirm: () => void;
  }) => {
    onConfirmRef.current = opts.onConfirm;
    setConfirmDialogVariant(opts.variant);
    setConfirmDialogTitle(opts.title);
    setConfirmDialogDescription(opts.description);
    setConfirmDialogItemName(opts.itemName);
    setConfirmDialogOpen(true);
  };

  const hideConfirm = () => {
    setConfirmDialogOpen(false);
    onConfirmRef.current = () => {};
  };

  const showFeedback = (opts: {
    title: string;
    description?: string;
    variant?: "success" | "error" | "info";
  }) => {
    setFeedback({ ...opts, open: true, variant: opts.variant || "success" });
  };

  const hideFeedback = () =>
    setFeedback((prev) => ({ ...prev, open: false }));

  const [searchResults, setSearchResults] =
    useState<EditorClient[]>(initialClients);
  const [isSearching, setIsSearching] = useState(false);
  const [clientMetrics, setClientMetrics] = useState<{
    outstanding: number;
    health: string;
  } | null>(null);
  const [clientHistory, setClientHistory] = useState<
    Array<{
      id: string;
      title: string;
      subtitle: string;
      unitPrice: number;
      quantity: number;
    }>
  >([]);

  useEffect(() => {
    const abortController = new AbortController();
    const performSearch = async () => {
      if (!debouncedSearch.trim()) {
        setSearchResults([]);
        return;
      }
      if (abortController.signal.aborted) return;
      setIsSearching(true);
      try {
        const results = await searchClients(debouncedSearch, userId);
        if (!abortController.signal.aborted) {
          setSearchResults(results);
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error("Error searching clients:", error);
          setSearchResults([]);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsSearching(false);
        }
      }
    };
    performSearch();
    return () => abortController.abort();
  }, [debouncedSearch, userId]);

  useEffect(() => {
    const abortController = new AbortController();
    const loadClientData = async () => {
      if (!activeQuote?.client.name) {
        setClientMetrics(null);
        setClientHistory([]);
        return;
      }
      if (abortController.signal.aborted) return;
      try {
        const clients = await searchClients(activeQuote.client.name, userId);
        if (abortController.signal.aborted) return;
        const selectedClient = clients.find(
          (c) => c.name === activeQuote.client.name,
        );
        if (selectedClient) {
          const metrics = await getClientMetrics(selectedClient.id, userId);
          if (abortController.signal.aborted) return;
          setClientMetrics(metrics);
          const history = await getClientHistory(selectedClient.id, userId);
          if (abortController.signal.aborted) return;
          setClientHistory(history);
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error("Error loading client data:", error);
        }
      }
    };
    loadClientData();
    return () => abortController.abort();
  }, [activeQuote?.client.name, userId]);

  if (!activeQuote) return null;

  const hasActiveClient = activeQuote.client.name.length > 0;

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-full text-[10px]">
      {/* ━━━ HEADER ━━━ */}
      <div className={cn(SIDEBAR_CARD, "mx-2 mt-2 mb-0 flex items-center gap-2")}>
        <button
          onClick={onBack}
          className={cn(DS_ICON_WRAPPER, "bg-slate-100 hover:bg-slate-900 hover:text-white transition-all shrink-0")}
        >
          <CaretLeftIcon size={DS_ICON_SM} />
        </button>
        <div className="flex flex-col min-w-0">
          <span className="text-[7px] font-mono uppercase tracking-widest text-slate-500">Workspace</span>
          <input
            value={activeQuote.title}
            onChange={(e) => {
              updateField(null, "title", e.target.value);
            }}
            className="bg-transparent border-none p-0 text-[10px] font-mono font-bold text-slate-900 outline-none truncate"
            placeholder="Nom du projet..."
          />
        </div>
      </div>

      {/* ━━━ NAV PRINCIPALE ━━━ */}
      <div className="px-2 mt-2">
        <div className="flex p-0.5 bg-slate-100 rounded-md">
          <NavTab icon={UserIcon} label="Client" selected={activeTab === "client"} onClick={() => setActiveTab("client")} />
          <NavTab icon={ListBulletsIcon} label="Devis" selected={activeTab === "lignes"} onClick={() => setActiveTab("lignes")} />
          <NavTab icon={PackageIcon} label="Offres" selected={activeTab === "catalogue"} onClick={() => setActiveTab("catalogue")} />
        </div>
      </div>

      {/* ═══ MODAL DE CONFIRMATION ═══ */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onConfirm={() => {
          onConfirmRef.current();
        }}
        onCancel={hideConfirm}
        variant={confirmDialogVariant}
        title={confirmDialogTitle}
        description={confirmDialogDescription}
        itemName={confirmDialogItemName}
      />

      {/* ═══ FEEDBACK DOPAMINERGIQUE ═══ */}
      <SuccessFeedback
        open={feedback.open}
        onClose={hideFeedback}
        title={feedback.title}
        description={feedback.description}
        variant={feedback.variant}
        autoClose={2500}
      />

      <div className="mx-2 my-2 h-px bg-slate-200" />

      {/* ━━━ CONTENT ━━━ */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-2 pb-3 flex flex-col gap-2">
        {/* ── TAB CLIENT ── */}
        {activeTab === "client" && (
          <div className="space-y-2">
            {/* CreateClientDialog */}
            <CreateClientDialog
              open={showCreateDialog}
              onClose={() => setShowCreateDialog(false)}
              onSuccess={(client) => {
                updateField("client", "name", client.name);
                updateField("client", "email", client.email || "");
                updateField("client", "address", client.address || "");
                notify.success("CLIENT CRÉÉ", client.name);
              }}
            />

            <>
              <div className={SIDEBAR_CARD}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[8px] font-mono uppercase tracking-wider text-slate-600 flex items-center gap-1">
                      <MagnifyingGlassIcon size={10} className="text-slate-500" />
                      Trouver un client
                    </span>
                    <button
                      onClick={() => setShowCreateDialog(true)}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all"
                    >
                      <UserPlusIcon size={10} />
                      <span className="text-[7px] font-mono uppercase tracking-widest text-indigo-600">Créer</span>
                    </button>
                  </div>
                  <div className="relative">
                    <MagnifyingGlassIcon
                      size={10}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      placeholder="Nom, Email, Société..."
                      className={cn(SIDEBAR_INPUT, "pl-7")}
                    />
                  </div>

                  {clientSearch && (
                    <div className="mt-1.5 space-y-0.5">
                      {isSearching ? (
                        <div className="text-center py-2">
                          <span className="text-[8px] font-mono text-slate-500">Recherche...</span>
                        </div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => {
                              updateField("client", "name", c.name);
                              updateField("client", "email", c.email || "");
                              updateField("client", "address", c.address || "");
                              updateField("client", "taxId", c.taxId || "");
                              setClientSearch("");
                              notify.success("CLIENT SÉLECTIONNÉ", c.name);
                            }}
                            className="w-full text-left p-1.5 hover:bg-slate-50 rounded-md border border-transparent hover:border-slate-200 transition-all"
                          >
                            <p className={cn(DS_MONO, "text-[10px] text-slate-800 truncate")}>{c.name}</p>
                            <p className="text-[8px] font-mono text-slate-500 truncate mt-0.5">{c.email}</p>
                          </button>
                        ))
                      ) : (
                        <div className="text-center py-2">
                          <span className="text-[8px] font-mono text-slate-500">Aucun client trouvé</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {!hasActiveClient && (
                  <CompactAlert
                    icon={<WarningCircleIcon size={10} />}
                    title="Client requis"
                    description="Sélectionnez un client pour la conformité"
                  />
                )}

                {hasActiveClient && (
                  <div className="space-y-2">
                    <div className={cn(SIDEBAR_CARD, "border-emerald-400")}>
                      <div className="flex items-start justify-between mb-1.5">
                        <div>
                          <span className="text-[8px] font-mono uppercase tracking-wider text-slate-600 block flex items-center gap-1">
                            <IdentificationBadgeIcon size={10} className="text-slate-500" />
                            Client Actif
                          </span>
                          <h3 className="text-[11px] font-mono font-bold truncate pr-4 mt-0.5 text-slate-900">{activeQuote.client.name}</h3>
                          <p className="text-[8px] font-mono text-slate-500 mt-0.5">{activeQuote.client.email || "Aucun email"}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] font-mono uppercase tracking-wider text-slate-500">Encours</span>
                          <p className={cn(DS_MONO, "text-[10px] text-emerald-600 mt-0.5")}>
                            {clientMetrics?.outstanding
                              ? clientMetrics.outstanding.toLocaleString() + " XOF"
                              : "0 XOF"}
                          </p>
                        </div>
                      </div>
                      <div className="pt-1.5 border-t border-slate-100 flex gap-1.5">
                        <span className={cn(
                          "px-1.5 py-0.5 rounded-md text-[7px] font-mono font-bold flex items-center gap-1",
                          clientMetrics?.health === "À JOUR"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700",
                        )}>
                          {clientMetrics?.health === "À JOUR" ? (
                            <CheckCircleIcon size={8} />
                          ) : (
                            <WarningCircleIcon size={8} />
                          )}
                          {clientMetrics?.health || "---"}
                        </span>
                      </div>
                    </div>

                    <div className={SIDEBAR_CARD}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[8px] font-mono uppercase tracking-wider text-slate-600 flex items-center gap-1">
                          <CurrencyDollarIcon size={10} className="text-slate-500" />
                          Adresse légale
                        </span>
                        <span className="text-[7px] font-mono uppercase tracking-widest text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">Requis</span>
                      </div>
                      <CompactField label="Société">
                        <CompactInput
                          value={activeQuote.client.name}
                          onChange={(v) => updateField("client", "name", v)}
                        />
                      </CompactField>
                      <div className="mt-1.5">
                        <CompactField label="Adresse">
                          <CompactTextarea
                            value={activeQuote.client.address}
                            onChange={(v) => updateField("client", "address", v)}
                          />
                        </CompactField>
                      </div>
                    </div>

                    <div className={SIDEBAR_CARD}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[8px] font-mono uppercase tracking-wider text-slate-600 flex items-center gap-1">
                          <PhoneIcon size={10} className="text-slate-500" />
                          Contact
                        </span>
                      </div>
                      <CompactField label="Email">
                        <CompactInput
                          value={activeQuote.client.email}
                          onChange={(v) => updateField("client", "email", v)}
                          placeholder="email@exemple.com"
                        />
                      </CompactField>
                      <div className="mt-1.5">
                        <CompactField label="Téléphone">
                          <CompactInput
                            value={activeQuote.client.phone}
                            onChange={(v) => updateField("client", "phone", v)}
                            placeholder="+226 XX XX XX XX"
                          />
                        </CompactField>
                      </div>
                    </div>

                    <div className={SIDEBAR_CARD}>
                      <span className="text-[8px] font-mono uppercase tracking-wider text-slate-600 mb-1.5 block flex items-center gap-1">
                        <NotePencilIcon size={10} className="text-slate-500" />
                        Notes internes
                      </span>
                      <CompactTextarea
                        value={activeQuote.client.notes}
                        onChange={(v) => updateField("client", "notes", v)}
                        placeholder="Informations complémentaires..."
                      />
                    </div>

                    <div className={SIDEBAR_CARD}>
                      <span className="text-[8px] font-mono uppercase tracking-wider text-slate-600 mb-1.5 block flex items-center gap-1">
                        <ClockIcon size={10} className="text-slate-500" />
                        Historique
                      </span>
                      {clientHistory.length > 0 ? (
                        <div className="space-y-0.5">
                          {clientHistory.map((histItem) => (
                            <button
                              key={histItem.id}
                              onClick={() => {
                                addItem({ title: histItem.title, unitPrice: histItem.unitPrice, quantity: 1, baseCost: 0 });
                                showFeedback({ title: "LIGNE AJOUTÉE", description: histItem.title });
                              }}
                              className="w-full flex items-center justify-between p-1.5 rounded-md border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all"
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <div className={cn(DS_ICON_WRAPPER, "bg-slate-100 shrink-0")}>
                                  <ClockCounterClockwiseIcon size={DS_ICON_XS} />
                                </div>
                                <span className="text-[10px] font-mono text-slate-700 truncate">{histItem.title}</span>
                              </div>
                              <PlusIcon size={12} className="text-slate-400 shrink-0" />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <div className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-slate-100 mb-1.5">
                            <ClockIcon size={12} className="text-slate-400" />
                          </div>
                          <p className="text-[10px] font-mono text-slate-700 mb-0.5">Aucun historique</p>
                          <p className="text-[8px] font-mono text-slate-500">Les anciennes prestations réapparaîtront ici</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
          </div>
        )}

        {/* ── TAB LIGNES ── */}
        {activeTab === "lignes" && (
          <div className="space-y-2">
            {/* Bandeau sélection / actions groupées */}
            {activeQuote.items.length > 0 && (
              selectedItemIndices.size > 0 ? (
                <div className="px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-md space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckSquare size={14} weight="fill" className="text-indigo-600 shrink-0" />
                      <span className="text-[10px] font-mono font-bold text-indigo-700">
                        {selectedItemIndices.size} ligne{selectedItemIndices.size > 1 ? "s" : ""} sélectionnée{selectedItemIndices.size > 1 ? "s" : ""}
                      </span>
                    </div>
                    <button
                      onClick={clearItemSelection}
                      className="px-2 py-0.5 rounded text-[7px] font-mono uppercase tracking-wider text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                    >
                      Annuler
                    </button>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        if (selectedItemIndices.size === activeQuote.items.length) {
                          clearItemSelection();
                        } else {
                          selectAllItems();
                        }
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-white border border-slate-200 text-slate-600 hover:border-indigo-200 hover:text-indigo-600 transition-all text-[7px] font-mono uppercase tracking-wider"
                    >
                      {selectedItemIndices.size === activeQuote.items.length ? "Tout déselectionner" : "Tout sélectionner"}
                    </button>
                    <button
                      onClick={() => {
                        showConfirm({
                          variant: "delete",
                          title: "SUPPRIMER LES LIGNES",
                          description: `${selectedItemIndices.size} ligne${selectedItemIndices.size > 1 ? "s" : ""} seront supprimée${selectedItemIndices.size > 1 ? "s" : ""}. Cette action est irréversible.`,
                          onConfirm: () => {
                            const sorted = Array.from(selectedItemIndices).sort((a, b) => b - a);
                            sorted.forEach((i) => removeItem(i));
                            clearItemSelection();
                            hideConfirm(); 
                            showFeedback({ title: "LIGNES SUPPRIMÉES", description: `${sorted.length} ligne${sorted.length > 1 ? "s" : ""} supprimée${sorted.length > 1 ? "s" : ""}.` });
                          },
                        });
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all text-[7px] font-mono font-bold uppercase tracking-wider"
                    >
                      <TrashIcon size={10} />
                      Supprimer la sélection
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-700">Sélection multiple</span>
                    <button
                      onClick={selectAllItems}
                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600 transition-all text-[7px] font-mono uppercase tracking-wider"
                    >
                      <CheckSquare size={10} />
                      Tout sélectionner
                    </button>
                  </div>
                  <p className="text-[8px] font-mono text-slate-500 mt-1 leading-relaxed">
                    Cochez les lignes à supprimer, ou utilisez «&nbsp;Tout sélectionner&nbsp;».
                  </p>
                </div>
              )
            )}
            {activeQuote.items.map((item, idx) => {
              const isSelected = selectedItemIndices.has(idx);
              return (
                <div key={idx} className={cn(SIDEBAR_CARD, "relative flex items-start gap-1.5", isSelected && "border-indigo-300 bg-indigo-50/30")}>
                  <div className="pt-[10px]">
                    <button
                      onClick={() => toggleItemSelection(idx)}
                      className="inline-flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare size={12} weight="fill" className="text-indigo-600" />
                      ) : (
                        <Square size={12} />
                      )}
                    </button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="space-y-2 pr-5">
                      <div className="flex items-start justify-between">
                        <input
                          value={item.title}
                          onChange={(e) => updateItem(idx, "title", e.target.value)}
                          className="flex-1 bg-transparent text-[10px] font-mono font-bold text-slate-900 outline-none placeholder:text-slate-400"
                          placeholder="Prestation..."
                        />
                        <button
                          onClick={() =>
                            showConfirm({
                              variant: "delete",
                              title: "SUPPRIMER LA LIGNE",
                              description: "Cette action est irréversible.",
                              itemName: item.title,
                              onConfirm: () => {
                                removeItem(idx);
                                hideConfirm();
                                showFeedback({ title: "LIGNE SUPPRIMÉE", description: item.title });
                              },
                            })
                          }
                          className="text-slate-400 hover:text-rose-500 transition-all shrink-0"
                        >
                          <TrashIcon size={12} />
                        </button>
                      </div>
                      <textarea
                        value={item.subtitle || ""}
                        onChange={(e) => updateItem(idx, "subtitle", e.target.value)}
                        className="w-full bg-transparent text-[8px] font-mono text-slate-500 outline-none resize-none leading-relaxed"
                        rows={3}
                        placeholder="Description détaillée de la prestation..."
                      />
                      <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-100">
                        <div>
                          <label className="text-[7px] font-mono uppercase tracking-widest text-slate-500">Prix</label>
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(idx, "unitPrice", parseFloat(e.target.value) || 0)}
                            className={cn(SIDEBAR_INPUT, "h-7 text-[9px]")}
                          />
                        </div>
                        <div>
                          <label className="text-[7px] font-mono uppercase tracking-widest text-indigo-500">Coût</label>
                          <input
                            type="number"
                            value={item.baseCost || 0}
                            onChange={(e) => updateItem(idx, "baseCost", parseFloat(e.target.value) || 0)}
                            className={cn(SIDEBAR_INPUT, "h-7 text-[9px] bg-indigo-50/30 border-indigo-100")}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {activeQuote.items.length === 0 && (
              <div className={cn(SIDEBAR_CARD, "text-center py-6")}>
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-slate-100 mb-2">
                  <ListBulletsIcon size={14} className="text-slate-500" />
                </div>
                <p className="text-[10px] font-mono text-slate-700 mb-0.5">Commencez votre devis</p>
                <p className="text-[8px] font-mono text-slate-500">Ajoutez votre première ligne de prestation</p>
              </div>
            )}
            <button
              onClick={() =>
                showConfirm({
                  variant: "add",
                  title: "AJOUTER UNE LIGNE",
                  description: "Une nouvelle ligne de prestation sera ajoutée au devis.",
                  onConfirm: () => {
                    addItem({ title: "Nouveau service", unitPrice: 0, quantity: 1, baseCost: 0 });
                    hideConfirm();
                    showFeedback({ title: "LIGNE AJOUTÉE", description: "Nouveau service" });
                  },
                })
              }
              className="w-full py-2 border border-dashed border-slate-200 rounded-md text-slate-500 hover:border-indigo-300 hover:text-indigo-500 transition-all flex items-center justify-center gap-1.5"
            >
              <PlusIcon size={12} />
              <span className="text-[8px] font-mono uppercase tracking-wider">Ajouter un item</span>
            </button>
          </div>
        )}

        {/* ── TAB CATALOGUE ── */}
        {activeTab === "catalogue" && (
          <div className="space-y-2">
            <div className={SUBTAB_BAR}>
              <SubTabButton
                icon={PackageIcon}
                label="Inventaire"
                selected={catalogTab === "inventory"}
                onClick={() => setCatalogTab("inventory")}
                variant="default"
              />
              <SubTabButton
                icon={SparkleIcon}
                label="Suggestion"
                selected={catalogTab === "suggestion"}
                onClick={() => setCatalogTab("suggestion")}
                variant="suggestion"
              />
            </div>

            {catalogTab === "inventory" ? (
              <div className="space-y-1.5">
                {/* Bandeau sélection inventaire */}
                {catalogItems.length > 0 && (
                  selectedCatalogIndices.size > 0 ? (
                    <div className="px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-md space-y-1.5">
                      <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-indigo-700">
                        {selectedCatalogIndices.size} offre{selectedCatalogIndices.size > 1 ? "s" : ""} sélectionnée{selectedCatalogIndices.size > 1 ? "s" : ""}
                      </span>
                      <button onClick={clearCatalogSelection} className="px-2 py-0.5 rounded text-[7px] font-mono uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-all">
                        Annuler
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                          onClick={() => selectAllCatalog(catalogItems.length)}
                          className="flex items-center gap-1 px-2 py-1 rounded bg-white border border-slate-200 text-slate-600 hover:border-indigo-200 hover:text-indigo-600 transition-all text-[7px] font-mono uppercase tracking-wider"
                        >
                          {selectedCatalogIndices.size === catalogItems.length ? "Tout déselectionner" : "Sélectionner tout"}
                        </button>
                        <button
                          onClick={() => {
                            const sorted = Array.from(selectedCatalogIndices).sort((a, b) => b - a);
                            sorted.forEach((i) => {
                              const offer = catalogItems[i];
                              if (offer) addItem({ title: offer.title, unitPrice: offer.unitPrice, quantity: 1, baseCost: 0 });
                            });
                            clearCatalogSelection();
                            showFeedback({ title: "OFFRES AJOUTÉES", description: `${sorted.length} offre${sorted.length > 1 ? "s" : ""} ajoutée${sorted.length > 1 ? "s" : ""} au devis` });
                          }}
                          className="flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-all text-[7px] font-mono font-bold uppercase tracking-wider"
                        >
                          <PlusIcon size={10} />
                          Ajouter au devis
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-slate-700">Sélection multiple</span>
                        <button
                          onClick={() => selectAllCatalog(catalogItems.length)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600 transition-all text-[7px] font-mono uppercase tracking-wider"
                        >
                          <CheckSquare size={10} />
                          Tout sélectionner
                        </button>
                      </div>
                      <p className="text-[8px] font-mono text-slate-500 mt-1 leading-relaxed">
                        Cochez les offres à ajouter, ou utilisez «&nbsp;Tout sélectionner&nbsp;».
                      </p>
                    </div>
                  )
                )}
                {catalogItems.length === 0 && (
                  <div className={cn(SIDEBAR_CARD, "text-center py-6")}>
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-slate-100 mb-2">
                      <PackageIcon size={14} className="text-slate-500" />
                    </div>
                    <p className="text-[10px] font-mono text-slate-700 mb-0.5">Inventaire vide</p>
                    <p className="text-[8px] font-mono text-slate-500">Créez vos offres depuis le catalogue</p>
                  </div>
                )}
                {catalogItems.map((offer, idx) => {
                  const isSelected = selectedCatalogIndices.has(idx);
                  return (
                    <div key={offer.id} className={cn(SIDEBAR_CARD, "flex items-start gap-1.5", isSelected && "border-indigo-300 bg-indigo-50/30")}>
                      <div className="pt-[6px]">
                        <button
                          onClick={() => toggleCatalogSelection(idx)}
                          className="inline-flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
                        >
                          {isSelected ? (
                            <CheckSquare size={12} weight="fill" className="text-indigo-600" />
                          ) : (
                            <Square size={12} />
                          )}
                        </button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {offer.isPremium ? (
                              <ShieldCheckIcon size={10} className="text-amber-500 shrink-0" />
                            ) : (
                              <PackageIcon size={10} className="text-slate-400 shrink-0" />
                            )}
                            <p className="text-[10px] font-mono font-bold text-slate-900 truncate">{offer.title}</p>
                          </div>
                          <button
                            onClick={() => {
                              addItem({ title: offer.title, unitPrice: offer.unitPrice, quantity: 1, baseCost: 0 });
                              showFeedback({ title: "SERVICE AJOUTÉ", description: offer.title });
                            }}
                            className="ml-1 w-5 h-5 rounded bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-all shrink-0 cursor-pointer"
                          >
                            <PlusIcon size={8} />
                          </button>
                        </div>
                        <p className="text-[8px] font-mono text-slate-500 truncate mb-1.5">{offer.subtitle}</p>
                        <div className="pt-1.5 border-t border-slate-100">
                          <span className="text-[6px] font-mono uppercase tracking-widest text-slate-500">Tarif</span>
                          <p className="text-[9px] font-mono text-slate-900 mt-0.5">{offer.unitPrice.toLocaleString()} <span className="text-[6px] text-slate-500">XOF</span></p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-1.5">
                {/* Bandeau sélection suggestions */}
                {platformCatalog.length > 0 && (
                  selectedCatalogIndices.size > 0 ? (
                    <div className="px-3 py-2 bg-violet-50 border border-violet-200 rounded-md space-y-1.5">
                      <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-violet-700">
                        {selectedCatalogIndices.size} suggestion{selectedCatalogIndices.size > 1 ? "s" : ""} sélectionnée{selectedCatalogIndices.size > 1 ? "s" : ""}
                      </span>
                      <button onClick={clearCatalogSelection} className="px-2 py-0.5 rounded text-[7px] font-mono uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-all">
                        Annuler
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                          onClick={() => selectAllCatalog(platformCatalog.length)}
                          className="flex items-center gap-1 px-2 py-1 rounded bg-white border border-slate-200 text-slate-600 hover:border-violet-200 hover:text-violet-600 transition-all text-[7px] font-mono uppercase tracking-wider"
                        >
                          {selectedCatalogIndices.size === platformCatalog.length ? "Tout déselectionner" : "Sélectionner tout"}
                        </button>
                        <button
                          onClick={() => {
                            const sorted = Array.from(selectedCatalogIndices).sort((a, b) => b - a);
                            sorted.forEach((i) => {
                              const offer = platformCatalog[i];
                              if (offer) addItem({ title: offer.title, unitPrice: offer.unitPrice, quantity: 1, baseCost: 0 });
                            });
                            clearCatalogSelection();
                            showFeedback({ title: "SUGGESTIONS AJOUTÉES", description: `${sorted.length} suggestion${sorted.length > 1 ? "s" : ""} ajoutée${sorted.length > 1 ? "s" : ""} au devis` });
                          }}
                          className="flex items-center gap-1 px-2 py-1 rounded-md bg-violet-600 text-white hover:bg-violet-700 transition-all text-[7px] font-mono font-bold uppercase tracking-wider"
                        >
                          <PlusIcon size={10} />
                          Ajouter au devis
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-slate-700">Sélection multiple</span>
                        <button
                          onClick={() => selectAllCatalog(platformCatalog.length)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-500 hover:border-violet-200 hover:text-violet-600 transition-all text-[7px] font-mono uppercase tracking-wider"
                        >
                          <CheckSquare size={10} />
                          Tout sélectionner
                        </button>
                      </div>
                      <p className="text-[8px] font-mono text-slate-500 mt-1 leading-relaxed">
                        Cochez les suggestions à ajouter, ou utilisez «&nbsp;Tout sélectionner&nbsp;».
                      </p>
                    </div>
                  )
                )}

                {platformCatalog.length === 0 && (
                  <div className={cn(SIDEBAR_CARD, "text-center py-6")}>
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-violet-50 mb-2">
                      <SparkleIcon size={14} className="text-violet-400" />
                    </div>
                    <p className="text-[10px] font-mono text-slate-700 mb-0.5">Aucune suggestion</p>
                    <p className="text-[8px] font-mono text-slate-500">Découvrez des offres depuis le Cloud</p>
                  </div>
                )}

                {platformCatalog.map((offer, idx) => {
                  const isSelected = selectedCatalogIndices.has(idx);
                  return (
                    <div
                      key={offer.id}
                      className={cn(
                        SIDEBAR_CARD,
                        "flex items-start gap-1.5",
                        isSelected && "border-violet-300 bg-violet-50/30",
                      )}
                    >
                      <div className="pt-[6px]">
                        <button
                          onClick={() => toggleCatalogSelection(idx)}
                          className="inline-flex items-center justify-center text-slate-400 hover:text-violet-600 transition-colors shrink-0"
                        >
                          {isSelected ? (
                            <CheckSquare size={12} weight="fill" className="text-violet-600" />
                          ) : (
                            <Square size={12} />
                          )}
                        </button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <SparkleIcon size={10} className="text-violet-400 shrink-0" />
                            <p className="text-[10px] font-mono font-bold text-slate-900 truncate">{offer.title}</p>
                          </div>
                          <button
                            onClick={() => {
                              addItem({ title: offer.title, unitPrice: offer.unitPrice, quantity: 1, baseCost: 0 });
                              showFeedback({ title: "SUGGESTION AJOUTÉE", description: offer.title });
                            }}
                            className="ml-1 w-5 h-5 rounded bg-violet-600 text-white flex items-center justify-center hover:bg-violet-700 transition-all shrink-0 cursor-pointer"
                          >
                            <PlusIcon size={8} />
                          </button>
                        </div>
                        <p className="text-[8px] font-mono text-slate-500 mb-1.5 truncate">{offer.subtitle}</p>
                        <div className="pt-1.5 border-t border-slate-100">
                          <span className="text-[9px] font-mono font-bold text-violet-700">
                            {offer.unitPrice.toLocaleString()} <span className="text-[6px] font-mono text-violet-500">XOF</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {platformCatalog.length > 0 && (
                  <div className="pt-1 text-center">
                    <span className="text-[7px] font-mono text-slate-400 italic">
                      {platformCatalog.length} offre{platformCatalog.length > 1 ? "s" : ""} pertinente{platformCatalog.length > 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ━━━ FOOTER ━━━ */}
      <div className="mt-auto px-3 py-2 border-t border-slate-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full bg-emerald-500" />
          <span className="text-[8px] font-mono uppercase tracking-wider text-slate-500">Prêt</span>
        </div>
        <span className="text-[7px] font-mono uppercase tracking-wider text-slate-400">v2.0</span>
      </div>
    </div>
  );
};