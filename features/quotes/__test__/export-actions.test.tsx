import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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

import { ExportActions } from "../components/export-actions";
import { QuoteProvider } from "../components/quote-context";
import type { QuoteRegistryItem } from "@/types/quote-registry";

function makeQuote(id: string): QuoteRegistryItem {
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
    paymentZone: null,
    bankName: null,
    bankIBAN: null,
    bankSWIFT: null,
    bankBIC: null,
    bankRoutingNumber: null,
    bankAccountNumber: null,
    showBankDetails: false,
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
      tags: [],
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-01"),
    },
    lines: [
      { id: `${id}-l1`, quoteId: id, title: "Service", subtitle: "", quantity: 2, unitPrice: 5000, baseCost: 0 },
    ],
  };
}

// Mock createObjectURL / revokeObjectURL
beforeEach(() => {
  vi.clearAllMocks();
  global.URL.createObjectURL = vi.fn(() => "blob:test");
  global.URL.revokeObjectURL = vi.fn();
});

// ─── Tests ───

describe("ExportActions", () => {
  it("devrait afficher les boutons CSV et PDF", () => {
    const data = [makeQuote("q1")];
    render(
      <QuoteProvider initialQuotes={data}>
        <ExportActions data={data} selectedIds={new Set()} />
      </QuoteProvider>
    );

    expect(screen.getByText("CSV")).toBeInTheDocument();
    expect(screen.getByText("PDF")).toBeInTheDocument();
  });

  it("devrait afficher le compteur de sélection quand selectedIds n'est pas vide", () => {
    const data = [makeQuote("q1"), makeQuote("q2")];
    const selected = new Set(["q1", "q2"]);

    render(
      <QuoteProvider initialQuotes={data}>
        <ExportActions data={data} selectedIds={selected} />
      </QuoteProvider>
    );

    expect(screen.getByText("2 sélectionnés")).toBeInTheDocument();
  });

  it("devrait afficher le singulier quand 1 seul sélectionné", () => {
    const data = [makeQuote("q1")];
    const selected = new Set(["q1"]);

    render(
      <QuoteProvider initialQuotes={data}>
        <ExportActions data={data} selectedIds={selected} />
      </QuoteProvider>
    );

    expect(screen.getByText("1 sélectionné")).toBeInTheDocument();
  });

  it("ne devrait pas afficher le compteur si selectedIds est vide", () => {
    const data = [makeQuote("q1")];

    render(
      <QuoteProvider initialQuotes={data}>
        <ExportActions data={data} selectedIds={new Set()} />
      </QuoteProvider>
    );

    expect(screen.queryByText(/sélectionné/)).not.toBeInTheDocument();
  });
});