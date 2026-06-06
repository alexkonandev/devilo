# Enrichissement du tableau "Dernières Actions"

> **Objectif** : Exploiter l'espace libéré par le nouveau layout pour transformer le tableau en un véritable outil d'intelligence opérationnelle.

---

## Analyse des données disponibles

### Données déjà présentes dans `dashboard-actions.ts`

| Champ | Source Prisma | Utilisé ? |
|-------|--------------|-----------|
| `q.issueDate` | `quote.issueDate` | ❌ Permet calcul délai |
| `q.number` | `quote.number` | ❌ Numéro de devis |
| `q.lines[0]?.title` | `line.title` | ✅ Déjà dans `projectName` |
| `q.status` | `quote.status` | ✅ Déjà dans `status` |
| `q.client.name` | `client.name` | ✅ Déjà dans `clientName` |
| `client.quotes` | Tous les devis du client | ❌ Pour moyenne client |
| `catalogOffers` | Services suggérés | ❌ Récupéré mais non mappé |

### Données à remonter côté serveur

| Nouveau champ | Calcul |
|--------------|--------|
| `delaiJours` | `today - issueDate` en jours |
| `estUrgent` | `status === "SENT" && delaiJours > 7` |
| `moyenneClient` | Moyenne des montants de tous les devis du client |
| `variationMontant` | `(montant - moyenneClient) / moyenneClient * 100` |
| `categorie` | `lines[0]?.category` ou déduction via `lines[0]?.title` |
| `numeroDevis` | `q.number` |

---

## Phases d'implémentation

### Phase 1 — Backend : Enrichir `dashboard-actions.ts`
- Étendre `DashboardActivity` dans `types/dashboard.ts` avec les nouveaux champs
- Calculer `delaiJours`, `estUrgent`, `moyenneClient`, `variationMontant`, `categorie`
- Faire passer le `quoteCount` total du client (déjà dans `client._count.quotes`)

### Phase 2 — Mapping : Mettre à jour `page.tsx`
- Ajouter les nouveaux champs dans le mapping `fluxRecent`

### Phase 3 — UI : Enrichir `recent-actions-table.tsx`
- Mettre à jour `RecentActionItem` avec les nouveaux champs
- Ajouter les colonnes :
  ```
  Action | Client | Montant | Délai | Urgence | Catégorie | Action
  ```
  - **Colonne "Délai"** : badge "il y a 3j", "aujourd'hui", "hier"
  - **Colonne "Urgence"** : dot rouge + label "En retard" pour SENT >7j
  - **Colonne "Catégorie"** : tag de prestation (Tech, Marketing, etc.)
  - **Colonne "Action"** : bouton "Relancer" pour les devis urgents
- Adapter les `flex-[*]` pour la nouvelle grille

### Phase 4 — Intéraction : Bouton "Relancer"
- Action serveur `sendReminderAction` ou lien vers page d'envoi d'email
- Dans un premier temps : lien vers `/quotes?id=X`

---

## Visuel cible du nouveau tableau

```
┌──────────────────────────────────────────────────────────────────────┐
│ Dernières Actions                                        5 entrées  │
├──────────────┬──────────┬────────┬───────┬────────┬────────┬────────┤
│ Action       │ Client   │Montant │ Délai │Urgence │Catégori│        │
├──────────────┼──────────┼────────┼───────┼────────┼────────┼────────┤
│ ✓ Site Web   │ Dupont   │ 12.5M  │ 3j    │ ● Bon  │ Tech   │ →      │
│   refonte    │          │        │       │        │        │        │
│ ✎ Logo       │ Martin   │ 2.1M   │ 12j   │ ● En   │Créatif│Relancer│
│   marque     │          │        │       │ retard │        │        │
└──────────────┴──────────┴────────┴───────┴────────┴────────┴────────┘
```

---

## Fichiers à modifier

| Fichier | Modifications |
|---------|---------------|
| `types/dashboard.ts` | Étendre `DashboardActivity` avec nouveaux champs |
| `actions/dashboard-actions.ts` | Calculer délai, urgence, moyenne client, variation, catégorie |
| `app/(dashboard)/dashboard/page.tsx` | Ajouter les nouveaux champs dans le mapping `fluxRecent` |
| `features/dashboard/components/recent-actions-table.tsx` | Refonte UI complète : nouvelles colonnes + bouton action |
| `features/dashboard/DASHBOARD_RECENT_ACTIONS_ENRICHMENT.md` | Ce document |