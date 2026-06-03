import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import db from "@/lib/prisma";
import { getAdvancedDashboardData } from "@/actions/dashboard-actions"; // Note: sans 's' selon tes règles
import { DashboardView } from "@/features/dashboard/dashboard-view";

export const metadata = {
  title: "Console de Performance | DevisExpress",
};

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // 1. EXTRACTION DE L'INTELLIGENCE MÉTIER
  const rawData = await getAdvancedDashboardData();

  if (!rawData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Aucune donnée disponible pour le moment.</p>
      </div>
    );
  }

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
  };

  return <DashboardView data={mappedData} />;
}
