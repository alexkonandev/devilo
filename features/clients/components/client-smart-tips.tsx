"use client";

import React, { useMemo } from "react";
import { ClientListItem } from "@/types/client";
import { cn } from "@/lib/utils";
import {
  Sparkle,
  Lightbulb,
  ClockClockwise,
} from "@phosphor-icons/react";
import {
  DS_BENTO_CARD,
  DS_SECTION_TITLE,
  DS_BODY,
  DS_TEL_BLOCK,
} from "@/lib/design-system";

// ─── Utils ────────────────────────────────────────────────────────────────────

const daysSince = (date: Date | string | null | undefined): number | null => {
  if (!date) return null;
  const d = new Date(date);
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface ClientSmartTipsProps {
  clients: ClientListItem[];
  clientsSansDevis: ClientListItem[];
  activeFilter: "all" | "relance" | "inactif";
  setActiveFilter: (filter: "all" | "relance" | "inactif") => void;
  setPage: (page: number) => void;
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function ClientSmartTips({
  clients,
  clientsSansDevis,
  activeFilter,
  setActiveFilter,
  setPage,
}: ClientSmartTipsProps) {
  const smartTips = useMemo(() => {
    const tips: { icon: React.ReactNode; title: string; desc: string; filter: "all" | "relance" | "inactif" }[] = [];

    // Tip 1 : Client avec le plus gros CA
    const topClient = [...clients].sort((a, b) => {
      const revenueA = (a.quotes || []).filter(q => q.status === "PAID").reduce((s, q) => s + q.totalAmount, 0);
      const revenueB = (b.quotes || []).filter(q => q.status === "PAID").reduce((s, q) => s + q.totalAmount, 0);
      return revenueB - revenueA;
    })[0];
    if (topClient) {
      const topRevenue = (topClient.quotes || []).filter(q => q.status === "PAID").reduce((s, q) => s + q.totalAmount, 0);
      const totalRevenue = clients.reduce((sum, c) =>
        sum + (c.quotes || []).filter(q => q.status === "PAID").reduce((s, q) => s + q.totalAmount, 0), 0);
      if (totalRevenue > 0 && topRevenue / totalRevenue > 0.3) {
        tips.push({
          icon: <Sparkle size={12} className="text-amber-500" weight="bold" />,
          title: "Concentration CA",
          desc: `${topClient.name} représente ${Math.round(topRevenue / totalRevenue * 100)}% de votre CA. Pensez à diversifier.`,
          filter: "all",
        });
      }
    }

    // Tip 2 : Devis en attente depuis +15 jours
    const oldDraftClients = clientsSansDevis.filter(c => {
      const lastContact = c.quotes && c.quotes.length > 0
        ? new Date(c.quotes[c.quotes.length - 1].createdAt)
        : new Date(c.createdAt);
      const days = daysSince(lastContact);
      return days !== null && days > 15;
    });
    if (oldDraftClients.length >= 2) {
      tips.push({
        icon: <Lightbulb size={12} className="text-rose-500" weight="fill" />,
        title: "Relance prioritaire",
        desc: `${oldDraftClients.length} client${oldDraftClients.length > 1 ? "s" : ""} sans devis récent depuis +15 jours. Une relance aujourd'hui augmenterait vos chances.`,
        filter: "relance",
      });
    }

    // Tip 3 : Client inactif depuis longtemps
    const inactiveClients = clients.filter(c => {
      const lastContact = c.quotes && c.quotes.length > 0
        ? new Date(c.quotes[c.quotes.length - 1].createdAt)
        : new Date(c.createdAt);
      const days = daysSince(lastContact);
      return days !== null && days > 90;
    });
    const oldestInactive = inactiveClients.sort((a, b) => {
      const lastA = a.quotes && a.quotes.length > 0 ? new Date(a.quotes[a.quotes.length - 1].createdAt) : new Date(a.createdAt);
      const lastB = b.quotes && b.quotes.length > 0 ? new Date(b.quotes[b.quotes.length - 1].createdAt) : new Date(b.createdAt);
      return new Date(lastA).getTime() - new Date(lastB).getTime();
    })[0];
    if (oldestInactive && inactiveClients.length > 0) {
      const days = daysSince(
        oldestInactive.quotes && oldestInactive.quotes.length > 0
          ? oldestInactive.quotes[oldestInactive.quotes.length - 1].createdAt
          : oldestInactive.createdAt
      );
      tips.push({
        icon: <ClockClockwise size={12} className="text-indigo-500" weight="bold" />,
        title: "Rétention client",
        desc: `${oldestInactive.name} n'a pas eu de nouveau devis depuis ${days} jours. Proposez-lui une mise à jour.`,
        filter: "inactif",
      });
    }

    return tips;
  }, [clients, clientsSansDevis]);

  if (smartTips.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {smartTips.map((tip, idx) => (
        <button
          key={idx}
          onClick={() => { setActiveFilter(tip.filter); setPage(1); }}
          className={cn(
            DS_BENTO_CARD,
            "p-4 text-left transition-all hover:shadow-sm hover:-translate-y-0.5 cursor-pointer text-left w-full",
            activeFilter === tip.filter && "ring-1 ring-indigo-400",
          )}
        >
          <div className="flex items-start gap-3">
            <div className={cn(DS_TEL_BLOCK, "w-7 h-7 flex items-center justify-center shrink-0")}>
              {tip.icon}
            </div>
            <div className="min-w-0">
              <span className={cn(DS_SECTION_TITLE, "block mb-1")}>{tip.title}</span>
              <p className={cn(DS_BODY, "text-[11px] leading-snug")}>{tip.desc}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}