"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatDateLong, formatDateTime, formatPrice, computeTotalHT } from "@/lib/utils";
import {
  DS_MONO,
  DS_LABEL,
  DS_BADGE_ACTIVE,
  DS_BADGE_SUCCESS,
  DS_BADGE_WARNING,
  DS_BADGE_DANGER,
  DS_BADGE_NEUTRAL,
  DS_BADGE_ACCEPTED,
  DS_BADGE_CANCELLED,
} from "@/lib/design-system";
import {
  BTN_PRIMARY,
  BTN_SECONDARY,
  BTN_DANGER,
} from "@/components/shared/ui/constants";
import {
  FileTextIcon,
  SelectionInverse,
  ArrowElbowDownRight,
  TrashSimple,
  PaperPlaneTilt,
  Lightning,
  CurrencyCircleDollar,
  CalendarBlank,
  UserIcon,
  MapPinIcon,
  TagIcon,
  ClockIcon,
  PhoneIcon,
  EnvelopeSimple,
  StackIcon,
  ListNumbers,
  Hash,
  PencilSimple,
} from "@phosphor-icons/react";
import { useQuotes } from "./quote-context";
import { QuoteStatus } from "@/types/quote-registry";
import { sendQuoteEmailAction } from "@/actions/send-quote-email";
import { updateQuoteInlineAction } from "@/actions/quote-editor-action";
import { deleteQuoteAction } from "@/actions/quote-registry-action";
import { notify } from "@/lib/notifications";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { EmailSendForm } from "./email-send-form";

const STATUS_BADGE: Record<QuoteStatus, string> = {
  DRAFT: DS_BADGE_NEUTRAL,
  SENT: DS_BADGE_ACTIVE,
  ACCEPTED: DS_BADGE_ACCEPTED,
  PAID: DS_BADGE_SUCCESS,
  REJECTED: DS_BADGE_DANGER,
  CANCELLED: DS_BADGE_CANCELLED,
};

const STATUS_LABEL: Record<QuoteStatus, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyé",
  ACCEPTED: "Accepté",
  PAID: "Payé",
  REJECTED: "Rejeté",
  CANCELLED: "Annulé",
};

const ACTIVITY_LABEL: Record<string, string> = {
  CALL: "Appel",
  EMAIL: "Email",
  NOTE: "Note",
  STATUS_CHANGE: "Changement de statut",
};

const ACTIVITY_ICON: Record<string, React.ReactNode> = {
  CALL: <PhoneIcon size={12} weight="fill" />,
  EMAIL: <EnvelopeSimple size={12} weight="fill" />,
  NOTE: <FileTextIcon size={12} weight="fill" />,
};

// ═══════════════════════════════════════════════════════════════
// SECTION COMPONENTS
// ═══════════════════════════════════════════════════════════════

/** Section wrapper — Carte discrète avec bordure */
function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
      {/* En-tête de section */}
      <div className="flex items-center gap-2 px-5 py-2.5 border-b border-slate-100 bg-slate-50/50">
        {icon && (
          <span className="text-slate-400 shrink-0">{icon}</span>
        )}
        <span className={cn(DS_LABEL, "text-[10px] text-slate-500 uppercase tracking-wider")}>
          {title}
        </span>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}

