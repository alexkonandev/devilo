# ⚙️ Server Actions — Factouro

## 1. Contexte

Toutes les mutations côté serveur sont des **Next.js Server Actions** (directive `"use server"`) situées dans le dossier `actions/`. Chaque action commence par une vérification d'authentification via `getClerkUserId()` (voir `docs/AUTHENTIFICATION.md`).

**Pattern de retour :**

```typescript
type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
```

---

## 2. Récapitulatif des fichiers d'actions

| Fichier | Domaine |
|---------|---------|
| `billing-action.ts` | Abonnement Stripe, profil de facturation |
| `client-action.ts` | CRUD clients (paginated, search) |
| `client-activity-action.ts` | Timeline d'activités clients |
| `client-editor-action.ts` | Clients pour l'éditeur |
| `client-export-action.ts` | Export CSV clients |
| `client-import-action.ts` | Import CSV clients |
| `contact-action.ts` | Formulaire de contact (landing) |
| `dashboard-actions.ts` | Données du dashboard avancé |
| `design-action.ts` | Thèmes de rendu |
| `logo-action.ts` | Upload du logo société |
| `quote-editor-action.ts` | Création / édition des devis |
| `quote-event-action.ts` | Événements & timeline des devis |
| `quote-registry-action.ts` | Registre des devis (liste, statut, suppression) |
| `reminder-action.ts` | Rappels / relances |
| `security-action.ts` | Sécurité, sessions, mot de passe |
| `send-quote-email.ts` | Envoi d'un devis par email + PDF |
| `settings-action.ts` | Paramètres utilisateur |
| `suggestion-action.ts` | Suggestions de services |
| `user-action.ts` | Profil utilisateur, paramètres société |

---

## 3. Détail par fichier

### 3.1 `billing-action.ts` — Facturation Stripe

| Fonction | Paramètres | Retour | Description |
|----------|-----------|--------|-------------|
| `getBillingProfile()` | — | `BillingProfile \| null` | Profil de facturation : plan, quotas, abonnement, factures, stats mensuelles, prochain paiement. Auto-crée l'utilisateur si absent. |
| `createCheckoutSession()` | — | `{ success; url?; error? }` | Crée la session de checkout Stripe pour le plan PRO. |
| `createPortalSession()` | — | `{ success; url?; error? }` | Crée la session du portail client Stripe (gestion abonnement). |
| `activateProFromSession(sessionId)` | `sessionId` | `ActionResponse` | Active le plan PRO après confirmation du checkout. |
| `syncSubscription(...)` | données | — | Synchronise l'abonnement avec Stripe (webhook). |

**Interfaces exportées :** `BillingProfile`, `BillingInvoice`, `MonthlyStats`, `NextPayment`.

---

### 3.2 `client-action.ts` — Clients

| Fonction | Paramètres | Retour | Description |
|----------|-----------|--------|-------------|
| `getClientsPaginated(...)` | params | liste paginée | Liste paginée des clients avec recherche. |
| `getClients()` | — | `ClientListItem[]` | Liste simple des clients (sélecteurs). |
| `upsertClient(data)` | `Record<string, unknown>` | `ActionResponse` | Crée ou met à jour un client. |
| `getClientById(clientId)` | `clientId` | client | Détail d'un client (avec devis). |
| `deleteClient(clientId)` | `clientId` | `ActionResponse` | Supprime un client. |
| `deleteManyClients(clientIds)` | `clientIds: string[]` | `ActionResponse` | Suppression groupée. |

---

### 3.3 `client-activity-action.ts` — Activités clients

| Fonction | Paramètres | Retour | Description |
|----------|-----------|--------|-------------|
| `getClientActivitiesAction(...)` | filtres | `ClientActivityItem[]` | Timeline d'activités d'un client. |
| `addClientNoteAction(clientId, content)` | `clientId`, `content` | `ActionResponse` | Ajoute une note à un client. |

**Type exporté :** `ClientActivityType = "CALL" \| "EMAIL" \| "NOTE" \| "STATUS_CHANGE"`.

---

### 3.4 `client-editor-action.ts` — Clients pour l'éditeur

| Fonction | Paramètres | Retour | Description |
|----------|-----------|--------|-------------|
| `getEditorClientsAction()` | — | `EditorClient[]` | Liste des clients pour le sélecteur de l'éditeur. |

---

### 3.5 `client-export-action.ts` — Export CSV

| Fonction | Paramètres | Retour | Description |
|----------|-----------|--------|-------------|
| `exportClientsAction()` | — | CSV | Exporte tous les clients au format CSV. |

**Interface exportée :** `ClientExportRow`.

---

### 3.6 `client-import-action.ts` — Import CSV

| Fonction | Paramètres | Retour | Description |
|----------|-----------|--------|-------------|
| `importClientsAction(data)` | `ClientImportRow[]` | `ActionResponse` | Importe des clients depuis un CSV (avec détection doublons). |

**Interface exportée :** `ClientImportRow`.

---

### 3.7 `contact-action.ts` — Contact

| Fonction | Paramètres | Retour | Description |
|----------|-----------|--------|-------------|
| `sendContactAction(data)` | `ContactInput` | `ActionResponse` | Envoie le message du formulaire de contact (landing). |

---

### 3.8 `dashboard-actions.ts` — Dashboard

| Fonction | Paramètres | Retour | Description |
|----------|-----------|--------|-------------|
| `getAdvancedDashboardData()` | — | `AdvancedDashboardData \| null` | KPIs, top clients, activité récente, suggestions. |

---

### 3.9 `design-action.ts` — Thèmes

