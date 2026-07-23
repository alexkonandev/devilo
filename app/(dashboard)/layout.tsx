import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import db from "@/lib/prisma";
import SoftwareLayoutClient from "./layout-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

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

  return <SoftwareLayoutClient>{children}</SoftwareLayoutClient>;
}