import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// This is a one-time setup endpoint to make the first user an admin
export async function POST(request: NextRequest) {
  try {
    const { email, setupKey } = await request.json()

    // Simple protection - you can change this key
    if (setupKey !== process.env.ADMIN_SETUP_KEY) {
      return NextResponse.json(
        { error: 'Invalid setup key' },
        { status: 403 }
      )
    }

    const supabase = await createClient()

    // Find user by email in auth.users
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      return NextResponse.json(
        { error: 'Failed to list users' },
        { status: 500 }
      )
    }

    const user = users.find(u => u.email === email)
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Make sure they have signed up first.' },
        { status: 404 }
      )
    }

    // Update their profile to admin
    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        role: 'admin',
        display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'Admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update profile: ${updateError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Successfully made ${email} an admin!`,
    })

  } catch (error) {
    console.error('Admin setup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}