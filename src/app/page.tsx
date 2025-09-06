'use client'

import { useAuth } from '@/lib/auth/AuthContext'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/layout/MainLayout'
import styles from './page.module.css'

export default function HomePage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user && profile) {
      router.push('/dashboard')
    }
  }, [user, profile, loading, router])

  if (loading) {
    return (
      <MainLayout>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading...</p>
        </div>
      </MainLayout>
    )
  }

  if (user && profile) {
    return null // Will redirect to dashboard
  }

  return (
    <MainLayout>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Welcome to Our
              <span className={styles.titleAccent}> Little Logbook</span>
            </h1>
            <p className={styles.heroSubtitle}>
              A private space for family and friends to share in our pregnancy 
              and baby journey through photos, stories, and precious memories.
            </p>
            <div className={styles.heroActions}>
              <a href="/login" className={styles.primaryButton}>
                Sign In
              </a>
              <a href="/signup" className={styles.secondaryButton}>
                Join with Invite Code
              </a>
              <div className={styles.inviteNotice}>
                <p className={styles.inviteText}>
                  Don&apos;t have an invite code? Contact the family to get one.
                </p>
              </div>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.visualCard}>
              <div className={styles.cardIcon}>👶</div>
              <h3 className={styles.cardTitle}>Share the Journey</h3>
              <p className={styles.cardDescription}>
                Follow along with photos, stories, and updates as our little one grows
              </p>
            </div>
            <div className={styles.visualCard}>
              <div className={styles.cardIcon}>📸</div>
              <h3 className={styles.cardTitle}>Precious Moments</h3>
              <p className={styles.cardDescription}>
                Capture and organize memories in our beautiful timeline gallery
              </p>
            </div>
            <div className={styles.visualCard}>
              <div className={styles.cardIcon}>💝</div>
              <h3 className={styles.cardTitle}>Memory Vault</h3>
              <p className={styles.cardDescription}>
                Leave letters, recommendations, and memories for the future
              </p>
            </div>
          </div>
        </div>
        
        <div className={styles.features}>
          <div className={styles.feature}>
            <h3 className={styles.featureTitle}>For Family</h3>
            <p className={styles.featureDescription}>
              Share photos, write stories, and help with preparation tasks
            </p>
          </div>
          <div className={styles.feature}>
            <h3 className={styles.featureTitle}>For Friends</h3>
            <p className={styles.featureDescription}>
              View updates and contribute to the memory vault with well-wishes
            </p>
          </div>
          <div className={styles.feature}>
            <h3 className={styles.featureTitle}>For Everyone</h3>
            <p className={styles.featureDescription}>
              Experience this beautiful journey together in one special place
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}