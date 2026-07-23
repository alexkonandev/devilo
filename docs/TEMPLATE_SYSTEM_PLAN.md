# Plan de Refonte : Système de Templates + Réparation Layout A4

## Phase 1 — Réparer le layout A4 (print-template.ts)

### Objectif
Corriger la structure HTML du document A4 pour qu'il s'affiche correctement :
- Hauteur fixe A4 (297mm) avec contenu scrollable si nécessaire
- Footer positionné correctement en bas de page
- Barre colorée intégrée dans le header
- Gestion des sauts de page pour les longs tableaux

### Tâches
- [x] **P1.1** : Restructurer le conteneur A4 avec `h-[297mm]` fixe + `overflow-hidden`
- [x] **P1.2** : Remplacer `mt-auto` par un positionnement absolu du footer
- [x] **P1.3** : Ajouter un wrapper scrollable pour le contenu entre header et footer
- [x] **P1.4** : Intégrer la barre colorée dans le header via `border-top`
- [x] **P1.5** : Ajouter `page-break-inside: avoid` et `page-break-after: auto` sur les sections longues
- [x] **P1.6** : Nettoyer les styles CSS inutiles et harmoniser les espacements

---

## Phase 2 — Architecture du système de Templates

### Objectif
Créer l'infrastructure complète pour supporter des templates visuels riches (palette, typographie, layout, espacement).

### Tâches
- [ ] **P2.1** : Créer `my-app/lib/template-system.ts` avec le type `TemplateDefinition`
- [ ] **P2.2** : Définir l'interface complète du template (layout, couleurs, typo, spacing, options)
- [ ] **P2.3** : Créer les 2 premiers templates concrets (Classic Indigo, Modern Obsidian)
- [ ] **P2.4** : Intégrer le type dans les types editor/Prisma
- [ ] **P2.5** : Ajouter la seed data en DB pour les templates

### Structure du type TemplateDefinition
```typescript
interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  preview: string;
  layout: "classic" | "modern" | "compact" | "elegant";
  headerStyle: "default" | "minimal" | "bordered" | "with-logo";
  footerStyle: "default" | "minimal" | "legal-only";
  sectionStyle: "cards" | "bordered" | "minimal" | "striped";
  colors: {
    primary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    highlight: string;
  };
  typography: {
    fontFamily: string;
    fontScale: number;
    labelCase: "uppercase" | "normal";
  };
  spacing: {
    paddingX: number;
    paddingY: number;
    gap: number;
  };
  options: {
    showHeaderBar: boolean;
    showBadges: boolean;
    showSummaryCard: boolean;
    showLegalFooter: boolean;
  };
}
```

---

## Phase 3 — Intégration UI et mise à jour des composants

### Objectif
Connecter le système de templates à l'interface utilisateur (sidebar, store, rendu).

### Tâches
- [ ] **P3.1** : Réécrire `generateQuoteHTML` pour utiliser `TemplateDefinition` complet
- [ ] **P3.2** : Mettre à jour `studio-sidebar-right.tsx` pour afficher les previews de templates
- [ ] **P3.3** : Mettre à jour `use-kernel-store.ts` (activeThemeId → activeTemplateId)
- [ ] **P3.4** : Mettre à jour les actions quote-editor-action pour la persistance
- [ ] **P3.5** : Tester l'impression/PDF avec les 2 templates
- [ ] **P3.6** : Vérifier le rendu A4 en preview studio