import { NextResponse } from 'next/server';
import { sendRecoveryEmail } from '@/lib/resend';

export async function POST(request: Request) {
  try {
    const { email = 'delivered@resend.dev' } = await request.json();
    
    const testMessage = `Hi Alex, just a quick heads-up that your payment for $49.00 didn't go through. It's usually just an expired card — you can update it here when you have a moment.`;
    
    await sendRecoveryEmail(email, testMessage);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Test email sent! Check your inbox.' 
    });
  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json({ 
      error: error.message,
      details: error 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'ready',
    instructions: 'POST with { "email": "your-email@example.com" }'
  });
}