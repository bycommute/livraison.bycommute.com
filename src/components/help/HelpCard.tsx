import styles from './HelpCard.module.css'

const DEFAULT_PHONE = '07 43 39 56 18'
const EMAIL = 'achat@bycommute.fr'

type HelpCardProps = {
  phone?: string | null
  projectManagerName?: string | null
}

export function HelpCard({ phone, projectManagerName }: HelpCardProps) {
  const displayManagerName = projectManagerName?.trim() || null
  const hasAssignedManager = Boolean(displayManagerName)
  const displayPhone =
    hasAssignedManager && phone?.trim() ? phone : DEFAULT_PHONE
  const telHref = displayPhone.replace(/\s/g, '')

  return (
    <section className={styles.section} aria-labelledby="help-heading">
      <h2 id="help-heading" className={styles.title}>
        Besoin d'aide ?
      </h2>
      <p className={styles.intro}>
        Notre équipe est à votre disposition pour répondre à vos questions
        concernant votre commande.
      </p>
      <div className={styles.card}>
        {hasAssignedManager && (
          <div className={styles.contactBlock}>
            <div className={styles.iconWrap}>
              <UserIcon className={styles.icon} />
            </div>
            <div className={styles.contactContent}>
              <span className={styles.managerLabel}>Le gestionnaire de votre projet</span>
              <p className={styles.managerName}>{displayManagerName}</p>
              <p className={styles.managerHint}>Personne assignée à votre projet</p>
            </div>
          </div>
        )}

        <div className={styles.contactBlock}>
          <div className={styles.iconWrap}>
            <PhoneIcon className={styles.icon} />
          </div>
          <div className={styles.contactContent}>
            <span className={styles.contactLabel}>Par téléphone</span>
            <a href={`tel:${telHref}`} className={styles.contactValue}>
              {displayPhone}
            </a>
            <p className={styles.contactDetail}>
              Du lundi au vendredi, de 9h à 18h
            </p>
          </div>
        </div>
        <div className={styles.contactBlock}>
          <div className={styles.iconWrap}>
            <EmailIcon className={styles.icon} />
          </div>
          <div>
            <span className={styles.contactLabel}>Par email</span>
            <a href={`mailto:${EMAIL}`} className={styles.contactValue}>
              {EMAIL}
            </a>
            <p className={styles.contactDetail}>
              Réponse sous 24h ouvrées
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  )
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}
