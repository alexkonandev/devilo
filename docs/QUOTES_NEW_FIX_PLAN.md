# Plan de Correction : Connectivité Onboarding → Éditeur & Sélection Client/Devis

## Architecture du problème

**Problème racine :** Le store Zustand (`useKernelStore`) persiste `activeQuote` dans `localStorage`. 
Quand l'utilisateur revient sur `/quotes/new` après l'onboarding :
1. `localStorage` restore un `activeQuote` existant (même vide)
2. Le `useEffect` dans `CreateQuoteClient` vérifie `if (!activeQuote)` → faux car restauré
3. Les nouvelles infos du user (companyName, email, etc.) ne sont jamais injectées
4. Le document A4 affiche donc des champs vides

---

## Étape 1 : Correction du flux onboarding → éditeur + affichage A4

### 1.1 Forcer la réinitialisation du quote quand les données utilisateur changent

**Fichier :** `my-app/components/editor/CreateQuoteClient.tsx`

Dans le `useEffect` d'initialisation (ligne 90-146), ajouter une détection de changement :
- Comparer `user.companyName` avec `activeQuote.company.name`
- Si différent → considérer que les données ont changé et forcer `setActiveQuote(null)` puis recréer le defaultQuote
- Conserver le numéro de devis existant si présent

### 1.2 Corriger le mapping des champs entre onboarding et éditeur

**Fichier :** `my-app/components/editor/CreateQuoteClient.tsx`

Dans la création du `defaultQuote` (ligne 101-129) :
- Remplacer `user.companyCity || ""` (qui est la ville) par `user.companyAddressDetails || ""` (qui est l'adresse)
- Vérifier que tous les champs du formulaire onboarding correspondent bien aux champs Prisma

### 1.3 Vider le localStorage obsolète au montage

**Fichier :** `my-app/components/editor/CreateQuoteClient.tsx`

Au montage du composant, si `_hasHydrated` est vrai mais que les données sont incohérentes :
- Vérifier si `activeQuote.company.name` est vide OU si `user.companyName` est différent
- Si oui → vider l'activeQuote et le recréer avec les bonnes données
- Ajouter un mécanisme de versioning pour invalider les caches localStorage obsolètes

### 1.4 Ajouter un champ `lastUpdated` pour le versioning

**Fichier :** `my-app/hooks/use-kernel-store.ts`

- Ajouter un champ `lastUserSync` dans le store
- Y stocker un timestamp ou un hash des données utilisateur
- Permettre au `useEffect` de CreateQuoteClient de détecter les changements

---

## Étape 2 : Système de sélection de client sans recherche obligatoire

### 2.1 Ajouter un onglet "Répertoire" dans la sidebar gauche

**Fichier :** `my-app/components/editor/studio-sidebar-left.tsx`

Dans le tab "Client" (ligne 499-721), ajouter un sous-onglet "Répertoire" :
- Afficher la liste complète des `initialClients` sous forme de grille/liste
- Chaque client est cliquable → met à jour `activeQuote.client`
- Barre latérale alphabétique (comme dans `alpha-nav.tsx`)
- Possibilité de filtrer par première lettre

### 2.2 Section "Clients récents"

**Fichier :** `my-app/components/editor/studio-sidebar-left.tsx`

- Au-dessus du répertoire, afficher une section "Récents" (3-5 derniers clients utilisés)
- Les clients récents sont stockés dans le store ou localStorage

### 2.3 Améliorer la recherche existante

**Fichier :** `my-app/components/editor/studio-sidebar-left.tsx`

- La recherche devient optionnelle (complément du répertoire)
- Afficher les résultats en temps réel pendant la frappe
- Si aucun résultat → proposer "Créer un client" directement

---

## Étape 3 : Sélecteur de devis existant dans l'éditeur

### 3.1 Ajouter un dropdown de sélection de devis dans le header

**Fichier :** `my-app/components/editor/editor-header.tsx`

- Ajouter un sélecteur "Devis actif" dans la barre du haut
- Dropdown listant les brouillons récents de l'utilisateur
- Chaque entrée affiche : numéro de devis, nom du client, statut, date
- Permet de charger un devis existant dans l'éditeur

### 3.2 Ajouter l'action de listing des brouillons

**Fichier :** Nouveau ou `my-app/actions/quote-editor-action.ts`

- `listDraftQuotesAction()` : récupère les N derniers brouillons
- Retourne : id, number, clientName, status, createdAt
- Utilisé par le dropdown du header

### 3.3 Route API pour charger un devis existant

**Fichier :** `my-app/app/(editor)/quotes/[id]/page.tsx` (nouveau)

- Route dynamique pour éditer un devis existant
- Passe l'`existingQuoteId` au `CreateQuoteClient`
- Charge les données du devis depuis la DB et les passe en `initialQuoteData`

### 3.4 Gestion de l'état "plusieurs onglets"

**Fichier :** `my-app/components/editor/CreateQuoteClient.tsx`

- Quand l'utilisateur switch de devis : sauvegarder le courant si dirty
- Charger le nouveau devis dans l'éditeur
- Gérer le cas où le devis est verrouillé (statut envoyé)
- Afficher une confirmation si des changements non sauvegardés existent

---

## Schéma de flux utilisateur final

```
Onboarding (infos entreprise)
    ↓  (infos stockées en DB)
Paramètres (settings) ←→ DB (User table)
    ↓
Éditeur /quotes/new
    ├─ Étape 1 : Infos société pré-remplies ✅ (FIX)
    ├─ Étape 2 : Sélection client
    │   ├─ Recherche (existante)
    │   └─ Répertoire (NOUVEAU)
    └─ Étape 3 : Sélection de devis
        ├─ Dropdown de brouillons (NOUVEAU)
        └─ Chargement d'un devis existant (NOUVEAU)
```

## Dépendances entre étapes

- **Étape 1** est un prérequis pour tout le reste (bug bloquant)
- **Étape 2** est indépendante de l'étape 3
- **Étape 3** nécessite que l'étape 1 soit fonctionnelle (les données utilisateur doivent être correctes avant de charger un devis)