import { redirect } from "next/navigation";
import { getClerkUserId } from "@/lib/auth";
import db from "@/lib/prisma";

// ✅ Import corrigé : Utilisation de la nouvelle action unifiée
import { getInventoryAction } from "@/actions/catalog-action";
import { getAvailableThemes } from "@/actions/design-action";
import { getClients } from "@/actions/client-action";
import CreateQuoteClient from "@/components/editor/CreateQuoteClient";

import { EditorUserSettings, EditorTheme, EditorClient } from "@/types/editor";

interface PageProps {
  searchParams: Promise<{ themeId?: string }>;
}

/**
 * PAGE : CRÉATION DE DEVIS (SERVER COMPONENT)
 * Architecture Studio : Zéro scroll global, récupération parallèle.
 */
export default async function EditorPage({ searchParams }: PageProps) {
  const userId = await getClerkUserId();
  if (!userId) redirect("/sign-in");

  const { themeId } = await searchParams;

  // 🚀 EXÉCUTION PARALLÈLE : On maximise le débit de données
  const [inventory, themes, clients, user] = await Promise.all([
    getInventoryAction(),
    getAvailableThemes(),
    getClients(),
    db.user.findUnique({ where: { id: userId } }),
  ]);

  if (!user) redirect("/settings");

  // On extrait uniquement les services personnels (PERSONAL) pour l'éditeur de devis
  const catalog = inventory.userServices;

  const preSelectedTheme = themeId
    ? (themes as EditorTheme[]).find((t) => t.id === themeId) ||
      themes[0] ||
      null
    : (themes as EditorTheme[])[0] || null;

  const userSettings: EditorUserSettings = {
    companyName: user.companyName ?? "",
    companyEmail: user.companyEmail ?? "",
    companyPhone: user.companyPhone ?? "",
    companyAddress: user.companyAddress ?? "",
    companySiret: user.companySiret ?? "",
    companyWebsite: user.companyWebsite ?? "",
    quotePrefix: user.quotePrefix ?? "DEV-",
    nextQuoteNumber: user.nextQuoteNumber ?? 1,
    defaultVatRate: user.defaultVatRate ?? 20.0,
    defaultTerms: user.defaultTerms ?? "",
  };

  return (
    <div className="h-[calc(100vh-2.5rem)] w-full overflow-hidden bg-white">
      <CreateQuoteClient
        initialCatalog={catalog || []}
        initialThemes={(themes as EditorTheme[]) || []}
        initialClients={(clients as EditorClient[]) || []}
        userSettings={userSettings}
        preSelectedTheme={preSelectedTheme}
      />
    </div>
  );
}
