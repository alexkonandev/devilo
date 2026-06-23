# Settings — Plan de Réalignement Design

> **Problème**: La page Settings a son propre sidebar (200px), son propre header (TelemetryHUD), et chaque composant redéfinit son propre objet DS local. Elle semble venir d'un autre site.
> **Objectif**: Aligner sur le pattern Billing (bento cards, 12-col grid, tokens DS partagés).
> **Référence**: `lib/design-system.ts` (source de vérité) + `spatial-billing-view.tsx` (pattern à suivre).

---

## ✅ PHASE 1 — Supprimer le sidebar propriétaire et le header PKI (TERMINÉE)

**1.1. Abandon du layout grid `[200px_1fr]` + sidebar gauche**
- Dans `spatial-settings-view.tsx`, remplacer le `grid grid-cols-[200px_1fr] overflow-hidden` par un layout vertical simple (`flex flex-col` ou directement la grille 12-col)
- Supprimer le composant `<SettingsSidebar />` et son interface/props associées
- Supprimer `<TelemetryHUD />` et son interface/props associées

**1.2. Navigation latérale → Navigation par tabs en haut**
- Remplacer le SettingsSidebar par une `<SettingsTabs>` horizontale (comme la page Quotes utilise des tabs)
- Implémenter soit des tabs natives (composant shadcn `<Tabs>`) soit une barre de navigation horizontale compacte
- Les sections : "Profil", "Paiement", "Sécurité" deviennent des tabs cliquables en haut
- Bonus : ajouter un indicateur visuel "modifications en cours" (le `formDirty` dot)

**1.3. Migration du header HUD → Header Bento**
- Remplacer TelemetryHUD (barre grise border-b avec HUD items) par :
  - Une rangée de bento cards en haut (12-col grid) qui affichent les métriques clés
  - Utiliser les tokens `DS_BENTO_CARD`, `DS_SECTION_HEADER`, `DS_ICON_WRAPPER`, `DS_LABEL`, `DS_MONO`
  - Pattern identique à Billing (`BentoPlanStatus`, `BentoAnalytics`)
- Supprimer le search bar + bouton save du header → les déplacer dans la barre de tabs ou en sticky footer

**1.4. Refonte du bouton Save en floating action bar**
- Remplacer le bouton "Sauver" dans le header par un sticky footer qui n'apparaît que quand `isDirty === true`
- Pattern : barre fixe en bas de l'écran avec "Modifications en cours" + bouton "Sauvegarder" + bouton "Annuler"
- Utiliser `DS_BUTTON` et `DS_BUTTON_SECONDARY`

---

## PHASE 2 — Migration des tokens DS locaux vers le DS global

Chaque fichier composant dans `features/settings/components/` définit actuellement son propre objet `DS = { micro, label, mono, card, input, button }` en dur. Cela doit être remplacé par les imports depuis `@/lib/design-system`.

**2.1. Fichier `ProfileSection.tsx`**
- Supprimer le bloc `const DS = { ... }` lignes 26-33
- Importer les tokens suivants depuis `@/lib/design-system`:
  - `DS_LABEL` à la place de `DS.label`
  - `DS_MONO` à la place de `DS.mono`
  - `DS_BENTO_CARD` à la place de `DS.card`
  - `DS_INPUT` à la place de `DS.input`
  - `DS_MICRO` à la place de `DS.micro`
- Remplacer tous les `className={cn(DS.xxx, ...)}` par les tokens importés
- Vérifier que les classes `rounded-lg` deviennent `rounded-md` (selon DS)
- Vérifier que les inputs utilisent `DS_INPUT` qui a `border border-slate-200` au lieu de `border-0 border-b`

**2.2. Fichier `SecuritySection.tsx`**
- Supprimer le bloc `const DS = { ... }` lignes 23-32
- Importer depuis `@/lib/design-system`: `DS_BENTO_CARD`, `DS_LABEL`, `DS_MONO`, `DS_INPUT`, `DS_BUTTON`, `DS_ICON_WRAPPER`, `DS_TEL_BLOCK`, `DS_BADGE_*`, `DS_PROGRESS_TRACK`, `DS_PROGRESS_BAR`
- Remplacer tous les `cn(DS.xxx, ...)` par les tokens DS globaux
- Les `rounded` deviennent `rounded-md` et les `rounded-full` restent si approprié

