"use client";

import React, { useMemo } from "react";
import { QuoteStatus } from "@/app/generated/prisma/enums";
import { WelcomeBanner } from "./components/welcome-banner";
import { ActivitySparkline } from "./components/activity-sparkline";
import { RecentActionsTable } from "./components/recent-actions-table";
import { DraftQuotesCard } from "./components/draft-quotes-card";
import { TopClientsCard } from "./components/top-clients-card";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface DashboardProps {
  firstName?: string;
  data: {
    kpis: {
      chiffreAffairesTotal: number;
      enAttentePaiement: number;
      tauxConversion: number;
      devisActifs: number;
    };
    fluxRecent: Array<{
      id: string;
      clientNom: string;
      projetTitre: string;
      montant: number;
      statut: QuoteStatus;
      date: string;
      delaiJours: number;
      estUrgent: boolean;
      variationMontant: number;
      categorie: string;
      quoteCount: number;
    }>;
    portefeuilleStrategique: Array<{
      id: string;
      nom: string;
      valeurCumulee: number;
      nombreDevis: number;
      scoreSante: "EXCELLENT" | "GOOD" | "SLOW";
      delaiMoyen: number;
    }>;
    sparkline: number[];
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD VIEW — Orchestrateur des composants atomiques
// ═══════════════════════════════════════════════════════════════════════════════

export function DashboardView({ firstName = "", data }: DashboardProps) {
  const { kpis, fluxRecent, portefeuilleStrategique, sparkline: sparklineData } = data;

  // Filtrer les brouillons pour la carte dédiée
  const draftItems = useMemo(
    () =>
      fluxRecent
        .filter((item) => item.statut === "DRAFT")
        .slice(0, 6)
        .map(({ id, projetTitre, clientNom, montant, date }) => ({
          id,
          projetTitre,
          clientNom,
          montant,
          date,
        })),
    [fluxRecent],
  );

  return (
    <div className="flex flex-col h-full w-full bg-slate-50">
      {/* ── Welcome Banner (remplace PageHeader) ── */}
      <div className="shrink-0 px-6 pt-6">
        <WelcomeBanner firstName={firstName} kpis={kpis} />
      </div>

      {/* ── Content area (scrollable) ── */}
      <div className="flex flex-col flex-1 min-h-0 px-6 pb-6 pt-4 overflow-y-auto gap-4">

        {/* LIGNE 1 — Graphique d'activité en pleine largeur */}
        <ActivitySparkline data={sparklineData} />

        {/* LIGNE 2 — Brouillons + Actions (gauche) / Top Clients (droite) */}
        <div className="flex w-full gap-6">
          {/* COLONNE GAUCHE — Brouillons + Dernières Actions */}
          <div className="flex-1 min-w-0 flex flex-col space-y-3">
            <DraftQuotesCard items={draftItems} />
            <RecentActionsTable items={fluxRecent} />
          </div>

          {/* COLONNE DROITE — Top Clients uniquement */}
          <aside className="w-[400px] shrink-0">
            <TopClientsCard items={portefeuilleStrategique} />
          </aside>
        </div>
      </div>
    </div>
  );
}