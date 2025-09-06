// New simplified auth system with invite codes
import { createClient } from '@/lib/supabase/client'
import { UserRole } from '@/lib/types/database'

export interface Profile {
  id: string
  email: string
  display_name: string
  role: UserRole
  invited_with_code?: string | null
  avatar_url?: string | null
  created_at: string
  updated_at: string
}

export interface InviteCode {
  id: string
  code: string
  role: UserRole
  is_active: boolean
  max_uses?: number | null
  current_uses: number
  expires_at?: string | null
  created_by?: string | null
  created_at: string
  updated_at: string
}

// Validate invite code before signup
export async function validateInviteCode(code: string): Promise<{ valid: boolean; role?: UserRole; error?: string }> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase.rpc('validate_role_code', { code_input: code })
    
    if (error) {
      console.error('Error validating code:', error)
      return { valid: false, error: 'Failed to validate code' }
    }
    
    if (!data || data.length === 0) {
      return { valid: false, error: 'Invalid or expired invite code' }
    }
    
    return { valid: true, role: data[0].role_result }
  } catch (error) {
    console.error('Validate code error:', error)
    return { valid: false, error: 'Failed to validate code' }
  }
}

// Sign up with email/password and invite code
export async function signUpWithInvite(
  email: string,
  password: string,
  displayName: string,
  inviteCode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // First validate the invite code
    const codeValidation = await validateInviteCode(inviteCode)
    if (!codeValidation.valid) {
      return { success: false, error: codeValidation.error }
    }

    const supabase = createClient()
    
    // Create the user with metadata
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          role: codeValidation.role,
          invite_code: inviteCode,
        },
      },
    })

    if (error) {
      console.error('Signup error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('SignUp error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Simple sign in
export async function signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('SignIn error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('SignIn error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Sign out
export async function signOut(): Promise<void> {
  const supabase = createClient()
  await supabase.auth.signOut()
}

// Get current user profile (client-side)
export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const supabase = createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return null

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) return null
    
    return profile as Profile
  } catch (error) {
    console.error('Error getting profile:', error)
    return null
  }
}


// Check permissions
export function hasPermission(profile: Profile | null, permission: 'admin' | 'family_plus' | 'authenticated'): boolean {
  if (!profile) return false
  
  switch (permission) {
    case 'admin':
      return profile.role === 'admin'
    case 'family_plus':
      return profile.role === 'admin' || profile.role === 'family'
    case 'authenticated':
      return true
    default:
      return false
  }
}

// Admin functions for managing invite codes
export async function createInviteCode(
  code: string,
  role: UserRole,
  maxUses?: number,
  expiresAt?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('invite_codes')
      .insert({
        code,
        role,
        max_uses: maxUses || null,
        expires_at: expiresAt || null,
        is_active: true,
      })

    if (error) {
      console.error('Error creating invite code:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Create invite code error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getInviteCodes(): Promise<InviteCode[]> {
  try {
    const supabase = createClient()
    
    const { data: codes, error } = await supabase
      .from('invite_codes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error getting invite codes:', error)
      return []
    }

    return codes as InviteCode[]
  } catch (error) {
    console.error('Get invite codes error:', error)
    return []
  }
}

export async function toggleInviteCode(id: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('invite_codes')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('Error toggling invite code:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Toggle invite code error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}