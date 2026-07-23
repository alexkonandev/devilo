// ═══════════════════════════════════════════════════════════════════════════════
// RENDERER : Vintage Elegance
// Classique européen — Playfair Display, double filet, ornements
// Cible : professions libérales, artisans haut de gamme, métiers d'art
// Avec pagination multi-pages A4
// ═══════════════════════════════════════════════════════════════════════════════

import { TemplateDefinition, EditorActiveQuote } from "@/types/editor";
import { splitItemsIntoPages, type TemplatePageHeights } from "./pagination-utils";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0 }).format(n);

const PAGE_LAYOUT: TemplatePageHeights = {
  pageContentHeight: 1050,
  headerHeight: 130,
  clientBlockHeight: 130,
  tableHeaderHeight: 36,
  rowHeight: 56,
  totalCardHeight: 200,
  footerHeight: 70,
};

export function renderVintageElegance(
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

  // ── Templates HTML ──

  const renderStyles = () => `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;0,900;1,400&family=Inter:wght@400;500;700&display=swap');
      [id^="quote-page-"] * {
        font-family: '${template.typography.fontFamily}', serif !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      @page { size: A4; margin: 0; }
      .no-break { page-break-inside: avoid; break-inside: avoid; }
      .page-break-after-always { page-break-after: always; break-after: page; }
      .ornament { font-family: 'Playfair Display', serif; color: ${C.primary}; letter-spacing: 0.15em; }
      .vintage-card {
        background-color: ${C.surface};
        border: 2px solid ${C.border};
        padding: 16px 20px;
      }
      .double-line {
        height: 3px;
        background: ${C.primary};
        position: relative;
        margin: 0;
      }
      .double-line::after {
        content: "";
        position: absolute;
        top: 6px;
        left: 0;
        right: 0;
        height: 1px;
        background: ${C.accent};
      }
      .total-border {
        border: 2px solid ${C.primary};
        border-radius: 2px;
        padding: 16px 20px;
        background-color: ${C.surface};
      }
    </style>
  `;

  const renderHeader = () => `
    <header class="text-center" style="padding: ${SP.paddingY}px ${px} 0 ${px}; background-color: ${C.background};">
      <div class="ornament" style="font-size: 14px; font-weight: 400;">✦ ✦ ✦</div>
      <h1 class="text-[26px] font-black tracking-wide leading-none mt-3" style="color: ${C.text}; font-family: 'Playfair Display', serif;">
        ${company?.name || "Entreprise"}
      </h1>
      <p class="text-[10px] font-medium mt-2" style="color: ${C.textMuted}; font-family: 'Inter', sans-serif;">
        ${company?.address || ""}
      </p>
      <p class="text-[10px] font-medium" style="color: ${C.primary}; font-family: 'Inter', sans-serif;">
        ${company?.email || ""}
      </p>
      <div class="double-line" style="margin-top: ${gap}; width: 100%;"></div>
      <p class="text-[12px] font-bold uppercase tracking-[0.15em] mt-3" style="color: ${C.primary}; font-family: 'Inter', sans-serif;">
        Devis N° ${quoteInfo?.number || "---"}
      </p>
    </header>
  `;

  const renderClientBlock = () => `
    <section class="vintage-card no-break" style="margin-bottom: ${gap};">
      <div class="flex justify-between items-start">
        <div>
          <p class="text-[8px] font-mono uppercase tracking-widest font-bold mb-1" style="color: ${C.textMuted}; font-family: 'Inter', sans-serif;">Client</p>
          <p class="text-[16px] font-bold tracking-tight italic" style="color: ${C.text}; font-family: 'Playfair Display', serif;">
            ${client?.name || "Client"}
          </p>
          <p class="text-[10px] font-medium mt-1 leading-relaxed" style="color: ${C.textMuted}; font-family: 'Inter', sans-serif;">
            ${client?.address || ""}
          </p>
          ${client?.email ? `<p class="text-[10px] font-medium" style="color: ${C.textMuted}; font-family: 'Inter', sans-serif;">${client.email}</p>` : ""}
          ${client?.phone ? `<p class="text-[10px] font-medium" style="color: ${C.textMuted}; font-family: 'Inter', sans-serif;">${client.phone}</p>` : ""}
        </div>
        <div class="text-right">
          <div class="mb-2">
            <p class="text-[8px] font-mono uppercase tracking-widest font-bold mb-0.5" style="color: ${C.textMuted}; font-family: 'Inter', sans-serif;">Émis le</p>
            <p class="text-[11px] font-mono font-bold" style="color: ${C.text}; font-family: 'Inter', sans-serif;">${quoteInfo?.issueDate || "---"}</p>
          </div>
          ${dueDate ? `
          <div class="mb-2">
            <p class="text-[8px] font-mono uppercase tracking-widest font-bold mb-0.5" style="color: ${C.textMuted}; font-family: 'Inter', sans-serif;">Échéance</p>
            <p class="text-[11px] font-mono font-bold" style="color: ${C.text}; font-family: 'Inter', sans-serif;">${dueDate}</p>
          </div>` : ""}
          <div>
            <p class="text-[8px] font-mono uppercase tracking-widest font-bold mb-0.5" style="color: ${C.textMuted}; font-family: 'Inter', sans-serif;">Validité</p>
            <p class="text-[11px] font-mono font-bold" style="color: ${C.text}; font-family: 'Inter', sans-serif;">${validityDays} jours</p>
          </div>
        </div>
      </div>
    </section>
  `;

  const renderTableHeader = () => `
    <section class="no-break" style="margin-bottom: ${gap};">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr style="border-bottom: 2px solid ${C.primary}; border-top: 2px solid ${C.primary};">
            <th style="padding: 12px 12px; text-align: left; font-size: 9px; font-family: 'Inter', sans-serif; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: ${C.text};">
              Désignation
            </th>
            <th style="padding: 12px 8px; text-align: center; font-size: 9px; font-family: 'Inter', sans-serif; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: ${C.text}; width: 60px;">
              Qté
            </th>
            <th style="padding: 12px 8px; text-align: right; font-size: 9px; font-family: 'Inter', sans-serif; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: ${C.text}; width: 100px;">
              P.U HT
            </th>
            <th style="padding: 12px 12px; text-align: right; font-size: 9px; font-family: 'Inter', sans-serif; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: ${C.text}; width: 120px;">
              Total HT
            </th>
          </tr>
        </thead>
        <tbody>
  `;

  const renderRow = (item: any, i: number) => `
    <tr class="no-break" style="border-bottom: 1px solid ${C.border};">
      <td style="padding: 14px 12px; vertical-align: top;">
        <p style="font-size: 12px; font-weight: 700; color: ${C.text}; margin: 0; font-family: 'Playfair Display', serif;">${item?.title || ""}</p>
        <p style="font-size: 10px; font-weight: 400; color: ${C.textMuted}; margin-top: 2px; max-width: 380px; font-family: 'Inter', sans-serif; font-style: italic;">
          ${item?.subtitle || ""}
        </p>
      </td>
      <td style="padding: 14px 8px; vertical-align: top; text-align: center;">
        <span style="font-size: 11px; font-family: 'Inter', sans-serif; font-weight: 700; color: ${C.text};">${item?.quantity || 0}</span>
      </td>
      <td style="padding: 14px 8px; vertical-align: top; text-align: right;">
        <span style="font-size: 11px; font-family: 'Inter', sans-serif; font-weight: 500; color: ${C.textMuted};">${fmt(item?.unitPrice || 0)}</span>
      </td>
      <td style="padding: 14px 12px; vertical-align: top; text-align: right;">
        <span style="font-size: 12px; font-family: 'Inter', sans-serif; font-weight: 700; color: ${C.text};">${fmt((item?.quantity || 0) * (item?.unitPrice || 0))}</span>
      </td>
    </tr>
  `;

  const renderTableClose = () => `</tbody></table></section>`;

  const renderTotalCard = () => `
    <section class="flex justify-end no-break" style="margin-bottom: ${gap};">
      <div class="total-border" style="width: 280px;">
        <div class="flex justify-between items-center py-1.5">
          <span class="text-[10px] font-bold uppercase tracking-wider" style="color: ${C.textMuted}; font-family: 'Inter', sans-serif;">Sous-total HT</span>
          <span class="text-[13px] font-mono font-bold" style="color: ${C.text}; font-family: 'Inter', sans-serif;">${fmt(subTotal)}</span>
        </div>
        <div class="flex justify-between items-center py-1.5" style="border-top: 1px solid ${C.border};">
          <span class="text-[10px] font-bold uppercase tracking-wider" style="color: ${C.textMuted}; font-family: 'Inter', sans-serif;">TVA (${vatRate}%)</span>
          <span class="text-[13px] font-mono" style="color: ${C.textMuted}; font-family: 'Inter', sans-serif;">${fmt(vat)}</span>
        </div>
        ${discount > 0 ? `
        <div class="flex justify-between items-center py-1.5" style="border-top: 1px solid ${C.border};">
          <span class="text-[10px] font-bold uppercase tracking-wider" style="color: ${C.textMuted}; font-family: 'Inter', sans-serif;">Remise</span>
          <span class="text-[13px] font-mono font-bold" style="color: #b91c1c; font-family: 'Inter', sans-serif;">- ${fmt(discount)}</span>
        </div>` : ""}
        <div style="margin-top: 10px; padding-top: 10px; border-top: 2px solid ${C.primary};">
          <div class="flex justify-between items-center">
            <span class="text-[12px] font-black uppercase tracking-wider" style="color: ${C.text}; font-family: 'Inter', sans-serif;">Net à payer</span>
            <span class="text-[26px] font-black tracking-tight" style="color: ${C.primary}; font-family: 'Playfair Display', serif;">${fmt(total)}</span>
          </div>
          <p class="text-[9px] font-mono font-semibold text-right mt-1 italic" style="color: ${C.textMuted}; font-family: 'Inter', sans-serif;">${currency}</p>
        </div>
      </div>
    </section>
  `;

  const renderFooter = () => `
    <footer style="padding: 0 ${px} ${SP.paddingY}px ${px};">
      <div class="double-line" style="width: 100%; margin-bottom: 10px;"></div>
      <div class="flex justify-between items-start" style="padding-top: 8px;">
        <div>
          <p class="text-[8px] font-mono uppercase tracking-wider" style="color: ${C.textMuted}; font-family: 'Inter', sans-serif;">
            ${quoteInfo?.terms || `Paiement à réception. Validité : ${validityDays} jours.`}
          </p>
          <p class="text-[7px] font-mono mt-1 italic" style="color: ${C.textMuted}; font-family: 'Inter', sans-serif;">
            Généré le ${new Date().toLocaleDateString("fr-FR")} — Document confidentiel
          </p>
        </div>
        <div class="text-right">
          <div class="ornament" style="font-size: 11px;">✦</div>
          <p class="text-[7px] font-mono font-bold uppercase tracking-widest mt-1" style="color: ${C.textMuted}; font-family: 'Inter', sans-serif;">
            ${company?.name || ""}
          </p>
        </div>
      </div>
    </footer>
  `;

  const renderMiniHeader = (pageNum: number) => `
    <header class="text-center" style="padding: ${SP.paddingY}px ${px} 0 ${px}; background-color: ${C.background};">
      <div class="ornament" style="font-size: 12px;">✦</div>
      <p class="text-[11px] font-bold uppercase tracking-[0.12em] mt-2" style="color: ${C.primary}; font-family: 'Inter', sans-serif;">
        Devis N° ${quoteInfo?.number || "---"} — Suite
      </p>
      <p class="text-[9px] font-mono font-bold mt-1" style="color: ${C.textMuted}; font-family: 'Inter', sans-serif;">
        Page ${pageNum} / ${totalPages}
      </p>
      <div class="double-line" style="margin-top: 12px; width: 100%;"></div>
    </header>
  `;

  // ── Assemblage ──

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
          <div id="quote-page-${pageNum}" ${pageBreakAttr} class="w-[210mm] mx-auto relative shadow-none" style="min-height: 297mm; background-color: ${C.background};">
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