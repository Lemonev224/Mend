import { NextResponse } from 'next/server'
import { supabase } from '@/lib/backend/supabaseClient'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    })

    if (error) {
      console.error('Failed to resend confirmation:', error)
      return NextResponse.json({ 
        error: 'Failed to resend confirmation email',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Confirmation email sent!' 
    })
  } catch (error: any) {
    console.error('Resend confirmation error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}