// app/api/stripe/connect/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/backend/supabaseClient'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state') // user ID
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  if (error) {
    console.error('Stripe Connect error:', error, errorDescription)
    // FIX: Clean up the base URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '') || ''
    return NextResponse.redirect(`${baseUrl}/connect-stripe?error=${error}`)
  }

  if (!code || !state) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '') || ''
    return NextResponse.redirect(`${baseUrl}/connect-stripe?error=missing_params`)
  }

  try {
    // ... existing code ...

    // Redirect to success page or dashboard
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '') || ''
    return NextResponse.redirect(`${baseUrl}/dashboard?connected=true`)

  } catch (error) {
    console.error('Stripe Connect callback error:', error)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '') || ''
    return NextResponse.redirect(`${baseUrl}/connect-stripe?error=connection_failed`)
  }
}
