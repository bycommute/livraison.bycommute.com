/**
 * Types pour les données commande et avancement (Odoo).
 */

/** Réponse brute search_read sur sale.order (champs demandés). */
export interface RawSaleOrder {
  id: number
  name: string
  partner_id?: [number, string] | false
  x_studio_avancee_du_projet?: number[] | [number, string][]
}

/** Une étape d'avancement (x_avancee_du_projet). */
export interface AvanceeStep {
  id: number
  x_name: string
}

/** Commande normalisée pour l'UI. */
export interface Order {
  id: number
  name: string
  partnerName: string | null
  projectManagerName?: string | null
  projectManagerPhone?: string | null
  /** IDs des étiquettes d'avancement (many2many). */
  avanceeIds: number[]
}

export function normalizeOrder(raw: RawSaleOrder): Order {
  const partnerName =
    Array.isArray(raw.partner_id) && raw.partner_id[1]
      ? raw.partner_id[1]
      : null
  const avancee = raw.x_studio_avancee_du_projet
  const avanceeIds: number[] = Array.isArray(avancee)
    ? avancee.map((x) => (Array.isArray(x) ? x[0] : x))
    : []
  return {
    id: raw.id,
    name: raw.name,
    partnerName,
    avanceeIds,
  }
}
