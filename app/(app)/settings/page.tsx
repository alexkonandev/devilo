// @/app/dashboard/settings/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import db from "@/lib/prisma";
import { SettingsForm } from "@/features/settings/components/settings-form";

export const metadata = {
  title: "Settings | Kernel System",
  description:
    "Configuration du moteur de facturation et de l'identité légale.",
};

export default async function SettingsPage() {
  // 1. Authentification & Sécurité
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // 2. Data Fetching (Server Side)
  // On récupère uniquement ce dont on a besoin pour le formulaire
  const userSettings = await db.user.findUnique({
    where: { id: userId },
    select: {
      companyName: true,
      companyLogo: true,
      taxId: true,
      taxIdLabel: true,
      companyEmail: true,
      companyPhone: true,
      companyAddress: true,
      companyWebsite: true,
      currency: true,
      defaultVatRate: true,
      paymentDetails: true,
      quotePrefix: true,
      nextQuoteNumber: true,
      defaultTerms: true,
    },
  });

  // 3. Initialisation des Fallbacks
  // Si Prisma renvoie null pour certains champs, on assure une valeur par défaut pour React Hook Form
  const initialData = {
    companyName: userSettings?.companyName ?? "",
    companyLogo: userSettings?.companyLogo ?? "",
    taxId: userSettings?.taxId ?? "",
    taxIdLabel: userSettings?.taxIdLabel ?? "SIRET",
    companyEmail: userSettings?.companyEmail ?? "",
    companyPhone: userSettings?.companyPhone ?? "",
    companyAddress: userSettings?.companyAddress ?? "",
    companyWebsite: userSettings?.companyWebsite ?? "",
    currency: userSettings?.currency ?? "EUR",
    defaultVatRate: userSettings?.defaultVatRate ?? 20,
    paymentDetails: userSettings?.paymentDetails ?? "",
    quotePrefix: userSettings?.quotePrefix ?? "INV-",
    nextQuoteNumber: userSettings?.nextQuoteNumber ?? 1,
    defaultTerms: userSettings?.defaultTerms ?? "",
  };

  return (
    <div className="h-full w-full bg-white">
      {/* On passe les données au Client Component (SettingsForm) 
        qui va gérer l'interactivité et l'upload.
      */}
      <SettingsForm initialData={initialData} />
    </div>
  );
}
