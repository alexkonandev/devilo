// ═══════════════════════════════════════════════════════════════════════════════
// RENDERER : Dark Premium
// Sombre, sophistiqué, puissant — premier template dark mode pour devis
// Cible : agences digitales, startups SaaS, marques tech
// Avec pagination multi-pages A4
// ═══════════════════════════════════════════════════════════════════════════════

import { TemplateDefinition, EditorActiveQuote } from "@/types/editor";
import { splitItemsIntoPages, type TemplatePageHeights } from "./pagination-utils";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0 }).format(n);

const PAGE_LAYOUT: TemplatePageHeights = {
  pageContentHeight: 1050,   // 297mm - 2×36px paddingY ≈ 1050px utile
  headerHeight: 100,          // header avec titre + infos entreprise
  clientBlockHeight: 140,     // bloc client + dates + séparateur
  tableHeaderHeight: 40,      // en-tête du tableau
  rowHeight: 68,              // une ligne de tableau (padding 24px + contenu)
  totalCardHeight: 200,       // carte total TTC + espacement
  footerHeight: 60,           // footer légal
};

export function renderDarkPremium(
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

  // ── Découpage en pages ──
  const pages = splitItemsIntoPages(items, PAGE_LAYOUT);
  const totalPages = pages.length;

  // ── Templates HTML réutilisables ──

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
      .dark-card {
        background-color: ${C.surface};
        border: 1px solid ${C.border};
        border-radius: 8px;
        padding: 16px 20px;
      }
      .glow-total {
        box-shadow: 0 0 12px rgba(233, 69, 96, 0.2);
      }
      .coral-line {
        height: 1.5px;
        background-color: ${C.primary};
        width: 100%;
      }
      .page-break-after-always {
        page-break-after: always;
        break-after: page;
      }
    </style>
  `;

  const renderHeader = () => `
    <header class="flex justify-between items-start" style="padding: ${SP.paddingY}px ${px} 0 ${px}; background-color: ${C.background};">
      <div>
        <h1 class="text-[22px] font-black tracking-tighter leading-none" style="color: ${C.text};">
          ${quote?.title || "DEVIS"}
        </h1>
        <p class="text-[10px] font-mono font-bold mt-1" style="color: ${C.textMuted};">
          N° ${quoteInfo?.number || "---"}
        </p>
      </div>
      <div class="text-right">
        <div style="font-size: 14px; font-weight: 700; color: ${C.text};">${company?.name || ""}</div>
        <div style="font-size: 9px; color: ${C.textMuted}; margin-top: 2px;">
          ${company?.address || ""}
        </div>
        <div style="font-size: 9px; color: ${C.primary}; font-weight: 500;">
          ${company?.email || ""}
        </div>
      </div>
    </header>
    <div style="padding: 0 ${px}; margin-top: ${gap};">
      <div class="coral-line"></div>
    </div>
  `;

  const renderClientBlock = () => `
    <section class="flex justify-between items-start no-break dark-card" style="margin-bottom: ${gap}; border-color: ${C.primary}40;">
      <div>
        <p class="text-[8px] font-mono uppercase tracking-widest font-bold mb-1" style="color: ${C.textMuted};">Client</p>
        <p class="text-[14px] font-bold tracking-tight" style="color: ${C.text};">${client?.name || "Client"}</p>
        <p class="text-[9px] mt-1 font-medium leading-relaxed" style="color: ${C.textMuted};">${client?.address || ""}</p>
        ${client?.email ? `<p class="text-[9px] font-medium" style="color: ${C.textMuted};">${client.email}</p>` : ""}
        ${client?.phone ? `<p class="text-[9px] font-medium" style="color: ${C.textMuted};">${client.phone}</p>` : ""}
      </div>
      <div class="text-right">
        <div class="mb-2">
          <p class="text-[8px] font-mono uppercase tracking-widest font-bold mb-0.5" style="color: ${C.textMuted};">Émis le</p>
          <p class="text-[10px] font-mono font-bold" style="color: ${C.text};">${quoteInfo?.issueDate || "---"}</p>
        </div>
        ${dueDate ? `
        <div class="mb-2">
          <p class="text-[8px] font-mono uppercase tracking-widest font-bold mb-0.5" style="color: ${C.textMuted};">Échéance</p>
          <p class="text-[10px] font-mono font-bold" style="color: ${C.text};">${dueDate}</p>
        </div>` : ""}
        <div>
          <p class="text-[8px] font-mono uppercase tracking-widest font-bold mb-0.5" style="color: ${C.textMuted};">Validité</p>
          <p class="text-[10px] font-mono font-bold" style="color: ${C.text};">${validityDays} jours</p>
        </div>
      </div>
    </section>
  `;

  const renderTableHeader = () => `
    <section class="no-break" style="margin-bottom: ${gap};">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr>
            <th style="background-color: ${C.surface}; color: ${C.text}; padding: 10px 12px; text-align: left; font-size: 8px; font-family: monospace; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">
              Désignation
            </th>
            <th style="background-color: ${C.surface}; color: ${C.text}; padding: 10px 8px; text-align: center; font-size: 8px; font-family: monospace; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; width: 60px;">
              Qté
            </th>
            <th style="background-color: ${C.surface}; color: ${C.text}; padding: 10px 8px; text-align: right; font-size: 8px; font-family: monospace; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; width: 100px;">
              P.U HT
            </th>
            <th style="background-color: ${C.surface}; color: ${C.text}; padding: 10px 12px; text-align: right; font-size: 8px; font-family: monospace; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; width: 120px;">
              Total HT
            </th>
          </tr>
        </thead>
        <tbody>
  `;

  const renderRow = (item: any, i: number) => `
    <tr class="no-break" style="border-bottom: 1px solid ${C.border}; background-color: ${i % 2 === 0 ? C.background : C.surface};">
      <td style="padding: 12px 12px; vertical-align: top;">
        <p style="font-size: 11px; font-weight: 700; color: ${C.text}; margin: 0;">${item?.title || ""}</p>
        <p style="font-size: 9px; font-weight: 500; color: ${C.textMuted}; margin-top: 2px; max-width: 380px;">${item?.subtitle || ""}</p>
      </td>
      <td style="padding: 12px 8px; vertical-align: top; text-align: center;">
        <span style="font-size: 10px; font-family: monospace; font-weight: 700; color: ${C.text};">${item?.quantity || 0}</span>
      </td>
      <td style="padding: 12px 8px; vertical-align: top; text-align: right;">
        <span style="font-size: 10px; font-family: monospace; color: ${C.textMuted};">${fmt(item?.unitPrice || 0)}</span>
      </td>
      <td style="padding: 12px 12px; vertical-align: top; text-align: right;">
        <span style="font-size: 11px; font-family: monospace; font-weight: 700; color: ${C.text};">${fmt((item?.quantity || 0) * (item?.unitPrice || 0))}</span>
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
      <div class="dark-card glow-total" style="width: 280px; border-color: ${C.primary}60;">
        <div class="flex justify-between items-center py-1.5">
          <span class="text-[9px] font-bold uppercase tracking-wider" style="color: ${C.textMuted};">Sous-total HT</span>
          <span class="text-[12px] font-mono font-bold" style="color: ${C.text};">${fmt(subTotal)}</span>
        </div>
        <div class="flex justify-between items-center py-1.5" style="border-top: 1px solid ${C.border};">
          <span class="text-[9px] font-bold uppercase tracking-wider" style="color: ${C.textMuted};">TVA (${vatRate}%)</span>
          <span class="text-[12px] font-mono" style="color: ${C.textMuted};">${fmt(vat)}</span>
        </div>
        ${discount > 0 ? `
        <div class="flex justify-between items-center py-1.5" style="border-top: 1px solid ${C.border};">
          <span class="text-[9px] font-bold uppercase tracking-wider" style="color: ${C.textMuted};">Remise</span>
          <span class="text-[12px] font-mono font-bold" style="color: ${C.primary};">- ${fmt(discount)}</span>
        </div>` : ""}
        <div style="margin-top: 8px; padding-top: 8px; border-top: 2px solid ${C.primary};">
          <div class="flex justify-between items-center">
            <span class="text-[11px] font-black uppercase tracking-wider" style="color: ${C.text};">Total TTC</span>
            <span class="text-[26px] font-black font-mono tracking-tighter" style="color: ${C.primary};">${fmt(total)}</span>
          </div>
          <p class="text-[8px] font-mono font-semibold text-right mt-0.5" style="color: ${C.textMuted};">${currency}</p>
        </div>
      </div>
    </section>
  `;

  const renderFooter = () => `
    <footer style="padding: 0 ${px} ${SP.paddingY}px ${px}; background-color: ${C.background};">
      <div style="border-top: 1.5px solid ${C.primary}; padding-top: 10px;">
        <p class="text-[7px] font-mono tracking-wider" style="color: ${C.textMuted};">
          ${quoteInfo?.terms || `Paiement à réception. Validité : ${validityDays} jours.`}
        </p>
        <p class="text-[6px] font-mono mt-1" style="color: ${C.textMuted};">
          Généré le ${new Date().toLocaleDateString("fr-FR")}
        </p>
      </div>
    </footer>
  `;

  const renderMiniHeader = (pageNum: number) => `
    <div style="padding: 16px ${px} 0 ${px}; background-color: ${C.background};">
      <div class="flex justify-between items-center">
        <p class="text-[9px] font-mono font-bold" style="color: ${C.textMuted};">
          ${quote?.title || "DEVIS"} N° ${quoteInfo?.number || "---"} — Suite
        </p>
        <p class="text-[8px] font-mono font-bold" style="color: ${C.primary};">
          Page ${pageNum} / ${totalPages}
        </p>
      </div>
      <div style="margin-top: 8px;">
        <div class="coral-line"></div>
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
            <div style="padding: ${gap} ${px} 0 ${px};">
              ${renderClientBlock()}
              <div style="height: 1px; background-color: ${C.border}; margin-bottom: ${gap};"></div>
              ${renderTableHeader()}
              ${batch.map((item: any, i: number) => renderRow(item, i)).join("")}
              ${renderTableClose()}
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
            <div style="padding: ${gap} ${px} 0 ${px};">
              ${renderClientBlock()}
              <div style="height: 1px; background-color: ${C.border}; margin-bottom: ${gap};"></div>
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

      // Pages intermédiaires : suite du tableau uniquement
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