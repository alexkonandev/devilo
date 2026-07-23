// ═══════════════════════════════════════════════════════════════════════════════
// RENDERER : Cyber Neon 🌃
// Terminal rétro-futuriste — scanlines CRT, néon cyan/magenta, vibes cyberpunk
// Cible : startups tech, studios de jeu, agences web3
// Avec pagination multi-pages A4
// ═══════════════════════════════════════════════════════════════════════════════

import { TemplateDefinition, EditorActiveQuote } from "@/types/editor";
import { splitItemsIntoPages, type TemplatePageHeights } from "./pagination-utils";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0 }).format(n);

const PAGE_LAYOUT: TemplatePageHeights = {
  pageContentHeight: 1020,
  headerHeight: 110,
  clientBlockHeight: 140,
  tableHeaderHeight: 44,
  rowHeight: 62,
  totalCardHeight: 200,
  footerHeight: 70,
};

export function renderCyberNeon(
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

  const pages = splitItemsIntoPages(items, PAGE_LAYOUT);
  const totalPages = pages.length;

  const renderStyles = () => `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,300;0,500;0,700;1,400&display=swap');
      [id^="quote-page-"] * {
        font-family: '${template.typography.fontFamily}', monospace !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      @page { size: A4; margin: 0; }
      .no-break { page-break-inside: avoid; break-inside: avoid; }
      .crt-scanlines {
        position: relative;
      }
      .crt-scanlines::after {
        content: '';
        position: absolute;
        inset: 0;
        background: repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(0,0,0,0.03) 2px,
          rgba(0,0,0,0.03) 3px
        );
        pointer-events: none;
        z-index: 999;
      }
      .neon-border {
        border: 1px solid ${C.primary};
        box-shadow: 0 0 6px ${C.primary}60, 0 0 14px ${C.primary}30, inset 0 0 6px ${C.primary}10;
        border-radius: 4px;
        padding: 16px 20px;
      }
      .neon-glow-text {
        text-shadow: 0 0 6px ${C.primary}80, 0 0 12px ${C.primary}40;
      }
      .magenta-line {
        height: 1px;
        background: linear-gradient(90deg, transparent, ${C.accent}, ${C.accent}, transparent);
        width: 100%;
        margin: 0;
      }
      .cyan-line {
        height: 1px;
        background: linear-gradient(90deg, transparent, ${C.primary}, ${C.primary}, transparent);
        width: 100%;
        margin: 0;
      }
      .circuit-badge {
        border: 1px solid ${C.primary};
        border-radius: 2px;
        padding: 4px 10px;
        position: relative;
        box-shadow: 0 0 4px ${C.primary}40;
      }
      .circuit-badge::before {
        content: '';
        position: absolute;
        left: -6px;
        top: 50%;
        width: 6px;
        height: 1px;
        background: ${C.primary};
        opacity: 0.6;
      }
      .terminal-table th {
        background-color: rgba(0, 240, 255, 0.04);
        border-bottom: 2px solid ${C.primary}60;
        color: ${C.primary};
      }
      .terminal-row {
        border-bottom: 1px solid ${C.primary}10;
      }
      .terminal-row:nth-child(even) {
        background-color: rgba(0, 240, 255, 0.02);
      }
      .page-break-after-always {
        page-break-after: always;
        break-after: page;
      }
    </style>
  `;

  const renderHeader = () => `
    <header class="crt-scanlines flex justify-between items-start" style="padding: ${py} ${px} ${gap} ${px}; background-color: ${C.background}; position: relative;">
      <div style="position: relative; z-index: 1;">
        <div class="neon-glow-text" style="font-size: 28px; font-weight: 700; color: ${C.primary}; letter-spacing: 0.06em;">
          ${quote?.title || "DEVIS"}
        </div>
        <div style="margin-top: 6px; font-size: 11px; font-weight: 500; color: ${C.accent}; letter-spacing: 0.15em;">
          N° ${quoteInfo?.number || "---"}
        </div>
      </div>
      <div class="text-right" style="position: relative; z-index: 1;">
        <div style="font-size: 15px; font-weight: 700; color: ${C.text}; letter-spacing: 0.05em;">${company?.name || ""}</div>
        <div style="font-size: 9px; color: ${C.textMuted}; margin-top: 4px; line-height: 1.5; font-weight: 300;">
          ${company?.address || ""}
        </div>
        <div style="font-size: 9px; color: ${C.primary}; font-weight: 500; margin-top: 2px;">
          ${company?.email || ""}
        </div>
      </div>
    </header>
    <div style="padding: 0 ${px}; margin-bottom: ${gap};">
      <div class="cyan-line"></div>
    </div>
  `;

  const renderClientBlock = () => `
    <section class="flex justify-between items-start no-break" style="margin-bottom: ${gap};">
      <div class="neon-border" style="flex: 0 0 50%; border-color: ${C.accent}60; box-shadow: 0 0 6px ${C.accent}30, 0 0 14px ${C.accent}15;">
        <div style="font-size: 7px; font-weight: 700; color: ${C.accent}; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 8px;">
          // CLIENT_DATA
        </div>
        <div style="font-size: 15px; font-weight: 700; color: ${C.text}; margin: 0 0 4px 0;">${client?.name || "Client"}</div>
        <div style="font-size: 9px; color: ${C.textMuted}; margin-top: 6px; line-height: 1.5; font-weight: 300;">${client?.address || ""}</div>
        ${client?.email ? `<div style="font-size: 9px; color: ${C.textMuted}; font-weight: 300;">${client.email}</div>` : ""}
        ${client?.phone ? `<div style="font-size: 9px; color: ${C.textMuted}; font-weight: 300;">${client.phone}</div>` : ""}
      </div>
      <div class="text-right" style="min-width: 160px;">
        <div style="margin-bottom: 10px;">
          <div style="font-size: 7px; font-weight: 700; color: ${C.primary}; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 3px;">// ISSUE_DATE</div>
          <div style="font-size: 11px; font-weight: 500; color: ${C.text};">${quoteInfo?.issueDate || "---"}</div>
        </div>
        ${dueDate ? `
        <div style="margin-bottom: 10px;">
          <div style="font-size: 7px; font-weight: 700; color: ${C.accent}; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 3px;">// DUE_DATE</div>
          <div style="font-size: 11px; font-weight: 500; color: ${C.text};">${dueDate}</div>
        </div>` : ""}
        <div>
          <div style="font-size: 7px; font-weight: 700; color: ${C.primary}; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 3px;">// VALIDITY</div>
          <div style="font-size: 11px; font-weight: 500; color: ${C.text};">${validityDays} jours</div>
        </div>
      </div>
    </section>
  `;

  const renderTableHeader = () => `
    <section class="no-break" style="margin-bottom: 0;">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr>
            <th class="terminal-table" style="padding: 10px 14px; text-align: left; font-size: 7px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em;">
              > ITEM
            </th>
            <th class="terminal-table" style="padding: 10px 8px; text-align: center; font-size: 7px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; width: 55px;">
              > QTY
            </th>
            <th class="terminal-table" style="padding: 10px 8px; text-align: right; font-size: 7px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; width: 100px;">
              > U_PRICE
            </th>
            <th class="terminal-table" style="padding: 10px 14px; text-align: right; font-size: 7px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.18em; width: 120px;">
              > TOTAL
            </th>
          </tr>
        </thead>
        <tbody>
  `;

  const renderRow = (item: any, i: number) => `
    <tr class="no-break terminal-row">
      <td style="padding: 10px 14px; vertical-align: top;">
        <div style="font-size: 11px; font-weight: 500; color: ${C.text}; margin: 0;">${item?.title || ""}</div>
        <div style="font-size: 8px; font-weight: 300; color: ${C.textMuted}; margin-top: 2px; max-width: 400px; line-height: 1.4;">${item?.subtitle || ""}</div>
      </td>
      <td style="padding: 10px 8px; vertical-align: top; text-align: center;">
        <span style="font-size: 10px; font-weight: 500; color: ${C.text};">${item?.quantity || 0}</span>
      </td>
      <td style="padding: 10px 8px; vertical-align: top; text-align: right;">
        <span style="font-size: 10px; font-weight: 300; color: ${C.textMuted};">${fmt(item?.unitPrice || 0)}</span>
      </td>
      <td style="padding: 10px 14px; vertical-align: top; text-align: right;">
        <span style="font-size: 11px; font-weight: 500; color: ${C.text};">${fmt((item?.quantity || 0) * (item?.unitPrice || 0))}</span>
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
      <div class="neon-border" style="width: 300px; border-color: ${C.primary}50;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px 0;">
          <span style="font-size: 9px; font-weight: 500; color: ${C.textMuted}; letter-spacing: 0.1em;">> SUBTOTAL_HT</span>
          <span style="font-size: 12px; font-weight: 500; color: ${C.text};">${fmt(subTotal)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px 0; border-top: 1px solid ${C.primary}15;">
          <span style="font-size: 9px; font-weight: 500; color: ${C.textMuted}; letter-spacing: 0.1em;">> VAT_${vatRate}PCT</span>
          <span style="font-size: 12px; font-weight: 300; color: ${C.textMuted};">${fmt(vat)}</span>
        </div>
        ${discount > 0 ? `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px 0; border-top: 1px solid ${C.primary}15;">
          <span style="font-size: 9px; font-weight: 500; color: ${C.textMuted}; letter-spacing: 0.1em;">> DISCOUNT</span>
          <span style="font-size: 12px; font-weight: 500; color: ${C.accent};">- ${fmt(discount)}</span>
        </div>` : ""}
        <div style="margin-top: 10px; padding-top: 10px; border-top: 2px solid ${C.primary}60;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="neon-glow-text" style="font-size: 11px; font-weight: 700; color: ${C.primary}; letter-spacing: 0.15em;">> TOTAL_TTC</span>
            <span class="neon-glow-text" style="font-size: 26px; font-weight: 700; color: ${C.primary};">${fmt(total)}</span>
          </div>
          <div style="font-size: 7px; font-weight: 500; color: ${C.textMuted}; text-align: right; margin-top: 2px; letter-spacing: 0.1em;">${currency}</div>
        </div>
      </div>
    </section>
  `;

  const renderFooter = () => `
    <footer style="padding: 0 ${px} ${py} ${px}; background-color: ${C.background};">
      <div class="magenta-line" style="margin-bottom: 12px;"></div>
      <div style="display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <div style="font-size: 8px; font-weight: 500; color: ${C.textMuted}; letter-spacing: 0.08em; margin-bottom: 4px;">
            ${quoteInfo?.terms || `Paiement à réception. Validité : ${validityDays} jours.`}
          </div>
        </div>
        <div class="text-right">
          <div class="neon-glow-text" style="font-size: 8px; font-weight: 700; color: ${C.primary}; letter-spacing: 0.12em;">
            SYS.QUOTE_${quoteInfo?.number || "---"} // CKSUM_OK
          </div>
          <div style="font-size: 7px; font-weight: 300; color: ${C.textMuted}; margin-top: 2px;">
            ${new Date().toLocaleDateString("fr-FR")}
          </div>
        </div>
      </div>
    </footer>
  `;

  const renderMiniHeader = (pageNum: number) => `
    <div style="padding: 16px ${px} 0 ${px}; background-color: ${C.background};">
      <div style="display: flex; justify-content: space-between; align-items: baseline;">
        <div style="font-size: 10px; font-weight: 500; color: ${C.textMuted}; letter-spacing: 0.1em;">
          ${quote?.title || "DEVIS"} N° ${quoteInfo?.number || "---"} // SUITE
        </div>
        <div style="font-size: 9px; font-weight: 700; color: ${C.primary}; letter-spacing: 0.12em;">
          < ${pageNum} / ${totalPages} >
        </div>
      </div>
      <div style="margin-top: 8px;">
        <div class="cyan-line"></div>
      </div>
    </div>
  `;

  const pagesHtml = pages
    .map((batch: any[], pageIndex: number) => {
      const isFirst = pageIndex === 0;
      const isLast = pageIndex === totalPages - 1;
      const pageNum = pageIndex + 1;
      const pageBreakAttr = isLast ? "" : 'class="page-break-after-always"';

      if (totalPages === 1) {
        return `
          <div id="quote-page-${pageNum}" class="w-[210mm] mx-auto relative shadow-none crt-scanlines" style="min-height: 297mm; background-color: ${C.background};">
            ${renderStyles()}
            ${renderHeader()}
            <div style="padding: 0 ${px};">
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
          <div id="quote-page-${pageNum}" ${pageBreakAttr} class="w-[210mm] mx-auto relative shadow-none crt-scanlines" style="min-height: 297mm; background-color: ${C.background};">
            ${renderStyles()}
            ${renderHeader()}
            <div style="padding: 0 ${px};">
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
          <div id="quote-page-${pageNum}" class="w-[210mm] mx-auto relative shadow-none crt-scanlines" style="min-height: 297mm; background-color: ${C.background};">
            ${renderStyles()}
            ${renderMiniHeader(pageNum)}
            <div style="padding: 0 ${px};">
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