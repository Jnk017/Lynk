# Rapport Visual QA — Sprint 2B

- **Produit :** LYNK Frontend (Expo / React Native)
- **Date d’audit :** 5 juin 2026
- **Périmètre :** routes et composants visuels présents dans `frontend/app` et `frontend/src/components`
- **Nature du contrôle :** revue statique de l’implémentation, inventaire des écrans, contrôle de cohérence visuelle et d’accessibilité, validation TypeScript et export Android
- **Contrainte de cette passe :** documentation uniquement ; aucun écran, composant, token de design-system ou routage n’a été modifié

## 1. Verdict exécutif

**Verdict Sprint 2B : validation conditionnelle — prête pour une démonstration Android contrôlée, non validée pour une recette visuelle finale multi-device.**

La direction premium or/violet est cohérente sur le parcours principal et les primitives récentes. Le bundle Android est généré avec succès et le typage passe. La validation visuelle finale reste toutefois bloquée par l’absence de captures sur simulateurs/appareils, par plusieurs risques de mise en page sur petits écrans ou avec texte agrandi, et par une couverture d’accessibilité inégale sur les écrans historiques.

### Synthèse des gates

| Gate | Statut | Conclusion |
| --- | --- | --- |
| Cohérence de marque | **PASS avec dette** | La palette et les surfaces premium sont largement alignées ; quelques couleurs et styles restent codés en dur. |
| Parcours d’authentification | **PASS conditionnel** | Welcome, Login et Register sont structurés ; Onboarding doit être vérifié sur faible hauteur et texte agrandi. |
| Parcours principal | **PASS conditionnel** | Home, Chat, Profile et Referral sont présents et bundlés ; plusieurs affordances ne sont pas encore reliées à une action. |
| États loading / empty / error | **PASS partiel** | Chat couvre les principaux états ; les routes différées utilisent une coque cohérente. |
| Responsive / petits écrans | **À VALIDER** | Les écrans non scrollables et les dimensions calculées au chargement présentent un risque. |
| Accessibilité | **À CORRIGER** | Les primitives récentes sont annotées, mais la couverture des contrôles historiques est incomplète. |
| Build Android | **PASS** | Export Expo Android réalisé hors ligne avec succès. |
| Build Web | **BLOCKED** | Les dépendances web requises ne sont pas installées. |
| Recette iOS / Android physique | **NON EXÉCUTÉE** | Aucun simulateur ni appareil n’était disponible dans l’environnement d’audit. |

## 2. Méthode et limites

### Contrôles réalisés

1. Inventaire de toutes les routes Expo Router.
2. Revue des structures d’écran : safe areas, scroll, clavier, listes, états et navigation.
3. Revue des styles : palette, gradients, rayons, ombres, typographie, couleurs codées en dur et styles inline.
4. Revue des signaux d’accessibilité : rôles, labels, hints, états et valeurs de progression.
5. Vérification du typage via TypeScript.
6. Vérification de l’intégrité du bundle via un export Expo Android hors ligne.
7. Tentative de diagnostic Expo et d’export Web pour identifier les limites de l’environnement et de la configuration.

### Limites de preuve visuelle

- Aucune capture d’écran n’a été produite : aucun simulateur Android/iOS ni navigateur de recette n’était disponible.
- Les constats « visuels » sont donc issus de la structure React Native et des styles, et non d’une comparaison pixel à pixel.
- Les animations, le clavier réel, les safe areas avec encoche, le rendu des emoji, les polices système et les tailles de texte d’accessibilité doivent être validés sur appareils.
- Les données réelles, erreurs API, images distantes et comportements socket n’ont pas été exercés dans une session authentifiée complète.

## 3. Inventaire des surfaces auditées

### Parcours principal

