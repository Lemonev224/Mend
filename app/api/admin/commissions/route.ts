import { NextResponse } from 'next/server'
import { supabase } from '@/lib/backend/supabaseClient'

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
        commissions: [],
        stats: {
          totalOwed: 0,
          pendingCount: 0,
          invoicedCount: 0,
          paidCount: 0
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
      // Continue with placeholders if error
    }

    // Create user map from user_details
    const userMap = new Map()
    userDetails?.forEach(user => {
      userMap.set(user.id, {
        email: user.email,
        name: user.full_name || user.email?.split('@')[0] || 'User'
      })
    })

    // Combine data - use email from commissions if available, otherwise from user_details
    const commissionsWithUsers = commissions.map(commission => {
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

      return {
        id: commission.id,
        user_id: commission.user_id,
        user_email: userEmail,
        user_name: userName,
        commission_amount: commission.commission_amount || 0,
        amount_recovered: commission.amount_recovered || 0,
        status: commission.status || 'pending',
        period_start: commission.period_start,
        period_end: commission.period_end,
        stripe_invoice_id: commission.stripe_invoice_id,
        created_at: commission.created_at,
        paid_at: commission.paid_at,
        invoice_sent_at: commission.invoice_sent_at
      }
    })

    // Calculate stats
    const stats = {
      totalOwed: commissionsWithUsers
        .filter(c => c.status !== 'paid')
        .reduce((sum, c) => sum + (c.commission_amount / 100), 0),
      pendingCount: commissionsWithUsers.filter(c => c.status === 'pending').length,
      invoicedCount: commissionsWithUsers.filter(c => c.status === 'invoiced').length,
      paidCount: commissionsWithUsers.filter(c => c.status === 'paid').length
    }

    return NextResponse.json({ 
      success: true,
      commissions: commissionsWithUsers,
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