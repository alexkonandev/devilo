import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import { DS_PAGE_SHELL, DS_PAGE_CONTAINER, DS_PAGE_PADDING, DS_BENTO_CARD } from "@/lib/design-system";
import { getQuotesAction } from "@/actions/quote-registry-action";
import { QuoteProvider } from "@/features/quotes/components/quote-context";
import { SpatialQuotesView } from "@/features/quotes/spatial-quotes-view";

async function QuotesDataWrapper() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const response = await getQuotesAction();
  const initialQuotes = response.success ? response.data || [] : [];

  return (
    <QuoteProvider initialQuotes={initialQuotes}>
      <SpatialQuotesView />
    </QuoteProvider>
  );
}

export default async function QuotesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <Suspense fallback={
      <div className={cn(DS_PAGE_SHELL, "flex items-center justify-center min-h-screen")}>
        <div className={cn(DS_PAGE_CONTAINER, DS_PAGE_PADDING, "max-w-md")}>
          <div className={cn(DS_BENTO_CARD, "p-8 text-center")}>
            <div className="w-5 h-5 mx-auto mb-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] font-mono text-slate-400">Chargement...</p>
          </div>
        </div>
      </div>
    }>
      <QuotesDataWrapper />
    </Suspense>
  );
}
