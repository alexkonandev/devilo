import { redirect } from "next/navigation";
import db from "@/lib/prisma";
import { getAuthOrDemoUser, isDemoMode } from "@/lib/auth";
import SoftwareLayoutClient from "./layout-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getAuthOrDemoUser();
  if (!userId) redirect("/sign-in");

  const demoMode = await isDemoMode();

  // Vérification : nouvel utilisateur sans aucun devis ni client
  // => rediriger vers la page d'onboarding (layout minimal sans dock)
  const userStats = await db.user.findUnique({
    where: { id: userId },
    select: {
      _count: { select: { quotes: true, clients: true } },
    },
  });

  const isNewUser =
    userStats &&
    userStats._count.quotes === 0 &&
    userStats._count.clients === 0;

  if (isNewUser) {
    redirect("/onboarding");
  }

  return <SoftwareLayoutClient isDemoMode={demoMode}>{children}</SoftwareLayoutClient>;
}