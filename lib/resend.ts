import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendRecoveryEmail(to: string, message: string) {
  try {
    console.log('📧 Attempting to send email to:', to);
    
    const { data, error } = await resend.emails.send({
      from: 'Mend <onboarding@resend.dev>', // Use Resend's test domain for now
      to,
      subject: 'Payment Issue Update',
      html: `
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
      `
    });

    if (error) {
      console.error('❌ Resend error:', error);
      throw error;
    }

    console.log('✅ Email sent successfully! ID:', data?.id);
    return data;
    
  } catch (error) {
    console.error('❌ Failed to send recovery email:', error);
    throw error;
  }
}