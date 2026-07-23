import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import db from "@/lib/prisma";

export const metadata = {
  title: "Bienvenue | DevisExpress",
};

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Vérifier si l'utilisateur a déjà un profil
  const dbUser = await db.user.findUnique({
    where: { id: userId },
    select: {
      companyName: true,
      companyEmail: true,
      companyPhone: true,
      taxId: true,
      companyAddressDetails: true,
      companyCity: true,
      _count: { select: { quotes: true, clients: true } },
    },
  });

  const isProfileComplete = Boolean(
    dbUser?.companyName &&
      dbUser?.companyEmail &&
      dbUser?.companyPhone &&
      dbUser?.taxId &&
      dbUser?.companyAddressDetails &&
      dbUser?.companyCity
  );

  // Si profil complet + déjà actif → page d'accueil
  if (isProfileComplete && (dbUser?._count.quotes ?? 0) > 0) {
    redirect("/home");
  }

  // Sinon, rediriger vers settings pour compléter le profil
  redirect("/settings");
}