# PRD – Suivi de commande (Livraison ByCommute)

**Version** : 1.0  
**Date** : 19 février 2026  
**Référence** : `docs/ANALYSE_ODOO_ET_ARCHITECTURE.md`

---

## 1. Vue d’ensemble

### 1.1 Objectif

Application web de **suivi de commande** permettant à un client de consulter l’avancement de sa commande (devis) en saisissant le numéro de devis. Les données proviennent d’Odoo (backend existant) ; l’app est déployée sur Netlify.

### 1.2 Périmètre

- **In scope** : page sobre « Suivi de commande », recherche par numéro de devis, affichage d’une timeline verticale d’avancement (étapes + garde-fou acompte), sans détail commande (prix, client, etc.) — uniquement la progression.
- **Hors scope V1** : authentification, historique détaillé des changements côté Odoo, back-office, édition des étapes depuis l’app.

### 1.3 Contexte technique

- **Backend** : Odoo (modèle `sale.order`, champ many2many `x_studio_avancee_du_projet` → `x_avancee_du_projet`).
- **Front** : application web statique (React + TypeScript + Vite), déployée sur Netlify.
- **Données** : lecture seule via API Odoo (JSON-RPC / XML-RPC). Pas de BDD dédiée pour la V1.
- **Secrets** :  
  - **Phase 1 (développement / tests)** : clé API Odoo dans un fichier **local** (ex. `.env` ou `.env.local`, non versionné). Tout tourne en local.  
  - **Phase 2 (déploiement)** : migration de la clé API vers les **variables d’environnement Netlify** ; prévoir un guide de migration et l’usage d’une Netlify Function pour appeler Odoo sans exposer la clé dans le front.

---

## 2. Personas et objectifs

### 2.1 Persona principal : Client (acheteur)

- **Profil** : client ayant passé une commande (devis signé) et souhaitant savoir où en est sa livraison.
- **Besoin** : voir simplement les étapes franchies et comprendre si un blocage existe (ex. acompte non payé).
- **Contexte** : accès depuis un lien communiqué par ByCommute (ex. livraison.bycommute.com) ; pas de compte ni de login.

### 2.2 Persona secondaire : ByCommute (interne)

- **Usage** : tests, démonstrations, validation du flux avant mise en production.
- **Besoin** : environnement local fiable (fichier .env) puis déploiement Netlify avec clé API sécurisée.

---

## 3. Parcours utilisateur

### 3.1 Parcours nominal

1. L’utilisateur arrive sur la page **Suivi de commande** (design sobre, titre clair).
2. Il saisit le **numéro de devis** (ex. D3258) dans un champ dédié et déclenche la recherche (bouton ou Entrée).
3. L’app interroge Odoo (via API) avec ce numéro (`name` sur `sale.order`).
4. Si une commande est trouvée :
   - L’app affiche une **timeline verticale** (vers le bas) avec :
     - Les étapes déjà franchies (libellé + date du changement si disponible),
     - Une flèche en pointillé vers la prochaine étape (sans afficher le libellé de la prochaine),
     - En cas de blocage « Acompte non payé » : cette étape affichée comme bloquante avec le message **« Paiement de l’acompte en attente »** sur la barre ; les étapes suivantes sont **masquées** jusqu’à ce que « Acompte payé » soit présent.
5. Si aucune commande n’est trouvée : affichage d’un message explicite (ex. « Aucune commande trouvée pour ce numéro »).
6. Si la commande n’a **aucune étiquette** d’avancement : affichage d’une timeline réduite à **« Commande non confirmée »** (cette vue disparaît une fois la commande confirmée côté Odoo).

### 3.2 Cas particuliers

- **Acompte non payé** : bloquer visuellement la progression, masquer les étapes suivantes, afficher le message de blocage.
- **Acompte payé** : déblocage ; la timeline reprend normalement à partir de l’étape suivante dans l’ordre canonique.
- **Ordre inversé** « Installation programmée » / « Commande prête pour l’enlèvement » : l’app gère les deux ordres possibles (pas de retour en arrière ; afficher les étapes atteintes avec une flèche vers la suivante sans la montrer).
- **Rafraîchissement** : pas de poll automatique ; les données sont chargées **au chargement de la page** (ou au déclenchement de la recherche). L’utilisateur peut re-saisir le numéro et relancer pour voir les mises à jour.

