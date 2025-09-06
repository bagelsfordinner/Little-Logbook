// Simplified authentication system
import { createClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'

export interface SimpleUser {
  id: string
  email: string
  display_name: string
  role: 'admin' | 'family' | 'friend'
  last_login?: string
  created_at: string
}

export interface InviteToken {
  id: string
  token: string
  email: string
  role: string
  display_name?: string
  expires_at: string
  created_by_email?: string
}

// Client-side auth functions
export async function getCurrentUser(): Promise<SimpleUser | null> {
  const supabase = createClient()
  
  // Get the current auth session
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.email) return null
  
  // Look up user in our simple table
  const { data: user, error } = await supabase
    .from('app_users')
    .select('*')
    .eq('email', session.user.email)
    .single()
  
  if (error || !user) return null
  
  return user as SimpleUser
}

// Create or update user after login
export async function upsertUser(email: string, displayName?: string, role?: string): Promise<SimpleUser | null> {
  const supabase = createClient()
  
  const userData = {
    email,
    display_name: displayName || email.split('@')[0],
    role: role || 'friend',
    last_login: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  
  const { data: user, error } = await supabase
    .from('app_users')
    .upsert(userData, { 
      onConflict: 'email',
      ignoreDuplicates: false 
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error upserting user:', error)
    return null
  }
  
  return user as SimpleUser
}

// Generate invite token
export async function generateInvite(
  email: string,
  role: 'admin' | 'family' | 'friend',
  displayName?: string,
  createdByEmail?: string
): Promise<string | null> {
  const supabase = createClient()
  
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36)
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 72) // 3 days
  
  const { error } = await supabase
    .from('invite_tokens')
    .insert({
      token,
      email,
      role,
      display_name: displayName,
      created_by_email: createdByEmail,
      expires_at: expiresAt.toISOString(),
    })
  
  if (error) {
    console.error('Error creating invite:', error)
    return null
  }
  
  return token
}

// Verify invite token
export async function verifyInviteToken(token: string): Promise<InviteToken | null> {
  const supabase = createClient()
  
  const { data: invite, error } = await supabase
    .from('invite_tokens')
    .select('*')
    .eq('token', token)
    .is('used_at', null) // Not used yet
    .single()
  
  if (error || !invite) return null
  
  // Check if expired
  if (new Date(invite.expires_at) < new Date()) return null
  
  return invite as InviteToken
}

// Mark invite as used
export async function useInviteToken(token: string): Promise<boolean> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('invite_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('token', token)
  
  return !error
}

// Simple permission checking
export function hasPermission(user: SimpleUser | null, permission: string): boolean {
  if (!user) return false
  
  switch (permission) {
    case 'admin':
      return user.role === 'admin'
    case 'family_plus':
      return user.role === 'admin' || user.role === 'family'
    case 'authenticated':
      return true // Any logged-in user
    default:
      return false
  }
}

// Server-side version for API routes
export async function getServerUser(email: string): Promise<SimpleUser | null> {
  const supabase = await createServerClient()
  
  const { data: user, error } = await supabase
    .from('app_users')
    .select('*')
    .eq('email', email)
    .single()
  
  if (error || !user) return null
  return user as SimpleUser
}