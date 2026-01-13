import { NextResponse } from 'next/server';
import { supabase } from '@/lib/backend/supabaseClient';

export async function POST(request: Request) {
  try {
    const { invoiceId, amount = 2000 } = await request.json();
    
    if (!invoiceId) {
      return NextResponse.json({ error: 'Missing invoiceId' }, { status: 400 });
    }

    console.log('Marking as recovered:', invoiceId);

    const { data, error } = await supabase
      .from('recoveries')
      .update({ 
        status: 'recovered',
        recovered_at: new Date().toISOString(),
        amount_due: amount
      })
      .eq('stripe_invoice_id', invoiceId)
      .select();

    if (error) {
      console.error('Failed to update recovery:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Marked as recovered',
      data 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}