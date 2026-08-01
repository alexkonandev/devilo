import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { generateQuoteHTML } from "@/lib/print-template";
import { resolveTemplate } from "@/lib/template-system";
import { resolveExecutablePath } from "@/lib/pdf-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. ANALYSE ET EXTRACTION DES DONNÉES
    const quoteData = body?.items ? body : body?.quote;

    // Extraction du templateId (ou fallback classic-indigo)
    const templateId = body?.templateId || body?.theme?.templateId || "minimal-invoice";

    // Récupération du numéro de devis pour le nom de fichier (fallback sur timestamp)
    const quoteNumber = quoteData?.quote?.number || `QT-${Date.now()}`;

    // Validation minimale
    if (!quoteData || !quoteData.items) {
      console.error("ERREUR_STRUCTURE_DATA :", body);
      return NextResponse.json(
        {
          error: "Structure de données invalide ou manquante",
          received: Object.keys(body || {}),
        },
        { status: 400 },
      );
    }

    // 2. INITIALISATION DE CHROMIUM
    const executablePath = await resolveExecutablePath();
    const isProd = process.env.NODE_ENV === "production" || !!process.env.VERCEL;
    const browser = await puppeteer.launch({
      args: isProd ? chromium.args : ["--no-sandbox", "--disable-setuid-sandbox"],
      defaultViewport: { width: 1200, height: 900 },
      executablePath,
      headless: true,
    });

    const page = await browser.newPage();

    // 3. GÉNÉRATION DU CONTENU HTML AVEC LE TEMPLATE
    const htmlContent = generateQuoteHTML(quoteData, resolveTemplate(templateId));

    const fullHtml = `
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="utf-8">
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
          <style>
            @page { 
              size: A4; 
              margin: 0; 
            }
            body { 
              font-family: 'Inter', sans-serif; 
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `;

    // On injecte le HTML et on attend que les ressources (Tailwind, polices) soient chargées
    await page.setContent(fullHtml, { waitUntil: "networkidle0" });

    // 4. GÉNÉRATION DU BUFFER PDF
    // Les pages sont déjà explicites dans le HTML (divs A4 avec page-break-after)
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: false,
    });

    await browser.close();

    // 5. RÉPONSE HTTP
    return new NextResponse(Uint8Array.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Devis-${quoteNumber}.pdf"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("PDF_GENERATION_CRASH:", error);
    return NextResponse.json(
      {
        error: "Le serveur n'a pas pu générer le PDF",
        details: errMsg,
      },
      { status: 500 },
    );
  }
}
