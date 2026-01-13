import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { generateMendMessage } from '@/lib/groq';
import { sendRecoveryEmail } from '@/lib/resend';
import { supabase } from '@/lib/backend/supabaseClient';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  
});

// Helper to log webhook events
async function logWebhookEvent(event: any, status: string, error?: any) {
  try {
    await supabase.from('webhook_logs').insert({
      event_type: event.type,
      stripe_event_id: event.id,
      payload: event,
      status,
      error_message: error?.message,
      processed_at: status === 'processed' ? new Date().toISOString() : null
    });
  } catch (logError) {
    console.error('Failed to log webhook event:', logError);
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  
  if (!sig) {
    console.error('Missing Stripe signature');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    await logWebhookEvent({ type: 'signature_failed', id: 'none' }, 'failed', err);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  await logWebhookEvent(event, 'received');

  try {
    if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object as Stripe.Invoice;
      const stripeAccountId = event.account || 'acct_default';
      
      console.log('Processing failed payment for invoice:', invoice.id);
      
      // Get customer email - fetch from Stripe if not in webhook
      let customerEmail = invoice.customer_email;
      let customerName = invoice.customer_name || 'there';

      // If no email, try to fetch customer from Stripe
      if (!customerEmail && invoice.customer) {
        try {
          let customer;
          if (typeof invoice.customer === 'string') {
            // Fetch customer from Stripe using the account ID
            customer = await stripe.customers.retrieve(invoice.customer, {
              stripeAccount: stripeAccountId !== 'acct_default' ? stripeAccountId : undefined
            });
          } else {
            customer = invoice.customer;
          }
          
          if (customer && typeof customer === 'object' && 'email' in customer) {
            customerEmail = (customer as Stripe.Customer).email;
            if ((customer as Stripe.Customer).name) customerName = (customer as Stripe.Customer).name!;
          }
        } catch (error) {
          console.error('Failed to fetch customer details:', error);
        }
      }

      console.log('Customer details resolved:', { customerEmail, customerName });

      // Find the Stripe account in our database
      let stripeAccountData;
      if (stripeAccountId !== 'acct_default') {
        const { data } = await supabase
          .from('stripe_accounts')
          .select('stripe_account_id, user_id')
          .eq('stripe_account_id', stripeAccountId)
          .single();
        stripeAccountData = data;
      } else {
        stripeAccountData = { stripe_account_id: 'acct_default', user_id: 'unknown' };
      }

      if (!stripeAccountData) {
        console.warn('No Stripe account found in database:', stripeAccountId);
        await logWebhookEvent(event, 'failed', new Error('No Stripe account found in database'));
        return NextResponse.json({ received: true, warning: 'No account found in database' });
      }

      // Generate personalized message
      let personalizedMessage = '';
      try {
        personalizedMessage = await generateMendMessage({
          customerName,
          amount: (invoice.amount_due / 100).toFixed(2),
          currency: invoice.currency.toUpperCase()
        });
      } catch (groqError) {
        personalizedMessage = `Hi ${customerName}, just a quick heads-up that your payment for $${(invoice.amount_due / 100).toFixed(2)} didn't go through. It's usually just an expired card — you can update it here when you have a moment.`;
      }

      // Send recovery email if we have customer email
      if (customerEmail) {
        try {
          await sendRecoveryEmail(customerEmail, personalizedMessage);
          console.log('Recovery email sent to:', customerEmail);
        } catch (emailError) {
          console.error('Failed to send recovery email:', emailError);
          await logWebhookEvent(event, 'partial', emailError);
        }
      }

      // Log recovery attempt to Supabase
      let customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;

      try {
        const recoveryRecord = {
          stripe_customer_id: customerId || 'unknown',
          stripe_invoice_id: invoice.id,
          stripe_account_id: stripeAccountData.stripe_account_id,
          amount_due: invoice.amount_due,
          customer_email: customerEmail || '',
          customer_name: customerName,
          message_sent: personalizedMessage,
          status: customerEmail ? 'email_sent' : 'pending'
        };

        console.log('Inserting recovery:', recoveryRecord);

        const { error: recoveryError } = await supabase
          .from('recoveries')
          .insert(recoveryRecord);

        if (recoveryError) {
          console.error('Failed to log recovery:', recoveryError);
        } else {
          console.log('✅ Recovery logged successfully');
        }
      } catch (dbError) {
        console.error('Failed to log recovery:', dbError);
      }

      await logWebhookEvent(event, 'processed');
    }

    // Handle successful payment recovery AND create commission
    if (event.type === 'invoice.paid') {
      const invoice = event.data.object as Stripe.Invoice;
      const stripeAccountId = event.account || 'acct_default';
      
      try {
        // Update recovery status
        const { data: recovery, error: updateError } = await supabase
          .from('recoveries')
          .update({ 
            status: 'recovered',
            recovered_at: new Date().toISOString()
          })
          .eq('stripe_invoice_id', invoice.id)
          .select()
          .single();

        if (updateError) {
          console.error('Failed to update recovery status:', updateError);
        } else if (recovery) {
          console.log('✅ Invoice marked as recovered:', invoice.id);
          
          // Get user's Stripe account to find user_id
          const { data: stripeAccount } = await supabase
            .from('stripe_accounts')
            .select('user_id')
            .eq('stripe_account_id', stripeAccountId)
            .single();

          if (stripeAccount) {
            // Create commission record (10% of recovered amount)
            const amount_recovered = invoice.amount_paid || invoice.amount_due;
            const commission_percentage = 10;
            const commission_amount = Math.floor(amount_recovered * commission_percentage / 100);
            
            const now = new Date();
            const period_start = new Date(now.getFullYear(), now.getMonth(), 1);
            const period_end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            const commissionRecord = {
              user_id: stripeAccount.user_id,
              stripe_account_id: stripeAccountId,
              recovery_id: recovery.id,
              amount_recovered: amount_recovered,
              commission_percentage: commission_percentage,
              commission_amount: commission_amount,
              period_start: period_start.toISOString().split('T')[0],
              period_end: period_end.toISOString().split('T')[0],
              status: 'pending'
            };

            console.log('💰 Creating commission:', {
              amount: `$${(amount_recovered / 100).toFixed(2)}`,
              commission: `$${(commission_amount / 100).toFixed(2)}`,
              user_id: stripeAccount.user_id
            });

            const { error: commissionError } = await supabase
              .from('commissions')
              .insert(commissionRecord);

            if (commissionError) {
              console.error('❌ Failed to create commission:', commissionError);
            } else {
              console.log('✅ Commission created successfully');
            }
          }
        }
      } catch (error) {
        console.error('Failed to update recovery status:', error);
      }

      await logWebhookEvent(event, 'processed');
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ 
      error: 'Webhook processing failed',
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'active',
    message: 'Stripe webhook endpoint is running',
    env: {
      has_stripe_key: !!process.env.STRIPE_SECRET_KEY,
      has_webhook_secret: !!process.env.STRIPE_WEBHOOK_SECRET
    }
  });
}