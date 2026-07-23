// ═══════════════════════════════════════════════════════════════════════════════
// RENDERER : Nordic Clean
// Design scandinave — léger, aéré, mini-cartes individuelles pour les prestations
// Cible : designers, architectes, photographes, agences créatives
// Avec pagination multi-pages A4
// ═══════════════════════════════════════════════════════════════════════════════

import { TemplateDefinition, EditorActiveQuote } from "@/types/editor";
import { splitItemsIntoPages, type TemplatePageHeights } from "./pagination-utils";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0 }).format(n);

const PAGE_LAYOUT: TemplatePageHeights = {
  pageContentHeight: 1050,
  headerHeight: 140,    // header centré avec cercle + underline
  clientBlockHeight: 100,
  tableHeaderHeight: 24,
  rowHeight: 80,        // mini-cartes avec margin 8px
  totalCardHeight: 190,
  footerHeight: 70,
};

export function renderNordicClean(
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
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700&display=swap');
      [id^="quote-page-"] * {
        font-family: '${template.typography.fontFamily}', sans-serif !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      @page { size: A4; margin: 0; }
      .no-break { page-break-inside: avoid; break-inside: avoid; }
      .page-break-after-always { page-break-after: always; break-after: page; }
      .mini-card { background-color: ${C.surface}; border: 1px solid ${C.border}; border-radius: 8px; padding: 12px 16px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03); }
      .total-card { background-color: #ffffff; border: 1px solid ${C.border}; border-radius: 8px; padding: 20px 24px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); }
      .brand-circle { width: 10px; height: 10px; border: 1.5px solid ${C.primary}; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
      .brand-circle-inner { width: 4px; height: 4px; background-color: ${C.primary}; border-radius: 50%; }
      .header-underline { width: 60px; height: 1.5px; background-color: ${C.primary}; margin: 6px auto 0 auto; }
    </style>
  `;

  const renderHeader = () => `
    <header class="flex flex-col items-center text-center" style="padding: ${SP.paddingY}px ${px} 0 ${px};">
      <div class="brand-circle"><div class="brand-circle-inner"></div></div>
      <h1 class="text-[22px] font-light tracking-tight leading-none mt-2" style="color: ${C.text}; font-weight: 300;">${company?.name || "Entreprise"}</h1>
      <div class="header-underline"></div>
      <div class="flex items-center justify-center gap-2 mt-3">
        <span class="text-[9px] font-normal tracking-wide" style="color: ${C.textMuted}">DEVIS</span>
        <span class="text-[9px] font-mono font-normal" style="color: ${C.primary}"># ${quoteInfo?.number || "---"}</span>
      </div>
      <p class="text-[9px] font-light mt-2" style="color: ${C.textMuted}; font-weight: 300;">${company?.address || ""}</p>
      <p class="text-[9px] font-light" style="color: ${C.primary}; font-weight: 300;">${company?.email || ""}</p>
    </header>
  `;

  const renderClientBlock = () => `
    <section class="flex justify-between items-start no-break" style="padding-bottom: ${gap}; margin-bottom: ${gap}; border-bottom: 1px solid ${C.border};">
      <div>
        <p class="text-[8px] font-normal uppercase tracking-widest mb-1" style="color: ${C.textMuted}; font-weight: 300;">Client</p>
        <p class="text-[13px] font-medium tracking-tight" style="color: ${C.text}; font-weight: 400;">${client?.name || "Client"}</p>
        <p class="text-[9px] font-light mt-1 leading-relaxed" style="color: ${C.textMuted}; font-weight: 300;">${client?.address || ""}</p>
        ${client?.email ? `<p class="text-[9px] font-light" style="color: ${C.textMuted}; font-weight: 300;">${client.email}</p>` : ""}
        ${client?.phone ? `<p class="text-[9px] font-light" style="color: ${C.textMuted}; font-weight: 300;">${client.phone}</p>` : ""}
      </div>
      <div class="text-right">
        <div class="mb-2"><p class="text-[8px] font-normal uppercase tracking-widest mb-0.5" style="color: ${C.textMuted}; font-weight: 300;">Émis le</p><p class="text-[10px] font-mono font-normal" style="color: ${C.text};">${quoteInfo?.issueDate || "---"}</p></div>
        ${dueDate ? `<div class="mb-2"><p class="text-[8px] font-normal uppercase tracking-widest mb-0.5" style="color: ${C.textMuted}; font-weight: 300;">Échéance</p><p class="text-[10px] font-mono font-normal" style="color: ${C.text};">${dueDate}</p></div>` : ""}
        <div><p class="text-[8px] font-normal uppercase tracking-widest mb-0.5" style="color: ${C.textMuted}; font-weight: 300;">Validité</p><p class="text-[10px] font-mono font-normal" style="color: ${C.text};">${validityDays} jours</p></div>
      </div>
    </section>
  `;

  const renderTableHeader = () => `
    <section class="no-break" style="margin-bottom: ${gap};">
      <div class="flex items-center gap-4 px-1 mb-2">
        <div style="flex: 2;"><span style="font-size: 8px; font-weight: 300; font-family: monospace; text-transform: uppercase; letter-spacing: 0.1em; color: ${C.primary};">Désignation</span></div>
        <div style="width: 50px; text-align: center;"><span style="font-size: 8px; font-weight: 300; font-family: monospace; text-transform: uppercase; letter-spacing: 0.1em; color: ${C.primary};">Qté</span></div>
        <div style="width: 90px; text-align: right;"><span style="font-size: 8px; font-weight: 300; font-family: monospace; text-transform: uppercase; letter-spacing: 0.1em; color: ${C.primary};">P.U HT</span></div>
        <div style="width: 100px; text-align: right;"><span style="font-size: 8px; font-weight: 300; font-family: monospace; text-transform: uppercase; letter-spacing: 0.1em; color: ${C.primary};">Total HT</span></div>
      </div>
  `;

  const renderRow = (item: any) => `
    <div class="mini-card" style="margin-bottom: 8px;">
      <div class="flex items-center gap-4">
        <div style="flex: 2;"><p style="font-size: 11px; font-weight: 400; color: ${C.text}; margin: 0;">${item?.title || ""}</p><p style="font-size: 9px; font-weight: 300; color: ${C.textMuted}; margin-top: 2px; max-width: 380px;">${item?.subtitle || ""}</p></div>
        <div style="width: 50px; text-align: center;"><span style="font-size: 10px; font-family: monospace; font-weight: 400; color: ${C.text};">${item?.quantity || 0}</span></div>
        <div style="width: 90px; text-align: right;"><span style="font-size: 10px; font-family: monospace; font-weight: 300; color: ${C.textMuted};">${fmt(item?.unitPrice || 0)}</span></div>
        <div style="width: 100px; text-align: right;"><span style="font-size: 11px; font-family: monospace; font-weight: 400; color: ${C.text};">${fmt((item?.quantity || 0) * (item?.unitPrice || 0))}</span></div>
      </div>
    </div>
  `;

  const renderTableClose = () => `</section>`;

  const renderTotalCard = () => `
    <section class="flex justify-end no-break" style="margin-bottom: ${gap};">
      <div class="total-card" style="width: 280px;">
        <div class="flex justify-between items-center py-1.5"><span class="text-[9px] font-light uppercase tracking-wider" style="color: ${C.textMuted};">Sous-total HT</span><span class="text-[12px] font-mono font-normal" style="color: ${C.text};">${fmt(subTotal)}</span></div>
        <div class="flex justify-between items-center py-1.5" style="border-top: 1px solid ${C.border};"><span class="text-[9px] font-light uppercase tracking-wider" style="color: ${C.textMuted};">TVA (${vatRate}%)</span><span class="text-[12px] font-mono font-light" style="color: ${C.textMuted};">${fmt(vat)}</span></div>
        ${discount > 0 ? `<div class="flex justify-between items-center py-1.5" style="border-top: 1px solid ${C.border};"><span class="text-[9px] font-light uppercase tracking-wider" style="color: ${C.textMuted};">Remise</span><span class="text-[12px] font-mono font-normal" style="color: #dc2626;">- ${fmt(discount)}</span></div>` : ""}
        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid ${C.primary};">
          <div class="flex justify-between items-center"><span class="text-[10px] font-light uppercase tracking-wider" style="color: ${C.text};">Net à payer</span><span class="text-[24px] font-light font-mono tracking-tight" style="color: ${C.primary};">${fmt(total)}</span></div>
          <p class="text-[8px] font-mono font-light text-right mt-0.5" style="color: ${C.textMuted};">${currency}</p>
        </div>
      </div>
    </section>
  `;

  const renderFooter = () => `
    <footer class="text-center" style="padding: 0 ${px} ${SP.paddingY}px ${px};">
      <div style="border-top: 1px solid ${C.border}; padding-top: 10px;">
        <p class="text-[7px] font-light tracking-wider" style="color: ${C.textMuted};">${quoteInfo?.terms || `Paiement à réception. Validité : ${validityDays} jours.`}</p>
        <div class="flex justify-center gap-4 mt-1.5">
          ${company?.email ? `<span class="text-[7px] font-light" style="color: ${C.textMuted};">${company.email}</span>` : ""}
          ${company?.address ? `<span class="text-[7px] font-light" style="color: ${C.textMuted};">${company.address}</span>` : ""}
        </div>
        <p class="text-[6px] font-light mt-1" style="color: ${C.textMuted};">Généré le ${new Date().toLocaleDateString("fr-FR")}</p>
      </div>
    </footer>
  `;

  const renderMiniHeader = (pageNum: number) => `
    <header class="flex flex-col items-center text-center" style="padding: 20px ${px} 0 ${px};">
      <div class="brand-circle"><div class="brand-circle-inner"></div></div>
      <div class="flex items-center justify-center gap-2 mt-2">
        <span class="text-[9px] font-mono font-normal" style="color: ${C.primary}"># ${quoteInfo?.number || "---"} — Suite</span>
        <span class="text-[9px] font-mono font-normal" style="color: ${C.textMuted}">Page ${pageNum} / ${totalPages}</span>
      </div>
    </header>
  `;

  const pagesHtml = pages
    .map((batch: any[], pageIndex: number) => {
      const isFirst = pageIndex === 0;
      const isLast = pageIndex === totalPages - 1;
      const pageNum = pageIndex + 1;
      const pageBreakAttr = isLast ? "" : 'class="page-break-after-always"';

      if (totalPages === 1) {
        return `<div id="quote-page-${pageNum}" class="w-[210mm] mx-auto bg-white relative shadow-none" style="min-height: 297mm; background-color: ${C.background};">${renderStyles()}${renderHeader()}<div style="padding: ${gap} ${px} 0 ${px};">${renderClientBlock()}${renderTableHeader()}${batch.map((item: any) => renderRow(item)).join("")}${renderTableClose()}${renderTotalCard()}</div>${renderFooter()}</div>`;
      }
      if (isFirst) {
        return `<div id="quote-page-${pageNum}" ${pageBreakAttr} class="w-[210mm] mx-auto bg-white relative shadow-none" style="min-height: 297mm; background-color: ${C.background};">${renderStyles()}${renderHeader()}<div style="padding: ${gap} ${px} 0 ${px};">${renderClientBlock()}${renderTableHeader()}${batch.map((item: any) => renderRow(item)).join("")}${renderTableClose()}</div></div>`;
      }
      if (isLast) {
        return `<div id="quote-page-${pageNum}" class="w-[210mm] mx-auto bg-white relative shadow-none" style="min-height: 297mm; background-color: ${C.background};">${renderStyles()}${renderMiniHeader(pageNum)}<div style="padding: ${gap} ${px} 0 ${px};">${renderTableHeader()}${batch.map((item: any) => renderRow(item)).join("")}${renderTableClose()}${renderTotalCard()}</div>${renderFooter()}</div>`;
      }
      return `<div id="quote-page-${pageNum}" ${pageBreakAttr} class="w-[210mm] mx-auto bg-white relative shadow-none" style="min-height: 297mm; background-color: ${C.background};">${renderStyles()}${renderMiniHeader(pageNum)}<div style="padding: ${gap} ${px} 0 ${px};">${renderTableHeader()}${batch.map((item: any) => renderRow(item)).join("")}${renderTableClose()}</div></div>`;
    })
    .join("\n");

  return pagesHtml;
}