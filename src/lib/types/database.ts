export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'family' | 'friend'
export type MediaType = 'image' | 'video' | 'audio'
export type HelpItemType = 'task' | 'counter' | 'registry_link' | 'necessity'
export type VaultRecipient = 'parents' | 'baby' | 'family'
export type VaultEntryType = 'letter' | 'photo' | 'recommendation' | 'memory'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: UserRole
          display_name: string
          avatar_url: string | null
          invite_token: string | null
          invited_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: UserRole
          display_name: string
          avatar_url?: string | null
          invite_token?: string | null
          invited_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: UserRole
          display_name?: string
          avatar_url?: string | null
          invite_token?: string | null
          invited_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      timelines: {
        Row: {
          id: string
          title: string
          description: string | null
          sort_order: number
          is_active: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          sort_order?: number
          is_active?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          sort_order?: number
          is_active?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      timeline_events: {
        Row: {
          id: string
          title: string
          event_date: string
          description: string | null
          timeline_id: string | null
          sort_order: number
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          event_date: string
          description?: string | null
          timeline_id?: string | null
          sort_order?: number
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          event_date?: string
          description?: string | null
          timeline_id?: string | null
          sort_order?: number
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      media: {
        Row: {
          id: string
          url: string
          thumbnail_url: string | null
          caption: string | null
          media_type: MediaType
          file_name: string
          file_size: number | null
          mime_type: string | null
          width: number | null
          height: number | null
          timeline_event_id: string | null
          age_tag: string | null
          tags: string[] | null
          upload_date: string
          uploaded_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          url: string
          thumbnail_url?: string | null
          caption?: string | null
          media_type?: MediaType
          file_name: string
          file_size?: number | null
          mime_type?: string | null
          width?: number | null
          height?: number | null
          timeline_event_id?: string | null
          age_tag?: string | null
          tags?: string[] | null
          upload_date?: string
          uploaded_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          url?: string
          thumbnail_url?: string | null
          caption?: string | null
          media_type?: MediaType
          file_name?: string
          file_size?: number | null
          mime_type?: string | null
          width?: number | null
          height?: number | null
          timeline_event_id?: string | null
          age_tag?: string | null
          tags?: string[] | null
          upload_date?: string
          uploaded_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      stories: {
        Row: {
          id: string
          title: string | null
          content: string
          timeline_event_id: string | null
          age_tag: string | null
          story_date: string | null
          tags: string[] | null
          author_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title?: string | null
          content: string
          timeline_event_id?: string | null
          age_tag?: string | null
          story_date?: string | null
          tags?: string[] | null
          author_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string | null
          content?: string
          timeline_event_id?: string | null
          age_tag?: string | null
          story_date?: string | null
          tags?: string[] | null
          author_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      help_items: {
        Row: {
          id: string
          title: string
          description: string | null
          type: HelpItemType
          category: string | null
          target_count: number | null
          current_count: number
          completed: boolean
          completed_by: string | null
          completed_at: string | null
          external_url: string | null
          priority: number
          due_date: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          type: HelpItemType
          category?: string | null
          target_count?: number | null
          current_count?: number
          completed?: boolean
          completed_by?: string | null
          completed_at?: string | null
          external_url?: string | null
          priority?: number
          due_date?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          type?: HelpItemType
          category?: string | null
          target_count?: number | null
          current_count?: number
          completed?: boolean
          completed_by?: string | null
          completed_at?: string | null
          external_url?: string | null
          priority?: number
          due_date?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      help_interactions: {
        Row: {
          id: string
          help_item_id: string | null
          user_id: string
          action: string
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          help_item_id?: string | null
          user_id: string
          action: string
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          help_item_id?: string | null
          user_id?: string
          action?: string
          note?: string | null
          created_at?: string
        }
      }
      vault_entries: {
        Row: {
          id: string
          title: string | null
          content: string
          media_urls: string[] | null
          recipient: VaultRecipient
          entry_type: VaultEntryType
          category: string | null
          prompt_answered: string | null
          tags: string[] | null
          author_id: string
          is_private: boolean
          reveal_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title?: string | null
          content: string
          media_urls?: string[] | null
          recipient: VaultRecipient
          entry_type: VaultEntryType
          category?: string | null
          prompt_answered?: string | null
          tags?: string[] | null
          author_id: string
          is_private?: boolean
          reveal_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string | null
          content?: string
          media_urls?: string[] | null
          recipient?: VaultRecipient
          entry_type?: VaultEntryType
          category?: string | null
          prompt_answered?: string | null
          tags?: string[] | null
          author_id?: string
          is_private?: boolean
          reveal_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          content: string
          media_id: string | null
          story_id: string | null
          vault_entry_id: string | null
          author_id: string
          parent_comment_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content: string
          media_id?: string | null
          story_id?: string | null
          vault_entry_id?: string | null
          author_id: string
          parent_comment_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content?: string
          media_id?: string | null
          story_id?: string | null
          vault_entry_id?: string | null
          author_id?: string
          parent_comment_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      announcements: {
        Row: {
          id: string
          title: string
          content: string
          priority: number
          is_active: boolean
          expires_at: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          priority?: number
          is_active?: boolean
          expires_at?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          priority?: number
          is_active?: boolean
          expires_at?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      faqs: {
        Row: {
          id: string
          question: string
          answer: string
          category: string | null
          sort_order: number
          is_active: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          question: string
          answer: string
          category?: string | null
          sort_order?: number
          is_active?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question?: string
          answer?: string
          category?: string | null
          sort_order?: number
          is_active?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      activity_log: {
        Row: {
          id: string
          user_id: string
          action: string
          resource_type: string | null
          resource_id: string | null
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          resource_type?: string | null
          resource_id?: string | null
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          resource_type?: string | null
          resource_id?: string | null
          details?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: {
          user_id: string
        }
        Returns: UserRole
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      is_family_or_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      log_user_activity: {
        Args: {
          p_user_id: string
          p_action: string
          p_resource_type?: string
          p_resource_id?: string
          p_details?: Json
        }
        Returns: void
      }
    }
    Enums: {
      user_role: UserRole
      media_type: MediaType
      help_item_type: HelpItemType
      vault_recipient: VaultRecipient
      vault_entry_type: VaultEntryType
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}