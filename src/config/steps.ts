/**
 * Ordre canonique des étapes et garde-fou (ids Odoo x_avancee_du_projet).
 * Aligné sur docs/ANALYSE_ODOO_ET_ARCHITECTURE.md
 */
export const STEP_IDS = {
  COMMANDE_CONFIRMEE: 1,
  COMMANDE_ENVOYEE_ATELIERS: 2,
  INSTALLATION_PROGRAMMEE: 3,
  COMMANDE_PRETE_ENLEVEMENT: 4,
  ENTIEREMENT_LIVREE: 5,
  ACOMPTE_NON_PAYE: 6,
  ACOMPTE_PAYE: 7,
} as const

export const URBANISME_PRODUCT_TEMPLATE_ID = 25
export const INSTALLATION_PRODUCT_TEMPLATE_ID = 432
export const URBANISME_STEP_ID = -URBANISME_PRODUCT_TEMPLATE_ID

export const URBANISME_SUBSTEP_LABELS = [
  "Urbanisme : Dossier en cours de création",
  "Urbanisme : Dossier en cours d'instruction",
  "Urbanisme : Dossier accepté",
] as const

export const GUARD_ACOMPTE_NON_PAYE = STEP_IDS.ACOMPTE_NON_PAYE
export const GUARD_ACOMPTE_PAYE = STEP_IDS.ACOMPTE_PAYE
