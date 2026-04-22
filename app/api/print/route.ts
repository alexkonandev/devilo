import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { generateQuoteHTML } from "@/lib/print-template";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. ANALYSE ET EXTRACTION DES DONNÉES
    // Selon tes logs, les items sont à la racine. On vérifie donc si le body
    // contient directement les données ou s'il les contient dans une clé "quote".
    const quoteData = body?.items ? body : body?.quote;

    // Extraction sécurisée du thème et de la couleur
    const themeColor = body?.theme?.color || "#6366f1";

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
    const executablePath = await chromium.executablePath();
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1200, height: 900 },
      executablePath,
      headless: true,
    });

    const page = await browser.newPage();

    // 3. GÉNÉRATION DU CONTENU HTML
    // On utilise ton template partagé avec les données extraites
    const htmlContent = generateQuoteHTML(quoteData, themeColor);

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
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
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
