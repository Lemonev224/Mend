// lib/sendgrid.ts - Full version
import sgMail from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  console.warn('SENDGRID_API_KEY is not set');
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = process.env.SENDGRID_FROM_EMAIL || 'Mend <noreply@mendapp.tech>',
  replyTo = 'support@mendapp.tech'
}: EmailOptions) {
  try {
    console.log('📧 Sending email to:', to);
    
    const msg = {
      to,
      from,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''),
      html,
      replyTo,
    };

    const response = await sgMail.send(msg);
    console.log('✅ Email sent. Status:', response[0].statusCode);
    return response;
  } catch (error: any) {
    console.error('❌ SendGrid error:', error.message);
    if (error.response) {
      console.error('SendGrid API Error:', error.response.body);
    }
    throw error;
  }
}

// Recovery email (for failed payments)
export async function sendRecoveryEmail(to: string, message: string) {
  const html = `
    <div style="font-family: sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
      <div style="background: #f8fafc; padding: 30px; border-radius: 12px; margin: 20px 0;">
        <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 20px;">Mend</h2>
        <div style="background: white; padding: 25px; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-line; margin-bottom: 25px;">
          ${message}
        </div>
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 13px; color: #64748b;">
          <p>This is an automated message from Mend. If you believe this is a mistake, please contact our support team.</p>
          <p>© ${new Date().getFullYear()} Mend. All rights reserved.</p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Payment Issue Update',
    html,
  });
}

// Welcome email for new users
export async function sendWelcomeEmail(to: string, name: string) {
  const html = `
    <div style="font-family: sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
      <div style="background: #f8fafc; padding: 30px; border-radius: 12px; margin: 20px 0;">
        <h2 style="color: #1e293b; margin: 0 0 20px 0; font-size: 20px;">Welcome to Mend, ${name}! 👋</h2>
        
        <div style="background: white; padding: 25px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 25px;">
          <p>We're excited to help you recover failed revenue automatically.</p>
          
          <h3 style="color: #1e293b; margin-top: 20px;">Next steps:</h3>
          <ol style="margin-left: 20px;">
            <li>Connect your Stripe account in the dashboard</li>
            <li>Mend will monitor failed payments automatically</li>
            <li>We'll send recovery emails on your behalf</li>
          </ol>
          
          <div style="margin-top: 25px; padding: 15px; background: #f0f9ff; border-radius: 8px;">
            <p style="margin: 0;"><strong>Need help?</strong> Reply to this email or visit your dashboard.</p>
          </div>
        </div>
        
        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 13px; color: #64748b;">
          <p>© ${new Date().getFullYear()} Mend. All rights reserved.</p>
          <p><a href="https://mendapp.tech/dashboard" style="color: #3b82f6;">Go to Dashboard</a></p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Welcome to Mend!',
    html,
  });
}