# Roadmap d'Alignement Design — Page Clients

**Objectif** : Mettre la page clients en conformité avec la page quotes (source de vérité)  
**Design System** : Swift-Bento (my-app/lib/design-system.ts)  
**Document de référence** : `my-app/docs/DESIGN_ALIGNMENT_CLIENTS_VS_QUOTES.md`

---

## Phase 1 — Quick Wins (30 min) 🔵 ✅
*Correctifs immédiats, sans changement structurel*

- [x] **1.1 — Supprimer la div wrapper intermédiaire dans `spatial-clients-view.tsx`**
  - Remplacer `py-6` par `pt-6` sur le conteneur root
  - Supprimer la div `<div className="flex-1 overflow-hidden bg-slate-50">`
  - Appliquer `bg-slate-50` directement sur le root
  - ⚠️ Maintenir `gap-6` entre header et contenu

- [x] **1.2 — Ajouter `min-h-0` sur la colonne du panel détail**
  - Appliquer `min-h-0` sur `<div className="flex-1 overflow-y-auto">`

- [x] **1.3 — Remplacer `<div>` par `<aside>` pour le panel détail**
  - `<aside className="flex-1 min-h-0 overflow-y-auto">`

---

## Phase 2 — Badges & Design Tokens (1h) 🟡
*Uniformisation des tokens design*

- [ ] **2.1 — Remplacer `BADGE_CLASSES` par les tokens `DS_BADGE_*` dans `client-detail-panel.tsx`**
  - `PAID` → `DS_BADGE_SUCCESS`
  - `SENT` → `DS_BADGE_ACTIVE` **(important : indigo, pas blue)**
  - `DRAFT` → `DS_BADGE_NEUTRAL`
  - `ACCEPTED` → `DS_BADGE_ACCEPTED`
  - `REJECTED` → `DS_BADGE_DANGER`
  - `REMINDER` → `DS_BADGE_WARNING`
  - Supprimer les classes inline `BADGE_CLASSES` et `STATUS_LABELS`

- [ ] **2.2 — Créer un fichier partagé `client-constants.ts` avec les labels statuts**
  - Exporter `STATUS_LABELS` (à consommer par client-detail-panel et client-table)
  - Centraliser les constantes (comme `constants.ts` dans quotes)

- [ ] **2.3 — Remplacer `SECTION_CLASS` en dur par `DS_CARD` dans `client-detail-panel.tsx`**
  - `"bg-white border border-slate-200 rounded-md p-6"` → `DS_CARD` + `"p-6"`
  - Idem pour `SECTION_TITLE_CLASS` → `DS_SECTION_HEADER` + `DS_ICON_WRAPPER`

- [ ] **2.4 — Supprimer l'import inutilisé de `DS_BUTTON_SECONDARY` ou l'utiliser dans le code**
  - `client-detail-panel.tsx` importe `DS_BUTTON_SECONDARY` mais ne l'utilise pas

---

## Phase 3 — États Vides & Loading (1h30) 🟡 ✅
*Parité avec les 3 états vides de Quotes*

- [x] **3.1 — Ajouter l'état "Aucun client" (totalement vide) dans `ClientTable`**
  - Quand `clients.length === 0 && !isLoading` :
    - Icône `UserCircle` size={48} className="text-slate-200" weight="duotone"
    - Message "Aucun client trouvé" en `DS_MONO text-slate-400`
    - Sous-message "Ajoutez votre premier client pour commencer" en `text-[10px] text-slate-300`
    - Container centré : `py-24 gap-3 bg-white border border-slate-200 rounded-md`

- [x] **3.2 — Ajouter l'état "Recherche vide" dans `ClientTable`**
  - Quand `searchQuery && filteredClients.length === 0` :
    - Emoji 🔍 ou icône `MagnifyingGlass`
    - Message "Aucun client ne correspond à votre recherche"
    - Bouton "Réinitialiser les filtres" en `BTN_SECONDARY`

- [x] **3.3 — Ajouter l'état "Filtre vide" dans `ClientTable`**
  - Quand `activeFilter !== "all" && filteredClients.length === 0` :
    - Icône `Funnel` ou équivalent
    - Message selon le filtre : "Aucun client à relancer" / "Aucun client inactif"
    - Bouton "Voir tous les clients"

- [x] **3.4 — Ajouter un indicateur de chargement dans `ClientTable`**
  - Quand `isLoading === true && clients.length === 0` :
    - Squelette de 5 lignes ( shimmer placeholder )
    - Ou simple spinner avec message "Chargement..."
  - Passer `isLoading` en prop à `ClientTable` (déjà fait)

---

## Phase 4 — Layout & Ratios Responsive (1h30) 🟡
*Harmonisation du layout avec la page Quotes*

- [ ] **4.1 — Ratios de colonnes flexibles**
  - Remplacer `w-1/3 min-w-[350px] max-w-[500px]` par `flex-[4]` (table)
  - Remplacer `flex-1` du panel par `flex-[6]` (détail)
  - Garder `min-w-0` pour éviter les débordements

