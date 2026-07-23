import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, renderHook, act } from "@testing-library/react";
import React from "react";

// ─── Mocks ───

const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/actions/quote-registry-action", () => ({
  updateQuoteStatusAction: vi.fn(),
  deleteQuoteAction: vi.fn(),
  getQuotesAction: vi.fn(),
  getQuoteTimelineAction: vi.fn().mockResolvedValue({ success: true, data: [] }),
}));

vi.mock("@/lib/notifications", () => ({
  notify: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

// ─── Helpers ───

import { QuoteProvider, useQuotes } from "../components/quote-context";
import type { QuoteRegistryItem, QuoteRegistryStats } from "@/types/quote-registry";

function makeQuote(id: string, overrides: Partial<QuoteRegistryItem> = {}): QuoteRegistryItem {
  return {
    id,
    userId: "user_abc",
    clientId: "client_abc",
    title: "Devis test",
    number: `D-${id}`,
    status: "DRAFT" as const,
    issueDate: new Date("2025-01-15"),
    vatRatePercent: 20,
    discount: 0,
    terms: null,
    currency: "XOF" as const,
    dueDate: null,
    validityDays: 30,
    companyName: null,
    companyEmail: null,
    companyAddress: null,
    companyTaxId: null,
    companyTaxIdL: null,
    companyWebsite: null,
    clientName: null,
    clientEmail: null,
    clientAddress: null,
    clientTaxId: null,
    createdAt: new Date("2025-01-15T10:00:00Z"),
    updatedAt: new Date("2025-01-15T10:00:00Z"),
    client: {
      id: "client_abc",
      userId: "user_abc",
      name: "Client A",
      email: "a@test.com",
      phone: null,
      address: "Paris",
      addressLine2: null,
      city: null,
      postalCode: null,
      country: "CI",
      taxId: null,
      tvaNumber: null,
      legalForm: null,
      representativeName: null,
      representativePosition: null,
      notes: null,
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-01"),
    },
    lines: [
      { id: `${id}-l1`, quoteId: id, title: "Service", subtitle: "", quantity: 2, unitPrice: 5000, baseCost: 0 },
    ],
    ...overrides,
  };
}

function renderWithProvider(quotes: QuoteRegistryItem[]) {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QuoteProvider initialQuotes={quotes}>{children}</QuoteProvider>
  );
  return renderHook(() => useQuotes(), { wrapper });
}

// ─── Tests ───

describe("QuoteContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Filtrage par statut ───

  describe("filtrage par statut", () => {
    it("devrait afficher tous les devis par défaut (activeStatus = ALL)", () => {
      const quotes = [
        makeQuote("q1", { status: "DRAFT" }),
        makeQuote("q2", { status: "SENT" }),
        makeQuote("q3", { status: "PAID" }),
      ];
      const { result } = renderWithProvider(quotes);
      expect(result.current.filteredQuotes).toHaveLength(3);
    });

    it("devrait filtrer par DRAFT", () => {
      const quotes = [
        makeQuote("q1", { status: "DRAFT" }),
        makeQuote("q2", { status: "SENT" }),
        makeQuote("q3", { status: "PAID" }),
      ];
      const { result } = renderWithProvider(quotes);
      act(() => result.current.setActiveStatus("DRAFT"));
      expect(result.current.filteredQuotes).toHaveLength(1);
      expect(result.current.filteredQuotes[0].id).toBe("q1");
    });

    it("devrait filtrer par SENT", () => {
      const quotes = [
        makeQuote("q1", { status: "DRAFT" }),
        makeQuote("q2", { status: "SENT" }),
        makeQuote("q3", { status: "PAID" }),
      ];
      const { result } = renderWithProvider(quotes);
      act(() => result.current.setActiveStatus("SENT"));
      expect(result.current.filteredQuotes).toHaveLength(1);
      expect(result.current.filteredQuotes[0].id).toBe("q2");
    });
  });

  // ─── Filtrage par texte ───

  describe("filtrage par texte", () => {
    it("devrait filtrer par numéro de devis", () => {
      const quotes = [
        makeQuote("q1", { number: "D-001" }),
        makeQuote("q2", { number: "D-002" }),
      ];
      const { result } = renderWithProvider(quotes);
      act(() => result.current.setSearchQuery("D-001"));
      expect(result.current.filteredQuotes).toHaveLength(1);
      expect(result.current.filteredQuotes[0].id).toBe("q1");
    });

    it("devrait filtrer par nom de client", () => {
      const quotes = [
        makeQuote("q1", { client: { ...makeQuote("x").client, name: "Client Alpha" } }),
        makeQuote("q2", { client: { ...makeQuote("x").client, name: "Client Beta" } }),
      ];
      const { result } = renderWithProvider(quotes);
      act(() => result.current.setSearchQuery("alpha"));
      expect(result.current.filteredQuotes).toHaveLength(1);
      expect(result.current.filteredQuotes[0].id).toBe("q1");
    });

    it("devrait filtrer par titre de ligne", () => {
      const quotes = [
        makeQuote("q1", { lines: [{ id: "l1b", quoteId: "q1", title: "Design", subtitle: "", quantity: 1, unitPrice: 2000, baseCost: 0 }] }),
        makeQuote("q2", { lines: [{ id: "l2b", quoteId: "q2", title: "Development", subtitle: "", quantity: 1, unitPrice: 5000, baseCost: 0 }] }),
      ];
      const { result } = renderWithProvider(quotes);
      act(() => result.current.setSearchQuery("design"));
      expect(result.current.filteredQuotes).toHaveLength(1);
      expect(result.current.filteredQuotes[0].id).toBe("q1");
    });
  });

  // ─── Smart filtering ───

  describe("smart filtering", () => {
    it("devrait filtrer par >5000", () => {
      const quotes = [
        makeQuote("q1", { lines: [{ id: "l1", quoteId: "q1", title: "S", subtitle: "", quantity: 1, unitPrice: 3000, baseCost: 0 }] }),
        makeQuote("q2", { lines: [{ id: "l2", quoteId: "q2", title: "S", subtitle: "", quantity: 1, unitPrice: 10000, baseCost: 0 }] }),
      ];
      const { result } = renderWithProvider(quotes);
      act(() => result.current.setSearchQuery(">5000"));
      expect(result.current.filteredQuotes).toHaveLength(1);
      expect(result.current.filteredQuotes[0].id).toBe("q2");
    });

    it("devrait filtrer par <10000", () => {
      const quotes = [
        makeQuote("q1", { lines: [{ id: "l1", quoteId: "q1", title: "S", subtitle: "", quantity: 1, unitPrice: 3000, baseCost: 0 }] }),
        makeQuote("q2", { lines: [{ id: "l2", quoteId: "q2", title: "S", subtitle: "", quantity: 1, unitPrice: 15000, baseCost: 0 }] }),
      ];
      const { result } = renderWithProvider(quotes);
      act(() => result.current.setSearchQuery("<10000"));
      expect(result.current.filteredQuotes).toHaveLength(1);
      expect(result.current.filteredQuotes[0].id).toBe("q1");
    });
  });

  // ─── Calcul des stats ───

  describe("calcul des stats", () => {
    it("devrait calculer le pipeline (SENT)", () => {
      const quotes = [
        makeQuote("q1", { status: "SENT", lines: [{ id: "l1", quoteId: "q1", title: "S", subtitle: "", quantity: 3, unitPrice: 5000, baseCost: 0 }] }),
        makeQuote("q2", { status: "SENT", lines: [{ id: "l2", quoteId: "q2", title: "S", subtitle: "", quantity: 2, unitPrice: 2000, baseCost: 0 }] }),
        makeQuote("q3", { status: "DRAFT", lines: [{ id: "l3", quoteId: "q3", title: "S", subtitle: "", quantity: 1, unitPrice: 1000, baseCost: 0 }] }),
      ];
      const { result } = renderWithProvider(quotes);
      expect(result.current.stats.totalPipelineValue).toBe(19000);
    });

    it("devrait calculer l'outstanding (DRAFT + SENT + ACCEPTED)", () => {
      const quotes = [
        makeQuote("q1", { status: "DRAFT", lines: [{ id: "l1", quoteId: "q1", title: "S", subtitle: "", quantity: 1, unitPrice: 5000, baseCost: 0 }] }),
        makeQuote("q2", { status: "SENT", lines: [{ id: "l2", quoteId: "q2", title: "S", subtitle: "", quantity: 1, unitPrice: 10000, baseCost: 0 }] }),
        makeQuote("q3", { status: "PAID", lines: [{ id: "l3", quoteId: "q3", title: "S", subtitle: "", quantity: 1, unitPrice: 3000, baseCost: 0 }] }),
      ];
      const { result } = renderWithProvider(quotes);
      expect(result.current.stats.totalOutstandingValue).toBe(15000);
    });

    it("devrait calculer le collected (PAID)", () => {
      const quotes = [
        makeQuote("q1", { status: "PAID", lines: [{ id: "l1", quoteId: "q1", title: "S", subtitle: "", quantity: 1, unitPrice: 5000, baseCost: 0 }] }),
        makeQuote("q2", { status: "PAID", lines: [{ id: "l2", quoteId: "q2", title: "S", subtitle: "", quantity: 1, unitPrice: 3000, baseCost: 0 }] }),
        makeQuote("q3", { status: "DRAFT", lines: [{ id: "l3", quoteId: "q3", title: "S", subtitle: "", quantity: 1, unitPrice: 2000, baseCost: 0 }] }),
      ];
      const { result } = renderWithProvider(quotes);
      expect(result.current.stats.totalCashCollected).toBe(8000);
    });

    it("devrait exclure CANCELLED du pipeline et outstanding", () => {
      const quotes = [
        makeQuote("q1", { status: "SENT", lines: [{ id: "l1", quoteId: "q1", title: "S", subtitle: "", quantity: 1, unitPrice: 5000, baseCost: 0 }] }),
        makeQuote("q2", { status: "CANCELLED", lines: [{ id: "l2", quoteId: "q2", title: "S", subtitle: "", quantity: 1, unitPrice: 10000, baseCost: 0 }] }),
      ];
      const { result } = renderWithProvider(quotes);
      expect(result.current.stats.totalPipelineValue).toBe(5000);
      expect(result.current.stats.totalOutstandingValue).toBe(5000);
    });

    it("devrait calculer le conversionRate", () => {
      const quotes = [
        makeQuote("q1", { status: "PAID" }),
        makeQuote("q2", { status: "PAID" }),
        makeQuote("q3", { status: "SENT" }),
        makeQuote("q4", { status: "REJECTED" }),
      ];
      const { result } = renderWithProvider(quotes);
      expect(result.current.stats.conversionRate).toBe(50);
    });
  });

  // ─── QuickStatusChange ───

  describe("quickStatusChange", () => {
    it("devrait faire un optimistic update puis rollback si échec", async () => {
      const quotes = [makeQuote("q1", { status: "DRAFT" })];
      const { result } = renderWithProvider(quotes);

      // Mock échec
      const { updateQuoteStatusAction } = await import("@/actions/quote-registry-action");
      (updateQuoteStatusAction as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: false,
        error: "Erreur",
      });

      expect(result.current.quotes[0].status).toBe("DRAFT");

      await act(async () => {
        await result.current.quickStatusChange("q1", "PAID");
      });

      // Rollback : le statut doit revenir à DRAFT
      expect(result.current.quotes[0].status).toBe("DRAFT");
    });
  });

  // ─── Multi-sélection ───

  describe("multi-sélection", () => {
    it("devrait toggler la sélection d'un devis", () => {
      const quotes = [makeQuote("q1"), makeQuote("q2")];
      const { result } = renderWithProvider(quotes);

      act(() => result.current.toggleSelection("q1"));
      expect(result.current.selectedQuoteIds.has("q1")).toBe(true);
      expect(result.current.selectedQuoteIds.has("q2")).toBe(false);

      act(() => result.current.toggleSelection("q1"));
      expect(result.current.selectedQuoteIds.has("q1")).toBe(false);
    });

    it("devrait tout sélectionner", () => {
      const quotes = [makeQuote("q1"), makeQuote("q2"), makeQuote("q3")];
      const { result } = renderWithProvider(quotes);

      act(() => result.current.selectAll());
      expect(result.current.selectedQuoteIds.size).toBe(3);
    });

    it("devrait vider la sélection", () => {
      const quotes = [makeQuote("q1"), makeQuote("q2")];
      const { result } = renderWithProvider(quotes);

      act(() => result.current.selectAll());
      expect(result.current.selectedQuoteIds.size).toBe(2);

      act(() => result.current.clearSelection());
      expect(result.current.selectedQuoteIds.size).toBe(0);
    });
  });

  // ─── Master-Detail ───

  describe("master-detail sélection", () => {
    it("devrait vider le Set lors de selectQuote", () => {
      const quotes = [makeQuote("q1"), makeQuote("q2")];
      const { result } = renderWithProvider(quotes);

      act(() => result.current.toggleSelection("q2"));
      expect(result.current.selectedQuoteIds.has("q2")).toBe(true);

      act(() => result.current.selectQuote("q1"));
      expect(result.current.selectedQuoteIds.size).toBe(0);
      expect(result.current.activeQuoteId).toBe("q1");
    });
  });
});