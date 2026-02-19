/**
 * Lecture des étiquettes d'avancement (x_avancee_du_projet) via JSON-2.
 */
import { odooCall } from './client'
import type { AvanceeStep } from '@/domain/order'

const MODEL = 'x_avancee_du_projet'
const FIELDS = ['id', 'x_name'] as const

/**
 * Récupère toutes les étapes actives pour mapper id -> libellé.
 */
export async function getAvanceeSteps(): Promise<AvanceeStep[]> {
  const raw = await odooCall<AvanceeStep[]>(MODEL, 'search_read', {
    domain: [],
    fields: [...FIELDS],
  })
  if (!Array.isArray(raw)) return []
  return raw
}
