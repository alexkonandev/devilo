# 🎨 Composants & Features — Factouro

## 1. Vue d'ensemble

Cette page documente la couche **frontend** de l'application : composants racine, vues métier (`features/`), composants de l'éditeur, landing page, hooks et types TypeScript.

---

## 2. Composants Racine

### 2.1 `components/spatial-dock.tsx` — Dock de navigation

Barre latérale verticale fixe (dock spatial) qui organise la navigation en 4 niveaux :
1. **Accueil** (rond foncé)
2. **Modules métier** : Devis, Clients, Facturation
3. **CTA central** "Nouveau Devis" (bouton indigo avec tooltip et spinner de chargement)
4. **Paramètres**

Utilise des tooltips Radix et des icônes Phosphor. Détecte la route active via `usePathname`.

### 2.2 `components/spatial-status-bar.tsx` — Barre de statut

Barre de statut supérieure fixe (h-10) avec 3 zones :
- **Gauche** : logo
- **Centre** : barre de recherche (ouvre une command palette ⌘K permettant de rechercher des actions)
- **Droite** : 3 popovers de notification (Rappels, Alertes, Activité) + avatar de déconnexion

### 2.3 `components/landing-page-view.tsx` — Landing page

Vue complète de la page d'accueil. Reçoit `userId` et `hasQuote` en props. Assemble navigation, hero, démo, workflow, fonctionnalités, tarifs, FAQ, CTA final et footer dans un conteneur plein écran avec fond sombre.

---

## 3. Features (vues métier)

Le dossier `features/` contient les vues métier de type **Spatial UI**.

### 3.1 `features/clients/` — Gestion des clients

| Fichier | Rôle |
|---------|------|
| `spatial-clients-view.tsx` | Vue complète des clients (liste, recherche, filtres, sélection multiple) |
| `components/directory-grid.tsx` | Grille / répertoire des clients |
| `components/directory-empty-state.tsx` | État vide |
| `components/contact-card.tsx` | Carte de contact |
| `components/client-profile-view.tsx` | Vue détail d'un client (KPIs, historique) |
| `components/client-filters-dropdown.tsx` | Filtres (À relancer, Inactifs, Tous) |
| `components/client-pagination.tsx` | Pagination |
| `components/client-creation-sheet.tsx` | Sheet de création de client |
| `components/delete-client-dialog.tsx` | Dialog de suppression |
| `components/import-csv-modal.tsx` | Import CSV avec preview |
| `components/client-constants.ts` | Constantes clients |
| `hooks/use-clients.ts` | Hook de gestion des clients |
| `audit-template.tsx` | Template d'audit (utilisé par la route API) |

### 3.2 `features/quotes/` — Liste des devis

| Fichier | Rôle |
|---------|------|
| `spatial-quotes-view.tsx` | Vue liste des devis (tableau, filtres, recherche) |
| `components/quotes-table.tsx` | Tableau des devis |
| `components/filters-dropdown.tsx` | Filtres (statut) |
| `components/quote-creation-sheet.tsx` | Sheet de création rapide |
| `components/quote-detail-sidebar.tsx` | Sidebar de détail d'un devis |
| `components/quote-context.tsx` | Contexte partagé des devis |
| `components/email-send-form.tsx` | Formulaire d'envoi par email |
| `components/export-actions.tsx` | Actions d'export (CSV) |
| `components/import-quotes-csv-modal.tsx` | Import devis CSV |
| `components/completion-alert.tsx` | Alerte de complétion |
| `components/quotes-empty-state.tsx` | État vide |
| `components/table-pagination.tsx` | Pagination du tableau |
| `components/constants.ts` | Constantes |
| `hooks/use-quotes-view.ts` | Hook de gestion des devis |
| `__test__/` | Tests (export-actions, quote-context, quotes-table) |

### 3.3 `features/billing/` — Facturation

| Fichier | Rôle |
|---------|------|
| `spatial-billing-view.tsx` | Vue facturation (plan, quotas, abonnement) |
| `components/plan-status-card.tsx` | Carte de statut du plan |
| `components/plan-comparator.tsx` | Comparateur de plans |
| `components/analytics-card.tsx` | Carte d'analytique |
| `components/financial-lifecycle-card.tsx` | Cycle financier |
| `components/billing-manage-block.tsx` | Bloc de gestion de l'abonnement (checkout/portail) |

### 3.4 `features/settings/` — Paramètres

