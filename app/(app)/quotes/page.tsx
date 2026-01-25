import { Suspense } from "react"; // 1. Import de Suspense
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getQuotesAction } from "@/actions/quote-registry-action";
import { QuoteProvider } from "@/features/quotes/components/quote-context";
import { QuotesLayout } from "@/features/quotes/components/quotes-layout";

// Importation des composants
import { QuotesStatusNav } from "@/features/quotes/components/quotes-status-nav";
import { QuoteList } from "@/features/quotes/components/quote-list";
import { QuotesStatsGrid } from "@/features/quotes/components/quotes-stats-grid";
import { QuoteSkeleton } from "@/features/quotes/components/quote-skeleton"; // 2. Import du Skeleton

export default async function QuotesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const response = await getQuotesAction();
  const initialQuotes = response.success ? response.data || [] : [];

  return (
    <QuoteProvider initialQuotes={initialQuotes}>
      <QuotesLayout
        /* G : PIPELINE_NAVIGATION */
        filters={<QuotesStatusNav />}
        /* C : MASTER_LEDGER */
        mainList={
          // 3. On enveloppe la liste dans Suspense avec le skeleton en fallback
          <Suspense fallback={<QuoteSkeleton />}>
            <QuoteList />
          </Suspense>
        }
        /* D : FINANCIAL_INTELLIGENCE */
        kpiPanel={<QuotesStatsGrid />}
      />
    </QuoteProvider>
  );
}
