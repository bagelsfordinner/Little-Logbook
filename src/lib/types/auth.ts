import { User } from '@supabase/supabase-js'
import { UserRole } from './database'

export type AuthUser = User & {
  user_metadata?: {
    display_name?: string
    avatar_url?: string
  }
}

export interface Profile {
  id: string
  role: UserRole
  display_name: string
  avatar_url: string | null
  invite_token: string | null
  invited_by: string | null
  created_at: string
  updated_at: string
}

export interface AuthContextType {
  user: AuthUser | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export interface MagicLinkData {
  email: string
  role: UserRole
  display_name: string
  invited_by: string
}

export interface InviteTokenData {
  role: UserRole
  display_name: string
  invited_by: string
  expires_at: string
}

export interface AuthError {
  message: string
  status?: number
}

export interface SignInWithMagicLinkParams {
  email: string
  options?: {
    emailRedirectTo?: string
    data?: Record<string, any>
  }
}

export interface VerifyTokenParams {
  token: string
  role: UserRole
}

export interface CreateInviteParams {
  role: UserRole
  display_name: string
  expires_in_hours?: number
}