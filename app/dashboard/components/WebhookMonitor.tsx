// app/dashboard/components/WebhookMonitor.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/backend/supabaseClient'

interface WebhookLog {
  id: string
  event_type: string
  stripe_event_id: string
  status: string
  error_message: string | null
  created_at: string
}

export default function WebhookMonitor() {
  const [logs, setLogs] = useState<WebhookLog[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    failed: 0,
    recentFailures: 0
  })

  useEffect(() => {
    loadWebhookLogs()
  }, [])

  async function loadWebhookLogs() {
    try {
      setLoading(true)
      
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError || !userData.user) {
        console.error("No user found:", userError)
        return
      }

      // Get user's Stripe account
      const { data: stripeAccount, error: stripeError } = await supabase
        .from('stripe_accounts')
        .select('stripe_account_id')
        .eq('user_id', userData.user.id)
        .single()

      if (stripeError || !stripeAccount) {
        console.error("No Stripe account found:", stripeError)
        return
      }

      // Get webhook logs
      const { data: logsData, error: logsError } = await supabase
        .from('webhook_logs')
        .select('*')
        .eq('stripe_account_id', stripeAccount.stripe_account_id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (logsError) {
        console.error("Error fetching webhook logs:", logsError)
        return
      }

      setLogs(logsData || [])

      // Calculate stats
      const total = logsData?.length || 0
      const success = logsData?.filter(log => log.status === 'processed').length || 0
      const failed = logsData?.filter(log => log.status === 'failed').length || 0
      
      // Recent failures (last 24 hours)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const recentFailures = logsData?.filter(log => 
        log.status === 'failed' && 
        new Date(log.created_at) > yesterday
      ).length || 0

      setStats({ total, success, failed, recentFailures })

    } catch (error) {
      console.error('Failed to load webhook logs:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Webhook Monitor
        </h3>
        <div className="text-sm text-slate-500">Loading webhook logs...</div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Webhook Monitor
          </h3>
          <p className="text-sm text-slate-500">
            Track Stripe webhook delivery and failures
          </p>
        </div>
        
        <div className="flex gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-semibold text-green-600">
              {stats.success}
            </div>
            <div className="text-slate-500">Successful</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold text-red-600">
              {stats.failed}
            </div>
            <div className="text-slate-500">Failed</div>
          </div>
        </div>
      </div>

      {stats.recentFailures > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.94-.833-2.67 0L4.198 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-red-700 font-medium">
              {stats.recentFailures} webhook failure{stats.recentFailures !== 1 ? 's' : ''} in last 24 hours
            </span>
          </div>
        </div>
      )}

      {logs.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium text-slate-700">Event</th>
                <th className="text-left py-2 font-medium text-slate-700">Status</th>
                <th className="text-left py-2 font-medium text-slate-700">Time</th>
                <th className="text-left py-2 font-medium text-slate-700">Error</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-slate-50">
                  <td className="py-2">
                    <span className="font-medium text-slate-900">{log.event_type}</span>
                    <div className="text-xs text-slate-500 truncate max-w-[150px]">
                      {log.stripe_event_id}
                    </div>
                  </td>
                  <td className="py-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      log.status === 'processed' ? 'bg-green-100 text-green-800' :
                      log.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="py-2 text-slate-600">
                    {new Date(log.created_at).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </td>
                  <td className="py-2">
                    {log.error_message ? (
                      <div className="text-red-600 text-xs max-w-[200px] truncate">
                        {log.error_message}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500">
          <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p>No webhook events yet.</p>
          <p className="text-sm mt-1">Connect your Stripe account to start receiving events.</p>
        </div>
      )}

      <div className="mt-4 text-right">
        <button
          onClick={loadWebhookLogs}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Refresh
        </button>
      </div>
    </div>
  )
}