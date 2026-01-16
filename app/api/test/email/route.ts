import { NextResponse } from 'next/server';
import { sendRecoveryEmail, sendEmail } from '@/lib/sendgrid';

export async function POST(request: Request) {
  try {
    const { email = 'test@example.com' } = await request.json();
    
    // Test with recovery email
    const testMessage = `Hi Alex, just a quick heads-up that your payment for $49.00 didn't go through. It's usually just an expired card — you can update it here when you have a moment.`;
    
    await sendRecoveryEmail(email, testMessage);
    
    // Alternative: Test basic email
    // await sendEmail({
    //   to: email,
    //   subject: 'Test from SendGrid',
    //   html: '<strong>This is a test email from SendGrid</strong>',
    //   text: 'This is a test email from SendGrid',
    // });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test email sent via SendGrid! Check your inbox.' 
    });
  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json({ 
      error: error.message,
      details: error.response?.body || error 
    }, { status: 500 });
  }
}
