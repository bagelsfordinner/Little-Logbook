'use client'

import { useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import styles from '../login/login.module.css'

export default function SimpleSetupPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [instructions, setInstructions] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setMessage('')
    setInstructions([])

    try {
      const response = await fetch('/api/auth/simple-setup', {
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
        if (data.instructions) {
          setInstructions(data.instructions)
        }
      } else {
        setError(data.error || 'Failed to setup')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>🔧 Simple Setup</h1>
            <p className={styles.subtitle}>
              Make yourself admin for testing
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
                <p>{message}</p>
                {instructions.length > 0 && (
                  <div style={{ marginTop: '15px' }}>
                    <strong>Next steps:</strong>
                    <ol style={{ marginTop: '10px', paddingLeft: '20px' }}>
                      {instructions.map((instruction, index) => (
                        <li key={index} style={{ marginBottom: '5px' }}>
                          {instruction}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
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
                  Setting up...
                </>
              ) : (
                'Make Me Admin'
              )}
            </button>
          </form>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              This will attempt to make you an admin for testing. You may need to configure Supabase auth settings first.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}