"use client";
import { forwardRef } from "react";
import { generateQuoteHTML } from "@/lib/print-template";
import { EditorActiveQuote, EditorTheme } from "@/types/editor";

interface PrintableQuoteProps {
  quote: EditorActiveQuote;
  theme: EditorTheme;
}

const PrintableQuote = forwardRef<HTMLDivElement, PrintableQuoteProps>(
  function PrintableQuote({ quote, theme }, ref) {
    // On génère le même HTML que l'API
    const htmlContent = generateQuoteHTML(quote, theme?.color || "#4f46e5");

    return (
      <div
        ref={ref}
        className="bg-white shadow-2xl mx-auto overflow-hidden"
        style={{ width: "210mm", minHeight: "297mm" }}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  },
);

export default PrintableQuote;
