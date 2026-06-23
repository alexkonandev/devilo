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
    title: "Projet Refonte Web",
    company: {
      name: "Ma Super Entreprise",
      address: "Mon Adresse, Abidjan",
      email: "contact@entreprise.com",
      taxId: "987654321000",
      taxIdLabel: "NCC",
      website: "https://mon-entreprise.com",
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
      taxId: "123456789",
    },
    items: [
      {
        title: "Prestation Service",
        subtitle: "Détails",
        quantity: 1,
        unitPrice: 1000,
      },
    ],
    financials: {
      vatRatePercent: 20,
      discountAmount: 0,
    },
    currency: "XOF",
    validityDays: 30,
    ...overrides,
  });

  it("devrait rejeter la création si l’utilisateur n’est pas authentifié", async () => {
    (getClerkUserId as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      null
    );

    const input = createMockActiveQuote();

    const result = await upsertQuoteAction(input, null);

    expect(result.success).toBe(false);
    expect(result.error).toBe("Non autorisé");
  });

  it("devrait appeler db.$transaction lors d'une nouvelle sauvegarde", async () => {
    (getClerkUserId as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      "user_nomad_123"
    );

    (
      db.client.findFirst as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      id: "client_abc_123",
    });

    (
      db.user.findUnique as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      quotePrefix: "INV-",
      nextQuoteNumber: 1,
    });

    (db.quote.findUniqueOrThrow as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "quote_1",
      number: "INV-001",
    });

    const input = createMockActiveQuote();

    await upsertQuoteAction(input, null);

    expect(db.$transaction).toHaveBeenCalledTimes(1);
    expect(db.quote.findUniqueOrThrow).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          number: expect.any(String),
        }),
      })
    );
  });

  it("devrait rejeter la création si le titre est vide (validation Zod)", async () => {
    (getClerkUserId as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      "user_nomad_123"
    );

    const input = createMockActiveQuote({ title: "" });
    const result = await upsertQuoteAction(input, null);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Le titre est requis");
  });

  it("devrait rejeter la création si la date d'émission est invalide", async () => {
    (getClerkUserId as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      "user_nomad_123"
    );

    const input = createMockActiveQuote({
      quote: { number: "INV-2026-001", issueDate: "", status: QuoteStatus.DRAFT, terms: "" },
    });
    const result = await upsertQuoteAction(input, null);

    expect(result.success).toBe(false);
    expect(result.error).toContain("La date d'émission est requise");
  });

  it("devrait rejeter si aucun client trouvé et pas de nom client", async () => {
    (getClerkUserId as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      "user_nomad_123"
    );
    (db.client.findFirst as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const input = createMockActiveQuote({ client: { name: "", email: "", address: "", taxId: "" } });
    const result = await upsertQuoteAction(input, null);

    // La validation Zod bloque avant le check métier : nom vide → "Le nom du client est requis"
    expect(result.success).toBe(false);
    expect(result.error).toContain("Le nom du client est requis");
  });

  it("devrait rejeter si items est vide (validation Zod items.min)", async () => {
    (getClerkUserId as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      "user_nomad_123"
    );

    const input = createMockActiveQuote({ items: [] });
    const result = await upsertQuoteAction(input, null);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Au moins une ligne de devis est requise");
  });

  it("devrait faire un update si un id existingQuote est fourni", async () => {
    (getClerkUserId as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      "user_nomad_123"
    );

    // Mock client existant
    (
      db.client.findFirst as unknown as ReturnType<typeof vi.fn>
    ).mockResolvedValue({
      id: "client_abc_123",
    });

    // Mock findUnique pour retourner un existingQuote
    (db.quote.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "quote_existing_1",
    });

    // Mock update
    (db.quote.update as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "quote_existing_1",
      number: "INV-001",
    });

    const input = createMockActiveQuote();
    const result = await upsertQuoteAction(input, "quote_existing_1");

    // Mode update : pas de $transaction, appel à db.quote.update
    expect(result.success).toBe(true);
    expect(db.quote.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: "quote_existing_1",
          userId: "user_nomad_123",
        }),
      })
    );
  });
});
