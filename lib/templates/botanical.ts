// ═══════════════════════════════════════════════════════════════════════════════
// RENDERER : Botanical 🌿
// Nature organique & kraft — papier texturé, vert sauge, filigrane feuillage
// Cible : artisans, producteurs bio, paysagistes, éco-entreprises
// Avec pagination multi-pages A4
// ═══════════════════════════════════════════════════════════════════════════════

import { TemplateDefinition, EditorActiveQuote } from "@/types/editor";
import { splitItemsIntoPages, type TemplatePageHeights } from "./pagination-utils";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0 }).format(n);

const PAGE_LAYOUT: TemplatePageHeights = {
  pageContentHeight: 1020,
  headerHeight: 120,
  clientBlockHeight: 140,
  tableHeaderHeight: 40,
  rowHeight: 60,
  totalCardHeight: 200,
  footerHeight: 70,
};

export function renderBotanical(
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
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');
      [id^="quote-page-"] * {
        font-family: '${template.typography.fontFamily}', serif !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      @page { size: A4; margin: 0; }
      .no-break { page-break-inside: avoid; break-inside: avoid; }
      .kraft-texture {
        position: relative;
      }
      .kraft-texture::after {
        content: '';
        position: absolute;
        inset: 0;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='grain'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0.1'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23grain)' opacity='0.04'/%3E%3C/svg%3E");
        background-repeat: repeat;
        background-size: 256px 256px;
        pointer-events: none;
        z-index: 0;
      }
      .leaf-filigrane {
        position: relative;
      }
      .leaf-filigrane::before {
        content: '';
        position: absolute;
        top: -30px;
        right: -20px;
        width: 180px;
        height: 180px;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 10 C30 15 10 30 10 50 C10 70 30 85 50 90 C70 85 90 70 90 50 C90 30 70 15 50 10 Z M50 30 C55 30 58 35 58 40 C55 38 52 38 50 40 C48 42 48 45 50 48 C52 51 55 50 58 48 C58 55 55 62 50 62 C42 62 38 55 38 48 C38 42 42 30 50 30 Z' fill='%234a7c59' opacity='0.06'/%3E%3C/svg%3E");
        background-size: contain;
        background-repeat: no-repeat;
        pointer-events: none;
        z-index: 0;
      }
      .organic-card {
        background-color: ${C.surface};
        border: 1px solid ${C.border};
        border-radius: 16px;
        padding: 18px 22px;
      }
      .sauged-card {
        background-color: ${C.highlight};
        border: 1.5px solid ${C.primary}30;
        border-radius: 14px;
        padding: 16px 20px;
      }
      .wave-separator {
        height: 8px;
        background: repeating-linear-gradient(
          90deg,
          transparent 0px,
          transparent 12px,
          ${C.primary}25 12px,
          ${C.primary}25 14px,
          transparent 14px,
          transparent 26px
        );
        margin: 8px 0;
        opacity: 0.5;
      }
      .botanical-badge {
        background-color: ${C.primary}15;
        color: ${C.primary};
        font-size: 7px;
        font-weight: 600;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        padding: 4px 12px;
        border-radius: 20px;
        display: inline-block;
      }
      .table-sauge th {
        background-color: ${C.primary}08;
        border-bottom: 2px solid ${C.primary}40;
        color: ${C.primary};
      }
      .table-row-bota {
        border-bottom: 1px solid ${C.border};
      }
      .table-row-bota:nth-child(even) {
        background-color: ${C.highlight};
      }
      .page-break-after-always {
        page-break-after: always;
        break-after: page;
      }
    </style>
  `;

  const renderHeader = () => `
    <header class="kraft-texture leaf-filigrane" style="padding: ${py} ${px} ${gap} ${px}; background-color: ${C.background}; position: relative;">
      <div style="position: relative; z-index: 1; display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <div style="font-size: 26px; font-weight: 400; color: ${C.accent}; letter-spacing: 0.03em; font-style: italic;">
            ${quote?.title || "DEVIS"}
          </div>
          <div style="margin-top: 6px; font-size: 11px; font-weight: 400; color: ${C.textMuted}; letter-spacing: 0.08em;">
            N° ${quoteInfo?.number || "---"}
          </div>
        </div>
        <div class="text-right">
          <div style="font-size: 16px; font-weight: 600; color: ${C.accent}; letter-spacing: 0.02em;">${company?.name || ""}</div>
          <div style="font-size: 9px; color: ${C.textMuted}; margin-top: 4px; line-height: 1.5; font-weight: 300;">
            ${company?.address || ""}
          </div>
          <div style="font-size: 9px; color: ${C.primary}; font-weight: 400; margin-top: 2px;">
            ${company?.email || ""}
          </div>
        </div>
      </div>
    </header>
    <div style="padding: 0 ${px}; margin-bottom: ${gap};">
      <div class="wave-separator"></div>
    </div>
  `;

  const renderClientBlock = () => `
    <section class="flex justify-between items-start no-break" style="margin-bottom: ${gap};">
      <div class="organic-card" style="flex: 0 0 50%;">
        <div style="font-size: 8px; font-weight: 600; color: ${C.primary}; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 8px;">
          À l'attention de
        </div>
        <div style="font-size: 16px; font-weight: 400; color: ${C.accent}; margin: 0 0 4px 0; font-style: italic;">${client?.name || "Client"}</div>
        <div style="font-size: 9px; color: ${C.textMuted}; margin-top: 6px; line-height: 1.5; font-weight: 300;">${client?.address || ""}</div>
        ${client?.email ? `<div style="font-size: 9px; color: ${C.textMuted}; font-weight: 300;">${client.email}</div>` : ""}
        ${client?.phone ? `<div style="font-size: 9px; color: ${C.textMuted}; font-weight: 300;">${client.phone}</div>` : ""}
      </div>
      <div class="text-right" style="min-width: 150px;">
        <div style="margin-bottom: 12px;">
          <div style="font-size: 7px; font-weight: 600; color: ${C.primary}; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 2px;">Émis le</div>
          <div style="font-size: 11px; font-weight: 400; color: ${C.accent};">${quoteInfo?.issueDate || "---"}</div>
        </div>
        ${dueDate ? `
        <div style="margin-bottom: 12px;">
          <div style="font-size: 7px; font-weight: 600; color: ${C.primary}; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 2px;">Échéance</div>
          <div style="font-size: 11px; font-weight: 400; color: ${C.accent};">${dueDate}</div>
        </div>` : ""}
        <div>
          <div style="font-size: 7px; font-weight: 600; color: ${C.primary}; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 2px;">Validité</div>
          <div style="font-size: 11px; font-weight: 400; color: ${C.accent};">${validityDays} jours</div>
        </div>
      </div>
    </section>
  `;

  const renderTableHeader = () => `
    <section class="no-break" style="margin-bottom: 0;">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr>
            <th class="table-sauge" style="padding: 10px 14px; text-align: left; font-size: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em;">
              Prestation
            </th>
            <th class="table-sauge" style="padding: 10px 8px; text-align: center; font-size: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; width: 55px;">
              Qté
            </th>
            <th class="table-sauge" style="padding: 10px 8px; text-align: right; font-size: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; width: 100px;">
              P.U HT
            </th>
            <th class="table-sauge" style="padding: 10px 14px; text-align: right; font-size: 8px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; width: 120px;">
              Total HT
            </th>
          </tr>
        </thead>
        <tbody>
  `;

  const renderRow = (item: any, i: number) => `
    <tr class="no-break table-row-bota">
      <td style="padding: 10px 14px; vertical-align: top;">
        <div style="font-size: 11px; font-weight: 400; color: ${C.accent}; margin: 0; font-style: italic;">${item?.title || ""}</div>
        <div style="font-size: 8px; font-weight: 300; color: ${C.textMuted}; margin-top: 2px; max-width: 400px; line-height: 1.4;">${item?.subtitle || ""}</div>
      </td>
      <td style="padding: 10px 8px; vertical-align: top; text-align: center;">
        <span style="font-size: 10px; font-weight: 400; color: ${C.text};">${item?.quantity || 0}</span>
      </td>
      <td style="padding: 10px 8px; vertical-align: top; text-align: right;">
        <span style="font-size: 10px; font-weight: 300; color: ${C.textMuted};">${fmt(item?.unitPrice || 0)}</span>
      </td>
      <td style="padding: 10px 14px; vertical-align: top; text-align: right;">
        <span style="font-size: 11px; font-weight: 400; color: ${C.accent};">${fmt((item?.quantity || 0) * (item?.unitPrice || 0))}</span>
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
      <div class="sauged-card" style="width: 290px;">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px 0;">
          <span style="font-size: 10px; font-weight: 400; color: ${C.textMuted};">Sous-total HT</span>
          <span style="font-size: 12px; font-weight: 400; color: ${C.text};">${fmt(subTotal)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px 0; border-top: 1px solid ${C.border};">
          <span style="font-size: 10px; font-weight: 400; color: ${C.textMuted};">TVA (${vatRate}%)</span>
          <span style="font-size: 12px; font-weight: 300; color: ${C.textMuted};">${fmt(vat)}</span>
        </div>
        ${discount > 0 ? `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px 0; border-top: 1px solid ${C.border};">
          <span style="font-size: 10px; font-weight: 400; color: ${C.textMuted};">Remise</span>
          <span style="font-size: 12px; font-weight: 400; color: ${C.primary};">- ${fmt(discount)}</span>
        </div>` : ""}
        <div style="margin-top: 12px; padding-top: 12px; border-top: 2px solid ${C.primary}40;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; font-weight: 600; color: ${C.accent}; letter-spacing: 0.06em;">Total TTC</span>
            <span style="font-size: 26px; font-weight: 400; color: ${C.accent}; font-style: italic;">${fmt(total)}</span>
          </div>
          <div style="font-size: 8px; font-weight: 400; color: ${C.textMuted}; text-align: right; margin-top: 2px;">${currency}</div>
        </div>
      </div>
    </section>
  `;

  const renderFooter = () => `
    <footer style="padding: 0 ${px} ${py} ${px}; background-color: ${C.background};">
      <div class="wave-separator" style="margin-bottom: 16px;"></div>
      <div style="display: flex; justify-content: space-between; align-items: flex-end;">
        <div style="max-width: 60%;">
          <div style="font-size: 8px; font-weight: 400; color: ${C.textMuted}; letter-spacing: 0.06em; font-style: italic;">
            ${quoteInfo?.terms || `Paiement à réception. Validité : ${validityDays} jours.`}
          </div>
        </div>
        <div class="text-right">
          <div style="font-size: 8px; font-weight: 600; color: ${C.primary}; letter-spacing: 0.12em;">
            🌿 Imprimé sur papier certifié FSC
          </div>
          <div style="font-size: 7px; font-weight: 300; color: ${C.textMuted}; margin-top: 2px;">
            Généré le ${new Date().toLocaleDateString("fr-FR")}
          </div>
        </div>
      </div>
    </footer>
  `;

  const renderMiniHeader = (pageNum: number) => `
    <div style="padding: 16px ${px} 0 ${px}; background-color: ${C.background};">
      <div style="display: flex; justify-content: space-between; align-items: baseline;">
        <div style="font-size: 10px; font-weight: 400; color: ${C.textMuted}; letter-spacing: 0.08em; font-style: italic;">
          ${quote?.title || "DEVIS"} N° ${quoteInfo?.number || "---"} — Suite
        </div>
        <span class="botanical-badge">${pageNum} / ${totalPages}</span>
      </div>
      <div style="margin-top: 8px;">
        <div class="wave-separator"></div>
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
          <div id="quote-page-${pageNum}" class="w-[210mm] mx-auto relative shadow-none kraft-texture" style="min-height: 297mm; background-color: ${C.background};">
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
          <div id="quote-page-${pageNum}" ${pageBreakAttr} class="w-[210mm] mx-auto relative shadow-none kraft-texture" style="min-height: 297mm; background-color: ${C.background};">
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
          <div id="quote-page-${pageNum}" class="w-[210mm] mx-auto relative shadow-none kraft-texture" style="min-height: 297mm; background-color: ${C.background};">
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