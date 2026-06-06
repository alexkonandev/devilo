"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ClientListItem } from "@/types/client";
import { upsertClient } from "@/actions/client-action";
import { validateField } from "@/lib/validations/client";
import { cn, formatPrice, formatPriceCompact } from "@/lib/utils";
import {
  DS_MICRO,
  DS_LABEL,
  DS_MONO,
  DS_TITLE,
  DS_CARD,
  DS_BADGE_SUCCESS,
  DS_BADGE_ACTIVE,
  DS_BADGE_NEUTRAL,
  DS_BADGE_ACCEPTED,
  DS_BADGE_DANGER,
  DS_BADGE_WARNING,
  DS_SECTION_HEADER,
  DS_ICON_WRAPPER,
} from "@/lib/design-system";
import { STATUS_LABELS } from "./client-constants";
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

const daysSince = (date: Date | string | null | undefined): number | null => {
  if (!date) return null;
  return Math.floor(
    (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
  );
};

// ─── Styles ─────────────────────────────────────────────────────────────────

const STAT_CARD_CLASS =
  "p-3 bg-white border border-slate-200 rounded-md flex flex-col gap-1";

const BADGE_MAP: Record<string, string> = {
  PAID: DS_BADGE_SUCCESS,
  SENT: DS_BADGE_ACTIVE,
  DRAFT: DS_BADGE_NEUTRAL,
  ACCEPTED: DS_BADGE_ACCEPTED,
  REJECTED: DS_BADGE_DANGER,
  REMINDER: DS_BADGE_WARNING,
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
    if (!editing && value !== prevValueRef.current) {
      // Garde anti-rollback : si lastSavedValue est fourni et que la prop value
      // correspond exactement à la valeur qu'on vient de confirmer au serveur,
      // c'est un écho de notre propre sauvegarde → on préserve le draft.
      if (lastSavedValue !== undefined && value === lastSavedValue) {
        return;
      }
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
                DS_MONO,
                "flex-1 bg-transparent border-none outline-none resize-none min-h-[48px] leading-relaxed",
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
                DS_MONO,
                "flex-1 bg-transparent border-none outline-none leading-relaxed",
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
          <p className={cn(DS_MONO, "text-red-500 ml-[22px] leading-tight")}>
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
          <span className={cn(DS_LABEL, "block mb-1")}>
            {smallLabel}
          </span>
        )}
        <span
          className={cn(
            DS_MONO,
            isEmpty ? "text-slate-300 italic" : "text-slate-700",
            multiline && "whitespace-pre-wrap"
          )}
        >
          {isEmpty ? (
            <span className="inline-flex items-center gap-1">
              <span>{placeholder}</span>
              <span className={cn(DS_MONO, "text-slate-300 font-normal")}>
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
      if (!result.success) {
        throw new Error(result.error ?? "Save failed");
      }
      // Notify parent to refresh data (indicators, CA, etc.)
      await onUpdate?.();
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
      <div className="flex-1 bg-white border border-slate-200 rounded-md overflow-hidden">
        {/* En-tête "Informations" avec trait de séparation */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-slate-100 bg-slate-50/50">
          <span className={cn(DS_LABEL, "text-[10px] text-slate-500 uppercase tracking-wider")}>
            Informations
          </span>
        </div>
        <div className="flex flex-col items-center justify-center px-8 py-16 gap-4 h-full">
          <div className="w-14 h-14 rounded-md bg-slate-100 flex items-center justify-center text-slate-300">
            <UserCircle size={28} weight="duotone" />
          </div>
          <div className="text-center space-y-1.5">
            <p className={cn(DS_MONO, "text-sm font-semibold text-slate-500")}>
              Aucune sélection
            </p>
            <p className={cn(DS_MONO, "text-[10px] text-slate-400 leading-relaxed max-w-[200px]")}>
              {`Sélectionnez un client pour voir ses informations, ses devis et son activité`}
            </p>
          </div>
        </div>
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
    <div className="space-y-6 h-full overflow-y-auto pr-3">
      {/* ── SECTION 1 : RÉSUMÉ ─────────────────────────────────────────────── */}
      <section className={`${DS_CARD} p-6`}>
        <div className={`${DS_SECTION_HEADER} gap-2`}>
          <UserCircle size={13} weight="bold" className="text-slate-400" />
          <span className={DS_MICRO}>Résumé</span>
        </div>

        <div className="space-y-2">
          {/* Nom / Avatar */}
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">
              {client.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className={cn(DS_TITLE, "leading-tight truncate")}>
                {client.name}
              </h2>
              <p className={cn(DS_MONO, "text-slate-400")}>
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
      <section className={`${DS_CARD} p-6`}>
        <div className={`${DS_SECTION_HEADER} gap-2`}>
          <CurrencyCircleDollar
            size={13}
            weight="bold"
            className="text-slate-400"
          />
          <span className={DS_MICRO}>Indicateurs</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* CA Total */}
          <div className={STAT_CARD_CLASS}>
            <span className={DS_MICRO}>CA TOTAL</span>
            <span className={cn(DS_MONO, "text-base font-bold text-slate-900")}>
              {formatPriceCompact(totalCA)}
            </span>
            <span className={cn(DS_MONO, "text-slate-400")}>FCFA</span>
          </div>

          {/* Total Devis */}
          <div className={STAT_CARD_CLASS}>
            <span className={DS_MICRO}>TOTAL DEVIS</span>
            <span className={cn(DS_MONO, "text-base font-bold text-slate-900")}>
              {totalDevis}
            </span>
            <span className={cn(DS_MONO, "text-slate-400")}>
              {totalDevis > 1 ? "documents" : "document"}
            </span>
          </div>

          {/* Dernière activité */}
          <div className={STAT_CARD_CLASS}>
            <span className={DS_MICRO}>DERNIÈRE ACTIVITÉ</span>
            {lastActivityDays !== null ? (
              <>
                <span className={cn(DS_MONO, "text-base font-bold text-slate-900")}>
                  {lastActivityDays}
                </span>
                <span className={cn(DS_MONO, "text-slate-400")}>
                  {lastActivityDays > 1 ? "jours" : "jour"}
                </span>
              </>
            ) : (
              <span className={cn(DS_MONO, "text-slate-300 mt-1.5")}>
                Aucune
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── SECTION 3 : HISTORIQUE ─────────────────────────────────────────── */}
      <section className={`${DS_CARD} p-6`}>
        <div className={`${DS_SECTION_HEADER} gap-2`}>
          <FileText size={13} weight="bold" className="text-slate-400" />
          <span className={DS_MICRO}>
            Historique des devis
            {quotes.length > 0 && (
              <span className="ml-1 text-slate-300 font-normal">
                ({quotes.length})
              </span>
            )}
          </span>
        </div>

        {quotes.length === 0 ? (
          <p className={cn(DS_MONO, "text-slate-400 italic py-3 text-center")}>
            Aucun devis pour ce client
          </p>
        ) : (
          <div className="max-h-[280px] overflow-y-auto">
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
                      <span className={cn(DS_MONO, "text-indigo-600")}>
                        {quote.number}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <span className={cn(DS_MONO, "text-slate-400")}>
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
                          BADGE_MAP[quote.status] || BADGE_MAP.DRAFT
                        )}
                      >
                        {STATUS_LABELS[quote.status] || quote.status}
                      </span>
                    </td>
                    <td className="py-2 pl-2 text-right">
                      <span className={cn(DS_MONO, "font-bold text-slate-800")}>
                        {formatPrice(quote.totalAmount)}
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
      <section className={`${DS_CARD} p-6`}>
        <div className={`${DS_SECTION_HEADER} gap-2`}>
          <TextAlignLeft size={13} weight="bold" className="text-slate-400" />
          <span className={DS_MICRO}>Notes internes</span>
          <div className="ml-auto flex items-center gap-1.5">
            {notesSaving && (
              <span className={cn(DS_MONO, "text-slate-400 flex items-center gap-1")}>
                <Spinner size={10} className="animate-spin" />
                Sauvegarde...
              </span>
            )}
            {notesSaved && !notesSaving && (
              <span className={cn(DS_MONO, "text-emerald-500 flex items-center gap-1")}>
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
            DS_MONO,
            "w-full resize-none text-slate-700 placeholder:text-slate-300",
            "bg-white border border-slate-200 rounded-md p-3",
            "focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-300",
            "transition-all"
          )}
        />
      </section>
    </div>
  );
}