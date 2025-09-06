'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUpWithInvite, validateInviteCode } from '@/lib/auth/invite-auth'
import { getRoleDisplayName } from '@/lib/auth/config'
import MainLayout from '@/components/layout/MainLayout'
import styles from './signup.module.css'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    inviteCode: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [codeValidation, setCodeValidation] = useState<{
    valid: boolean
    role?: string
    checked: boolean
  }>({ valid: false, checked: false })
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    
    // Reset code validation if invite code changes
    if (e.target.name === 'inviteCode') {
      setCodeValidation({ valid: false, checked: false })
    }
  }

  const handleValidateCode = async () => {
    if (!formData.inviteCode.trim()) return
    
    setIsLoading(true)
    const result = await validateInviteCode(formData.inviteCode.trim().toUpperCase())
    setCodeValidation({
      valid: result.valid,
      role: result.role,
      checked: true
    })
    
    if (!result.valid) {
      setError(result.error || 'Invalid invite code')
    } else {
      setError('')
    }
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    // Validate form
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    if (!codeValidation.valid || !codeValidation.checked) {
      setError('Please validate your invite code first')
      setIsLoading(false)
      return
    }

    const result = await signUpWithInvite(
      formData.email,
      formData.password,
      formData.displayName || formData.email.split('@')[0],
      formData.inviteCode.trim().toUpperCase()
    )
    
    if (result.success) {
      setSuccess('Account created successfully! You can now sign in.')
      setTimeout(() => router.push('/login'), 2000)
    } else {
      setError(result.error || 'Signup failed')
    }
    
    setIsLoading(false)
  }

  return (
    <MainLayout>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Join Little Logbook</h1>
            <p className={styles.subtitle}>
              Create your account with an invite code
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="inviteCode" className={styles.label}>
                Invite Code *
              </label>
              <div className={styles.codeField}>
                <input
                  id="inviteCode"
                  name="inviteCode"
                  type="text"
                  value={formData.inviteCode}
                  onChange={handleChange}
                  placeholder="e.g., FAMILY2024"
                  required
                  disabled={isLoading}
                  className={styles.input}
                  style={{ textTransform: 'uppercase' }}
                />
                <button
                  type="button"
                  onClick={handleValidateCode}
                  disabled={isLoading || !formData.inviteCode.trim()}
                  className={styles.validateButton}
                >
                  {isLoading ? 'Checking...' : 'Validate'}
                </button>
              </div>
              {codeValidation.checked && (
                <div className={codeValidation.valid ? styles.codeValid : styles.codeInvalid}>
                  {codeValidation.valid ? (
                    <>✅ Valid code! Role: <strong>{getRoleDisplayName(codeValidation.role as any)}</strong></>
                  ) : (
                    '❌ Invalid or expired invite code'
                  )}
                </div>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                disabled={isLoading}
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="displayName" className={styles.label}>
                Display Name
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                value={formData.displayName}
                onChange={handleChange}
                placeholder="Your Name (optional)"
                disabled={isLoading}
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="password" className={styles.label}>
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className={styles.input}
                minLength={6}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className={styles.input}
                minLength={6}
              />
            </div>

            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            {success && (
              <div className={styles.success}>
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !codeValidation.valid}
              className={styles.submitButton}
            >
              {isLoading ? (
                <>
                  <span className={styles.spinner}></span>
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              Already have an account?{' '}
              <Link href="/login" className={styles.link}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}