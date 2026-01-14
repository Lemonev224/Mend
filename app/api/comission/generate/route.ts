import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/backend/supabaseClient';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {

    return NextResponse.json({ 
    disabled: true,
    message: 'Automatic invoicing is disabled. Use the manual admin dashboard at /admin/comissions',
    manualDashboard: '/admin/comissions'
  }, { status: 400 });
  try {
    const { month, year, user_id } = await request.json();
    
    // Default to last month if not specified
    const targetDate = new Date(year || new Date().getFullYear(), 
                               month !== undefined ? month : new Date().getMonth() - 1, 1);
    
    const period_start = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    const period_end = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

    console.log(`Generating commissions for ${period_start.toLocaleDateString()} - ${period_end.toLocaleDateString()}`);

    // Get pending commissions for the period
    let query = supabase
      .from('commissions')
      .select('*')
      .eq('status', 'pending')
      .gte('period_start', period_start.toISOString().split('T')[0])
      .lte('period_end', period_end.toISOString().split('T')[0])
      .gt('commission_amount', 0);

    // If specific user_id provided, filter by user
    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    const { data: pendingCommissions, error } = await query;

    if (error) throw error;

    // Group commissions by user manually
    const commissionsByUser: Record<string, {
      user_id: string;
      total_commission: number;
      commissions: any[];
      email?: string;
      name?: string;
    }> = {};

    // First, get all unique user IDs
    const userIds = [...new Set(pendingCommissions?.map(c => c.user_id))];

    // Get user details for each user
    const { data: users } = await supabase
      .from('users')
      .select('id, email, raw_user_meta_data')
      .in('id', userIds);

    // Create user map for easy lookup
    const userMap = new Map();
    users?.forEach(user => {
      userMap.set(user.id, {
        email: user.email,
        name: user.raw_user_meta_data?.full_name || user.email?.split('@')[0] || 'User'
      });
    });

    // Group commissions by user
    pendingCommissions?.forEach(commission => {
      if (!commissionsByUser[commission.user_id]) {
        const userInfo = userMap.get(commission.user_id);
        commissionsByUser[commission.user_id] = {
          user_id: commission.user_id,
          total_commission: 0,
          commissions: [],
          email: userInfo?.email,
          name: userInfo?.name
        };
      }
      
      commissionsByUser[commission.user_id].total_commission += commission.commission_amount;
      commissionsByUser[commission.user_id].commissions.push(commission);
    });

    const results = [];

    // Generate invoices for each user
    for (const userId in commissionsByUser) {
      const userCommissions = commissionsByUser[userId];
      
      try {
        // Get or create Stripe customer
        let customerId = await getOrCreateCustomer(
          userCommissions.user_id, 
          userCommissions.email || 'unknown@example.com', 
          userCommissions.name
        );

        // Create invoice
        const invoice = await stripe.invoices.create({
          customer: customerId,
          collection_method: 'send_invoice',
          days_until_due: 30,
          metadata: {
            user_id: userCommissions.user_id,
            period_start: period_start.toISOString().split('T')[0],
            period_end: period_end.toISOString().split('T')[0],
            commission_count: userCommissions.commissions.length
          },
          description: `Mend Commission - ${period_start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
        });

        // Add invoice item for total commission
        await stripe.invoiceItems.create({
          customer: customerId,
          invoice: invoice.id,
          amount: userCommissions.total_commission,
          currency: 'usd',
          description: `Commission for ${userCommissions.commissions.length} recovered payment(s)`,
          metadata: {
            type: 'commission',
            period: `${period_start.toISOString().split('T')[0]}_${period_end.toISOString().split('T')[0]}`
          }
        });

        // Finalize and send invoice
        const finalInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
        await stripe.invoices.sendInvoice(invoice.id);

        // Update commissions with invoice ID
        const commissionIds = userCommissions.commissions.map(c => c.id);
        await supabase
          .from('commissions')
          .update({ 
            status: 'invoiced',
            stripe_invoice_id: invoice.id
          })
          .in('id', commissionIds);

        results.push({
          user_id: userCommissions.user_id,
          email: userCommissions.email,
          name: userCommissions.name,
          amount: `$${(userCommissions.total_commission / 100).toFixed(2)}`,
          invoice_id: invoice.id,
          invoice_url: finalInvoice.hosted_invoice_url,
          status: 'sent',
          commission_count: userCommissions.commissions.length
        });

        console.log(`📧 Invoice sent to ${userCommissions.email} for $${(userCommissions.total_commission / 100).toFixed(2)}`);

      } catch (userError: any) {
        console.error(`Failed to invoice user ${userId}:`, userError.message);
        results.push({
          user_id: userCommissions.user_id,
          email: userCommissions.email,
          name: userCommissions.name,
          amount: `$${(userCommissions.total_commission / 100).toFixed(2)}`,
          error: userError.message,
          status: 'failed'
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      period: `${period_start.toISOString().split('T')[0]} to ${period_end.toISOString().split('T')[0]}`,
      total_users: Object.keys(commissionsByUser).length,
      total_invoiced: results.filter(r => r.status === 'sent').length,
      total_amount: results.reduce((sum, r) => {
        if (r.amount) {
          const amount = parseFloat(r.amount.replace('$', ''));
          return sum + amount;
        }
        return sum;
      }, 0),
      results 
    });

  } catch (error: any) {
    console.error('Failed to generate commissions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function getOrCreateCustomer(userId: string, email: string, name?: string): Promise<string> {
  try {
    // Check if customer exists in Stripe
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0].id;
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email: email,
      name: name || email.split('@')[0],
      metadata: {
        user_id: userId,
        source: 'mend_app'
      }
    });

    return customer.id;
    
  } catch (error: any) {
    throw new Error(`Failed to get/create customer: ${error.message}`);
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'ready',
    instructions: 'POST to generate invoices for pending commissions',
    parameters: {
      month: 'Optional (0-11, 0=January)',
      year: 'Optional (default: current year)',
      user_id: 'Optional (generate for specific user only)'
    }
  });
}