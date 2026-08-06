// @/app/dashboard/settings/page.tsx
import { redirect } from "next/navigation";
import db from "@/lib/prisma";
import { getAuthOrDemoUser, isDemoMode } from "@/lib/auth";
import { SpatialSettingsView } from "@/features/settings/spatial-settings-view";
import { SettingsFormValues } from "@/lib/validations/settings";
import {
  getSecurityProfile,
  type SecurityProfile,
} from "@/actions/security-action";

export const metadata = {
  title: "Settings | Kernel System",
  description:
    "Optimisation du moteur de facturation et configuration de l'identité légale.",
};

export default async function SettingsPage() {
  // 1. Authentification & Sécurité (Priorité Mission)
  const userId = await getAuthOrDemoUser();
  if (!userId) redirect("/sign-in");

  const demoMode = await isDemoMode();

  // 2. Data Fetching parallèle (settings DB + profil sécurité Clerk)
  const [userSettings, securityProfile] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        companyName: true,
        companyLogo: true,
        taxId: true,
        taxIdLabel: true,
        companyEmail: true,
        companyPhone: true,
        companyCity: true,
        companyAddressDetails: true,
        companyWebsite: true,
        currency: true,
        defaultVatRate: true,
        quotePrefix: true,
        nextQuoteNumber: true,
        defaultTerms: true,
      },
    }),
    getSecurityProfile(),
  ]);

  // 3. Initialisation des Fallbacks
  const initialData = {
    companyName: userSettings?.companyName ?? "",
    companyLogo: userSettings?.companyLogo ?? "",
    taxId: userSettings?.taxId ?? "",
    taxIdLabel: userSettings?.taxIdLabel ?? "NCC",
    companyEmail: userSettings?.companyEmail ?? "",
    companyPhone: userSettings?.companyPhone ?? "",
    companyCity: userSettings?.companyCity ?? "ABIDJAN",
    companyAddressDetails: userSettings?.companyAddressDetails ?? "",
    companyWebsite: userSettings?.companyWebsite ?? "",
    currency: userSettings?.currency ?? "XOF",
    defaultVatRate: userSettings?.defaultVatRate ?? 18.0,
    quotePrefix: userSettings?.quotePrefix ?? "QT-",
    nextQuoteNumber: userSettings?.nextQuoteNumber ?? 1,
    defaultTerms: userSettings?.defaultTerms ?? "",
  };

  return (
    <div className="h-full w-full">
      <SpatialSettingsView
        initialData={initialData as SettingsFormValues}
        securityProfile={securityProfile}
        isDemoMode={demoMode}
      />
    </div>
  );
}
