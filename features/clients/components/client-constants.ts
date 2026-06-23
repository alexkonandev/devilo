"use client";

// ═══════════════════════════════════════════════════════════════
// CONSTANTES PARTAGÉES — Répertoire Clients
// Palette : slate/indigo (Design System unifié)
// ═══════════════════════════════════════════════════════════════

/** Status labels pour les devis (palette DS slate/indigo) */
export const STATUS_LABELS: Record<string, string> = {
  PAID: "Payé",
  SENT: "Envoyé",
  DRAFT: "Brouillon",
  ACCEPTED: "Accepté",
  REJECTED: "Refusé",
  REMINDER: "Relance",
};

/** Configuration des status avec couleurs DS slate/indigo */
export const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  PAID:     { label: "Payé",     bg: "bg-emerald-50", text: "text-emerald-600" },
  SENT:     { label: "Envoyé",   bg: "bg-indigo-50",   text: "text-indigo-600" },
  DRAFT:    { label: "Brouillon", bg: "bg-slate-100", text: "text-slate-500" },
  ACCEPTED: { label: "Accepté",  bg: "bg-emerald-50", text: "text-emerald-600" },
  REJECTED: { label: "Refusé",   bg: "bg-rose-50",    text: "text-rose-600" },
  REMINDER: { label: "Relance",  bg: "bg-amber-50",   text: "text-amber-600" },
};

/** Options de filtre pour le répertoire */
export const FILTER_OPTIONS = [
  { value: "all" as const,     label: "Tous" },
  { value: "relance" as const, label: "À solliciter" },
  { value: "inactif" as const, label: "Inactifs +90j" },
];

/** Alphabet pour la navigation alphabétique */
export const ALPHABET = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i)
) as string[];

/** Action meta pour la timeline d'activité */
export const ACTIVITY_META: Record<
  string,
  { icon: string; color: string; bg: string; label: string }
> = {
  NOTE:          { icon: "Note",          color: "text-amber-600", bg: "bg-amber-50",  label: "Note" },
  EMAIL:         { icon: "EnvelopeSimple", color: "text-indigo-600", bg: "bg-indigo-50", label: "Email" },
  CALL:          { icon: "Phone",         color: "text-emerald-600", bg: "bg-emerald-50", label: "Appel" },
  STATUS_CHANGE: { icon: "ArrowUpRight",  color: "text-blue-600",  bg: "bg-blue-50",   label: "Statut" },
};

/** Limite par page pour la pagination */
export const PAGE_LIMIT = 25;

/** Nombre max de tags affichés sur une ContactCard */
export const MAX_TAGS_DISPLAY = 3;

/** Nombre max de devis affichés par défaut dans le profil */
export const MAX_QUOTES_PREVIEW = 5;