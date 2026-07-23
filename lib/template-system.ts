// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE SYSTEM — Définition complète des templates A4
// Chaque template contrôle : couleurs, typographie, espacement, options.
// Le rendu HTML spécifique à chaque template est dans lib/templates/.
// Voir docs/TEMPLATE_SYSTEM_PLAN.md pour la documentation.
// ═══════════════════════════════════════════════════════════════════════════════

export type LabelCase = "uppercase" | "normal";

// ═══════════════════════════════════════════════════════════════════════════════
// INTERFACE TemplateDefinition
// ═══════════════════════════════════════════════════════════════════════════════

export interface TemplateColors {
  primary: string;      // Couleur principale
  accent: string;       // Couleur secondaire / accent
  background: string;   // Fond de page
  surface: string;      // Fond des cartes / sections
  text: string;         // Texte principal
  textMuted: string;    // Texte secondaire
  border: string;       // Bordures
  highlight: string;    // Surlignage / highlight
}

export interface TemplateTypography {
  fontFamily: string;   // "Inter", "Georgia", etc.
  fontScale: number;    // Facteur d'échelle (1.0 = normal)
  labelCase: LabelCase; // "uppercase" | "normal"
}

export interface TemplateSpacing {
  paddingX: number;     // Padding horizontal (px)
  paddingY: number;     // Padding vertical (px)
  gap: number;          // Espacement entre sections (px)
}

export interface TemplateOptions {
  showHeaderBar: boolean;
  showBadges: boolean;
  showSummaryCard: boolean;
  showLegalFooter: boolean;
  showBlurDecoration: boolean;
  headerBorderStyle: "bar" | "shadow" | "none";
}

export type TemplateTier = "free" | "premium";

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  preview: string;          // Emoji ou URI pour la preview
  tier: TemplateTier;       // "free" ou "premium" — pour le gating PRO

  colors: TemplateColors;
  typography: TemplateTypography;
  spacing: TemplateSpacing;
  options: TemplateOptions;
}

// ═══════════════════════════════════════════════════════════════════════════════
// REGISTRY DES TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Résout un template par son ID. Retourne le template ou le template par défaut.
 */
export function resolveTemplate(templateId: string): TemplateDefinition {
  const found = TEMPLATES.find((t) => t.id === templateId);
  return found || TEMPLATES[0]; // Fallback sur le premier template
}

/**
 * Liste tous les templates disponibles.
 */
