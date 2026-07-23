import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getBillingProfile } from "@/actions/billing-action";
import { SpatialBillingView } from "@/features/billing/spatial-billing-view";

export const metadata = {
  title: "Billing | Kernel System",
  description: "Gestion de votre abonnement et facturation.",
};

export default async function BillingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const billingProfile = await getBillingProfile();

  // Sécurité : si le profil n'a pas pu être chargé, on redirige vers le dashboard
  if (!billingProfile) {
    redirect("/dashboard");
  }

  return (
    <div className="h-full w-full">
      <SpatialBillingView billingProfile={billingProfile} />
    </div>
  );
}
