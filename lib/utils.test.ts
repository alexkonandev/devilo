import { describe, it, expect } from "vitest";
import {
  computeTotalHT,
  formatPrice,
  formatPriceCompact,
  formatDateShort,
  formatDateLong,
  formatDateTime,
  applySort,
  cn,
} from "./utils";
import type { QuoteRegistryItem } from "@/types/quote-registry";

// ─── Helpers ───────────────────────────────────────────

function makeQuote(overrides: Partial<QuoteRegistryItem> = {}): QuoteRegistryItem {
  return {
    id: "clx123",
    userId: "user_abc",
    clientId: "client_abc",
    title: "Devis test",
    number: "D-001",
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
    createdAt: new Date("2025-01-15T10:30:00Z"),
    updatedAt: new Date("2025-01-15T10:30:00Z"),
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
      { id: "l1", quoteId: "clx123", title: "Service 1", subtitle: "", quantity: 3, unitPrice: 5000, baseCost: 0 },
      { id: "l2", quoteId: "clx123", title: "Service 2", subtitle: "", quantity: 1, unitPrice: 2500, baseCost: 0 },
    ],
    ...overrides,
  };
}

// ─── 5.2 — Tests des utils ────────────────────────────

describe("computeTotalHT", () => {
  it("calcule la somme des lines (unitPrice × quantity)", () => {
    const q = makeQuote();
    expect(computeTotalHT(q)).toBe(17500);
  });

  it("retourne 0 si lines est vide", () => {
    const q = makeQuote({ lines: [] });
    expect(computeTotalHT(q)).toBe(0);
  });

  it("gère une seule ligne", () => {
    const q = makeQuote({
      lines: [{ id: "l1", quoteId: "clx123", title: "Unique", subtitle: "", quantity: 2, unitPrice: 1000, baseCost: 0 }],
    });
    expect(computeTotalHT(q)).toBe(2000);
  });

  it("gère les quantités à 0", () => {
    const q = makeQuote({
      lines: [{ id: "l1", quoteId: "clx123", title: "Gratuit", subtitle: "", quantity: 0, unitPrice: 5000, baseCost: 0 }],
    });
    expect(computeTotalHT(q)).toBe(0);
  });

  it("gère les valeurs décimales", () => {
    const q = makeQuote({
      lines: [{ id: "l1", quoteId: "clx123", title: "Service", subtitle: "", quantity: 2.5, unitPrice: 1000, baseCost: 0 }],
    });
    expect(computeTotalHT(q)).toBe(2500);
  });
});

describe("formatPrice", () => {
  it("formate 15000 en XOF", () => {
    expect(formatPrice(15000)).toBe("15 000 F CFA");
  });

  it("formate 0 en XOF", () => {
    expect(formatPrice(0)).toBe("0 F CFA");
  });

  it("formate les grands nombres avec séparateurs", () => {
    expect(formatPrice(1_000_000)).toBe("1 000 000 F CFA");
  });

  it("gère les valeurs négatives", () => {
    expect(formatPrice(-500)).toBe("-500 F CFA");
  });

  it("arrondit à l'entier (0 décimales)", () => {
    expect(formatPrice(1234.56)).toBe("1 235 F CFA");
  });
});

describe("formatPriceCompact", () => {
  it("formate 15000 en 15 000 (séparateur français)", () => {
    expect(formatPriceCompact(15000)).toBe("15 000");
  });

  it("formate 1500000 en 1.5M", () => {
    expect(formatPriceCompact(1_500_000)).toBe("1.5M");
  });

  it("formate 500 en 500", () => {
    expect(formatPriceCompact(500)).toBe("500");
  });

  it("formate 0 en 0", () => {
    expect(formatPriceCompact(0)).toBe("0");
  });

  it("gère les très grandes valeurs (milliards → millions)", () => {
    expect(formatPriceCompact(2_500_000_000)).toBe("2500.0M");
  });
});

describe("formatDateShort", () => {
  it("formate Date en DD/MM/YY", () => {
    expect(formatDateShort(new Date(2024, 0, 15))).toBe("15/01/24");
  });

  it("formate string ISO en DD/MM/YY", () => {
    expect(formatDateShort("2024-01-15")).toBe("15/01/24");
  });

  it("ajoute un zéro pour les jours < 10", () => {
    expect(formatDateShort(new Date(2024, 5, 3))).toBe("03/06/24");
  });
});

describe("formatDateLong", () => {
  it("formate en français long (abbrégé)", () => {
    expect(formatDateLong(new Date(2024, 0, 15))).toBe("15 janv. 2024");
  });

  it("formate string ISO", () => {
    expect(formatDateLong("2024-01-15")).toBe("15 janv. 2024");
  });
});

describe("formatDateTime", () => {
  it("formate avec l'heure", () => {
    const d = new Date(2024, 0, 15, 14, 30);
    expect(formatDateTime(d)).toBe("15 janv. 2024, 14:30");
  });

  it("formate string ISO avec heure", () => {
    expect(formatDateTime("2024-01-15T14:30:00Z")).toBe("15 janv. 2024, 14:30");
  });
});

describe("cn", () => {
  it("fusionne les classes Tailwind", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("résout les conflits Tailwind (dernier gagne)", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
  });

  it("ignore les valeurs falsy", () => {
    expect(cn("base", false && "hidden", null, undefined, "visible")).toBe("base visible");
  });
});

describe("applySort", () => {
  const items = [
    makeQuote({ number: "D-003", createdAt: new Date("2025-03-01") }),
    makeQuote({ number: "D-001", createdAt: new Date("2025-01-01") }),
    makeQuote({ number: "D-002", createdAt: new Date("2025-02-01") }),
  ];

  it("tri ascendant par number", () => {
    const sorted = applySort(items, "number", "asc");
    expect(sorted.map((q) => q.number)).toEqual(["D-001", "D-002", "D-003"]);
  });

  it("tri descendant par number", () => {
    const sorted = applySort(items, "number", "desc");
    expect(sorted.map((q) => q.number)).toEqual(["D-003", "D-002", "D-001"]);
  });

  it("tri ascendant par createdAt", () => {
    const sorted = applySort(items, "createdAt", "asc");
    expect(sorted.map((q) => q.number)).toEqual(["D-001", "D-002", "D-003"]);
  });

  it("retourne le tableau inchangé si sortBy est null", () => {
    const sorted = applySort(items, null, "asc");
    expect(sorted).toEqual(items);
  });

  it("ne mute pas le tableau original", () => {
    const original = items.map((q) => q.number);
    applySort(items, "number", "asc");
    expect(items.map((q) => q.number)).toEqual(original);
  });
});