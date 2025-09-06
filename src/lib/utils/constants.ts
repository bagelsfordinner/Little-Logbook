export const APP_NAME = 'Little Logbook'
export const APP_DESCRIPTION = 'A beautiful way to document your pregnancy and baby journey'

// File upload constraints
export const UPLOAD_CONSTRAINTS = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 20,
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  allowedVideoTypes: ['video/mp4', 'video/webm', 'video/mov'],
  allowedAudioTypes: ['audio/mp3', 'audio/wav', 'audio/ogg'],
  thumbnailSize: 400,
  imageQuality: 0.8,
} as const

// Pagination defaults
export const PAGINATION = {
  defaultPageSize: 20,
  maxPageSize: 100,
  galleryPageSize: 12,
  commentsPageSize: 10,
} as const

// Date formats
export const DATE_FORMATS = {
  display: 'MMM d, yyyy',
  displayWithTime: 'MMM d, yyyy h:mm a',
  input: 'yyyy-MM-dd',
  iso: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
} as const

// Age tags for organizing content
export const AGE_TAGS = [
  { value: 'pregnancy', label: 'Pregnancy' },
  { value: '0-3', label: '0-3 months' },
  { value: '3-6', label: '3-6 months' },
  { value: '6-12', label: '6-12 months' },
  { value: '12-18', label: '12-18 months' },
  { value: '18-24', label: '18-24 months' },
  { value: '2-3', label: '2-3 years' },
  { value: '3+', label: '3+ years' },
] as const

// Help item categories
export const HELP_CATEGORIES = [
  { value: 'meals', label: 'Meals & Food' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'building', label: 'Building & Setup' },
  { value: 'products', label: 'Products & Items' },
  { value: 'childcare', label: 'Childcare' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'errands', label: 'Errands' },
  { value: 'other', label: 'Other' },
] as const

// Vault entry categories
export const VAULT_CATEGORIES = {
  recommendation: [
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'movie', label: 'Movie/TV Show' },
    { value: 'book', label: 'Book' },
    { value: 'activity', label: 'Activity' },
    { value: 'product', label: 'Product' },
    { value: 'place', label: 'Place to Visit' },
    { value: 'experience', label: 'Experience' },
    { value: 'other', label: 'Other' },
  ],
  memory: [
    { value: 'milestone', label: 'Milestone' },
    { value: 'funny', label: 'Funny Moment' },
    { value: 'sweet', label: 'Sweet Moment' },
    { value: 'first', label: 'First Time' },
    { value: 'tradition', label: 'Family Tradition' },
    { value: 'other', label: 'Other' },
  ],
} as const

// Vault prompts to help users create entries
export const VAULT_PROMPTS = {
  letter: [
    'What hopes do you have for the baby?',
    'What advice would you give to the new parents?',
    'What family traditions would you like to share?',
    'What are you most excited about?',
    'What do you want the baby to know about you?',
  ],
  recommendation: [
    'What\'s your favorite family-friendly restaurant?',
    'What book/movie changed your perspective?',
    'What activity always makes you happy?',
    'What product made your life easier?',
    'What place holds special memories for you?',
  ],
  memory: [
    'Share a favorite memory from your childhood',
    'Tell us about a family tradition',
    'What\'s the funniest thing that ever happened to you?',
    'Describe a moment that made you proud',
    'What lesson did someone important teach you?',
  ],
} as const

// FAQ categories
export const FAQ_CATEGORIES = [
  { value: 'hospital', label: 'Hospital & Birth' },
  { value: 'visitation', label: 'Visitation' },
  { value: 'gifts', label: 'Gifts & Registry' },
  { value: 'website', label: 'Using This Website' },
  { value: 'general', label: 'General' },
] as const

// Timeline event types
export const EVENT_TYPES = [
  { value: 'appointment', label: 'Appointment', icon: '📅' },
  { value: 'milestone', label: 'Milestone', icon: '🎯' },
  { value: 'photo', label: 'Photo Session', icon: '📸' },
  { value: 'ultrasound', label: 'Ultrasound', icon: '🖼️' },
  { value: 'preparation', label: 'Preparation', icon: '🛠️' },
  { value: 'celebration', label: 'Celebration', icon: '🎉' },
  { value: 'other', label: 'Other', icon: '📝' },
] as const

// Notification settings
export const NOTIFICATIONS = {
  duration: {
    success: 5000,
    error: 8000,
    warning: 6000,
    info: 4000,
  },
  maxVisible: 5,
} as const

// Storage bucket names
export const STORAGE_BUCKETS = {
  media: 'media',
  avatars: 'avatars',
  vault: 'vault',
} as const

// Real-time event types
export const REALTIME_EVENTS = {
  mediaUploaded: 'media:uploaded',
  commentAdded: 'comment:added',
  helpItemUpdated: 'help:updated',
  vaultEntryCreated: 'vault:created',
  announcementCreated: 'announcement:created',
} as const

// Error messages
export const ERROR_MESSAGES = {
  auth: {
    invalidCredentials: 'Invalid email or password',
    userNotFound: 'User not found',
    emailAlreadyExists: 'An account with this email already exists',
    invalidToken: 'Invalid or expired invitation token',
    insufficientPermissions: 'You do not have permission to perform this action',
  },
  upload: {
    fileTooLarge: 'File size must be less than 10MB',
    invalidFileType: 'File type not supported',
    uploadFailed: 'Failed to upload file. Please try again.',
    tooManyFiles: 'Maximum 20 files allowed per upload',
  },
  general: {
    networkError: 'Network error. Please check your connection and try again.',
    serverError: 'Server error. Please try again later.',
    unknownError: 'An unexpected error occurred',
    required: 'This field is required',
    invalidEmail: 'Please enter a valid email address',
  },
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  auth: {
    inviteSent: 'Invitation sent successfully!',
    profileUpdated: 'Profile updated successfully!',
    passwordChanged: 'Password changed successfully!',
  },
  upload: {
    filesUploaded: 'Files uploaded successfully!',
    imageProcessed: 'Image processed successfully!',
  },
  general: {
    saved: 'Changes saved successfully!',
    deleted: 'Item deleted successfully!',
    created: 'Item created successfully!',
    updated: 'Item updated successfully!',
  },
} as const