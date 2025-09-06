import { createClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { UserRole } from '@/lib/types/database'
import { Profile } from '@/lib/types/auth'

/**
 * Get user profile from server components
 */
export async function getServerProfile(): Promise<Profile | null> {
  try {
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
  } catch (error) {
    console.error('Error getting server profile:', error)
    return null
  }
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