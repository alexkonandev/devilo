// @/app/dashboard/settings/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import db from "@/lib/prisma";
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
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

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
        paymentZone: true,
        bankName: true,
        bankIBAN: true,
        bankSWIFT: true,
        bankBIC: true,
        bankRoutingNumber: true,
        bankAccountNumber: true,
        showBankDetailsOnQuotes: true,
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
    paymentZone: (userSettings?.paymentZone ?? "AFRI") as
      | "USA"
      | "EUR"
      | "AFRI",
    bankName: userSettings?.bankName ?? null,
    bankIBAN: userSettings?.bankIBAN ?? null,
    bankSWIFT: userSettings?.bankSWIFT ?? null,
    bankBIC: userSettings?.bankBIC ?? null,
    bankRoutingNumber: userSettings?.bankRoutingNumber ?? null,
    bankAccountNumber: userSettings?.bankAccountNumber ?? null,
    showBankDetailsOnQuotes: userSettings?.showBankDetailsOnQuotes ?? false,
  };

  return (
    <div className="h-full w-full">
      <SpatialSettingsView
        initialData={initialData as SettingsFormValues}
        securityProfile={securityProfile}
      />
    </div>
  );
}
