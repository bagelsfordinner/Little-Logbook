import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_error`)
    }

    // Get user data from the session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.redirect(`${requestUrl.origin}/login?error=user_error`)
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // If no profile exists, create one using user metadata from the invite
    if (!existingProfile) {
      const userData = user.user_metadata || {}
      
      console.log('Creating profile for user:', user.id, user.email)
      console.log('User metadata:', userData)
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          role: (userData.role as any) || 'friend',
          display_name: userData.display_name || user.email?.split('@')[0] || 'User',
          invited_by: userData.invited_by || null,
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        console.error('Error details:', JSON.stringify(profileError, null, 2))
        return NextResponse.redirect(`${requestUrl.origin}/login?error=profile_error&details=${encodeURIComponent(profileError.message)}`)
      }
      
      console.log('Profile created successfully')
    } else {
      console.log('Profile already exists:', existingProfile)
    }

    // Redirect to dashboard
    return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
  }

  // No code, redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}