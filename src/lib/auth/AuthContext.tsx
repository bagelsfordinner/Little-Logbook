'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { getCurrentProfile, signOut, Profile } from './invite-auth'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const refreshProfile = async () => {
    if (user) {
      try {
        const userProfile = await getCurrentProfile()
        setProfile(userProfile)
      } catch (error) {
        console.error('Error fetching profile:', error)
        setProfile(null)
      }
    } else {
      setProfile(null)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
    setProfile(null)
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // Fetch profile when user changes
  useEffect(() => {
    if (user && !loading) {
      refreshProfile()
    } else if (!user) {
      setProfile(null)
    }
  }, [user, loading])

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signOut: handleSignOut,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useRequireAuth() {
  const auth = useAuth()
  
  if (!auth.loading && !auth.user) {
    throw new Error('Authentication required')
  }
  
  return auth
}

export function useRequireRole(allowedRoles: string[]) {
  const auth = useRequireAuth()
  
  if (!auth.loading && auth.profile && !allowedRoles.includes(auth.profile.role)) {
    throw new Error('Insufficient permissions')
  }
  
  return auth
}