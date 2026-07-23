// ═══════════════════════════════════════════════════════════════════════════════
// RENDERER : Crimson Velvet 🍷
// Pourpre royal & ornements baroques — velours cramoisi, or rose, flourishes
// Cible : hôtellerie de luxe, joaillerie, traiteurs gastronomiques
// Avec pagination multi-pages A4
// ═══════════════════════════════════════════════════════════════════════════════

import { TemplateDefinition, EditorActiveQuote } from "@/types/editor";
import { splitItemsIntoPages, type TemplatePageHeights } from "./pagination-utils";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0 }).format(n);

const PAGE_LAYOUT: TemplatePageHeights = {
  pageContentHeight: 1000,
  headerHeight: 130,
  clientBlockHeight: 150,
  tableHeaderHeight: 42,
  rowHeight: 62,
  totalCardHeight: 230,
  footerHeight: 80,
};

export function renderCrimsonVelvet(
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
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400;1,600&display=swap');
      [id^="quote-page-"] * {
        font-family: '${template.typography.fontFamily}', serif !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      @page { size: A4; margin: 0; }
      .no-break { page-break-inside: avoid; break-inside: avoid; }
      .velvet-header {
        background: linear-gradient(135deg, ${C.primary} 0%, ${C.primary}DD 40%, ${C.accent}40 100%);
        position: relative;
        overflow: hidden;
      }
      .baroque-flourish::before,
      .baroque-flourish::after {
        content: '';
        position: absolute;
        width: 60px;
        height: 60px;
        border: 2px solid ${C.accent}30;
        border-radius: 50%;
        pointer-events: none;
      }
      .baroque-flourish::before {
        top: -30px;
        left: -30px;
        box-shadow: 0 0 20px ${C.accent}10;
      }
      .baroque-flourish::after {
        bottom: -30px;
        right: -30px;
        box-shadow: 0 0 20px ${C.accent}10;
      }
      .diamond-badge {
        display: inline-block;
        width: 48px;
        height: 48px;
        background-color: ${C.accent};
        color: ${C.background};
        transform: rotate(45deg);
        position: relative;
        border: 1px solid ${C.primary};
      }
      .diamond-badge-inner {
        transform: rotate(-45deg);
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: 800;
      }
      .velvet-card {
        background-color: ${C.surface};
        border: 1px solid ${C.border};
        border-radius: 4px;
        padding: 20px 24px;
        position: relative;
      }
      .velvet-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, transparent, ${C.primary}60, ${C.accent}60, transparent);
      }
      .double-rule-crimson {
        height: 3px;
        background: linear-gradient(90deg, transparent, ${C.primary}80, transparent);
        margin-bottom: 2px;
      }
      .double-rule-gold {
        height: 1px;
        background: linear-gradient(90deg, transparent, ${C.accent}60, transparent);
      }
      .oval-seal {
        border: 3px double ${C.primary};
        border-radius: 50% / 60%;
        padding: 20px 30px;
        text-align: center;
        display: inline-block;
      }
      .table-bordeaux th {
        background-color: ${C.primary}08;
        border-bottom: 2px solid ${C.primary}40;
        color: ${C.primary};
      }
      .table-row-velvet {
        border-bottom: 1px solid ${C.border};
      }
      .table-row-velvet:nth-child(even) {
        background-color: ${C.highlight};
      }
      .page-break-after-always {
        page-break-after: always;
        break-after: page;
      }
    </style>
  `;

  const renderHeader = () => `
    <header class="velvet-header baroque-flourish" style="padding: ${py} ${px} ${gap} ${px}; position: relative;">
      <div style="position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h1 style="font-size: 34px; font-weight: 800; color: ${C.background}; letter-spacing: 0.04em; margin: 0; font-style: italic; text-shadow: 0 2px 8px rgba(0,0,0,0.3);">
            ${quote?.title || "DEVIS"}
          </h1>
          <div style="margin-top: 8px; font-size: 12px; font-weight: 600; color: ${C.accent}; letter-spacing: 0.2em; text-transform: uppercase;">
            N° ${quoteInfo?.number || "---"}
          </div>
        </div>
        <div class="diamond-badge">
          <div class="diamond-badge-inner">★</div>
        </div>
      </div>
    </header>
  `;

  const renderCompanyBlock = () => `
    <section class="no-break flex justify-end" style="margin-bottom: ${gap}; padding: 0 ${px}; margin-top: ${gap};">
      <div class="text-right">
        <div style="font-size: 18px; font-weight: 700; color: ${C.accent}; letter-spacing: 0.02em; font-style: italic;">${company?.name || ""}</div>
        <div style="font-size: 9px; color: ${C.textMuted}; margin-top: 4px; line-height: 1.5; font-weight: 400;">
          ${company?.address || ""}
        </div>
        <div style="font-size: 9px; color: ${C.primary}; font-weight: 600; margin-top: 2px;">
          ${company?.email || ""}
        </div>
      </div>
    </section>
    <div style="padding: 0 ${px}; margin-bottom: ${gap};">
      <div class="double-rule-crimson"></div>
      <div class="double-rule-gold"></div>
    </div>
  `;

  const renderClientBlock = () => `
    <section class="flex justify-between items-start no-break" style="margin-bottom: ${gap};">
      <div class="velvet-card" style="flex: 0 0 50%;">
        <div style="font-size: 8px; font-weight: 800; color: ${C.primary}; letter-spacing: 0.25em; text-transform: uppercase; margin-bottom: 10px;">
          À l'honorable attention de
        </div>
        <div style="font-size: 17px; font-weight: 600; color: ${C.accent}; margin: 0 0 4px 0; font-style: italic;">${client?.name || "Client"}</div>
        <div style="font-size: 9px; color: ${C.textMuted}; margin-top: 6px; line-height: 1.5; font-weight: 400;">${client?.address || ""}</div>
        ${client?.email ? `<div style="font-size: 9px; color: ${C.textMuted}; font-weight: 400;">${client.email}</div>` : ""}
        ${client?.phone ? `<div style="font-size: 9px; color: ${C.textMuted}; font-weight: 400;">${client.phone}</div>` : ""}
      </div>
      <div class="text-right" style="min-width: 160px;">
        <div style="margin-bottom: 14px;">
          <div style="font-size: 7px; font-weight: 800; color: ${C.primary}; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 3px;">Date d'émission</div>
          <div style="font-size: 12px; font-weight: 600; color: ${C.accent};">${quoteInfo?.issueDate || "---"}</div>
        </div>
        ${dueDate ? `
        <div style="margin-bottom: 14px;">
          <div style="font-size: 7px; font-weight: 800; color: ${C.primary}; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 3px;">Échéance</div>
          <div style="font-size: 12px; font-weight: 600; color: ${C.accent};">${dueDate}</div>
        </div>` : ""}
        <div>
          <div style="font-size: 7px; font-weight: 800; color: ${C.primary}; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 3px;">Validité</div>
          <div style="font-size: 12px; font-weight: 600; color: ${C.accent};">${validityDays} jours</div>
        </div>
      </div>
    </section>
  `;

  const renderTableHeader = () => `
    <section class="no-break" style="margin-bottom: 0;">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr>
            <th class="table-bordeaux" style="padding: 10px 14px; text-align: left; font-size: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.18em;">
              Désignation
            </th>
            <th class="table-bordeaux" style="padding: 10px 8px; text-align: center; font-size: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.18em; width: 55px;">
              Qté
            </th>
            <th class="table-bordeaux" style="padding: 10px 8px; text-align: right; font-size: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.18em; width: 100px;">
              P.U HT
            </th>
            <th class="table-bordeaux" style="padding: 10px 14px; text-align: right; font-size: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.18em; width: 120px;">
              Total HT
            </th>
          </tr>
        </thead>
        <tbody>
  `;

  const renderRow = (item: any, i: number) => `
    <tr class="no-break table-row-velvet">
      <td style="padding: 11px 14px; vertical-align: top;">
        <div style="font-size: 11px; font-weight: 600; color: ${C.accent}; margin: 0; font-style: italic;">${item?.title || ""}</div>
        <div style="font-size: 8px; font-weight: 400; color: ${C.textMuted}; margin-top: 2px; max-width: 400px; line-height: 1.4;">${item?.subtitle || ""}</div>
      </td>
      <td style="padding: 11px 8px; vertical-align: top; text-align: center;">
        <span style="font-size: 10px; font-weight: 600; color: ${C.text};">${item?.quantity || 0}</span>
      </td>
      <td style="padding: 11px 8px; vertical-align: top; text-align: right;">
        <span style="font-size: 10px; font-weight: 400; color: ${C.textMuted};">${fmt(item?.unitPrice || 0)}</span>
      </td>
      <td style="padding: 11px 14px; vertical-align: top; text-align: right;">
        <span style="font-size: 11px; font-weight: 600; color: ${C.accent};">${fmt((item?.quantity || 0) * (item?.unitPrice || 0))}</span>
      </td>
    </tr>
  `;

  const renderTableClose = () => `
        </tbody>
      </table>
    </section>
  `;

  const renderTotalCard = () => `
    <section class="flex justify-center no-break" style="margin-bottom: ${gap}; margin-top: ${gap};">
      <div class="oval-seal" style="min-width: 260px; background-color: ${C.highlight};">
        <div style="font-size: 10px; font-weight: 600; color: ${C.textMuted}; margin-bottom: 4px;">
          Sous-total HT — ${fmt(subTotal)}
        </div>
        <div style="font-size: 10px; font-weight: 400; color: ${C.textMuted}; margin-bottom: 4px;">
          TVA ${vatRate}% — ${fmt(vat)}
        </div>
        ${discount > 0 ? `
        <div style="font-size: 10px; font-weight: 400; color: ${C.primary}; margin-bottom: 4px;">
          Remise — -${fmt(discount)}
        </div>` : ""}
        <div style="margin-top: 10px; padding-top: 10px; border-top: 2px solid ${C.primary}60;">
          <div style="font-size: 13px; font-weight: 800; color: ${C.primary}; letter-spacing: 0.12em; text-transform: uppercase;">
            Total TTC
          </div>
          <div style="font-size: 30px; font-weight: 800; color: ${C.accent}; margin-top: 2px; font-style: italic;">
            ${fmt(total)}
          </div>
          <div style="font-size: 9px; font-weight: 600; color: ${C.textMuted}; margin-top: 2px; letter-spacing: 0.1em;">
            ${currency}
          </div>
        </div>
      </div>
    </section>
  `;

  const renderFooter = () => `
    <footer style="padding: 0 ${px} ${py} ${px}; background-color: ${C.background};">
      <div class="double-rule-crimson" style="margin-bottom: 2px;"></div>
      <div class="double-rule-gold" style="margin-bottom: 14px;"></div>
      <div style="display: flex; justify-content: space-between; align-items: flex-end;">
        <div style="max-width: 55%;">
          <div style="font-size: 9px; font-weight: 600; color: ${C.accent}; letter-spacing: 0.06em; font-style: italic;">
            ${quoteInfo?.terms || `Paiement à réception. Validité : ${validityDays} jours.`}
          </div>
        </div>
        <div class="text-right">
          <div style="font-size: 9px; font-weight: 800; color: ${C.primary}; letter-spacing: 0.12em;">
            Avec l'expression de notre considération distinguée
          </div>
          <div style="font-size: 7px; font-weight: 400; color: ${C.textMuted}; margin-top: 4px; font-style: italic;">
            Généré le ${new Date().toLocaleDateString("fr-FR")}
          </div>
        </div>
      </div>
    </footer>
  `;

  const renderMiniHeader = (pageNum: number) => `
    <div style="padding: 16px ${px} 0 ${px}; background-color: ${C.background};">
      <div style="display: flex; justify-content: space-between; align-items: baseline;">
        <div style="font-size: 10px; font-weight: 600; color: ${C.textMuted}; letter-spacing: 0.08em; font-style: italic;">
          ${quote?.title || "DEVIS"} N° ${quoteInfo?.number || "---"} — Suite
        </div>
        <div style="font-size: 9px; font-weight: 800; color: ${C.primary}; letter-spacing: 0.15em;">
          ${pageNum} / ${totalPages}
        </div>
      </div>
      <div style="margin-top: 10px;">
        <div class="double-rule-crimson"></div>
        <div class="double-rule-gold"></div>
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
          <div id="quote-page-${pageNum}" class="w-[210mm] mx-auto relative shadow-none" style="min-height: 297mm; background-color: ${C.background};">
            ${renderStyles()}
            ${renderHeader()}
            ${renderCompanyBlock()}
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
          <div id="quote-page-${pageNum}" ${pageBreakAttr} class="w-[210mm] mx-auto relative shadow-none" style="min-height: 297mm; background-color: ${C.background};">
            ${renderStyles()}
            ${renderHeader()}
            ${renderCompanyBlock()}
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
          <div id="quote-page-${pageNum}" class="w-[210mm] mx-auto relative shadow-none" style="min-height: 297mm; background-color: ${C.background};">
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