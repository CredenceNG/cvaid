import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover',
    })
  : null;

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    const { priceId } = await request.json();

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    // Get the origin from the request or use environment variable as fallback
    const origin = request.headers.get('origin') ||
                   request.headers.get('referer')?.replace(/\/$/, '') ||
                   process.env.NEXT_PUBLIC_CLIENT_URL ||
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded',
      mode: 'payment',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      customer_creation: 'if_required',
      return_url: `${origin}?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      clientSecret: session.client_secret,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
