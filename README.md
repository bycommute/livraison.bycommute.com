# Suivi de commande – ByCommute

Application web de suivi de commande (livraison.bycommute.com), connectée à Odoo.

## Développement local

```bash
npm install
npm run dev
```

Ouvre [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview   # prévisualiser le build
```

## Structure

- `src/pages/HomePage.tsx` – page principale (recherche + statut + aide)
- `src/components/search/OrderSearch.tsx` – formulaire numéro de commande
- `src/components/tracking/OrderStatusCard.tsx` – carte statut (non confirmée, etc.)
- `src/components/help/HelpCard.tsx` – bloc « Besoin d'aide ? »
- `src/components/layout/PageLayout.tsx` – en-tête (Suivi de commande | BYCOMMUTE)

L’intégration API Odoo (hook + config étapes) sera ajoutée dans un second temps.

## Variables d'environnement

En local, créer un fichier `.env` (ou `.env.local`) à partir de `.env.example` :

- `VITE_ODOO_URL` : URL de base de l’instance Odoo (ex. `https://votre-compte.odoo.com`)
- `VITE_ODOO_DATABASE` : (optionnel) nom de la base si le serveur en héberge plusieurs
- `VITE_ODOO_API_KEY` : clé API (Préférences ‣ Sécurité du compte ‣ Nouvelle clé API)

L’app utilise l’**API JSON-2** (Odoo 19+) : `POST /json/2/{model}/{method}` avec `Authorization: bearer {key}`. Ce fichier n’est pas versionné.
