// ═══════════════════════════════════════════════════════════════════════════════
// RENDERER : Tech Blueprint
// Style plan d'ingénieur — fond quadrillé, JetBrains Mono, cartouche technique
// Cible : bureaux d'études, ingénierie, BTP, architectes
// Avec pagination multi-pages A4
// ═══════════════════════════════════════════════════════════════════════════════

import { TemplateDefinition, EditorActiveQuote } from "@/types/editor";
import { splitItemsIntoPages, type TemplatePageHeights } from "./pagination-utils";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0 }).format(n);

const PAGE_LAYOUT: TemplatePageHeights = {
  pageContentHeight: 1050,
  headerHeight: 130,        // bande orange + header + séparateur technique
  clientBlockHeight: 120,   // cartouche client + dates façon fiche technique
  tableHeaderHeight: 36,
  rowHeight: 56,
  totalCardHeight: 200,
  footerHeight: 80,         // cartouche footer
};

export function renderTechBlueprint(
  quote: EditorActiveQuote,
  template: TemplateDefinition,
): string {
  const C = template.colors;
  const SP = template.spacing;
  const px = `${SP.paddingX}px`;
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

  const pages = splitItemsIntoPages(items, PAGE_LAYOUT);
  const totalPages = pages.length;

  const renderStyles = () => `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Inter:wght@400;500;700;900&display=swap');
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      @page { size: A4; margin: 0; }
      .no-break { page-break-inside: avoid; break-inside: avoid; }
      .page-break-after-always { page-break-after: always; break-after: page; }
      .blueprint-grid {
        position: relative;
      }
      .blueprint-grid::before {
        content: "";
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(74, 144, 217, 0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(74, 144, 217, 0.06) 1px, transparent 1px);
        background-size: 20px 20px;
        pointer-events: none;
        z-index: 0;
      }
      .blueprint-grid > * { position: relative; z-index: 1; }
      .tech-badge {
        display: inline-block;
        font-family: 'JetBrains Mono', monospace;
        font-size: 9px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 4px 12px;
        border: 1.5px solid ${C.primary};
        color: ${C.primary};
        background-color: ${C.surface};
      }
      .tech-line {
        height: 2px;
        background-color: ${C.primary};
        position: relative;
      }
      .tech-line::after {
        content: "";
        position: absolute;
        top: 4px;
        left: 0;
        right: 0;
        height: 1px;
        background-color: ${C.border};
        border-top: 1px dashed ${C.accent};
      }
      .cartouche {
        border: 1.5px solid ${C.primary};
        background-color: ${C.surface};
        padding: 12px 16px;
        position: relative;
      }
    </style>
  `;

  const renderHeader = () => `
    <div style="height: 4px; background-color: ${C.primary}; width: 100%;"></div>
    <header class="flex justify-between items-start" style="padding: 20px ${px} 0 ${px};">
      <div>
        <h1 class="text-[20px] font-black tracking-tighter leading-none" style="font-family: 'JetBrains Mono', monospace; color: ${C.text};">
          ${company?.name || "ENTREPRISE"}
        </h1>
        <p style="font-family: 'JetBrains Mono', monospace; font-size: 8px; color: ${C.textMuted}; margin-top: 4px;">
          ${company?.address || ""}
        </p>
        <p style="font-family: 'JetBrains Mono', monospace; font-size: 8px; color: ${C.primary}; font-weight: 500;">
          ${company?.email || ""}
        </p>
      </div>
      <div class="text-right">
        <span class="tech-badge">DEVIS TECHNIQUE</span>
        <p style="font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; color: ${C.text}; margin-top: 8px;">
          REF: ${quoteInfo?.number || "---"}
        </p>
      </div>
    </header>
    <div style="padding: 0 ${px}; margin-top: 16px;">
      <div class="tech-line"></div>
    </div>
  `;

  const renderClientBlock = () => `
    <section class="cartouche no-break" style="margin-bottom: ${gap};">
      <div class="flex justify-between items-start">
        <div>
          <p style="font-family: 'JetBrains Mono', monospace; font-size: 7px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: ${C.primary};">CLIENT / MAÎTRE D'OUVRAGE</p>
          <p style="font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 700; color: ${C.text}; margin-top: 6px;">
            ${client?.name || "Client"}
          </p>
          <p style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: ${C.textMuted}; margin-top: 4px;">
            ${client?.address || ""}
          </p>
          ${client?.email ? `<p style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: ${C.textMuted};">${client.email}</p>` : ""}
          ${client?.phone ? `<p style="font-family: 'JetBrains Mono', monospace; font-size: 9px; color: ${C.textMuted};">${client.phone}</p>` : ""}
        </div>
        <div class="text-right" style="min-width: 160px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="font-family: 'JetBrains Mono', monospace; font-size: 7px; font-weight: 600; text-transform: uppercase; color: ${C.textMuted}; padding: 2px 4px;">DATE</td>
              <td style="font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 600; color: ${C.text}; padding: 2px 4px; text-align: right;">${quoteInfo?.issueDate || "---"}</td>
            </tr>
            ${dueDate ? `
            <tr>
              <td style="font-family: 'JetBrains Mono', monospace; font-size: 7px; font-weight: 600; text-transform: uppercase; color: ${C.textMuted}; padding: 2px 4px;">ÉCHÉANCE</td>
              <td style="font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 600; color: ${C.text}; padding: 2px 4px; text-align: right;">${dueDate}</td>
            </tr>` : ""}
            <tr>
              <td style="font-family: 'JetBrains Mono', monospace; font-size: 7px; font-weight: 600; text-transform: uppercase; color: ${C.textMuted}; padding: 2px 4px;">VALIDITÉ</td>
              <td style="font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 600; color: ${C.text}; padding: 2px 4px; text-align: right;">${validityDays} J</td>
            </tr>
            <tr>
              <td style="font-family: 'JetBrains Mono', monospace; font-size: 7px; font-weight: 600; text-transform: uppercase; color: ${C.textMuted}; padding: 2px 4px;">RÉF.</td>
              <td style="font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 600; color: ${C.primary}; padding: 2px 4px; text-align: right;">${quoteInfo?.number || "---"}</td>
            </tr>
          </table>
        </div>
      </div>
    </section>
  `;

  const renderTableHeader = () => `
    <section class="no-break" style="margin-bottom: ${gap};">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr>
            <th style="font-family: 'JetBrains Mono', monospace; font-size: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: ${C.text}; padding: 10px 12px; border-bottom: 2px solid ${C.primary}; text-align: left;">
              Désignation
            </th>
            <th style="font-family: 'JetBrains Mono', monospace; font-size: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: ${C.text}; padding: 10px 8px; border-bottom: 2px solid ${C.primary}; text-align: center; width: 55px;">
              Qté
            </th>
            <th style="font-family: 'JetBrains Mono', monospace; font-size: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: ${C.text}; padding: 10px 8px; border-bottom: 2px solid ${C.primary}; text-align: right; width: 100px;">
              P.U HT
            </th>
            <th style="font-family: 'JetBrains Mono', monospace; font-size: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: ${C.text}; padding: 10px 12px; border-bottom: 2px solid ${C.primary}; text-align: right; width: 120px;">
              Total HT
            </th>
          </tr>
        </thead>
        <tbody>
  `;

  const renderRow = (item: any, i: number) => `
    <tr class="no-break" style="border-bottom: 1px solid ${C.border}; background-color: ${i % 2 === 0 ? '#ffffff' : C.highlight};">
      <td style="padding: 10px 12px; vertical-align: top;">
        <p style="font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 700; color: ${C.text}; margin: 0;">${item?.title || ""}</p>
        <p style="font-family: 'JetBrains Mono', monospace; font-size: 8px; font-weight: 400; color: ${C.textMuted}; margin-top: 3px; max-width: 380px;">${item?.subtitle || ""}</p>
      </td>
      <td style="padding: 10px 8px; vertical-align: top; text-align: center;">
        <span style="font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 600; color: ${C.text};">${item?.quantity || 0}</span>
      </td>
      <td style="padding: 10px 8px; vertical-align: top; text-align: right;">
        <span style="font-family: 'JetBrains Mono', monospace; font-size: 10px; color: ${C.textMuted};">${fmt(item?.unitPrice || 0)}</span>
      </td>
      <td style="padding: 10px 12px; vertical-align: top; text-align: right;">
        <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700; color: ${C.text};">${fmt((item?.quantity || 0) * (item?.unitPrice || 0))}</span>
      </td>
    </tr>
  `;

  const renderTableClose = () => `</tbody></table></section>`;

  const renderTotalCard = () => `
    <section class="flex justify-end no-break" style="margin-bottom: ${gap};">
      <div class="cartouche" style="width: 280px; border-color: ${C.primary};">
        <div class="flex justify-between items-center py-1.5">
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 8px; font-weight: 600; text-transform: uppercase; color: ${C.textMuted};">Sous-total HT</span>
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 600; color: ${C.text};">${fmt(subTotal)}</span>
        </div>
        <div class="flex justify-between items-center py-1.5" style="border-top: 1px solid ${C.border};">
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 8px; font-weight: 600; text-transform: uppercase; color: ${C.textMuted};">TVA (${vatRate}%)</span>
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: ${C.textMuted};">${fmt(vat)}</span>
        </div>
        ${discount > 0 ? `
        <div class="flex justify-between items-center py-1.5" style="border-top: 1px solid ${C.border};">
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 8px; font-weight: 600; text-transform: uppercase; color: ${C.textMuted};">Remise</span>
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 600; color: ${C.primary};">- ${fmt(discount)}</span>
        </div>` : ""}
        <div style="margin-top: 10px; padding-top: 10px; border-top: 2px solid ${C.primary};">
          <div class="flex justify-between items-center">
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: ${C.text};">Total TTC</span>
            <span style="font-family: 'JetBrains Mono', monospace; font-size: 22px; font-weight: 700; color: ${C.primary};">${fmt(total)}</span>
          </div>
          <p style="font-family: 'JetBrains Mono', monospace; font-size: 7px; font-weight: 600; text-align: right; margin-top: 4px; color: ${C.textMuted};">${currency}</p>
        </div>
      </div>
    </section>
  `;

  const renderFooter = () => `
    <footer style="padding: 0 ${px} ${SP.paddingY}px ${px};">
      <div class="cartouche" style="border-color: ${C.border};">
        <div class="flex justify-between items-start">
          <div>
            <p style="font-family: 'JetBrains Mono', monospace; font-size: 7px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: ${C.textMuted};">
              ${quoteInfo?.terms || `Paiement à réception. Validité : ${validityDays} jours.`}
            </p>
            <p style="font-family: 'JetBrains Mono', monospace; font-size: 6px; color: ${C.textMuted}; margin-top: 4px;">
              DOCUMENT GÉNÉRÉ LE ${new Date().toLocaleDateString("fr-FR").toUpperCase()}
            </p>
          </div>
          <div class="text-right">
            <p style="font-family: 'JetBrains Mono', monospace; font-size: 6px; font-weight: 600; color: ${C.textMuted};">FORMAT: A4</p>
            <p style="font-family: 'JetBrains Mono', monospace; font-size: 6px; font-weight: 600; color: ${C.textMuted};">RÉV. 01</p>
            <p style="font-family: 'JetBrains Mono', monospace; font-size: 6px; font-weight: 600; color: ${C.textMuted};">ÉCH: 1/50</p>
          </div>
        </div>
      </div>
    </footer>
  `;

  const renderMiniHeader = (pageNum: number) => `
    <div style="height: 4px; background-color: ${C.primary}; width: 100%;"></div>
    <div style="padding: 16px ${px} 0 ${px};">
      <div class="flex justify-between items-center">
        <span class="tech-badge" style="font-size: 8px;">DEVIS ${quoteInfo?.number || "---"} — SUITE</span>
        <p style="font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 600; color: ${C.primary};">
          PAGE ${pageNum} / ${totalPages}
        </p>
      </div>
      <div style="margin-top: 12px;">
        <div class="tech-line"></div>
      </div>
    </div>
  `;

  // ── Assemblage des pages ──

  const pagesHtml = pages
    .map((batch: any[], pageIndex: number) => {
      const isFirst = pageIndex === 0;
      const isLast = pageIndex === totalPages - 1;
      const pageNum = pageIndex + 1;
      const pageBreakAttr = isLast ? "" : 'class="page-break-after-always"';

      if (totalPages === 1) {
        return `
          <div id="quote-page-${pageNum}" class="blueprint-grid w-[210mm] mx-auto relative shadow-none" style="min-height: 297mm; background-color: ${C.background};">
            ${renderStyles()}
            ${renderHeader()}
            <div style="padding: ${gap} ${px} 0 ${px};">
              ${renderClientBlock()}
              ${renderTableHeader()}
              ${batch.map((item: any, i: number) => renderRow(item, i)).join("")}
              ${renderTableClose()}
              ${renderTotalCard()}
            </div>
            ${renderFooter()}
          </div>
        `;
      }

      if (isFirst) {
        return `
          <div id="quote-page-${pageNum}" ${pageBreakAttr} class="blueprint-grid w-[210mm] mx-auto relative shadow-none" style="min-height: 297mm; background-color: ${C.background};">
            ${renderStyles()}
            ${renderHeader()}
            <div style="padding: ${gap} ${px} 0 ${px};">
              ${renderClientBlock()}
              ${renderTableHeader()}
              ${batch.map((item: any, i: number) => renderRow(item, i)).join("")}
              ${renderTableClose()}
            </div>
          </div>
        `;
      }

      if (isLast) {
        return `
          <div id="quote-page-${pageNum}" class="blueprint-grid w-[210mm] mx-auto relative shadow-none" style="min-height: 297mm; background-color: ${C.background};">
            ${renderStyles()}
            ${renderMiniHeader(pageNum)}
            <div style="padding: ${gap} ${px} 0 ${px};">
              ${renderTableHeader()}
              ${batch.map((item: any, i: number) => renderRow(item, i)).join("")}
              ${renderTableClose()}
              ${renderTotalCard()}
            </div>
            ${renderFooter()}
          </div>
        `;
      }

      return `
        <div id="quote-page-${pageNum}" ${pageBreakAttr} class="blueprint-grid w-[210mm] mx-auto relative shadow-none" style="min-height: 297mm; background-color: ${C.background};">
          ${renderStyles()}
          ${renderMiniHeader(pageNum)}
          <div style="padding: ${gap} ${px} 0 ${px};">
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