# Billing Page — Alignement Pixel-Perfect sur Settings

> **Date**: 18/06/2026
> **Statut**: 🔄 En cours
> **Objectif**: Aligner le design de la page Billing sur la page Settings (référence UX)

---

## Diagnostic des différences

### 1. Padding des cartes
| Élément | Settings (référence) | Billing (actuel) |
|---|---|---|
| Padding carte | `DS_BENTO_CARD, "p-3"` (12px) | `DS_BENTO_CARD` (16px) |
| Header margin-bottom | `mb-3` | `DS_SECTION_HEADER` → `mb-4` |
| Header gap | `gap-1.5` | `gap-2` |

### 2. Structure du header
- **Settings** : header inline sans token → `flex items-center justify-between mb-3`, `gap-1.5`
- **Billing** : utilise `DS_SECTION_HEADER` → `flex items-center justify-between mb-4`, `gap-2`

### 3. Prop `className` manquante
- **Settings** : prop `className?: string` disponible sur toutes les cartes
- **Billing** : prop absente de toutes les cartes

### 4. Gaps contenu
- **Settings** : `<div className="space-y-3">` systématique
- **Billing** : pas de wrapper de gap uniforme

---

## Plan de correction

### Phase 1 — Compact Cards (p-3, mb-3, gap-1.5)

- [ ] 1.1 PlanStatusCard → `DS_BENTO_CARD, "p-3"` + header compact + `className`
- [ ] 1.2 AnalyticsCard → `DS_BENTO_CARD, "p-3"` + header compact + `className`
- [ ] 1.3 UpgradeCard → `DS_BENTO_CARD, "p-3"` + header compact + `className`
- [ ] 1.4 ManageCard → `DS_BENTO_CARD, "p-3"` + header compact + `className`
- [ ] 1.5 FinancialLifecycleCard → `DS_BENTO_CARD, "p-3"` + header compact + `className`
- [ ] 1.6 InvoicesCard → `DS_BENTO_CARD, "p-3"` + header compact + `className`

### Phase 2 — Vérification

- [ ] 2.1 Vérifier que `className` est bien passé à la div racine (avec cn())
- [ ] 2.2 Vérifier que le contenu utilise `space-y-3`
- [ ] 2.3 Vérifier que tous les DS_MICRO n'ont pas de `"text-slate-600"` redondant

---

## Fichiers modifiés
1. `my-app/features/billing/components/plan-status-card.tsx`
2. `my-app/features/billing/components/analytics-card.tsx`
3. `my-app/features/billing/components/upgrade-card.tsx`
4. `my-app/features/billing/components/manage-card.tsx`
5. `my-app/features/billing/components/financial-lifecycle-card.tsx`
6. `my-app/features/billing/components/invoices-card.tsx`

## Pattern cible (copié de Settings)

```tsx
<div className={cn(DS_BENTO_CARD, "p-3", className)}>
  {/* Header compact */}
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-1.5">
      <div className={cn(DS_ICON_WRAPPER, "bg-indigo-50")}>
        <Icon size={DS_ICON_SM} className="text-indigo-500" />
      </div>
      <span className={cn(DS_MICRO)}>Titre</span>
    </div>
    <div className="flex items-center gap-1.5">
      {badge}
    </div>
  </div>
  {/* Contenu compact */}
  <div className="space-y-3">
    {children}
  </div>
</div>