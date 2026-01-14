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

    console.log('Marking as invoiced:', { commissionId, userId })

    const { error } = await supabase
      .from('commissions')
      .update({ 
        status: 'invoiced',
        invoice_sent_at: new Date().toISOString()
      })
      .eq('id', commissionId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error marking as invoiced:', error)
      throw error
    }

    return NextResponse.json({ 
      success: true,
      message: 'Commission marked as invoiced'
    })

  } catch (error: any) {
    console.error('Mark invoiced error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to update commission',
      details: error.message 
    }, { status: 500 })
  }
}