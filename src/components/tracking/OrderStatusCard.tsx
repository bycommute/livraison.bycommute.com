import styles from './OrderStatusCard.module.css'

export type OrderStatusType = 'not_found' | 'not_confirmed' | 'blocked' | 'ok'

interface OrderStatusCardProps {
  orderReference: string
  statusType: OrderStatusType
  statusLabel: string
  statusSubtext?: string
}

export function OrderStatusCard({
  orderReference,
  statusType,
  statusLabel,
  statusSubtext,
}: OrderStatusCardProps) {
  const showWarning = statusType === 'not_confirmed' || statusType === 'blocked'
  const showAlert = statusLabel || statusSubtext || showWarning

  return (
    <div className={styles.card}>
      <div className={styles.orderRef}>{orderReference}</div>
      {showAlert && (
        <div
          className={`${styles.alert} ${showWarning ? styles.alertWarning : ''}`}
          role="status"
        >
          {showWarning && (
            <span className={styles.icon} aria-hidden>
              <WarningIcon />
            </span>
          )}
          <div className={styles.alertContent}>
            {statusLabel && <span className={styles.statusLabel}>{statusLabel}</span>}
            {statusSubtext && (
              <span className={styles.statusSubtext}>{statusSubtext}</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function WarningIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  )
}
