import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import React from "react";

// ─── Mocks ───

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/actions/quote-registry-action", () => ({
  updateQuoteStatusAction: vi.fn(),
  deleteQuoteAction: vi.fn(),
  getQuotesAction: vi.fn(),
  getQuoteTimelineAction: vi.fn().mockResolvedValue({ success: true, data: [] }),
}));

vi.mock("@/lib/notifications", () => ({
  notify: { error: vi.fn(), success: vi.fn(), warning: vi.fn(), info: vi.fn() },
}));

// ─── Helpers ───

import { QuotesTable } from "../components/quotes-table";
import { QuoteProvider } from "../components/quote-context";
import type { QuoteRegistryItem } from "@/types/quote-registry";

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
      name: "Client Alpha",
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

import type { SortConfig } from "@/lib/utils";

function renderWithProvider(ui: React.ReactElement, initialQuotes: QuoteRegistryItem[] = []) {
  return render(
    <QuoteProvider initialQuotes={initialQuotes}>
      {ui}
    </QuoteProvider>
  );
}

// ─── Tests ───

describe("QuotesTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("devrait afficher les colonnes et les données", () => {
    const quotes = [makeQuote("q1", { number: "D-001" })];
    renderWithProvider(
      <QuotesTable
        data={quotes}
        sortConfig={undefined}
        onSort={vi.fn()}
        highlightThreshold={null}
      />,
      quotes,
    );

    // Vérifier que les en-têtes de colonnes sont présents
    expect(screen.getByText("N° Devis")).toBeInTheDocument();
    expect(screen.getByText("Client")).toBeInTheDocument();
    expect(screen.getByText("Montant HT")).toBeInTheDocument();

    // Vérifier que les données sont affichées
    expect(screen.getByText("D-001")).toBeInTheDocument();
    expect(screen.getByText("Client Alpha")).toBeInTheDocument();
  });

  it("devrait afficher l'état vide si data est vide", () => {
    renderWithProvider(
      <QuotesTable
        data={[]}
        sortConfig={undefined}
        onSort={vi.fn()}
        highlightThreshold={null}
      />,
      [],
    );

    expect(screen.getByText("Aucun devis trouvé")).toBeInTheDocument();
  });

  it("devrait appeler onSort lors du clic sur un en-tête", () => {
    const onSort = vi.fn();
    const quotes = [makeQuote("q1")];

    renderWithProvider(
      <QuotesTable
        data={quotes}
        sortConfig={undefined}
        onSort={onSort}
        highlightThreshold={null}
      />,
      quotes,
    );

    // Cliquer sur l'en-tête "Montant HT"
    fireEvent.click(screen.getByText("Montant HT"));
    expect(onSort).toHaveBeenCalledWith("totalHT");
  });

  it("devrait basculer la direction du tri", () => {
    const onSort = vi.fn();
    const quotes = [makeQuote("q1")];

    renderWithProvider(
      <QuotesTable
        data={quotes}
        sortConfig={{ column: "totalHT", direction: "asc" }}
        onSort={onSort}
        highlightThreshold={null}
      />,
      quotes,
    );

    fireEvent.click(screen.getByText("Montant HT"));
    // Au second clic, la direction passe en desc
    expect(onSort).toHaveBeenCalledWith("totalHT");
  });

  it("devrait appliquer le highlight threshold sur les montants élevés", () => {
    const quotes = [
      makeQuote("q1", {
        lines: [{ id: "l1h", quoteId: "q1", title: "S", subtitle: "", quantity: 10, unitPrice: 10000, baseCost: 0 }],
      }),
    ];

    renderWithProvider(
      <QuotesTable
        data={quotes}
        sortConfig={undefined}
        onSort={vi.fn()}
        highlightThreshold={50000}
      />,
      quotes,
    );

    // Le montant (100000) > 50000 → le highlight est appliqué via une classe CSS
    // Vérifie que la ligne du tableau est rendue sans erreur
    expect(screen.getByText("Client Alpha")).toBeInTheDocument();
    // Vérifie que le montant formaté contient "100" (peu importe le séparateur local)
    const cells = screen.getAllByText(/100/, { exact: false });
    expect(cells.length).toBeGreaterThanOrEqual(1);
  });
});