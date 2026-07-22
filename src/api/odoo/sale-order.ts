/**
 * Lecture des commandes (sale.order) via JSON-2.
 */
import { odooCall } from './client'
import type { RawSaleOrder } from '@/domain/order'
import { normalizeOrder } from '@/domain/order'
import type { Order } from '@/domain/order'
import {
  INSTALLATION_PRODUCT_TEMPLATE_ID,
  URBANISME_PRODUCT_TEMPLATE_ID,
} from '@/config/steps'

const MODEL = 'sale.order'
const FIELDS = ['name', 'partner_id', 'x_studio_avancee_du_projet'] as const
const LINE_FIELDS = ['product_template_id', 'product_uom_qty'] as const

type RawOrderLine = {
  product_template_id?: [number, string] | false
  product_uom_qty?: number
}

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

  const raw = rawList[0]
  const lines = await odooCall<RawOrderLine[]>('sale.order.line', 'search_read', {
    domain: [['order_id', '=', raw.id], ['display_type', '=', false]],
    fields: [...LINE_FIELDS],
  })
  const orderedTemplateIds = new Set(
    (Array.isArray(lines) ? lines : [])
      .filter((line) => Number(line.product_uom_qty ?? 0) >= 1)
      .map((line) => Array.isArray(line.product_template_id) ? line.product_template_id[0] : null)
      .filter((id): id is number => typeof id === 'number')
  )

  return normalizeOrder(raw, {
    hasUrbanisme: orderedTemplateIds.has(URBANISME_PRODUCT_TEMPLATE_ID),
    hasInstallation: orderedTemplateIds.has(INSTALLATION_PRODUCT_TEMPLATE_ID),
  })
}
