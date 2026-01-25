import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getInventoryAction } from "@/actions/catalog-action";
import { CatalogProvider } from "@/features/catalog/components/catalog-context";
import { CatalogLayout } from "@/features/catalog/components/catalog-layout";
import { CatalogToolbar } from "@/features/catalog/components/catalog-toolbar";
import { UserInventory } from "@/features/catalog/components/user-inventory";
import { PlatformInventory } from "@/features/catalog/components/platform-inventory";
import { ServiceListSkeleton } from "@/features/catalog/components/service-card-skeleton";

export const metadata = {
  title: "Inventory | Catalog Operating System",
};

/**
 * COMPOSANT INTERNE : DATA LOADER
 * Isolé pour permettre le streaming via Suspense
 */
async function CatalogDataWrapper() {
  const { userServices, platformServices } = await getInventoryAction();

  return (
    <CatalogProvider
      initialUserServices={userServices}
      initialPlatformServices={platformServices}
    >
      <CatalogLayout
        toolbar={<CatalogToolbar />}
        userInventory={<UserInventory />}
        platformInventory={<PlatformInventory />}
      />
    </CatalogProvider>
  );
}

/**
 * PAGE : CATALOGUE GLOBAL
 * Utilise Suspense pour un affichage instantané du shell de l'application
 */
export default async function CatalogPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <main className="h-full w-full">
      <Suspense fallback={<CatalogLoadingState />}>
        <CatalogDataWrapper />
      </Suspense>
    </main>
  );
}

/**
 * FALLBACK : État de chargement miroir du layout réel
 * Évite tout Layout Shift lors de l'hydratation
 */
function CatalogLoadingState() {
  return (
    <div className="flex flex-col h-[calc(100vh-2.5rem)] w-full opacity-50 grayscale">
      <div className="h-14 border-b border-slate-200 bg-white" />
      <div className="flex-1 flex divide-x-2 divide-slate-100">
        <div className="flex-[1.5] p-4 space-y-4">
          <ServiceListSkeleton count={4} />
        </div>
        <div className="flex-1 p-4 space-y-4 bg-slate-50">
          <ServiceListSkeleton count={6} />
        </div>
      </div>
    </div>
  );
}
