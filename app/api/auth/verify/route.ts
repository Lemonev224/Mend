// app/api/auth/verify/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/backend/supabaseClient'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const type = searchParams.get('type')
    const redirectTo = searchParams.get('redirect_to') || '/reset-password'
    
    if (!token || type !== 'recovery') {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }
    
    // Set session with the token
    const { error } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: ''
    })
    
    if (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }
    
    // Redirect to reset-password page
    const response = NextResponse.redirect(new URL(redirectTo, request.url))
    return response
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}