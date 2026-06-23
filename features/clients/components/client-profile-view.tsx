"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { ClientListItem } from "@/types/client";
import { cn } from "@/lib/utils";
import {
  DS_MONO,
  DS_LABEL,
  DS_INPUT,
  DS_BUTTON,
  DS_BUTTON_SECONDARY,
  DS_BENTO_CARD,
  DS_MICRO,
} from "@/lib/design-system";
import Link from "next/link";
import { upsertClient } from "@/actions/client-action";
import {
  UserCircle,
  EnvelopeSimple,
  Phone,
  MapPin,
  IdentificationBadge,
  FileText,
  ClockClockwise,
  TextAlignLeft,
  Tag,
  Note,
  Plus,
  X,
  CalendarBlank,
  CaretDown,
  CaretUp,
  ArrowUpRight,
  PencilSimple,
  Check,
  Spinner,
} from "@phosphor-icons/react";
import {
  addClientNoteAction,
  getClientActivitiesAction,
  type ClientActivityItem,
} from "@/actions/client-activity-action";

// ═══════════════════════════════════════════════════════════════
// CLIENT PROFILE VIEW — Fiche de contact avec édition inline (palette DS)
// ═══════════════════════════════════════════════════════════════

interface ClientProfileViewProps {
  client: ClientListItem | null;
  onEdit?: (client: ClientListItem) => void;
  onClose: () => void;
  onUpdate?: () => void;
}

/** Badge de statut de devis avec palette DS */
const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  PAID:     { label: "Payé",     bg: "bg-emerald-50", text: "text-emerald-600" },
  SENT:     { label: "Envoyé",   bg: "bg-indigo-50",   text: "text-indigo-600" },
  DRAFT:    { label: "Brouillon", bg: "bg-slate-100", text: "text-slate-500" },
  ACCEPTED: { label: "Accepté",  bg: "bg-emerald-50", text: "text-emerald-600" },
  REJECTED: { label: "Refusé",   bg: "bg-rose-50",    text: "text-rose-600" },
  REMINDER: { label: "Relance",  bg: "bg-amber-50",   text: "text-amber-600" },
};

/** Timeline activity meta */
const ACTIVITY_META: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  NOTE:          { icon: Note,           color: "text-amber-600", bg: "bg-amber-50",  label: "Note" },
  EMAIL:         { icon: EnvelopeSimple, color: "text-indigo-600", bg: "bg-indigo-50", label: "Email" },
  CALL:          { icon: Phone,          color: "text-emerald-600", bg: "bg-emerald-50", label: "Appel" },
  STATUS_CHANGE: { icon: ArrowUpRight,   color: "text-blue-600",  bg: "bg-blue-50",   label: "Statut" },
};

// ─── Helper daysSince ─────────────────────────────────────────
const daysSince = (d: Date | string | null | undefined): number | null => {
  if (!d) return null;
  return Math.floor((Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24));
};

