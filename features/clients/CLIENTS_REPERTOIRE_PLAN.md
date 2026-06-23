# Plan de Transformation : Page Clients → "Répertoire"

**Date** : 18/06/2026  
**Objectif** : Remplacer le layout "copier-coller de quotes" par un design "Répertoire / Annuaire" avec des fiches contacts visuelles.

---

## 🔍 Diagnostic initial

La page clients est structurée exactement comme la page quotes :
- Layout `flex flex-col h-full w-full bg-slate-50` identique
- Split horizontal `table (flex-[4]) + sidebar (flex-[6])` identique
- `PageHeader`, `SearchBar`, `BTN_PRIMARY`, `BTN_SECONDARY` partagés
- `AlertDialog` de suppression copié-collé
- `ClientTable` en liste `<div>` mais organisée comme QuotesTable
- `ClientDetailSidebar` reprend les patterns de `QuoteDetailSidebar` (SectionCard, InfoRow, EmptyState, motion.div)

---

## 🎯 Vision "Répertoire"

Un **répertoire clients** avec l'identité visuelle d'un **carnet d'adresses / annuaire** :

| Au lieu de... | On veut... |
|---------------|-----------|
| Tableau de bord gestion | Répertoire / Annuaire élégant |
| Lignes de tableau | Fiches contacts visuelles (carte de visite) |
| Sidebar détail technique | Fiche détaillée façon "profil" |
| Filtres "À relancer / Inactifs" | Barre alphabétique + recherche full-text |
| Métriques financières (CA, devis) | Tags, labels, infos de contact |
| Actions en dropdown | Actions rapides en icônes |

---

## 🎨 Palette "Répertoire"

| Rôle | Couleur | Usage |
|------|---------|-------|
| Primaire | Teal `#0D9488` | Accents, badges, boutons |
| Secondaire | Émeraude `#059669` | Hover states, highlights |
| Fond page | Warm beige `#F8F6F3` | Ambiance "carnet" (remplace bg-slate-50) |
| Cartes | Blanc pur `#FFFFFF` | Fiches contacts |
| Bordures | `#E7E5E4` | Bordures douces (stone-200) |
| Texte muted | `#A8A29E` | stone-400 pour textes secondaires |

---

## 📋 Phases d'implémentation

### Phase 1 ✅ — Restructuration du layout (spatial-clients-view.tsx)
- [ ] Supprimer le layout "table + sidebar" copié de quotes
- [ ] Nouveau layout "Répertoire" :
  - Header "Répertoire" + recherche + actions
  - Barre alphabétique latérale (A-Z) avec compteurs
  - Zone principale : grille de fiches contacts
  - Pas de sidebar fixe (fiche détail au clic en overlay/sheet)
- [ ] Appliquer la palette "Répertoire" (warm beige bg, teal accents)
- [ ] Nettoyer les imports inutiles (motion, quote-detail-sidebar references)

### Phase 2 — Grille de fiches contacts (directory-grid.tsx)
- [ ] Créer `ContactCard` : carte de visite avec initiales, nom, email, téléphone, adresse
- [ ] Créer `ClientDirectoryGrid` : grille responsive 4→3→2→1 colonnes
- [ ] Mode liste compacte alternative
- [ ] Intégrer dans spatial-clients-view

### Phase 3 — Transformation du panneau détail (client-profile-view.tsx)
- [ ] Remplacer `ClientDetailSidebar` par `ClientProfileView`
- [ ] Design "fiche de contact" premium avec bannière, sections repliables
- [ ] Timeline simplifiée des interactions
- [ ] Bouton d'action rapide "Nouveau devis pour ce client"

### Phase 4 — Composants répertoire dédiés
- [ ] `AlphaNav` → Barre de navigation alphabétique
- [ ] `ContactCard` → Carte de visite individuelle
- [ ] `ClientProfileCard` → Fiche détaillée complète
- [ ] `ViewToggle` → Bascule grille/liste

### Phase 5 — Nettoyage et suppression des copier-coller
- [ ] Supprimer les imports inutiles de framer-motion
- [ ] Supprimer les références aux composants quotes
- [ ] Créer pagination spécifique clients
- [ ] Nettoyer les constantes dupliquées

### Phase 6 — Ajustements UX finaux
- [ ] Transitions subtiles au hover sur les cartes
- [ ] Préparer compatibilité dark mode
- [ ] Responsive : grille s'adapte
- [ ] Empty states illustrés

---

## 📊 Fichiers impactés (ordre de modification)

| # | Fichier | Opération |
|---|---------|-----------|
| 1 | `my-app/features/clients/spatial-clients-view.tsx` | **Phase 1** - Réécriture layout |
| 2 | `my-app/features/clients/components/client-table.tsx` | **Phase 2** - Remplacer par directory-grid |
| 3 | `my-app/features/clients/components/client-detail-sidebar.tsx` | **Phase 3** - Remplacer par profile-view |
| 4 | `my-app/features/clients/components/client-constants.ts` | **Phase 4** - Nouvelles constantes |
| 5 | `my-app/features/clients/components/client-completion-alert.tsx` | **Phase 4** - Remplacer |
| 6 | `my-app/features/clients/components/client-inspector.tsx` | **Phase 5** - Supprimer/fusionner |
| 7 | `my-app/features/clients/components/client-creation-sheet.tsx` | Conserver |
| 8 | `my-app/features/clients/components/import-csv-modal.tsx` | Conserver |