| Fonction | Paramètres | Retour | Description |
|----------|-----------|--------|-------------|
| `getAvailableThemes()` | — | thèmes | Liste des thèmes de rendu disponibles. |
| `createSystemTheme(data)` | `CreateThemeInput` | `ActionResponse` | Crée un thème système. |

---

### 3.10 `logo-action.ts` — Logo

| Fonction | Paramètres | Retour | Description |
|----------|-----------|--------|-------------|
| `updateCompanyLogo(url)` | `url` | `ActionResponse` | Met à jour l'URL du logo de la société. |

---

### 3.11 `quote-editor-action.ts` — Éditeur de devis

| Fonction | Paramètres | Retour | Description |
|----------|-----------|--------|-------------|
| `upsertQuoteAction(...)` | données devis | `ActionResponse` | Crée ou sauvegarde un devis (brouillon). |
| `listDraftQuotesAction(limit, clientName?)` | `limit = 20`, `clientName?` | liste | Liste des derniers brouillons. |
| `getQuoteByIdAction(id)` | `id` | devis | Détail d'un devis (avec lignes). |
| `updateQuoteInlineAction(...)` | données | `ActionResponse` | Mise à jour en ligne d'un champ de devis. |

---

### 3.12 `quote-event-action.ts` — Événements de devis

| Fonction | Paramètres | Retour | Description |
|----------|-----------|--------|-------------|
| `logQuoteEventAction(...)` | données | `ActionResponse` | Journalise un événement sur un devis. |
| `logQuoteStatusChangeAction(...)` | ancien/nouveau statut | `ActionResponse` | Journalise un changement de statut. |
| `getQuoteEventsAction(...)` | `quoteId` | `QuoteEvent[]` | Retourne la timeline des événements. |
| `deleteQuoteEventAction(...)` | `eventId` | `ActionResponse` | Supprime un événement. |
| `addQuoteNoteAction(...)` | `quoteId`, note | `ActionResponse` | Ajoute une note. |
| `updateQuoteNoteAction(...)` | `eventId`, note | `ActionResponse` | Met à jour une note. |

---

### 3.13 `quote-registry-action.ts` — Registre des devis

| Fonction | Paramètres | Retour | Description |
|----------|-----------|--------|-------------|
| `getQuotesAction()` | — | liste avec filtres | Liste des devis (filtres, recherche, pagination). |
| `updateQuoteStatusAction(...)` | `id`, statut | `ActionResponse` | Change le statut d'un devis. |
| `deleteQuotesAction(ids)` | `ids: string[]` | `ActionResponse` | Suppression groupée. |
| `deleteQuoteAction(id)` | `id` | `ActionResponse` | Supprime un devis. |
| `getRecentQuotesAction(limit)` | `limit = 6` | `RecentQuoteItem[]` | Devis récents. |
| `getQuoteTimelineAction(...)` | `quoteId` | timeline | Timeline complète d'un devis. |

**Interface exportée :** `RecentQuoteItem`.

---

### 3.14 `reminder-action.ts` — Rappels

| Fonction | Paramètres | Retour | Description |
|----------|-----------|--------|-------------|
| `getRemindersAction()` | — | `GetRemindersResponse` | Liste des rappels / relances à faire. |

**Types exportés :** `ReminderType`, `ReminderItem`, `GetRemindersResponse`.

---

### 3.15 `security-action.ts` — Sécurité

| Fonction | Paramètres | Retour | Description |
|----------|-----------|--------|-------------|
| `getSecurityProfile()` | — | `SecurityProfile` | Profil de sécurité (sessions actives). |
| `revokeSession(sessionId)` | `sessionId` | `ActionResponse` | Révoque une session. |
| `setInitialPassword(newPassword)` | `newPassword` | `ActionResponse` | Définit un mot de passe initial. |
| `updatePassword(current, new)` | 2 mots de passe | `ActionResponse` | Change le mot de passe (vérif. préalable). |
| `deleteAccountSecure(confirmEmail)` | `confirmEmail` | `ActionResponse` | Supprime le compte (confirmation email). |

---

### 3.16 `send-quote-email.ts` — Envoi par email

| Fonction | Paramètres | Retour | Description |
|----------|-----------|--------|-------------|
| `sendQuoteEmailAction(...)` | `SendQuoteEmailParams` | `ActionResponse` | Envoie le devis par email avec PDF en pièce jointe. Passe le statut en `SENT` et journalise l'activité. |

**Interface exportée :** `SendQuoteEmailParams`.

---

### 3.17 `settings-action.ts` — Paramètres

| Fonction | Paramètres | Retour | Description |
|----------|-----------|--------|-------------|
| `updateSettings(rawData)` | `unknown` | `ActionResponse` | Met à jour les paramètres (validés par Zod). |
| `deleteAccount()` | — | `ActionResponse` | Supprime le compte. |

---

### 3.18 `suggestion-action.ts` — Suggestions

| Fonction | Paramètres | Retour | Description |
|----------|-----------|--------|-------------|
| `getSuggestionsAction()` | — | suggestions | Retourne des suggestions de services pour compléter un devis. |

---

### 3.19 `user-action.ts` — Utilisateur

| Fonction | Paramètres | Retour | Description |
|----------|-----------|--------|-------------|
| `getUserProfile()` | — | profil | Profil de l'utilisateur. |
| `updateCompanySettings(data)` | données société | `ActionResponse` | Met à jour les paramètres de la société. |

---

## 4. Logique commune

Toutes les actions suivent le même schéma :

```typescript
"use server";

import { getClerkUserId } from "@/lib/auth";

export async function monAction() {
  const userId = await getClerkUserId();
  if (!userId) return { success: false, error: "Non authentifié" };

  try {
    // Logique métier
    return { success: true, data };
  } catch (e) {
    return { success: false, error: "Erreur interne" };
  }
}