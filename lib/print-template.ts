// ═══════════════════════════════════════════════════════════════════════════════
// PRINT STYLES — Tokens A4 alignés sur le dialecte STUDIO
// Le document A4 suit les mêmes principes que l'éditeur Studio :
//   - Labels :   text-[7px] à text-[8px] font-mono uppercase tracking-wider
//   - Données :  text-[10px] font-mono (cf. STUDIO_MONO)
//   - Palette :  slate-900 / slate-700 / slate-500 / slate-400, indigo-600
// Les tailles print sont naturellement plus grandes que l'UI écran
// pour garantir la lisibilité sur papier.
// Voir DESIGN_SYSTEM.md §11 pour la documentation complète.
// ═══════════════════════════════════════════════════════════════════════════════

export const PRINT_STYLES = {
  // ─── Labels (cf. STUDIO_LABEL) ───
  label:     "text-[7px] font-mono uppercase tracking-wider text-slate-900",
  labelAccent: "text-[8px] font-mono uppercase tracking-wider text-slate-900",
  labelLight:"text-[7px] font-mono uppercase tracking-wider text-slate-900",

  // ─── Données (cf. STUDIO_MONO) ───
  data:     "text-[10px] font-mono font-bold text-slate-900",
  dataMono: "text-[10px] font-mono text-slate-900",
  dataLarge:"text-[11px] font-mono font-bold text-slate-900",

  // ─── Badge / meta (cf. Studio CompactAlert) ───
  badge:    "inline-flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-md border border-slate-100",

  // ─── Company ───
  companyName:  "text-[11px] font-black uppercase tracking-wide text-slate-900",
  companyInfo:  "text-[9px] text-slate-900 font-medium leading-tight",
  companyEmail: "text-indigo-600",

  // ─── Client card ───
  clientName:   "text-[14px] font-black uppercase text-slate-900",
  clientInfo:   "text-[9px] text-slate-900 font-medium leading-normal",

  // ─── Table ───
  tableHead: "text-[8px] font-mono uppercase tracking-widest text-slate-900",
  itemTitle: "text-[11px] font-bold text-slate-900 mb-0.5 uppercase",
  itemDesc:  "text-[9px] text-slate-900 font-medium leading-relaxed",
  itemQty:   "text-[10px] font-mono font-bold text-slate-900",
  itemPrice: "text-[10px] font-mono text-slate-900",
  itemTotal: "text-[11px] font-mono font-bold text-slate-900",

  // ─── Total card ───
  totalCard:      "w-[85mm] bg-white rounded-lg border border-slate-200 p-6 relative overflow-hidden",
  totalLabel:     "text-[10px] font-black uppercase tracking-wider text-slate-900",
  totalValue:     "text-[26px] font-black font-mono tracking-tighter leading-none text-slate-900",
  totalRowLabel:  "text-[9px] font-bold uppercase tracking-wider text-slate-900",
  totalRowValue:  "font-mono text-[11px] text-slate-900",

  // ─── Footer ───
  footerLabel: "text-[7px] font-mono uppercase tracking-wider text-slate-900",
  footerText:  "text-[7px] text-slate-900 leading-relaxed italic uppercase",

  // ─── Bank details ───
};