| Fichier | Rôle |
|---------|------|
| `spatial-settings-view.tsx` | Vue des paramètres |
| `components/CompanyInfoCard.tsx` | Infos de la société |
| `components/LogoUploadField.tsx` | Upload du logo |
| `components/FiscalConfigCard.tsx` | Configuration fiscale (TVA, devise, préfixe) |
| `components/SecuritySection.tsx` | Sécurité (mot de passe, sessions) |
| `components/DangerZoneSection.tsx` | Zone de danger (suppression compte) |

### 3.5 `features/home/` & `features/dashboard/`

- `home/home-view.tsx` : vue d'accueil connecté
- `dashboard/` : composants du dashboard (KPIs, top clients, activité)

### 3.6 `features/reminders/`

- `use-reminders.ts` : hook de gestion des rappels / relances

### 3.7 `features/auth/`

- `sign-in-form.tsx`, `sign-up-form.tsx` : formulaires de connexion / inscription

---

## 4. Composants de l'Éditeur (`components/editor/`)

| Fichier | Rôle |
|---------|------|
| `quote-editor-layout.tsx` | Layout de l'éditeur (3 panneaux, gestion du zoom, soft-occlusion) |
| `studio-sidebar-left.tsx` | Sidebar gauche : sélection client, catalogue |
| `studio-sidebar-right.tsx` | Sidebar droite : finance (TVA, remise, devise), légal (échéance, validité) |
| `QuoteVisualizer.tsx` | Visualisation A4 temps réel du devis |
| `editor-header.tsx` | Header de l'éditeur (actions, template) |
| `client-selector-view.tsx` | Sélecteur de client |
| `create-client-dialog.tsx` | Dialog de création rapide de client |
| `template-selector-modal.tsx` | Modal de sélection de template |
| `studio-loader.tsx` | Loader du studio |
| `CreateQuoteClient.tsx` | Client de création de devis |
| `export/` | Composants d'export/aperçu template |
| `export/export-template-card.tsx` | Carte d'un template export |
| `export/template-preview-panel.tsx` | Panneau d'aperçu |
| `export/template-export-page.tsx` | Page d'export |

---

## 5. Composants de la Landing (`components/landing/`)

| Fichier | Rôle |
|---------|------|
| `landing-nav.tsx` | Navigation |
| `landing-hero.tsx` | Section hero |
| `landing-showcase.tsx` | Démo / showcase |
| `landing-workflow.tsx` | Workflow en étapes |
| `landing-features.tsx` | Fonctionnalités |
| `landing-pricing.tsx` | Tarifs |
| `landing-faq.tsx` | FAQ |
| `landing-cta.tsx` | CTA final |
| `landing-footer.tsx` | Pied de page |

---

## 6. PDF (`components/pdf/`)

- `printable-quote.tsx` : rendu React du devis pour l'impression PDF (template A4).

---

## 7. Composants partagés & UI

- `components/shared/new-quote-button.tsx` : bouton "Nouveau Devis" avec spinner de chargement.
- `components/shared/ui/` : petits composants partagés (confirm-dialog, success-feedback, skeleton).
- `components/ui/` : composants shadcn/ui (button, dialog, input, label, sheet, textarea, avatar, popover, alert-dialog, logo).

---

## 8. Hooks

| Hook | Rôle |
|------|------|
| `hooks/use-kernel-store.ts` | Store global **Zustand** (état de l'application/devis). |
| `hooks/use-debounce.ts` | Utilitaire de debounce. |

---

## 9. Types (`types/`)

| Fichier | Rôle |
|---------|------|
| `types/client.ts` | Types clients (Client, ClientListItem, etc.) |
| `types/dashboard.ts` | Types du dashboard (AdvancedDashboardData). |
| `types/editor.ts` | Types de l'éditeur. |
| `types/quote-editor.ts` | Types de l'éditeur de devis. |
| `types/quote-registry.ts` | Types du registre des devis. |

---

## 10. Navigation & Layouts

L'application utilise le **App Router** de Next.js avec des groupes de routes :

- `(auth)` : pages sign-in, sign-up, sso-callback
- `(dashboard)` : home, dashboard, quotes, clients, billing, settings
- `(editor)` : quotes/new, quotes/[id], quotes/new/export
- `(info)` : contact, privacy, terms, legal

Chaque groupe possède son layout (`layout.tsx`, `layout-client.tsx`) et ses états de chargement/erreur (`loading.tsx`, `error.tsx`). La barre latérale et la barre de statut sont montées dans le layout dashboard.