// @/app/dashboard/quotes/create/page.tsx
import { redirect } from "next/navigation";
import { getClerkUserId, getCurrentUser, isDemoMode } from "@/lib/auth";
import db from "@/lib/prisma";
import { getSuggestionsAction } from "@/actions/suggestion-action";
import { getAvailableThemes } from "@/actions/design-action";
import { getEditorClientsAction } from "@/actions/client-editor-action";
import { getBillingProfile } from "@/actions/billing-action";
import CreateQuoteClient from "@/components/editor/CreateQuoteClient";

// Type explicite pour Next.js App Router
interface PageProps {
  searchParams: Promise<{ themeId?: string }>;
}

export default async function EditorPage({ searchParams }: PageProps) {
  const userId = await getClerkUserId();
  if (!userId) redirect("/sign-in");

  // Await des params (Next.js 15)
  const { themeId } = await searchParams;

  // ─── REDIRECTION VERS LE DERNIER BROUILLON ───
  // Évite le flash de quotes/new en redirigeant immédiatement
  // vers le dernier devis DRAFT de l'utilisateur s'il existe.
  const lastDraftQuote = await db.quote.findFirst({
    where: { userId, status: "DRAFT" },
    orderBy: { updatedAt: "desc" },
    select: { id: true },
  });

  if (lastDraftQuote) {
    if (await isDemoMode()) {
      redirect(`/demo/quotes/${lastDraftQuote.id}`);
    }
    redirect(`/quotes/${lastDraftQuote.id}`);
  }

  // Récupération parallèle : Efficacité maximale (Profit-oriented)
  const [suggestions, themes, clients, billing] = await Promise.all([
    getSuggestionsAction(),
    getAvailableThemes(),
    getEditorClientsAction(),
    getBillingProfile(),
  ]);

  let user = await db.user.findUnique({ where: { id: userId } });

  if (!user) {
    // Création automatique du profil utilisateur s'il n'existe pas en BDD
    let email = "demo@factouro.ci";
    if (!(await isDemoMode())) {
      const clerkUser = await getCurrentUser();
      const clerkEmail = clerkUser?.emailAddresses?.[0]?.emailAddress;
      if (clerkEmail) {
        email = clerkEmail;
      } else {
        redirect("/settings");
      }
    }

    user = await db.user.create({
      data: {
        id: userId,
        email,
      },
    });
  }

  // On trouve le thème sélectionné si nécessaire pour matcher l'interface attendue
  const selectedTheme = themes?.find((t) => t.id === themeId) || null;

  return (
    <CreateQuoteClient
      suggestions={suggestions || []}
      initialThemes={themes || []}
      initialClients={clients || []}
      user={user}
      preSelectedTheme={selectedTheme}
      billing={billing}
    />
  );
}