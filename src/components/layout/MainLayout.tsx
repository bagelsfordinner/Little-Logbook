import Header from './Header'
import styles from './MainLayout.module.css'

interface MainLayoutProps {
  children: React.ReactNode
  className?: string
}

export default function MainLayout({ children, className }: MainLayoutProps) {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={`${styles.main} ${className || ''}`}>
        {children}
      </main>
    </div>
  )
}