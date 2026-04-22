import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import db from "@/lib/prisma";
import { getAdvancedDashboardData } from "@/actions/dashboard-actions"; // Note: sans 's' selon tes règles
import { DashboardView } from "@/features/dashboard/dashboard-view";
import { Profession, BusinessModel } from "@/types/dashboard";

export const metadata = {
  title: "Console de Performance | DevisExpress",
};

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // 1. RÉCUPÉRATION DU PROFIL (Strictement nécessaire pour l'UI personnalisée)
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      profession: true,
      businessModel: true,
      isOnboarded: true,
    },
  });

  if (!user?.isOnboarded) {
    redirect("/onboarding");
  }

  // 2. EXTRACTION DE L'INTELLIGENCE MÉTIER
  const rawData = await getAdvancedDashboardData();

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
      projetTitre: item.projectName, // NOUVEAU : On passe le titre du projet
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
      scoreSante: client.healthScore, // NOUVEAU : EXCELLENT, GOOD, SLOW
      delaiMoyen: client.averagePaymentDays, // NOUVEAU : Nombre de jours
    })),
  };

  return (
    <DashboardView
      data={mappedData}
      profile={{
        profession: user.profession as unknown as Profession | null,
        businessModel: user.businessModel as unknown as BusinessModel | null,
      }}
    />
  );
}
