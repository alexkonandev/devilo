// @/app/dashboard/quotes/create/page.tsx
import { redirect } from "next/navigation";
import { getClerkUserId } from "@/lib/auth";
import db from "@/lib/prisma";
import { getInventoryAction } from "@/actions/catalog-action";
import { getAvailableThemes } from "@/actions/design-action";
import { getEditorClientsAction } from "@/actions/client-editor-action";
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

  // Récupération parallèle : Efficacité maximale (Profit-oriented)
  const [inventory, themes, clients, user] = await Promise.all([
    getInventoryAction(),
    getAvailableThemes(),
    getEditorClientsAction(),
    db.user.findUnique({ where: { id: userId } }),
  ]);

  if (!user) redirect("/dashboard/settings");

  // On trouve le thème sélectionné si nécessaire pour matcher l'interface attendue
  const selectedTheme = themes?.find((t) => t.id === themeId) || null;

  return (
    <div className="h-[calc(100vh-2.5rem)] w-full overflow-hidden">
      <CreateQuoteClient
        initialCatalog={inventory.userServices || []}
        platformCatalog={inventory.platformServices || []}
        initialThemes={themes || []}
        initialClients={clients || []}
        user={user}
        preSelectedTheme={selectedTheme}
      />
    </div>
  );
}
