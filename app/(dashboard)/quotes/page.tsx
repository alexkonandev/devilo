import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getQuotesAction } from "@/actions/quote-registry-action";
import { QuoteProvider } from "@/features/quotes/components/quote-context";
import { SpatialQuotesView } from "@/features/quotes/spatial-quotes-view";

export default async function QuotesPage() {
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
