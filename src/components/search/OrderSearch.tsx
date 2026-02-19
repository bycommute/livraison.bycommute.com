import { useState, type FormEvent } from 'react'
import styles from './OrderSearch.module.css'

interface OrderSearchProps {
  defaultReference?: string
  onSearch: (reference: string) => void
  isLoading?: boolean
}

export function OrderSearch({
  defaultReference = '',
  onSearch,
  isLoading = false,
}: OrderSearchProps) {
  const [value, setValue] = useState(defaultReference)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const ref = value.trim()
    if (ref) onSearch(ref)
  }

  return (
    <section className={styles.section} aria-label="Recherche de commande">
      <div className={styles.iconWrapper}>
        <PackageIcon className={styles.icon} />
      </div>
      <h2 className={styles.title}>Suivez votre commande</h2>
      <p className={styles.subtitle}>
        Entrez votre numéro de commande pour suivre son état d'avancement
      </p>
      <form onSubmit={handleSubmit} className={styles.card}>
        <label htmlFor="order-ref" className={styles.label}>
          Numéro de commande
        </label>
        <div className={styles.inputWrap}>
          <SearchIcon className={styles.inputIcon} />
          <input
            id="order-ref"
            type="text"
            className={styles.input}
            placeholder="Ex. D1234"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={isLoading}
            autoComplete="off"
          />
        </div>
        <button
          type="submit"
          className={styles.button}
          disabled={!value.trim() || isLoading}
        >
          {isLoading ? 'Recherche…' : 'Suivre ma commande'}
          <ArrowIcon className={styles.buttonIcon} />
        </button>
      </form>
    </section>
  )
}

function PackageIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M16.5 9.4 7.55 4.24" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}
