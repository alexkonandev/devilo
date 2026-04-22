import { ClientListItem } from "@/types/client";

export function generateAuditHtml(client: ClientListItem): string {
  const dateStr = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const formattedLtv = new Intl.NumberFormat("fr-CI").format(client.totalSpent);

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=JetBrains+Mono:wght@700&display=swap');
        
        /* CONFIGURATION A4 STRICTE */
        @page {
          size: A4;
          margin: 0;
        }
        
        body {
          font-family: 'Inter', sans-serif;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        .font-mono { font-family: 'JetBrains+Mono', monospace; }

        /* ÉVITER LA COUPURE DES LIGNES DE TABLEAU */
        tr { page-break-inside: avoid; }
        
        /* FILIGRANE "CONFIDENTIEL" DISCRET */
        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 150px;
          font-weight: 900;
          color: rgba(241, 245, 249, 0.5); /* Slate-100 très clair */
          z-index: -1;
          pointer-events: none;
          white-space: nowrap;
        }
      </style>
    </head>
    <body class="bg-white text-slate-900">
      <div class="watermark uppercase tracking-widest">Confidentiel</div>

      <div class="w-[210mm] min-h-[297mm] mx-auto p-16 relative">
        
        <header class="flex justify-between items-end border-b-8 border-slate-900 pb-10">
          <div class="space-y-4">
            <div class="bg-slate-900 text-white px-3 py-1 inline-block text-[10px] font-black uppercase tracking-[0.3em]">
              SaaS_Audit_System_v1
            </div>
            <h1 class="text-5xl font-black uppercase tracking-tighter leading-none italic italic">
              Audit<br/>Stratégique
            </h1>
          </div>
          <div class="text-right space-y-1">
            <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Client_Reference</p>
            <p class="text-xl font-black uppercase">${client.name}</p>
            <p class="text-[10px] font-mono font-bold text-slate-400">${dateStr}</p>
          </div>
        </header>

        <section class="grid grid-cols-2 gap-px bg-slate-200 border border-slate-200 mt-12 shadow-2xl">
          <div class="bg-white p-8">
            <span class="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-2">Total_Revenue_LTV</span>
            <span class="text-3xl font-black font-mono tracking-tighter">${formattedLtv}</span>
            <span class="text-xs font-bold text-slate-400 ml-1">XOF</span>
          </div>
          <div class="bg-white p-8 border-l border-slate-200">
            <span class="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-2">Engagement_Index</span>
            <span class="text-3xl font-black font-mono tracking-tighter">${
              client.quoteCount
            }</span>
            <span class="text-xs font-bold text-slate-400 ml-1">DOCS</span>
          </div>
        </section>

        <section class="mt-16">
          <div class="flex items-center gap-4 mb-8">
            <div class="h-[1px] flex-1 bg-slate-200"></div>
            <h3 class="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Flux_Financiers_Détaillés</h3>
            <div class="h-[1px] flex-1 bg-slate-200"></div>
          </div>

          <table class="w-full">
            <thead>
              <tr class="text-left border-b-2 border-slate-900">
                <th class="py-4 text-[9px] font-black uppercase tracking-widest">ID_Transaction</th>
                <th class="py-4 text-[9px] font-black uppercase tracking-widest text-right">Valeur_Net</th>
                <th class="py-4 text-[9px] font-black uppercase tracking-widest text-right">Statut_Sync</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${client.quotes
                .map(
                  (quote) => `
                <tr>
                  <td class="py-5 font-mono text-[11px] font-bold text-slate-500">${
                    quote.number
                  }</td>
                  <td class="py-5 text-right font-black text-[12px]">${new Intl.NumberFormat(
                    "fr-CI"
                  ).format(
                    quote.totalAmount
                  )} <span class="text-[9px] text-slate-400">XOF</span></td>
                  <td class="py-5 text-right">
                    <span class="text-[8px] font-black bg-slate-100 px-2 py-1 rounded-none uppercase tracking-widest">Verified</span>
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </section>

        <footer class="absolute bottom-16 left-16 right-16">
          <div class="flex justify-between items-center border-t border-slate-200 pt-8">
            <div class="text-[8px] font-mono text-slate-400 leading-relaxed uppercase">
              Ce document est généré algorithmiquement.<br/>
              Toute altération rend le contenu caduc.
            </div>
            <div class="text-right">
              <div class="text-[14px] font-black italic tracking-tighter mb-1">SMART_SAAS</div>
              <div class="w-full h-1 bg-emerald-500"></div>
            </div>
          </div>
        </footer>

      </div>
    </body>
    </html>
  `;
}
