// ═══════════════════════════════════════════════════════════════════════════════
// RENDERER : Creative Studio
// Asymétrique, blocs de couleur audacieux, mini-cartes colorées — vibe studio créatif
// Cible : agences de design, studios photo, branding, direction artistique
// Avec pagination multi-pages A4
// ═══════════════════════════════════════════════════════════════════════════════

import { TemplateDefinition, EditorActiveQuote } from "@/types/editor";
import { splitItemsIntoPages, type TemplatePageHeights } from "./pagination-utils";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0 }).format(n);

// Palette de couleurs vives pour les bordures des mini-cartes
const ACCENT_PALETTE = ["#ff6b6b", "#4ecdc4", "#ffe66d", "#a29bfe", "#fd79a8", "#00b894", "#e17055", "#6c5ce7"];

const PAGE_LAYOUT: TemplatePageHeights = {
  pageContentHeight: 1050,
  headerHeight: 110,        // header asymétrique avec bloc corail
  clientBlockHeight: 130,   // bloc client avec filet vertical teal + badges
  tableHeaderHeight: 32,
  rowHeight: 72,            // mini-cartes colorées avec bordure gauche
  totalCardHeight: 200,
  footerHeight: 90,         // footer split en deux blocs
};

export function renderCreativeStudio(
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

  // Couleurs des accents pour les lignes (cycliques)
  const getAccent = (i: number) => ACCENT_PALETTE[i % ACCENT_PALETTE.length];

  const renderStyles = () => `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
      [id^="quote-page-"] * {
        font-family: 'Inter', sans-serif !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      @page { size: A4; margin: 0; }
      .no-break { page-break-inside: avoid; break-inside: avoid; }
      .page-break-after-always { page-break-after: always; break-after: page; }
      .studio-card {
        background-color: ${C.surface};
        border-radius: 4px;
        padding: 14px 16px;
        position: relative;
        overflow: hidden;
      }
    </style>
  `;

  const renderHeader = () => `
    <div class="flex" style="min-height: 80px;">
      <div style="flex: 1; padding: ${SP.paddingY}px 0 0 ${px};">
        <h1 class="text-[14px] font-black tracking-tighter uppercase leading-none" style="color: ${C.text};">
          ${company?.name || "Studio"}
        </h1>
        <p class="text-[8px] font-medium mt-1.5" style="color: ${C.textMuted};">
          ${company?.address || ""}
        </p>
        <p class="text-[8px] font-medium" style="color: ${C.primary};">
          ${company?.email || ""}
        </p>
      </div>
      <div style="width: 180px; background-color: #ff6b6b; padding: 24px 20px; display: flex; flex-direction: column; justify-content: center; align-items: flex-end;">
        <span style="display: inline-block; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #ffffff; background-color: rgba(255,255,255,0.15); padding: 4px 10px; border-radius: 3px;">
          DEVIS
        </span>
        <p style="font-size: 16px; font-weight: 800; color: #ffffff; margin-top: 8px; letter-spacing: 0.02em;">
          # ${quoteInfo?.number || "---"}
        </p>
      </div>
    </div>
    <div style="height: 3px; background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #ffe66d, #a29bfe); width: 100%;"></div>
  `;

  const renderClientBlock = () => `
    <section class="flex items-start no-break" style="padding: ${gap} ${px} 0 ${px}; margin-bottom: ${gap};">
      <div style="width: 4px; background-color: #4ecdc4; align-self: stretch; margin-right: 16px; border-radius: 2px;"></div>
      <div class="flex-1">
        <p class="text-[7px] font-bold uppercase tracking-widest mb-1" style="color: ${C.textMuted};">Client</p>
        <p class="text-[18px] font-black uppercase tracking-tight leading-tight" style="color: ${C.text};">
          ${client?.name || "Client"}
        </p>
        <p class="text-[9px] font-medium mt-1.5 leading-relaxed" style="color: ${C.textMuted};">
          ${client?.address || ""}
        </p>
        ${client?.email ? `<p class="text-[9px] font-medium" style="color: ${C.textMuted};">${client.email}</p>` : ""}
        ${client?.phone ? `<p class="text-[9px] font-medium" style="color: ${C.textMuted};">${client.phone}</p>` : ""}
      </div>
      <div class="text-right pl-8">
        <div class="mb-2.5">
          <p class="text-[7px] font-bold uppercase tracking-widest mb-0.5" style="color: ${C.textMuted};">Émis le</p>
          <p class="text-[10px] font-bold font-mono" style="color: ${C.text};">${quoteInfo?.issueDate || "---"}</p>
        </div>
        ${dueDate ? `
        <div class="mb-2.5">
          <p class="text-[7px] font-bold uppercase tracking-widest mb-0.5" style="color: ${C.textMuted};">Échéance</p>
          <p class="text-[10px] font-bold font-mono" style="color: ${C.text};">${dueDate}</p>
        </div>` : ""}
        <div>
          <p class="text-[7px] font-bold uppercase tracking-widest mb-0.5" style="color: ${C.textMuted};">Validité</p>
          <p class="text-[10px] font-bold font-mono" style="color: ${C.text};">${validityDays} jours</p>
        </div>
      </div>
    </section>
  `;

  const renderTableHeader = () => `
    <section class="no-break" style="margin-bottom: ${gap};">
      <div class="flex items-center" style="padding: 0 ${px}; margin-bottom: 10px;">
        <div style="flex: 2;">
          <span style="font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: ${C.textMuted};">Prestation</span>
        </div>
        <div style="width: 50px; text-align: center;">
          <span style="font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: ${C.textMuted};">Qté</span>
        </div>
        <div style="width: 90px; text-align: right;">
          <span style="font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: ${C.textMuted};">P.U HT</span>
        </div>
        <div style="width: 110px; text-align: right;">
          <span style="font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: ${C.textMuted};">Total HT</span>
        </div>
      </div>
  `;

  const renderRow = (item: any, i: number) => {
    const accent = getAccent(i);
    return `
    <div class="studio-card no-break" style="margin-bottom: 8px; border-left: 4px solid ${accent};">
      <div class="flex items-center">
        <div style="flex: 2;">
          <p style="font-size: 12px; font-weight: 700; color: ${C.text}; margin: 0;">${item?.title || ""}</p>
          <p style="font-size: 9px; font-weight: 500; color: ${C.textMuted}; margin-top: 3px; max-width: 400px;">${item?.subtitle || ""}</p>
        </div>
        <div style="width: 50px; text-align: center;">
          <span style="font-size: 11px; font-weight: 700; font-family: monospace; color: ${C.text};">${item?.quantity || 0}</span>
        </div>
        <div style="width: 90px; text-align: right;">
          <span style="font-size: 10px; font-family: monospace; color: ${C.textMuted};">${fmt(item?.unitPrice || 0)}</span>
        </div>
        <div style="width: 110px; text-align: right;">
          <span style="font-size: 12px; font-weight: 700; font-family: monospace; color: ${accent};">${fmt((item?.quantity || 0) * (item?.unitPrice || 0))}</span>
        </div>
      </div>
    </div>`;
  };

  const renderTableClose = () => `</section>`;

  const renderTotalCard = () => `
    <section class="flex justify-end no-break" style="padding: 0 ${px}; margin-bottom: ${gap};">
      <div style="width: 280px; background-color: ${C.text}; border-radius: 6px; padding: 20px 24px; color: #ffffff;">
        <div class="flex justify-between items-center py-1.5">
          <span style="font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: rgba(255,255,255,0.6);">Sous-total HT</span>
          <span style="font-size: 12px; font-family: monospace; font-weight: 600; color: rgba(255,255,255,0.85);">${fmt(subTotal)}</span>
        </div>
        <div class="flex justify-between items-center py-1.5" style="border-top: 1px solid rgba(255,255,255,0.1);">
          <span style="font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: rgba(255,255,255,0.6);">TVA (${vatRate}%)</span>
          <span style="font-size: 12px; font-family: monospace; color: rgba(255,255,255,0.55);">${fmt(vat)}</span>
        </div>
        ${discount > 0 ? `
        <div class="flex justify-between items-center py-1.5" style="border-top: 1px solid rgba(255,255,255,0.1);">
          <span style="font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: rgba(255,255,255,0.6);">Remise</span>
          <span style="font-size: 12px; font-family: monospace; font-weight: 600; color: #ff6b6b;">- ${fmt(discount)}</span>
        </div>` : ""}
        <div style="margin-top: 10px; padding-top: 10px; border-top: 2px solid #ff6b6b;">
          <div class="flex justify-between items-center">
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em;">Total TTC</span>
            <span style="font-size: 24px; font-weight: 800; font-family: monospace; letter-spacing: -0.03em; color: #ff6b6b;">${fmt(total)}</span>
          </div>
          <p style="font-size: 8px; font-family: monospace; font-weight: 600; text-align: right; margin-top: 4px; color: rgba(255,255,255,0.4);">${currency}</p>
        </div>
      </div>
    </section>
  `;

  const renderFooter = () => `
    <footer style="padding: 0 ${px} ${SP.paddingY}px ${px};">
      <div style="height: 3px; background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #ffe66d, #a29bfe); width: 100%; margin-bottom: 12px;"></div>
      <div class="flex justify-between items-start">
        <div style="flex: 1;">
          <p style="font-size: 7px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: ${C.textMuted};">
            ${quoteInfo?.terms || `Paiement à réception. Validité : ${validityDays} jours.`}
          </p>
        </div>
        <div style="width: 200px; margin-left: 24px; text-align: right;">
          <div style="background-color: #4ecdc4; padding: 8px 12px; border-radius: 4px; display: inline-block;">
            <p style="font-size: 7px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #ffffff; margin: 0;">
              Créé avec passion
            </p>
            <p style="font-size: 8px; font-weight: 600; color: rgba(255,255,255,0.85); margin-top: 2px;">
              ${company?.name || "Studio"}
            </p>
          </div>
          <p style="font-size: 6px; font-weight: 500; color: ${C.textMuted}; margin-top: 6px;">
            Généré le ${new Date().toLocaleDateString("fr-FR")}
          </p>
        </div>
      </div>
    </footer>
  `;

  const renderMiniHeader = (pageNum: number) => `
    <div class="flex" style="min-height: 50px;">
      <div style="flex: 1; padding: 20px 0 0 ${px};">
        <span style="display: inline-block; font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: ${C.textMuted}; background-color: ${C.highlight}; padding: 4px 10px; border-radius: 3px;">
          ${quoteInfo?.number || "---"} — Suite
        </span>
      </div>
      <div style="width: 100px; background-color: #ff6b6b; padding: 12px 16px; text-align: right;">
        <p style="font-size: 9px; font-weight: 700; color: #ffffff;">
          ${pageNum} / ${totalPages}
        </p>
      </div>
    </div>
    <div style="height: 3px; background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #ffe66d, #a29bfe); width: 100%;"></div>
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
            ${renderTotalCard()}
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
            </div>
            ${renderTotalCard()}
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