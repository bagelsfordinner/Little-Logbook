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

export interface AuthError {
  message: string
  status?: number
}