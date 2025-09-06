'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import { UserRole } from '@/lib/types/database'
import { 
  createInviteCode, 
  getInviteCodes, 
  toggleInviteCode, 
  InviteCode 
} from '@/lib/auth/invite-auth'
import { getRoleDisplayName, getRoleColor } from '@/lib/auth/config'
import MainLayout from '@/components/layout/MainLayout'
import styles from './admin.module.css'

export default function AdminPage() {
  const { profile, loading } = useAuth()
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  
  const [newCode, setNewCode] = useState({
    code: '',
    role: 'friend' as UserRole,
    maxUses: '',
    expiresAt: '',
  })

  useEffect(() => {
    if (profile?.role === 'admin') {
      loadInviteCodes()
    }
  }, [profile])

  const loadInviteCodes = async () => {
    const codes = await getInviteCodes()
    setInviteCodes(codes)
  }

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    setError('')
    setMessage('')

    const result = await createInviteCode(
      newCode.code.toUpperCase(),
      newCode.role,
      newCode.maxUses ? parseInt(newCode.maxUses) : undefined,
      newCode.expiresAt || undefined
    )

    if (result.success) {
      setMessage(`Invite code "${newCode.code.toUpperCase()}" created successfully!`)
      setNewCode({ code: '', role: 'friend', maxUses: '', expiresAt: '' })
      loadInviteCodes()
    } else {
      setError(result.error || 'Failed to create invite code')
    }
    
    setIsCreating(false)
  }

  const handleToggleCode = async (id: string, isActive: boolean) => {
    const result = await toggleInviteCode(id, !isActive)
    if (result.success) {
      loadInviteCodes()
    } else {
      setError(result.error || 'Failed to toggle invite code')
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading admin panel...</p>
        </div>
      </MainLayout>
    )
  }

  if (!profile || profile.role !== 'admin') {
    return (
      <MainLayout>
        <div className={styles.errorContainer}>
          <h1>Access Denied</h1>
          <p>You need admin privileges to access this page.</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className={styles.admin}>
        <div className={styles.container}>
          <h1 className={styles.title}>Admin Panel</h1>
          
          {/* Create New Invite Code */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Create Invite Code</h2>
            <div className={styles.createCard}>
              <form onSubmit={handleCreateCode} className={styles.createForm}>
                <div className={styles.formRow}>
                  <div className={styles.field}>
                    <label htmlFor="code" className={styles.label}>
                      Code
                    </label>
                    <input
                      id="code"
                      type="text"
                      value={newCode.code}
                      onChange={(e) => setNewCode(prev => ({ ...prev, code: e.target.value }))}
                      placeholder="e.g., NEWBIE2024"
                      required
                      disabled={isCreating}
                      className={styles.input}
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>
                  
                  <div className={styles.field}>
                    <label htmlFor="role" className={styles.label}>
                      Role
                    </label>
                    <select
                      id="role"
                      value={newCode.role}
                      onChange={(e) => setNewCode(prev => ({ ...prev, role: e.target.value as UserRole }))}
                      disabled={isCreating}
                      className={styles.select}
                    >
                      <option value="friend">Friend (Read-only + Vault)</option>
                      <option value="family">Family (Upload + Interact)</option>
                      <option value="admin">Admin (Full Access)</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.field}>
                    <label htmlFor="maxUses" className={styles.label}>
                      Max Uses (optional)
                    </label>
                    <input
                      id="maxUses"
                      type="number"
                      value={newCode.maxUses}
                      onChange={(e) => setNewCode(prev => ({ ...prev, maxUses: e.target.value }))}
                      placeholder="Leave empty for unlimited"
                      disabled={isCreating}
                      className={styles.input}
                      min="1"
                    />
                  </div>
                  
                  <div className={styles.field}>
                    <label htmlFor="expiresAt" className={styles.label}>
                      Expires At (optional)
                    </label>
                    <input
                      id="expiresAt"
                      type="datetime-local"
                      value={newCode.expiresAt}
                      onChange={(e) => setNewCode(prev => ({ ...prev, expiresAt: e.target.value }))}
                      disabled={isCreating}
                      className={styles.input}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCreating || !newCode.code}
                  className={styles.createButton}
                >
                  {isCreating ? (
                    <>
                      <span className={styles.spinner}></span>
                      Creating...
                    </>
                  ) : (
                    'Create Invite Code'
                  )}
                </button>
              </form>

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
            </div>
          </section>

          {/* Existing Invite Codes */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Invite Codes</h2>
            <div className={styles.codesGrid}>
              {inviteCodes.map((code) => (
                <div key={code.id} className={`${styles.codeCard} ${!code.is_active ? styles.codeInactive : ''}`}>
                  <div className={styles.codeHeader}>
                    <span className={styles.codeText}>{code.code}</span>
                    <span 
                      className={styles.roleTag}
                      style={{ backgroundColor: getRoleColor(code.role) }}
                    >
                      {getRoleDisplayName(code.role)}
                    </span>
                  </div>
                  
                  <div className={styles.codeStats}>
                    <div className={styles.stat}>
                      <span className={styles.statLabel}>Uses:</span>
                      <span className={styles.statValue}>
                        {code.current_uses}{code.max_uses ? `/${code.max_uses}` : ''}
                      </span>
                    </div>
                    
                    {code.expires_at && (
                      <div className={styles.stat}>
                        <span className={styles.statLabel}>Expires:</span>
                        <span className={styles.statValue}>
                          {new Date(code.expires_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    
                    <div className={styles.stat}>
                      <span className={styles.statLabel}>Status:</span>
                      <span className={`${styles.statValue} ${code.is_active ? styles.active : styles.inactive}`}>
                        {code.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleToggleCode(code.id, code.is_active)}
                    className={`${styles.toggleButton} ${code.is_active ? styles.disableButton : styles.enableButton}`}
                  >
                    {code.is_active ? 'Disable' : 'Enable'}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Instructions */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Default Codes</h2>
            <div className={styles.instructions}>
              <p>The following invite codes are created by default:</p>
              <ul>
                <li><strong>ADMIN2024</strong> - Creates admin users</li>
                <li><strong>FAMILY2024</strong> - Creates family members</li>
                <li><strong>FRIENDS2024</strong> - Creates friends</li>
              </ul>
              <p>Users can sign up at <code>/signup</code> with any active invite code.</p>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  )
}