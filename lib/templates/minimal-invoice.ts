// ═══════════════════════════════════════════════════════════════════════════════
// RENDERER : Minimal Invoice
// Layout ultra-épuré : header compact, pas de cartes, lignes fines, total intégré
// Avec pagination multi-pages A4
// ═══════════════════════════════════════════════════════════════════════════════

import { TemplateDefinition, EditorActiveQuote } from "@/types/editor";
import { splitItemsIntoPages, type TemplatePageHeights } from "./pagination-utils";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0 }).format(n);

const PAGE_LAYOUT: TemplatePageHeights = {
  pageContentHeight: 1050,
  headerHeight: 110,       // header + <hr> + gap ≈ 110px
  clientBlockHeight: 120,  // bloc client + <hr> séparateur ≈ 120px
  tableHeaderHeight: 28,
  rowHeight: 48,
  totalCardHeight: 180,
  footerHeight: 45,
};

export function renderMinimalInvoice(
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
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
      [id^="quote-page-"] * {
        font-family: '${template.typography.fontFamily}', sans-serif !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      @page { size: A4; margin: 0; }
      .no-break { page-break-inside: avoid; break-inside: avoid; }
      .page-break-after-always { page-break-after: always; break-after: page; }
    </style>
  `;

  const renderHeader = () => `
    <header class="flex justify-between items-start" style="padding: ${px} ${px} 0 ${px};">
      <div>
        <h1 class="text-[22px] font-black tracking-tighter leading-none" style="color: ${C.text}">
          ${company?.name || "Entreprise"}
        </h1>
        <p class="text-[9px] mt-1 font-medium" style="color: ${C.textMuted}">
          ${company?.address || ""}
        </p>
        <p class="text-[9px] font-medium" style="color: ${C.primary}">
          ${company?.email || ""}
        </p>
      </div>
      <div class="text-right">
        <span class="inline-block text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 border-2 rounded-sm" style="color: ${C.primary}; border-color: ${C.primary}">
          DEVIS
        </span>
        <p class="text-[11px] font-mono font-bold mt-1" style="color: ${C.text}">
          # ${quoteInfo?.number || "---"}
        </p>
      </div>
    </header>
    <hr style="margin: ${gap} ${px} 0 ${px}; border: none; border-top: 1px solid ${C.border}" />
  `;

  const renderClientBlock = () => `
    <section class="flex justify-between items-start no-break" style="margin-bottom: ${gap};">
      <div class="flex-1">
        <p class="text-[7px] font-mono uppercase tracking-wider font-bold" style="color: ${C.textMuted}">Facturé à</p>
        <p class="text-[13px] font-black uppercase mt-1" style="color: ${C.text}">${client?.name || "Client"}</p>
        <p class="text-[9px] font-medium mt-0.5" style="color: ${C.textMuted}">${client?.address || ""}</p>
        ${client?.email ? `<p class="text-[9px] font-medium" style="color: ${C.textMuted}">${client.email}</p>` : ""}
        ${client?.phone ? `<p class="text-[9px] font-medium" style="color: ${C.textMuted}">${client.phone}</p>` : ""}
      </div>
      <div class="text-right pl-8">
        <div class="mb-2">
          <p class="text-[7px] font-mono uppercase tracking-wider font-bold" style="color: ${C.textMuted}">Émis le</p>
          <p class="text-[10px] font-mono font-bold mt-0.5" style="color: ${C.text}">${quoteInfo?.issueDate || "---"}</p>
        </div>
        ${dueDate ? `
        <div class="mb-2">
          <p class="text-[7px] font-mono uppercase tracking-wider font-bold" style="color: ${C.textMuted}">Échéance</p>
          <p class="text-[10px] font-mono font-bold mt-0.5" style="color: ${C.text}">${dueDate}</p>
        </div>` : ""}
        <div>
          <p class="text-[7px] font-mono uppercase tracking-wider font-bold" style="color: ${C.textMuted}">Validité</p>
          <p class="text-[10px] font-mono font-bold mt-0.5" style="color: ${C.text}">${validityDays} jours</p>
        </div>
      </div>
    </section>
    <hr style="margin-bottom: ${gap}; border: none; border-top: 1px solid ${C.border}" />
  `;

  const renderTableHeader = () => `
    <section class="no-break" style="margin-bottom: ${gap};">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr>
            <th class="pb-2 pr-4 text-[7px] font-mono uppercase tracking-widest font-bold" style="color: ${C.textMuted}">Désignation</th>
            <th class="pb-2 px-2 text-[7px] font-mono uppercase tracking-widest font-bold text-center w-16" style="color: ${C.textMuted}">Qté</th>
            <th class="pb-2 px-3 text-[7px] font-mono uppercase tracking-widest font-bold text-right w-28" style="color: ${C.textMuted}">P.U HT</th>
            <th class="pb-2 pl-3 text-[7px] font-mono uppercase tracking-widest font-bold text-right w-32" style="color: ${C.textMuted}">Total HT</th>
          </tr>
        </thead>
        <tbody>
  `;

  const renderRow = (item: any, i: number, batchLength: number, isLast: boolean) => `
    <tr class="no-break" ${(i < batchLength - 1 || !isLast) ? `style="border-bottom: 1px solid ${C.border}"` : ""}>
      <td class="py-3 pr-4 align-top">
        <p class="text-[11px] font-bold" style="color: ${C.text}">${item?.title || ""}</p>
        <p class="text-[9px] font-medium mt-0.5 max-w-[400px]" style="color: ${C.textMuted}">${item?.subtitle || ""}</p>
      </td>
      <td class="py-3 px-2 align-top text-center text-[10px] font-mono font-bold" style="color: ${C.text}">
        ${item?.quantity || 0}
      </td>
      <td class="py-3 px-3 align-top text-right text-[10px] font-mono" style="color: ${C.textMuted}">
        ${fmt(item?.unitPrice || 0)}
      </td>
      <td class="py-3 pl-3 align-top text-right text-[11px] font-mono font-bold" style="color: ${C.text}">
        ${fmt((item?.quantity || 0) * (item?.unitPrice || 0))}
      </td>
    </tr>
  `;

  const renderTableClose = () => `
        </tbody>
      </table>
    </section>
  `;

  const renderTotalCard = () => `
    <section class="flex justify-end no-break" style="margin-bottom: ${gap};">
      <div style="width: 250px;">
        <div class="flex justify-between items-center py-1.5">
          <span class="text-[9px] font-bold uppercase tracking-wider" style="color: ${C.textMuted}">Sous-total HT</span>
          <span class="text-[11px] font-mono font-bold" style="color: ${C.text}">${fmt(subTotal)}</span>
        </div>
        <div class="flex justify-between items-center py-1.5">
          <span class="text-[9px] font-bold uppercase tracking-wider" style="color: ${C.textMuted}">TVA (${vatRate}%)</span>
          <span class="text-[11px] font-mono" style="color: ${C.textMuted}">${fmt(vat)}</span>
        </div>
        ${discount > 0 ? `
        <div class="flex justify-between items-center py-1.5">
          <span class="text-[9px] font-bold uppercase tracking-wider" style="color: ${C.textMuted}">Remise</span>
          <span class="text-[11px] font-mono" style="color: #ef4444">- ${fmt(discount)}</span>
        </div>` : ""}
        <div class="mt-3 pt-3" style="border-top: 2px solid ${C.text}">
          <div class="flex justify-between items-center">
            <span class="text-[12px] font-black uppercase tracking-wider" style="color: ${C.text}">Net à payer</span>
            <span class="text-[22px] font-black font-mono tracking-tighter" style="color: ${C.text}">${fmt(total)}</span>
          </div>
          <p class="text-[7px] font-mono uppercase tracking-wider text-right mt-0.5" style="color: ${C.textMuted}">${currency}</p>
        </div>
      </div>
    </section>
  `;

  const renderFooter = () => `
    <footer style="padding: 0 ${px} ${SP.paddingY}px ${px};">
      <hr style="margin-bottom: 8px; border: none; border-top: 1px solid ${C.border}" />
      <p class="text-[7px] font-mono uppercase tracking-wider text-center" style="color: ${C.textMuted}">
        ${quoteInfo?.terms || `Paiement à réception. Validité : ${validityDays} jours.`}
      </p>
      <p class="text-[6px] font-mono text-center mt-1" style="color: ${C.textMuted}">
        Généré le ${new Date().toLocaleDateString("fr-FR")}
      </p>
    </footer>
  `;

  const renderMiniHeader = (pageNum: number) => `
    <header class="flex justify-between items-start" style="padding: ${SP.paddingY}px ${px} 0 ${px};">
      <div>
        <span class="inline-block text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 border-2 rounded-sm" style="color: ${C.primary}; border-color: ${C.primary}">
          DEVIS
        </span>
        <p class="text-[11px] font-mono font-bold mt-1" style="color: ${C.text}">
          # ${quoteInfo?.number || "---"} — Suite
        </p>
      </div>
      <div class="text-right">
        <p class="text-[9px] font-mono font-bold" style="color: ${C.primary};">Page ${pageNum} / ${totalPages}</p>
      </div>
    </header>
    <hr style="margin: ${gap} ${px} 0 ${px}; border: none; border-top: 1px solid ${C.border}" />
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
          <div id="quote-page-${pageNum}" class="w-[210mm] mx-auto bg-white text-slate-800 relative shadow-none" style="min-height: 297mm; background-color: ${C.background};">
            ${renderStyles()}
            ${renderHeader()}
            <div style="padding: ${gap} ${px} 0 ${px};">
              ${renderClientBlock()}
              ${renderTableHeader()}
              ${batch.map((item: any, i: number) => renderRow(item, i, batch.length, isLast)).join("")}
              ${renderTableClose()}
              ${renderTotalCard()}
            </div>
            ${renderFooter()}
          </div>
        `;
      }

      if (isFirst) {
        return `
          <div id="quote-page-${pageNum}" ${pageBreakAttr} class="w-[210mm] mx-auto bg-white text-slate-800 relative shadow-none" style="min-height: 297mm; background-color: ${C.background};">
            ${renderStyles()}
            ${renderHeader()}
            <div style="padding: ${gap} ${px} 0 ${px};">
              ${renderClientBlock()}
              ${renderTableHeader()}
              ${batch.map((item: any, i: number) => renderRow(item, i, batch.length, isLast)).join("")}
              ${renderTableClose()}
            </div>
          </div>
        `;
      }

      if (isLast) {
        return `
          <div id="quote-page-${pageNum}" class="w-[210mm] mx-auto bg-white text-slate-800 relative shadow-none" style="min-height: 297mm; background-color: ${C.background};">
            ${renderStyles()}
            ${renderMiniHeader(pageNum)}
            <div style="padding: ${gap} ${px} 0 ${px};">
              ${renderTableHeader()}
              ${batch.map((item: any, i: number) => renderRow(item, i, batch.length, isLast)).join("")}
              ${renderTableClose()}
              ${renderTotalCard()}
            </div>
            ${renderFooter()}
          </div>
        `;
      }

      return `
        <div id="quote-page-${pageNum}" ${pageBreakAttr} class="w-[210mm] mx-auto bg-white text-slate-800 relative shadow-none" style="min-height: 297mm; background-color: ${C.background};">
          ${renderStyles()}
          ${renderMiniHeader(pageNum)}
          <div style="padding: ${gap} ${px} 0 ${px};">
            ${renderTableHeader()}
            ${batch.map((item: any, i: number) => renderRow(item, i, batch.length, isLast)).join("")}
            ${renderTableClose()}
          </div>
        </div>
      `;
    })
    .join("\n");

  return pagesHtml;
}