| Route | Surface | État QA |
| --- | --- | --- |
| `/` | Redirection et loader d’entrée | Conforme structurellement |
| `/auth/welcome` | Hero de marque et choix d’authentification | Conforme, responsive à confirmer |
| `/auth/login` | Connexion | Conforme structurellement |
| `/auth/register` | Création de compte | Conforme structurellement |
| `/auth/onboarding` | Parcours CONNECT / GROW / CREATE | Cohérent, faible hauteur à confirmer |
| `/home` | Découverte / matching principal | Fonctionnel visuellement, dette legacy |
| `/chat` | Liste des conversations | États principaux présents |
| `/chat/[roomId]` | Conversation | États principaux présents, actions secondaires incomplètes |
| `/profile` | Profil et navigation produit | Conforme structurellement |
| `/referral` | Programme Founder / referral | Conforme structurellement |

### Routes en coque de préparation

Les neuf routes suivantes utilisent la même coque premium de préparation :

- `/auth/pi-auth`
- `/match/discovery`
- `/profile/edit`
- `/profile/marriage`
- `/profile/settings`
- `/profile/staking`
- `/profile/verification`
- `/shop/gifts`
- `/shop/subscription`

Cette uniformisation évite les écrans vides ou techniques. Elle est adaptée à une alpha, mais ces surfaces ne doivent pas être présentées comme des fonctionnalités finalisées.

## 4. Points conformes

### Identité visuelle

- Le fond dark luxury, les surfaces violettes et les accents dorés donnent une signature cohérente aux écrans récents.
- Les gradients premium, cartes vitrées, rayons généreux et ombres dorées soutiennent correctement le positionnement haut de gamme.
- Le Welcome et l’Onboarding portent clairement la promesse `CONNECT. GROW. CREATE.`.
- Les coques de fonctionnalités différées conservent une hiérarchie homogène : retour, marque, titre, statut, progression, état informatif et action de sortie.

### Hiérarchie et états

- Login et Register utilisent `KeyboardAvoidingView` et `ScrollView`, ce qui réduit le risque de champs masqués par le clavier.
- Chat List et Chat Room distinguent chargement, erreur, vide et contenu.
- Le parcours d’onboarding expose une progression et un état sélectionné.
- Les boutons premium prennent en charge les états pressé, loading et disabled.
- Les écrans principaux utilisent les safe areas React Native.

### Intégrité technique

- Le contrôle TypeScript ne remonte aucune erreur.
- Le lint du projet, actuellement équivalent au contrôle TypeScript, passe.
- L’export Android hors ligne compile les routes et génère le bundle de production.

## 5. Anomalies et risques

### P1 — À traiter avant recette visuelle finale

#### VQA-2B-01 — Onboarding non scrollable

**Surface :** `/auth/onboarding`
**Risque :** sur appareils à faible hauteur, en paysage ou avec taille de texte augmentée, l’illustration, la carte de choix et les actions peuvent se compresser ou sortir de la zone visible.
**Preuve statique :** la surface est construite dans une `SafeAreaView` sans conteneur scrollable.
**Critère de clôture :** aucun chevauchement ni contenu inaccessible à 320 × 568, en paysage et avec texte à 200 %.

#### VQA-2B-02 — Welcome sensible aux dimensions et à la hauteur disponible

**Surface :** `/auth/welcome`
**Risque :** la composition hero utilise les dimensions de fenêtre calculées au chargement et ne repose pas sur un parcours scrollable. La rotation, le split-screen ou un petit appareil peuvent produire une composition tronquée.
**Critère de clôture :** vérifier portrait/paysage, rotation à chaud, faible hauteur, encoche et barre système.

#### VQA-2B-03 — Couverture d’accessibilité inégale

