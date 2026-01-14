// app/admin/comissions/page.tsx
'use client'

import { useState, useEffect, Fragment } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Clock, CheckCircle, User, ChevronDown, ChevronRight } from 'lucide-react'

interface Commission {
  id: string
  user_id: string
  user_email: string
  commission_amount: number
  status: 'pending' | 'invoiced' | 'paid'
  period_start: string
  period_end: string
  invoice_sent_at: string | null
  created_at: string
  paid_at: string | null
}

interface UserSummary {
  user_id: string
  user_email: string
  user_name: string
  total_owed: number
  pending_amount: number
  invoiced_amount: number
  paid_amount: number
  last_invoice_sent: string | null
  commission_count: number
  commissions?: Commission[]
}

export default function AdminCommissionsPage() {
  const [accessCode, setAccessCode] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userSummaries, setUserSummaries] = useState<UserSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedUsers, setExpandedUsers] = useState<string[]>([])
  const [stats, setStats] = useState({
    totalOwed: 0,
    pendingCount: 0,
    invoicedCount: 0,
    paidCount: 0,
    userCount: 0
  })

  useEffect(() => {
    const savedAuth = localStorage.getItem('admin_authenticated')
    if (savedAuth === 'true') {
      setIsAuthenticated(true)
      loadCommissions()
    }
  }, [])

  const loadCommissions = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/commissions')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setUserSummaries(data.userSummaries || [])
        setStats(data.stats || {
          totalOwed: 0,
          pendingCount: 0,
          invoicedCount: 0,
          paidCount: 0,
          userCount: 0
        })
      } else {
        throw new Error(data.error || 'Failed to load data')
      }
    } catch (error: any) {
      console.error('Error loading commissions:', error)
      alert('Failed to load commission data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (accessCode === '123456') {
      setIsAuthenticated(true)
      localStorage.setItem('admin_authenticated', 'true')
      loadCommissions()
    } else {
      alert('Invalid access code. Use: 123456')
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
        loadCommissions()
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
        loadCommissions()
      } else {
        throw new Error(data.error || 'Failed to update')
      }
    } catch (error: any) {
      console.error('Error:', error)
      alert('Failed to update status: ' + error.message)
    }
  }

  const toggleUserDetails = (userId: string) => {
    setExpandedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('admin_authenticated')
    setAccessCode('')
    setUserSummaries([])
    setExpandedUsers([])
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
                  <p className="text-sm text-slate-600">Users Owing</p>
                  <p className="text-2xl font-bold">{stats.userCount}</p>
                </div>
                <User className="h-8 w-8 text-blue-500" />
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
                  <p className="text-sm text-slate-600">Paid</p>
                  <p className="text-2xl font-bold">{stats.paidCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Summaries Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                User Commissions ({stats.userCount} users)
              </CardTitle>
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
            ) : userSummaries.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No commissions found. Run some recoveries to see commissions here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4"></th>
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Total Owed</th>
                      <th className="text-left py-3 px-4">Last Invoice</th>
                      <th className="text-left py-3 px-4">Commissions</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userSummaries.map((user) => {
                      const isExpanded = expandedUsers.includes(user.user_id)
                      const totalOwed = user.total_owed / 100
                      const commissions = user.commissions || []
                      const pendingCount = commissions.filter(c => c.status === 'pending').length
                      
                      return (
                        <Fragment key={user.user_id}>
                          {/* User Summary Row */}
                          <tr className="border-b hover:bg-slate-50">
                            <td className="py-3 px-4">
                              <button
                                onClick={() => toggleUserDetails(user.user_id)}
                                className="p-1 hover:bg-slate-200 rounded"
                                disabled={commissions.length === 0}
                              >
                                {commissions.length > 0 ? (
                                  isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </button>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium">{user.user_name || 'User'}</div>
                              <div className="text-xs text-slate-500">{user.user_email}</div>
                              <div className="text-xs text-slate-400">{user.user_id.substring(0, 8)}...</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-lg">
                                ${totalOwed.toFixed(2)}
                              </div>
                              <div className="text-xs text-slate-500 mt-1">
                                {user.pending_amount > 0 && (
                                  <span className="mr-2">Pending: ${(user.pending_amount / 100).toFixed(2)}</span>
                                )}
                                {user.invoiced_amount > 0 && (
                                  <span>Invoiced: ${(user.invoiced_amount / 100).toFixed(2)}</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {user.last_invoice_sent ? (
                                <>
                                  <div className="font-medium">
                                    {new Date(user.last_invoice_sent).toLocaleDateString()}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {new Date(user.last_invoice_sent).toLocaleTimeString([], { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </div>
                                </>
                              ) : (
                                <span className="text-slate-400">Never</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium">{user.commission_count}</div>
                              <div className="text-xs text-slate-500">
                                {pendingCount} pending
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-col gap-2">
                                {totalOwed > 0 && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      alert(`Would send invoice to ${user.user_email} for $${totalOwed.toFixed(2)}`)
                                    }}
                                  >
                                    Send Invoice
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>

                          {/* Expanded Details Row */}
                          {isExpanded && commissions.length > 0 && (
                            <tr className="border-b bg-slate-50">
                              <td colSpan={6} className="py-4 px-4">
                                <div className="pl-8">
                                  <h4 className="font-medium text-slate-900 mb-3">
                                    Individual Commissions ({commissions.length})
                                  </h4>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-xs">
                                      <thead>
                                        <tr className="border-b">
                                          <th className="text-left py-2 px-3">Period</th>
                                          <th className="text-left py-2 px-3">Commission</th>
                                          <th className="text-left py-2 px-3">Status</th>
                                          <th className="text-left py-2 px-3">Created</th>
                                          <th className="text-left py-2 px-3">Invoice Sent</th>
                                          <th className="text-left py-2 px-3">Actions</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {commissions.map((commission) => (
                                          <tr key={commission.id} className="border-b hover:bg-white">
                                            <td className="py-2 px-3">
                                              {commission.period_start ? (
                                                <>
                                                  {new Date(commission.period_start).toLocaleDateString()} -<br/>
                                                  {new Date(commission.period_end).toLocaleDateString()}
                                                </>
                                              ) : (
                                                <span className="text-slate-400">No period</span>
                                              )}
                                            </td>
                                            <td className="py-2 px-3 font-medium">
                                              ${((commission.commission_amount || 0) / 100).toFixed(2)}
                                            </td>
                                            <td className="py-2 px-3">
                                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                commission.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                commission.status === 'invoiced' ? 'bg-blue-100 text-blue-800' :
                                                'bg-yellow-100 text-yellow-800'
                                              }`}>
                                                {commission.status || 'pending'}
                                              </span>
                                            </td>
                                            <td className="py-2 px-3">
                                              {commission.created_at ? (
                                                new Date(commission.created_at).toLocaleDateString()
                                              ) : (
                                                <span className="text-slate-400">—</span>
                                              )}
                                            </td>
                                            <td className="py-2 px-3">
                                              {commission.invoice_sent_at ? (
                                                new Date(commission.invoice_sent_at).toLocaleDateString()
                                              ) : (
                                                <span className="text-slate-400">—</span>
                                              )}
                                            </td>
                                            <td className="py-2 px-3">
                                              <div className="flex gap-1">
                                                {commission.status === 'pending' && (
                                                  <Button 
                                                    variant="outline"
                                                    onClick={() => markAsInvoiced(commission.id, user.user_id)}
                                                  >
                                                    Mark Invoiced
                                                  </Button>
                                                )}
                                                {commission.status === 'invoiced' && (
                                                  <Button 
                                                    variant="outline"
                                                    onClick={() => markAsPaid(commission.id, user.user_id)}
                                                  >
                                                    Mark Paid
                                                  </Button>
                                                )}
                                                {commission.status === 'paid' && (
                                                  <span className="text-xs text-green-600 flex items-center">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Paid
                                                  </span>
                                                )}
                                              </div>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      )
                    })}
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
            <li>Review the user summaries to see who owes money</li>
            <li>Click the arrow next to a user to see individual commissions</li>
            <li>Click "Send Invoice" to invoice a user for their total owed amount</li>
            <li>When you send an invoice, click "Mark Invoiced" on individual commissions</li>
            <li>When payment is received, click "Mark Paid"</li>
            <li>Commissions are calculated as 10% of recovered revenue</li>
          </ol>
        </div>
      </main>
    </div>
  )
}