---

## 4. Règles métier détaillées

### 4.1 Étapes d’avancement (ordre canonique)

1. **Commande confirmée** (id 1)  
2. **Commande envoyée aux ateliers** (id 2)  
3. **Installation programmée** (id 3) **ou** **Commande prête pour l’enlèvement** (id 4) — ordre possible inversé  
4. **Entièrement livrée** (id 5)

### 4.2 Garde-fou

- **Acompte non payé** (id 6) : étape bloquante. Tant qu’elle est présente (sans « Acompte payé »), la progression s’arrête visuellement à cette étape, avec le message **« Paiement de l’acompte en attente »** sur la barre ; les étapes suivantes sont **masquées**.
- **Acompte payé** (id 7) : remplace « Acompte non payé » ; une fois présent, la timeline peut à nouveau afficher les étapes suivantes selon l’état many2many.

### 4.3 Commande sans étiquette

- Si `x_studio_avancee_du_projet` est vide (ou absent) : afficher une timeline avec **une seule étape** : **« Commande non confirmée »**. Cette vue disparaît dès qu’au moins une étiquette est présente côté Odoo.

### 4.4 Données Odoo

- **Recherche** : `sale.order` par `name` (= numéro de devis).
- **Champ d’avancement** : `x_studio_avancee_du_projet` (many2many) — liste d’IDs (ou paires `[id, name]` selon l’API) ; l’app déduit l’état affiché à partir de cette liste et de la config des étapes (ordre + garde-fou).
- **Libellés** : récupérés depuis le modèle `x_avancee_du_projet` (champ `x_name`) pour afficher le nom de chaque étape. Pas de date par étape dans Odoo ; le tracking de la date de changement se fait côté client à chaque nouveau statut (pas de BDD dédiée en V1 — pas de date affichée si cela nécessite un nouveau champ ou une BDD).

### 4.5 Timeline

- **Orientation** : verticale, vers le bas.
- **Contenu** : étapes passées avec **libellé** (+ date du changement si disponible côté client sans nouveau champ/BDD).
- **Transition** : flèche en pointillé entre l’étape actuelle et la prochaine, **sans afficher** le libellé de la prochaine étape.
- **Blocage** : « Acompte non payé » affichée comme une étape bloquante classique, avec le message « Paiement de l’acompte en attente » sur la barre.

---

## 5. Spécifications fonctionnelles

### 5.1 Page d’accueil / Suivi de commande

- Titre clair : **Suivi de commande** (design sobre et lisible).
- Zone de recherche : champ « Numéro de devis », bouton de recherche (et soumission au Entrée).
- Zone de résultat : soit la timeline, soit un message (aucune commande trouvée / commande non confirmée).

### 5.2 Recherche

- Saisie du numéro de devis (ex. D3258).
- Appel API Odoo (en phase 1 : depuis le front avec clé en .env local ; en phase 2 : via Netlify Function avec clé dans les variables Netlify).
- Gestion des états : chargement, succès (commande trouvée), erreur (réseau / API), « aucune commande ».

### 5.3 Affichage de la timeline

- Liste ordonnée des étapes déjà atteintes (selon l’ordre canonique + règles d’inversion 3/4).
- Pour chaque étape affichée : libellé (nom de l’étiquette).
- Date du changement : affichée si disponible (sans créer de champ ni BDD) — sinon omise en V1.
- Flèche en pointillé après la dernière étape atteinte (vers la prochaine, sans libellé).
- Cas « Acompte non payé » : affichage de cette étape + message « Paiement de l’acompte en attente » ; étapes suivantes masquées.
- Cas « Commande non confirmée » : une seule étape affichée.

### 5.4 Pas de détail commande

- Pas d’affichage client, prix, lignes de commande — uniquement la progression (timeline).

---

## 6. Spécifications techniques

### 6.1 Stack

