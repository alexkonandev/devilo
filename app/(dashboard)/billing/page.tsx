"use client";

import { SpatialBillingView } from "@/features/billing/spatial-billing-view";

interface BillingPageProps {
  estPro?: boolean;
  quotaUtilise?: number;
}

export default function BillingPage({
  estPro = false,
  quotaUtilise = 3, // Mock value for demonstration
}: BillingPageProps) {
  return (
    <div className="w-full pt-10">
      <SpatialBillingView estPro={estPro} quotaUtilise={quotaUtilise} />
    </div>
  );
}
