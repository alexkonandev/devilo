import { describe, it, expect, vi, beforeEach } from "vitest";
import { upsertQuoteAction } from "../quote-editor-action";
import db from "@/lib/prisma";
import { getClerkUserId } from "@/lib/auth";
import { QuoteStatus } from "@/app/generated/prisma/client";
import { ActiveQuote } from "@/types/quote-editor";

describe("Quote Actions - Business Logic Validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockActiveQuote = (overrides = {}): ActiveQuote => ({
    // Ces deux champs manquaient au premier niveau de l'objet
    title: "Projet Refonte Web",
    company: {
      name: "Ma Super Entreprise",
      address: "Mon Adresse, Abidjan",
      email: "contact@entreprise.com",
      siret: "987654321000",
      website: "https://mon-entreprise.com", // Ajout du champ manquant
    },
    quote: {
      number: "INV-2026-001",
      issueDate: new Date().toISOString().split("T")[0],
      status: QuoteStatus.DRAFT,
      terms: "Paiement à réception",
    },
    client: {
      name: "Client Test",
      email: "test@client.com",
      address: "123 Rue de la Paix",
      siret: "123456789",
    },
    items: [
      {
        title: "Prestation Service",
        subtitle: "Détails",
        quantity: 1,
        unitPriceEuros: 1000,
      },
    ],
    financials: {
      vatRatePercent: 20,
      discountAmountEuros: 0,
    },
    ...overrides,
  });

  it("devrait rejeter la création si l’utilisateur n’est pas authentifié", async () => {
    (getClerkUserId as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      null
    );

    const input = createMockActiveQuote();

    // Correction : on passe l'input ET l'id (null pour une création)
    const result = await upsertQuoteAction(input, null);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Non autorisé");
  });

  it("devrait appeler db.quote.create lors d'une nouvelle sauvegarde", async () => {
    (getClerkUserId as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      "user_nomad_123"
    );

    // Mock du client existant pour simplifier le test
    (
      db.client.findFirst as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      id: "client_abc_123",
    });
    const input = createMockActiveQuote();

    await upsertQuoteAction(input, null);

    expect(db.quote.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          number: "INV-2026-001",
          clientId: "client_abc_123",
        }),
      })
    );
  });
});
