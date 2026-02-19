import { useEffect, useMemo } from 'react'
import { PageLayout } from '@/components/layout/PageLayout'
import { OrderSearch } from '@/components/search/OrderSearch'
import { OrderStatusCard } from '@/components/tracking/OrderStatusCard'
import { TrackingTimeline } from '@/components/tracking/TrackingTimeline'
import { HelpCard } from '@/components/help/HelpCard'
import { useOrderByReference } from '@/hooks/useOrderByReference'

function getReferenceFromUrl(): string {
  if (typeof window === 'undefined') return ''
  const params = new URLSearchParams(window.location.search)

  // Supporte ?id=... et ?ID=... (insensible à la casse).
  for (const [key, value] of params.entries()) {
    if (key.toLowerCase() === 'id') {
      return value.trim()
    }
  }
  return ''
}

export function HomePage() {
  const { result, fetchOrder } = useOrderByReference()
  const referenceFromUrl = useMemo(getReferenceFromUrl, [])
  const helpPhone =
    result.type === 'ok' ? result.order.projectManagerPhone ?? null : null
  const helpManagerName =
    result.type === 'ok' ? result.order.projectManagerName ?? null : null

  useEffect(() => {
    if (referenceFromUrl) {
      fetchOrder(referenceFromUrl)
    }
  }, [referenceFromUrl, fetchOrder])

  return (
    <PageLayout>
      <OrderSearch
        defaultReference={referenceFromUrl}
        onSearch={fetchOrder}
        isLoading={result.type === 'loading'}
      />

      {result.type === 'not_found' && (
        <OrderStatusCard
          orderReference={result.reference}
          statusType="not_found"
          statusLabel="Aucune commande trouvée"
          statusSubtext="Vérifiez le numéro de commande ou contactez-nous."
        />
      )}

      {result.type === 'error' && (
        <OrderStatusCard
          orderReference={result.reference}
          statusType="not_found"
          statusLabel="Erreur"
          statusSubtext={result.message}
        />
      )}

      {result.type === 'ok' && result.timeline.displayStatus === 'not_confirmed' && (
        <OrderStatusCard
          orderReference={result.order.name}
          statusType="not_confirmed"
          statusLabel="Commande non confirmée"
          statusSubtext="En attente de confirmation"
        />
      )}

      {result.type === 'ok' && result.timeline.displayStatus === 'blocked' && (
        <>
          <OrderStatusCard
            orderReference={result.order.name}
            statusType="blocked"
            statusLabel={result.timeline.steps[0]?.label ?? 'Acompte non payé'}
            statusSubtext={result.timeline.blockMessage ?? undefined}
          />
        </>
      )}

      {result.type === 'ok' && result.timeline.displayStatus === 'ok' && (
        <>
          <TrackingTimeline
            orderReference={result.order.name}
            steps={result.timeline.steps}
          />
        </>
      )}

      <HelpCard phone={helpPhone} projectManagerName={helpManagerName} />
    </PageLayout>
  )
}
