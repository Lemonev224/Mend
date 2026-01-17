// app/api/email/welcome/route.ts
import { NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/sendgrid';

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();
    
    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    await sendWelcomeEmail(email, name);
    
    return NextResponse.json({
      success: true,
      message: 'Welcome email sent successfully'
    });
  } catch (error: any) {
    console.error('Welcome email API error:', error);
    return NextResponse.json(
      { error: 'Failed to send welcome email', details: error.message },
      { status: 500 }
    );
  }
}