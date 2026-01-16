'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/backend/supabaseClient'
import { getCurrentUser } from '@/lib/backend/auth/auth'
import { MetricCard } from '@/components/ui/MetricCard'
import DashboardHeader from './components/DashboardHeader'
import RevenueStat from './components/RevenueStat'
import TrustPanel from './components/TrustPanle'
import WebhookMonitor from './components/WebhookMonitor'

interface RecoveryRecord {
  id: string;
  stripe_customer_id: string;
  stripe_invoice_id: string;
  stripe_account_id: string;
  amount_due: number;
  customer_email: string;
  customer_name: string;
  message_sent: string;
  status: string;
  recovered_at: string | null;
  created_at: string;
}

interface CommissionRecord {
  id: string;
  amount_recovered: number;
  commission_amount: number;
  commission_percentage: number;
  status: string;
  period_start: string;
  period_end: string;
  stripe_invoice_id: string | null;
  paid_at: string | null;
}

export default function DashboardPage() {
  const router = useRouter()

useEffect(() => {
  const checkForReset = async () => {
    // Only run on client side
    if (typeof window === 'undefined') return
    
    console.log('🔍 Dashboard reset check running...')
    
    // Check if we should redirect to reset-password
    const resetFlag = localStorage.getItem('force_password_reset')
    const { data: { session } } = await supabase.auth.getSession()
    
    console.log('Dashboard reset check:', { 
      resetFlag, 
      hasSession: !!session,
      // Use last_sign_in_at from the user object instead of created_at on the session
      lastSignIn: session?.user?.last_sign_in_at 
    })
    
    if (resetFlag === 'true' && session?.user?.last_sign_in_at) {
      // Calculate age based on the last time the user signed in
      const lastSignInTime = new Date(session.user.last_sign_in_at).getTime()
      const sessionAge = Date.now() - lastSignInTime
      const isFreshSession = sessionAge < 300000 // 5 minutes
      
      console.log('Session age (ms):', sessionAge, 'Fresh?', isFreshSession)
      
      if (isFreshSession) {
        console.log('✅ Redirecting to password reset - fresh session detected')
        localStorage.removeItem('force_password_reset')
        router.push('/reset-password')
        return 
      } else {
        console.log('❌ Session too old, clearing flag')
        localStorage.removeItem('force_password_reset')
      }
    } else if (resetFlag === 'true' && !session) {
       console.log('❌ Reset flag present but no active session found')
    }
  }
  
  checkForReset()
}, [router])

  const [stats, setStats] = useState({
    recoveredThisMonth: 0,
    recoveryRate: 0,
    pendingRecoveries: 0,
    totalRecovered: 0,
    mendCommission: 0,
    commissionOwed: 0,
    commissionPaid: 0
  })
  const [recentRecoveries, setRecentRecoveries] = useState<RecoveryRecord[]>([])
  const [commissions, setCommissions] = useState<CommissionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [hasStripeAccount, setHasStripeAccount] = useState<boolean | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    try {
      setLoading(true)
      
      // Check authentication
      const user = await getCurrentUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Check if user has Stripe account
      const { data: stripeAccount, error: stripeError } = await supabase
        .from('stripe_accounts')
        .select('stripe_account_id')
        .eq('user_id', user.id)
        .single()

      setHasStripeAccount(!!stripeAccount && !stripeError)
      
      if (!stripeAccount || stripeError) {
        setLoading(false)
        return // Will show connect stripe prompt
      }

      const stripeAccountId = stripeAccount.stripe_account_id
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      // Get ALL recoveries for this account
      const { data: allRecoveries, error: recoveriesError } = await supabase
        .from('recoveries')
        .select('*')
        .eq('stripe_account_id', stripeAccountId)
        .order('created_at', { ascending: false })

      if (recoveriesError) {
        console.error("Error fetching recoveries:", recoveriesError)
      }

      const recoveriesList = (allRecoveries as RecoveryRecord[] | null) || []

      // Get commissions for this user
      const { data: commissionData, error: commissionError } = await supabase
        .from('commissions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (commissionError) {
        console.error("Error fetching commissions:", commissionError)
      }

      const commissionsList = (commissionData as CommissionRecord[] | null) || []

      // Calculate stats
      const recoveredThisMonth = recoveriesList
        .filter(r => r.status === 'recovered' && 
          new Date(r.recovered_at || r.created_at) >= startOfMonth)
        .reduce((sum, p) => sum + (p.amount_due / 100), 0)

      const totalRecovered = recoveriesList
        .filter(r => r.status === 'recovered')
        .reduce((sum, p) => sum + (p.amount_due / 100), 0)

      const pendingRecoveries = recoveriesList
        .filter(r => ['pending', 'email_sent', 'test_no_email'].includes(r.status)).length

      const totalAttempts = recoveriesList.length
      const recoveredCount = recoveriesList.filter(r => r.status === 'recovered').length
      const recoveryRate = totalAttempts > 0 ? Math.round((recoveredCount / totalAttempts) * 100) : 0
      
      // Calculate commission stats
      const commissionOwed = commissionsList
        .filter(c => c.status === 'pending' || c.status === 'invoiced')
        .reduce((sum, c) => sum + (c.commission_amount / 100), 0)
      
      const commissionPaid = commissionsList
        .filter(c => c.status === 'paid')
        .reduce((sum, c) => sum + (c.commission_amount / 100), 0)

      const mendCommission = commissionOwed + commissionPaid // Total commission (owed + paid)

      setStats({
        recoveredThisMonth,
        recoveryRate,
        pendingRecoveries,
        totalRecovered,
        mendCommission,
        commissionOwed,
        commissionPaid
      })

      // Set recent recoveries (last 5)
      setRecentRecoveries(recoveriesList.slice(0, 5))
      
      // Set recent commissions (last 5)
      setCommissions(commissionsList.slice(0, 5))

    } catch (err: any) {
      console.error('Failed to load dashboard data:', err)
      if (err.message?.includes('Auth session missing')) {
        router.push('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  // Show loading
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-2 text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show connect stripe if no Stripe account
  if (hasStripeAccount === false) {
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
            <button
              onClick={() => router.push('/connect-stripe')}
              className="w-full bg-slate-900 text-white py-3 px-4 rounded-lg hover:bg-slate-800"
            >
              Connect Stripe
            </button>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            We never create charges or modify customers.
            Disconnect anytime.
          </p>
        </div>
      </div>
    )
  }

return (
  <div className="min-h-screen bg-white">
    <div className="mx-auto max-w-7xl px-6 py-8">
      <DashboardHeader />

      {/* Metrics */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Recovery rate"
          value={`${stats.recoveryRate}%`}
          trend="up"
          change="+"
        />
        <MetricCard
          title="Pending recoveries"
          value={stats.pendingRecoveries.toString()}
          trend="neutral"
          change=""
        />
        <MetricCard
          title="Total recovered"
          value={`$${stats.totalRecovered.toFixed(2)}`}
          trend="up"
          change="+"
        />
      </div>

      {/* Main content */}
      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Left: Recoveries */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-sm font-medium text-slate-900">
                Recent recovery attempts
              </h2>
              <span className="text-xs text-slate-500">
                Synced from Stripe
              </span>
            </div>

            <div className="divide-y">
              {recentRecoveries.map((recovery) => (
                <div
                  key={recovery.id}
                  className="grid grid-cols-4 items-center gap-4 px-6 py-4 text-sm"
                >
                  <div>
                    <div className="font-medium text-slate-900">
                      {recovery.customer_name || "Customer"}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {recovery.customer_email}
                    </div>
                  </div>

                  <div className="text-slate-700">
                    ${(recovery.amount_due / 100).toFixed(2)}
                  </div>

                  <div className="text-slate-500">
                    {new Date(recovery.created_at).toLocaleDateString()}
                  </div>

                  <div className="flex justify-end">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        recovery.status === "recovered"
                          ? "bg-green-50 text-green-700"
                          : recovery.status === "email_sent"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {recovery.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}

              {recentRecoveries.length === 0 && (
                <div className="px-6 py-10 text-center text-sm text-slate-500">
                  No failed payments yet. Mend will appear here automatically.
                </div>
              )}
            </div>
          </div>

          {/* Revenue chart */}

        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Commission */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-medium text-slate-900">
              Mend commission
            </h3>

            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <div className="text-2xl font-semibold text-slate-900">
                  ${stats.commissionOwed.toFixed(2)}
                </div>
                <p className="text-xs text-slate-500">Currently owed</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-700">
                  ${stats.commissionPaid.toFixed(2)}
                </div>
                <p className="text-xs text-slate-500">Paid</p>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Mend charges 10% only on successfully recovered payments.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
)



}