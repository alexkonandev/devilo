"use client";
import { forwardRef } from "react";
import { generateQuoteHTML } from "@/lib/print-template";
import { EditorActiveQuote } from "@/types/editor";
import { resolveTemplate } from "@/lib/template-system";

interface PrintableQuoteProps {
  quote: EditorActiveQuote;
}

const PrintableQuote = forwardRef<HTMLDivElement, PrintableQuoteProps>(
  function PrintableQuote({ quote }, ref) {
    // Style basique fixe dans l'éditeur — les templates sont réservés à l'export
    const resolvedTemplate = resolveTemplate("minimal-invoice");
    const htmlContent = generateQuoteHTML(quote, resolvedTemplate);

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
