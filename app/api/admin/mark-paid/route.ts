import { NextResponse } from 'next/server'
import { supabase } from '@/lib/backend/supabaseClient'

export async function POST(request: Request) {
  try {
    const { commissionId, userId } = await request.json()
    
    if (!commissionId || !userId) {
      return NextResponse.json({ 
        success: false,
        error: 'Missing commissionId or userId' 
      }, { status: 400 })
    }

    console.log('Marking as paid:', { commissionId, userId })

    const { error } = await supabase
      .from('commissions')
      .update({ 
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('id', commissionId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error marking as paid:', error)
      throw error
    }

    return NextResponse.json({ 
      success: true,
      message: 'Commission marked as paid'
    })

  } catch (error: any) {
    console.error('Mark paid error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to update commission',
      details: error.message 
    }, { status: 500 })
  }
}