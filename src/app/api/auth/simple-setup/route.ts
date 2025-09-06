import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Simple setup that just creates a profile directly
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  try {
    const { email, setupKey } = await request.json()

    if (setupKey !== process.env.ADMIN_SETUP_KEY) {
      return NextResponse.json(
        { error: 'Invalid setup key' },
        { status: 403 }
      )
    }

    const supabase = await createClient()

    // First, check if this email already exists in auth.users
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.log('Cannot list users, will create profile manually')
      
      // If we can't list users, let's create a test UUID and profile
      // This is a fallback approach
      const testUserId = '00000000-0000-0000-0000-000000000001' // Fixed test UUID
      
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: testUserId,
          role: 'admin',
          display_name: email.split('@')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        return NextResponse.json(
          { error: `Profile error: ${profileError.message}` },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: `Test profile created for ${email}. You'll need to configure Supabase auth properly for full functionality.`,
        instructions: [
          '1. Go to Supabase Dashboard → Settings → API',
          '2. Make sure your Service Role Key is correct',
          '3. Go to Authentication → Settings',
          '4. Set Site URL to: http://localhost:3000',
          '5. Add Redirect URL: http://localhost:3000/api/auth/callback',
          '6. Configure SMTP settings for email sending'
        ]
      })
    }

    // If we can list users, proceed normally
    const existingUser = users.find(u => u.email === email)
    
    if (existingUser) {
      // User exists, just update their profile to admin
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: existingUser.id,
          role: 'admin',
          display_name: email.split('@')[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

      if (profileError) {
        return NextResponse.json(
          { error: `Profile error: ${profileError.message}` },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: `Updated existing user ${email} to admin`,
      })
    } else {
      return NextResponse.json({
        success: true,
        message: `User ${email} not found. Please sign up first using the regular login, then run this setup.`,
        instructions: [
          '1. Go to /login and try to sign in with your email',
          '2. This will create your auth user (even if email fails)',
          '3. Then come back here to make yourself admin'
        ]
      })
    }

  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}