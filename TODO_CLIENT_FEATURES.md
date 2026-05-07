# TODO — Features Page Clients (Devis Express)

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

**Status:** 🔄 **IN PROGRESS**  
**Complexité:** High (2h)  
**Valeur:** Conformité fiscale, facturation légale  
**Dépend de:** Migration Prisma

**Tâches:**

- [x] **Migration Prisma:** Ajouter champs au schéma `Client`
  - [x] `phone?: String`
  - [x] `addressLine2`, `city`, `postalCode`
  - [x] `country?: String` (default: "CI")
  - [x] `tvaNumber?: String`
  - [x] `notes?: String` (textarea)
  - [x] `tags?: Json` (JSON array)
- [x] Mettre à jour types TypeScript (`ClientFull`, `EditorClient`)
- [x] UI formulaire édition avec 4 onglets:
  - [x] Coordonnées (nom, email, téléphone)
  - [x] Adresse fiscale (rue, complément, CP, ville, pays)
  - [x] Info légale (SIRET, TVA intracommunautaire)
  - [x] Notes internes + Tags
- [ ] **PENDING:** Intégrer le formulaire dans la liste (bouton Éditer)
- [ ] **PENDING:** Appliquer migration à Neon (`prisma migrate dev`)

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

**Status:** ⏳ À faire  
**Complexité:** High (2h)  
**Valeur:** Migration depuis Excel — **critique pour adoption**  
**Dépend de:** Fiche client complète (champs cibles connus)

**Tâches:**

- [ ] Modal "Importer des clients"
- [ ] Upload zone (drag & drop ou file input)
- [ ] Parser CSV côté client (PapaParse)
- [ ] Validation ligne par ligne:
  - Email format valide
  - Nom obligatoire
  - SIRET format (14 chiffres) si présent
  - Détection doublons (email existant)
- [ ] Preview avant import (10 premières lignes)
- [ ] Bouton "Importer X clients"
- [ ] Action serveur `importClientsAction(csvData)`
- [ ] Rapport post-import: success, erreurs, doublons ignorés

**Format CSV attendu:**

```csv
name,email,phone,address,siret,tvaNumber,tags
"Acme Corp","contact@acme.com","+33123456789","12 rue de Paris","12345678901234","FR12345678901","VIP;Entreprise"
```

**Fichiers:**

- `features/clients/components/import-csv-modal.tsx` (new)
- `app/actions/client-import-action.ts` (new)
- Dépendance: `papaparse` (npm install)

---

### 6. Bulk actions (actions de masse)

**Status:** ⏳ À faire  
**Complexité:** Medium (1h)  
**Valeur:** Productivité admin, gestion à grande échelle  
**Dépend de:** Pagination (sélection cohérente)

**Tâches:**

- [ ] Checkbox en header de liste: "Sélectionner tous (cette page)"
- [ ] Checkbox par ligne client
- [ ] Barre d'actions flottante quand sélection:
  - "Exporter sélection"
  - "Supprimer" (avec confirmation)
  - "Ajouter tag" (dropdown)
- [ ] Action serveur `bulkDeleteClients(ids)`
- [ ] Action serveur `bulkExportClients(ids)`
- [ ] Toast confirmation "X clients supprimés"

**Fichiers:**

- `features/clients/components/bulk-action-bar.tsx` (new)
- `app/actions/client-bulk-actions.ts` (new)

---

## 🟡 NICE TO HAVE — Mois 2-3

### 7. Tags/catégories clients

**Status:** ⏳ À faire  
**Complexité:** Low (30 min)  
**Valeur:** Segmentation marketing, filtres rapides  
**Dépend de:** Fiche client complète (champ tags existe)

**Tâches:**

- [ ] Stockage tags en JSON array (Prisma)
- [ ] UI: input tags avec autocomplétion (comme GitHub labels)
- [ ] Couleurs prédéfinies: VIP (gold), Prospect (blue), Retard (red), etc.
- [ ] Filtre rapide dans toolbar: boutons "VIP", "Prospect", "Tous"

**Fichiers:**

- `components/ui/tag-input.tsx` (reusable)
- `features/clients/client-form.tsx`

---

### 8. Vue Kanban/Timeline (Pipeline client)

**Status:** ⏳ À faire  
**Complexité:** High (3h)  
**Valeur:** Vue métier visuelle du funnel

**Colonnes Kanban:**

- Prospect (jamais de devis)
- Devis envoyé
- Négociation
- Gagné (devis payé)
- Perdu

**Tâches:**

- [ ] Toggle vue: "Liste / Kanban" (icons dans toolbar)
- [ ] Composant `ClientKanbanView`
- [ ] Drag & drop entre colonnes (ou boutons "Avancer")
- [ ] Compteurs par colonne

**Fichiers:**

- `features/clients/components/client-kanban-view.tsx` (new)

---

### 9. Notes et historique activités

**Status:** ⏳ À faire  
**Complexité:** Medium (1h)  
**Valeur:** CRM basique, mémoire commerciale

**Tâches:**

- [ ] Nouvelle table `ClientActivity`:
  ```prisma
  model ClientActivity {
    id        String   @id @default(uuid())
    clientId  String
    type      String   // 'CALL', 'EMAIL', 'NOTE', 'STATUS_CHANGE'
    content   String
    createdAt DateTime @default(now())
    userId    String
  }
  ```
- [ ] Timeline dans fiche client détail
- [ ] Quick-add: "Ajouter une note", "Appel passé"

**Fichiers:**

- `prisma/schema.prisma`
- `app/actions/client-activity-actions.ts`
- `features/clients/components/client-activity-timeline.tsx`

---

### 10. Intégration email (envoi devis)

**Status:** ⏳ À faire  
**Complexité:** High (4h+)  
**Valeur:** Workflow complet sans quitter l'app  
**Dépend de:** Intégration tierce (SendGrid/Resend/AWS SES)

**Tâches:**

- [ ] Configurer provider email (Resend recommandé)
- [ ] Template email devis personnalisable
- [ ] Bouton "Envoyer par email" dans détail devis
- [ ] Pièce jointe PDF auto-générée
- [ ] Statut "Envoyé" automatique
- [ ] Log d'emails envoyés dans activité client

**Fichiers:**

- `lib/email.ts` (config)
- `app/actions/send-quote-email.ts`
- `templates/email/quote-send.tsx` (React Email)

---

### 11. Rappels automatiques (Insights)

**Status:** ⏳ À faire  
**Complexité:** High (3h)  
**Valeur:** Proactivité commerciale

**Règles de rappel:**

- Client sans devis depuis 90j → "À relancer"
- Devis envoyé, pas de réponse depuis 14j → "Relancer"
- Client VIP pas de nouveau devis depuis 30j → "Check-in"

**Tâches:**

- [ ] Cron job ou Vercel Cron (1x/jour)
- [ ] Algo détection rappels
- [ ] Badge "🔔 3 rappels" dans navbar
- [ ] Page/liste dédiée des rappels

**Fichiers:**

- `app/api/cron/client-reminders/route.ts`
- `features/reminders/reminder-list.tsx`

---

## 🗓️ Planning suggéré

| Semaine | Features | Focus              |
| ------- | -------- | ------------------ |
| S1      | 1, 2, 3  | UX + Scale         |
| S2      | 4        | Data complète      |
| S3      | 5        | Migration adoption |
| S4      | 6        | Productivité       |
| S5+     | 7-11     | CRM avancé         |

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