- [ ] **4.2 — Supprimer le niveau de div superflu dans `spatial-clients-view.tsx`**
  - Structure cible :
    ```tsx
    <div className="flex flex-col h-full w-full bg-slate-50">
      <div className="shrink-0 px-6 pt-6">
        <PageHeader ... />
      </div>
      <div className="flex w-full flex-1 min-h-0 px-6 pb-6 pt-4 overflow-hidden gap-6">
        <div className="flex-[4] min-w-0 flex flex-col">
          <ClientTable ... />
        </div>
        <aside className="flex-[6] flex flex-col min-h-0 overflow-hidden">
          <ClientDetailPanel ... />
        </aside>
      </div>
    </div>
    ```

- [ ] **4.3 — Aligner les espacements**
  - `pt-4` entre header et contenu (comme Quotes)
  - `pb-6` padding bas (comme Quotes)
  - Supprimer `gap-6` sur le conteneur flex (remplacé par `pt-4`)

---

## Phase 5 — Pagination Standardisée (1h) 🟡
*Migration vers `TablePagination`*

- [ ] **5.1 — Analyser la différence entre `ClientPagination` et `TablePagination`**
  - `ClientPagination` : pagination serveur (page, limit, totalPages, total, isLoading)
  - `TablePagination` : pagination client (currentPage, totalPages, totalItems)
  - **Décision** : adapter `TablePagination` pour supporter le mode serveur OU créer une version étendue

- [ ] **5.2 — Option A (recommandée) : Étendre `TablePagination`**
  - Ajouter une prop optionnelle `mode: "client" | "server"`
  - En mode serveur : afficher `start-end sur total` au lieu de `X items · Page Y/Z`
  - En mode serveur : désactiver les boutons pendant le chargement
  - Garder le même rendu visuel des boutons

- [ ] **5.3 — Option B : Remplacer `ClientPagination` par `TablePagination` sans extension**
  - Si la pagination peut être gérée côté client (charger tous les clients)
  - Dans ce cas, supprimer `ClientPagination` et toutes ses références

- [ ] **5.4 — Supprimer le fichier `client-pagination.tsx`** (une fois la migration faite)

---

## Phase 6 — Refactor `ClientDetailPanel` (2h) 🔵
*Nettoyage et alignement avec les patterns du design system*

- [ ] **6.1 — Supprimer les scrollbar customs redondantes**
  - Utiliser une classe globale si nécessaire
  - Ou appliquer seulement sur le conteneur parent

- [ ] **6.2 — Remplacer `formatCompact` par le helper partagé**
  - `lib/utils.ts` exporte `formatPrice`, `formatPriceCompact`, `formatDateShort`
  - Utiliser `formatPriceCompact` au lieu de la fonction locale `formatCompact`

- [ ] **6.3 — Remplacer `formatCurrency` par `formatPrice` de `lib/utils.ts`**
  - `formatPrice` gère déjà le format FCFA

- [ ] **6.4 — Vérifier l'utilisation de `DS_BUTTON_SECONDARY`**
  - Soit l'utiliser, soit supprimer l'import mort

- [ ] **6.5 — Nettoyer les logs de debug** (`console.log("[DEBUG ...]")`)

---

## Phase 7 — Tests & Validation (1h) 🟢 ✅
*Vérification de la non-régression et de l'alignement*

- [x] **7.1 — Vérifier que les tests existants passent**
  - ✅ `pnpm run test` → **88 tests passés** sur 10 fichiers
  - ✅ `client-action.test.ts` (5 tests) inclus et OK
  - ✅ `npx tsc --noEmit` → Compilation TypeScript sans erreur
  - ✅ `pnpm run build` → Build réussi, route `/clients` présente

- [ ] **7.2 — Vérifier manuellement les rendus** *(à faire dans le navigateur)*
  - États vides : charger la page sans clients
  - Recherche : taper une requête sans résultat
  - Filtres : basculer entre Tous / À relancer / Inactifs
  - Sélection : checker/déchecker des clients, bulk delete

- [ ] **7.3 — Vérifier la cohérence visuelle**
  - Comparer côte à côte Quotes et Clients
  - Badges : vérifier que SENT = indigo (plus blue)
  - Header : mêmes espacements, mêmes styles
  - Mêmes largeurs de colonnes, même typographie

- [ ] **7.4 — Vérifier la réactivité**
  - Redimensionner la fenêtre
  - Les ratios flex doivent s'adapter
  - Pas de débordement horizontal

---

## Résumé de l'Effort

| Phase | Durée estimée | Priorité | Impact visuel |
|-------|---------------|----------|---------------|
| 1 — Quick Wins | 30 min | 🔵 Haute | Faible |
| 2 — Badges & Tokens | 1h | 🟡 Haute | Moyen |
| 3 — États vides | 1h30 | 🟡 Haute | Élevé |
| 4 — Layout responsive | 1h30 | 🟡 Haute | Élevé |
| 5 — Pagination | 1h | 🟡 Moyenne | Moyen |
| 6 — DetailPanel | 2h | 🔵 Basse | Faible |
| 7 — Tests | 1h | 🟢 Basse | - |
| **Total** | **~8h30** | | |

## Ordre d'Exécution Recommandé

```
Phase 1 (Quick Wins) ✅
    ↓
Phase 2 (Badges/Tokens)
    ↓
Phase 3 (États vides) ✅
    ↓
Phase 4 (Layout responsive)
    ↓
Phase 5 (Pagination)
    ↓
Phase 6 (DetailPanel)     ← Peut être fait en parallèle de 4-5
    ↓
Phase 7 (Tests)