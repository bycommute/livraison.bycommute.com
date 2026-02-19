/**
 * Variables d'environnement (préfixe VITE_ pour exposition au client en dev local).
 * En déploiement Netlify (phase 2), l'app appellera une Netlify Function qui lira
 * les secrets côté serveur ; le client n'aura plus besoin de la clé.
 */
const base = typeof import.meta !== 'undefined' && import.meta.env
  ? (import.meta.env as ImportMetaEnv)
  : ({} as ImportMetaEnv)

export const config = {
  odooUrl: base.VITE_ODOO_URL ?? '',
  odooDatabase: base.VITE_ODOO_DATABASE ?? '',
  odooApiKey: base.VITE_ODOO_API_KEY ?? '',
} as const

export interface ImportMetaEnv {
  VITE_ODOO_URL?: string
  VITE_ODOO_DATABASE?: string
  VITE_ODOO_API_KEY?: string
}
