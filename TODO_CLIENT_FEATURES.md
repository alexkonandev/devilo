# TODO — Features Page Clients (Factouro)

> Priorisation par valeur utilisateur / complexité technique
> Mettre à jour après chaque sprint terminé

---

## 🔴 MUST HAVE — MVP SaaS Facturation

### 1. Feedback visuel copie email

**Status:** ✅ **DONE**  
**Complexité:** Low (5 min)  
**Valeur:** UX basique, évite la confusion

**Tâches:**

- [x] Ajouter state `copiedAll` dans `spatial-clients-view.tsx`
- [x] Afficher toast/alert "Emails copiés !" après clic
- [x] Auto-hide après 2 secondes

**Fichiers:**

- `features/clients/spatial-clients-view.tsx`

---

### 2. Export CSV clients

**Status:** ✅ **DONE**  
**Complexité:** Low (20 min)  
**Valeur:** Sauvegarde données, comptabilité externe

**Tâches:**

- [x] Fonction `exportClientsToCSV()` dans la page
- [x] Headers: ID, Nom, Email, Téléphone, Adresse, SIRET, TVA, CA total, Nombre devis
- [x] Bouton dans toolbar ou sidebar
- [x] Gérer charset UTF-8 pour accents

**Fichiers:**

- `features/clients/spatial-clients-view.tsx`

---

### 3. Pagination côté serveur

**Status:** ✅ **DONE**  
**Complexité:** Medium (1h)  
**Valeur:** Scale à 10K+ clients sans crash  
**Dépend de:** Rien

**Tâches:**

- [x] Modifier `getClientsAction` pour accepter `page`, `limit`, `search` → `getClientsPaginated()` créé
- [x] Ajouter `count()` total pour pagination
- [x] Composant `ClientPagination` (Prev/Next + numéros de page)
- [x] State `currentPage`, `totalPages` dans la vue
- [x] Loader pendant fetch

**API:**

```ts
// app/actions/client-actions.ts
getClientsAction({
  page: number,
  limit: number,
  search?: string,
  sortBy?: 'name' | 'createdAt' | 'revenue'
})
```

**Fichiers:**

- `app/actions/client-actions.ts`
- `features/clients/spatial-clients-view.tsx`
- `features/clients/components/client-pagination.tsx` (new)

---

### 4. Fiche client complète (rich data)

**Status:** ✅ **DONE**  
**Complexité:** High (2h)  
**Valeur:** Conformité fiscale, facturation légale  
**Dépend de:** Migration Prisma

**Tâches:**

- [x] **Migration Prisma:** Ajouter champs au schéma `Client`
  - [x] `phone?: String`
  - [x] `addressLine2`, `city`, `postalCode`
  - [x] `country?: String` (default: "CI")
  - [x] `tvaNumber?: String`
  - [x] `legalForm?: String` (SARL, SAS, SA, EI...)
  - [x] `representativeName?: String`
  - [x] `representativePosition?: String`
  - [x] `notes?: String` (textarea)
  - [x] `tags?: Json` (JSON array)
- [x] Mettre à jour types TypeScript (`ClientFull`, `EditorClient`)
- [x] UI formulaire édition avec 4 onglets:
  - [x] Coordonnées (nom, email, téléphone)
  - [x] Adresse fiscale (rue, complément, CP, ville, pays)
  - [x] Info légale (forme juridique, représentant, RCCM, TVA)
  - [x] Notes internes + Tags
- [x] Intégrer le formulaire dans la liste (bouton Éditer)
- [x] Appliquer migration à Neon (`prisma db push`)

**Fichiers:**

- `prisma/schema.prisma` ✅
- `types/client.ts` ✅
- `actions/client-action.ts` ✅
- `features/clients/components/client-edit-form.tsx` ✅ (nouveau)
- `types/client.ts`
- `app/actions/client-actions.ts` (update/update)
- `features/clients/client-form.tsx` (refactor)

---

### 5. Import CSV clients