**Surfaces :** Login, Register, Welcome, Home, Chat, Profile, Referral
**Risque :** plusieurs contrôles historiques utilisent `TouchableOpacity` sans rôle, label, hint ou état explicite. Les primitives premium et l’Onboarding sont mieux couverts, ce qui crée une expérience VoiceOver/TalkBack incohérente.
**Signal d’audit :** 63 occurrences textuelles de `TouchableOpacity` contre 44 occurrences de propriétés `accessibilityRole`, `accessibilityLabel`, `accessibilityHint`, `accessibilityState` ou `accessibilityValue` dans les routes et composants audités. Ces nombres sont des indicateurs de dette, pas un comptage un-à-un des contrôles.
**Critère de clôture :** tous les contrôles interactifs ont un nom accessible, un rôle, un état si nécessaire et une cible minimale de 44 × 44.

#### VQA-2B-04 — Recette visuelle réelle manquante

**Surface :** application complète
**Risque :** le bundle valide la compilation, pas le rendu final. Les polices, emoji, ombres, gradients, clavier, images, safe areas et animations peuvent différer entre plateformes.
**Critère de clôture :** matrice de captures Android et iOS approuvée sur au moins un petit téléphone et un grand téléphone, avec états normal/loading/empty/error.

### P2 — À planifier après les blocants P1

#### VQA-2B-05 — Styles et couleurs résiduels codés en dur

**Surfaces :** principalement Home, Chat, Profile, Referral et Welcome
**Signal d’audit :** 17 occurrences de couleurs hexadécimales directes dans les routes/composants et 31 occurrences de styles inline dans les routes.
**Impact :** risque de divergence avec les tokens, difficulté de maintenance et écarts entre thèmes.
**Critère de clôture :** remplacer les valeurs de marque/état réutilisables par les tokens existants, sans inventer de nouveaux tokens au niveau écran.

#### VQA-2B-06 — Affordances visibles sans action complète

**Exemples :** lien « Forgot password? », menu de conversation, pièce jointe et certaines actions de coque.
**Impact :** un contrôle visuellement actif mais sans résultat donne l’impression d’un défaut.
**Critère de clôture :** relier l’action, la masquer, ou afficher explicitement un état indisponible accessible.

#### VQA-2B-07 — Iconographie dépendante des glyphes système

**Surfaces :** navigation, matching, badges, chat et coques de préparation
**Impact :** les symboles texte et emoji peuvent changer de forme, couleur, alignement et largeur entre Android, iOS et Web.
**Critère de clôture :** valider la matrice de rendu ou utiliser une iconographie vectorielle stable pour les actions critiques.

#### VQA-2B-08 — Neuf routes encore en état de préparation

**Impact :** cohérence visuelle acceptable pour une alpha, mais profondeur fonctionnelle insuffisante pour une démonstration « feature complete ».
**Critère de clôture :** conserver un libellé explicite de disponibilité tant que chaque flux n’a pas ses états réel, loading, empty, error, success et offline.

### P3 — Dette de finition

#### VQA-2B-09 — Mélange de primitives historiques et premium

`NeonButton`, `GlassCard`, styles d’écran et primitives premium coexistent. La compatibilité de palette limite les écarts, mais les comportements pressés, disabled, focus et accessibilité ne sont pas garantis identiques.

#### VQA-2B-10 — Validation Web indisponible

Le script Web existe, mais l’export demande `react-dom@19.2.0` et `react-native-web@~0.21.0`, absents de l’installation actuelle. Ce point ne bloque pas le bundle Android, mais bloque toute recette visuelle Web reproductible.

## 6. Matrice de recette recommandée

### Viewports et plateformes

| Plateforme | Cible minimale | Cible large | États système |
| --- | --- | --- | --- |
| Android | 320 × 568 dp | 412 × 915 dp | navigation 3 boutons et gestes, clavier ouvert, texte 100 % / 200 % |
| iOS | iPhone SE | iPhone Pro Max | encoche/Dynamic Island, clavier ouvert, texte 100 % / 200 % |
| Web, si supporté | 360 × 800 | 1440 × 900 | clavier, zoom 200 %, navigation clavier |

### Captures obligatoires

