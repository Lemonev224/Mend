'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Clock, DollarSign, Mail, User } from 'lucide-react'

interface Commission {
  id: string
  user_id: string
  user_email: string
  user_name: string
  commission_amount: number
  amount_recovered: number
  status: 'pending' | 'invoiced' | 'paid'
  period_start: string
  period_end: string
  stripe_invoice_id: string | null
  created_at: string
  paid_at: string | null
  invoice_sent_at: string | null
}

export default function AdminCommissionsPage() {
  const [accessCode, setAccessCode] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalOwed: 0,
    pendingCount: 0,
    invoicedCount: 0,
    paidCount: 0
  })

  useEffect(() => {
    // Check if already authenticated from localStorage
    const savedAuth = localStorage.getItem('admin_authenticated')
    if (savedAuth === 'true') {
      setIsAuthenticated(true)
      loadCommissions()
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Simple code check
    if (accessCode === '123456') {
      setIsAuthenticated(true)
      localStorage.setItem('admin_authenticated', 'true')
      loadCommissions()
    } else {
      alert('Invalid access code')
    }
  }

  const loadCommissions = async () => {
    setLoading(true)
    try {
      console.log('Loading commissions from API...')
      const response = await fetch('/api/admin/commissions')
      console.log('Response status:', response.status)
      
      const data = await response.json()
      console.log('API response:', data)
      
      if (!response.ok) {
        throw new Error(data.error || `Failed to load commissions: ${response.status}`)
      }
      
      if (data.success) {
        setCommissions(data.commissions || [])
        setStats(data.stats || {
          totalOwed: 0,
          pendingCount: 0,
          invoicedCount: 0,
          paidCount: 0
        })
        console.log('Commissions loaded:', data.commissions?.length)
      } else {
        throw new Error(data.error || 'Failed to load commissions')
      }
    } catch (error: any) {
      console.error('Error loading commissions:', error)
      alert('Failed to load commission data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const markAsInvoiced = async (commissionId: string, userId: string) => {
    if (!confirm('Mark this commission as invoiced?')) return
    
    try {
      const response = await fetch('/api/admin/mark-invoiced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commissionId, userId })
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        alert('Commission marked as invoiced!')
        loadCommissions() // Refresh data
      } else {
        throw new Error(data.error || 'Failed to update')
      }
    } catch (error: any) {
      console.error('Error:', error)
      alert('Failed to update status: ' + error.message)
    }
  }

  const markAsPaid = async (commissionId: string, userId: string) => {
    if (!confirm('Mark this commission as paid?')) return
    
    try {
      const response = await fetch('/api/admin/mark-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commissionId, userId })
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        alert('Commission marked as paid!')
        loadCommissions() // Refresh data
      } else {
        throw new Error(data.error || 'Failed to update')
      }
    } catch (error: any) {
      console.error('Error:', error)
      alert('Failed to update status: ' + error.message)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('admin_authenticated')
    setAccessCode('')
  }

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Admin Access</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Enter Admin Code
                </label>
                <Input
                  type="password"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="Enter 123456"
                  className="text-center text-lg"
                  autoFocus
                />
                <p className="text-xs text-slate-500 mt-2 text-center">
                  Use code: <strong>123456</strong>
                </p>
              </div>
              <Button type="submit" className="w-full">
                Access Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main dashboard
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manual Invoicing Dashboard</h1>
            <p className="text-slate-600">Track and manage commissions manually</p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={loadCommissions} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Owed</p>
                  <p className="text-2xl font-bold">${stats.totalOwed.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pending</p>
                  <p className="text-2xl font-bold">{stats.pendingCount}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Invoiced</p>
                  <p className="text-2xl font-bold">{stats.invoicedCount}</p>
                </div>
                <Mail className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Paid</p>
                  <p className="text-2xl font-bold">{stats.paidCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Commissions Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>All Commissions ({commissions.length})</CardTitle>
              <div className="text-sm text-slate-600">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
                <p className="mt-2 text-slate-600">Loading commissions...</p>
              </div>
            ) : commissions.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No commissions found. Run some recoveries to see commissions here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Period</th>
                      <th className="text-left py-3 px-4">Recovered</th>
                      <th className="text-left py-3 px-4">Commission (10%)</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Created</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions.map((commission) => (
                      <tr key={commission.id} className="border-b hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div className="font-medium">{commission.user_name}</div>
                          <div className="text-xs text-slate-500">{commission.user_email}</div>
                          <div className="text-xs text-slate-400">{commission.user_id.substring(0, 8)}...</div>
                        </td>
                        <td className="py-3 px-4">
                          {new Date(commission.period_start).toLocaleDateString()} -<br/>
                          {new Date(commission.period_end).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium">
                            ${(commission.amount_recovered / 100).toFixed(2)}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium">
                          ${(commission.commission_amount / 100).toFixed(2)}
                          <div className="text-xs text-slate-500">
                            10% of recovered
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            commission.status === 'paid' ? 'bg-green-100 text-green-800' :
                            commission.status === 'invoiced' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {commission.status}
                          </span>
                          {commission.paid_at && (
                            <div className="text-xs text-slate-500 mt-1">
                              Paid: {new Date(commission.paid_at).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {new Date(commission.created_at).toLocaleDateString()}
                          <div className="text-xs text-slate-500">
                            {new Date(commission.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            {commission.status === 'pending' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => markAsInvoiced(commission.id, commission.user_id)}
                              >
                                Mark Invoiced
                              </Button>
                            )}
                            {commission.status === 'invoiced' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => markAsPaid(commission.id, commission.user_id)}
                              >
                                Mark Paid
                              </Button>
                            )}
                            {commission.status === 'paid' && (
                              <span className="text-sm text-green-600 flex items-center">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Completed
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="font-medium text-blue-900 mb-2">How to use this dashboard:</p>
          <ol className="list-decimal pl-5 text-blue-800 space-y-1">
            <li>Review the pending commissions that need to be invoiced</li>
            <li>When you send an invoice to a user manually, click <strong>"Mark Invoiced"</strong></li>
            <li>When the user pays the invoice, click <strong>"Mark Paid"</strong></li>
            <li>Use the <strong>Refresh Data</strong> button to update the dashboard</li>
            <li>Total commissions are calculated as 10% of recovered revenue</li>
          </ol>
          <p className="mt-4 text-sm text-blue-700">
            <strong>Note:</strong> Users will see their owed commission amount in their dashboard, 
            but they won't be invoiced automatically. You need to invoice them manually using this dashboard.
          </p>
        </div>
      </main>
    </div>
  )
}