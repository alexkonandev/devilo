// @/app/(editor)/quotes/[id]/page.tsx
import { redirect } from "next/navigation";
import { getClerkUserId } from "@/lib/auth";
import db from "@/lib/prisma";
import { getSuggestionsAction } from "@/actions/suggestion-action";
import { getAvailableThemes } from "@/actions/design-action";
import { getEditorClientsAction } from "@/actions/client-editor-action";
import CreateQuoteClient from "@/components/editor/CreateQuoteClient";
import type { EditorActiveQuote } from "@/types/editor";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditorQuotePage({ params }: PageProps) {
  const userId = await getClerkUserId();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  // Récupération parallèle
  const [suggestions, themes, clients, existingQuote] = await Promise.all([
    getSuggestionsAction(),
    getAvailableThemes(),
    getEditorClientsAction(),
    db.quote.findUnique({
      where: { id, userId },
      include: { lines: true },
    }),
  ]);

  if (!existingQuote) redirect("/quotes/new");

  const user = await db.user.findUnique({ where: { id: userId } });

  if (!user) {
    redirect("/settings");
  }

  // Transformer le devis existant en EditorActiveQuote
  const initialQuoteData: EditorActiveQuote = {
    id: existingQuote.id,
    title: existingQuote.title,
    company: {
      name: existingQuote.companyName ?? "",
      email: existingQuote.companyEmail ?? "",
      address: existingQuote.companyAddress ?? "",
      taxId: existingQuote.companyTaxId ?? "",
      taxIdLabel: existingQuote.companyTaxIdL ?? "NCC",
      website: existingQuote.companyWebsite ?? "",
    },
    client: {
      name: existingQuote.clientName ?? "",
      email: existingQuote.clientEmail ?? "",
      address: existingQuote.clientAddress ?? "",
      taxId: existingQuote.clientTaxId ?? "",
      phone: "",
      notes: "",
    },
    quote: {
      number: existingQuote.number,
      issueDate: existingQuote.issueDate?.toISOString().split("T")[0] ?? "",
      dueDate: existingQuote.dueDate?.toISOString().split("T")[0],
      terms: existingQuote.terms ?? "",
      status: existingQuote.status,
    },
    currency: existingQuote.currency ?? "XOF",
    validityDays: existingQuote.validityDays ?? 30,
    financials: {
      vatRatePercent: existingQuote.vatRatePercent ?? 0,
      discountAmount: existingQuote.discount ?? 0,
    },
    items: existingQuote.lines.map((line) => ({
      title: line.title,
      subtitle: line.subtitle ?? "",
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      baseCost: line.baseCost ?? 0,
    })),
  };

  return (
    <div className="h-screen w-full overflow-hidden">
      <CreateQuoteClient
        suggestions={suggestions || []}
        initialThemes={themes || []}
        initialClients={clients || []}
        user={user}
        existingQuoteId={id}
        initialQuoteData={initialQuoteData}
      />
    </div>
  );
}