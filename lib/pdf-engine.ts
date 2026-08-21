import chromium from "@sparticuz/chromium-min";
import puppeteer, { Browser } from "puppeteer-core";
import { existsSync } from "fs";

/**
 * Résout le chemin du binaire Chromium selon l'environnement.
 * - Prod/Vercel : binaire Sparticuz (serverless)
 * - Local Windows : Edge ou Chrome système
 * - Local Linux/Mac : chromium-browser
 */
export async function resolveExecutablePath(): Promise<string> {
  const isProd = process.env.NODE_ENV === "production" || !!process.env.VERCEL;

  if (isProd) {
    // chromium-min ne contient pas les binaires dans le bundle : il télécharge et
    // décompresse le pack (.tar) hébergé, puis l'extrait dans /tmp.
    // CHROMIUM_PACK_URL = URL publique du `chromium-v141.0.0-pack.tar` (S3/R2/Vercel Blob).
    const packUrl = process.env.CHROMIUM_PACK_URL;
    if (!packUrl) {
      throw new Error(
        "CHROMIUM_PACK_URL manquant : fournir l'URL HTTPS du chromium-v141.0.0-pack.tar",
      );
    }
    return await chromium.executablePath(packUrl);
  }

  // Windows : détecter Edge ou Chrome
  if (process.platform === "win32") {
    const candidates = [
      "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    ];
    for (const p of candidates) {
      if (existsSync(p)) return p;
    }
  }

  // Linux / Mac
  return "/usr/bin/chromium-browser";
}

/**
 * MOTEUR DE GÉNÉRATION PDF - OPTIMISÉ POUR SERVEUR GRATUIT ET DATA LIMITÉE
 */
export async function generatePdf(html: string): Promise<Buffer> {
  const isProd = process.env.NODE_ENV === "production" || !!process.env.VERCEL;

  const executablePath = await resolveExecutablePath();

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