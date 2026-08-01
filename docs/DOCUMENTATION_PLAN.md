# 📚 Portail de Documentation — Factouro

Ce plan organise la création de la documentation complète de l'application **Factouro** en **2 phases** pour optimiser la vitesse d'exécution.

---

## 🗂️ Les 2 Phases

### 🟦 **PHASE A — Documentation technique complète** *(8 fichiers)*

| # | Fichier | Contenu | Statut |
|---|---------|---------|--------|
| 1 | `docs/DOCUMENTATION_PLAN.md` | Ce plan + checklist de progression | ✅ |
| 2 | `docs/ARCHITECTURE.md` | Stack, diagramme, structure du projet, conventions | ⏳ |
| 3 | `docs/BASE_DE_DONNEES.md` | Modèles Prisma, enums, relations, ERD | ⏳ |
| 4 | `docs/AUTHENTIFICATION.md` | Middleware Clerk, routes publiques/protégées, sécurité | ⏳ |
| 5 | `docs/SERVER_ACTIONS.md` | Toutes les Server Actions | ⏳ |
| 6 | `docs/API_ROUTES.md` | Toutes les routes API | ⏳ |
| 7 | `docs/COMPOSANTS_ET_FEATURES.md` | Vues spatiales, editor, landing, hooks, types | ⏳ |
| 8 | `docs/TEMPLATES_DEVIS.md` | Les 15 templates + pipeline PDF | ⏳ |

### 🟥 **PHASE B — README & Index** *(2 fichiers)*

| # | Fichier | Contenu | Statut |
|---|---------|---------|--------|
| 9 | `docs/README.md` | Index central du portail de documentation | ⏳ |
| 10 | `README.md` (racine) | Refonte complète du README principal | ⏳ |

---

## ✅ Checklist de progression

### Phase A — Documentation technique
- [ ] Créer `docs/DOCUMENTATION_PLAN.md` *(ce fichier)*
- [ ] Créer `docs/ARCHITECTURE.md`
- [ ] Créer `docs/BASE_DE_DONNEES.md`
- [ ] Créer `docs/AUTHENTIFICATION.md`
- [ ] Créer `docs/SERVER_ACTIONS.md`
- [ ] Créer `docs/API_ROUTES.md`
- [ ] Créer `docs/COMPOSANTS_ET_FEATURES.md`
- [ ] Créer `docs/TEMPLATES_DEVIS.md`

### Phase B — README & Index
- [ ] Créer `docs/README.md` (index)
- [ ] Refondre le `README.md` racine

---

## 📋 Couverture de la documentation

- **Stack** : Next.js 16, TypeScript 5, Prisma 7, PostgreSQL (Neon), Clerk, Stripe, Resend, Puppeteer, Tailwind 4, Zustand, Zod, UploadThing
- **Backend** : 18 fichiers de Server Actions, 8 routes API, middleware d'authentification
- **Data** : 10 modèles Prisma, 5 enums
- **Frontend** : Composants editor, vues spatiales, landing page, hooks, types, 15 templates de devis
- **Méta** : plans d'audit et roadmaps existants