**Status:** ✅ **DONE**  
**Complexité:** High (2h)  
**Valeur:** Adoption rapide, migration depuis Excel/Salesforce  
**Dépend de:** Feature #4 (rich data schema)

**Tâches:**

- [x] Modal "Importer des clients"
- [x] Upload zone (drag & drop ou file input)
- [x] Parser CSV côté client (PapaParse)
- [x] Validation ligne par ligne:
  - [x] Email format valide
  - [x] Nom obligatoire
  - [x] Détection doublons (email existant)
- [x] Preview avant import (10 premières lignes)
- [x] Bouton "Importer X clients"
- [x] Action serveur `importClientsAction(csvData)`
- [x] Rapport post-import: success, erreurs, doublons ignorés
- [x] Dépendances installées: `papaparse`, `react-dropzone`

**Format CSV attendu:**

```csv
name,email,phone,address,siret,tvaNumber,tags
"Acme Corp","contact@acme.com","+33123456789","12 rue de Paris","12345678901234","FR12345678901","VIP;Entreprise"
```

---

### 6. Bulk Actions (Sélection multiple)

**Status:** ✅ **DONE**  
**Complexité:** Medium (30 min)  
**Valeur:** Productivité, gestion de masse  
**Dépend de:** Rien

**Tâches:**

- [x] Checkbox "Tout sélectionner" dans le header de la liste
- [x] Gestion du state `selectedIds` (Set de IDs)
- [x] Toolbar conditionnelle quand sélection active
- [x] Affichage compteur "X clients sélectionnés"
- [x] Bouton "Supprimer" rouge avec confirmation
- [x] Action serveur `deleteManyClients(ids[])`
- [x] Refresh automatique après suppression

**Fichiers:**

- `features/clients/spatial-clients-view.tsx` ✅
- `actions/client-action.ts` ✅

---

## 🟡 NICE TO HAVE — Mois 2-3

### 7. Tags/catégories clients

**Status:** 🚫 **HORS SPRINT**  
**Complexité:** Low (30 min)  
**Valeur:** Segmentation marketing, filtres rapides  
**Dépend de:** Fiche client complète (champ tags existe)

**Tâches:**

- [ ] (retiré du sprint) Stockage tags / UI tags / filtres tags

**Fichiers:**

- `components/ui/tag-input.tsx` (reusable)
- `features/clients/client-form.tsx`

---

### 8. Vue Kanban/Timeline (Pipeline client)

**Status:** ✅ **DONE**  
**Complexité:** High (3h)  
**Valeur:** Vue métier visuelle du funnel

**Colonnes Kanban:**

- Prospect (jamais de devis)
- Devis envoyé
- Négociation
- Gagné (devis payé)
- Perdu

**Tâches:**

- [x] Toggle vue: "Liste / Kanban" (icons dans toolbar)
- [x] Composant `ClientKanbanView`
- [x] Drag & drop entre colonnes (ou boutons "Avancer")
- [x] Compteurs par colonne

**Fichiers:**

- `features/clients/components/client-kanban-view.tsx` ✅

---

### 9. Notes et historique activités

**Status:** ✅ **DONE**  
**Complexité:** Medium (1h)  
**Valeur:** CRM basique, mémoire commerciale

**Tâches:**

- [x] Table `ClientActivity` dans Prisma (déjà existante)
- [x] Timeline dans fiche client détail (`client-inspector.tsx`)
- [x] Quick-add: "Ajouter une note", "Appel passé"

**Fichiers:**

- `prisma/schema.prisma` ✅
- `app/actions/client-activity-actions.ts` ✅
- `features/clients/components/client-inspector.tsx` ✅

---

### 10. Intégration email (envoi devis)

**Status:** ✅ **DONE**  
**Complexité:** High (4h)  
**Valeur:** Workflow complet sans quitter l'app  
**Dépend de:** Resend

**Tâches:**

