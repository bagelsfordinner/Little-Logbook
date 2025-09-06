import { UserRole } from '@/lib/types/database'

export const AUTH_CONFIG = {
  // Authentication settings
  auth: {
    // Redirect after successful login
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  },
  
  // Role-based access control
  rolePermissions: {
    admin: {
      canCreate: ['timeline', 'event', 'media', 'story', 'help_item', 'vault_entry', 'announcement', 'faq'] as string[],
      canEdit: ['all'] as string[],
      canDelete: ['all'] as string[],
      canInvite: ['admin', 'family', 'friend'] as string[],
      canManageUsers: true,
      canModerateContent: true,
    },
    family: {
      canCreate: ['event', 'media', 'story', 'help_item', 'vault_entry', 'comment'] as string[],
      canEdit: ['own'] as string[],
      canDelete: ['own'] as string[],
      canInvite: [] as string[],
      canManageUsers: false,
      canModerateContent: false,
    },
    friend: {
      canCreate: ['vault_entry', 'comment'] as string[],
      canEdit: ['own'] as string[],
      canDelete: ['own'] as string[],
      canInvite: [] as string[],
      canManageUsers: false,
      canModerateContent: false,
    },
  },
  
  // Protected routes configuration
  protectedRoutes: [
    '/dashboard',
    '/gallery',
    '/help',
    '/vault',
    '/faq',
    '/admin',
  ],
  
  // Admin-only routes
  adminRoutes: [
    '/admin',
    '/admin/users',
    '/admin/timelines',
    '/admin/content',
  ],
  
  // Family+ routes (family and admin)
  familyRoutes: [
    '/gallery/upload',
    '/help/manage',
  ],
  
  // Public routes (no auth required)
  publicRoutes: [
    '/login',
    '/signup',
    '/',
  ],
} as const

export type Permission = keyof typeof AUTH_CONFIG.rolePermissions.admin

export function hasPermission(
  userRole: UserRole | null,
  permission: Permission,
  resourceType?: string,
  isOwner?: boolean
): boolean {
  if (!userRole) return false
  
  const rolePerms = AUTH_CONFIG.rolePermissions[userRole]
  if (!rolePerms) return false
  
  switch (permission) {
    case 'canCreate':
      return resourceType ? rolePerms.canCreate.includes(resourceType) : false
    
    case 'canEdit':
      if (rolePerms.canEdit.includes('all')) return true
      if (rolePerms.canEdit.includes('own') && isOwner) return true
      return false
    
    case 'canDelete':
      if (rolePerms.canDelete.includes('all')) return true
      if (rolePerms.canDelete.includes('own') && isOwner) return true
      return false
    
    case 'canInvite':
    case 'canManageUsers':
    case 'canModerateContent':
      return rolePerms[permission] as boolean
    
    default:
      return false
  }
}

export function canAccessRoute(userRole: UserRole | null, pathname: string): boolean {
  // Public routes are always accessible
  if (AUTH_CONFIG.publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return true
  }
  
  // No auth = no access to protected routes
  if (!userRole) return false
  
  // Admin can access everything
  if (userRole === 'admin') return true
  
  // Check admin-only routes
  if (AUTH_CONFIG.adminRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return false
  }
  
  // Check family+ routes
  if (AUTH_CONFIG.familyRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return userRole === 'family'
  }
  
  // Check protected routes
  if (AUTH_CONFIG.protectedRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return true // Any authenticated user can access
  }
  
  return false
}

export function getRedirectPath(userRole: UserRole | null): string {
  if (!userRole) return '/login'
  return '/dashboard'
}

export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'admin':
      return 'Administrator'
    case 'family':
      return 'Family Member'
    case 'friend':
      return 'Friend'
    default:
      return 'Unknown'
  }
}

export function getRoleColor(role: UserRole): string {
  switch (role) {
    case 'admin':
      return 'var(--color-accent-pink-500)'
    case 'family':
      return 'var(--color-primary-500)'
    case 'friend':
      return 'var(--color-secondary-500)'
    default:
      return 'var(--color-neutral-500)'
  }
}