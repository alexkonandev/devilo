# Plan d'Opération : 4 Templates Premium

## Contexte

L'architecture des renderers monolithiques est en place dans `lib/templates/`. Chaque template a son propre fichier renderer qui produit un HTML radicalement différent. Les 2 premiers templates (Minimal Invoice, Modern Obsidian) sont "free". Nous ajoutons 4 templates "premium" liés à l'abonnement PRO.

---

## Phase 0 — Infrastructure de restriction PRO

**Objectif :** Empêcher les utilisateurs FREE d'utiliser les templates premium.

### Tâches

1. **Ajouter `tier` dans `TemplateDefinition`** (`lib/template-system.ts`)
   - Nouveau champ : `tier: "free" | "premium"`
   - Templates existants (Minimal Invoice, Modern Obsidian) → `tier: "free"`
   - Nouveaux templates → `tier: "premium"`

2. **UI Gating** (`components/editor/studio-sidebar-right.tsx`)
   - Si `template.tier === "premium"` ET `user.plan === "FREE"` :
     - Afficher le template en grisé
     - Ajouter un badge "⭐ PREMIUM" sur la ligne
     - Désactiver le clic (ne pas changer `activeTemplateId`)
     - Au clic : rediriger vers `/billing`
   - Sinon : comportement normal

### Fichiers impactés
| Fichier | Action |
|---|---|
| `lib/template-system.ts` | Ajouter `tier` dans l'interface et les définitions |
| `components/editor/studio-sidebar-right.tsx` | Logique de gating UI |
| `lib/templates/index.ts` | Aucun changement (le dispatcher ne fait que router) |

---

## Phase 1 — Template "Executive Gold"

**Cible :** Cabinets de conseil, avocats, notaires, experts-comptables
**Ambiance :** Standing haut de gamme, fiable, classieux — le template "costard-cravate" qui inspire confiance dès le premier regard

### Palette de couleurs
| Rôle | Hex | Usage |
|---|---|---|
| Primary / doré | `#b8860b` | Bande header, bordures d'accent, badge DEVIS, en-tête tableau, filet décoratif |
| Background | `#ffffff` | Fond de page |
| Surface crème | `#fcf9f2` | Cartes client et total |
| Texte principal | `#1a1406` | Corps du texte |
| Texte secondaire | `#8b7d6b` | Labels, dates, muted |
| Bordure claire | `#e8dcc8` | Filets, bordures de cartes |
| Stripe tableau | `#fdfbf7` | Lignes alternées du tableau |

### Décisions de design

