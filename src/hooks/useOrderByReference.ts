import { useState, useCallback } from 'react'
import { getOrderByReference } from '@/api/odoo/sale-order'
import { getAvanceeSteps } from '@/api/odoo/avancee'
import type { Order } from '@/domain/order'
import {
  computeTimelineState,
  stepLabelsMap,
  type TimelineState,
} from '@/domain/timeline'
import { OdooJson2Error } from '@/api/odoo/client'

export type OrderResult =
  | { type: 'idle' }
  | { type: 'loading' }
  | { type: 'not_found'; reference: string }
  | { type: 'error'; reference: string; message: string }
  | { type: 'ok'; order: Order; timeline: TimelineState }

export function useOrderByReference() {
  const [result, setResult] = useState<OrderResult>({ type: 'idle' })

  const fetchOrder = useCallback(async (reference: string) => {
    const ref = reference.trim()
    if (!ref) return

    setResult({ type: 'loading' })

    try {
      const [order, steps] = await Promise.all([
        getOrderByReference(ref),
        getAvanceeSteps(),
      ])

      if (!order) {
        setResult({ type: 'not_found', reference: ref })
        return
      }

      const labels = stepLabelsMap(steps)
      const timeline = computeTimelineState(order.avanceeIds, labels)
      setResult({ type: 'ok', order, timeline })
    } catch (err) {
      const message =
        err instanceof OdooJson2Error
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Erreur de connexion'
      setResult({ type: 'error', reference: ref, message })
    }
  }, [])

  const reset = useCallback(() => {
    setResult({ type: 'idle' })
  }, [])

  return { result, fetchOrder, reset }
}
