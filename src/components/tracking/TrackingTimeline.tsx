import type { TimelineStep } from '@/domain/timeline'
import styles from './TrackingTimeline.module.css'

interface TrackingTimelineProps {
  /** Seules les étapes atteintes sont affichées ; flèche pointillée vers la suivante (sans libellé). */
  steps: TimelineStep[]
}

export function TrackingTimeline({ steps }: TrackingTimelineProps) {
  const reachedSteps = steps.filter((s) => s.reached)

  return (
    <div className={styles.timeline} role="list">
      {reachedSteps.map((step) => (
        <div key={step.id} className={styles.item} role="listitem">
          <div className={`${styles.marker} ${styles.markerReached}`} />
          <div className={styles.content}>
            <span className={styles.label}>{step.label}</span>
          </div>
        </div>
      ))}
      {reachedSteps.length > 0 && (
        <div className={styles.arrow} aria-hidden>
          <span className={styles.arrowLine} />
        </div>
      )}
    </div>
  )
}
