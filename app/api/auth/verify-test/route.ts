import { NextResponse } from 'next/server'
// 1. Add this import to fix "Cannot find name 'createClient'"
import { createClient } from '@supabase/supabase-js' 
import { supabase } from '@/lib/backend/supabaseClient'

export async function POST(request: Request) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ 
      error: 'This endpoint is only available in development mode' 
    }, { status: 403 })
  }

  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    console.log('DEV: Auto-verifying email for:', email)

    // 2. createClient is now available via the import above
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! 
    )

    // Get user by email
    const { data: users, error: userError } = await adminSupabase.auth.admin.listUsers()
    
    if (userError) {
      console.error('Error listing users:', userError)
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    // 3. Add : any (or the specific User type) to fix the implicit 'any' error
    const user = users.users.find((u: any) => u.email === email)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Confirm the user
    const { error: confirmError } = await adminSupabase.auth.admin.updateUserById(
      user.id,
      { email_confirm: true }
    )

    if (confirmError) {
      console.error('Error confirming user:', confirmError)
      return NextResponse.json({ error: confirmError.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Email verified successfully (DEV ONLY)'
    })

  } catch (error: any) {
    console.error('DEV verification error:', error)
    return NextResponse.json({ 
      error: 'Failed to verify email',
      details: error.message 
    }, { status: 500 })
  }
}