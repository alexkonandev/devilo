"use client";

import React, { forwardRef, useMemo } from "react";
import { EditorActiveQuote, EditorTheme } from "@/types/editor";
import { cn } from "@/lib/utils";

interface PrintableQuoteProps {
  quote: EditorActiveQuote;
  theme: EditorTheme;
}

/**
 * COMPOSANT : PrintableQuote
 * MISSION : Rendu haute précision du document final.
 * STYLE : Industrial Blueprint v3.0 (Zéro fioriture, Impact maximal).
 */
const PrintableQuote = forwardRef<HTMLDivElement, PrintableQuoteProps>(
  ({ quote, theme }, ref) => {
    // --- 1. LOGIQUE FINANCIÈRE SANS ANY ---
    const financials = useMemo(() => {
      const subTotal = quote.items.reduce(
        (acc, item) =>
          acc + (Number(item.quantity) * Number(item.unitPrice) || 0),
        0
      );
      const discount = Number(quote.financials.discountAmountEuros) || 0;
      const taxable = Math.max(0, subTotal - discount);
      const vatRate = Number(quote.financials.vatRatePercent) || 0;
      const vatAmount = taxable * (vatRate / 100);

      return {
        subTotal,
        discount,
        taxable,
        vatAmount,
        totalTTC: taxable + vatAmount,
      };
    }, [quote.items, quote.financials]);

    const primaryColor = theme?.color || "#4f46e5";

    return (
      <div className="relative bg-white select-text">
        {/* CONFIGURATION PRINT ENGINE */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @page { size: A4; margin: 0; }
          @media print {
            body { -webkit-print-color-adjust: exact; }
            .no-print { display: none; }
          }
          .font-mono-numbers { font-variant-numeric: tabular-nums; }
        `,
          }}
        />

        <div
          ref={ref}
          className={cn(
            "w-[210mm] min-h-[297mm] mx-auto bg-white flex flex-col p-[20mm]",
            "border border-slate-100 print:border-0 rounded-none transition-all"
          )}
        >
          {/* --- HEADER : ARCHITECTURAL LAYOUT --- */}
          <div className="flex justify-between items-start mb-24">
            <div className="flex flex-col gap-4">
              {/* Ligne de force colorée pour le branding */}
              <div
                className="w-12 h-2"
                style={{ backgroundColor: primaryColor }}
              />
              <div>
                <h1 className="text-[32px] font-black uppercase tracking-tighter leading-none mb-2">
                  {quote.title || "DEVIS_PROJET"}
                </h1>
                <div className="flex items-center gap-3 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  <span>ID: {quote.quote.number}</span>
                  <span className="w-1 h-1 bg-slate-200 rounded-full" />
                  <span>DATE: {quote.quote.issueDate}</span>
                </div>
              </div>
            </div>

            <div className="text-right flex flex-col items-end">
              <div className="text-[14px] font-black uppercase tracking-tight text-slate-900 mb-2">
                {quote.company.name}
              </div>
              <div className="text-[10px] text-slate-500 font-medium leading-relaxed max-w-[240px] uppercase">
                {quote.company.address}
                <br />
                {quote.company.website}
              </div>
            </div>
          </div>

          {/* --- DESTINATAIRE (Bordure sèche, pas de shadow) --- */}
          <div className="grid grid-cols-2 gap-12 mb-20">
            <div className="border-l-2 border-slate-900 pl-6 py-1">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 block mb-4">
                Client_Target
              </span>
              <div className="text-[18px] font-black uppercase mb-2 text-slate-950">
                {quote.client.name}
              </div>
              <div className="text-[11px] text-slate-500 leading-relaxed font-medium uppercase tracking-tight">
                {quote.client.email}
                <br />
                {quote.client.address}
                {quote.client.siret && (
                  <div className="mt-4 pt-4 border-t border-slate-100 text-[9px] font-mono text-slate-400">
                    REG_ID: {quote.client.siret}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* --- TABLEAU DE DONNÉES (Blueprint Look) --- */}
          {/* --- TABLEAU DE DONNÉES (Alignement Chirurgical) --- */}
          <div className="flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-y-2 border-slate-900">
                  <th className="py-4 px-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">
                    Désignation
                  </th>
                  <th className="py-4 px-2 text-[10px] font-black uppercase tracking-[0.2em] text-right w-20 text-slate-900">
                    Qté
                  </th>
                  <th className="py-4 px-2 text-[10px] font-black uppercase tracking-[0.2em] text-right w-32 text-slate-900">
                    P.U HT
                  </th>
                  <th className="py-4 px-2 text-[10px] font-black uppercase tracking-[0.2em] text-right w-32 text-slate-900">
                    Total HT
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quote.items.map((item, idx) => (
                  <tr key={idx} className="group">
                    <td className="py-5 px-2 align-top">
                      <div className="text-[12px] font-black uppercase text-slate-950 mb-1 leading-none">
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed max-w-md">
                          {item.subtitle}
                        </div>
                      )}
                    </td>
                    {/* Alignement à droite pour toutes les colonnes numériques */}
                    <td className="py-5 px-2 text-[11px] font-mono font-bold text-right text-slate-500 align-top">
                      {item.quantity}
                    </td>
                    <td className="py-5 px-2 text-[11px] font-mono font-bold text-right text-slate-500 align-top tabular-nums">
                      {item.unitPrice.toLocaleString("fr-FR", {
                        minimumFractionDigits: 2,
                      })}
                      €
                    </td>
                    <td className="py-5 px-2 text-[11px] font-mono font-black text-right text-slate-950 align-top tabular-nums">
                      {(item.quantity * item.unitPrice).toLocaleString(
                        "fr-FR",
                        { minimumFractionDigits: 2 }
                      )}
                      €
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* --- CALCULS FINAUX (Zone de Tension) --- */}
          <div className="mt-16 flex justify-end">
            <div className="w-80 space-y-2 border-t-4 border-slate-900 pt-6">
              <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Total HT</span>
                <span className="font-mono-numbers text-slate-900">
                  {financials.subTotal.toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                  })}
                  €
                </span>
              </div>

              {financials.discount > 0 && (
                <div className="flex justify-between text-[11px] font-bold text-indigo-600 uppercase tracking-widest">
                  <span>Remise exceptionnelle</span>
                  <span className="font-mono-numbers">
                    -
                    {financials.discount.toLocaleString("fr-FR", {
                      minimumFractionDigits: 2,
                    })}
                    €
                  </span>
                </div>
              )}

              <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                <span>TVA ({quote.financials.vatRatePercent}%)</span>
                <span className="font-mono-numbers text-slate-900">
                  {financials.vatAmount.toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                  })}
                  €
                </span>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100 flex justify-between items-baseline">
                <span className="text-[14px] font-black uppercase tracking-tighter text-slate-950">
                  Net à Payer (TTC)
                </span>
                <span
                  className="text-3xl font-black font-mono-numbers tracking-tighter"
                  style={{ color: primaryColor }}
                >
                  {financials.totalTTC.toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                  })}
                  €
                </span>
              </div>
            </div>
          </div>

          {/* --- FOOTER : LEGAL Blueprint --- */}
          <div className="mt-auto pt-16 grid grid-cols-2 gap-20 items-end border-t border-slate-100">
            <div>
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-300 block mb-3">
                Legal_Terms
              </span>
              <p className="text-[9px] text-slate-400 font-medium uppercase leading-loose">
                {quote.quote.terms ||
                  "Validité : 30 jours. Règlement par virement bancaire. Escompte pour paiement anticipé : néant."}
              </p>
            </div>
            <div className="text-right">
              <div className="inline-block px-4 py-2 border border-slate-900 text-[10px] font-black uppercase tracking-widest">
                Devis_Studio_Ready
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PrintableQuote.displayName = "PrintableQuote";
export default PrintableQuote;
