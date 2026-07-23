// ═══════════════════════════════════════════════════════════════════════════════
// PAGINATION UTILS — Utilitaire partagé pour le découpage multi-pages
// Chaque template définit ses propres hauteurs de sections,
// et cet utilitaire découpe les lignes en pages A4 distinctes.
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hauteurs (en px) des différentes sections d'un template.
 * Chaque template fournit son propre jeu de constantes.
 */
export interface TemplatePageHeights {
  /** Hauteur intérieure utile de la page A4 (297mm ≈ 1122px, moins paddings internes) */
  pageContentHeight: number;
  /** Hauteur du header (logo, titre, infos entreprise) — page 1 uniquement */
  headerHeight: number;
  /** Hauteur du bloc client + dates — page 1 uniquement */
  clientBlockHeight: number;
  /** Hauteur de l'en-tête du tableau — répété sur chaque page avec des lignes */
  tableHeaderHeight: number;
  /** Hauteur d'une ligne du tableau (padding + contenu) */
  rowHeight: number;
  /** Hauteur du bloc total TTC — dernière page uniquement */
  totalCardHeight: number;
  /** Hauteur du footer — dernière page uniquement */
  footerHeight: number;
}

/**
 * Résultat du découpage : les items sont groupés par page.
 * Chaque entrée = la liste des items qui vont sur cette page.
 */
export function splitItemsIntoPages<T>(
  items: T[],
  heights: TemplatePageHeights,
): T[][] {
  const {
    pageContentHeight,
    headerHeight,
    clientBlockHeight,
    tableHeaderHeight,
    rowHeight,
    totalCardHeight,
    footerHeight,
  } = heights;

  if (items.length === 0) {
    return [[]];
  }

  // Espace dispo pour les lignes sur la première page
  const firstPageAvailable =
    pageContentHeight - headerHeight - clientBlockHeight - tableHeaderHeight;
  // Espace dispo pour les lignes sur une page intermédiaire (sans header ni client block)
  const middlePageAvailable = pageContentHeight - tableHeaderHeight;
  // Espace dispo pour les lignes sur la dernière page (avec total + footer)
  const lastPageAvailable =
    pageContentHeight - tableHeaderHeight - totalCardHeight - footerHeight;

  const firstPageRows = Math.max(1, Math.floor(firstPageAvailable / rowHeight));
  const middlePageRows = Math.max(1, Math.floor(middlePageAvailable / rowHeight));
  const lastPageRows = Math.max(1, Math.floor(lastPageAvailable / rowHeight));

  const batches: T[][] = [];
  let cursor = 0;
  const total = items.length;

  // Page 1
  const firstCount = Math.min(firstPageRows, total - cursor);
  batches.push(items.slice(cursor, cursor + firstCount));
  cursor += firstCount;

  // Pages intermédiaires (tant qu'il reste plus de lignes que ce qui tient sur la dernière page)
  while (total - cursor > lastPageRows) {
    const count = Math.min(middlePageRows, total - cursor);
    batches.push(items.slice(cursor, cursor + count));
    cursor += count;
  }

  // Dernière page
  if (cursor < total) {
    batches.push(items.slice(cursor));
  }

  return batches;
}

/**
 * Retourne le nombre total de pages pour un ensemble d'items donné.
 * Utile pour afficher "Page X / Y" dans le footer.
 */
export function getPageCount<T>(
  items: T[],
  heights: TemplatePageHeights,
): number {
  return splitItemsIntoPages(items, heights).length;
}

/**
 * Classe CSS à appliquer sur chaque page A4 pour le saut de page à l'impression.
 * La dernière page ne doit PAS avoir de page-break-after.
 */
export function pageBreakClass(isLast: boolean): string {
  return isLast ? "" : "page-break-after-always";
}

/**
 * Style inline pour le saut de page (utilisé en complément ou en fallback).
 */
export function pageBreakStyle(isLast: boolean): string {
  return isLast ? "" : "page-break-after: always; break-after: page;";
}