// ─── Section pliable ──────────────────────────────────────────
function CollapsibleSection({
  title,
  icon,
  defaultOpen = true,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={cn(DS_BENTO_CARD, "p-0 overflow-hidden")}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-2.5 border-b border-slate-100 bg-slate-50/50 hover:bg-slate-100/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          {icon && <span className="text-slate-400 shrink-0">{icon}</span>}
          <span className={cn(DS_LABEL, "text-[10px] text-slate-500 uppercase tracking-wider")}>
            {title}
          </span>
        </div>
        {open ? (
          <CaretUp size={10} className="text-slate-400" weight="bold" />
        ) : (
          <CaretDown size={10} className="text-slate-400" weight="bold" />
        )}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

// ─── Info Row ─────────────────────────────────────────────────
function InfoRow({
  label,
  value,
  icon,
  mono,
}: {
  label: string;
  value?: string | React.ReactNode;
  icon?: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      {icon && (
        <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className={cn(DS_LABEL, "text-[9px] mb-0.5 text-slate-400")}>{label}</p>
        <div
          className={cn(
            mono ? DS_MONO : "font-sans text-sm",
            "text-slate-800 leading-snug break-words"
          )}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

// ─── Input / Textarea styles pour édition inline ──────────────
const INPUT_STYLE =
  "w-full text-sm text-slate-800 bg-white border border-indigo-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400";

const TEXTAREA_STYLE =
  "w-full text-sm text-slate-800 bg-white border border-indigo-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400 resize-none";

// ─── Champs éditables ─────────────────────────────────────────
type EditableFields = {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  clientSince: string;
};

// ═══════════════════════════════════════════════════════════════
// MAIN — ClientProfileView
// ═══════════════════════════════════════════════════════════════

export function ClientProfileView({
  client,
  onEdit,
  onClose,
  onUpdate,
}: ClientProfileViewProps) {
  // ─── State ──────────────────────────────────────────────────
  const [activities, setActivities] = useState<ClientActivityItem[]>([]);
  const [loadingActs, setLoadingActs] = useState(false);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [showAllQuotes, setShowAllQuotes] = useState(false);

  // Édition inline
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState<EditableFields | null>(null);
  const prevClientIdRef = useRef<string | null>(null);

  // ─── Reset state when switching client ──────────────────────
  useEffect(() => {
    if (client?.id !== prevClientIdRef.current) {
      prevClientIdRef.current = client?.id ?? null;
      setIsEditing(false);
      setEditData(null);
    }
  }, [client?.id]);

  // ─── Fetch activities ───────────────────────────────────────
  const fetchActs = useCallback(async () => {
    if (!client) return;
    setLoadingActs(true);
    try {
      setActivities(await getClientActivitiesAction(client.id));
    } catch { /* */ } finally {
      setLoadingActs(false);
    }
  }, [client?.id]);

  useEffect(() => {
    if (client) fetchActs();
  }, [client?.id]);

  // ─── Add note ───────────────────────────────────────────────
  const addNote = async () => {
    if (!client || !note.trim()) return;
    setSavingNote(true);
    try {
      const r = await addClientNoteAction(client.id, note.trim());
      if (r.success) {
        setNote("");
        await fetchActs();
      }
    } catch { /* */ } finally {
      setSavingNote(false);
    }
  };

  // ─── Édition inline ─────────────────────────────────────────
  const startEditing = useCallback(() => {
    if (!client) return;
    const createdAtDate = client.createdAt instanceof Date ? client.createdAt : new Date(client.createdAt);
    setEditData({
      name: client.name ?? "",
      email: client.email ?? "",
      phone: client.phone ?? "",
      address: client.address ?? "",
      notes: client.notes ?? "",
      clientSince: createdAtDate.toISOString().split("T")[0],
    });
    setIsEditing(true);
  }, [client]);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setEditData(null);
  }, []);

  const updateField = useCallback(<K extends keyof EditableFields>(key: K, value: EditableFields[K]) => {
    setEditData((prev) => prev ? { ...prev, [key]: value } : null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!client?.id || !editData) return;
    setIsSaving(true);
    try {
      await upsertClient({ id: client.id, name: editData.name });
      await upsertClient({ id: client.id, email: editData.email || null });
      await upsertClient({ id: client.id, phone: editData.phone || null });
      await upsertClient({ id: client.id, address: editData.address || null });
      await upsertClient({ id: client.id, notes: editData.notes || null });
      await onUpdate?.();
      setIsEditing(false);
      setEditData(null);
    } catch (err) {
      console.error("[SAVE_CLIENT_ERROR]", err);
    } finally {
      setIsSaving(false);
    }
  }, [client?.id, editData, onUpdate]);

  // ─── Empty state ────────────────────────────────────────────
  if (!client) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-14 h-14 rounded-xl bg-slate-100 mx-auto mb-4 flex items-center justify-center">
            <UserCircle size={28} className="text-slate-300" weight="duotone" />
          </div>
          <p className={cn(DS_MONO, "text-sm font-semibold text-slate-400")}>
            Aucune sélection
          </p>
          <p className={cn(DS_MONO, "text-[10px] text-slate-300 mt-1 max-w-[200px] mx-auto leading-relaxed")}>
            Sélectionnez un contact pour voir sa fiche détaillée
          </p>
        </div>
      </div>
    );
  }

  // ─── Derived data ──────────────────────────────────────────
  const initials = client.name
    .split(" ")
    .map((n) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const quotes = client.quotes ?? [];
  const displayQuotes = showAllQuotes ? quotes : quotes.slice(0, 5);
  const totalCA = quotes.filter((q) => q.status === "PAID").reduce((s, q) => s + q.totalAmount, 0);
  const lastActivityDays = quotes.length > 0 ? daysSince(
    quotes.reduce((latest, q) => {
      const d = new Date(q.createdAt).getTime();
      return d > new Date(latest.createdAt).getTime() ? q : latest;
    }, quotes[0]).createdAt
  ) : null;

  const tags = client.tags ?? [];

  // ─── Render ─────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Contenu scrollable */}
      <div className="flex-1 overflow-y-auto">
        {/* ═══ BANNIÈRE ═══ */}
        <div className="relative bg-gradient-to-r from-indigo-500 to-indigo-600 px-5 pt-8 pb-14">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-md bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white"
          >
            <X size={12} weight="bold" />
          </button>

          {/* Avatar + Nom */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-lg font-bold text-white shadow-sm">
              {initials}
            </div>
            <div className="text-white">
              {isEditing ? (
                <input
                  value={editData?.name ?? ""}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="bg-white/20 backdrop-blur-sm text-white placeholder-white/60 border border-white/30 rounded px-2 py-1 text-lg font-bold focus:outline-none focus:ring-1 focus:ring-white/50"
                  placeholder="Nom du client"
                />
              ) : (
                <h2 className="text-lg font-bold leading-tight">{client.name}</h2>
              )}
              {client.email && !isEditing && (
                <p className="text-sm text-white/80 mt-0.5">{client.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* ═══ CORPS (remonte par dessus la bannière) ═══ */}
        <div className="relative -mt-10 px-4 pb-4 space-y-3">
          {/* Actions rapides - édition inline */}
          <div className={cn(DS_BENTO_CARD, "p-3 flex items-center gap-2")}>
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-[10px] font-bold uppercase tracking-wider disabled:opacity-50"
                >
                  {isSaving ? (
                    <><Spinner size={12} className="animate-spin" /> Sauvegarder</>
                  ) : (
                    <><Check size={12} weight="bold" /> Sauvegarder</>
                  )}
                </button>
                <button
                  onClick={cancelEditing}
                  disabled={isSaving}
                  className={cn(DS_BUTTON_SECONDARY, "flex-1 justify-center")}
                >
                  Annuler
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={startEditing}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors text-[10px] font-bold uppercase tracking-wider"
                >
                  <PencilSimple size={12} weight="bold" />
                  Modifier
                </button>
                <Link
                  href={`/quotes/new?clientId=${client.id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-[10px] font-bold uppercase tracking-wider"
                >
                  <Plus size={12} weight="bold" />
                  Nouveau devis
                </Link>
              </>
            )}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded-md text-[8px] font-bold uppercase tracking-wide",
                    tag === "VIP"
                      ? "bg-amber-100 text-amber-700 border border-amber-200"
                      : "bg-slate-100 text-slate-500 border border-slate-200"
                  )}
                >
                  <Tag size={8} weight="fill" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Section : Coordonnées */}
          <CollapsibleSection title="Coordonnées" icon={<UserCircle size={13} weight="duotone" />}>
            <div className="space-y-3">
              <InfoRow
                label="Client depuis"
                value={
                  isEditing ? (
                    <input
                      value={editData?.clientSince ?? ""}
                      onChange={(e) => updateField("clientSince", e.target.value)}
                      type="date"
                      className={INPUT_STYLE}
                    />
                  ) : (
                    new Date(client.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric", month: "long", year: "numeric",
                    })
                  )
                }
                icon={<CalendarBlank size={14} weight="duotone" />}
                mono
              />
              <div className="h-px bg-slate-100" />
              <InfoRow
                label="Email"
                value={
                  isEditing ? (
                    <input
                      value={editData?.email ?? ""}
                      onChange={(e) => updateField("email", e.target.value)}
                      className={INPUT_STYLE}
                      placeholder="Ajouter un email"
                    />
                  ) : (
                    <span className={cn("text-sm leading-snug", !client.email ? "text-slate-300 italic" : "text-slate-800")}>
                      {client.email || "Non renseigné"}
                    </span>
                  )
                }
                icon={<EnvelopeSimple size={14} weight="duotone" />}
              />
              <InfoRow
                label="Téléphone"
                value={
                  isEditing ? (
                    <input
                      value={editData?.phone ?? ""}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className={INPUT_STYLE}
                      placeholder="Ajouter un téléphone"
                    />
                  ) : (
                    <span className={cn("text-sm leading-snug", !client.phone ? "text-slate-300 italic" : "text-slate-800")}>
                      {client.phone || "Non renseigné"}
                    </span>
                  )
                }
                icon={<Phone size={14} weight="duotone" />}
              />
              <InfoRow
                label="Adresse"
                value={
                  isEditing ? (
                    <textarea
                      value={editData?.address ?? ""}
                      onChange={(e) => updateField("address", e.target.value)}
                      className={TEXTAREA_STYLE}
                      rows={3}
                      placeholder="Ajouter une adresse"
                    />
                  ) : (
                    <span className={cn("text-sm leading-snug whitespace-pre-wrap", !client.address ? "text-slate-300 italic" : "text-slate-800")}>
                      {client.address || "Non renseignée"}
                    </span>
                  )
                }
                icon={<MapPin size={14} weight="duotone" />}
              />
              {client.taxId && (
                <InfoRow
                  label="Identifiant fiscal"
                  value={client.taxId}
                  icon={<IdentificationBadge size={14} weight="duotone" />}
                  mono
                />
              )}
            </div>
          </CollapsibleSection>

          {/* Section : Notes internes */}
          <CollapsibleSection title="Notes internes" icon={<TextAlignLeft size={13} weight="duotone" />}>
            {isEditing ? (
              <textarea
                value={editData?.notes ?? ""}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="Ajouter une note interne sur ce client…"
                rows={4}
                className={TEXTAREA_STYLE}
              />
            ) : (
              <>
                {client.notes && (
                  <p className={cn(DS_MONO, "text-[11px] text-slate-600 whitespace-pre-wrap mb-3 leading-relaxed")}>
                    {client.notes}
                  </p>
                )}
                {/* Ajout rapide de note d'activité */}
                <div className="flex gap-2">
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ajouter une note d'activité…"
                    disabled={savingNote}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addNote(); } }}
                    className={cn(DS_INPUT, "flex-1 text-[11px]")}
                  />
                  <button
                    onClick={addNote}
                    disabled={savingNote || !note.trim()}
                    className={cn(DS_BUTTON, "disabled:opacity-50")}
                  >
                    <Plus size={10} weight="bold" />
                  </button>
                </div>
              </>
            )}

            {/* Séparateur si édition : les sections suivantes ne sont pas modifiables */}
            {isEditing && (
              <div className="flex items-center gap-3 py-3 mt-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className={cn(DS_LABEL, "text-[9px] text-slate-400 uppercase tracking-wider shrink-0")}>
                  Consultation seule
                </span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
            )}
          </CollapsibleSection>

          {/* Section : Devis */}
          <CollapsibleSection
            title={`Devis${quotes.length > 0 ? ` (${quotes.length})` : ""}`}
            icon={<FileText size={13} weight="duotone" />}
          >
            {quotes.length === 0 ? (
              <p className={cn(DS_MONO, "text-[10px] text-slate-400 italic py-3 text-center")}>
                Aucun devis pour ce contact
              </p>
            ) : (
              <div className="space-y-1">
                {displayQuotes.map((quote) => {
                  const cfg = STATUS_CONFIG[quote.status] || STATUS_CONFIG.DRAFT;
                  return (
                    <Link
                      key={quote.id}
                      href={`/quotes/new?id=${quote.id}`}
                      className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-1.5 h-6 rounded-full bg-slate-200 group-hover:bg-indigo-400 transition-colors shrink-0" />
                        <div className="min-w-0">
                          <span className={cn(DS_MONO, "text-[10px] font-semibold text-slate-800")}>
                            {quote.number}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={cn(DS_MONO, "text-[8px] text-slate-400")}>
                              {new Date(quote.createdAt).toLocaleDateString("fr-FR", {
                                day: "2-digit", month: "short",
                              })}
                            </span>
                            <span className={cn("px-1 py-0.5 rounded text-[7px] font-bold border", cfg.bg, cfg.text, "border-transparent")}>
                              {cfg.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className={cn(DS_MONO, "text-[10px] font-bold text-slate-700 tabular-nums")}>
                        {new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF", minimumFractionDigits: 0 }).format(quote.totalAmount)}
                      </span>
                    </Link>
                  );
                })}
                {quotes.length > 5 && (
                  <button
                    onClick={() => setShowAllQuotes(!showAllQuotes)}
                    className="w-full text-center py-1.5 text-[9px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-wider transition-colors"
                  >
                    {showAllQuotes ? "Voir moins" : `Voir les ${quotes.length - 5} autres devis`}
                  </button>
                )}
              </div>
            )}
          </CollapsibleSection>

          {/* Section : Indicateurs */}
          <CollapsibleSection title="Indicateurs" icon={<ClockClockwise size={13} weight="duotone" />}>
            <div className="grid grid-cols-3 gap-2">
              <div className={cn(DS_BENTO_CARD, "p-3")}>
                <span className={cn(DS_LABEL, "text-[9px] text-slate-400")}>CA TOTAL</span>
                <span className={cn(DS_MONO, "text-sm font-bold text-slate-900")}>
                  {new Intl.NumberFormat("fr-CI", { style: "currency", currency: "XOF", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(totalCA)}
                </span>
              </div>
              <div className={cn(DS_BENTO_CARD, "p-3")}>
                <span className={cn(DS_LABEL, "text-[9px] text-slate-400")}>DEVIS</span>
                <span className={cn(DS_MONO, "text-sm font-bold text-slate-900")}>{quotes.length}</span>
              </div>
              <div className={cn(DS_BENTO_CARD, "p-3")}>
                <span className={cn(DS_LABEL, "text-[9px] text-slate-400")}>ACTIVITÉ</span>
                {lastActivityDays !== null ? (
                  <>
                    <span className={cn(DS_MONO, "text-sm font-bold text-slate-900")}>{lastActivityDays}</span>
                    <span className={cn(DS_MONO, "text-[8px] text-slate-400")}>
                      {lastActivityDays > 1 ? "jours" : "jour"}
                    </span>
                  </>
                ) : (
                  <span className={cn(DS_MONO, "text-[9px] text-slate-300")}>—</span>
                )}
              </div>
            </div>
          </CollapsibleSection>

          {/* Section : Activité récente (timeline simplifiée) */}
          <CollapsibleSection
            title={`Activité${activities.length > 0 ? ` (${activities.length})` : ""}`}
            icon={<ClockClockwise size={13} weight="duotone" />}
          >
            {loadingActs ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : activities.length === 0 ? (
              <p className={cn(DS_MONO, "text-[10px] text-slate-400 italic py-3 text-center")}>
                Aucune activité récente
              </p>
            ) : (
              <div className="space-y-2">
                {activities.slice(0, 8).map((a, i) => {
                  const cfg = ACTIVITY_META[a.type] || ACTIVITY_META.NOTE;
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={a.id}
                      className="flex items-start gap-2.5"
                    >
                      {/* Timeline dot */}
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className={cn("w-5 h-5 rounded-md flex items-center justify-center", cfg.bg)}>
                          <Icon size={9} className={cfg.color} weight="bold" />
                        </div>
                        {i < activities.length - 1 && i < 7 && (
                          <div className="w-px flex-1 bg-slate-200 min-h-[8px]" />
                        )}
                      </div>
                      {/* Content */}
                      <div className="pb-3 min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className={cn("text-[8px] font-bold uppercase tracking-wider", cfg.color)}>
                            {cfg.label}
                          </span>
                          <span className={cn(DS_MONO, "text-[8px] text-slate-400 shrink-0")}>
                            {new Date(a.createdAt).toLocaleString("fr-FR", {
                              day: "2-digit", month: "short",
                            })}
                          </span>
                        </div>
                        <p className={cn(DS_MONO, "text-[10px] text-slate-600 mt-0.5 leading-relaxed")}>
                          {a.content}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CollapsibleSection>
        </div>
      </div>
    </div>
  );
}