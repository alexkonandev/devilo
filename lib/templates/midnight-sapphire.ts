// ═══════════════════════════════════════════════════════════════════════════════
// RENDERER : Midnight Sapphire 🧿
// Glassmorphisme deep blue & or — nuit étoilée luxueuse
// Cible : marques de luxe, cabinets conseil, fintech
// Avec pagination multi-pages A4
// ═══════════════════════════════════════════════════════════════════════════════

import { TemplateDefinition, EditorActiveQuote } from "@/types/editor";
import { splitItemsIntoPages, type TemplatePageHeights } from "./pagination-utils";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0 }).format(n);

const PAGE_LAYOUT: TemplatePageHeights = {
  pageContentHeight: 1000,   // 297mm — paddings 52px haut/bas
  headerHeight: 110,          // header avec titre + glow line
  clientBlockHeight: 150,     // bloc client glass + dates + gap
  tableHeaderHeight: 40,      // en-tête du tableau
  rowHeight: 64,              // une ligne (padding + contenu)
  totalCardHeight: 210,       // carte total TTC + espacement
  footerHeight: 70,           // footer avec double ligne or
};

export function renderMidnightSapphire(
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
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400&family=Inter:wght@300;400;600;800&display=swap');
      [id^="quote-page-"] * {
        font-family: 'Inter', sans-serif !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      [id^="quote-page-"] h1, .font-playfair { font-family: 'Playfair Display', serif !important; }
      @page { size: A4; margin: 0; }
      .no-break { page-break-inside: avoid; break-inside: avoid; }
      .glass-card {
        background-color: rgba(255, 255, 255, 0.03);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(59, 130, 246, 0.2);
        border-radius: 12px;
        padding: 18px 22px;
      }
      .sapphire-glow {
        box-shadow: 0 0 30px rgba(59, 130, 246, 0.12), 0 0 60px rgba(201, 168, 76, 0.06);
      }
      .gold-line {
        height: 1px;
        background: linear-gradient(90deg, transparent, ${C.accent}, transparent);
        width: 100%;
      }
      .gold-double-line {
        height: 2px;
        background: linear-gradient(90deg, transparent, ${C.accent}40, ${C.accent}, ${C.accent}40, transparent);
        width: 100%;
        margin-bottom: 4px;
      }
      .starfield-bg {
        background-image:
          radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.15), transparent),
          radial-gradient(1px 1px at 40% 70%, rgba(255,255,255,0.1), transparent),
          radial-gradient(1.5px 1.5px at 60% 20%, rgba(201,168,76,0.2), transparent),
          radial-gradient(1px 1px at 80% 60%, rgba(255,255,255,0.12), transparent),
          radial-gradient(1.5px 1.5px at 10% 80%, rgba(59,130,246,0.18), transparent),
          radial-gradient(1px 1px at 70% 90%, rgba(255,255,255,0.08), transparent),
          radial-gradient(1px 1px at 90% 10%, rgba(201,168,76,0.15), transparent),
          radial-gradient(1px 1px at 50% 50%, rgba(255,255,255,0.06), transparent);
        background-size: 200px 200px;
      }
      .table-row-alt {
        background-color: rgba(255, 255, 255, 0.02);
      }
      .page-break-after-always {
        page-break-after: always;
        break-after: page;
      }
    </style>
  `;

  const renderHeader = () => `
    <header class="flex justify-between items-start starfield-bg" style="padding: ${py} ${px} ${gap} ${px}; background-color: ${C.background}; position: relative;">
      <div style="position: relative; z-index: 1;">
        <h1 class="font-playfair text-[26px] font-bold tracking-tight italic" style="color: ${C.accent};">
          ${quote?.title || "DEVIS"}
        </h1>
        <p class="text-[10px] mt-1 tracking-widest uppercase" style="color: ${C.textMuted}; font-family: monospace;">
          N° ${quoteInfo?.number || "---"}
        </p>
      </div>
      <div class="text-right" style="position: relative; z-index: 1;">
        <div class="font-playfair" style="font-size: 16px; font-weight: 600; color: ${C.text}; letter-spacing: 0.02em;">${company?.name || ""}</div>
        <div style="font-size: 9px; color: ${C.textMuted}; margin-top: 4px; line-height: 1.5;">
          ${company?.address || ""}
        </div>
        <div style="font-size: 9px; color: ${C.primary}; font-weight: 500; margin-top: 2px;">
          ${company?.email || ""}
        </div>
      </div>
    </header>
    <div style="padding: 0 ${px}; margin-bottom: ${gap};">
      <div class="gold-line"></div>
    </div>
  `;

  const renderClientBlock = () => `
    <section class="flex justify-between items-start no-break glass-card" style="margin-bottom: ${gap}; border-color: rgba(59,130,246,0.3);">
      <div>
        <p class="text-[7px] tracking-[0.2em] uppercase font-bold mb-1.5" style="color: ${C.primary}; font-family: monospace;">Client</p>
        <p class="font-playfair text-[15px] font-semibold tracking-tight" style="color: ${C.text};">${client?.name || "Client"}</p>
        <p class="text-[9px] mt-1.5 leading-relaxed" style="color: ${C.textMuted}; font-weight: 300;">${client?.address || ""}</p>
        ${client?.email ? `<p class="text-[9px] font-light" style="color: ${C.textMuted};">${client.email}</p>` : ""}
        ${client?.phone ? `<p class="text-[9px] font-light" style="color: ${C.textMuted};">${client.phone}</p>` : ""}
      </div>
      <div class="text-right" style="min-width: 160px;">
        <div class="mb-3">
          <p class="text-[7px] tracking-[0.2em] uppercase font-bold mb-0.5" style="color: ${C.primary}; font-family: monospace;">Émis le</p>
          <p class="text-[11px] font-semibold tracking-wide" style="color: ${C.text}; font-family: monospace;">${quoteInfo?.issueDate || "---"}</p>
        </div>
        ${dueDate ? `
        <div class="mb-3">
          <p class="text-[7px] tracking-[0.2em] uppercase font-bold mb-0.5" style="color: ${C.primary}; font-family: monospace;">Échéance</p>
          <p class="text-[11px] font-semibold tracking-wide" style="color: ${C.text}; font-family: monospace;">${dueDate}</p>
        </div>` : ""}
        <div>
          <p class="text-[7px] tracking-[0.2em] uppercase font-bold mb-0.5" style="color: ${C.primary}; font-family: monospace;">Validité</p>
          <p class="text-[11px] font-semibold tracking-wide" style="color: ${C.text}; font-family: monospace;">${validityDays} jours</p>
        </div>
      </div>
    </section>
  `;

  const renderTableHeader = () => `
    <section class="no-break" style="margin-bottom: 0;">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr>
            <th style="background-color: rgba(59,130,246,0.08); color: ${C.primary}; padding: 10px 14px; text-align: left; font-size: 7px; font-family: monospace; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; border-bottom: 1px solid rgba(59,130,246,0.2);">
              Désignation
            </th>
            <th style="background-color: rgba(59,130,246,0.08); color: ${C.primary}; padding: 10px 8px; text-align: center; font-size: 7px; font-family: monospace; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; border-bottom: 1px solid rgba(59,130,246,0.2); width: 60px;">
              Qté
            </th>
            <th style="background-color: rgba(59,130,246,0.08); color: ${C.primary}; padding: 10px 8px; text-align: right; font-size: 7px; font-family: monospace; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; border-bottom: 1px solid rgba(59,130,246,0.2); width: 100px;">
              P.U HT
            </th>
            <th style="background-color: rgba(59,130,246,0.08); color: ${C.primary}; padding: 10px 14px; text-align: right; font-size: 7px; font-family: monospace; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; border-bottom: 1px solid rgba(59,130,246,0.2); width: 120px;">
              Total HT
            </th>
          </tr>
        </thead>
        <tbody>
  `;

  const renderRow = (item: any, i: number) => `
    <tr class="no-break ${i % 2 === 0 ? 'table-row-alt' : ''}" style="border-bottom: 1px solid rgba(59,130,246,0.08);">
      <td style="padding: 12px 14px; vertical-align: top;">
        <p class="font-playfair" style="font-size: 11px; font-weight: 600; color: ${C.text}; margin: 0;">${item?.title || ""}</p>
        <p style="font-size: 8px; font-weight: 300; color: ${C.textMuted}; margin-top: 3px; max-width: 380px; line-height: 1.4;">${item?.subtitle || ""}</p>
      </td>
      <td style="padding: 12px 8px; vertical-align: top; text-align: center;">
        <span style="font-size: 10px; font-family: monospace; font-weight: 600; color: ${C.text};">${item?.quantity || 0}</span>
      </td>
      <td style="padding: 12px 8px; vertical-align: top; text-align: right;">
        <span style="font-size: 10px; font-family: monospace; color: ${C.textMuted}; font-weight: 300;">${fmt(item?.unitPrice || 0)}</span>
      </td>
      <td style="padding: 12px 14px; vertical-align: top; text-align: right;">
        <span style="font-size: 11px; font-family: monospace; font-weight: 600; color: ${C.text};">${fmt((item?.quantity || 0) * (item?.unitPrice || 0))}</span>
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
      <div class="glass-card sapphire-glow" style="width: 300px; border-color: rgba(201,168,76,0.3);">
        <div class="flex justify-between items-center py-2">
          <span class="text-[9px] tracking-[0.15em] uppercase font-bold" style="color: ${C.textMuted};">Sous-total HT</span>
          <span class="text-[13px] font-semibold tracking-wide" style="color: ${C.text}; font-family: monospace;">${fmt(subTotal)}</span>
        </div>
        <div class="flex justify-between items-center py-2" style="border-top: 1px solid rgba(255,255,255,0.06);">
          <span class="text-[9px] tracking-[0.15em] uppercase font-bold" style="color: ${C.textMuted};">TVA (${vatRate}%)</span>
          <span class="text-[13px] font-light tracking-wide" style="color: ${C.textMuted}; font-family: monospace;">${fmt(vat)}</span>
        </div>
        ${discount > 0 ? `
        <div class="flex justify-between items-center py-2" style="border-top: 1px solid rgba(255,255,255,0.06);">
          <span class="text-[9px] tracking-[0.15em] uppercase font-bold" style="color: ${C.textMuted};">Remise</span>
          <span class="text-[13px] font-semibold tracking-wide" style="color: ${C.accent}; font-family: monospace;">- ${fmt(discount)}</span>
        </div>` : ""}
        <div style="margin-top: 10px; padding-top: 12px; border-top: 2px solid ${C.accent};">
          <div class="flex justify-between items-center">
            <span class="font-playfair text-[13px] font-bold italic tracking-wider" style="color: ${C.accent};">Total TTC</span>
            <span class="text-[28px] font-bold tracking-tighter" style="color: ${C.text}; font-family: monospace;">${fmt(total)}</span>
          </div>
          <p class="text-[7px] tracking-[0.15em] uppercase font-bold text-right mt-1" style="color: ${C.textMuted}; font-family: monospace;">${currency}</p>
        </div>
      </div>
    </section>
  `;

  const renderFooter = () => `
    <footer style="padding: 0 ${px} ${py} ${px}; background-color: ${C.background};">
      <div class="gold-double-line"></div>
      <div style="height: 1px; background: linear-gradient(90deg, transparent, ${C.accent}20, transparent); width: 100%;"></div>
      <div style="padding-top: 10px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <p class="text-[7px] tracking-[0.12em] uppercase" style="color: ${C.textMuted}; font-family: monospace;">
            ${quoteInfo?.terms || `Paiement à réception. Validité : ${validityDays} jours.`}
          </p>
        </div>
        <div class="text-right">
          <p class="text-[7px] tracking-[0.15em] uppercase font-bold" style="color: ${C.accent}; font-family: monospace;">
            Document confidentiel — Saphir
          </p>
          <p class="text-[6px] tracking-wider mt-0.5" style="color: ${C.textMuted}; font-family: monospace;">
            Généré le ${new Date().toLocaleDateString("fr-FR")}
          </p>
        </div>
      </div>
    </footer>
  `;

  const renderMiniHeader = (pageNum: number) => `
    <div style="padding: 16px ${px} 0 ${px}; background-color: ${C.background};">
      <div class="flex justify-between items-center">
        <p class="font-playfair text-[11px] italic font-semibold tracking-wide" style="color: ${C.textMuted};">
          ${quote?.title || "DEVIS"} N° ${quoteInfo?.number || "---"} — Suite
        </p>
        <p class="text-[8px] tracking-[0.15em] uppercase font-bold" style="color: ${C.accent}; font-family: monospace;">
          Page ${pageNum} / ${totalPages}
        </p>
      </div>
      <div style="margin-top: 10px;">
        <div class="gold-line"></div>
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
          <div id="quote-page-${pageNum}" ${pageBreakAttr} class="w-[210mm] mx-auto relative shadow-none" style="min-height: 297mm; background-color: ${C.background};">
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