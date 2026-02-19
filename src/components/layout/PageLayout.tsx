import type { ReactNode } from 'react'
import styles from './PageLayout.module.css'

interface PageLayoutProps {
  children: ReactNode
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>Suivi de commande</h1>
        <img
          src="/images/log_byc_quadri.png"
          alt="ByCommute"
          className={styles.logoImage}
        />
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  )
}
