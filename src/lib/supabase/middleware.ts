import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from '@/lib/types/database'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Get user session
  const { data: { user }, error } = await supabase.auth.getUser()

  // Get user profile if authenticated
  let userProfile: any = null
  if (user && !error) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    userProfile = profile
  }

  const pathname = request.nextUrl.pathname

  // Define route protection rules
  const publicRoutes = ['/', '/login', '/join']
  const authRoutes = ['/login', '/join']
  const adminRoutes = ['/admin']
  const familyRoutes = ['/gallery/upload', '/help/manage']

  // Check if the current path is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith('/join/')
  )

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )


  // Check if the current path requires admin access
  const isAdminRoute = adminRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  // Check if the current path requires family+ access
  const isFamilyRoute = familyRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  // Handle unauthenticated users
  if (!user && !isPublicRoute) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Handle authenticated users on auth routes
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Handle role-based access control
  if (user && userProfile) {
    // Admin route protection
    if (isAdminRoute && userProfile.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Family+ route protection
    if (isFamilyRoute && !['admin', 'family'].includes(userProfile.role)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Add user info to headers for use in components
    response.headers.set('x-user-id', user.id)
    response.headers.set('x-user-role', userProfile.role)
    response.headers.set('x-user-name', userProfile.display_name)
  }

  return response
}