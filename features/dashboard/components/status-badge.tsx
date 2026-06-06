"use client";

import { QuoteStatus } from "@/app/generated/prisma/enums";
import {
  DS_BADGE_ACTIVE,
  DS_BADGE_SUCCESS,
  DS_BADGE_DANGER,
  DS_BADGE_NEUTRAL,
  DS_BADGE_ACCEPTED,
  DS_BADGE_CANCELLED,
} from "@/lib/design-system";

// ═══════════════════════════════════════════════════════════════════════════════
// STATUS BADGE — Utilise les tokens DS_BADGE_* (cohérent avec la page Quotes)
// ═══════════════════════════════════════════════════════════════════════════════

const STATUS_BADGE_CLASS: Record<QuoteStatus, string> = {
  DRAFT: DS_BADGE_NEUTRAL,
  SENT: DS_BADGE_ACTIVE,
  ACCEPTED: DS_BADGE_ACCEPTED,
  PAID: DS_BADGE_SUCCESS,
  REJECTED: DS_BADGE_DANGER,
  CANCELLED: DS_BADGE_CANCELLED,
};

const STATUS_LABELS: Record<QuoteStatus, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyé",
  ACCEPTED: "Accepté",
  PAID: "Payé",
  REJECTED: "Refusé",
  CANCELLED: "Annulé",
};

interface StatusBadgeProps {
  status: QuoteStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={STATUS_BADGE_CLASS[status]}>
      {STATUS_LABELS[status]}
    </span>
  );
}