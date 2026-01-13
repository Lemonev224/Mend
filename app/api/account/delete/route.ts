// app/api/account/delete/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/backend/supabaseClient';

export async function POST(request: Request) {
  try {
    // Parse request body
    let userId;
    try {
      const body = await request.json();
      userId = body.userId;
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json({ 
        error: 'Invalid request body',
        details: 'Expected JSON with userId field'
      }, { status: 400 });
    }
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID required',
        details: 'Please provide userId in request body'
      }, { status: 400 });
    }

    console.log('Starting account deletion for user:', userId);

    // Check pending commissions
    const { data: pendingCommissions, error: commissionError } = await supabase
      .from('commissions')
      .select('commission_amount, status')
      .eq('user_id', userId)
      .eq('status', 'pending');

    if (commissionError) {
      console.error('Error checking commissions:', commissionError);
    }

    const pendingAmount = pendingCommissions?.reduce((sum, c) => sum + (c.commission_amount / 100), 0) || 0;

    if (pendingAmount > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete account with pending commissions',
        pending_amount: pendingAmount,
        commission_count: pendingCommissions?.length,
        message: `You have $${pendingAmount.toFixed(2)} in pending commissions.`
      }, { status: 400 });
    }

    // Soft delete user data
    const now = new Date().toISOString();

    // Mark Stripe account for deletion
    const { error: stripeError } = await supabase
      .from('stripe_accounts')
      .update({ 
        deleted_at: now,
        delete_requested_at: now
      })
      .eq('user_id', userId);

    if (stripeError) {
      console.error('Error deleting stripe account:', stripeError);
    }

    // Mark recoveries as deleted
    const { error: recoveryError } = await supabase
      .from('recoveries')
      .update({ deleted_at: now })
      .eq('user_id', userId);

    if (recoveryError) {
      console.error('Error deleting recoveries:', recoveryError);
    }

    // Mark commissions as deleted
    const { error: commissionUpdateError } = await supabase
      .from('commissions')
      .update({ deleted_at: now })
      .eq('user_id', userId);

    if (commissionUpdateError) {
      console.error('Error deleting commissions:', commissionUpdateError);
    }

    console.log('✅ Account marked for deletion:', userId);

    return NextResponse.json({ 
      success: true,
      message: 'Account deletion initiated successfully.',
      userId: userId,
      note: 'Your data will be permanently deleted in 30 days.'
    });

  } catch (error: any) {
    console.error('Account deletion error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete account',
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'ready',
    instructions: 'POST with { "userId": "user-id-here" }'
  });
}