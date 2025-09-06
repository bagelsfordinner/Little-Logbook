import { createClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { UserRole } from '@/lib/types/database'
import { 
  CreateInviteParams, 
  InviteTokenData,
  MagicLinkData,
  Profile 
} from '@/lib/types/auth'
import { AUTH_CONFIG } from './config'
import { v4 as uuidv4 } from 'uuid'

/**
 * Generate a secure invite token with role and expiration
 */
export async function generateInviteToken(params: CreateInviteParams): Promise<string> {
  const supabase = createClient()
  
  const token = uuidv4()
  
  // Store token data securely (you might want to encrypt this)  
  const { error } = await (supabase as any)
    .from('profiles')
    .update({ invite_token: token })
    .eq('id', 'temp') // This will be handled differently in actual implementation
  
  if (error) {
    throw new Error(`Failed to generate invite token: ${error.message}`)
  }
  
  return token
}

/**
 * Verify an invite token and return the associated data
 */
export async function verifyInviteToken(token: string): Promise<InviteTokenData | null> {
  if (!token) return null
  
  const supabase = createClient()
  
  // In a real implementation, you'd decode/decrypt the token
  // For now, we'll query the profiles table
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('invite_token', token)
    .single()
  
  if (error || !data) {
    return null
  }
  
  const profile = data as any
  
  // Check if token is expired (implement based on your token structure)  
  const expiresAt = new Date(profile.created_at)
  expiresAt.setHours(expiresAt.getHours() + AUTH_CONFIG.inviteToken.defaultExpirationHours)
  
  if (expiresAt < new Date()) {
    return null
  }
  
  return {
    role: profile.role,
    display_name: profile.display_name,
    invited_by: profile.invited_by || '',
    expires_at: expiresAt.toISOString(),
  }
}

/**
 * Send magic link with invite data
 */
export async function sendMagicLink(email: string, inviteData: MagicLinkData): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${AUTH_CONFIG.magicLink.redirectTo}?role=${inviteData.role}`,
      data: {
        display_name: inviteData.display_name,
        role: inviteData.role,
        invited_by: inviteData.invited_by,
      },
    },
  })
  
  if (error) {
    throw new Error(`Failed to send magic link: ${error.message}`)
  }
}

/**
 * Get user profile from server components
 */
export async function getServerProfile(): Promise<Profile | null> {
  const supabase = await createServerClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return null
  }
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (profileError || !profile) {
    return null
  }
  
  return profile
}

/**
 * Get user profile from client components
 */
export async function getClientProfile(): Promise<Profile | null> {
  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return null
  }
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (profileError || !profile) {
    return null
  }
  
  return profile
}

/**
 * Update user profile
 */
export async function updateProfile(updates: Partial<Profile>): Promise<Profile> {
  const supabase = createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    throw new Error('User not authenticated')
  }
  
  const { data: profile, error } = await (supabase as any)
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to update profile: ${error.message}`)
  }
  
  return profile
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(userId: string, newRole: UserRole): Promise<void> {
  const supabase = createClient()
  
  // Verify current user is admin
  const currentProfile = await getClientProfile()
  if (!currentProfile || currentProfile.role !== 'admin') {
    throw new Error('Insufficient permissions')
  }
  
  const { error } = await (supabase as any)
    .from('profiles')
    .update({ 
      role: newRole,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
  
  if (error) {
    throw new Error(`Failed to update user role: ${error.message}`)
  }
}

/**
 * Sign out user
 */
export async function signOut(): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw new Error(`Failed to sign out: ${error.message}`)
  }
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers(): Promise<Profile[]> {
  const supabase = createClient()
  
  // Verify current user is admin
  const currentProfile = await getClientProfile()
  if (!currentProfile || currentProfile.role !== 'admin') {
    throw new Error('Insufficient permissions')
  }
  
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`)
  }
  
  return profiles || []
}

/**
 * Delete user (admin only)
 */
export async function deleteUser(userId: string): Promise<void> {
  const supabase = createClient()
  
  // Verify current user is admin
  const currentProfile = await getClientProfile()
  if (!currentProfile || currentProfile.role !== 'admin') {
    throw new Error('Insufficient permissions')
  }
  
  // Don't allow deleting yourself
  if (currentProfile.id === userId) {
    throw new Error('Cannot delete your own account')
  }
  
  // Delete from auth.users (this will cascade to profiles due to foreign key)
  const { error } = await supabase.auth.admin.deleteUser(userId)
  
  if (error) {
    throw new Error(`Failed to delete user: ${error.message}`)
  }
}

/**
 * Generate magic link URL for invites
 */
export function generateMagicLinkUrl(token: string, role: UserRole): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/join/${role}/${token}`
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Generate display name from email
 */
export function generateDisplayNameFromEmail(email: string): string {
  const name = email.split('@')[0]
  return name
    .split(/[._-]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

/**
 * Log user activity
 */
export async function logActivity(
  action: string,
  resourceType?: string,
  resourceId?: string,
  details?: Record<string, any>
): Promise<void> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  
  const { error } = await supabase.rpc('log_user_activity', {
    p_user_id: user.id,
    p_action: action,
    p_resource_type: resourceType,
    p_resource_id: resourceId,
    p_details: details,
  } as any)
  
  if (error) {
    console.error('Failed to log activity:', error)
  }
}