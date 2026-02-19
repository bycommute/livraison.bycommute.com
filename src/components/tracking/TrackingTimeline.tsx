import type { TimelineStep } from '@/domain/timeline'
import styles from './TrackingTimeline.module.css'

interface TrackingTimelineProps {
  orderReference: string
  steps: TimelineStep[]
}

type VisualStatus = 'done' | 'current' | 'upcoming'

function computeVisualStatuses(steps: TimelineStep[]): VisualStatus[] {
  const reachedIndexes = steps
    .map((step, index) => (step.reached ? index : -1))
    .filter((index) => index >= 0)

  const activeIndex =
    reachedIndexes.length > 0 ? reachedIndexes[reachedIndexes.length - 1] : 0

  return steps.map((step, index) => {
    if (index < activeIndex) return 'done'
    if (index === activeIndex) return step.reached ? 'current' : 'upcoming'
    return 'upcoming'
  })
}

export function TrackingTimeline({ orderReference, steps }: TrackingTimelineProps) {
  const visualStatuses = computeVisualStatuses(steps)

  return (
    <section className={styles.card} aria-label={`Timeline de la commande ${orderReference}`}>
      <h3 className={styles.orderRef}>{orderReference}</h3>
      <div className={styles.timeline} role="list">
        {steps.map((step, index) => {
          const visualStatus = visualStatuses[index]
          const markerClass =
            visualStatus === 'done'
              ? styles.markerDone
              : visualStatus === 'current'
                ? styles.markerCurrent
                : styles.markerUpcoming

          const itemClass =
            visualStatus === 'done'
              ? styles.itemDone
              : visualStatus === 'current'
                ? styles.itemCurrent
                : styles.itemUpcoming

          return (
            <article key={step.id} className={`${styles.item} ${itemClass}`} role="listitem">
              <div className={styles.rail} aria-hidden>
                <div className={`${styles.marker} ${markerClass}`}>
                  {visualStatus === 'done' ? (
                    <CheckIcon />
                  ) : visualStatus === 'current' ? (
                    <DotIcon />
                  ) : (
                    <DotIcon />
                  )}
                </div>
                {index < steps.length - 1 && <div className={styles.connector} />}
              </div>
              <div className={styles.content}>
                <p className={styles.label}>{step.label}</p>
                <p className={styles.caption}>
                  {visualStatus === 'done'
                    ? 'Étape terminée'
                    : visualStatus === 'current'
                      ? 'Étape en cours'
                      : 'Étape à venir'}
                </p>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m5 13 4 4L19 7" />
    </svg>
  )
}

function DotIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="12" r="8" />
    </svg>
  )
}