/** Ligne d'information clé-valeur */
function InfoRow({
  label,
  value,
  icon,
  mono,
  badge,
}: {
  label: string;
  value?: string | React.ReactNode;
  icon?: React.ReactNode;
  mono?: boolean;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      {icon && (
        <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className={cn(DS_LABEL, "text-[9px] mb-0.5")}>{label}</p>
        {badge ? (
          badge
        ) : (
          <div
            className={cn(
              mono ? DS_MONO : "font-sans text-sm",
              "text-slate-800 leading-snug break-words",
            )}
          >
            {value}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════════

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex-1 flex flex-col items-center justify-center px-8 gap-4"
    >
      <div className="w-14 h-14 rounded-md bg-slate-100 flex items-center justify-center text-slate-300">
        <SelectionInverse size={28} weight="duotone" />
      </div>
      <div className="text-center space-y-1.5">
        <p className={cn(DS_MONO, "text-sm font-semibold text-slate-500")}>
          Aucune sélection
        </p>
        <p className={cn(DS_MONO, "text-[10px] text-slate-400 leading-relaxed max-w-[200px]")}>
          {`Sélectionnez un devis pour voir le détail complet, les lignes, le client et l'historique`}
        </p>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SINGLE MODE — Le panneau de consultation complet
// ═══════════════════════════════════════════════════════════════

// Champs éditables pour l'édition inline
type EditableQuoteFields = {
  number: string;
  issueDate: string;
  vatRatePercent: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  clientCity: string;
  clientPostalCode: string;
  clientCountry: string;
  clientTaxId: string;
};

function SingleMode({
  quote,
  isEditing,
  editData,
  isSaving,
  onSave,
  onCancelEdit,
  onUpdateField,
}: {
  quote: NonNullable<ReturnType<typeof useQuotes>["quotes"]>[number];
  isEditing: boolean;
  editData: EditableQuoteFields | null;
  isSaving: boolean;
  onSave: () => Promise<void>;
  onCancelEdit: () => void;
  onUpdateField: <K extends keyof EditableQuoteFields>(key: K, value: EditableQuoteFields[K]) => void;
}) {
  const { timeline, isLoadingTimeline } = useQuotes();
  const [isSending, setIsSending] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const router = useRouter();

  // ── Calculs ──────────────────────────────────────────────
  const totalHT = useMemo(
    () => computeTotalHT(quote),
    [quote],
  );

  const totalTVA = useMemo(
    () => totalHT * (quote.vatRatePercent / 100),
    [totalHT, quote.vatRatePercent],
  );

  const totalTTC = totalHT + totalTVA;

  // ── Tags du client ───────────────────────────────────────
  const clientTags = quote.client.tags ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex-1 flex flex-col min-h-0"
    >
      {/* ── Contenu scrollable ── */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-5 space-y-4">
        {/* ═══ SECTION 1 : En-tête Devis ═══ */}
        <SectionCard
          title="En-tête Devis"
          icon={<FileTextIcon size={14} weight="duotone" />}
        >
          <div className="space-y-3">
            {/* N° Devis — éditable */}
            {isEditing ? (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                  <Hash size={14} weight="duotone" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn(DS_LABEL, "text-[9px] mb-0.5")}>N° Devis</p>
                  <input
                    value={editData?.number ?? ""}
                    onChange={(e) => onUpdateField("number", e.target.value)}
                    className={cn(
                      DS_MONO,
                      "w-full text-sm text-slate-800 bg-white border border-indigo-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400",
                    )}
                  />
                </div>
              </div>
            ) : (
              <InfoRow
                label="N° Devis"
                value={quote.number}
                icon={<Hash size={14} weight="duotone" />}
                mono
              />
            )}

            {/* Date — éditable */}
            {isEditing ? (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                  <CalendarBlank size={14} weight="duotone" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn(DS_LABEL, "text-[9px] mb-0.5")}>Date</p>
                  <input
                    type="date"
                    value={editData?.issueDate ?? ""}
                    onChange={(e) => onUpdateField("issueDate", e.target.value)}
                    className={cn(
                      DS_MONO,
                      "w-full text-sm text-slate-800 bg-white border border-indigo-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400",
                    )}
                  />
                </div>
              </div>
            ) : (
              <InfoRow
                label="Date"
                value={formatDateLong(quote.createdAt)}
                icon={<CalendarBlank size={14} weight="duotone" />}
              />
            )}

            <InfoRow
              label="Statut"
              icon={<Lightning size={14} weight="duotone" />}
              badge={
                <span className={cn(STATUS_BADGE[quote.status], "inline-block")}>
                  {STATUS_LABEL[quote.status]}
                </span>
              }
            />
            <InfoRow
              label="Montant TTC"
              value={formatPrice(totalTTC)}
              icon={<CurrencyCircleDollar size={14} weight="duotone" />}
              mono
            />
            {quote.vatRatePercent > 0 && (
              <div className="ml-10 space-y-1">
                <p className={cn(DS_MONO, "text-[10px] text-slate-400")}>
                  HT : {formatPrice(totalHT)} — TVA ({quote.vatRatePercent}%) : {formatPrice(totalTVA)}
                </p>
              </div>
            )}
          </div>
        </SectionCard>

        {/* ═══ SECTION 2 : Lignes du Devis ═══ */}
        <SectionCard
          title="Lignes du Devis"
          icon={<ListNumbers size={14} weight="duotone" />}
        >
          {quote.lines.length === 0 ? (
            <p className={cn(DS_MONO, "text-xs text-slate-400 italic")}>
              Aucune ligne sur ce devis
            </p>
          ) : (
            <div className="space-y-0">
              {/* ── Micro en-tête de colonnes (guide visuel discret) ── */}
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-100 mb-0">
                <span className={cn(DS_MONO, "text-[9px] text-slate-400 uppercase tracking-wider")}>
                  Description
                </span>
                <div className="flex items-center gap-6">
                  <span className={cn(DS_MONO, "text-[9px] text-slate-400 uppercase tracking-wider")}>
                    Détails
                  </span>
                  <span className={cn(DS_MONO, "text-[9px] text-slate-400 uppercase tracking-wider w-20 text-right")}>
                    Total
                  </span>
                </div>
              </div>

              {/* Blocs lignes — format liste verticale */}
              {quote.lines.map((line, idx) => (
                <div
                  key={line.id}
                  className={cn(
                    "py-3",
                    idx < quote.lines.length - 1 && "border-b border-slate-100",
                  )}
                >
                  {/* Ligne 1 : Titre du produit/service */}
                  <p className="text-[13px] font-semibold text-slate-900 whitespace-normal break-words leading-snug">
                    {line.title}
                  </p>

                  {/* Sous-titre optionnel */}
                  {line.subtitle && (
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                      {line.subtitle}
                    </p>
                  )}

                  {/* Ligne 2 : Détails prix et total */}
                  <div className="flex justify-between items-center mt-1.5">
                    <span className="text-[11px] text-slate-500 font-mono">
                      {line.quantity}× {formatPrice(line.unitPrice)}
                    </span>
                    <span className="text-[13px] font-bold text-slate-900 tabular-nums">
                      {formatPrice(line.unitPrice * line.quantity)}
                    </span>
                  </div>
                </div>
              ))}

              {/* Totaux */}
              <div className="border-t border-slate-200 pt-3 mt-0 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className={cn(DS_MONO, "text-[11px] text-slate-500")}>Total HT</span>
                  <span className={cn(DS_MONO, "text-[11px] font-medium text-slate-700 tabular-nums")}>
                    {formatPrice(totalHT)}
                  </span>
                </div>
                {quote.vatRatePercent > 0 && (
                  <div className="flex justify-between items-center">
                    <span className={cn(DS_MONO, "text-[10px] text-slate-400")}>
                      TVA ({quote.vatRatePercent}%)
                    </span>
                    <span className={cn(DS_MONO, "text-[10px] text-slate-500 tabular-nums")}>
                      {formatPrice(totalTVA)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1.5 border-t border-slate-100">
                  <span className={cn(DS_MONO, "text-[11px] font-bold text-slate-900")}>Total TTC</span>
                  <span className={cn(DS_MONO, "text-sm font-bold text-indigo-700 tabular-nums")}>
                    {formatPrice(totalTTC)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </SectionCard>

        {/* ═══ SECTION 3 : Infos Client ═══ */}
        <SectionCard
          title="Informations Client"
          icon={<UserIcon size={14} weight="duotone" />}
        >
          <div className="space-y-3">
            {/* Nom / Société — éditable */}
            {isEditing ? (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                  <UserIcon size={14} weight="duotone" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn(DS_LABEL, "text-[9px] mb-0.5")}>Nom / Société</p>
                  <input
                    value={editData?.clientName ?? ""}
                    onChange={(e) => onUpdateField("clientName", e.target.value)}
                    className="w-full text-sm text-slate-800 bg-white border border-indigo-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                </div>
              </div>
            ) : (
              <InfoRow
                label="Nom / Société"
                value={quote.client.name}
                icon={<UserIcon size={14} weight="duotone" />}
              />
            )}

            {/* Email — éditable */}
            {isEditing ? (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                  <EnvelopeSimple size={14} weight="duotone" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn(DS_LABEL, "text-[9px] mb-0.5")}>Email</p>
                  <input
                    type="email"
                    value={editData?.clientEmail ?? ""}
                    onChange={(e) => onUpdateField("clientEmail", e.target.value)}
                    className="w-full text-sm text-slate-800 bg-white border border-indigo-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                </div>
              </div>
            ) : (
              quote.client.email && (
                <InfoRow
                  label="Email"
                  value={quote.client.email}
                  icon={<EnvelopeSimple size={14} weight="duotone" />}
                />
              )
            )}

            {/* Téléphone — éditable */}
            {isEditing ? (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                  <PhoneIcon size={14} weight="duotone" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn(DS_LABEL, "text-[9px] mb-0.5")}>Téléphone</p>
                  <input
                    value={editData?.clientPhone ?? ""}
                    onChange={(e) => onUpdateField("clientPhone", e.target.value)}
                    className="w-full text-sm text-slate-800 bg-white border border-indigo-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                </div>
              </div>
            ) : (
              quote.client.phone && (
                <InfoRow
                  label="Téléphone"
                  value={quote.client.phone}
                  icon={<PhoneIcon size={14} weight="duotone" />}
                />
              )
            )}

            {/* Adresse — éditable */}
            {isEditing ? (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                  <MapPinIcon size={14} weight="duotone" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className={cn(DS_LABEL, "text-[9px] mb-0.5")}>Adresse</p>
                  <input
                    placeholder="Adresse"
                    value={editData?.clientAddress ?? ""}
                    onChange={(e) => onUpdateField("clientAddress", e.target.value)}
                    className="w-full text-sm text-slate-800 bg-white border border-indigo-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                  <div className="flex gap-1">
                    <input
                      placeholder="Code postal"
                      value={editData?.clientPostalCode ?? ""}
                      onChange={(e) => onUpdateField("clientPostalCode", e.target.value)}
                      className="w-1/3 text-sm text-slate-800 bg-white border border-indigo-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    />
                    <input
                      placeholder="Ville"
                      value={editData?.clientCity ?? ""}
                      onChange={(e) => onUpdateField("clientCity", e.target.value)}
                      className="flex-1 text-sm text-slate-800 bg-white border border-indigo-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    />
                  </div>
                  <input
                    placeholder="Pays"
                    value={editData?.clientCountry ?? ""}
                    onChange={(e) => onUpdateField("clientCountry", e.target.value)}
                    className="w-full text-sm text-slate-800 bg-white border border-indigo-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                </div>
              </div>
            ) : (
              <>
                {(quote.client.address || quote.client.city || quote.client.postalCode) && (
                  <InfoRow
                    label="Adresse"
                    icon={<MapPinIcon size={14} weight="duotone" />}
                    value={
                      <div className="space-y-0.5">
                        {quote.client.address && (
                          <p className="font-sans text-sm text-slate-800 leading-snug">
                            {quote.client.address}
                          </p>
                        )}
                        {quote.client.addressLine2 && (
                          <p className="font-sans text-sm text-slate-800 leading-snug">
                            {quote.client.addressLine2}
                          </p>
                        )}
                        {(quote.client.postalCode || quote.client.city) && (
                          <p className="font-sans text-sm text-slate-800 leading-snug">
                            {[quote.client.postalCode, quote.client.city]
                              .filter(Boolean)
                              .join(" ")}
                          </p>
                        )}
                      </div>
                    }
                  />
                )}

                {quote.client.country && (
                  <InfoRow label="Pays" value={quote.client.country} />
                )}
              </>
            )}

            {!isEditing && clientTags.length > 0 && (
              <InfoRow
                label="Tags"
                icon={<TagIcon size={14} weight="duotone" />}
                value={
                  <div className="flex flex-wrap gap-1.5 mt-0.5">
                    {clientTags.map((tag) => (
                      <span
                        key={tag}
                        className={cn(
                          "px-2 py-0.5 rounded-md text-[9px] font-semibold",
                          "bg-indigo-50 text-indigo-600 border border-indigo-200",
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                }
              />
            )}
          </div>
        </SectionCard>

        {/* ═══ SECTION 4 : Timeline (événements persistés) ═══ */}
        <SectionCard
          title="Timeline"
          icon={<ClockIcon size={14} weight="duotone" />}
        >
          {isLoadingTimeline ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-4 h-4 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : timeline.length === 0 ? (
            <p className={cn(DS_MONO, "text-xs text-slate-400 italic")}>
              Aucun événement enregistré
            </p>
          ) : (
            <div className="space-y-2.5">
              {timeline.map((event) => {
                const eventLabel = event.type === "created" ? "Création" :
                  event.type === "sent" ? "Envoi email" :
                  event.type === "status_changed" ? "Changement de statut" :
                  event.type;
                return (
                  <div
                    key={event.id}
                    className="flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                      <ClockIcon size={12} weight="fill" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={cn(DS_LABEL, "text-[9px]")}>
                          {eventLabel}
                        </span>
                        <span className="text-[9px] text-slate-300">·</span>
                        <span className={cn(DS_MONO, "text-[9px] text-slate-400")}>
                          {formatDateTime(event.createdAt)}
                        </span>
                      </div>
                      {event.type === "status_changed" && event.metadata && (
                        <p className={cn(DS_MONO, "text-xs text-slate-700 mt-0.5 leading-snug")}>
                          {String((event.metadata as Record<string, unknown>)?.from || "")} → {String((event.metadata as Record<string, unknown>)?.to || event.status || "")}
                        </p>
                      )}
                      {event.type === "created" && (
                        <p className={cn(DS_MONO, "text-xs text-slate-500 mt-0.5 leading-snug")}>
                          Devis créé
                        </p>
                      )}
                      {event.type === "sent" && event.metadata && (
                        <p className={cn(DS_MONO, "text-xs text-slate-500 mt-0.5 leading-snug")}>
                          Envoyé à {String((event.metadata as Record<string, unknown>)?.email || "")}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Modal formulaire d'envoi email */}
      <EmailSendForm
        open={showEmailForm}
        onOpenChange={setShowEmailForm}
        quoteId={quote.id}
        defaultEmail={quote.client.email ?? ""}
        defaultSubject={`Votre devis ${quote.number}`}
        quoteNumber={quote.number}
      />
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// BATCH MODE
// ═══════════════════════════════════════════════════════════════

function BatchMode({
  quotes,
}: {
  quotes: NonNullable<ReturnType<typeof useQuotes>["quotes"]>;
}) {
  const { clearSelection, refresh } = useQuotes();
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [sendProgress, setSendProgress] = useState({ sent: 0, failed: 0, total: 0 });

  const totalSum = useMemo(
    () =>
      quotes.reduce(
        (acc, q) =>
          acc + q.lines.reduce((lnAcc, ln) => lnAcc + ln.unitPrice * ln.quantity, 0),
        0,
      ),
    [quotes],
  );

  // Handler "Envoyer sélection" — envoie les emails en boucle avec progression
  const handleBatchSend = useCallback(async () => {
    setIsSending(true);
    setSendProgress({ sent: 0, failed: 0, total: quotes.length });
    let sent = 0;
    let failed = 0;
    for (const q of quotes) {
      try {
        const email = q.client.email;
        if (!email) {
          failed++;
          setSendProgress({ sent, failed, total: quotes.length });
          continue;
        }
        const res = await sendQuoteEmailAction({ quoteId: q.id });
        if (res.success) {
          sent++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
      setSendProgress({ sent, failed, total: quotes.length });
    }
    setIsSending(false);
    setSendDialogOpen(false);
    clearSelection();
    refresh();
    if (failed === 0) {
      notify.success("ENVOI_BATCH", `${sent} devis envoyés avec succès.`);
    } else {
      notify.error("ENVOI_BATCH", `${sent} envoyés, ${failed} échecs.`);
    }
  }, [quotes, clearSelection, refresh]);

  // Handler "Supprimer sélection"
  const handleBatchDelete = useCallback(async () => {
    setIsDeleting(true);
    let successCount = 0;
    let failCount = 0;
    for (const q of quotes) {
      try {
        const res = await deleteQuoteAction(q.id);
        if (res.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
    }
    setIsDeleting(false);
    setDeleteDialogOpen(false);
    clearSelection();
    router.refresh();
    if (failCount === 0) {
      notify.success("SUPPRESSION_BATCH", `${successCount} devis supprimés avec succès.`);
    } else {
      notify.error("SUPPRESSION_BATCH", `${successCount} supprimés, ${failCount} échecs.`);
    }
  }, [quotes, clearSelection, router]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="flex-1 flex flex-col"
    >
      {/* En-tête */}
      <div className="shrink-0 px-5 py-4 border-b border-slate-100 space-y-1">
        <span className={cn(DS_LABEL, "text-[10px]")}>
          Actions groupées
        </span>
      </div>

      {/* Stats */}
      <div className="flex-1 px-5 py-4 space-y-4 overflow-y-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-400 shrink-0">
            <FileTextIcon size={16} weight="duotone" />
          </div>
          <div className="min-w-0">
            <p className={cn(DS_LABEL, "text-[9px]")}>
              Devis sélectionnés
            </p>
            <p className={cn(DS_MONO, "text-sm font-bold text-slate-900")}>
              {quotes.length} devis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-400 shrink-0">
            <CurrencyCircleDollar size={16} weight="duotone" />
          </div>
          <div className="min-w-0">
            <p className={cn(DS_LABEL, "text-[9px]")}>
              Total HT cumulé
            </p>
            <p className={cn(DS_MONO, "text-sm font-bold text-slate-900")}>
              {formatPrice(totalSum)}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="shrink-0 px-5 py-4 border-t border-slate-100 flex flex-col gap-2">
        <button
          onClick={() => setSendDialogOpen(true)}
          className={BTN_PRIMARY + " w-full justify-center"}
        >
          <PaperPlaneTilt size={12} weight="bold" />
          Envoyer sélection
        </button>
        <button
          onClick={() => setDeleteDialogOpen(true)}
          className={BTN_DANGER + " w-full justify-center"}
        >
          <TrashSimple size={12} weight="bold" />
          Supprimer sélection
        </button>
      </div>

      {/* Dialog confirmation envoi batch */}
      <AlertDialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Envoyer {quotes.length} devis ?</AlertDialogTitle>
            <AlertDialogDescription>
              {quotes.length} devis seront envoyés par email à leurs clients respectifs.
              {isSending && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    Envoi en cours... {sendProgress.sent + sendProgress.failed}/{sendProgress.total}
                  </div>
                  <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className="bg-indigo-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${((sendProgress.sent + sendProgress.failed) / sendProgress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSending}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              disabled={isSending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={(e) => {
                e.preventDefault();
                handleBatchSend();
              }}
            >
              {isSending ? (
                <span className="inline-flex items-center gap-1">
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Envoi en cours...
                </span>
              ) : (
                `Envoyer les ${quotes.length} devis`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog confirmation suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer {quotes.length} devis ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. {quotes.length} devis seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={(e) => {
                e.preventDefault();
                handleBatchDelete();
              }}
            >
              {isDeleting ? (
                <span className="inline-flex items-center gap-1">
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Suppression...
                </span>
              ) : (
                `Supprimer les ${quotes.length} devis`
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN — QuoteDetailSidebar
// ═══════════════════════════════════════════════════════════════

export function QuoteDetailSidebar() {
  const { quotes, selectedQuoteIds, activeQuoteId, selectQuote } = useQuotes();
  const router = useRouter();

  // États d'édition (remontés ici pour que les boutons soient dans l'en-tête)
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editData, setEditData] = useState<EditableQuoteFields | null>(null);

  // Détermine le mode actuel
  const mode = useMemo<"empty" | "single" | "batch">(() => {
    if (selectedQuoteIds.size === 0 && !activeQuoteId) return "empty";
    if (selectedQuoteIds.size === 1 || (activeQuoteId && selectedQuoteIds.size === 0))
      return "single";
    return "batch";
  }, [selectedQuoteIds, activeQuoteId]);

  // Récupère le(s) devis sélectionné(s)
  const selectedQuotes = useMemo(() => {
    if (mode === "single") {
      const targetId =
        selectedQuoteIds.size === 1
          ? Array.from(selectedQuoteIds)[0]
          : activeQuoteId;
      return quotes.filter((q) => q.id === targetId);
    }
    if (mode === "batch") {
      return quotes.filter((q) => selectedQuoteIds.has(q.id));
    }
    return [];
  }, [quotes, selectedQuoteIds, activeQuoteId, mode]);

  // Devise courant pour l'édition
  const currentQuote = selectedQuotes[0] ?? null;

  // Réinitialiser editData quand le devis change
  useEffect(() => {
    if (!currentQuote) return;
    setEditData({
      number: currentQuote.number,
      issueDate: currentQuote.createdAt instanceof Date
        ? currentQuote.createdAt.toISOString().split("T")[0]
        : new Date(currentQuote.createdAt).toISOString().split("T")[0],
      vatRatePercent: currentQuote.vatRatePercent,
      clientName: currentQuote.client.name ?? "",
      clientEmail: currentQuote.client.email ?? "",
      clientPhone: currentQuote.client.phone ?? "",
      clientAddress: currentQuote.client.address ?? "",
      clientCity: currentQuote.client.city ?? "",
      clientPostalCode: currentQuote.client.postalCode ?? "",
      clientCountry: currentQuote.client.country ?? "",
      clientTaxId: currentQuote.client.taxId ?? "",
    });
  }, [currentQuote]);

  // Annulation
  const handleCancelEdit = useCallback(() => {
    if (!currentQuote) return;
    setEditData({
      number: currentQuote.number,
      issueDate: currentQuote.createdAt instanceof Date
        ? currentQuote.createdAt.toISOString().split("T")[0]
        : new Date(currentQuote.createdAt).toISOString().split("T")[0],
      vatRatePercent: currentQuote.vatRatePercent,
      clientName: currentQuote.client.name ?? "",
      clientEmail: currentQuote.client.email ?? "",
      clientPhone: currentQuote.client.phone ?? "",
      clientAddress: currentQuote.client.address ?? "",
      clientCity: currentQuote.client.city ?? "",
      clientPostalCode: currentQuote.client.postalCode ?? "",
      clientCountry: currentQuote.client.country ?? "",
      clientTaxId: currentQuote.client.taxId ?? "",
    });
    setIsEditing(false);
  }, [currentQuote]);

  // Sauvegarde
  const handleSave = useCallback(async () => {
    if (!editData || !currentQuote) return;
    setIsSaving(true);
    try {
      const res = await updateQuoteInlineAction(currentQuote.id, {
        number: editData.number,
        issueDate: editData.issueDate,
        vatRatePercent: editData.vatRatePercent,
        clientName: editData.clientName,
        clientEmail: editData.clientEmail,
        clientPhone: editData.clientPhone,
        clientAddress: editData.clientAddress,
        clientCity: editData.clientCity,
        clientPostalCode: editData.clientPostalCode,
        clientCountry: editData.clientCountry,
        clientTaxId: editData.clientTaxId,
      });
      if (!res.success) {
        notify.error("ERREUR_SAUVEGARDE", res.error ?? "Impossible de sauvegarder les modifications.");
        return;
      }
      setIsEditing(false);
      router.refresh();
    } catch {
      notify.error("ERREUR_SYSTÈME", "Une erreur inattendue est survenue.");
    } finally {
      setIsSaving(false);
    }
  }, [editData, currentQuote, router]);

  // Suppression
  const handleDelete = useCallback(async () => {
    if (!currentQuote) return;
    setIsDeleting(true);
    try {
      const res = await deleteQuoteAction(currentQuote.id);
      if (!res.success) {
        notify.error("ERREUR_SUPPRESSION", res.error ?? "Échec de la suppression.");
        return;
      }
      notify.success("DEVIS_SUPPRIMÉ", `Le devis ${currentQuote.number} a été supprimé.`);
      setDeleteDialogOpen(false);
      selectQuote(null);
      router.refresh();
    } catch {
      notify.error("ERREUR_SYSTÈME", "Une erreur inattendue est survenue lors de la suppression.");
    } finally {
      setIsDeleting(false);
    }
  }, [currentQuote, selectQuote, router]);

  // Helper de mise à jour d'un champ editable
  const updateField = useCallback(<K extends keyof EditableQuoteFields>(
    key: K,
    value: EditableQuoteFields[K],
  ) => {
    setEditData((prev) => (prev ? { ...prev, [key]: value } : prev));
  }, []);

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-md overflow-hidden">
      {/* Entête fixe de la sidebar — avec titre et boutons d'action */}
      <div className="shrink-0 px-5 py-3  border-b border-slate-100 flex items-center justify-between gap-2">
        <span className={cn(DS_LABEL, "uppercase tracking-wider text-[10px]")}>
          {mode === "single"
            ? "Consultation Devis"
            : mode === "batch"
              ? "Actions groupées"
              : "Informations"}
        </span>

        {/* Boutons d'action — uniquement en mode single */}
        {mode === "single" && !isEditing && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wide bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              <PencilSimple size={9} weight="bold" />
              Éditer
            </button>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <button className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wide bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 transition-colors">
                  <TrashSimple size={9} weight="bold" />
                  Suppr.
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer le devis {currentQuote?.number}</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. Le devis et toutes ses données associées seront définitivement supprimés.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={isDeleting}
                    className="bg-rose-600 hover:bg-rose-700 text-white"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete();
                    }}
                  >
                    {isDeleting ? (
                      <span className="inline-flex items-center gap-1">
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Suppression...
                      </span>
                    ) : (
                      "Confirmer la suppression"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        {/* Boutons Sauvegarder/Annuler — quand en mode édition */}
        {mode === "single" && isEditing && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wide bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <span className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <PencilSimple size={9} weight="bold" />
              )}
              Sauver
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wide bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
          </div>
        )}
      </div>

      {/* Contenu animé avec scroll propre */}
      <div className="flex-1 flex flex-col min-h-0">
        <AnimatePresence mode="wait">
          {mode === "empty" && <EmptyState key="empty" />}
          {mode === "single" && selectedQuotes[0] && (
            <SingleMode
              key={selectedQuotes[0].id}
              quote={selectedQuotes[0]}
              isEditing={isEditing}
              editData={editData}
              isSaving={isSaving}
              onSave={handleSave}
              onCancelEdit={handleCancelEdit}
              onUpdateField={updateField}
            />
          )}
          {mode === "batch" && selectedQuotes.length > 0 && (
            <BatchMode key={`batch-${selectedQuotes.length}`} quotes={selectedQuotes} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default QuoteDetailSidebar;