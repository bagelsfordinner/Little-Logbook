'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import { getRoleDisplayName, getRoleColor } from '@/lib/auth/config'
import styles from './Header.module.css'

interface HeaderProps {
  className?: string
}

export default function Header({ className }: HeaderProps) {
  const { user, profile, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className={`${styles.header} ${className || ''}`}>
      <nav className={styles.nav}>
        <div className={styles.container}>
          {/* Logo/Brand */}
          <div className={styles.brand}>
            <Link href={user ? "/dashboard" : "/"} className={styles.brandLink}>
              <span className={styles.brandText}>Little Logbook</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {user && profile && (
            <div className={styles.desktopNav}>
              <Link href="/dashboard" className={styles.navLink}>
                Home
              </Link>
              <Link href="/gallery" className={styles.navLink}>
                Gallery
              </Link>
              <Link href="/help" className={styles.navLink}>
                Help
              </Link>
              <Link href="/vault" className={styles.navLink}>
                Vault
              </Link>
              <Link href="/faq" className={styles.navLink}>
                FAQ
              </Link>
              {profile.role === 'admin' && (
                <Link href="/admin" className={styles.navLink}>
                  Admin
                </Link>
              )}
            </div>
          )}

          {/* User Menu */}
          <div className={styles.userSection}>
            {user && profile ? (
              <div className={styles.userMenu}>
                <div className={styles.userInfo}>
                  <span className={styles.displayName}>{profile.display_name}</span>
                  <span 
                    className={styles.roleTag}
                    style={{ backgroundColor: getRoleColor(profile.role) }}
                  >
                    {getRoleDisplayName(profile.role)}
                  </span>
                </div>
                <button 
                  onClick={handleSignOut}
                  className={styles.signOutButton}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link href="/login" className={styles.loginButton}>
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          {user && profile && (
            <button
              className={styles.mobileMenuButton}
              onClick={toggleMobileMenu}
              aria-label="Toggle navigation menu"
            >
              <span className={styles.hamburger}></span>
              <span className={styles.hamburger}></span>
              <span className={styles.hamburger}></span>
            </button>
          )}
        </div>

        {/* Mobile Navigation */}
        {user && profile && (
          <div className={`${styles.mobileNav} ${isMobileMenuOpen ? styles.mobileNavOpen : ''}`}>
            <Link href="/dashboard" className={styles.mobileNavLink}>
              Home
            </Link>
            <Link href="/gallery" className={styles.mobileNavLink}>
              Gallery
            </Link>
            <Link href="/help" className={styles.mobileNavLink}>
              Help
            </Link>
            <Link href="/vault" className={styles.mobileNavLink}>
              Vault
            </Link>
            <Link href="/faq" className={styles.mobileNavLink}>
              FAQ
            </Link>
            {profile.role === 'admin' && (
              <Link href="/admin" className={styles.mobileNavLink}>
                Admin
              </Link>
            )}
            <button 
              onClick={handleSignOut}
              className={styles.mobileSignOutButton}
            >
              Sign Out
            </button>
          </div>
        )}
      </nav>
    </header>
  )
}