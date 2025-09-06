import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { upsertUser, verifyInviteToken, useInviteToken } from '@/lib/auth/simple-auth'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const inviteToken = requestUrl.searchParams.get('invite_token')

  if (code) {
    const supabase = await createClient()
    
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_error`)
    }

    // Get the user email from the session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user?.email) {
      return NextResponse.redirect(`${requestUrl.origin}/login?error=user_error`)
    }

    console.log('User logged in:', user.email)

    // If there's an invite token, use it to set the role
    let role = 'friend'
    let displayName = user.email.split('@')[0]

    if (inviteToken) {
      const invite = await verifyInviteToken(inviteToken)
      if (invite) {
        role = invite.role
        displayName = invite.display_name || displayName
        await useInviteToken(inviteToken) // Mark as used
        console.log('Used invite token for role:', role)
      }
    }

    // Create/update user in our simple table
    try {
      await upsertUser(user.email, displayName, role)
      console.log('User upserted successfully')
    } catch (error) {
      console.error('Error upserting user:', error)
      return NextResponse.redirect(`${requestUrl.origin}/login?error=user_creation_failed`)
    }

    // Redirect to dashboard
    return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
  }

  // No code, redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}