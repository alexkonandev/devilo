# Plan de corrections UI - Page Clients

## 1. Bouton Supprimer dans la vue détaillée
- **Fichier :** `client-profile-view.tsx`
- Ajouter une prop `onDelete?: (client: ClientListItem) => void`
- Ajouter un bouton **Supprimer** (icône `TrashSimple`, fond rouge `bg-rose-50 text-rose-700`) à côté de Modifier et Devis
- Appeler `onDelete(client)` au clic, ce qui ouvrira le `DeleteClientDialog` existant
- **Fichier :** `spatial-clients-view.tsx`
- Passer `handleDeleteClient` à `ClientProfileView` via la prop `onDelete`

## 2. Correction des couleurs (teal → indigo)
- **Fichier :** `view-toggle.tsx`
- Remplacer `teal` par `indigo` :
  - `bg-teal-100` → `bg-indigo-100`
  - `dark:bg-teal-900` → `dark:bg-indigo-900`
  - `text-teal-700` → `text-indigo-700`
  - `dark:text-teal-300` → `dark:text-indigo-300`
- **Fichier :** `directory-grid.tsx` (mode liste)
- Remplacer `teal-50` → `indigo-50`, `teal-200` → `indigo-200`, `teal-700` → `indigo-700`

## 3. Adresse dans la vue liste
- **Fichier :** `directory-grid.tsx`
- Ajouter l'affichage de `client.address` dans la partie liste compacte entre l'email et les métadonnées
- Style : `text-[10px] text-stone-400 hidden sm:inline truncate` (similaire à l'email)