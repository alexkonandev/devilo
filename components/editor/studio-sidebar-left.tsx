"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  CopyIcon,
  ArrowUpIcon,
  ArrowDownIcon,
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
import { listDraftQuotesAction } from "@/actions/quote-editor-action";
import { MAX_QUOTE_LINES } from "@/lib/constants";

// ═══════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════
const MAX_ITEMS = MAX_QUOTE_LINES;
const MAX_DESC_LENGTH = 300;
const WARN_DESC_LENGTH = 250;

// ═══════════════════════════════════════════════════════════════
// TOKENS COMPACTS POUR SIDEBAR — ACCESSIBILITÉ AMÉLIORÉE
// ═══════════════════════════════════════════════════════════════
const SIDEBAR_CARD = "bg-white border border-slate-200 rounded-md p-3";
const SIDEBAR_TAB_ACTIVE = "bg-white text-slate-900 border border-slate-200";
const SIDEBAR_TAB_INACTIVE = "text-slate-500 hover:text-slate-800";
const SIDEBAR_INPUT =
  "w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 font-mono text-[10px] text-slate-900 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all";
const SIDEBAR_LABEL = "text-[8px] font-mono uppercase tracking-wider text-slate-600 mb-1 block";

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════
type ActiveTab = "client" | "lignes" | "catalogue";