export function getAvailableTemplates(): TemplateDefinition[] {
  return TEMPLATES;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 1 : "Minimal Invoice"
// Layout ultra-épuré — header compact, pas de cartes, lignes fines
// ═══════════════════════════════════════════════════════════════════════════════

export const MINIMAL_INVOICE: TemplateDefinition = {
  id: "minimal-invoice",
  name: "Minimal Invoice",
  description: "Layout épuré sans cartes, lignes fines, total intégré",
  preview: "📄",
  tier: "free",

  colors: {
    primary: "#475569",     // Slate-600
    accent: "#94a3b8",      // Slate-400
    background: "#ffffff",   // Blanc pur
    surface: "#f8fafc",     // Slate-50
    text: "#0f172a",        // Slate-900
    textMuted: "#64748b",   // Slate-500
    border: "#e2e8f0",      // Slate-200
    highlight: "#f1f5f9",   // Slate-100
  },

  typography: {
    fontFamily: "Inter",
    fontScale: 1.0,
    labelCase: "uppercase",
  },

  spacing: {
    paddingX: 40,
    paddingY: 28,
    gap: 20,
  },

  options: {
    showHeaderBar: false,
    showBadges: false,
    showSummaryCard: false,
    showLegalFooter: true,
    showBlurDecoration: false,
    headerBorderStyle: "none",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 2 : "Modern Obsidian"
// Look premium, sombre et épuré — accents ambre/or sur fond blanc immaculé
// ═══════════════════════════════════════════════════════════════════════════════

export const MODERN_OBSIDIAN: TemplateDefinition = {
  id: "modern-obsidian",
  name: "Modern Obsidian",
  description: "Design épuré et moderne avec accents ambre chauds",
  preview: "⚫",
  tier: "free",

  colors: {
    primary: "#0f172a",     // Slate-900
    accent: "#f59e0b",      // Amber-500
    background: "#ffffff",   // Blanc pur
    surface: "#fafafa",     // Presque blanc
    text: "#0f172a",        // Slate-900
    textMuted: "#94a3b8",   // Slate-400
    border: "#f1f5f9",      // Slate-100
    highlight: "#fffbeb",   // Amber-50
  },

  typography: {
    fontFamily: "Inter",
    fontScale: 1.0,
    labelCase: "uppercase",
  },

  spacing: {
    paddingX: 48, // px-12 — plus aéré
    paddingY: 40, // py-10
    gap: 20,      // mb-5
  },

  options: {
    showHeaderBar: false,     // Pas de barre colorée — header minimal
    showBadges: false,        // Pas de badges
    showSummaryCard: true,    // Carte récap (mais style minimal)
    showLegalFooter: true,
    showBlurDecoration: false, // Pas de blur — plus épuré
    headerBorderStyle: "shadow", // Ombre subtile sous le header
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 3 : "Executive Gold" (PREMIUM)
// Standing haut de gamme — doré, cartes crème, double filet décoratif
// ═══════════════════════════════════════════════════════════════════════════════

export const EXECUTIVE_GOLD: TemplateDefinition = {
  id: "executive-gold",
  name: "Executive Gold",
  description: "Standing haut de gamme — doré, cartes crème, effet costard-cravate",
  preview: "🏆",
  tier: "premium",

  colors: {
    primary: "#b8860b",     // Doré — bande header, accents
    accent: "#8b7d6b",      // Doré foncé / text muted
    background: "#ffffff",   // Blanc pur
    surface: "#fcf9f2",     // Crème — cartes
    text: "#1a1406",        // Texte principal foncé
    textMuted: "#8b7d6b",   // Texte secondaire beige
    border: "#e8dcc8",      // Beige — bordures
    highlight: "#fdfbf7",   // Stripe tableau
  },

  typography: {
    fontFamily: "Inter",
    fontScale: 1.0,
    labelCase: "uppercase",
  },

  spacing: {
    paddingX: 48,
    paddingY: 32,
    gap: 20,
  },

  options: {
    showHeaderBar: true,
    showBadges: true,
    showSummaryCard: true,
    showLegalFooter: true,
    showBlurDecoration: false,
    headerBorderStyle: "bar",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 4 : "Nordic Clean" (PREMIUM)
// Léger, aéré, minimaliste — design scandinave
// ═══════════════════════════════════════════════════════════════════════════════

export const NORDIC_CLEAN: TemplateDefinition = {
  id: "nordic-clean",
  name: "Nordic Clean",
  description: "Design scandinave — léger, aéré, mini-cartes individuelles",
  preview: "🌿",
  tier: "premium",

  colors: {
    primary: "#84a98c",     // Vert sauge
    accent: "#6b9080",      // Sauge foncé
    background: "#ffffff",   // Blanc
    surface: "#f8f9fa",     // Gris pâle — mini-cartes
    text: "#2b2d42",        // Texte principal
    textMuted: "#8d99ae",   // Texte secondaire
    border: "#e9ecef",      // Filets
    highlight: "#f8f9fa",   // Highlight
  },

  typography: {
    fontFamily: "Inter",
    fontScale: 1.0,
    labelCase: "normal",
  },

  spacing: {
    paddingX: 48,
    paddingY: 32,
    gap: 24,
  },

  options: {
    showHeaderBar: false,
    showBadges: false,
    showSummaryCard: true,
    showLegalFooter: true,
    showBlurDecoration: false,
    headerBorderStyle: "none",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 5 : "Dark Premium" (PREMIUM)
// Sombre, sophistiqué, puissant — premier template dark mode
// ═══════════════════════════════════════════════════════════════════════════════

export const DARK_PREMIUM: TemplateDefinition = {
  id: "dark-premium",
  name: "Dark Premium",
  description: "Design sombre et sophistiqué — accents corail vif",
  preview: "🌑",
  tier: "premium",

  colors: {
    primary: "#e94560",     // Corail vif — accents
    accent: "#8a8aa0",      // Gris clair
    background: "#1a1a2e",   // Bleu nuit foncé
    surface: "#16213e",     // Surface cartes
    text: "#e8e8e8",        // Blanc cassé
    textMuted: "#8a8aa0",   // Gris secondaire
    border: "#1e2a4a",      // Bordure subtile
    highlight: "#16213e",   // Highlight
  },

  typography: {
    fontFamily: "Inter",
    fontScale: 1.0,
    labelCase: "uppercase",
  },

  spacing: {
    paddingX: 48,
    paddingY: 32,
    gap: 20,
  },

  options: {
    showHeaderBar: true,
    showBadges: false,
    showSummaryCard: true,
    showLegalFooter: true,
    showBlurDecoration: true,
    headerBorderStyle: "bar",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 6 : "Vintage Elegance" (PREMIUM)
// Classique européen — Playfair Display, double filet, ornements
// ═══════════════════════════════════════════════════════════════════════════════

export const VINTAGE_ELEGANCE: TemplateDefinition = {
  id: "vintage-elegance",
  name: "Vintage Elegance",
  description: "Classique européen — Playfair Display, double filet, ornements",
  preview: "🏛️",
  tier: "premium",

  colors: {
    primary: "#8b4513",     // Brun — filets, accents
    accent: "#d4a574",      // Doré clair — second filet
    background: "#ffffff",   // Blanc
    surface: "#faf3e0",     // Ivoire
    text: "#2c1810",        // Brun très foncé
    textMuted: "#8b7355",   // Brun doux
    border: "#d4c5a0",      // Beige
    highlight: "#faf3e0",   // Highlight
  },

  typography: {
    fontFamily: "Playfair Display",
    fontScale: 1.05,
    labelCase: "normal",
  },

  spacing: {
    paddingX: 48,
    paddingY: 32,
    gap: 20,
  },

  options: {
    showHeaderBar: false,
    showBadges: true,
    showSummaryCard: true,
    showLegalFooter: true,
    showBlurDecoration: false,
    headerBorderStyle: "none",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 7 : "Tech Blueprint" (PREMIUM)
// Fond quadrillé, JetBrains Mono, cartouche technique — style plan d'ingénieur
// ═══════════════════════════════════════════════════════════════════════════════

export const TECH_BLUEPRINT: TemplateDefinition = {
  id: "tech-blueprint",
  name: "Tech Blueprint",
  description: "Style plan d'ingénieur — fond quadrillé, JetBrains Mono, cartouche technique",
  preview: "📐",
  tier: "premium",

  colors: {
    primary: "#ff6b35",     // Orange sécurité
    accent: "#4a90d9",      // Bleu technique
    background: "#fafbfc",   // Blanc bleuté très pâle
    surface: "#e8f0fe",     // Bleu pâle — cartouches
    text: "#1e3a5f",        // Bleu blueprint foncé
    textMuted: "#6b8299",   // Gris bleuté
    border: "#c8d6e5",      // Bleu gris clair
    highlight: "#eef2f7",   // Stripe tableau
  },

  typography: {
    fontFamily: "JetBrains Mono",
    fontScale: 1.0,
    labelCase: "uppercase",
  },

  spacing: {
    paddingX: 48,
    paddingY: 28,
    gap: 20,
  },

  options: {
    showHeaderBar: true,
    showBadges: true,
    showSummaryCard: true,
    showLegalFooter: true,
    showBlurDecoration: false,
    headerBorderStyle: "bar",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 8 : "Luxe Minimal" (PREMIUM)
// Noir & champagne, Cormorant Garamond, ultra-espacement — le vide comme luxe
// ═══════════════════════════════════════════════════════════════════════════════

export const LUXE_MINIMAL: TemplateDefinition = {
  id: "luxe-minimal",
  name: "Luxe Minimal",
  description: "Noir & champagne, Cormorant Garamond — le vide comme luxe",
  preview: "🥂",
  tier: "premium",

  colors: {
    primary: "#d4af37",     // Champagne / métallisé
    accent: "#6b6b6b",      // Gris souris
    background: "#faf9f6",   // Crème papier de luxe
    surface: "#ffffff",      // Blanc
    text: "#0a0a0a",        // Noir absolu
    textMuted: "#8a8a8a",   // Gris moyen
    border: "#e5e0d5",      // Beige très clair
    highlight: "#faf9f6",   // Crème
  },

  typography: {
    fontFamily: "Cormorant Garamond",
    fontScale: 1.05,
    labelCase: "normal",
  },

  spacing: {
    paddingX: 64, // Ultra-généreux
    paddingY: 48,
    gap: 32,      // Très aéré
  },

  options: {
    showHeaderBar: true,
    showBadges: false,
    showSummaryCard: false,
    showLegalFooter: true,
    showBlurDecoration: false,
    headerBorderStyle: "bar",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 9 : "Creative Studio" (PREMIUM)
// Asymétrique, blocs de couleur audacieux, mini-cartes colorées
// ═══════════════════════════════════════════════════════════════════════════════

export const CREATIVE_STUDIO: TemplateDefinition = {
  id: "creative-studio",
  name: "Creative Studio",
  description: "Asymétrique & multicolore — mini-cartes, blocs audacieux, vibe agence",
  preview: "🎨",
  tier: "premium",

  colors: {
    primary: "#ff6b6b",     // Corail vif
    accent: "#4ecdc4",      // Teal
    background: "#ffffff",   // Blanc
    surface: "#f8f8fa",     // Gris très pâle — cartes
    text: "#1a1a2e",        // Presque noir
    textMuted: "#94a3b8",   // Slate-400
    border: "#e8e8ec",      // Gris clair
    highlight: "#fdf2f2",   // Rose très pâle
  },

  typography: {
    fontFamily: "Inter",
    fontScale: 1.0,
    labelCase: "uppercase",
  },

  spacing: {
    paddingX: 44,
    paddingY: 28,
    gap: 22,
  },

  options: {
    showHeaderBar: true,
    showBadges: true,
    showSummaryCard: true,
    showLegalFooter: true,
    showBlurDecoration: false,
    headerBorderStyle: "none",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 10 : "Midnight Sapphire" (ULTRA PREMIUM)
// Glassmorphisme deep blue & or — nuit étoilée luxueuse
// ═══════════════════════════════════════════════════════════════════════════════

export const MIDNIGHT_SAPPHIRE: TemplateDefinition = {
  id: "midnight-sapphire",
  name: "Midnight Sapphire",
  description: "Glassmorphisme deep blue & or — nuit étoilée, cartes en verre dépoli",
  preview: "🧿",
  tier: "premium",

  colors: {
    primary: "#3b82f6",
    accent: "#c9a84c",
    background: "#0a1628",
    surface: "#112240",
    text: "#e2e8f0",
    textMuted: "#94a3b8",
    border: "#1e3a5f",
    highlight: "#162544",
  },

  typography: {
    fontFamily: "Playfair Display",
    fontScale: 1.05,
    labelCase: "uppercase",
  },

  spacing: {
    paddingX: 52,
    paddingY: 44,
    gap: 28,
  },

  options: {
    showHeaderBar: false,
    showBadges: true,
    showSummaryCard: true,
    showLegalFooter: true,
    showBlurDecoration: false,
    headerBorderStyle: "none",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 11 : "Art Deco" (ULTRA PREMIUM)
// Gatsby géométrique noir & or — années 20 luxueuses
// ═══════════════════════════════════════════════════════════════════════════════

export const ART_DECO: TemplateDefinition = {
  id: "art-deco",
  name: "Art Déco",
  description: "Gatsby géométrique noir & or — triple filet, sunburst, médaillon",
  preview: "🏙️",
  tier: "premium",

  colors: {
    primary: "#c9a84c",
    accent: "#1a1a1a",
    background: "#fefdf8",
    surface: "#fffef9",
    text: "#0a0a0a",
    textMuted: "#8b7d6b",
    border: "#e8dcc8",
    highlight: "#faf5e8",
  },

  typography: {
    fontFamily: "Playfair Display",
    fontScale: 1.08,
    labelCase: "uppercase",
  },

  spacing: {
    paddingX: 56,
    paddingY: 40,
    gap: 26,
  },

  options: {
    showHeaderBar: false,
    showBadges: false,
    showSummaryCard: true,
    showLegalFooter: true,
    showBlurDecoration: false,
    headerBorderStyle: "none",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 12 : "Washi Zen" (ULTRA PREMIUM)
// Papier japonais, minimal poétique — esthétique du vide
// ═══════════════════════════════════════════════════════════════════════════════

export const WASHI_ZEN: TemplateDefinition = {
  id: "washi-zen",
  name: "Washi Zen",
  description: "Papier japonais, sceau hanko, texture washi — l'esthétique du vide",
  preview: "🍵",
  tier: "premium",

  colors: {
    primary: "#c44536",
    accent: "#6b5e4a",
    background: "#fefcf5",
    surface: "#faf6ed",
    text: "#2c2416",
    textMuted: "#8b7d6b",
    border: "#e5ddd0",
    highlight: "#faf6ed",
  },

  typography: {
    fontFamily: "Cormorant Garamond",
    fontScale: 1.0,
    labelCase: "normal",
  },

  spacing: {
    paddingX: 56,
    paddingY: 48,
    gap: 36,
  },

  options: {
    showHeaderBar: false,
    showBadges: false,
    showSummaryCard: false,
    showLegalFooter: true,
    showBlurDecoration: false,
    headerBorderStyle: "none",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 13 : "Cyber Neon" (ULTRA PREMIUM)
// Terminal rétro-futuriste — scanlines CRT, néon cyan/magenta, vibes cyberpunk
// ═══════════════════════════════════════════════════════════════════════════════

export const CYBER_NEON: TemplateDefinition = {
  id: "cyber-neon",
  name: "Cyber Neon",
  description: "Terminal CRT cyberpunk — scanlines, néon cyan/magenta, glow borders",
  preview: "🌃",
  tier: "premium",

  colors: {
    primary: "#00f0ff",
    accent: "#ff00aa",
    background: "#0a0a0a",
    surface: "#111118",
    text: "#e0e0e0",
    textMuted: "#888899",
    border: "#1a1a2e",
    highlight: "#111118",
  },

  typography: {
    fontFamily: "JetBrains Mono",
    fontScale: 1.0,
    labelCase: "uppercase",
  },

  spacing: {
    paddingX: 48,
    paddingY: 32,
    gap: 22,
  },

  options: {
    showHeaderBar: false,
    showBadges: true,
    showSummaryCard: true,
    showLegalFooter: true,
    showBlurDecoration: false,
    headerBorderStyle: "none",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 14 : "Botanical" (ULTRA PREMIUM)
// Nature organique & kraft — papier texturé, vert sauge, filigrane feuillage
// ═══════════════════════════════════════════════════════════════════════════════

export const BOTANICAL: TemplateDefinition = {
  id: "botanical",
  name: "Botanical",
  description: "Nature & kraft — papier texturé, vert sauge, filigrane feuillage, badges bio",
  preview: "🌿",
  tier: "premium",

  colors: {
    primary: "#4a7c59",
    accent: "#8b6914",
    background: "#fefcf7",
    surface: "#f6f2e9",
    text: "#2c2416",
    textMuted: "#8b7d6b",
    border: "#e5ddd0",
    highlight: "#f6f2e9",
  },

  typography: {
    fontFamily: "Cormorant Garamond",
    fontScale: 1.0,
    labelCase: "normal",
  },

  spacing: {
    paddingX: 50,
    paddingY: 38,
    gap: 26,
  },

  options: {
    showHeaderBar: false,
    showBadges: true,
    showSummaryCard: true,
    showLegalFooter: true,
    showBlurDecoration: false,
    headerBorderStyle: "none",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE 15 : "Crimson Velvet" (ULTRA PREMIUM)
// Pourpre royal & ornements baroques — velours cramoisi, or rose, sceau ovale
// ═══════════════════════════════════════════════════════════════════════════════

export const CRIMSON_VELVET: TemplateDefinition = {
  id: "crimson-velvet",
  name: "Crimson Velvet",
  description: "Pourpre royal & baroque — velours cramoisi, or rose, sceau ovale, flourishes",
  preview: "🍷",
  tier: "premium",

  colors: {
    primary: "#8b1a4a",
    accent: "#c9a84c",
    background: "#fefcf8",
    surface: "#fdf8f2",
    text: "#1a0a10",
    textMuted: "#8b7d7b",
    border: "#e8dcc8",
    highlight: "#fdf8f2",
  },

  typography: {
    fontFamily: "Playfair Display",
    fontScale: 1.06,
    labelCase: "normal",
  },

  spacing: {
    paddingX: 56,
    paddingY: 44,
    gap: 28,
  },

  options: {
    showHeaderBar: false,
    showBadges: true,
    showSummaryCard: true,
    showLegalFooter: true,
    showBlurDecoration: false,
    headerBorderStyle: "none",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════

export const TEMPLATES: TemplateDefinition[] = [
  MINIMAL_INVOICE,
  MODERN_OBSIDIAN,
  EXECUTIVE_GOLD,
  NORDIC_CLEAN,
  DARK_PREMIUM,
  VINTAGE_ELEGANCE,
  TECH_BLUEPRINT,
  LUXE_MINIMAL,
  CREATIVE_STUDIO,
  MIDNIGHT_SAPPHIRE,
  ART_DECO,
  WASHI_ZEN,
  CYBER_NEON,
  BOTANICAL,
  CRIMSON_VELVET,
];

/**
 * Génère le style inline header à partir d'un template.
 */
export function computeHeaderStyle(tpl: TemplateDefinition): string {
  const { options, colors } = tpl;
  const styles: string[] = [];

  switch (options.headerBorderStyle) {
    case "bar":
      styles.push(`border-top: 4px solid ${colors.primary}`);
      break;
    case "shadow":
      styles.push("box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06)");
      break;
    case "none":
      break;
  }

  return styles.join("; ");
}

/**
 * Génère le style du décorateur "blur" sur la card total.
 */
export function computeBlurStyle(tpl: TemplateDefinition): string {
  if (!tpl.options.showBlurDecoration) return "display: none";
  return `background-color: ${tpl.colors.primary}`;
}