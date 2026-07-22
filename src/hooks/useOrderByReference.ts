import { useState, useCallback } from 'react'
import type { Order } from '@/domain/order'
import {
  computeTimelineState,
  stepLabelsMap,
  type TimelineState,
} from '@/domain/timeline'

type OrderStatusApiResponse = {
  order: Order | null
  steps: { id: number; x_name: string }[]
}

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
      const response = await fetch(
        `/api/order-status?reference=${encodeURIComponent(ref)}`
      )
      const body = (await response.json()) as
        | OrderStatusApiResponse
        | { error?: string }

      if (!response.ok) {
        const message =
          typeof body === 'object' && body && 'error' in body && body.error
            ? body.error
            : `HTTP ${response.status}`
        throw new Error(message)
      }

      const { order, steps } = body as OrderStatusApiResponse

      if (!order) {
        setResult({ type: 'not_found', reference: ref })
        return
      }

      const labels = stepLabelsMap(steps)
      const timeline = computeTimelineState(order.avanceeIds, labels, {
        hasUrbanisme: order.hasUrbanisme,
        hasInstallation: order.hasInstallation,
      })
      setResult({ type: 'ok', order, timeline })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erreur de connexion'
      setResult({ type: 'error', reference: ref, message })
    }
  }, [])

  const reset = useCallback(() => {
    setResult({ type: 'idle' })
  }, [])

  return { result, fetchOrder, reset }
}