export const generateQuoteHTML = (
  quote: any,
  themeColor: string = "#6366f1",
) => {
  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0 }).format(n);

  const S = PRINT_STYLES; // shorthand

  // --- EXTRACTION ---
  const items = quote?.items || [];
  const financials = quote?.financials || {};
  const company = quote?.company || {};
  const client = quote?.client || {};
  const quoteInfo = quote?.quote || {};
  // ─── CHAMPS LÉGAUX ───
  const currency = quote?.currency || "XOF";
  const dueDate = quoteInfo?.dueDate;
  const validityDays = quote?.validityDays || 30;

  // --- CALCULS ---
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

  return `
    <div id="quote-container" class="w-[210mm] min-h-[296mm] mx-auto bg-white flex flex-col text-slate-800 relative shadow-none">
      
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
        
        * {
          font-family: 'Inter', sans-serif !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }

        @page {
          size: A4;
          margin: 0;
        }

        .no-break {
          page-break-inside: avoid;
          break-inside: avoid;
        }
      </style>

      <div class="h-2 w-full flex-none" style="background-color: ${themeColor}"></div>

      <header class="px-10 pt-8 pb-6 flex justify-between items-start flex-none">
        <div class="max-w-[60%]">
          <h1 class="text-[30px] font-black uppercase tracking-tighter leading-none text-slate-900 mb-3">
            ${quote?.title || "PROJET_INSTANCE"}
          </h1>
          <div class="${S.badge}">
            <span class="${S.label}">RÉF</span>
            <span class="${S.data}">${quoteInfo?.number || "---"}</span>
          </div>
        </div>

        <div class="text-right flex flex-col items-end">
          <div class="${S.companyName} mb-1">${company?.name || ""}</div>
          <div class="${S.companyInfo}">
            ${company?.address || ""}<br/>
            <span class="${S.companyEmail}">${company?.email || ""}</span>
          </div>
          <div class="mt-2 ${S.badge}">
            <span class="${S.label}">${company?.taxIdLabel || "RCCM"} : ${company?.taxId || "---"}</span>
          </div>
          ${client?.taxId ? `<div class="mt-1 ${S.badge}"><span class="${S.label}">TVA Client : ${client.taxId}</span></div>` : ""}
        </div>
      </header>

      <section class="mx-10 mb-6 bg-slate-50 rounded-xl p-5 flex justify-between items-start border border-slate-100 flex-none">
        <div class="flex-1">
          <p class="${S.label} mb-2">Facturé à</p>
          <p class="${S.clientName} mb-1">${client?.name || "Client"}</p>
          <p class="${S.clientInfo} max-w-[90%] whitespace-pre-line">${client?.address || ""}</p>
        </div>
        
        <div class="text-right pl-6 border-l border-slate-200">
          <div class="mb-3">
            <p class="${S.label} mb-0.5">Émis le</p>
            <p class="${S.data}">${quoteInfo?.issueDate || "---"}</p>
          </div>
          ${
            dueDate
              ? `
          <div class="mb-3">
            <p class="${S.label} mb-0.5">Échéance</p>
            <p class="${S.data}">${dueDate}</p>
          </div>
          `
              : ""
          }
          <div>
            <p class="${S.label} mb-0.5">Validité</p>
            <p class="${S.data}">${validityDays} Jours</p>
          </div>
        </div>
      </section>

      <section class="mx-10 flex-1">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b-2 border-slate-100">
              <th class="pb-3 pr-4 ${S.tableHead}">Désignation</th>
              <th class="pb-3 px-2 ${S.tableHead} text-center w-16">Qté</th>
              <th class="pb-3 px-4 ${S.tableHead} text-right w-28">P.U HT</th>
              <th class="pb-3 pl-4 ${S.tableHead} text-right w-32">Total HT</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            ${items
              .map(
                (item: any) => `
              <tr class="no-break">
                <td class="py-4 pr-4 align-top">
                  <p class="${S.itemTitle}">${item?.title || ""}</p>
                  <p class="${S.itemDesc} max-w-[420px]">${item?.subtitle || ""}</p>
                </td>
                <td class="py-4 px-2 align-top text-center ${S.itemQty}">
                  ${item?.quantity || 0}
                </td>
                <td class="py-4 px-4 align-top text-right ${S.itemPrice}">
                  ${fmt(item?.unitPrice || 0)}
                </td>
                <td class="py-4 pl-4 align-top text-right ${S.itemTotal}">
                  ${fmt((item?.quantity || 0) * (item?.unitPrice || 0))}
                </td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </section>

      <section class="mx-10 mt-6 mb-10 flex justify-end no-break">
        <div class="${S.totalCard}">
          <div class="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[60px] opacity-25" style="background-color: ${themeColor}"></div>
          
          <div class="relative z-10 space-y-2.5">
            <div class="flex justify-between items-center">
              <span class="${S.totalRowLabel}">Sous-total HT</span>
              <span class="${S.totalRowValue}">${fmt(subTotal)}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="${S.totalRowLabel}">TVA (${vatRate}%)</span>
              <span class="${S.totalRowValue}">${fmt(vat)}</span>
            </div>
            
            <div class="mt-4 pt-4 border-t border-slate-200 flex justify-between items-end">
              <div>
                <span class="${S.totalLabel} block">Net à Payer</span>
                <span class="${S.labelLight}">Devise : ${currency}</span>
              </div>
              <span class="${S.totalValue}">${fmt(total)}</span>
            </div>
          </div>
        </div>
      </section>

      <footer class="px-10 pb-8 mt-auto flex-none">
        <div class="border-t border-slate-100 pt-4 flex justify-between items-end">
          <div class="max-w-[50%]">
            <span class="${S.footerLabel} block mb-1.5">Mentions Légales</span>
            <p class="${S.footerText}">${quoteInfo?.terms || `Paiement à réception. Validité : ${validityDays} jours.`}</p>
          </div>
          <div class="text-right">
             <p class="text-[8px] font-black uppercase text-slate-900 tracking-tighter italic">Généré via Instance OS</p>
             <p class="${S.labelLight} mt-0.5">${new Date().toLocaleDateString("fr-FR")}</p>
          </div>
        </div>
      </footer>
    </div>
  `;
};