1. Welcome : état initial, petit écran et paysage.
2. Login/Register : clavier ouvert, erreur de validation et loading.
3. Onboarding : chaque étape, option sélectionnée, texte à 200 %.
4. Home : carte normale, like, pass, super-like, match et absence d’image.
5. Chat List : loading, empty, error et liste remplie.
6. Chat Room : loading, empty, error, message envoyé, typing, socket déconnecté et clavier ouvert.
7. Profile : utilisateur standard, verified, Founder et données manquantes.
8. Referral : Founder/non-Founder, progression 0 %/100 %, partage indisponible et historique vide.
9. Chaque route différée : titre long, retour, progression et état informatif.

### Critères visuels d’acceptation

- Aucun contenu coupé, chevauché ou inaccessible.
- Aucun texte critique tronqué à 200 %.
- Cibles tactiles d’au moins 44 × 44.
- Contraste AA pour texte et contrôles essentiels.
- Focus, pressed, loading, disabled, error et selected visuellement distincts.
- Safe areas respectées en haut et en bas.
- Aucun flash de fond clair pendant navigation ou chargement.
- Rendu stable des gradients, ombres, avatars et images distantes.
- Une action visible produit un résultat ou annonce clairement son indisponibilité.

## 7. Résultats des checks

| Commande | Résultat | Détail |
| --- | --- | --- |
| `npm run typecheck` | **PASS** | `tsc --noEmit` terminé avec le code 0. |
| `npm run lint` | **PASS** | Le script exécute actuellement `npm run typecheck`; code 0. |
| `EXPO_OFFLINE=1 npx --no-install expo export --platform android --output-dir /tmp/lynk-visual-qa-dist` | **PASS** | Bundle Android généré avec succès : 1 604 modules, bundle Hermes d’environ 4,5 MB. |
| `npm run doctor` | **BLOCKED ENV** | `npx` n’a pas pu télécharger `expo-doctor` : réponse npm 403 liée à la politique réseau. |
| `npx --no-install expo export --platform web --output-dir /tmp/lynk-visual-qa-dist` | **BLOCKED ENV** | Première tentative bloquée par le proxy réseau. |
| `EXPO_OFFLINE=1 npx --no-install expo export --platform web --output-dir /tmp/lynk-visual-qa-dist` | **FAIL CONFIG** | Dépendances Web absentes : `react-dom@19.2.0` et `react-native-web@~0.21.0`. |

Un avertissement npm non bloquant apparaît également : la configuration `http-proxy` sera ignorée dans une future version majeure de npm.

## 8. Recommandation de sortie

### Autorisé

- Revue produit et démonstration Android encadrée sur le parcours principal.
- Poursuite de la QA fonctionnelle sur les routes déjà implémentées.
- Utilisation des routes différées à condition de les présenter explicitement comme des coques alpha.

### Non autorisé sans validation complémentaire

- Signature Visual QA finale.
- Présentation comme application entièrement finalisée.
- Validation d’accessibilité WCAG/VoiceOver/TalkBack.
- Validation responsive iOS, paysage ou texte agrandi.
- Validation Web.

### Ordre de correction recommandé

1. Réaliser la matrice de captures sur appareils/simulateurs.
2. Sécuriser Welcome et Onboarding sur faible hauteur, rotation et texte agrandi.
3. Compléter les noms, rôles, états et tailles de cibles accessibles.
4. Clarifier ou désactiver les affordances sans action.
5. Résorber les couleurs/styles codés en dur et harmoniser les primitives.
6. Décider si Web fait partie du périmètre produit ; si oui, installer et valider ses dépendances.

## 9. Conclusion

Le Sprint 2B dispose d’une base visuelle cohérente et techniquement bundlable sur Android. La marque premium est lisible, les écrans clés sont structurés et les états les plus importants du chat sont présents. La livraison doit néanmoins rester **conditionnelle** jusqu’à une recette visuelle réelle multi-device et à la clôture des risques P1 relatifs au responsive, au texte agrandi et à l’accessibilité.