- [x] Installer `resend`
- [x] Module email: `lib/email.ts` (template HTML avec logo, CTA, responsive)
- [x] Server action: `actions/send-quote-email.ts`
  - [x] Génération PDF via `/api/print`
  - [x] Envoi via Resend avec pièce jointe PDF
  - [x] Logger dans `ClientActivity` (type EMAIL)
  - [x] Auto-passage en statut SENT si DRAFT
- [x] UI: `features/quotes/components/send-email-modal.tsx`
  - [x] Modal avec destinataire, message optionnel, feedback loading/sent
- [x] Bouton "Envoyer par email" dans le menu dropdown des devis
- [x] Bouton direct dans le footer de chaque carte devis
- [x] Variables d'environnement ajoutées (RESEND_API_KEY)

**Configuration nécessaire:**
- [ ] Clé API Resend valide (remplacer `re_xxxxxxxxxxxx` dans `.env`)
- [ ] Domaine vérifié dans Resend

**Fichiers:**

- `lib/email.ts` (nouveau)
- `actions/send-quote-email.ts` (nouveau)
- `features/quotes/components/send-email-modal.tsx` (nouveau)
- `features/quotes/spatial-quotes-view.tsx` (modifié)
- `.env` (modifié)

---

### 11. Rappels automatiques (Insights)

**Status:** ✅ **DONE**  
**Complexité:** High (3h)  
**Valeur:** Proactivité commerciale

**Règles de rappel implémentées:**
- Client sans devis depuis 90j → "À relancer"
- Devis envoyé, pas de réponse depuis 14j → "Relancer"
- Client VIP pas de nouveau devis depuis 30j → "Check-in"

**Tâches:**

- [x] Server action: `actions/reminder-action.ts`
  - [x] Algorithme de détection des 3 règles
  - [x] Tri par urgence (daysSince décroissant)
  - [x] Retourne `ReminderItem[]` avec label, action, lien
- [x] Hook React: `features/reminders/use-reminders.ts`
  - [x] Polling automatique toutes les 5 min
  - [x] `totalCount`, `getCountByType()`, `refresh()`
- [x] UI: `features/reminders/reminder-popover.tsx`
  - [x] Popover design system avec 3 icônes par type
  - [x] Lien d'action direct (créer devis, relancer, check-in)
  - [x] Compteur de rappels dans le header
  - [x] Footer avec rafraîchissement manuel
- [x] Intégration StatusBar: `components/spatial-status-bar.tsx`
  - [x] Bouton cloche avec badge rouge (nombre de rappels)
  - [x] Ouverture/fermeture du popover
- [x] Route API Cron: `app/api/cron/client-reminders/route.ts`
  - [x] Analyse quotidienne pour tous les utilisateurs
  - [x] Logs des résultats
  - [x] Compatible Vercel Cron (config `crons` dans `vercel.json`)

**Fichiers:**

- `actions/reminder-action.ts` (nouveau)
- `features/reminders/use-reminders.ts` (nouveau)
- `features/reminders/reminder-popover.tsx` (nouveau)
- `app/api/cron/client-reminders/route.ts` (nouveau)
- `components/spatial-status-bar.tsx` (modifié)

---

## 🗓️ Réalisé

| Semaine | Features | Focus              |
| ------- | -------- | ------------------ |
| S1      | 1, 2, 3  | UX + Scale         |
| S2      | 4        | Data complète      |
| S3      | 5        | Migration adoption |
| S4      | 6        | Productivité       |
| S5      | 10       | Email devis        |
| **S6**  | **11**   | **Rappels auto**   |

---

## 📝 Checklist migration DB

Quand on modifie `prisma/schema.prisma`:

- [ ] `npx prisma migrate dev --name add_client_fields`
- [ ] `npx prisma generate`
- [ ] Mettre à jour les types TypeScript
- [ ] Mettre à jour les actions serveur
- [ ] Test avec données existantes

---

## 🔗 Ressources

- [Prisma Relations](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)
- [PapaParse CSV](https://www.papaparse.com/)
- [Resend Email API](https://resend.com/docs)
- [Vercel Cron](https://vercel.com/docs/cron-jobs)