**2.3. Fichier `PaymentSection.tsx`**
- Supprimer le bloc `const DS = { ... }` lignes 30-37
- Importer depuis `@/lib/design-system`: `DS_BENTO_CARD`, `DS_LABEL`, `DS_MONO`, `DS_INPUT`, `DS_TEL_BLOCK`, `DS_ICON_WRAPPER`, `DS_BADGE_*`
- Remplacer tous les `cn(DS.xxx, ...)` par les tokens DS globaux
- Refonte du segmented control USA/EUR/AFRI pour utiliser `DS_BUTTON` / `DS_BUTTON_SECONDARY`

**2.4. Fichier `DangerZoneSection.tsx`**
- Supprimer le bloc `const DS = { ... }` lignes 8-15
- Importer depuis `@/lib/design-system`: `DS_LABEL`, `DS_INPUT`, `DS_BUTTON`
- Remplacer les `cn(DS.xxx, ...)`

---

## PHASE 3 — Refonte du layout principal (spatial-settings-view.tsx)

**3.1. Nouvelle structure layout (inspirée de billing)**
```tsx
<div className="h-full overflow-y-auto bg-slate-50 p-4">
  <div className="max-w-6xl mx-auto">
    {/* Row 1 — Tabs Navigation + Save */}
    <SettingsHeaderTabs ... />

    {/* Row 2 — Bento Telemetry (métriques) */}
    <div className="grid grid-cols-12 gap-4 mb-4">
      <BentoSettingsTelemetry className="col-span-12" />
    </div>

    {/* Row 3 — Main Content (12-col grid) */}
    <form ...>
      <div className="grid grid-cols-12 gap-4">
        {activeSection === "profile" && (
          <>
            <BentoProfileCard className="col-span-12 lg:col-span-8" />
            <BentoProfileTelemetry className="col-span-12 lg:col-span-4" />
          </>
        )}
        {activeSection === "payment" && (
          <>
            <BentoPaymentCard className="col-span-12 lg:col-span-8" />
            <BentoPaymentTelemetry className="col-span-12 lg:col-span-4" />
          </>
        )}
        {activeSection === "security" && (
          <>
            <BentoSecurityCard className="col-span-12 lg:col-span-6" />
            <BentoSecurityTelemetry className="col-span-12 lg:col-span-6" />
            <DangerZoneCard className="col-span-12" />
          </>
        )}
      </div>
    </form>

    {/* Row 4 — Sticky Save Bar (si isDirty) */}
    <StickySaveBar ... />
  </div>
</div>
```

**3.2. Nouveau composant `SettingsTabs`**
- Barre horizontale avec les sections : Profil | Paiement | Sécurité
- Indicateur `isDirty` (dot ambre)
- Search bar intégrée (optionnelle, peut être déplacée dans la barre de tabs)
- Style : border-b avec tabs activés en `bg-indigo-50 text-indigo-700`
- Utiliser `DS_LABEL`, `DS_MONO` pour la typo

**3.3. Nouveau composant `StickySaveBar`**
- Barre fixe en bas (ou en sticky bottom) qui apparaît uniquement quand `isDirty === true`
- Affiche "Modifications en cours" + timestamp dernier save
- Bouton "Sauvegarder" (`DS_BUTTON`) + "Annuler" (`DS_BUTTON_SECONDARY`)
- Utiliser `DS_TEL_BLOCK` pour le fond

**3.4. Nouveau composant `SettingsTelemetryHUD`**
- Une rangée de bento cards (grid cols-3 ou cols-4) avec les métriques :
  - Score sécurité (en %)
  - État compte (PRO/GRATUIT)
  - Dernière sync (timestamp)
  - Statut configuration (COMPLET/INCOMPLET)
- Chaque carte = `DS_BENTO_CARD` avec `DS_SECTION_HEADER` + `DS_TEL_BLOCK` interne
- Pattern exact de `BentoAnalytics` dans billing

---

## PHASE 4 — Refonte des cartes de télémetry (sidebar droite)

