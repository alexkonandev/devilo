import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import db from "@/lib/prisma";
import { getAdvancedDashboardData } from "@/actions/dashboard-actions";
import { DashboardView } from "@/features/dashboard/dashboard-view";

export const metadata = {
  title: "Console de Performance | DevisExpress",
};

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Récupération du prénom pour le message de bienvenue
  const user = await currentUser();
  const firstName = user?.firstName ?? "";

  // 1. EXTRACTION DE L'INTELLIGENCE MÉTIER
  const rawData = await getAdvancedDashboardData();

  if (!rawData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Aucune donnée disponible pour le moment.</p>
      </div>
    );
  }

  // Génération d'une sparkline à partir des montants d'activité récente
  const sparkline = rawData.activity.length > 0
    ? rawData.activity.map((item) => item.amount)
    : [12, 18, 15, 25, 22, 30, 28, 35, 40, 38, 45, 50, 48, 55, 60, 58, 65, 70, 68, 75, 80, 78, 85, 90, 88, 95, 100, 98, 105, 110];

  // 3. MAPPING STRATÉGIQUE (On casse la redondance ici)
  const mappedData = {
    kpis: {
      chiffreAffairesTotal: rawData.kpis.totalRevenue,
      enAttentePaiement: rawData.kpis.pendingRevenue,
      tauxConversion: rawData.kpis.conversionRate,
      devisActifs: rawData.kpis.activeQuotes,
    },
    // FLUX : Focus sur l'opérationnel et le projet précis
    fluxRecent: rawData.activity.map((item) => ({
      id: item.id,
      clientNom: item.clientName,
      projetTitre: item.projectName,
      montant: item.amount,
      statut: item.status,
      date: new Date(item.date).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
      }),
      delaiJours: item.delaiJours,
      estUrgent: item.estUrgent,
      variationMontant: item.variationMontant,
      categorie: item.categorie,
      quoteCount: item.quoteCount,
    })),
    // PORTEFEUILLE : Focus sur la santé financière et la dominance
    portefeuilleStrategique: rawData.topClients.map((client) => ({
      id: client.id,
      nom: client.name,
      valeurCumulee: client.totalSpent,
      nombreDevis: client.quoteCount,
      scoreSante: client.healthScore,
      delaiMoyen: client.averagePaymentDays,
    })),
    sparkline,
  };

  return <DashboardView firstName={firstName} data={mappedData} />;
}
