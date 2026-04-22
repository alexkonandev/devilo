import chromium from "@sparticuz/chromium";
import puppeteer, { Browser } from "puppeteer-core";

/**
 * MOTEUR DE GÉNÉRATION PDF - OPTIMISÉ POUR SERVEUR GRATUIT ET DATA LIMITÉE
 */
export async function generatePdf(html: string): Promise<Buffer> {
  const isProd = process.env.NODE_ENV === "production" || !!process.env.VERCEL;

  // On définit le chemin du binaire : Sparticuz en prod, ton binaire identifié en local
  const executablePath = isProd
    ? await chromium.executablePath()
    : "/usr/bin/chromium-browser";

  const browser = (await puppeteer.launch({
    // En prod : args de Sparticuz / En local : args de sécurité Linux standards
    args: isProd ? chromium.args : ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath,
    headless: true,
    defaultViewport: { width: 1280, height: 720 },
  })) as unknown as Browser;

  try {
    const page = await browser.newPage();

    // On injecte le HTML et on attend que le réseau soit inactif (fin du chargement des polices/CDN)
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
    });

    return Buffer.from(pdf);
  } finally {
    if (browser) await browser.close();
  }
}