interface StudioSidebarLeftProps {
  onBack?: () => void;
  suggestions: EditorCatalogOffer[];
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
// AUTO-RESIZE TEXTAREA — Avec compteur 300 caractères
// ═══════════════════════════════════════════════════════════════
function AutoResizeTextarea({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.max(el.scrollHeight, 60)}px`;
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value.slice(0, MAX_DESC_LENGTH);
    onChange(newValue);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData("text");
    if (pastedText.length > MAX_DESC_LENGTH) {
      e.preventDefault();
      const truncated = pastedText.slice(0, MAX_DESC_LENGTH);
      onChange(truncated);
      notify.info(
        "Le texte a été tronqué à 300 caractères pour garantir la mise en page du PDF."
      );
    }
    // Si <= 300, le paste standard se fait naturellement via handleChange
  };

  const charCount = value.length;
  const isOverWarning = charCount >= WARN_DESC_LENGTH;

  return (
    <div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onPaste={handlePaste}
        className="w-full bg-transparent text-[8px] font-mono text-slate-500 outline-none resize-none leading-relaxed"
        rows={2}
        placeholder="Ex. : Création de la charte graphique (logo, palette de couleurs, 3 supports)."
        maxLength={MAX_DESC_LENGTH}
      />
      <div
        className={cn(
          "text-right text-[7px] font-mono mt-0.5 transition-colors",
          isOverWarning ? "text-amber-500" : "text-slate-400",
        )}
      >
        {charCount} / {MAX_DESC_LENGTH}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Messages limite articles
// ═══════════════════════════════════════════════════════════════
const WARN_ITEMS_THRESHOLD = 12; // Seuil d'avertissement à 80% de la limite





// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export const StudioSidebarLeft = ({
  onBack,
  suggestions,
  initialClients,
  userId,
}: StudioSidebarLeftProps) => {
  const { activeQuote, updateField, addItem, updateItem, removeItem, duplicateItem, moveItem, clientMetricsCache, setClientMetricsCache } =
    useKernelStore();

  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>("client");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [clientPage, setClientPage] = useState(0);
  const CLIENTS_PER_PAGE = 7;
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

  // ── État sélection multiple suggestions ──
  const [selectedSuggestionIndices, setSelectedSuggestionIndices] = useState<Set<number>>(new Set());

  const toggleSuggestionSelection = (idx: number) => {
    setSelectedSuggestionIndices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) newSet.delete(idx);
      else newSet.add(idx);
      return newSet;
    });
  };

  const selectAllSuggestions = (length: number) => {
    setSelectedSuggestionIndices(new Set(Array.from({ length }, (_, i) => i)));
  };

  const clearSuggestionSelection = () => setSelectedSuggestionIndices(new Set());

  // ── État ConfirmDialog (useRef pour éviter stale closure) ──
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogVariant, setConfirmDialogVariant] = useState<"add" | "delete" | "info">("info");
  const [confirmDialogTitle, setConfirmDialogTitle] = useState("");
  const [confirmDialogDescription, setConfirmDialogDescription] = useState("");
  const [confirmDialogItemName, setConfirmDialogItemName] = useState<string | undefined>(undefined);
  const onConfirmRef = useRef<() => void>(() => {});

  // ── État pour le changement de client ──
  const [pendingClient, setPendingClient] = useState<EditorClient | null>(null);
  const [showClientChangeConfirm, setShowClientChangeConfirm] = useState(false);
  const onClientChangeRef = useRef<() => void>(() => {});

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
  const [clientHistory, setClientHistory] = useState<
    Array<{
      id: string;
      title: string;
      subtitle: string;
      unitPrice: number;
      quantity: number;
    }>
  >([]);
  
  // ── MÉTRIQUES CLIENT : utiliser le cache du store persisté ──
  const cacheClientName = clientMetricsCache?.clientName ?? null;
  const clientMetrics = cacheClientName === (activeQuote?.client.name ?? null)
    ? { outstanding: clientMetricsCache!.outstanding, health: clientMetricsCache!.health }
    : null;

  // ── Filtrage et pagination des clients ──
  const sortedClients = useMemo(() => {
    return [...initialClients].sort((a, b) => a.name.localeCompare(b.name));
  }, [initialClients]);

  const filteredClients = useMemo(() => {
    if (!debouncedSearch.trim()) return sortedClients;
    const q = debouncedSearch.toLowerCase();
    return sortedClients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q),
    );
  }, [sortedClients, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / CLIENTS_PER_PAGE));
  const paginatedClients = filteredClients.slice(
    clientPage * CLIENTS_PER_PAGE,
    (clientPage + 1) * CLIENTS_PER_PAGE,
  );

  useEffect(() => {
    const abortController = new AbortController();
    const loadClientData = async () => {
      const clientName = activeQuote?.client.name;
      if (!clientName) {
        setClientHistory([]);
        return;
      }
      // Utiliser le cache du store si déjà chargé pour ce client
      if (clientMetricsCache?.clientName === clientName) return;
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
          // Sauvegarder dans le cache persisté
          setClientMetricsCache({
            clientName: clientName,
            outstanding: metrics.outstanding,
            health: metrics.health,
          });
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
  }, [activeQuote?.client.name, userId, cacheClientName, setClientMetricsCache]);

  if (!activeQuote) return null;

  const hasActiveClient = activeQuote.client.name.length > 0;
  const isAtMaxItems = activeQuote.items.length >= MAX_ITEMS;

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
          <NavTab icon={ListBulletsIcon} label="Lignes" selected={activeTab === "lignes"} onClick={() => setActiveTab("lignes")} />
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

      {/* ═══ MODAL CHANGEMENT DE CLIENT ═══ */}
      <ConfirmDialog
        open={showClientChangeConfirm}
        onConfirm={() => {
          onClientChangeRef.current();
          setShowClientChangeConfirm(false);
        }}
        onCancel={() => setShowClientChangeConfirm(false)}
        variant="info"
        title="CHANGER DE CLIENT ?"
        description="Le devis actuel est associé à un autre client. Confirmez pour être redirigé vers le dernier devis de ce client."
        confirmLabel="Changer"
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
              {/* ── RECHERCHE + LISTE CLIENTS ── */}
              <div className={SIDEBAR_CARD}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[8px] font-mono uppercase tracking-wider text-slate-600 flex items-center gap-1">
                    <UserIcon size={10} className="text-slate-500" />
                    Répertoire clients
                  </span>
                  <button
                    onClick={() => setShowCreateDialog(true)}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all"
                  >
                    <UserPlusIcon size={10} />
                    <span className="text-[7px] font-mono uppercase tracking-widest text-indigo-600">Créer</span>
                  </button>
                </div>

                {/* Champ recherche */}
                <div className="relative mb-2">
                  <MagnifyingGlassIcon
                    size={10}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={clientSearch}
                    onChange={(e) => {
                      setClientSearch(e.target.value);
                      setClientPage(0);
                    }}
                    placeholder="Rechercher un client..."
                    className={cn(SIDEBAR_INPUT, "pl-7")}
                  />
                  {clientSearch && (
                    <button
                      onClick={() => {
                        setClientSearch("");
                        setClientPage(0);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <XIcon size={10} />
                    </button>
                  )}
                </div>

                {/* Liste paginée */}
                <div className="space-y-0.5 max-h-[300px] overflow-y-auto scrollbar-none">
                  {paginatedClients.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        // Si un client est déjà actif et différent → confirmation
                        if (hasActiveClient && activeQuote.client.name !== c.name) {
                          setPendingClient(c);
                          onClientChangeRef.current = async () => {
                            // Chercher le dernier devis de ce client
                            const result = await listDraftQuotesAction(1, c.name);
                            if (result.success && result.data.length > 0) {
                              const latestQuote = result.data[0];
                              router.push(`/quotes/${latestQuote.id}`);
                            } else {
                              // Aucun devis existant → on met juste à jour le client
                              updateField("client", "name", c.name);
                              updateField("client", "email", c.email || "");
                              updateField("client", "address", c.address || "");
                              updateField("client", "taxId", c.taxId || "");
                              notify.success("CLIENT SÉLECTIONNÉ", c.name);
                            }
                          };
                          setShowClientChangeConfirm(true);
                        } else {
                          // Pas de client actif ou même client → mise à jour directe
                          updateField("client", "name", c.name);
                          updateField("client", "email", c.email || "");
                          updateField("client", "address", c.address || "");
                          updateField("client", "taxId", c.taxId || "");
                          notify.success("CLIENT SÉLECTIONNÉ", c.name);
                        }
                      }}
                      className={cn(
                        "w-full text-left p-1.5 rounded-md border transition-all",
                        activeQuote.client.name === c.name
                          ? "border-emerald-300 bg-emerald-50/50"
                          : "border-transparent hover:border-slate-200 hover:bg-slate-50",
                      )}
                    >
                      <p className={cn(DS_MONO, "text-[10px] text-slate-800 truncate")}>{c.name}</p>
                      <p className="text-[8px] font-mono text-slate-500 truncate mt-0.5">{c.email || "—"}</p>
                    </button>
                  ))}
                  {filteredClients.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-[10px] font-mono text-slate-500">Aucun client</p>
                      <button
                        onClick={() => setShowCreateDialog(true)}
                        className="text-[8px] font-mono text-indigo-500 hover:text-indigo-700 mt-1"
                      >
                        Créer un client
                      </button>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {filteredClients.length > CLIENTS_PER_PAGE && (
                  <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setClientPage((p) => Math.max(0, p - 1))}
                        disabled={clientPage === 0}
                        className={cn(
                          "px-1.5 py-0.5 rounded text-[7px] font-mono uppercase tracking-wider transition-all",
                          clientPage === 0
                            ? "text-slate-300 cursor-default"
                            : "text-slate-600 hover:bg-slate-100",
                        )}
                      >
                        ←
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => setClientPage(i)}
                          className={cn(
                            "w-4 h-4 flex items-center justify-center rounded text-[7px] font-mono transition-all",
                            clientPage === i
                              ? "bg-indigo-600 text-white font-bold"
                              : "text-slate-500 hover:bg-slate-100",
                          )}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setClientPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={clientPage >= totalPages - 1}
                        className={cn(
                          "px-1.5 py-0.5 rounded text-[7px] font-mono uppercase tracking-wider transition-all",
                          clientPage >= totalPages - 1
                            ? "text-slate-300 cursor-default"
                            : "text-slate-600 hover:bg-slate-100",
                        )}
                      >
                        →
                      </button>
                    </div>
                    <span className="text-[6px] font-mono text-slate-400">
                      {filteredClients.length} client{filteredClients.length > 1 ? "s" : ""}
                    </span>
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
                          <IdentificationBadgeIcon size={10} className="text-slate-500" />
                          Infos client
                        </span>
                        <span className="text-[7px] font-mono uppercase tracking-widest text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">Requis</span>
                      </div>
                      <CompactField label="Nom">
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
                      <div className="mt-1.5">
                        <CompactField label="Email">
                          <CompactInput
                            value={activeQuote.client.email}
                            onChange={(v) => updateField("client", "email", v)}
                            placeholder="email@exemple.com"
                          />
                        </CompactField>
                      </div>
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

                  </div>
                )}
              </>
          </div>
        )}

        {/* ── TAB LIGNES ── */}
        {activeTab === "lignes" && (
          <div className="space-y-2">
           

            {/* Bandeau sélection / actions groupées */}
            {activeQuote.items.length > 0 && selectedItemIndices.size > 0 && (
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
            )}
            {activeQuote.items.map((item, idx) => {
              const isSelected = selectedItemIndices.has(idx);
              return (
                <div key={idx} className={cn(SIDEBAR_CARD, "flex items-start", isSelected && "border-indigo-300 bg-indigo-50/30")}>
                  <div className="flex-1 min-w-0">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 mb-1">
                        <button
                          onClick={() => moveItem(idx, idx - 1)}
                          disabled={idx === 0}
                          className={cn(
                            "inline-flex items-center justify-center p-0.5 rounded transition-all",
                            idx === 0
                              ? "text-slate-200 cursor-default"
                              : "text-slate-400 hover:text-slate-700 hover:bg-slate-100",
                          )}
                          title="Monter"
                        >
                          <ArrowUpIcon size={10} />
                        </button>
                        <button
                          onClick={() => moveItem(idx, idx + 1)}
                          disabled={idx === activeQuote.items.length - 1}
                          className={cn(
                            "inline-flex items-center justify-center p-0.5 rounded transition-all",
                            idx === activeQuote.items.length - 1
                              ? "text-slate-200 cursor-default"
                              : "text-slate-400 hover:text-slate-700 hover:bg-slate-100",
                          )}
                          title="Descendre"
                        >
                          <ArrowDownIcon size={10} />
                        </button>
                        <span className="text-[7px] font-mono text-slate-400 ml-1">
                          {idx + 1}/{activeQuote.items.length}
                        </span>
                      </div>
                      <div className="flex items-start justify-between">
                        <input
                          value={item.title}
                          onChange={(e) => updateItem(idx, "title", e.target.value)}
                          className="flex-1 bg-transparent text-[10px] font-mono font-bold text-slate-900 outline-none placeholder:text-slate-400"
                          placeholder="Prestation..."
                        />
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              duplicateItem(idx);
                              showFeedback({ title: "LIGNE DUPLIQUÉE", description: item.title });
                            }}
                            className="text-slate-400 hover:text-indigo-500 transition-all shrink-0"
                            title="Dupliquer"
                          >
                            <CopyIcon size={11} />
                          </button>
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
                      </div>
                      <AutoResizeTextarea
                        value={item.subtitle || ""}
                        onChange={(v) => updateItem(idx, "subtitle", v)}
                      />
                      <div className="grid grid-cols-10 gap-1.5 pt-1.5 border-t border-slate-100">
                        <div className="col-span-4">
                          <label className="text-[7px] font-mono uppercase tracking-widest text-slate-500">Prix</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(idx, "unitPrice", parseFloat(e.target.value) || 0)}
                            className={cn(SIDEBAR_INPUT, "h-7 text-[9px]")}
                          />
                        </div>
                        <div className="col-span-5">
                          <label className="text-[7px] font-mono uppercase tracking-widest text-indigo-500">Coût</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={item.baseCost || 0}
                            onChange={(e) => updateItem(idx, "baseCost", parseFloat(e.target.value) || 0)}
                            className={cn(SIDEBAR_INPUT, "h-7 text-[9px] bg-indigo-50/30 border-indigo-100")}
                          />
                        </div>
                        <div className="col-span-1 flex items-end">
                          <button
                            onClick={() => toggleItemSelection(idx)}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                          >
                            {isSelected ? (
                              <CheckSquare size={14} weight="fill" className="text-indigo-600" />
                            ) : (
                              <Square size={14} />
                            )}
                          </button>
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
              onClick={() => {
                if (isAtMaxItems) {
                  notify.info("Limite de 15 lignes atteinte. Supprimez une ligne existante avant d'en ajouter une nouvelle.");
                  return;
                }
                console.log("[SIDEBAR_ADD_ITEM] Clic bouton Ajouter un item");
                console.log("[SIDEBAR_ADD_ITEM] activeQuote.id:", activeQuote.id);
                console.log("[SIDEBAR_ADD_ITEM] activeQuote.items.length:", activeQuote.items.length);
                console.log("[SIDEBAR_ADD_ITEM] isAtMaxItems:", isAtMaxItems);
                console.log("[SIDEBAR_ADD_ITEM] activeQuote existant (id):", !!activeQuote.id);
                // Log du contenu des items existants pour voir s'ils sont bien présents
                console.log("[SIDEBAR_ADD_ITEM] Items existants:", activeQuote.items.map((i, idx) => ({
                  idx,
                  title: i.title,
                  qty: i.quantity,
                  price: i.unitPrice,
                })));
                showConfirm({
                  variant: "add",
                  title: "AJOUTER UNE LIGNE",
                  description: "Une nouvelle ligne de prestation sera ajoutée au devis.",
                  onConfirm: () => {
                    console.log("[SIDEBAR_ADD_ITEM] Confirmation → appel de addItem()");
                    addItem({ title: "Nouveau service", subtitle: "", unitPrice: 0, quantity: 1, baseCost: 0 });
                    hideConfirm();
                    showFeedback({ title: "LIGNE AJOUTÉE", description: "Nouveau service" });
                  },
                });
              }}
              disabled={isAtMaxItems}
              className={cn(
                "w-full py-2 border border-dashed rounded-md flex items-center justify-center gap-1.5 transition-all",
                isAtMaxItems
                  ? "border-slate-100 text-slate-300 cursor-not-allowed"
                  : "border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-500",
              )}
            >
              <PlusIcon size={12} />
              <span className="text-[8px] font-mono uppercase tracking-wider">Ajouter un item</span>
            </button>
          </div>
        )}

        {/* ── TAB CATALOGUE (Suggestions uniquement) ── */}
        {activeTab === "catalogue" && (
          <div className="space-y-1.5">
            {/* Bandeau sélection suggestions */}
            {suggestions.length > 0 && selectedSuggestionIndices.size > 0 && (
              <div className="px-3 py-2 bg-violet-50 border border-violet-200 rounded-md space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-violet-700">
                    {selectedSuggestionIndices.size} suggestion{selectedSuggestionIndices.size > 1 ? "s" : ""} sélectionnée{selectedSuggestionIndices.size > 1 ? "s" : ""}
                  </span>
                  <button onClick={clearSuggestionSelection} className="px-2 py-0.5 rounded text-[7px] font-mono uppercase tracking-wider text-slate-400 hover:text-slate-600 transition-all">
                    Annuler
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (selectedSuggestionIndices.size === suggestions.length) {
                        clearSuggestionSelection();
                      } else {
                        selectAllSuggestions(suggestions.length);
                      }
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-white border border-slate-200 text-slate-600 hover:border-violet-200 hover:text-violet-600 transition-all text-[7px] font-mono uppercase tracking-wider"
                  >
                    {selectedSuggestionIndices.size === suggestions.length ? "Tout déselectionner" : "Sélectionner tout"}
                  </button>
                  <button
                    onClick={() => {
                      if (isAtMaxItems) {
                        notify.info("Limite de 15 lignes atteinte. Supprimez une ligne existante avant d'en ajouter une nouvelle.");
                        return;
                      }
                      const sorted = Array.from(selectedSuggestionIndices).sort((a, b) => b - a);
                      // Vérifier que l'ajout ne dépasse pas la limite
                      const availableSlots = MAX_ITEMS - activeQuote.items.length;
                      if (sorted.length > availableSlots) {
                        notify.info(`Vous ne pouvez ajouter que ${availableSlots} suggestion${availableSlots > 1 ? "s" : ""}.`);
                        return;
                      }
                      sorted.forEach((i) => {
                        const offer = suggestions[i];
                        if (offer) addItem({ title: offer.title, subtitle: offer.subtitle, unitPrice: offer.unitPrice, quantity: 1, baseCost: 0 });
                      });
                      clearSuggestionSelection();
                      showFeedback({ title: "SUGGESTIONS AJOUTÉES", description: `${sorted.length} suggestion${sorted.length > 1 ? "s" : ""} ajoutée${sorted.length > 1 ? "s" : ""} au devis` });
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-violet-600 text-white hover:bg-violet-700 transition-all text-[7px] font-mono font-bold uppercase tracking-wider"
                  >
                    <PlusIcon size={10} />
                    Ajouter au devis
                  </button>
                </div>
              </div>
            )}

            {suggestions.length === 0 && (
              <div className={cn(SIDEBAR_CARD, "text-center py-6")}>
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-violet-50 mb-2">
                  <SparkleIcon size={14} className="text-violet-400" />
                </div>
                <p className="text-[10px] font-mono text-slate-700 mb-0.5">Aucune suggestion</p>
                <p className="text-[8px] font-mono text-slate-500">Découvrez des offres depuis le Cloud</p>
              </div>
            )}

            {suggestions.map((offer, idx) => {
              const isSelected = selectedSuggestionIndices.has(idx);
              return (
                <div
                  key={offer.id}
                  className={cn(
                    SIDEBAR_CARD,
                    "flex items-start",
                    isSelected && "border-violet-300 bg-violet-50/30",
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <SparkleIcon size={10} className="text-violet-400 shrink-0" />
                        <p className="text-[10px] font-mono font-bold text-slate-900 truncate">{offer.title}</p>
                      </div>
                      <button
                        onClick={() => {
                          if (isAtMaxItems) {
                            notify.info("Limite de 15 lignes atteinte. Supprimez une ligne existante avant d'en ajouter une nouvelle.");
                            return;
                          }
                          addItem({ title: offer.title, subtitle: offer.subtitle, unitPrice: offer.unitPrice, quantity: 1, baseCost: 0 });
                          showFeedback({ title: "SUGGESTION AJOUTÉE", description: offer.title });
                        }}
                        className={cn(
                          "ml-1 w-5 h-5 rounded flex items-center justify-center transition-all shrink-0 cursor-pointer",
                          isAtMaxItems
                            ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                            : "bg-violet-600 text-white hover:bg-violet-700",
                        )}
                      >
                        <PlusIcon size={8} />
                      </button>
                    </div>
                    <p className="text-[8px] font-mono text-slate-500 mb-1.5 truncate">{offer.subtitle}</p>
                    <div className="grid grid-cols-10 gap-1.5 pt-1.5 border-t border-slate-100">
                      <div className="col-span-9">
                        <span className="text-[9px] font-mono font-bold text-violet-700">
                          {offer.unitPrice.toLocaleString()} <span className="text-[6px] font-mono text-violet-500">XOF</span>
                        </span>
                      </div>
                      <div className="col-span-1 flex items-end">
                        <button
                          onClick={() => toggleSuggestionSelection(idx)}
                          className="inline-flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-all"
                        >
                          {isSelected ? (
                            <CheckSquare size={14} weight="fill" className="text-violet-600" />
                          ) : (
                            <Square size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {suggestions.length > 0 && (
              <div className="pt-1 text-center">
                <span className="text-[7px] font-mono text-slate-400 italic">
                  {suggestions.length} suggestion{suggestions.length > 1 ? "s" : ""} pertinente{suggestions.length > 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};