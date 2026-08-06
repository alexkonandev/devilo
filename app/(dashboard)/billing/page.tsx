import { redirect } from "next/navigation";
import { getAuthOrDemoUser, isDemoMode } from "@/lib/auth";
import { getBillingProfile } from "@/actions/billing-action";
import { SpatialBillingView } from "@/features/billing/spatial-billing-view";

export const metadata = {
  title: "Billing | Kernel System",
  description: "Gestion de votre abonnement et facturation.",
};

export default async function BillingPage() {
  const userId = await getAuthOrDemoUser();
  if (!userId) redirect("/sign-in");

  const demoMode = await isDemoMode();

  const billingProfile = await getBillingProfile();

  // Sécurité : si le profil n'a pas pu être chargé, on redirige vers le dashboard
  if (!billingProfile) {
    redirect("/home");
  }

  return (
    <div className="h-full w-full">
      <SpatialBillingView billingProfile={billingProfile} isDemoMode={demoMode} />
    </div>
  );
}
