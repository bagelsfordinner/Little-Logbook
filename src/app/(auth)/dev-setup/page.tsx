'use client'

import { useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import styles from '../login/login.module.css'

export default function DevSetupPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loginUrl, setLoginUrl] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')
    setLoginUrl('')

    try {
      const response = await fetch('/api/auth/dev-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          setupKey: 'little-logbook-admin-2024',
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message)
        setLoginUrl(data.loginUrl)
      } else {
        setError(data.error || 'Failed to create dev login')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (process.env.NODE_ENV !== 'development') {
    return (
      <MainLayout>
        <div className={styles.container}>
          <div className={styles.card}>
            <h1>Not Available</h1>
            <p>This page is only available in development mode.</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>🔧 Dev Setup</h1>
            <p className={styles.subtitle}>
              Create admin account for development
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>
                Your Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={isLoading}
                className={styles.input}
              />
            </div>

            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            {message && (
              <div className={styles.success}>
                {message}
              </div>
            )}

            {loginUrl && (
              <div className={styles.success}>
                <p><strong>Click this link to log in:</strong></p>
                <a 
                  href={loginUrl}
                  className={styles.submitButton}
                  style={{ display: 'inline-block', textAlign: 'center', marginTop: '10px' }}
                >
                  🚀 Login as Admin
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email}
              className={styles.submitButton}
            >
              {isLoading ? (
                <>
                  <span className={styles.spinner}></span>
                  Creating admin account...
                </>
              ) : (
                'Create Admin Account'
              )}
            </button>
          </form>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              This will create an admin account and bypass email verification for development.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}