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
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/connect-stripe?error=${error}`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/connect-stripe?error=missing_params`)
  }

  try {
    // Exchange code for Stripe account ID
    const response = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code
    })

    const stripeAccountId = response.stripe_user_id

    if (!stripeAccountId) {
      throw new Error('No Stripe account ID returned')
    }

    // Get account details
    const account = await stripe.accounts.retrieve(stripeAccountId)
    
    // Store Stripe account in Supabase
    const { error: dbError } = await supabase
      .from('stripe_accounts')
      .upsert({
        user_id: state,
        stripe_account_id: stripeAccountId,
        account_details: account, // Store full account details
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (dbError) {
      console.error('Failed to store Stripe account:', dbError)
      throw dbError
    }

    // Set up webhook for this account (you might need to do this via Stripe dashboard instead)
    // But for MVP, we can use the platform webhook

    // Redirect to success page or dashboard
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?connected=true`)

  } catch (error) {
    console.error('Stripe Connect callback error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/connect-stripe?error=connection_failed`)
  }
}