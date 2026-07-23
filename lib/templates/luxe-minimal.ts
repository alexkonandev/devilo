// ═══════════════════════════════════════════════════════════════════════════════
// RENDERER : Luxe Minimal
// Noir & champagne, Cormorant Garamond, ultra-espacement — le vide comme luxe
// Cible : joaillerie, haute couture, conciergerie, hôtellerie haut de gamme
// Avec pagination multi-pages A4
// ═══════════════════════════════════════════════════════════════════════════════

import { TemplateDefinition, EditorActiveQuote } from "@/types/editor";
import { splitItemsIntoPages, type TemplatePageHeights } from "./pagination-utils";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0 }).format(n);

const PAGE_LAYOUT: TemplatePageHeights = {
  pageContentHeight: 1050,
  headerHeight: 140,        // header très aéré avec liseré champagne
  clientBlockHeight: 110,   // bloc client sobre
  tableHeaderHeight: 32,
  rowHeight: 72,            // beaucoup d'air entre les lignes
  totalCardHeight: 190,
  footerHeight: 100,        // footer avec liseré + remerciements
};

export function renderLuxeMinimal(
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
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500&display=swap');
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      @page { size: A4; margin: 0; }
      .no-break { page-break-inside: avoid; break-inside: avoid; }
      .page-break-after-always { page-break-after: always; break-after: page; }
      .champagne-liseret {
        height: 1.5px;
        background-color: ${C.primary};
        opacity: 0.4;
      }
      .serif-title {
        font-family: 'Cormorant Garamond', serif;
        letter-spacing: 0.06em;
      }
      .luxe-line {
        height: 0.5px;
        background-color: ${C.primary};
        opacity: 0.25;
      }
    </style>
  `;

  const renderHeader = () => `
    <div class="champagne-liseret"></div>
    <header class="text-center" style="padding: 40px ${px} 0 ${px};">
      <h1 class="serif-title" style="font-size: 28px; font-weight: 300; color: ${C.text}; margin: 0;">
        ${company?.name || "Maison"}
      </h1>
      <p style="font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 300; color: ${C.textMuted}; margin-top: 12px; letter-spacing: 0.08em; text-transform: uppercase;">
        ${company?.address || ""}
      </p>
      <p style="font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 300; color: ${C.primary}; margin-top: 4px; letter-spacing: 0.08em;">
        ${company?.email || ""}
      </p>
      <div style="margin: 32px auto 0 auto; width: 80px;" class="champagne-liseret"></div>
      <p class="serif-title" style="font-size: 14px; font-weight: 500; font-style: italic; color: ${C.text}; margin-top: 16px;">
        Devis N° ${quoteInfo?.number || "---"}
      </p>
    </header>
  `;

  const renderClientBlock = () => `
    <section class="no-break" style="padding: ${gap} ${px} 0 ${px}; margin-bottom: ${gap};">
      <div class="flex justify-between items-start">
        <div>
          <p style="font-family: 'Inter', sans-serif; font-size: 8px; font-weight: 400; text-transform: uppercase; letter-spacing: 0.12em; color: ${C.textMuted};">
            À l'attention de
          </p>
          <p class="serif-title" style="font-size: 18px; font-weight: 400; color: ${C.text}; margin-top: 8px;">
            ${client?.name || "Client"}
          </p>
          <p style="font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 300; color: ${C.textMuted}; margin-top: 6px; line-height: 1.6;">
            ${client?.address || ""}
          </p>
          ${client?.email ? `<p style="font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 300; color: ${C.textMuted};">${client.email}</p>` : ""}
          ${client?.phone ? `<p style="font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 300; color: ${C.textMuted};">${client.phone}</p>` : ""}
        </div>
        <div class="text-right">
          <table style="border-collapse: collapse;">
            <tr>
              <td style="font-family: 'Inter', sans-serif; font-size: 8px; font-weight: 300; text-transform: uppercase; letter-spacing: 0.1em; color: ${C.textMuted}; padding: 4px 12px;">Émis le</td>
              <td style="font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 400; color: ${C.text}; padding: 4px 0; text-align: right;">${quoteInfo?.issueDate || "---"}</td>
            </tr>
            ${dueDate ? `
            <tr>
              <td style="font-family: 'Inter', sans-serif; font-size: 8px; font-weight: 300; text-transform: uppercase; letter-spacing: 0.1em; color: ${C.textMuted}; padding: 4px 12px;">Échéance</td>
              <td style="font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 400; color: ${C.text}; padding: 4px 0; text-align: right;">${dueDate}</td>
            </tr>` : ""}
            <tr>
              <td style="font-family: 'Inter', sans-serif; font-size: 8px; font-weight: 300; text-transform: uppercase; letter-spacing: 0.1em; color: ${C.textMuted}; padding: 4px 12px;">Validité</td>
              <td style="font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 400; color: ${C.text}; padding: 4px 0; text-align: right;">${validityDays} jours</td>
            </tr>
          </table>
        </div>
      </div>
      <div class="luxe-line" style="margin-top: ${gap};"></div>
    </section>
  `;

  const renderTableHeader = () => `
    <section class="no-break" style="margin-bottom: ${gap}; ">
      <table class="w-full text-left border-collapse ">
        <thead>
          <tr>
            <th style="font-family: 'Inter', sans-serif; font-size: 8px; font-weight: 400; text-transform: uppercase; letter-spacing: 0.1em; color: ${C.textMuted}; padding: 0 16px 8px 0; text-align: left;">
              Prestation
            </th>
            <th style="font-family: 'Inter', sans-serif; font-size: 8px; font-weight: 400; text-transform: uppercase; letter-spacing: 0.1em; color: ${C.textMuted}; padding: 0 8px 8px 0; text-align: center; width: 50px;">
              Qté
            </th>
            <th style="font-family: 'Inter', sans-serif; font-size: 8px; font-weight: 400; text-transform: uppercase; letter-spacing: 0.1em; color: ${C.textMuted}; padding: 0 8px 8px 0; text-align: right; width: 100px;">
              Prix HT
            </th>
            <th style="font-family: 'Inter', sans-serif; font-size: 8px; font-weight: 400; text-transform: uppercase; letter-spacing: 0.1em; color: ${C.textMuted}; padding: 0 0 8px 16px; text-align: right; width: 120px;">
              Total HT
            </th>
          </tr>
        </thead>
        <tbody>
  `;

  const renderRow = (item: any, i: number) => `
    <tr class="no-break">
      <td style="padding: 18px 16px 18px 0; vertical-align: top;">
        <p class="serif-title" style="font-size: 14px; font-weight: 400; color: ${C.text}; margin: 0;">${item?.title || ""}</p>
        <p style="font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 300; font-style: italic; color: ${C.textMuted}; margin-top: 4px; max-width: 400px; line-height: 1.5;">${item?.subtitle || ""}</p>
      </td>
      <td style="padding: 18px 8px; vertical-align: top; text-align: center;">
        <span style="font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 300; color: ${C.text};">${item?.quantity || 0}</span>
      </td>
      <td style="padding: 18px 8px; vertical-align: top; text-align: right;">
        <span style="font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 300; color: ${C.textMuted};">${fmt(item?.unitPrice || 0)}</span>
      </td>
      <td style="padding: 18px 0 18px 16px; vertical-align: top; text-align: right;">
        <span style="font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 400; color: ${C.text};">${fmt((item?.quantity || 0) * (item?.unitPrice || 0))}</span>
      </td>
    </tr>
    <tr>
      <td colspan="4"><div class="luxe-line"></div></td>
    </tr>
  `;

  const renderTableClose = () => `</tbody></table></section>`;

  const renderTotalCard = () => `
    <section class="flex justify-end no-break" style="margin-bottom: ${gap};">
      <div style="width: 260px;">
        <div class="flex justify-between items-center py-2">
          <span style="font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 300; text-transform: uppercase; letter-spacing: 0.08em; color: ${C.textMuted};">Sous-total HT</span>
          <span style="font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 400; color: ${C.text};">${fmt(subTotal)}</span>
        </div>
        <div style="height: 0.5px; background-color: ${C.border}; margin: 4px 0;"></div>
        <div class="flex justify-between items-center py-2">
          <span style="font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 300; text-transform: uppercase; letter-spacing: 0.08em; color: ${C.textMuted};">TVA (${vatRate}%)</span>
          <span style="font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 300; color: ${C.textMuted};">${fmt(vat)}</span>
        </div>
        ${discount > 0 ? `
        <div style="height: 0.5px; background-color: ${C.border}; margin: 4px 0;"></div>
        <div class="flex justify-between items-center py-2">
          <span style="font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 300; text-transform: uppercase; letter-spacing: 0.08em; color: ${C.textMuted};">Remise</span>
          <span style="font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 400; color: #8b0000;">- ${fmt(discount)}</span>
        </div>` : ""}
        <div class="champagne-liseret" style="margin: 12px 0;"></div>
        <div class="flex justify-between items-center">
          <span class="serif-title" style="font-size: 16px; font-weight: 500; color: ${C.text};">Net à payer</span>
          <span class="serif-title" style="font-size: 28px; font-weight: 600; color: ${C.primary};">${fmt(total)}</span>
        </div>
        <p style="font-family: 'Inter', sans-serif; font-size: 8px; font-weight: 300; letter-spacing: 0.06em; text-align: right; margin-top: 4px; color: ${C.textMuted};">${currency}</p>
      </div>
    </section>
  `;

  const renderFooter = () => `
    <footer style="padding: 0 ${px} ${SP.paddingY}px ${px};">
      <div class="champagne-liseret" style="margin-bottom: 16px;"></div>
      <p style="font-family: 'Inter', sans-serif; font-size: 8px; font-weight: 300; text-align: center; letter-spacing: 0.06em; color: ${C.textMuted};">
        ${quoteInfo?.terms || `Paiement à réception. Validité : ${validityDays} jours.`}
      </p>
      <p class="serif-title" style="font-size: 11px; font-weight: 400; font-style: italic; text-align: center; margin-top: 10px; color: ${C.primary};">
        Avec nos sincères remerciements
      </p>
      <p style="font-family: 'Inter', sans-serif; font-size: 7px; font-weight: 300; text-align: center; margin-top: 16px; color: ${C.textMuted};">
        Généré le ${new Date().toLocaleDateString("fr-FR")}
      </p>
    </footer>
  `;

  const renderMiniHeader = (pageNum: number) => `
    <div class="champagne-liseret"></div>
    <header class="text-center" style="padding: 24px ${px} 0 ${px};">
      <p style="font-family: 'Inter', sans-serif; font-size: 8px; font-weight: 300; text-transform: uppercase; letter-spacing: 0.12em; color: ${C.textMuted};">
        Devis N° ${quoteInfo?.number || "---"} — Suite
      </p>
      <p style="font-family: 'Inter', sans-serif; font-size: 8px; font-weight: 300; color: ${C.primary}; margin-top: 6px;">
        — ${pageNum} / ${totalPages} —
      </p>
      <div style="margin: 16px auto 0 auto; width: 40px;" class="champagne-liseret"></div>
    </header>
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
          <div id="quote-page-${pageNum}" class="w-[210mm] mx-auto relative shadow-none" style="min-height: 297mm; background-color: ${C.background};">
            ${renderStyles()}
            ${renderHeader()}
            ${renderClientBlock()}
            ${renderTableHeader()}
            ${batch.map((item: any, i: number) => renderRow(item, i)).join("")}
            ${renderTableClose()}
            <div style="padding: 0 ${px};">
              ${renderTotalCard()}
            </div>
            ${renderFooter()}
          </div>
        `;
      }

      if (isFirst) {
        return `
          <div id="quote-page-${pageNum}" ${pageBreakAttr} class="w-[210mm] mx-auto relative shadow-none" style="min-height: 297mm; background-color: ${C.background};">
            ${renderStyles()}
            ${renderHeader()}
            ${renderClientBlock()}
            ${renderTableHeader()}
            ${batch.map((item: any, i: number) => renderRow(item, i)).join("")}
            ${renderTableClose()}
          </div>
        `;
      }

      if (isLast) {
        return `
          <div id="quote-page-${pageNum}" class="w-[210mm] mx-auto relative shadow-none" style="min-height: 297mm; background-color: ${C.background};">
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
        <div id="quote-page-${pageNum}" ${pageBreakAttr} class="w-[210mm] mx-auto relative shadow-none" style="min-height: 297mm; background-color: ${C.background};">
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