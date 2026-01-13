'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { getCurrentUser } from '@/lib/backend/auth/auth'
import { supabase } from '@/lib/backend/supabaseClient'

export default function ConnectStripe() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkIfAlreadyConnected()
  }, [])

  async function checkIfAlreadyConnected() {
    try {
      const user = await getCurrentUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: stripeAccount, error } = await supabase
        .from('stripe_accounts')
        .select('stripe_account_id')
        .eq('user_id', user.id)
        .single()

      if (stripeAccount && !error) {
        router.push('/dashboard')
        return
      }

      setLoading(false)
    } catch (error) {
      console.error('Failed to check Stripe connection:', error)
      setLoading(false)
    }
  }

  const initiateStripeConnect = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const clientId = process.env.NEXT_PUBLIC_STRIPE_CLIENT_ID
      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/connect`
      const state = user.id
    
      const authUrl = new URL('https://connect.stripe.com/oauth/authorize')
      authUrl.searchParams.append('response_type', 'code')
      authUrl.searchParams.append('client_id', clientId!)
      authUrl.searchParams.append('scope', 'read_write')
      authUrl.searchParams.append('redirect_uri', redirectUri)
      authUrl.searchParams.append('state', state)
      authUrl.searchParams.append('stripe_user[email]', user.email!)
    
      window.location.href = authUrl.toString()
    } catch (error) {
      console.error('Failed to initiate Stripe Connect:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-2 text-slate-600">Checking...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Connect your Stripe account
        </h1>

        <p className="mt-3 text-slate-600 leading-relaxed">
          Mend needs read-only access to detect failed payments and recover revenue
          on your behalf.
        </p>

        <div className="mt-6">
          <Button size="lg" className="w-full" onClick={initiateStripeConnect}>
            Connect Stripe
          </Button>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          We never create charges or modify customers.
          Disconnect anytime.
        </p>
        
        {/* Optional: Keep test button for development only */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 pt-4 border-t">
            <Button 
              variant="outline" 
              size="sm"
              onClick={async () => {
                try {
                  const user = await getCurrentUser()
                  if (!user) {
                    router.push('/login')
                    return
                  }

                  const mockStripeAccount = {
                    user_id: user.id,
                    stripe_account_id: 'acct_mock_' + user.id,
                    account_details: {
                      id: 'acct_mock',
                      object: 'account',
                      business_profile: {
                        name: 'Mock Business',
                        support_email: user.email
                      }
                    },
                    updated_at: new Date().toISOString()
                  }

                  const { error } = await supabase
                    .from('stripe_accounts')
                    .upsert(mockStripeAccount, {
                      onConflict: 'user_id'
                    })

                  if (error) {
                    console.error('Failed to create mock Stripe account:', error)
                    return
                  }

                  router.push('/dashboard?connected=true')
                } catch (error) {
                  console.error('Test connect error:', error)
                }
              }}
            >
              Test Connect (Dev Only)
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}