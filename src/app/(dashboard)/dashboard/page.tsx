'use client'

import { useAuth } from '@/lib/auth/AuthContext'
import { getRoleDisplayName } from '@/lib/auth/config'
import MainLayout from '@/components/layout/MainLayout'
import styles from './dashboard.module.css'

export default function DashboardPage() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <MainLayout>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading your dashboard...</p>
        </div>
      </MainLayout>
    )
  }

  if (!user || !profile) {
    return (
      <MainLayout>
        <div className={styles.errorContainer}>
          <h1>Access Denied</h1>
          <p>Please log in to access your dashboard.</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className={styles.dashboard}>
        <div className={styles.container}>
          {/* Welcome Header */}
          <section className={styles.welcomeSection}>
            <h1 className={styles.welcomeTitle}>
              Welcome, {profile.display_name}! 👋
            </h1>
            <div className={styles.roleInfo}>
              <span className={styles.roleLabel}>Your Role:</span>
              <span className={styles.roleValue}>
                {getRoleDisplayName(profile.role)}
              </span>
            </div>
          </section>

          {/* Quick Actions */}
          <section className={styles.actionsSection}>
            <h2 className={styles.sectionTitle}>Quick Actions</h2>
            <div className={styles.actionGrid}>
              <div className={styles.actionCard}>
                <div className={styles.actionIcon}>📸</div>
                <h3 className={styles.actionTitle}>Gallery</h3>
                <p className={styles.actionDescription}>
                  Browse photos and timeline events
                </p>
                <a href="/gallery" className={styles.actionButton}>
                  View Gallery
                </a>
              </div>

              {(profile.role === 'admin' || profile.role === 'family') && (
                <div className={styles.actionCard}>
                  <div className={styles.actionIcon}>🤝</div>
                  <h3 className={styles.actionTitle}>Help & Tasks</h3>
                  <p className={styles.actionDescription}>
                    Coordinate help and manage tasks
                  </p>
                  <a href="/help" className={styles.actionButton}>
                    View Help Center
                  </a>
                </div>
              )}

              <div className={styles.actionCard}>
                <div className={styles.actionIcon}>💝</div>
                <h3 className={styles.actionTitle}>Memory Vault</h3>
                <p className={styles.actionDescription}>
                  Add memories for the future
                </p>
                <a href="/vault" className={styles.actionButton}>
                  Open Vault
                </a>
              </div>

              <div className={styles.actionCard}>
                <div className={styles.actionIcon}>❓</div>
                <h3 className={styles.actionTitle}>FAQ</h3>
                <p className={styles.actionDescription}>
                  Get answers to common questions
                </p>
                <a href="/faq" className={styles.actionButton}>
                  View FAQ
                </a>
              </div>

              {profile.role === 'admin' && (
                <div className={styles.actionCard}>
                  <div className={styles.actionIcon}>⚙️</div>
                  <h3 className={styles.actionTitle}>Admin</h3>
                  <p className={styles.actionDescription}>
                    Manage users and content
                  </p>
                  <a href="/admin" className={styles.actionButton}>
                    Admin Panel
                  </a>
                </div>
              )}
            </div>
          </section>

          {/* Permissions Info */}
          <section className={styles.permissionsSection}>
            <h2 className={styles.sectionTitle}>What You Can Do</h2>
            <div className={styles.permissionsList}>
              {profile.role === 'admin' && (
                <>
                  <div className={styles.permission}>✅ Create and manage all content</div>
                  <div className={styles.permission}>✅ Invite new users</div>
                  <div className={styles.permission}>✅ Moderate content</div>
                  <div className={styles.permission}>✅ Access admin panel</div>
                </>
              )}
              {profile.role === 'family' && (
                <>
                  <div className={styles.permission}>✅ Upload photos and create stories</div>
                  <div className={styles.permission}>✅ Comment on content</div>
                  <div className={styles.permission}>✅ Help with tasks</div>
                  <div className={styles.permission}>✅ Add to memory vault</div>
                </>
              )}
              {profile.role === 'friend' && (
                <>
                  <div className={styles.permission}>👀 View all content</div>
                  <div className={styles.permission}>✅ Comment on posts</div>
                  <div className={styles.permission}>✅ Add to memory vault</div>
                  <div className={styles.permission}>ℹ️ Read-only access to most features</div>
                </>
              )}
            </div>
          </section>

          {/* Recent Activity Placeholder */}
          <section className={styles.activitySection}>
            <h2 className={styles.sectionTitle}>Coming Soon</h2>
            <div className={styles.comingSoon}>
              <p>🚧 Recent activity feed, announcements, and timeline updates will appear here!</p>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  )
}