// ═══════════════════════════════════════════════════════════════════════════════
// FORMAT UTILITIES — Catalog Module
// ═══════════════════════════════════════════════════════════════════════════════

export const formatCompact = (amount: number): string => {
  if (amount >= 1_000_000)
    return `${(amount / 1_000_000).toFixed(1).replace(".0", "")}M`;
  if (amount >= 1_000) return `${Math.round(amount / 1_000)}K`;
  return amount.toString();
};