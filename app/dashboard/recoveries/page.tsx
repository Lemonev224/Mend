'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/backend/supabaseClient'
import { Button } from '@/components/ui/button'

interface Recovery {
  id: string
  stripe_invoice_id: string
  customer_email: string
  customer_name: string
  amount_due: number
  status: string
  created_at: string
  recovered_at: string | null
}

export default function RecoveriesPage() {
  const [recoveries, setRecoveries] = useState<Recovery[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecoveries()
  }, [])

  async function loadRecoveries() {
    try {
      const { data, error } = await supabase
        .from('recoveries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setRecoveries(data || [])
    } catch (error) {
      console.error('Failed to load recoveries:', error)
    } finally {
      setLoading(false)
    }
  }

  async function markAsRecovered(invoiceId: string, amount: number) {
    try {
      await fetch('/api/test/mark-recovered', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId, amount })
      })
      loadRecoveries() // Refresh
    } catch (error) {
      console.error('Failed to mark as recovered:', error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Recoveries</h1>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-100">
              <th className="p-3 text-left">Invoice</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recoveries.map((recovery) => (
              <tr key={recovery.id} className="border-b">
                <td className="p-3">{recovery.stripe_invoice_id}</td>
                <td className="p-3">
                  <div>{recovery.customer_name}</div>
                  <div className="text-sm text-slate-500">{recovery.customer_email}</div>
                </td>
                <td className="p-3">${(recovery.amount_due / 100).toFixed(2)}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    recovery.status === 'recovered' ? 'bg-green-100 text-green-800' :
                    recovery.status === 'email_sent' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {recovery.status}
                  </span>
                </td>
                <td className="p-3">
                  {new Date(recovery.created_at).toLocaleDateString()}
                </td>
                <td className="p-3">
                  {recovery.status !== 'recovered' && (
                    <Button
                      size="sm"
                      onClick={() => markAsRecovered(recovery.stripe_invoice_id, recovery.amount_due)}
                    >
                      Mark Recovered
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}