- **Front** : React, TypeScript, Vite.
- **Build** : sortie statique (SPA ou HTML statique selon choix), compatible Netlify.
- **État** : minimal (état local + hook type `useOrderByReference`) ; pas de store global requis en V1.
- **API Odoo** : JSON-RPC ou XML-RPC ; client dédié (`api/odoo/`) pour `sale.order` et `x_avancee_du_projet`.

### 6.2 Gestion des secrets et environnements

- **Phase 1 – Développement / tests en local**
  - Clé API Odoo (et si besoin URL, DB, user) dans un **fichier local** (ex. `.env` ou `.env.local`).
  - Fichier **non versionné** (`.gitignore`).
  - Fichier `.env.example` versionné : liste des variables sans valeurs (ex. `ODOO_URL=`, `ODOO_DB=`, `ODOO_API_KEY=`).
  - Tous les tests et développements se font en local avec ce fichier.

- **Phase 2 – Déploiement Netlify**
  - **Migration** : déplacer la clé API (et les autres variables sensibles) vers les **variables d’environnement Netlify** (Netlify UI).
  - **Architecture recommandée** : une **Netlify Function** (ex. `GET /.netlify/functions/order-status?ref=D3258`) qui lit les variables d’env, appelle l’API Odoo, et renvoie le JSON au front. Le front n’a jamais accès à la clé.
  - **Documentation** : prévoir un court guide de migration (checklist : créer les variables sur Netlify, déployer la Function, adapter l’URL d’appel dans le front, retirer la clé du .env local pour la prod).

### 6.3 Config des étapes

- Fichier de config (ex. `config/steps.ts`) : mapping des ids Odoo vers l’ordre d’affichage et marquage des garde-fou (Acompte non payé / Acompte payé).
- Libellés : soit lus depuis l’API (`x_avancee_du_projet`), soit en fallback depuis cette config.

### 6.4 Format many2many

- Le champ `x_studio_avancee_du_projet` est un many2many ; l’API peut renvoyer une liste d’IDs ou une liste de paires `[id, name]`. L’implémentation (domain + timeline) doit gérer le format réel au moment de l’intégration ; la logique métier (ordre, blocage, « prochaine étape ») reste identique.

---

## 7. Critères de succès

- Un client peut retrouver sa commande en saisissant le numéro de devis et voir une timeline claire (étapes + blocage éventuel).
- Le message « Paiement de l’acompte en attente » et le masquage des étapes suivantes sont corrects lorsque « Acompte non payé » est seul (sans « Acompte payé »).
- « Commande non confirmée » s’affiche lorsqu’aucune étiquette n’est présente ; la timeline se met à jour logiquement dès qu’Odoo envoie des étiquettes.
- En local (phase 1), tout fonctionne avec un fichier .env local ; aucun secret n’est commité.
- En phase 2, la migration vers Netlify (variables d’env + Netlify Function) est documentée et reproductible.

---

## 8. Hors scope V1 (évolutions possibles)

- Authentification / compte utilisateur.
- Polling automatique (rafraîchissement périodique).
- Historique des changements d’étapes avec dates (si BDD ou champ Odoo dédié).
- Affichage du détail de la commande (client, montants, lignes).
- Édition des étapes depuis l’app.

---

## 9. Dépendances et risques

- **Dépendances** : disponibilité et stabilité de l’API Odoo ; format exact du many2many (IDs vs [id, name]) à valider à l’intégration.
- **Risques** : changement de structure Odoo (noms de champs, modèle `x_avancee_du_projet`) — limiter en gardant la config étapes (ids + libellés) centralisée et documentée.

---

## 10. Références

- **Analyse et architecture** : `docs/ANALYSE_ODOO_ET_ARCHITECTURE.md`
- **Modèle Odoo** : `sale.order` (`name`, `x_studio_avancee_du_projet`), `x_avancee_du_projet` (`id`, `x_name`).
- **Étiquettes d’avancement** : id 1 Commande confirmée, 2 Commande envoyée aux ateliers, 3 Installation programmée, 4 Commande prête pour l’enlèvement, 5 Entièrement livrée, 6 Acompte non payé, 7 Acompte payé.
