import { NextResponse } from 'next/server'
import { supabase } from '@/lib/backend/supabaseClient'

interface Commission {
  id: string
  user_id: string
  user_email: string
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

interface UserSummary {
  user_id: string
  user_name: string
  user_email: string
  total_owed: number // Total commission amount (in cents)
  pending_amount: number
  invoiced_amount: number
  paid_amount: number
  last_invoice_sent: string | null
  commission_count: number
  individual_commissions: Commission[] // Keep individual commissions for detail view
}

export async function GET(request: Request) {
  try {
    console.log('Admin commissions API called')
    
    // Get all commissions
    const { data: commissions, error: commissionsError } = await supabase
      .from('commissions')
      .select('*')
      .order('created_at', { ascending: false })

    if (commissionsError) {
      console.error('Error fetching commissions:', commissionsError)
      throw commissionsError
    }

    console.log('Commissions found:', commissions?.length)

    if (!commissions || commissions.length === 0) {
      return NextResponse.json({ 
        success: true,
        userSummaries: [],
        stats: {
          totalOwed: 0,
          pendingCount: 0,
          invoicedCount: 0,
          paidCount: 0,
          userCount: 0
        }
      })
    }

    // Get user details for each commission from user_details table
    const userIds = [...new Set(commissions.map(c => c.user_id))]
    
    const { data: userDetails, error: userDetailsError } = await supabase
      .from('user_details')
      .select('id, email, full_name')
      .in('id', userIds)

    if (userDetailsError) {
      console.error('Error fetching user details:', userDetailsError)
    }

    // Create user map from user_details
    const userMap = new Map()
    userDetails?.forEach(user => {
      userMap.set(user.id, {
        email: user.email,
        name: user.full_name || user.email?.split('@')[0] || 'User'
      })
    })

    // Group commissions by user
    const userSummaries = new Map<string, UserSummary>()

    commissions.forEach(commission => {
      const userId = commission.user_id
      
      // Try to get email from multiple sources
      let userEmail = commission.user_email
      let userName = 'User'
      
      // If commission has "Unknown" email or no email, try user_details
      if (!userEmail || userEmail === 'Unknown' || userEmail === 'unknown@example.com') {
        const userDetail = userMap.get(commission.user_id)
        userEmail = userDetail?.email || `${commission.user_id.substring(0, 8)}...`
        userName = userDetail?.name || `User ${commission.user_id.substring(0, 8)}`
      } else {
        // Commission has email, but we might not have name
        const userDetail = userMap.get(commission.user_id)
        userName = userDetail?.name || commission.user_email?.split('@')[0] || 'User'
      }

      // Initialize user summary if not exists
      if (!userSummaries.has(userId)) {
        userSummaries.set(userId, {
          user_id: userId,
          user_name: userName,
          user_email: userEmail,
          total_owed: 0,
          pending_amount: 0,
          invoiced_amount: 0,
          paid_amount: 0,
          last_invoice_sent: null,
          commission_count: 0,
          individual_commissions: []
        })
      }

      const userSummary = userSummaries.get(userId)!
      
      // Add to individual commissions
      userSummary.individual_commissions.push({
        id: commission.id,
        user_id: commission.user_id,
        user_email: userEmail,
        commission_amount: commission.commission_amount || 0,
        amount_recovered: commission.amount_recovered || 0,
        status: commission.status || 'pending',
        period_start: commission.period_start,
        period_end: commission.period_end,
        stripe_invoice_id: commission.stripe_invoice_id,
        created_at: commission.created_at,
        paid_at: commission.paid_at,
        invoice_sent_at: commission.invoice_sent_at
      })

      // Update totals
      userSummary.commission_count += 1
      
      if (commission.status === 'pending') {
        userSummary.pending_amount += commission.commission_amount || 0
      } else if (commission.status === 'invoiced') {
        userSummary.invoiced_amount += commission.commission_amount || 0
      } else if (commission.status === 'paid') {
        userSummary.paid_amount += commission.commission_amount || 0
      }

      // Add to total owed (pending + invoiced, not paid)
      if (commission.status !== 'paid') {
        userSummary.total_owed += commission.commission_amount || 0
      }

      // Update last invoice sent date
      if (commission.invoice_sent_at) {
        const invoiceDate = new Date(commission.invoice_sent_at)
        const currentLastDate = userSummary.last_invoice_sent ? 
          new Date(userSummary.last_invoice_sent) : null
        
        if (!currentLastDate || invoiceDate > currentLastDate) {
          userSummary.last_invoice_sent = commission.invoice_sent_at
        }
      }
    })

    // Convert Map to array and sort by total owed (highest first)
    const userSummariesArray = Array.from(userSummaries.values())
      .sort((a, b) => b.total_owed - a.total_owed)

    // Calculate global stats
    const stats = {
      totalOwed: userSummariesArray.reduce((sum, user) => sum + (user.total_owed / 100), 0),
      pendingCount: userSummariesArray.reduce((sum, user) => sum + user.individual_commissions.filter(c => c.status === 'pending').length, 0),
      invoicedCount: userSummariesArray.reduce((sum, user) => sum + user.individual_commissions.filter(c => c.status === 'invoiced').length, 0),
      paidCount: userSummariesArray.reduce((sum, user) => sum + user.individual_commissions.filter(c => c.status === 'paid').length, 0),
      userCount: userSummariesArray.length
    }

    return NextResponse.json({ 
      success: true,
      userSummaries: userSummariesArray,
      stats
    })

  } catch (error: any) {
    console.error('Admin commissions error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch commissions',
      details: error.message 
    }, { status: 500 })
  }
}