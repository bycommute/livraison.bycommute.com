# Analyse Odoo & architecture projet – Suivi de commande

## 1. Enquête Odoo (via MCP)

### 1.1 Modèle `sale.order`

| Champ | Type | Libellé / usage |
|-------|------|------------------|
| `name` | char, required | **Order Reference** – numéro de commande / devis (identifiant de recherche côté client) |
| `partner_id` | many2one → res.partner | Customer |
| `state` | selection | Status (draft, sent, sale, done, cancel) |
| `x_studio_avancee_du_projet` | **many2many** → `x_avancee_du_projet` | **Avancée du projet** – étiquettes multiples |
| `create_date` | datetime | Created on |
| `write_date` | datetime | Last Updated on |

- **Recherche commande** : par `name` (numéro de devis).
- **Avancement** : une seule valeur “logique” à un instant T n’existe pas : le champ est **many2many**, donc une liste d’IDs. L’app devra déduire l’état courant (et l’ordre des étapes) à partir de cette liste + règles métier (ordre canonique, garde-fou acompte).

### 1.2 Modèle `x_avancee_du_projet`

| Champ | Type | Libellé |
|-------|------|--------|
| `id` | integer | ID |
| `x_name` | char, required | **Description** (étiquette affichée) |
| `x_studio_sequence` | integer | Séquence |
| `x_active` | boolean | Actif |

**Étiquettes présentes en base (search_read, vérifié 19/02/2026)** :

| id | x_name |
|----|--------|
| 1 | **Commande confirmée** |
| 2 | Commande envoyée aux ateliers |
| 3 | Installation programmée |
| 4 | Commande prête pour l'enlèvement |
| 5 | Entièrement livrée |
| 6 | Acompte non payé |
| 7 | Acompte payé |

- **Confirmé** : “Commande confirmée” n’apparaît pas dans la liste actuelle. Soit elle sera ajoutée dans Odoo, soit le premier état “réel” est considéré comme “commande confirmée” quand il y a au moins une étiquette (hors garde-fou).

### 1.3 Récupération des données côté app

- **API Odoo** (pas le MCP en prod) :
  - Recherche : `search_read` sur `sale.order` avec domaine `[('name', '=', '<numéro_devis>')]`, champs : `name`, `partner_id`, `state`, `x_studio_avancee_du_projet`, `create_date`, `write_date`.
  - Pour afficher les libellés : soit inclure les noms via une lecture des enregistrements liés (relation many2many retourne des listes d’IDs), soit un `name_get` / lecture du modèle `x_avancee_du_projet` pour mapper id → `x_name`.
- **Many2many** : en JSON-RPC/XML-RPC, le champ est souvent retourné comme liste de paires `(id, name)` ou liste d’IDs selon le contexte ; à confirmer au moment de l’intégration API.

---

## 2. Règles métier (rappel)

- **Ordre des étapes** (hors garde-fou) :  
  Commande confirmée → Commande envoyée aux ateliers → Installation programmée / Commande prête pour l’enlèvement (ordre possible inversé) → Entièrement livré.
- **Garde-fou** : “Acompte non payé” bloque la progression ; message “Paiement de l’acompte en attente” sur la barre ; étapes suivantes masquées jusqu’à “Acompte payé”.
- **Commande sans étiquette** : afficher “Commande non confirmée” (timeline avec cette seule étape, disparaît quand la commande est confirmée).
- **Dates** : pas de date dans Odoo pour chaque étape ; tracking côté client à chaque nouveau statut (pas de BDD dédiée pour l’instant).
- **Timeline** : verticale, vers le bas ; étapes passées avec étiquette + date du changement ; flèche en pointillé vers la prochaine (sans afficher la prochaine).

---

## 3. Structure de dossiers proposée (scalable, Netlify)

