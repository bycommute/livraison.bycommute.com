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
        <div className={styles.logo}>BYCOMMUTE</div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  )
}
