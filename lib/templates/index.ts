// ═══════════════════════════════════════════════════════════════════════════════
// TEMPLATE DISPATCHER
// Route vers le bon renderer selon template.id
// ═══════════════════════════════════════════════════════════════════════════════

import { TemplateDefinition, EditorActiveQuote } from "@/types/editor";
import { renderMinimalInvoice } from "./minimal-invoice";
import { renderModernObsidian } from "./modern-obsidian";
import { renderExecutiveGold } from "./executive-gold";
import { renderNordicClean } from "./nordic-clean";
import { renderDarkPremium } from "./dark-premium";
import { renderVintageElegance } from "./vintage-elegance";
import { renderTechBlueprint } from "./tech-blueprint";
import { renderLuxeMinimal } from "./luxe-minimal";
import { renderCreativeStudio } from "./creative-studio";
import { renderMidnightSapphire } from "./midnight-sapphire";
import { renderArtDeco } from "./art-deco";
import { renderWashiZen } from "./washi-zen";
import { renderCyberNeon } from "./cyber-neon";
import { renderBotanical } from "./botanical";
import { renderCrimsonVelvet } from "./crimson-velvet";

/**
 * Génère le HTML complet du document A4 pour le template donné.
 */
export function generateQuoteHTML(
  quote: EditorActiveQuote,
  template: TemplateDefinition,
): string {
  switch (template.id) {
    case "minimal-invoice":
      return renderMinimalInvoice(quote, template);
    case "modern-obsidian":
      return renderModernObsidian(quote, template);
    case "executive-gold":
      return renderExecutiveGold(quote, template);
    case "nordic-clean":
      return renderNordicClean(quote, template);
    case "dark-premium":
      return renderDarkPremium(quote, template);
    case "vintage-elegance":
      return renderVintageElegance(quote, template);
    case "tech-blueprint":
      return renderTechBlueprint(quote, template);
    case "luxe-minimal":
      return renderLuxeMinimal(quote, template);
    case "creative-studio":
      return renderCreativeStudio(quote, template);
    case "midnight-sapphire":
      return renderMidnightSapphire(quote, template);
    case "art-deco":
      return renderArtDeco(quote, template);
    case "washi-zen":
      return renderWashiZen(quote, template);
    case "cyber-neon":
      return renderCyberNeon(quote, template);
    case "botanical":
      return renderBotanical(quote, template);
    case "crimson-velvet":
      return renderCrimsonVelvet(quote, template);
    default:
      return renderMinimalInvoice(quote, template);
  }
}
