import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import db from "@/lib/prisma";
import { HomeView } from "@/features/home/home-view";

export const metadata = {
  title: "Accueil | DevisExpress",
};

export default async function HomePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const firstName = user?.firstName ?? "";

  // Stats légères
  const [quotesCount, clientsCount] = await Promise.all([
    db.quote.count({ where: { userId } }),
    db.client.count({ where: { userId } }),
  ]);

  // Derniers devis
  const recentQuotesRaw = await db.quote.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      number: true,
      status: true,
      createdAt: true,
      client: { select: { name: true } },
    },
  });

  const recentQuotes = recentQuotesRaw.map((q) => ({
    id: q.id,
    projetTitre: q.title,
    montant: 0,
    statut: q.status,
    clientNom: q.client?.name ?? "Client inconnu",
    date: q.createdAt.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
    }),
  }));

  const pendingQuotes = await db.quote.count({
    where: { userId, status: "SENT" },
  });

  return (
    <HomeView
      firstName={firstName}
      recentQuotes={recentQuotes}
      stats={{
        totalQuotes: quotesCount,
        totalClients: clientsCount,
        pendingQuotes,
      }}
    />
  );
}