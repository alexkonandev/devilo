// ═══════════════════════════════════════════════════════════════════════════════
// RENDERER : Art Deco 🏙️
// Gatsby géométrique noir & or — années 20 luxueuses
// Cible : immobilier de luxe, joaillerie, événementiel premium
// Avec pagination multi-pages A4
// ═══════════════════════════════════════════════════════════════════════════════

import { TemplateDefinition, EditorActiveQuote } from "@/types/editor";
import { splitItemsIntoPages, type TemplatePageHeights } from "./pagination-utils";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0 }).format(n);

const PAGE_LAYOUT: TemplatePageHeights = {
  pageContentHeight: 1020,   // 297mm — paddings 56px haut/bas
  headerHeight: 130,          // header avec motif sunburst + triple filet
  clientBlockHeight: 150,     // bloc client + dates + gap
  tableHeaderHeight: 44,      // en-tête du tableau avec bordure double
  rowHeight: 62,              // une ligne (padding compact)
  totalCardHeight: 220,       // carte total en négatif
  footerHeight: 80,           // footer avec motif grecque
};

export function renderArtDeco(
  quote: EditorActiveQuote,
  template: TemplateDefinition,
): string {
  const C = template.colors;
  const SP = template.spacing;
  const px = `${SP.paddingX}px`;
  const py = `${SP.paddingY}px`;
  const gap = `${SP.gap}px`;

  const items = quote?.items || [];
  const financials = quote?.financials || {};
  const company = quote?.company || {};
  const client = quote?.client || {};
  const quoteInfo = quote?.quote || {};
  const currency = quote?.currency || "XOF";
  const dueDate = quoteInfo?.dueDate;
  const validityDays = quote?.validityDays || 30;

  const subTotal = items.reduce(
    (acc: number, item: any) =>
      acc + Number(item?.quantity || 0) * Number(item?.unitPrice || 0),
    0,
  );
  const discount = Number(financials?.discountAmount || 0);
  const taxable = Math.max(0, subTotal - discount);
  const vatRate = Number(financials?.vatRatePercent || 0);
  const vat = taxable * (vatRate / 100);
  const total = taxable + vat;

  // ── Découpage en pages ──
  const pages = splitItemsIntoPages(items, PAGE_LAYOUT);
  const totalPages = pages.length;

  // ── Templates HTML réutilisables ──

  const renderStyles = () => `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&display=swap');
      [id^="quote-page-"] * {
        font-family: '${template.typography.fontFamily}', serif !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      @page { size: A4; margin: 0; }
      .no-break { page-break-inside: avoid; break-inside: avoid; }
      .double-border-card {
        border: 3px double ${C.primary};
        padding: 18px 22px;
      }
      .triple-rule {
        height: 4px;
        background-color: ${C.primary};
        margin-bottom: 3px;
        width: 100%;
      }
      .triple-rule-mid {
        height: 2px;
        background-color: ${C.primary};
        margin-bottom: 3px;
        width: 100%;
      }
      .triple-rule-thin {
        height: 1px;
        background-color: ${C.primary}60;
        width: 100%;
      }
      .sunburst-bg {
        position: relative;
        overflow: hidden;
      }
      .sunburst-bg::before {
        content: '';
        position: absolute;
        top: -50%;
        right: -20%;
        width: 60%;
        height: 200%;
        background: conic-gradient(
          from 0deg,
          transparent 0deg,
          ${C.primary}08 5deg,
          transparent 10deg,
          transparent 20deg,
          ${C.primary}05 25deg,
          transparent 30deg,
          transparent 40deg,
          ${C.primary}08 45deg,
          transparent 50deg
        );
        z-index: 0;
        pointer-events: none;
      }
      .medallion {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid ${C.primary};
        background-color: ${C.background};
        font-size: 10px;
        font-weight: 900;
        color: ${C.primary};
        font-family: monospace;
      }
      .greek-key {
        height: 6px;
        background-image: repeating-linear-gradient(
          90deg,
          ${C.primary} 0px,
          ${C.primary} 4px,
          transparent 4px,
          transparent 12px,
          ${C.primary} 12px,
          ${C.primary} 14px,
          transparent 14px,
          transparent 18px
        );
        background-size: 18px 6px;
        opacity: 0.4;
      }
      .negatif-total {
        background-color: ${C.accent};
        color: ${C.primary};
        padding: 18px 24px;
        border: 2px solid ${C.primary};
      }
      .page-break-after-always {
        page-break-after: always;
        break-after: page;
      }
    </style>
  `;

  const renderHeader = () => `
    <header class="flex justify-between items-start sunburst-bg" style="padding: ${py} ${px} ${gap} ${px}; background-color: ${C.background};">
      <div style="position: relative; z-index: 1;">
        <h1 style="font-size: 30px; font-weight: 900; letter-spacing: 0.04em; color: ${C.accent}; margin: 0; text-transform: uppercase;">
          ${quote?.title || "DEVIS"}
        </h1>
        <div style="margin-top: 6px;">
          <p style="font-size: 11px; font-weight: 700; color: ${C.primary}; letter-spacing: 0.2em; text-transform: uppercase; margin: 0;">
            N° ${quoteInfo?.number || "---"}
          </p>
        </div>
      </div>
      <div class="text-right" style="position: relative; z-index: 1;">
        <div style="font-size: 17px; font-weight: 700; color: ${C.accent}; letter-spacing: 0.03em; text-transform: uppercase;">${company?.name || ""}</div>
        <div style="font-size: 9px; color: ${C.textMuted}; margin-top: 4px; line-height: 1.5; font-weight: 400;">
          ${company?.address || ""}
        </div>
        <div style="font-size: 9px; color: ${C.primary}; font-weight: 700; margin-top: 2px; letter-spacing: 0.05em;">
          ${company?.email || ""}
        </div>
      </div>
    </header>
    <div style="padding: 0 ${px}; margin-bottom: ${gap};">
      <div class="triple-rule"></div>
      <div class="triple-rule-mid"></div>
      <div class="triple-rule-thin"></div>
    </div>
  `;

  const renderClientBlock = () => `
    <section class="flex justify-between items-start no-break" style="margin-bottom: ${gap};">
      <div class="double-border-card" style="flex: 0 0 52%;">
        <p style="font-size: 8px; font-weight: 900; color: ${C.primary}; letter-spacing: 0.25em; text-transform: uppercase; margin: 0 0 8px 0;">Client</p>
        <p style="font-size: 16px; font-weight: 700; color: ${C.accent}; margin: 0 0 4px 0; letter-spacing: 0.02em;">${client?.name || "Client"}</p>
        <p style="font-size: 9px; color: ${C.textMuted}; margin-top: 6px; line-height: 1.5; font-weight: 400;">${client?.address || ""}</p>
        ${client?.email ? `<p style="font-size: 9px; color: ${C.textMuted}; font-weight: 400;">${client.email}</p>` : ""}
        ${client?.phone ? `<p style="font-size: 9px; color: ${C.textMuted}; font-weight: 400;">${client.phone}</p>` : ""}
      </div>
      <div class="text-right" style="min-width: 170px;">
        <div style="margin-bottom: 12px;">
          <p style="font-size: 8px; font-weight: 900; color: ${C.primary}; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 3px;">Émis le</p>
          <p style="font-size: 12px; font-weight: 700; color: ${C.accent}; font-family: monospace;">${quoteInfo?.issueDate || "---"}</p>
        </div>
        ${dueDate ? `
        <div style="margin-bottom: 12px;">
          <p style="font-size: 8px; font-weight: 900; color: ${C.primary}; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 3px;">Échéance</p>
          <p style="font-size: 12px; font-weight: 700; color: ${C.accent}; font-family: monospace;">${dueDate}</p>
        </div>` : ""}
        <div>
          <p style="font-size: 8px; font-weight: 900; color: ${C.primary}; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 3px;">Validité</p>
          <p style="font-size: 12px; font-weight: 700; color: ${C.accent}; font-family: monospace;">${validityDays} jours</p>
        </div>
      </div>
    </section>
  `;

  const renderSectionSeparator = () => `
    <div class="no-break" style="padding: 0 ${px}; margin-bottom: ${gap};">
      <div class="triple-rule"></div>
      <div class="triple-rule-mid"></div>
      <div class="triple-rule-thin"></div>
    </div>
  `;

  const renderTableHeader = () => `
    <section class="no-break" style="margin-bottom: 0;">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr>
            <th style="background-color: ${C.accent}; color: ${C.primary}; padding: 10px 14px; text-align: left; font-size: 8px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.18em;">
              Désignation
            </th>
            <th style="background-color: ${C.accent}; color: ${C.primary}; padding: 10px 8px; text-align: center; font-size: 8px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.18em; width: 60px;">
              Qté
            </th>
            <th style="background-color: ${C.accent}; color: ${C.primary}; padding: 10px 8px; text-align: right; font-size: 8px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.18em; width: 100px;">
              P.U HT
            </th>
            <th style="background-color: ${C.accent}; color: ${C.primary}; padding: 10px 14px; text-align: right; font-size: 8px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.18em; width: 120px;">
              Total HT
            </th>
          </tr>
        </thead>
        <tbody>
  `;

  const renderRow = (item: any, i: number) => `
    <tr class="no-break" style="border-bottom: 1px solid ${C.border};">
      <td style="padding: 11px 14px; vertical-align: top;">
        <p style="font-size: 11px; font-weight: 700; color: ${C.accent}; margin: 0; letter-spacing: 0.01em;">${item?.title || ""}</p>
        <p style="font-size: 8px; font-weight: 400; color: ${C.textMuted}; margin-top: 2px; max-width: 380px; line-height: 1.4;">${item?.subtitle || ""}</p>
      </td>
      <td style="padding: 11px 8px; vertical-align: top; text-align: center;">
        <span style="font-size: 10px; font-family: monospace; font-weight: 700; color: ${C.accent};">${item?.quantity || 0}</span>
      </td>
      <td style="padding: 11px 8px; vertical-align: top; text-align: right;">
        <span style="font-size: 10px; font-family: monospace; color: ${C.textMuted};">${fmt(item?.unitPrice || 0)}</span>
      </td>
      <td style="padding: 11px 14px; vertical-align: top; text-align: right;">
        <span style="font-size: 11px; font-family: monospace; font-weight: 700; color: ${C.accent};">${fmt((item?.quantity || 0) * (item?.unitPrice || 0))}</span>
      </td>
    </tr>
  `;

  const renderTableClose = () => `
        </tbody>
      </table>
    </section>
  `;

  const renderTotalCard = () => `
    <section class="flex justify-end no-break" style="margin-bottom: ${gap}; margin-top: ${gap};">
      <div class="negatif-total" style="width: 320px;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0;">
          <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em;">Sous-total HT</span>
          <span style="font-size: 13px; font-family: monospace; font-weight: 700;">${fmt(subTotal)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-top: 1px solid ${C.primary}40;">
          <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em;">TVA (${vatRate}%)</span>
          <span style="font-size: 13px; font-family: monospace;">${fmt(vat)}</span>
        </div>
        ${discount > 0 ? `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-top: 1px solid ${C.primary}40;">
          <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em;">Remise</span>
          <span style="font-size: 13px; font-family: monospace; font-weight: 700;">- ${fmt(discount)}</span>
        </div>` : ""}
        <div style="margin-top: 12px; padding-top: 12px; border-top: 3px double ${C.primary}; text-align: center;">
          <span style="font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em;">Total TTC</span>
          <div style="font-size: 32px; font-weight: 900; font-family: monospace; margin-top: 4px; letter-spacing: -0.02em;">${fmt(total)}</div>
          <div style="font-size: 9px; font-weight: 700; letter-spacing: 0.15em; margin-top: 2px;">${currency}</div>
        </div>
      </div>
    </section>
  `;

  const renderFooter = () => `
    <footer style="padding: 0 ${px} ${py} ${px}; background-color: ${C.background};">
      <div class="greek-key" style="margin-bottom: 12px;"></div>
      <div style="display: flex; justify-content: space-between; align-items: flex-end;">
        <div style="max-width: 60%;">
          <p style="font-size: 8px; font-weight: 700; color: ${C.textMuted}; letter-spacing: 0.08em; text-transform: uppercase; margin: 0;">
            ${quoteInfo?.terms || `Paiement à réception. Validité : ${validityDays} jours.`}
          </p>
        </div>
        <div class="text-right">
          <p style="font-size: 8px; font-weight: 900; color: ${C.primary}; letter-spacing: 0.15em; text-transform: uppercase; margin: 0;">
            Art Déco — Document confidentiel
          </p>
          <p style="font-size: 7px; color: ${C.textMuted}; margin-top: 2px; letter-spacing: 0.1em;">
            Généré le ${new Date().toLocaleDateString("fr-FR")}
          </p>
        </div>
      </div>
    </footer>
  `;

  const renderMiniHeader = (pageNum: number) => `
    <div style="padding: 16px ${px} 0 ${px}; background-color: ${C.background};">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <p style="font-size: 11px; font-weight: 700; color: ${C.textMuted}; letter-spacing: 0.1em; text-transform: uppercase; margin: 0;">
          ${quote?.title || "DEVIS"} N° ${quoteInfo?.number || "---"} — Suite
        </p>
        <span class="medallion">${pageNum}</span>
      </div>
      <div style="margin-top: 10px;">
        <div class="triple-rule"></div>
        <div class="triple-rule-mid"></div>
        <div class="triple-rule-thin"></div>
      </div>
    </div>
  `;

  // ── Assemblage des pages ──

  const pagesHtml = pages
    .map((batch: any[], pageIndex: number) => {
      const isFirst = pageIndex === 0;
      const isLast = pageIndex === totalPages - 1;
      const pageNum = pageIndex + 1;
      const pageBreakAttr = isLast
        ? ""
        : 'class="page-break-after-always"';

      // Si tout tient sur une seule page
      if (totalPages === 1) {
        return `
          <div id="quote-page-${pageNum}" class="w-[210mm] mx-auto relative shadow-none" style="min-height: 297mm; background-color: ${C.background};">
            ${renderStyles()}
            ${renderHeader()}
            <div style="padding: 0 ${px};">
              ${renderClientBlock()}
              ${renderSectionSeparator()}
              ${renderTableHeader()}
              ${batch.map((item: any, i: number) => renderRow(item, i)).join("")}
              ${renderTableClose()}
              ${renderSectionSeparator()}
              ${renderTotalCard()}
            </div>
            ${renderFooter()}
          </div>
        `;
      }

      // Page 1 : header + client + début du tableau
      if (isFirst) {
        return `
          <div id="quote-page-${pageNum}" ${pageBreakAttr} class="w-[210mm] mx-auto relative shadow-none" style="min-height: 297mm; background-color: ${C.background};">
            ${renderStyles()}
            ${renderHeader()}
            <div style="padding: 0 ${px};">
              ${renderClientBlock()}
              ${renderSectionSeparator()}
              ${renderTableHeader()}
              ${batch.map((item: any, i: number) => renderRow(item, i)).join("")}
              ${renderTableClose()}
            </div>
          </div>
        `;
      }

      // Dernière page : fin du tableau + total + footer
      if (isLast) {
        return `
          <div id="quote-page-${pageNum}" class="w-[210mm] mx-auto relative shadow-none" style="min-height: 297mm; background-color: ${C.background};">
            ${renderStyles()}
            ${renderMiniHeader(pageNum)}
            <div style="padding: 0 ${px};">
              ${renderTableHeader()}
              ${batch.map((item: any, i: number) => renderRow(item, i)).join("")}
              ${renderTableClose()}
              ${renderSectionSeparator()}
              ${renderTotalCard()}
            </div>
            ${renderFooter()}
          </div>
        `;
      }

      // Pages intermédiaires : suite du tableau uniquement
      return `
        <div id="quote-page-${pageNum}" ${pageBreakAttr} class="w-[210mm] mx-auto relative shadow-none" style="min-height: 297mm; background-color: ${C.background};">
          ${renderStyles()}
          ${renderMiniHeader(pageNum)}
          <div style="padding: 0 ${px};">
            ${renderTableHeader()}
            ${batch.map((item: any, i: number) => renderRow(item, i)).join("")}
            ${renderTableClose()}
          </div>
        </div>
      `;
    })
    .join("\n");

  return pagesHtml;
}