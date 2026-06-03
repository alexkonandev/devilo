"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ClientListItem } from "@/types/client";
import { upsertClient } from "@/actions/client-action";
import { validateField } from "@/lib/validations/client";
import { cn } from "@/lib/utils";
import {
  DS_MICRO,
  DS_LABEL,
  DS_MONO,
  DS_CARD,
  DS_INPUT,
  DS_BUTTON_SECONDARY,
} from "@/lib/design-system";
import {
  UserCircle,
  EnvelopeSimple,
  Phone,
  PencilSimple,
  CurrencyCircleDollar,
  FileText,
  ClockClockwise,
  TextAlignLeft,
  Check,
  Spinner,
  MapPin,
  IdentificationBadge,
} from "@phosphor-icons/react";

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatCompact = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".0", "")}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return `${n.toLocaleString("fr-FR")}`;
};

const formatCurrency = (n: number) =>
  `${n.toLocaleString("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} FCFA`;

const daysSince = (date: Date | string | null | undefined): number | null => {
  if (!date) return null;
  return Math.floor(
    (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
  );
};

// ─── Styles ─────────────────────────────────────────────────────────────────

const SECTION_CLASS = "bg-white border border-slate-200 rounded-md p-6";
const SECTION_TITLE_CLASS = "flex items-center gap-2 mb-4";
const SECTION_TITLE_TEXT_CLASS =
  "font-mono text-[9px] uppercase tracking-tight text-slate-500 font-semibold";

const STAT_CARD_CLASS =
  "p-3 bg-white border border-slate-200 rounded-md flex flex-col gap-1";

const BADGE_CLASSES: Record<string, string> = {
  PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
  SENT: "bg-blue-50 text-blue-700 border-blue-200",
  DRAFT: "bg-slate-50 text-slate-500 border-slate-200",
  ACCEPTED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
  REMINDER: "bg-amber-50 text-amber-700 border-amber-200",
};

const STATUS_LABELS: Record<string, string> = {
  PAID: "Payé",
  SENT: "Envoyé",
  DRAFT: "Brouillon",
  ACCEPTED: "Accepté",
  REJECTED: "Refusé",
  REMINDER: "Relance",
};

// ─── Field type for validation ──────────────────────────────────────────────

type FieldType = "email" | "phone" | undefined;

// ─── Inline Edit Field with validation ───────────────────────────────────────

function EditableField({
  label,
  value,
  icon: Icon,
  onSave,
  multiline = false,
  fieldType,
  placeholder = "Non renseigné",
  smallLabel,
  lastSavedValue,
}: {
  label: string;
  value: string | null | undefined;
  icon: React.ElementType;
  onSave: (val: string) => void;
  multiline?: boolean;
  fieldType?: FieldType;
  placeholder?: string;
  smallLabel?: string;
  /** Valeur de référence confirmée par le serveur — utilisée comme garde anti-rollback */
  lastSavedValue?: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  // Track the last known external value to avoid overwriting draft
  // with stale props right after a successful local save
  const prevValueRef = useRef(value);

  // Compute validation error in real time
  const computeError = useCallback(
    (val: string): string | null => {
      if (!fieldType) return null;
      if (val.trim() === "") return null; // empty is allowed (nullable)
      switch (fieldType) {
        case "email":
          return validateField.email(val);
        case "phone":
          return validateField.phone(val);
        default:
          return null;
      }
    },
    [fieldType]
  );

  // Re-validate on every draft change
  useEffect(() => {
    setError(computeError(draft));
  }, [draft, computeError]);

  const handleSave = useCallback(async () => {
    if (draft === (value ?? "")) {
      setEditing(false);
      return;
    }

    // Block save if validation fails
    const validationError = computeError(draft);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    try {
    await onSave(draft ?? "");      
      setSaved(true);
      // Update the ref so the sync effect below won't overwrite draft
      // with the (still-stale) parent value before the refetch lands
      prevValueRef.current = draft;
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setDraft(value ?? "");
    } finally {
      setSaving(false);
      setEditing(false);
    }
  }, [draft, value, onSave, computeError]);

  // onBlur: do NOT save if invalid — keep editing open so user can fix
  const handleBlur = useCallback(() => {
    if (!error) {
      handleSave();
    }
    // if error, stay in edit mode (don't blur-save)
  }, [error, handleSave]);

  const handleCancel = useCallback(() => {
    setDraft(value ?? "");
    setEditing(false);
    setError(null);
  }, [value]);

  // Sync draft when value changes externally (e.g. switching client)
  // Skip the sync when value hasn't actually changed since the last known value —
  // this prevents the stale-props rollback right after a successful local save.
  // When lastSavedValue is provided (address field), it acts as an additional guard:
  // if the incoming value equals the last server-confirmed value, it's an echo of
  // the local save — do NOT overwrite the draft.
  useEffect(() => {
    console.log("[EditableField sync] check", {
      editing,
      value,
      prevValueRef: prevValueRef.current,
      lastSavedValue,
      draft,
    });
    if (!editing && value !== prevValueRef.current) {
      // Garde anti-rollback : si lastSavedValue est fourni et que la prop value
      // correspond exactement à la valeur qu'on vient de confirmer au serveur,
      // c'est un écho de notre propre sauvegarde → on préserve le draft.
      if (lastSavedValue !== undefined && value === lastSavedValue) {
        console.log(
          "[EditableField sync] SKIP (echo local) — value === lastSavedValue, draft preserved",
          { value, lastSavedValue, draft }
        );
        return;
      }
      console.log(
        "[EditableField sync] APPLY — updating draft from external prop",
        { value, prevValueRef: prevValueRef.current, lastSavedValue }
      );
      setDraft(value ?? "");
      setError(null);
      prevValueRef.current = value;
    }
  }, [value, editing, lastSavedValue]);

  // Auto-focus when entering edit mode
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  if (editing) {
    const hasError = !!error;
    return (
      <div className="flex flex-col gap-1">
        <div
          className={cn(
            "flex items-start gap-1.5 p-2 bg-white border rounded-md transition-all",
            hasError
              ? "border-red-500 bg-red-50/30"
              : "border-indigo-200 focus-within:ring-1 focus-within:ring-indigo-300"
          )}
        >
          <Icon
            size={14}
            className={cn(
              "shrink-0 mt-0.5",
              hasError ? "text-red-500" : "text-indigo-400"
            )}
          />
          {multiline ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              className={cn(
                "flex-1 text-[11px] font-mono bg-transparent border-none outline-none resize-none min-h-[48px] leading-relaxed",
                hasError ? "text-red-700" : "text-slate-700"
              )}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") handleCancel();
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!hasError) handleSave();
                }
              }}
              onBlur={handleBlur}
              rows={2}
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              autoFocus
              className={cn(
                "flex-1 text-[11px] font-mono bg-transparent border-none outline-none leading-relaxed",
                hasError ? "text-red-700" : "text-slate-700"
              )}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !hasError) handleSave();
                if (e.key === "Escape") handleCancel();
              }}
              onBlur={handleBlur}
            />
          )}
          {saving && (
            <Spinner
              size={12}
              className="animate-spin text-indigo-400 shrink-0 mt-0.5"
            />
          )}
        </div>

        {/* Error message under the input */}
        {error && (
          <p className="text-[9px] font-mono text-red-500 ml-[22px] leading-tight">
            {error}
          </p>
        )}
      </div>
    );
  }

  const isEmpty = !value || value.trim() === "";

  return (
    <div
      className="flex items-start gap-1.5 p-2 bg-white border border-slate-100 rounded-md group relative cursor-pointer hover:bg-slate-50 transition-colors"
      onClick={() => setEditing(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") setEditing(true);
      }}
    >
      <Icon size={14} className="text-slate-400 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {/* Label au-dessus de la valeur */}
        {smallLabel && (
          <span className="block text-[10px] text-slate-400 uppercase font-semibold tracking-tight leading-none mb-1">
            {smallLabel}
          </span>
        )}
        <span
          className={cn(
            "block text-[11px] font-mono leading-relaxed",
            isEmpty ? "text-slate-300 italic" : "text-slate-700",
            multiline && "whitespace-pre-wrap"
          )}
        >
          {isEmpty ? (
            <span className="inline-flex items-center gap-1">
              <span>{placeholder}</span>
              <span className="text-[10px] text-slate-300 font-normal">
                — Cliquez pour ajouter
              </span>
            </span>
          ) : (
            value
          )}
        </span>
      </div>

      {/* Pencil icon visible uniquement au survol */}
      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-slate-300 group-hover:text-indigo-400 shrink-0 mt-0.5">
        <PencilSimple size={11} weight="bold" />
      </span>

      {/* Feedback "Enregistré" */}
      {saved && (
        <span className="absolute -top-2 right-2 flex items-center gap-0.5 text-[9px] font-mono text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-full animate-in fade-in slide-in-from-top-1 duration-200 z-10">
          <Check size={9} weight="bold" />
          Enregistré
        </span>
      )}
    </div>
  );
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface ClientDetailPanelProps {
  client: ClientListItem | null;
  onEditClient: (client: ClientListItem) => void;
  onUpdate?: () => void;
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function ClientDetailPanel({
  client,
  onEditClient,
  onUpdate,
}: ClientDetailPanelProps) {
  const router = useRouter();
  const [notes, setNotes] = useState(client?.notes ?? "");
  const [notesSaving, setNotesSaving] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevClientIdRef = useRef<string | null>(null);
  // Cache de la dernière valeur d'adresse confirmée par le serveur,
  // utilisé comme garde anti-rollback dans EditableField (champ adresse).
  const [lastSavedAddress, setLastSavedAddress] = useState<string | null>(null);

  // Reset local state when switching to a different client
  useEffect(() => {
    if (client?.id !== prevClientIdRef.current) {
      prevClientIdRef.current = client?.id ?? null;
      setNotes(client?.notes ?? "");
      setNotesSaved(false);
      // Réinitialiser le cache d'adresse au changement de client
      setLastSavedAddress(null);
    }
  }, [client?.id, client?.notes]);

  // ─── Auto-save notes ─────────────────────────────────────────────────────
  const handleNotesChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setNotes(val);
      setNotesSaved(false);
      setNotesSaving(true);

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        if (!client?.id) return;
        try {
          await upsertClient({ id: client.id, notes: val });
          setNotesSaved(true);
        } catch (err) {
          console.error("[SAVE_NOTES_ERROR]", err);
        } finally {
          setNotesSaving(false);
        }
      }, 800);
    },
    [client?.id]
  );

  // ─── Save resume fields ──────────────────────────────────────────────────
  const handleSaveField = useCallback(
    async (field: string, value: string) => {
      if (!client?.id) return;
      // Include name so Zod validation passes (required field)
      const result = await upsertClient({
        id: client.id,
        name: client.name,
        [field]: value || null,
      });
      console.log("[DEBUG handleSaveField] result:", result);
      if (!result.success) {
        throw new Error(result.error ?? "Save failed");
      }
      // Notify parent to refresh data (indicators, CA, etc.)
      console.log("[DEBUG handleSaveField] calling onUpdate");
      await onUpdate?.();
      console.log("[DEBUG handleSaveField] onUpdate completed");
    },
    [client?.id, client?.name, onUpdate]
  );

  const handleSaveAddress = useCallback(
    async (val: string) => {
      if (!client?.id) return;

      // N'envoie QUE le champ que tu modifies.
      // L'action upsertClient gèrera le merge avec le reste.
      const result = await upsertClient({
        id: client.id,
        address: val, // Envoie uniquement l'adresse modifiée
      });

      console.log("[DEBUG handleSaveAddress] result:", result);
      if (!result.success) {
        throw new Error(result.error ?? "Save failed");
      }

      await onUpdate?.();
      setLastSavedAddress(val);
    },
    [client?.id, onUpdate]
  );

  // ─── Empty state ─────────────────────────────────────────────────────────
  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-3">
        <UserCircle size={40} weight="thin" />
        <span className={cn(DS_MICRO, "text-[10px] text-slate-300")}>
          SÉLECTIONNEZ UN CLIENT
        </span>
      </div>
    );
  }

  // ─── Derived indicators ──────────────────────────────────────────────────

  const quotes = client.quotes ?? [];

  const totalCA = quotes
    .filter((q) => q.status === "PAID")
    .reduce((s, q) => s + q.totalAmount, 0);

  const totalDevis = quotes.length;

  const lastActivity =
    quotes.length > 0
      ? quotes.reduce((latest, q) => {
          const d = new Date(q.createdAt).getTime();
          return d > new Date(latest.createdAt).getTime() ? q : latest;
        }, quotes[0])
      : null;

  const lastActivityDays = lastActivity
    ? daysSince(lastActivity.createdAt)
    : null;

  // Format full address for display
  const fullAddress = [
    client.address,
    client.addressLine2,
    client.city,
    client.postalCode,
    client.country,
  ]
    .filter(Boolean)
    .join("\n");

  // ─── RENDER ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 h-full overflow-y-auto pr-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200">
      {/* ── SECTION 1 : RÉSUMÉ ─────────────────────────────────────────────── */}
      <section className={SECTION_CLASS}>
        <div className={SECTION_TITLE_CLASS}>
          <UserCircle size={13} weight="bold" className="text-slate-400" />
          <span className={SECTION_TITLE_TEXT_CLASS}>Résumé</span>
        </div>

        <div className="space-y-2">
          {/* Nom / Avatar */}
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">
              {client.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-slate-900 leading-tight truncate">
                {client.name}
              </h2>
              <p className="text-[10px] font-mono text-slate-400">
                Client depuis{" "}
                {new Date(client.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Email */}
          <EditableField
            label="Email"
            value={client.email}
            icon={EnvelopeSimple}
            onSave={(val) => handleSaveField("email", val)}
            fieldType="email"
            smallLabel="Email de facturation"
            placeholder="Ajouter un email"
          />

          {/* Téléphone */}
          <EditableField
            label="Téléphone"
            value={client.phone}
            icon={Phone}
            onSave={(val) => handleSaveField("phone", val)}
            fieldType="phone"
            smallLabel="Téléphone"
            placeholder="Ajouter un téléphone"
          />

          {/* 1. Affichage : On utilise fullAddress */}
          <EditableField
            label="Adresse"
            value={client.address || ""} // 2. Édition : On n'envoie QUE le champ address
            icon={MapPin}
            onSave={handleSaveAddress}
            multiline
            smallLabel="Adresse"
            placeholder="Ajouter une adresse"
            lastSavedValue={lastSavedAddress}
          />
        </div>
      </section>

      {/* ── SECTION 2 : INDICATEURS ────────────────────────────────────────── */}
      <section className={SECTION_CLASS}>
        <div className={SECTION_TITLE_CLASS}>
          <CurrencyCircleDollar
            size={13}
            weight="bold"
            className="text-slate-400"
          />
          <span className={SECTION_TITLE_TEXT_CLASS}>Indicateurs</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* CA Total */}
          <div className={STAT_CARD_CLASS}>
            <span className={cn(DS_MICRO, "text-[8px] text-slate-500")}>
              CA TOTAL
            </span>
            <span className="text-base font-semibold tabular-nums text-slate-900">
              {formatCompact(totalCA)}
            </span>
            <span className="text-[9px] font-mono text-slate-400">FCFA</span>
          </div>

          {/* Total Devis */}
          <div className={STAT_CARD_CLASS}>
            <span className={cn(DS_MICRO, "text-[8px] text-slate-500")}>
              TOTAL DEVIS
            </span>
            <span className="text-base font-semibold tabular-nums text-slate-900">
              {totalDevis}
            </span>
            <span className="text-[9px] font-mono text-slate-400">
              {totalDevis > 1 ? "documents" : "document"}
            </span>
          </div>

          {/* Dernière activité */}
          <div className={STAT_CARD_CLASS}>
            <span className={cn(DS_MICRO, "text-[8px] text-slate-500")}>
              DERNIÈRE ACTIVITÉ
            </span>
            {lastActivityDays !== null ? (
              <>
                <span className="text-base font-semibold tabular-nums text-slate-900">
                  {lastActivityDays}
                </span>
                <span className="text-[9px] font-mono text-slate-400">
                  {lastActivityDays > 1 ? "jours" : "jour"}
                </span>
              </>
            ) : (
              <span className="text-xs font-mono text-slate-300 mt-1.5">
                Aucune
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── SECTION 3 : HISTORIQUE ─────────────────────────────────────────── */}
      <section className={SECTION_CLASS}>
        <div className={SECTION_TITLE_CLASS}>
          <FileText size={13} weight="bold" className="text-slate-400" />
          <span className={SECTION_TITLE_TEXT_CLASS}>
            Historique des devis
            {quotes.length > 0 && (
              <span className="ml-1 text-slate-300 font-normal">
                ({quotes.length})
              </span>
            )}
          </span>
        </div>

        {quotes.length === 0 ? (
          <p className="text-[11px] font-mono text-slate-400 italic py-3 text-center">
            Aucun devis pour ce client
          </p>
        ) : (
          <div className="max-h-[280px] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left pb-2 pr-2 font-mono text-[8px] uppercase tracking-tight text-slate-400 font-medium">
                    N°
                  </th>
                  <th className="text-left pb-2 px-2 font-mono text-[8px] uppercase tracking-tight text-slate-400 font-medium">
                    Date
                  </th>
                  <th className="text-left pb-2 px-2 font-mono text-[8px] uppercase tracking-tight text-slate-400 font-medium">
                    Statut
                  </th>
                  <th className="text-right pb-2 pl-2 font-mono text-[8px] uppercase tracking-tight text-slate-400 font-medium">
                    Montant
                  </th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((quote) => (
                  <tr
                    key={quote.id}
                    onClick={() => router.push(`/quotes/new?id=${quote.id}`)}
                    className="border-b border-slate-50 cursor-pointer hover:bg-indigo-50/40 transition-colors"
                    role="link"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        router.push(`/quotes/new?id=${quote.id}`);
                      }
                    }}
                  >
                    <td className="py-2 pr-2">
                      <span className="text-[11px] font-mono text-indigo-600">
                        {quote.number}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(quote.createdAt).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "2-digit",
                        })}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <span
                        className={cn(
                          "inline-block px-1.5 py-0.5 rounded text-[8px] font-bold border leading-tight",
                          BADGE_CLASSES[quote.status] || BADGE_CLASSES.DRAFT
                        )}
                      >
                        {STATUS_LABELS[quote.status] || quote.status}
                      </span>
                    </td>
                    <td className="py-2 pl-2 text-right">
                      <span className="text-[11px] font-mono tabular-nums font-medium text-slate-800">
                        {formatCurrency(quote.totalAmount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── SECTION 4 : NOTES ──────────────────────────────────────────────── */}
      <section className={SECTION_CLASS}>
        <div className={SECTION_TITLE_CLASS}>
          <TextAlignLeft size={13} weight="bold" className="text-slate-400" />
          <span className={SECTION_TITLE_TEXT_CLASS}>Notes internes</span>
          <div className="ml-auto flex items-center gap-1.5">
            {notesSaving && (
              <span className="flex items-center gap-1 text-[9px] font-mono text-slate-400">
                <Spinner size={10} className="animate-spin" />
                Sauvegarde...
              </span>
            )}
            {notesSaved && !notesSaving && (
              <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-500">
                <Check size={10} weight="bold" />
                Enregistré
              </span>
            )}
          </div>
        </div>

        <textarea
          value={notes}
          onChange={handleNotesChange}
          placeholder="Ajouter une note interne sur ce client…"
          rows={4}
          className={cn(
            "w-full resize-none text-[11px] font-mono text-slate-700 placeholder:text-slate-300",
            "bg-white border border-slate-200 rounded-md p-3",
            "focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-300",
            "transition-all"
          )}
        />
      </section>
    </div>
  );
}
