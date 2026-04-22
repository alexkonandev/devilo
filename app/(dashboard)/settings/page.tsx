// @/app/dashboard/settings/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import db from "@/lib/prisma";
import { SpatialSettingsView } from "@/features/settings/spatial-settings-view";

export const metadata = {
  title: "Settings | Kernel System",
  description:
    "Optimisation du moteur de facturation et configuration de l'identité légale.",
};

export default async function SettingsPage() {
  // 1. Authentification & Sécurité (Priorité Mission)
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // 2. Data Fetching (Server Side)
  // On récupère la structure exacte de ton nouveau modèle User
  const userSettings = await db.user.findUnique({
    where: { id: userId },
    select: {
      companyName: true,
      companyLogo: true,
      taxId: true,
      taxIdLabel: true,
      companyEmail: true,
      companyPhone: true,
      companyCity: true,
      companyDistrict: true,
      companyArea: true,
      companyAddressDetails: true,
      companyWebsite: true,
      currency: true,
      defaultVatRate: true,
      quotePrefix: true,
      nextQuoteNumber: true,
      defaultTerms: true,
      // Champs bancaires
      bankName: true,
      bankIBAN: true,
      bankSWIFT: true,
      bankBIC: true,
    },
  });

  // 3. Initialisation des Fallbacks (Zéro 'any', typage implicite fort)
  // Alignement sur le marché UEMOA par défaut pour maximiser la pertinence locale
  const initialData = {
    companyName: userSettings?.companyName ?? "",
    companyLogo: userSettings?.companyLogo ?? "",
    taxId: userSettings?.taxId ?? "",
    taxIdLabel: userSettings?.taxIdLabel ?? "NCC", // Plus pro pour la CI que SIRET
    companyEmail: userSettings?.companyEmail ?? "",
    companyPhone: userSettings?.companyPhone ?? "",
    companyCity: userSettings?.companyCity ?? "ABIDJAN",
    companyDistrict: userSettings?.companyDistrict ?? "",
    companyArea: userSettings?.companyArea ?? "",
    companyAddressDetails: userSettings?.companyAddressDetails ?? "",
    companyWebsite: userSettings?.companyWebsite ?? "",
    currency: userSettings?.currency ?? "XOF",
    defaultVatRate: userSettings?.defaultVatRate ?? 18.0,
    quotePrefix: userSettings?.quotePrefix ?? "QT-", // Standard devis
    nextQuoteNumber: userSettings?.nextQuoteNumber ?? 1,
    defaultTerms: userSettings?.defaultTerms ?? "",
    // Champs bancaires
    bankName: userSettings?.bankName ?? null,
    bankIBAN: userSettings?.bankIBAN ?? null,
    bankSWIFT: userSettings?.bankSWIFT ?? null,
    bankBIC: userSettings?.bankBIC ?? null,
  };

  return (
    <div className="w-full">
      <SpatialSettingsView initialData={initialData} />
    </div>
  );
}