**4.1. `BentoProfileTelemetry`**
- Actuellement un stacked block avec 4 tel-blocks verticaux
- Refondre en grille 2x2 de `DS_TEL_BLOCK` pour suivre le pattern billing
- Utiliser `DS_BENTO_CARD` comme wrapper

**4.2. `BentoPaymentTelemetry`**
- Même pattern : grille de tel-blocks avec statuts
- Uniformiser les StatusBadge pour utiliser `DS_BADGE_SUCCESS`, `DS_BADGE_WARNING`, `DS_BADGE_DANGER`

**4.3. `BentoSecurityTelemetry`**
- Même pattern
- Le score barre doit utiliser `DS_PROGRESS_TRACK` et `DS_PROGRESS_BAR`

---

## PHASE 5 — Ajustements fins et réconciliation

**5.1. Inputs styling mismatch**
- Actuellement les inputs settings utilisent `border-0 border-b border-slate-200 focus:border-indigo-400` (style "underline")
- Le DS global définit `DS_INPUT = "bg-white border border-slate-200 px-3 py-2..."` (style "full border")
- Décision: migrer vers le style DS global (full border) pour cohérence avec le reste de l'app
- Impact: ProfileSection, SecuritySection, PaymentSection, DangerZoneSection

**5.2. Tailles de padding cohérentes**
- Settings actuel: `p-4` sur les cartes (OK avec DS)
- Mais certains composants ont `rounded-lg` → remplacer par `rounded-md`
- Les badges settings utilisent `rounded text-[8px]` → remplacer par les DS_BADGE_* correspondants

**5.3. Icônes**
- Vérifier que toutes les icônes utilisent `DS_ICON_SM` (12) ou `DS_ICON_XS` (10) de manière cohérente
- Actuellement les settings utilisent `size={12}`, `size={11}`, `size={9}` de façon arbitraire

**5.4. Couleurs de fond des cartes**
- Settings: `bg-white border border-slate-100/60` → DS: `bg-white border border-slate-200 rounded-md`
- Migration complète

---

## PHASE 6 — Nettoyage et validation

**6.1. Suppression du code mort**
- Supprimer les anciens composants `SettingsSidebar`, `TelemetryHUD` après migration
- Supprimer l'import de `CaretRightIcon`, `CommandIcon`, `GearIcon` devenus inutiles
- Vérifier que le type `SettingsSection` reste pertinent (utilisé par tabs)

**6.2. Vérification responsive**
- Tester le layout sur écran large (≥ 1024px) et tablette (≥ 768px)
- Les grilles `lg:col-span-8` + `lg:col-span-4` doivent fonctionner
- Sur mobile: tout en `col-span-12`

**6.3. Checklist finale d'alignement**
- [ ] Plus de sidebar de 200px propre à settings
- [ ] Plus de header "PKI" (TelemetryHUD original)
- [ ] Tous les composants utilisent les tokens de `lib/design-system.ts`
- [ ] Plus de `const DS = { ... }` local dans les composants
- [ ] Layout en 12-col grid avec bento cards (pattern billing)
- [ ] Sticky save bar (pas de bouton save dans le header)
- [ ] Tabs horizontales pour la navigation entre sections
- [ ] Inputs en `DS_INPUT` (full border, pas underline)
- [ ] Arrondis en `rounded-md` (pas `rounded-lg`)
- [ ] Badges via `DS_BADGE_*`
- [ ] Padding via `p-4` cohérent
- [ ] Icônes via `DS_ICON_SM` / `DS_ICON_XS`

---

## Résumé des fichiers à modifier

| Fichier | Changement |
|---------|-----------|
| `features/settings/spatial-settings-view.tsx` | Layout complet, supprimer sidebar + TelemetryHUD, ajouter tabs + sticky save + bento telemetry |
| `features/settings/components/ProfileSection.tsx` | Migrer DS local → DS global, inputs style |
| `features/settings/components/SecuritySection.tsx` | Migrer DS local → DS global |
| `features/settings/components/PaymentSection.tsx` | Migrer DS local → DS global, segmented control style |
| `features/settings/components/DangerZoneSection.tsx` | Migrer DS local → DS global |

*Aucun nouveau fichier nécessaire — tout se fait dans les fichiers existants.*