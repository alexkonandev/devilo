import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getInventoryAction } from "@/actions/catalog-action";
import { CatalogProvider } from "@/features/catalog/components/catalog-context";
import { SpatialCatalogView } from "@/features/catalog/spatial-catalog-view";

export const metadata = {
  title: "Inventory | Catalog Operating System",
};

/**
 * COMPOSANT INTERNE : DATA LOADER
 * Centralise les données et la logique métier
 */
async function CatalogDataWrapper() {
  const { userServices, platformServices } = await getInventoryAction();

  return (
    <CatalogProvider
      initialUserServices={userServices}
      initialPlatformServices={platformServices}
    >
      <SpatialCatalogView />
    </CatalogProvider>
  );
}

export default async function CatalogPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <main className="h-full w-full">
        <CatalogDataWrapper />

    </main>
  );
}

