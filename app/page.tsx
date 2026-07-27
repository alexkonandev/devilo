import { getClerkUserId } from "@/lib/auth";
import db from "@/lib/prisma";
import LandingPageView from "@/components/landing-page-view";

export default async function Home() {
  const userId = await getClerkUserId();

  // Vérifier si l'utilisateur connecté a déjà créé au moins un devis
  let hasQuote = false;
  if (userId) {
    const count = await db.quote.count({
      where: { userId },
    });
    hasQuote = count > 0;
  }

  return <LandingPageView userId={userId} hasQuote={hasQuote} />;
}