**Header :**
- Une fine bande dorée (#b8860b) traverse le haut de la page sur toute la largeur — c'est la signature visuelle immédiate du template
- Le nom de l'entreprise est en haut à gauche en typo grasse
- Le mot "DEVIS" est affiché dans un badge doré plein avec texte blanc, à droite
- Juste en dessous, le numéro de devis en typo monospace

**Séparation header → contenu :**
- Un filet décoratif en dégradé beige → doré → beige, pour un effet de raffinement

**Carte client :**
- Fond crème (#fcf9f2), bordure beige (#e8dcc8), coins arrondis 8px
- Ombre portée subtilement teintée de doré — le petit détail qui fait la différence
- Infos client à gauche, dates à droite, séparées par une ligne verticale beige

**Séparateur avant le tableau :**
- Un élément décoratif avec un trait horizontal de chaque côté et le mot "PRESTATIONS" au centre en doré

**Tableau :**
- En-tête avec fond doré solide et texte blanc (pas de dégradé pour rester imprimable)
- Lignes du corps alternant blanc pur et crème très pâle (#fdfbf7) pour la lisibilité
- Bordures horizontales fines beige entre chaque ligne

**Carte total :**
- Fond crème, bordure dorée solide, coins arrondis
- Montant total en doré foncé et en grand (26px), aligné à droite
- Double ligne au-dessus du "Net à payer"

**Footer :**
- Double filet (doré épais + beige fin) avant les mentions légales
- Espace réservé "Cachet et signature" avec ligne pointillée — pour les impressions papier signées manuellement

**Éléments signatures :**
- Ombres portées teintées doré (box-shadow avec rgba(184,134,11,0.06))
- Dégradé sur les filets de séparation (linear-gradient)

---

## Phase 2 — Template "Nordic Clean"

**Cible :** Designers, architectes, photographes, agences créatives
**Ambiance :** Léger, aéré, minimaliste — le template qui respire la qualité scandinave

### Palette de couleurs
| Rôle | Hex | Usage |
|---|---|---|
| Primary vert sauge | `#84a98c` | Accents, titres, total |
| Secondary sauge foncé | `#6b9080` | Hover, variations |
| Background | `#ffffff` | Fond de page |
| Surface gris pâle | `#f8f9fa` | Mini-cartes des lignes |
| Texte principal | `#2b2d42` | Corps du texte |
| Texte secondaire | `#8d99ae` | Labels, muted |
| Bordure | `#e9ecef` | Filets, séparateurs |

### Décisions de design

**Header :**
- Centré horizontalement — contrairement à tous les autres templates qui alignent à gauche
- Un petit marqueur géométrique : un cercle SVG (creux avec un cercle plein à l'intérieur) — très subtil, presque invisible mais qui ancre la marque
- Le nom de l'entreprise est en font-weight 300 (light), seul template à utiliser une typo fine
- Une fine ligne verte (#84a98c) de 60px centrée sous le nom — signature visuelle zen
- Pas de badge "DEVIS" agressif : la référence et le mot "DEVIS" en texte discret gris et vert

**Bloc client :**
- Pas de carte : les infos client sont posées directement sur le fond blanc
- Séparées par un simple filet gris (#e9ecef)
- Infos client à gauche, dates à droite

**Tableau :**
- Totalement repensé : ce ne sont pas des lignes dans un tableau mais des mini-cartes individuelles
- Chaque prestation est une carte séparée : fond gris pâle (#f8f9fa), coins arrondis 8px, ombre portée ultra-légère (2px blur)
- Les mini-cartes sont espacées de 8px les unes des autres → effet "post-it posé sur la page"
- Les en-têtes sont écrits en vert sauge (#84a98c), pas de fond coloré
- "DÉSIGNATION" en flex: 2, les autres colonnes en largeurs fixes

**Carte total :**
- Blanche, flottante à droite, ombre portée plus marquée (4px blur)
- C'est le seul élément qui "sort" visuellement de la page
- Montant total en vert sauge, font-weight 300 (light)
- Fine bordure en haut avant le "Net à payer"

**Footer :**
- Minimal : juste une ligne de séparation, les conditions, et les coordonnées en gris tout en bas
- Texte centré

**Ambiance générale :**
- Beaucoup d'espace blanc — padding généreux
- Tout est léger : font-weight 300/400, pas de gras
- Les ombres sont à peine perceptibles

---

## Phase 3 — Template "Dark Premium"

**Cible :** Agences digitales, startups SaaS, marques tech
**Ambiance :** Sombre, sophistiqué, puissant — le premier template dark mode pour devis

### Palette de couleurs
| Rôle | Hex | Usage |
|---|---|---|
| Fond page | `#1a1a2e` | Bleu nuit très foncé — toute la page |
| Surface | `#16213e` | Cartes, en-tête tableau |
| Texte principal | `#e8e8e8` | Blanc cassé |
| Texte secondaire | `#8a8aa0` | Labels, muted |
| Accent corail | `#e94560` | Ligne header, accents, total |
| Bordure subtile | `#1e2a4a` | Bordures de cartes |

### Décisions de design

**Header :**
- Fond sombre (#1a1a2e) sur toute la largeur
- Titre en blanc, numéro de devis en gris (#8a8aa0)
- Une fine ligne horizontale corail (#e94560) en bas du header — le contraste est saisissant
- Pas de badge DEVIS : juste le titre et le numéro

**Bloc client :**
- Carte sur fond légèrement plus clair (#16213e) que la page
- Bordure corail très subtile (opacité réduite)
- Infos client en blanc cassé, labels en gris

**Séparation :**
- Filet fin #1e2a4a entre chaque section — presque invisible, pour garder la fluidité

**Tableau :**
- En-tête sur fond #16213e, texte blanc cassé
- Lignes du corps alternant #1a1a2e et #16213e → effet de profondeur
- Les montants en blanc, les descriptions en blanc cassé
- Bordures horizontales très fines

**Carte total :**
- Fond #16213e, bordure corail subtile
- Montant total en corail vif (#e94560) et en très gros (26px)
- Léger effet de glow sur le total (box-shadow corail)
- "Total TTC" en blanc devant le montant corail → contraste fort

**Footer :**
- Fond #1a1a2e, texte gris #8a8aa0
- Ligne fine corail en haut du footer
- Mentions légales en gris discret

**Attention technique :**
- Dépend de `print-color-adjust: exact` (déjà présent dans l'infrastructure) pour que l'impression respecte les fonds sombres
- À tester impérativement sur imprimante réelle
- Le contraste doit être validé pour la lisibilité

**Éléments signatures :**
- C'est le seul template avec un fond autre que blanc
- L'effet de profondeur vient de l'alternance de deux nuances de bleu nuit

---

## Phase 4 — Template "Vintage Elegance"

**Cible :** Hôtellerie, restauration, traiteurs, métiers d'art, artisans de luxe
**Ambiance :** Classique européen, intemporel, artisanal — le template "vitrine" qui justifie l'abonnement PRO

### Palette de couleurs
| Rôle | Hex | Usage |
|---|---|---|
| Primary brun | `#8b4513` | Filets, bordures, accents |
| Accent doré clair | `#d4a574` | Second filet décoratif |
| Background | `#ffffff` | Fond de page |
| Surface ivoire | `#faf3e0` | Cartes, fonds alternés |
| Texte principal | `#2c1810` | Brun très foncé |
| Texte secondaire | `#8b7355` | Labels, muted |
| Bordure | `#d4c5a0` | Bordures fines |

### Police spécifique
- **Playfair Display** (Google Fonts) pour les titres et le nom de l'entreprise → typo serif qui évoque le luxe à l'ancienne
- Inter pour les données (monospace pour les montants)

### Décisions de design

**Header :**
- Double filet décoratif en haut de page : un trait brun (#8b4513) fin + un trait doré clair (#d4a574) plus fin
- Style lettre d'un grand hôtel parisien ou d'un papier à en-tête d'expert-comptable ancien
- Nom de l'entreprise en Playfair Display — seul template avec une police serif
- Numéro de devis présenté dans un petit badge avec bordure décorative

**Bloc client :**
- Fond ivoire (#faf3e0)
- Motif filigrane subtil en fond (un repeating radial-gradient ultra-léger qui ressemble à du papier de riz)
- Bordure brune fine (#8b4513)
- Typo Playfair Display sur le nom du client

**Séparation :**
- Filet double (brun + doré clair) entre les sections
- Petits losanges décoratifs (◆) aux extrémités des filets

**Tableau :**
- Titres de colonnes en Playfair Display
- Lignes séparées par des filets complets (pas de bordure verticale)
- Alternance blanc / ivoire (#faf3e0)
- Les prix en monospace

**Carte total :**
- Encadrée par un double filet (brun fin + doré clair plus fin) comme une gravure
- Montant total orné d'une ligne décorative au-dessus
- Typo Playfair Display sur "Total TTC"

**Footer :**
- Bloc structuré avec séparateurs ornementaux (petits losanges ◆ entre chaque section)
- Police Playfair Display pour les titres
- Mentions légales complètes en typo fine

**Éléments signatures :**
- Filigrane en fond via CSS repeating pattern
- Double filet d'encadrement sur la carte total
- Ornements typographiques (◆)
- Google Fonts Playfair Display à charger dans le renderer

**Ambiance générale :**
- Donne l'impression d'un document imprimé sur du papier épais avec un filigrane
- Le template le plus complexe visuellement, celui qu'on mettra en avant

---

## Phase 5 — Finalisation et tests

### Tâches

1. **Marquage des tiers** : s'assurer que les 6 templates ont bien leur `tier` (2 free, 4 premium)
2. **Test du gating** :
   - Utilisateur FREE : les templates premium sont grisés avec badge ⭐ PREMIUM
   - Clic sur un template premium → redirection vers `/billing`
   - Utilisateur PRO : tous les templates sont accessibles normalement
3. **Test des renderers** :
   - Vérifier le rendu A4 dans `QuoteVisualizer` pour les 4 nouveaux templates
   - Vérifier que le changement de template dans la sidebar mise à jour le rendu en temps réel
4. **Test impression** :
   - Tester `window.print()` sur chaque template
   - Vérifier le rendu PDF via l'API print
   - Attention particulière pour Dark Premium (fonds sombres)
5. **Test polices** : Vérifier que Playfair Display se charge bien pour Vintage Elegance

### Fichiers finaux

| Fichier | Statut |
|---|---|
| `lib/template-system.ts` | Modifié — ajout `tier` + 4 nouvelles définitions |
| `lib/templates/index.ts` | Modifié — 4 nouveaux `case` dans le switch |
| `lib/templates/executive-gold.ts` | Créé |
| `lib/templates/nordic-clean.ts` | Créé |
| `lib/templates/dark-premium.ts` | Créé |
| `lib/templates/vintage-elegance.ts` | Créé |
| `components/editor/studio-sidebar-right.tsx` | Modifié — gating PRO |

---

## Ordre d'exécution

| Ordre | Phase | Durée estimée |
|---|---|---|
| 1 | Phase 0 — Gating PRO | 15 min |
| 2 | Phase 1 — Executive Gold | 30 min |
| 3 | Phase 2 — Nordic Clean | 30 min |
| 4 | Phase 3 — Dark Premium | 30 min |
| 5 | Phase 4 — Vintage Elegance | 40 min (import Google Fonts) |
| 6 | Phase 5 — Tests | 20 min |