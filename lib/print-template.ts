// lib/print-template.ts

export const generateQuoteHTML = (
  quote: any,
  themeColor: string = "#6366f1",
) => {
  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 0 }).format(n);

  // --- EXTRACTION ---
  const items = quote?.items || [];
  const financials = quote?.financials || {};
  const company = quote?.company || {};
  const client = quote?.client || {};
  const quoteInfo = quote?.quote || {};
  // ─── NOUVEAUX CHAMPS LÉGAUX (Phase 4 - Bloqueurs Critiques) ───
  const currency = quote?.currency || "XOF";
  const dueDate = quoteInfo?.dueDate;
  const validityDays = quote?.validityDays || 30;
  // Coordonnées bancaires (snapshot)
  const bankName = quote?.bankName || "";
  const bankIBAN = quote?.bankIBAN || "";
  const bankSWIFT = quote?.bankSWIFT || "";
  const bankBIC = quote?.bankBIC || "";

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

        /* Empêche le bloc noir de se couper entre deux pages */
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
          <div class="inline-flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
            <span class="text-[8px] font-black uppercase tracking-widest text-slate-400 text-[7px]">RÉF</span>
            <span class="text-[10px] font-mono font-bold text-slate-700">${quoteInfo?.number || "---"}</span>
          </div>
        </div>

        <div class="text-right flex flex-col items-end">
          <div class="text-[11px] font-black uppercase tracking-wide text-slate-900 mb-1">${company?.name || ""}</div>
          <div class="text-[9px] text-slate-500 font-medium leading-tight">
            ${company?.address || ""}<br/>
            <span class="text-indigo-600">${company?.email || ""}</span>
          </div>
          <div class="mt-2 text-[7px] font-mono font-bold uppercase tracking-widest text-slate-400 px-1.5 py-0.5 bg-slate-50 rounded border border-slate-100">
            ${company?.taxIdLabel || "RCCM"} : ${company?.taxId || "---"}
          </div>
          ${client?.taxId ? `<div class="mt-1 text-[7px] font-mono font-bold uppercase tracking-widest text-slate-400 px-1.5 py-0.5 bg-slate-50 rounded border border-slate-100">TVA Client : ${client.taxId}</div>` : ""}
        </div>
      </header>

      <section class="mx-10 mb-6 bg-slate-50 rounded-xl p-5 flex justify-between items-start border border-slate-100 flex-none">
        <div class="flex-1">
          <p class="text-[7px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Facturé à</p>
          <p class="text-[14px] font-black uppercase text-slate-900 mb-1">${client?.name || "Client"}</p>
          <p class="text-[9px] text-slate-500 font-medium leading-normal max-w-[90%] whitespace-pre-line">${client?.address || ""}</p>
        </div>
        
        <div class="text-right pl-6 border-l border-slate-200">
          <div class="mb-3">
            <p class="text-[7px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Émis le</p>
            <p class="text-[10px] font-bold text-slate-700">${quoteInfo?.issueDate || "---"}</p>
          </div>
          ${
            dueDate
              ? `
          <div class="mb-3">
            <p class="text-[7px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Échéance</p>
            <p class="text-[10px] font-bold text-slate-700">${dueDate}</p>
          </div>
          `
              : ""
          }
          <div>
            <p class="text-[7px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Validité</p>
            <p class="text-[10px] font-bold text-slate-700">${validityDays} Jours</p>
          </div>
        </div>
      </section>

      <section class="mx-10 flex-1">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b-2 border-slate-100">
              <th class="pb-3 pr-4 text-[8px] font-black uppercase tracking-widest text-slate-400">Désignation</th>
              <th class="pb-3 px-2 text-[8px] font-black uppercase tracking-widest text-slate-400 text-center w-16">Qté</th>
              <th class="pb-3 px-4 text-[8px] font-black uppercase tracking-widest text-slate-400 text-right w-28">P.U HT</th>
              <th class="pb-3 pl-4 text-[8px] font-black uppercase tracking-widest text-slate-400 text-right w-32">Total HT</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            ${items
              .map(
                (item: any) => `
              <tr class="no-break">
                <td class="py-4 pr-4 align-top">
                  <p class="text-[11px] font-bold text-slate-900 mb-0.5 uppercase">${item?.title || ""}</p>
                  <p class="text-[9px] text-slate-500 font-medium leading-relaxed max-w-[420px]">${item?.subtitle || ""}</p>
                </td>
                <td class="py-4 px-2 align-top text-center text-[10px] font-mono font-bold text-slate-600">
                  ${item?.quantity || 0}
                </td>
                <td class="py-4 px-4 align-top text-right text-[10px] font-mono text-slate-500">
                  ${fmt(item?.unitPrice || 0)}
                </td>
                <td class="py-4 pl-4 align-top text-right text-[11px] font-mono font-bold text-slate-900">
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
        <div class="w-[85mm] bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
          <div class="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[40px] opacity-30" style="background-color: ${themeColor}"></div>
          
          <div class="relative z-10 space-y-2.5">
            <div class="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-slate-400">
              <span>Sous-total HT</span>
              <span class="font-mono text-[11px]">${fmt(subTotal)}</span>
            </div>
            <div class="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-slate-400">
              <span>TVA (${vatRate}%)</span>
              <span class="font-mono text-[11px]">${fmt(vat)}</span>
            </div>
            
            <div class="mt-4 pt-4 border-t border-white/10 flex justify-between items-end">
              <div>
                <span class="text-[10px] font-black uppercase tracking-widest text-white block">Net à Payer</span>
                <span class="text-[7px] text-slate-500 uppercase font-bold tracking-[0.2em]">Devise : ${currency}</span>
              </div>
              <span class="text-[26px] font-black font-mono tracking-tighter leading-none text-white italic">
                ${fmt(total)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <footer class="px-10 pb-8 mt-auto flex-none">
        <div class="border-t border-slate-100 pt-4 flex justify-between items-end">
          <div class="max-w-[50%]">
            <span class="text-[7px] font-black uppercase tracking-widest text-slate-300 block mb-1.5">Mentions Légales</span>
            <p class="text-[7px] text-slate-400 leading-relaxed italic uppercase">
              ${quoteInfo?.terms || `Paiement à réception. Validité : ${validityDays} jours.`}
            </p>
            ${
              bankIBAN || bankSWIFT
                ? `
            <div class="mt-4 pt-3 border-t border-slate-200 bg-slate-50/50 rounded-lg px-3 py-2">
              <span class="text-[8px] font-black uppercase tracking-[0.15em] text-slate-600 block mb-2 flex items-center gap-1.5">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-indigo-500">
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                  <line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
                Coordonnées bancaires
              </span>
              <div class="space-y-1">
                ${bankName ? `<p class="text-[9px] font-semibold text-slate-700">${bankName}</p>` : ""}
                <div class="flex flex-wrap gap-x-4 gap-y-1">
                  ${bankIBAN ? `<p class="text-[8px] font-mono text-slate-600 bg-white px-2 py-1 rounded border border-slate-200">IBAN: ${bankIBAN}</p>` : ""}
                  ${bankSWIFT ? `<p class="text-[8px] font-mono text-slate-600 bg-white px-2 py-1 rounded border border-slate-200">SWIFT: ${bankSWIFT}</p>` : ""}
                  ${bankBIC ? `<p class="text-[8px] font-mono text-slate-600 bg-white px-2 py-1 rounded border border-slate-200">BIC: ${bankBIC}</p>` : ""}
                </div>
              </div>
            </div>
            `
                : `<div class="mt-4 pt-3 border-t border-slate-100 text-center">
                    <span class="text-[8px] text-slate-400 italic">Aucune coordonnée bancaire configurée</span>
                   </div>`
            }
          </div>
          <div class="text-right">
             <p class="text-[8px] font-black uppercase text-slate-900 tracking-tighter italic">Généré via Instance OS</p>
             <p class="text-[7px] text-slate-300 mt-0.5">${new Date().toLocaleDateString("fr-FR")}</p>
          </div>
        </div>
      </footer>
    </div>
  `;
};
