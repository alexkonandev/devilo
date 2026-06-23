import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { QuoteRegistryItem } from "@/types/quote-registry";

export function cn(...classes: ClassValue[]) {
  return twMerge(clsx(classes))
}
export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`;
}

// ═══════════════════════════════════════════════════════════════
// DATE FORMATTERS
// ═══════════════════════════════════════════════════════════════

export function formatDateShort(d: Date | string): string {
  const date = new Date(d);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

export function formatDateLong(d: Date | string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(d));
}

export function formatDateTime(d: Date | string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
}

// ═══════════════════════════════════════════════════════════════
// PRICE FORMATTERS
// ═══════════════════════════════════════════════════════════════

export interface FormatPriceOptions {
  compact?: boolean;
}

export function formatPrice(n: number, opts?: FormatPriceOptions): string {
  if (opts?.compact) {
    if (n >= 1_000_000) {
      return `${(n / 1_000_000).toFixed(1)}M`;
    }
    if (n >= 1_000) {
      return `${(n / 1_000).toFixed(0)}k`;
    }
    return n.toString();
  }
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  }).format(n);
}

export function formatPriceCompact(n: number): string {
  if (n >= 1_000_000) {
    const millions = n / 1_000_000;
    return `${millions.toFixed(1)}M`;
  }
  return new Intl.NumberFormat("fr-FR").format(n);
}

// ═══════════════════════════════════════════════════════════════
// FINANCIAL HELPERS
// ═══════════════════════════════════════════════════════════════

export function computeTotalHT(q: QuoteRegistryItem): number {
  return q.lines.reduce((acc, ln) => acc + ln.unitPrice * ln.quantity, 0);
}

// ═══════════════════════════════════════════════════════════════
// SORT HELPERS
// ═══════════════════════════════════════════════════════════════

export interface SortConfig {
  column: keyof QuoteRegistryItem | "totalHT" | null;
  direction: "asc" | "desc";
}

/**
 * Applique le tri sur une copie du tableau (supporte le champ virtuel totalHT)
 */
export function applySort(
  items: QuoteRegistryItem[],
  sortBy: SortConfig["column"],
  sortDir: "asc" | "desc",
): QuoteRegistryItem[] {
  if (!sortBy) return items;
  return [...items].sort((a, b) => {
    let cmp = 0;

    if (sortBy === "totalHT") {
      cmp = computeTotalHT(a) - computeTotalHT(b);
    } else if (sortBy === "client") {
      cmp = a.client.name.localeCompare(b.client.name, "fr", { sensitivity: "base" });
    } else {
      const aVal = a[sortBy as keyof QuoteRegistryItem];
      const bVal = b[sortBy as keyof QuoteRegistryItem];
      if (typeof aVal === "string" && typeof bVal === "string") {
        cmp = aVal.localeCompare(bVal, "fr", { sensitivity: "base" });
      } else if (typeof aVal === "number" && typeof bVal === "number") {
        cmp = aVal - bVal;
      } else if (aVal instanceof Date && bVal instanceof Date) {
        cmp = aVal.getTime() - bVal.getTime();
      }
    }

    return sortDir === "asc" ? cmp : -cmp;
  });
}
