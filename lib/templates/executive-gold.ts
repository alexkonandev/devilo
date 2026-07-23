// ═══════════════════════════════════════════════════════════════════════════════
// RENDERER : Executive Gold
// Standing haut de gamme — doré, cartes crème, double filet décoratif
// Cible : cabinets de conseil, avocats, notaires, experts-comptables
// Avec pagination multi-pages A4
// ═══════════════════════════════════════════════════════════════════════════════

import { TemplateDefinition, EditorActiveQuote } from "@/types/editor";
import { splitItemsIntoPages, type TemplatePageHeights } from "./pagination-utils";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0 }).format(n);

const PAGE_LAYOUT: TemplatePageHeights = {
  pageContentHeight: 1050,
  headerHeight: 110,   // bande dorée 4px + header + filet décoratif
  clientBlockHeight: 150, // carte client avec padding + séparateur "Prestations"
  tableHeaderHeight: 40,
  rowHeight: 68,
  totalCardHeight: 200,
  footerHeight: 100,  // footer avec double filet + signature
};

export function renderExecutiveGold(
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
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
      [id^="quote-page-"] * {
        font-family: '${template.typography.fontFamily}', sans-serif !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      @page { size: A4; margin: 0; }
      .no-break { page-break-inside: avoid; break-inside: avoid; }
      .page-break-after-always { page-break-after: always; break-after: page; }
      .gold-gradient { background: linear-gradient(90deg, #e8dcc8 0%, #b8860b 50%, #e8dcc8 100%); }
      .gold-shadow { box-shadow: 0 4px 12px rgba(184, 134, 11, 0.08); }
      .gold-card-shadow { box-shadow: 0 2px 8px rgba(184, 134, 11, 0.06); }
      .signature-dashed { border-bottom: 1px dashed ${C.border}; height: 40px; width: 200px; }
      .double-footer { border-top: 2px solid ${C.primary}; position: relative; }
      .double-footer::before { content: ""; position: absolute; top: -4px; left: 0; right: 0; height: 1px; background-color: ${C.border}; }
    </style>
  `;

  const renderHeader = () => `
    <div style="background-color: ${C.primary}; height: 4px; width: 100%;"></div>
    <header class="flex justify-between items-start" style="padding: ${SP.paddingY}px ${px} 0 ${px};">
      <div>
        <h1 class="text-[22px] font-black tracking-tighter leading-none" style="color: ${C.text}">${company?.name || "Entreprise"}</h1>
        <p class="text-[9px] mt-1 font-medium" style="color: ${C.textMuted}">${company?.address || ""}</p>
        <p class="text-[9px] font-medium" style="color: ${C.primary}">${company?.email || ""}</p>
      </div>
      <div class="text-right">
        <span class="inline-block text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-sm" style="background-color: ${C.primary}; color: #ffffff;">DEVIS</span>
        <p class="text-[11px] font-mono font-bold mt-1" style="color: ${C.text}"># ${quoteInfo?.number || "---"}</p>
      </div>
    </header>
    <div style="padding: 0 ${px}; margin-top: ${gap};"><div class="gold-gradient" style="height: 2px; width: 100%;"></div></div>
  `;

  const renderClientBlock = () => `
    <section class="flex no-break gold-card-shadow" style="margin-bottom: ${gap}; background-color: ${C.surface}; border: 1px solid ${C.border}; border-radius: 8px; padding: 16px 20px;">
      <div class="flex-1">
        <p class="text-[7px] font-mono uppercase tracking-wider font-bold" style="color: ${C.textMuted}">Client</p>
        <p class="text-[14px] font-black uppercase mt-1" style="color: ${C.text}">${client?.name || "Client"}</p>
        <p class="text-[9px] font-medium mt-0.5" style="color: ${C.textMuted}">${client?.address || ""}</p>
        ${client?.email ? `<p class="text-[9px] font-medium" style="color: ${C.textMuted}">${client.email}</p>` : ""}
        ${client?.phone ? `<p class="text-[9px] font-medium" style="color: ${C.textMuted}">${client.phone}</p>` : ""}
      </div>
      <div class="w-px" style="background-color: ${C.border}; margin: 0 24px;"></div>
      <div class="text-right">
        <div class="mb-2"><p class="text-[7px] font-mono uppercase tracking-wider font-bold" style="color: ${C.textMuted}">Émis le</p><p class="text-[10px] font-mono font-bold mt-0.5" style="color: ${C.text}">${quoteInfo?.issueDate || "---"}</p></div>
        ${dueDate ? `<div class="mb-2"><p class="text-[7px] font-mono uppercase tracking-wider font-bold" style="color: ${C.textMuted}">Échéance</p><p class="text-[10px] font-mono font-bold mt-0.5" style="color: ${C.text}">${dueDate}</p></div>` : ""}
        <div><p class="text-[7px] font-mono uppercase tracking-wider font-bold" style="color: ${C.textMuted}">Validité</p><p class="text-[10px] font-mono font-bold mt-0.5" style="color: ${C.text}">${validityDays} jours</p></div>
        <div class="mt-1"><p class="text-[7px] font-mono uppercase tracking-wider font-bold" style="color: ${C.textMuted}">Réf.</p><p class="text-[10px] font-mono mt-0.5" style="color: ${C.text}">${quoteInfo?.number || "---"}</p></div>
      </div>
    </section>
    <div class="flex items-center gap-3 no-break" style="margin-bottom: ${gap};">
      <div style="flex: 1; height: 1px; background: linear-gradient(90deg, transparent, ${C.primary});"></div>
      <span class="text-[9px] font-mono font-bold uppercase tracking-widest" style="color: ${C.primary};">PRESTATIONS</span>
      <div style="flex: 1; height: 1px; background: linear-gradient(90deg, ${C.primary}, transparent);"></div>
    </div>
  `;

  const renderTableHeader = () => `
    <section class="no-break" style="margin-bottom: ${gap};">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr>
            <th style="background-color: ${C.primary}; color: #ffffff; padding: 10px 12px; text-align: left; font-size: 8px; font-family: monospace; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; border-top-left-radius: 4px;">Désignation</th>
            <th style="background-color: ${C.primary}; color: #ffffff; padding: 10px 8px; text-align: center; font-size: 8px; font-family: monospace; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; width: 60px;">Qté</th>
            <th style="background-color: ${C.primary}; color: #ffffff; padding: 10px 8px; text-align: right; font-size: 8px; font-family: monospace; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; width: 100px;">P.U HT</th>
            <th style="background-color: ${C.primary}; color: #ffffff; padding: 10px 12px; text-align: right; font-size: 8px; font-family: monospace; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; border-top-right-radius: 4px; width: 120px;">Total HT</th>
          </tr>
        </thead>
        <tbody>
  `;

  const renderRow = (item: any, i: number) => `
    <tr class="no-break" style="border-bottom: 1px solid ${C.border}; background-color: ${i % 2 === 0 ? '#ffffff' : C.highlight};">
      <td style="padding: 12px 12px; vertical-align: top;"><p class="text-[11px] font-bold" style="color: ${C.text}">${item?.title || ""}</p><p class="text-[9px] font-medium mt-0.5 max-w-[380px]" style="color: ${C.textMuted}">${item?.subtitle || ""}</p></td>
      <td style="padding: 12px 8px; vertical-align: top; text-align: center;"><span style="font-size: 10px; font-family: monospace; font-weight: 700; color: ${C.text}">${item?.quantity || 0}</span></td>
      <td style="padding: 12px 8px; vertical-align: top; text-align: right;"><span style="font-size: 10px; font-family: monospace; color: ${C.textMuted}">${fmt(item?.unitPrice || 0)}</span></td>
      <td style="padding: 12px 12px; vertical-align: top; text-align: right;"><span style="font-size: 11px; font-family: monospace; font-weight: 700; color: ${C.text}">${fmt((item?.quantity || 0) * (item?.unitPrice || 0))}</span></td>
    </tr>
  `;

  const renderTableClose = () => `</tbody></table></section>`;

  const renderTotalCard = () => `
    <section class="flex justify-end no-break" style="margin-bottom: ${gap};">
      <div style="width: 280px; background-color: ${C.surface}; border: 1px solid ${C.primary}; border-radius: 8px; padding: 16px 20px; box-shadow: 0 4px 12px rgba(184, 134, 11, 0.06);">
        <div class="flex justify-between items-center py-1.5"><span class="text-[9px] font-bold uppercase tracking-wider" style="color: ${C.textMuted}">Sous-total HT</span><span class="text-[12px] font-mono font-bold" style="color: ${C.text}">${fmt(subTotal)}</span></div>
        <div class="flex justify-between items-center py-1.5" style="border-top: 1px solid ${C.border};"><span class="text-[9px] font-bold uppercase tracking-wider" style="color: ${C.textMuted}">TVA (${vatRate}%)</span><span class="text-[12px] font-mono" style="color: ${C.textMuted}">${fmt(vat)}</span></div>
        ${discount > 0 ? `<div class="flex justify-between items-center py-1.5" style="border-top: 1px solid ${C.border};"><span class="text-[9px] font-bold uppercase tracking-wider" style="color: ${C.textMuted}">Remise</span><span class="text-[12px] font-mono font-bold" style="color: #dc2626">- ${fmt(discount)}</span></div>` : ""}
        <div style="margin-top: 8px; padding-top: 8px; border-top: 2px solid ${C.primary};">
          <div class="flex justify-between items-center"><span class="text-[11px] font-black uppercase tracking-wider" style="color: ${C.text}">Net à payer</span><span class="text-[26px] font-black font-mono tracking-tighter" style="color: ${C.primary}">${fmt(total)}</span></div>
          <p class="text-[8px] font-mono font-semibold text-right mt-0.5" style="color: ${C.textMuted}">${currency}</p>
        </div>
      </div>
    </section>
  `;

  const renderFooter = () => `
    <footer style="padding: 0 ${px} ${SP.paddingY}px ${px};">
      <div class="double-footer" style="padding-top: 12px;">
        <div class="flex justify-between items-start mt-2">
          <div class="flex-1">
            <p class="text-[7px] font-mono uppercase tracking-wider" style="color: ${C.textMuted}">${quoteInfo?.terms || `Paiement à réception. Validité : ${validityDays} jours.`}</p>
            <p class="text-[6px] font-mono mt-1" style="color: ${C.textMuted}">Généré le ${new Date().toLocaleDateString("fr-FR")}</p>
          </div>
          <div class="text-right">
            <p class="text-[7px] font-mono uppercase tracking-wider font-bold" style="color: ${C.textMuted}">Cachet et signature</p>
            <div class="signature-dashed inline-block mt-1"></div>
          </div>
        </div>
      </div>
    </footer>
  `;

  const renderMiniHeader = (pageNum: number) => `
    <div style="background-color: ${C.primary}; height: 4px; width: 100%;"></div>
    <header class="flex justify-between items-start" style="padding: ${SP.paddingY}px ${px} 0 ${px};">
      <div>
        <span class="inline-block text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-sm" style="background-color: ${C.primary}; color: #ffffff;">DEVIS</span>
        <p class="text-[11px] font-mono font-bold mt-1" style="color: ${C.text}"># ${quoteInfo?.number || "---"} — Suite</p>
      </div>
      <div class="text-right">
        <p class="text-[9px] font-mono font-bold" style="color: ${C.primary};">Page ${pageNum} / ${totalPages}</p>
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
        return `<div id="quote-page-${pageNum}" class="w-[210mm] mx-auto bg-white relative shadow-none" style="min-height: 297mm; background-color: ${C.background};">${renderStyles()}${renderHeader()}<div style="padding: ${gap} ${px} 0 ${px};">${renderClientBlock()}${renderTableHeader()}${batch.map((item: any, i: number) => renderRow(item, i)).join("")}${renderTableClose()}${renderTotalCard()}</div>${renderFooter()}</div>`;
      }
      if (isFirst) {
        return `<div id="quote-page-${pageNum}" ${pageBreakAttr} class="w-[210mm] mx-auto bg-white relative shadow-none" style="min-height: 297mm; background-color: ${C.background};">${renderStyles()}${renderHeader()}<div style="padding: ${gap} ${px} 0 ${px};">${renderClientBlock()}${renderTableHeader()}${batch.map((item: any, i: number) => renderRow(item, i)).join("")}${renderTableClose()}</div></div>`;
      }
      if (isLast) {
        return `<div id="quote-page-${pageNum}" class="w-[210mm] mx-auto bg-white relative shadow-none" style="min-height: 297mm; background-color: ${C.background};">${renderStyles()}${renderMiniHeader(pageNum)}<div style="padding: ${gap} ${px} 0 ${px};">${renderTableHeader()}${batch.map((item: any, i: number) => renderRow(item, i)).join("")}${renderTableClose()}${renderTotalCard()}</div>${renderFooter()}</div>`;
      }
      return `<div id="quote-page-${pageNum}" ${pageBreakAttr} class="w-[210mm] mx-auto bg-white relative shadow-none" style="min-height: 297mm; background-color: ${C.background};">${renderStyles()}${renderMiniHeader(pageNum)}<div style="padding: ${gap} ${px} 0 ${px};">${renderTableHeader()}${batch.map((item: any, i: number) => renderRow(item, i)).join("")}${renderTableClose()}</div></div>`;
    })
    .join("\n");

  return pagesHtml;
}