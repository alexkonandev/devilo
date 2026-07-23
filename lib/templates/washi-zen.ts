// ═══════════════════════════════════════════════════════════════════════════════
// RENDERER : Washi Zen 🍵
// Papier japonais, minimal poétique — esthétique du vide (ma)
// Cible : artisans, designers, architectes, studios de création
// Avec pagination multi-pages A4
// ═══════════════════════════════════════════════════════════════════════════════

import { TemplateDefinition, EditorActiveQuote } from "@/types/editor";
import { splitItemsIntoPages, type TemplatePageHeights } from "./pagination-utils";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0 }).format(n);

const PAGE_LAYOUT: TemplatePageHeights = {
  pageContentHeight: 970,    // 297mm — paddings 56px haut/bas + espace zen
  headerHeight: 80,           // header minimal + sceau hanko
  clientBlockHeight: 130,     // bloc client décalé à droite
  tableHeaderHeight: 36,      // en-tête épuré, juste un filet
  rowHeight: 58,              // ligne fine
  totalCardHeight: 240,       // total calligraphié centré
  footerHeight: 60,           // footer haïku
};

export function renderWashiZen(
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

  // ── Découpage en pages ──
  const pages = splitItemsIntoPages(items, PAGE_LAYOUT);
  const totalPages = pages.length;

  // ── Templates HTML réutilisables ──

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
      .washi-texture {
        position: relative;
      }
      .washi-texture::after {
        content: '';
        position: absolute;
        inset: 0;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
        background-repeat: repeat;
        background-size: 256px 256px;
        pointer-events: none;
        z-index: 0;
      }
      .hanko-seal {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 2px solid ${C.primary};
        background-color: transparent;
      }
      .hanko-inner {
        width: 18px;
        height: 18px;
        background-color: ${C.primary};
        border-radius: 2px;
        transform: rotate(45deg);
      }
      .sumi-line {
        height: 1px;
        background-color: ${C.accent};
        width: 100%;
        opacity: 0.5;
      }
      .sumi-line-thick {
        height: 1.5px;
        background-color: ${C.accent};
        width: 100%;
        opacity: 0.7;
      }
      .vertical-rule {
        width: 1px;
        background-color: ${C.accent};
        opacity: 0.3;
        align-self: stretch;
      }
      .zen-table-header {
        background-color: transparent;
        border-bottom: 1.5px solid ${C.accent};
      }
      .zen-row {
        border-bottom: 1px solid ${C.border};
      }
      .zen-total-section {
        text-align: center;
        max-width: 320px;
        margin: 0 auto;
      }
      .page-break-after-always {
        page-break-after: always;
        break-after: page;
      }
    </style>
  `;

  const renderHeader = () => `
    <header class="washi-texture" style="padding: ${py} ${px} ${gap} ${px}; background-color: ${C.background}; position: relative;">
      <div style="position: relative; z-index: 1; display: flex; align-items: flex-start; gap: 16px;">
        <div class="hanko-seal">
          <div class="hanko-inner"></div>
        </div>
        <div>
          <div style="font-size: 18px; font-weight: 400; color: ${C.accent}; letter-spacing: 0.06em; font-style: italic; margin: 0;">
            ${company?.name || ""}
          </div>
          <div style="font-size: 9px; color: ${C.textMuted}; margin-top: 2px; font-weight: 300; line-height: 1.5;">
            ${company?.address || ""}
          </div>
        </div>
      </div>
      <div style="position: relative; z-index: 1; text-align: center; margin-top: ${gap};">
        <h1 style="font-size: 16px; font-weight: 400; color: ${C.accent}; letter-spacing: 0.2em; margin: 0; text-transform: uppercase;">
          ${quote?.title || "DEVIS"}
        </h1>
        <p style="font-size: 10px; font-weight: 300; color: ${C.textMuted}; margin-top: 4px; letter-spacing: 0.15em;">
          N° ${quoteInfo?.number || "---"} — ${quoteInfo?.issueDate || ""}
        </p>
      </div>
    </header>
    <div style="padding: 0 ${px}; margin-bottom: ${gap};">
      <div class="sumi-line-thick"></div>
    </div>
  `;

  const renderClientBlock = () => `
    <section class="flex justify-end items-start no-break" style="margin-bottom: ${gap}; padding-right: 0;">
      <div style="text-align: right; max-width: 55%;">
        <p style="font-size: 9px; font-weight: 600; color: ${C.primary}; letter-spacing: 0.2em; text-transform: uppercase; margin: 0 0 8px 0;">敬具 — À l'attention de</p>
        <p style="font-size: 16px; font-weight: 400; color: ${C.accent}; margin: 0 0 4px 0; font-style: italic; letter-spacing: 0.02em;">${client?.name || "Client"}</p>
        <p style="font-size: 10px; color: ${C.textMuted}; margin-top: 4px; font-weight: 300; line-height: 1.6;">${client?.address || ""}</p>
        ${client?.email ? `<p style="font-size: 10px; color: ${C.textMuted}; font-weight: 300;">${client.email}</p>` : ""}
        ${client?.phone ? `<p style="font-size: 10px; color: ${C.textMuted}; font-weight: 300;">${client.phone}</p>` : ""}
        <div style="margin-top: 10px; display: flex; gap: 20px; justify-content: flex-end;">
          <div>
            <p style="font-size: 7px; font-weight: 600; color: ${C.primary}; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 2px;">Validité</p>
            <p style="font-size: 10px; font-weight: 300; color: ${C.textMuted}; margin: 0;">${validityDays} jours</p>
          </div>
          ${dueDate ? `
          <div>
            <p style="font-size: 7px; font-weight: 600; color: ${C.primary}; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 2px;">Échéance</p>
            <p style="font-size: 10px; font-weight: 300; color: ${C.textMuted}; margin: 0;">${dueDate}</p>
          </div>` : ""}
        </div>
      </div>
    </section>
  `;

  const renderTableHeader = () => `
    <section class="no-break" style="margin-bottom: 0;">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="zen-table-header">
            <th style="padding: 8px 12px; text-align: left; font-size: 8px; font-weight: 600; color: ${C.primary}; letter-spacing: 0.2em; text-transform: uppercase;">
              Prestation
            </th>
            <th style="padding: 8px 8px; text-align: center; font-size: 8px; font-weight: 600; color: ${C.primary}; letter-spacing: 0.2em; text-transform: uppercase; width: 50px;">
              Qté
            </th>
            <th style="padding: 8px 8px; text-align: right; font-size: 8px; font-weight: 600; color: ${C.primary}; letter-spacing: 0.2em; text-transform: uppercase; width: 90px;">
              P.U
            </th>
            <th style="padding: 8px 12px; text-align: right; font-size: 8px; font-weight: 600; color: ${C.primary}; letter-spacing: 0.2em; text-transform: uppercase; width: 110px;">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
  `;

  const renderRow = (item: any, i: number) => `
    <tr class="no-break zen-row">
      <td style="padding: 10px 12px; vertical-align: top;">
        <p style="font-size: 11px; font-weight: 400; color: ${C.accent}; margin: 0; font-style: italic;">${item?.title || ""}</p>
        <p style="font-size: 8px; font-weight: 300; color: ${C.textMuted}; margin-top: 2px; max-width: 380px; line-height: 1.5;">${item?.subtitle || ""}</p>
      </td>
      <td style="padding: 10px 8px; vertical-align: top; text-align: center;">
        <span style="font-size: 10px; font-weight: 300; color: ${C.text};">${item?.quantity || 0}</span>
      </td>
      <td style="padding: 10px 8px; vertical-align: top; text-align: right;">
        <span style="font-size: 10px; font-weight: 300; color: ${C.textMuted};">${fmt(item?.unitPrice || 0)}</span>
      </td>
      <td style="padding: 10px 12px; vertical-align: top; text-align: right;">
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
    <section class="no-break" style="margin-bottom: ${gap}; margin-top: ${gap}; padding-top: ${gap};">
      <div class="sumi-line-thick" style="margin-bottom: ${gap};"></div>
      <div class="zen-total-section">
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; max-width: 280px; margin: 0 auto;">
          <span style="font-size: 10px; font-weight: 300; color: ${C.textMuted}; letter-spacing: 0.1em;">Sous-total</span>
          <span style="font-size: 12px; font-weight: 400; color: ${C.text};">${fmt(subTotal)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; max-width: 280px; margin: 0 auto;">
          <span style="font-size: 10px; font-weight: 300; color: ${C.textMuted}; letter-spacing: 0.1em;">TVA (${vatRate}%)</span>
          <span style="font-size: 12px; font-weight: 300; color: ${C.textMuted};">${fmt(vat)}</span>
        </div>
        ${discount > 0 ? `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; max-width: 280px; margin: 0 auto;">
          <span style="font-size: 10px; font-weight: 300; color: ${C.textMuted}; letter-spacing: 0.1em;">Remise</span>
          <span style="font-size: 12px; font-weight: 400; color: ${C.primary};">- ${fmt(discount)}</span>
        </div>` : ""}
        <div style="margin-top: 20px; padding-top: 20px; max-width: 280px; margin-left: auto; margin-right: auto;">
          <div class="sumi-line" style="margin-bottom: 20px;"></div>
          <p style="font-size: 10px; font-weight: 600; color: ${C.primary}; letter-spacing: 0.25em; text-transform: uppercase; margin: 0 0 12px 0;">Total TTC</p>
          <p style="font-size: 36px; font-weight: 300; color: ${C.accent}; margin: 0; letter-spacing: 0.04em; font-style: italic;">${fmt(total)}</p>
          <p style="font-size: 10px; font-weight: 300; color: ${C.textMuted}; margin-top: 6px; letter-spacing: 0.15em;">${currency}</p>
          <div class="sumi-line" style="margin-top: 20px;"></div>
        </div>
      </div>
    </section>
  `;

  const renderFooter = () => `
    <footer style="padding: 0 ${px} ${py} ${px}; background-color: ${C.background}; text-align: center;">
      <p style="font-size: 9px; font-weight: 300; color: ${C.textMuted}; letter-spacing: 0.12em; font-style: italic; margin: 0 0 8px 0;">
        ${quoteInfo?.terms || `Paiement à réception. Validité : ${validityDays} jours.`}
      </p>
      <p style="font-size: 9px; font-weight: 400; color: ${C.accent}; letter-spacing: 0.15em; margin: 0;">
        一筆一筆
      </p>
      <p style="font-size: 7px; font-weight: 300; color: ${C.textMuted}; margin-top: 4px; letter-spacing: 0.1em;">
        Généré le ${new Date().toLocaleDateString("fr-FR")}
      </p>
    </footer>
  `;

  const renderMiniHeader = (pageNum: number) => `
    <div style="padding: 16px ${px} 0 ${px}; background-color: ${C.background};">
      <div style="display: flex; justify-content: space-between; align-items: baseline;">
        <p style="font-size: 10px; font-weight: 300; color: ${C.textMuted}; letter-spacing: 0.1em; font-style: italic; margin: 0;">
          ${quote?.title || "DEVIS"} N° ${quoteInfo?.number || "---"} — Suite
        </p>
        <p style="font-size: 9px; font-weight: 600; color: ${C.primary}; letter-spacing: 0.15em; margin: 0;">
          ${pageNum} / ${totalPages}
        </p>
      </div>
      <div style="margin-top: 8px;">
        <div class="sumi-line-thick"></div>
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
          <div id="quote-page-${pageNum}" class="w-[210mm] mx-auto relative shadow-none washi-texture" style="min-height: 297mm; background-color: ${C.background}; overflow: hidden;">
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

      // Page 1 : header + client + début du tableau
      if (isFirst) {
        return `
          <div id="quote-page-${pageNum}" ${pageBreakAttr} class="w-[210mm] mx-auto relative shadow-none washi-texture" style="min-height: 297mm; background-color: ${C.background}; overflow: hidden;">
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

      // Dernière page : fin du tableau + total + footer
      if (isLast) {
        return `
          <div id="quote-page-${pageNum}" class="w-[210mm] mx-auto relative shadow-none washi-texture" style="min-height: 297mm; background-color: ${C.background}; overflow: hidden;">
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

      // Pages intermédiaires : suite du tableau uniquement
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