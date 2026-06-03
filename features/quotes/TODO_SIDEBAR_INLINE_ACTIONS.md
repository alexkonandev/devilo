# TODO — Amélioration des actions inline dans la sidebar devis

## Résumé des 3 points de friction

1. **Édition inline** — Les champs de la sidebar deviennent éditables sans navigation
2. **Envoi email** — Interface de composition d'email directement depuis la sidebar
3. **Suppression** — Confirmation puis suppression avec feedback utilisateur

---

## ~~1. ÉDITION INLINE (remplacer le lien "Éditer")~~ ✅

### 1.1 Créer le store/état d'édition
- [x] Ajouter un état `isEditing` dans `SingleMode`
- [x] Ajouter un état `editData` pour stocker les modifications locales (champs modifiables du devis)
- [x] Gérer le reset des modifications si l'utilisateur annule

### 1.2 Définir les champs édirables
- [x] Déterminer les champs du devis qui doivent être éditables inline (ex: `number`, `issueDate`, `vatRatePercent`, `client.name`, etc.)
- [x] Déterminer si les lignes du devis doivent aussi être éditables (édition des quantités, prix unitaires, titres)
- [x] Définir le périmètre : édition simple vs édition avancée

### 1.3 Mode "édition" vs "lecture"
- [x] Basculer les `InfoRow` en `input`/`select` quand `isEditing === true`
- [x] Afficher les boutons "Sauvegarder" / "Annuler" en bas de la sidebar
- [x] Transformer les boutons d'action (Éditer → devient "Sauvegarder" / "Annuler")
- [x] Ajouter `useTransition` ou état `isSaving` pour le spinner pendant la sauvegarde

### 1.4 Créer la server action de mise à jour
- [x] Vérifier que `quote-editor-action.ts` a une fonction `updateQuoteAction` ou en créer une
- [x] Valider les champs modifiés côté serveur
- [x] Gérer les erreurs de validation dans l'UI
- [x] Revalider le path après succès

### 1.5 Gestion des cas complexes
- [x] Si l'utilisateur change de devis sélectionné pendant l'édition → annuler les modifications ou demander confirmation
- [x] Gérer le mode multi-sélection (désactiver l'édition en mode batch)
- [x] Persister l'état d'édition lors du scroll (ne pas perdre les modifications)

---

## ~~2. FORMULAIRE D'ENVOI EMAIL~~ ✅

### 2.1 Créer le composant du formulaire
- [x] Créer `EmailSendForm` dans `components/` ou dans un sous-dossier de la sidebar
- [x] Champs du formulaire :
  - [x] Destinataire (email du client, pré-rempli)
  - [x] Objet (pré-rempli avec le numéro de devis)
  - [x] Message (textarea pour le corps du message)
  - [x] Bouton "Envoyer" + "Annuler"
- [x] Ajouter un état `showEmailForm` dans `SingleMode`

### 2.2 Mode d'affichage : popup modal vs inline
- [x] Choisir le mode d'affichage (popup modal recommandé pour ne pas casser la sidebar)
- [x] Si modal : créer ou réutiliser un composant `Dialog` de shadcn/ui
- [x] Si inline : remplacer le contenu scrollable de la sidebar par le formulaire (décision : modal)
- [x] Animer l'apparition/disparition (via le composant Dialog shadcn)

### 2.3 Logique d'envoi
- [x] Connecter le formulaire à `sendQuoteEmailAction` existante
- [x] Ajouter un paramètre `message` optionnel dans l'appel
- [x] Gérer les états : `isSending`, `success`, `error`
- [x] Notification de succès/échec (toast)

### 2.4 Feedback utilisateur
- [x] Afficher un toast de succès après envoi
- [x] Afficher les erreurs (email invalide, échec serveur)
- [x] Fermer le formulaire après succès
- [x] Mettre à jour le statut du devis (DRAFT → SENT) si applicable (déjà géré par l'action existante)

---

## 3. SUPPRESSION AVEC CONFIRMATION

### 3.1 État actuel
- [ ] Vérifier que le double-clic "Supprimer" → "Confirmer" / "Annuler" fonctionne correctement
- [ ] Vérifier que `deleteQuoteAction` supprime bien en DB

### 3.2 Améliorations de l'UX
- [ ] Ajouter un texte d'avertissement au niveau du bouton "Confirmer" (ex: "Cette action est irréversible")
- [ ] Afficher un toast de confirmation après suppression
- [ ] Ajouter un état `isDeleting` avec spinner déjà présent
- [ ] Gérer l'erreur de suppression (toast d'erreur)

### 3.3 Post-suppression
- [ ] Rafraîchir la liste des devis (déjà fait avec `router.refresh()`)
- [ ] Réinitialiser la sélection dans le context (déselectionner le devis supprimé)
- [ ] Si le devis supprimé était sélectionné → revenir à l'état "empty" de la sidebar

---

## 4. TESTS ET VALIDATION

### 4.1 Tests unitaires
- [ ] Tester le basculement mode édition/lecture
- [ ] Tester l'envoi d'email avec message optionnel
- [ ] Tester la suppression avec confirmation

### 4.2 Tests d'intégration
- [ ] Vérifier que la sidebar scroll bien après édition
- [ ] Vérifier que le changement de devis pendant édition est géré
- [ ] Vérifier que le formulaire email se ferme proprement
- [ ] Vérifier la suppression en batch

---

## Architecture & fichiers concernés

```
my-app/features/quotes/components/
├── quote-detail-sidebar.tsx    ← Modifications principales
├── email-send-form.tsx         ← Nouveau composant (si modal)
├── quote-context.tsx           ← Peut nécessiter des ajouts d'actions
│
my-app/actions/
├── send-quote-email.ts         ← Déjà existant
├── quote-registry-action.ts    ← deleteQuoteAction existante
├── quote-editor-action.ts      ← updateQuoteAction à créer/vérifier
```

---

## Ordre de priorité recommandé

1. **Phase 1** — Suppression améliorée (la plus simple, déjà partiellement faite)
2. **Phase 2** — Édition inline (la plus complexe, nécessite le plus de réflexion)
3. **Phase 3** — Formulaire d'envoi email (indépendant, peut être fait entre les deux)