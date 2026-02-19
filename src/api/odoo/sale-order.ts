/**
 * Lecture des commandes (sale.order) via JSON-2.
 */
import { odooCall } from './client'
import type { RawSaleOrder } from '@/domain/order'
import { normalizeOrder } from '@/domain/order'
import type { Order } from '@/domain/order'

const MODEL = 'sale.order'
const FIELDS = ['name', 'partner_id', 'x_studio_avancee_du_projet'] as const

/**
 * Recherche une commande par numéro (name).
 * Retourne la première trouvée ou null.
 */
export async function getOrderByReference(reference: string): Promise<Order | null> {
  const domain = [['name', '=', reference.trim()]]
  const rawList = await odooCall<RawSaleOrder[]>(MODEL, 'search_read', {
    domain,
    fields: [...FIELDS],
    limit: 1,
  })
  if (!Array.isArray(rawList) || rawList.length === 0) return null
  return normalizeOrder(rawList[0])
}
