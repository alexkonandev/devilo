import type { Metadata } from "next";
// Importer Figtree et JetBrains Mono
import { Figtree, JetBrains_Mono, Playfair_Display } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from '@clerk/localizations' // Optionnel : pour avoir l'interface en Français
import "./globals.css";
import "dotenv/config";   
import { Toaster } from "sonner";

// Configurer Figtree comme police principale (sans-serif)
const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree", // Variable CSS pour la police "sans"
  display: "swap", // Assure un affichage rapide
});

// Configurer JetBrains Mono comme police "mono"
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono", // Variable CSS pour la police "mono"
  display: "swap",
});

// Police artistique ultra distinctive pour la hero section (uniquement landing page)
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-artistic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Factouro",
  description: "Générez vos devis professionnels en quelques secondes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Appliquer les deux variables à la balise <html>
    <ClerkProvider localization={frFR}>
      <html lang="fr" className={`${figtree.variable} ${jetbrains.variable} ${playfair.variable}`}>
        <body>
          {children}
          <Toaster position="top-center" />
        </body>
      </html>
    </ClerkProvider>
  );
}
