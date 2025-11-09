import { NextRequest, NextResponse } from 'next/server';
import { saveEmail } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Get IP address and user agent for analytics
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                      request.headers.get('x-real-ip') ||
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Save email to database
    const result = saveEmail({
      email: email.toLowerCase().trim(),
      source: 'landing_page',
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    if (!result.success) {
      if (result.error === 'Email already subscribed') {
        return NextResponse.json(
          { message: 'You are already subscribed!' },
          { status: 200 } // Return 200 to avoid showing error to user
        );
      }
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for subscribing!',
      id: result.id,
    });

  } catch (error) {
    console.error('Error in subscribe endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to process subscription' },
      { status: 500 }
    );
  }
}
