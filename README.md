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

L’app appelle maintenant une **Netlify Function** (`/api/order-status`) qui interroge Odoo en JSON-2 côté serveur.

## Variables d'environnement (Netlify Functions)

En local, créer un fichier `.env` (ou `.env.local`) à partir de `.env.example` :

- `ODOO_URL` : URL de base de l’instance Odoo (ex. `https://votre-compte.odoo.com`)
- `ODOO_DATABASE` : (optionnel) nom de la base si le serveur en héberge plusieurs
- `ODOO_API_KEY` : clé API (Préférences ‣ Sécurité du compte ‣ Nouvelle clé API)

La clé API ne doit jamais être exposée côté front.

## Test local avec functions

Pour tester la route `/api/order-status` en local, lance Netlify en mode dev :

```bash
netlify dev
```