```
Livraison.bycommute.com/
├── netlify.toml                 # Build, env, redirects, headers
├── .env.example                 # ODOO_URL, ODOO_DB, etc. (sans secrets)
├── package.json
├── README.md
│
├── public/                      # Statiques (favicon, etc.)
│
├── src/
│   ├── index.html
│   ├── main.tsx                 # Point d’entrée (React ou autre)
│   ├── App.tsx
│   │
│   ├── api/                     # Appels backend / Netlify Functions
│   │   ├── odoo/
│   │   │   ├── client.ts        # Config + helpers API Odoo (auth, base URL)
│   │   │   ├── sale-order.ts    # search_read order by name, types
│   │   │   └── avancee.ts       # Lecture x_avancee_du_projet si besoin
│   │   └── order-status.ts      # Optionnel : endpoint Netlify qui appelle Odoo (cache les secrets)
│   │
│   ├── config/
│   │   ├── env.ts               # Variables d’env (build time Netlify)
│   │   └── steps.ts             # Ordre canonique des étapes + garde-fou (ids ou codes)
│   │
│   ├── domain/
│   │   ├── order.ts             # Types: Order, OrderStatus, Step, etc.
│   │   └── timeline.ts         # Logique: étapes à afficher, blocage acompte, prochaine étape
│   │
│   ├── hooks/
│   │   └── useOrderByReference.ts  # Récupération commande au chargement (par numéro devis)
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   └── PageLayout.tsx
│   │   ├── search/
│   │   │   └── OrderSearch.tsx      # Champ “Numéro de devis” + bouton
│   │   └── tracking/
│   │       ├── TrackingTimeline.tsx  # Timeline verticale
│   │       ├── TrackingStep.tsx     # Une étape (libellé + date)
│   │       ├── TrackingBlockedStep.tsx  # Acompte non payé + message
│   │       └── TrackingEmpty.tsx    # Commande non trouvée / non confirmée
│   │
│   ├── pages/
│   │   ├── HomePage.tsx         # Suivi de commande : recherche + résultat
│   │   └── TrackingPage.tsx    # Optionnel : page dédiée après recherche (avec ref en query)
│   │
│   └── styles/
│       └── (global + modules selon stack)
│
├── netlify/
│   └── functions/              # Si on met la clé API côté serveur (recommandé)
│       └── order-status.ts     # Proxy Odoo (lit env, appelle Odoo, renvoie JSON)
│
├── docs/
│   ├── ANALYSE_ODOO_ET_ARCHITECTURE.md  # Ce fichier
│   └── PRD.md                  # À rédiger ensuite
│
└── tests/
    ├── unit/
    │   ├── domain/
    │   │   └── timeline.test.ts
    │   └── config/
    │       └── steps.test.ts
    └── e2e/
        └── tracking.spec.ts
```

---

## 4. Choix techniques recommandés

- **Front** : React (ou Vue) + TypeScript, build Vite (compatible Netlify).
- **État** : minimal (état local + un hook `useOrderByReference`) ; pas de store global nécessaire pour la V1.
- **Secrets** : clé API Odoo dans les **variables d’environnement Netlify** (pas dans le front). Soit :
  - **Option A** : Netlify Function qui appelle Odoo et expose un endpoint (ex. `GET /.netlify/functions/order-status?ref=S00123`) ; le front appelle cette Function.
  - **Option B** : build-time env pour un proxy externe ; déconseillé si la clé doit rester côté serveur.
- **API Odoo** : XML-RPC ou JSON-RPC (selon ce que ton instance expose) ; `client.ts` + `sale-order.ts` encapsulent tout.
- **Config étapes** : fichier `config/steps.ts` qui mappe les ids (ou noms) Odoo vers l’ordre d’affichage et marque les garde-fou (Acompte non payé / Acompte payé). Si Odoo ajoute “Commande confirmée”, on l’ajoute dans cette config.

---

## 5. Points à trancher avant le PRD

1. **“Commande confirmée”** : existe-t-elle déjà dans `x_avancee_du_projet` sous un autre libellé ou doit-elle être créée dans Odoo ?
2. **Format many2many** : confirmer le format exact renvoyé par l’API (liste d’IDs vs liste de `[id, name]`) pour adapter le parsing dans `domain/order.ts` et `domain/timeline.ts`.
3. **Netlify** : confirmer que la clé API sera bien en variable d’env (Netlify UI) et que l’app passera par une Netlify Function pour appeler Odoo (recommandé).

---

## 6. Prochaine étape

Rédaction du **PRD** commun (personas, parcours, critères de succès, maquettes simples) en s’appuyant sur ce document et sur la structure proposée.
