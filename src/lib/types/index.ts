// Re-export database types
export * from './database'
export * from './auth'

// Common UI types
export interface LoadingState {
  loading: boolean
  error: string | null
}

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  success: boolean
}

// Form types
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'file' | 'date' | 'number'
  required?: boolean
  placeholder?: string
  options?: Array<{ value: string; label: string }>
  validation?: Record<string, any>
}

// Media upload types
export interface MediaUploadProgress {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'complete' | 'error'
  error?: string
  url?: string
}

export interface MediaUploadOptions {
  maxFileSize?: number // in bytes
  allowedTypes?: string[]
  generateThumbnail?: boolean
  quality?: number // 0-1 for image compression
}

// Timeline types
export interface TimelineWithEvents {
  id: string
  title: string
  description: string | null
  sort_order: number
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
  events: TimelineEventWithMedia[]
}

export interface TimelineEventWithMedia {
  id: string
  title: string
  event_date: string
  description: string | null
  timeline_id: string | null
  sort_order: number
  created_by: string
  created_at: string
  updated_at: string
  media: MediaWithComments[]
  stories: StoryWithComments[]
}

export interface MediaWithComments {
  id: string
  url: string
  thumbnail_url: string | null
  caption: string | null
  media_type: 'image' | 'video' | 'audio'
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
  comments: CommentWithAuthor[]
  author: {
    id: string
    display_name: string
    avatar_url: string | null
  }
}

export interface StoryWithComments {
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
  comments: CommentWithAuthor[]
  author: {
    id: string
    display_name: string
    avatar_url: string | null
  }
}

export interface CommentWithAuthor {
  id: string
  content: string
  media_id: string | null
  story_id: string | null
  vault_entry_id: string | null
  author_id: string
  parent_comment_id: string | null
  created_at: string
  updated_at: string
  author: {
    id: string
    display_name: string
    avatar_url: string | null
  }
  replies?: CommentWithAuthor[]
}

// Help system types
export interface HelpItemWithInteractions {
  id: string
  title: string
  description: string | null
  type: 'task' | 'counter' | 'registry_link' | 'necessity'
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
  interactions: Array<{
    id: string
    user_id: string
    action: string
    note: string | null
    created_at: string
    user: {
      display_name: string
      avatar_url: string | null
    }
  }>
}

// Vault system types
export interface VaultEntryWithAuthor {
  id: string
  title: string | null
  content: string
  media_urls: string[] | null
  recipient: 'parents' | 'baby' | 'family'
  entry_type: 'letter' | 'photo' | 'recommendation' | 'memory'
  category: string | null
  prompt_answered: string | null
  tags: string[] | null
  author_id: string
  is_private: boolean
  reveal_date: string | null
  created_at: string
  updated_at: string
  author: {
    id: string
    display_name: string
    avatar_url: string | null
  }
  comments: CommentWithAuthor[]
}

// Navigation types
export interface NavItem {
  label: string
  href: string
  icon?: string
  requiredRole?: 'admin' | 'family' | 'friend'
  children?: NavItem[]
}

// Filter and sort types
export interface FilterOptions {
  search?: string
  mediaType?: 'image' | 'video' | 'audio' | 'all'
  ageTag?: string
  author?: string
  dateRange?: {
    start: string
    end: string
  }
  tags?: string[]
}

export interface SortOption {
  field: string
  direction: 'asc' | 'desc'
  label: string
}

// Notification types
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// Analytics types
export interface ActivityStats {
  totalUploads: number
  totalStories: number
  totalComments: number
  totalVaultEntries: number
  recentActivity: Array<{
    action: string
    resource_type: string
    created_at: string
    user: {
      display_name: string
    }
  }>
}

// Error handling
export interface AppError extends Error {
  code?: string
  status?: number
  details?: Record<string, any>
}