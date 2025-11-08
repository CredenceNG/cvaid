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
        { error: 'Payment system not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { sessionId, paymentIntentId } = body;

    // Support both old checkout session and new payment intent
    if (paymentIntentId) {
      // New payment flow using PaymentIntent
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        return NextResponse.json({
          success: true,
          paymentStatus: paymentIntent.status,
          customerEmail: paymentIntent.metadata.user_email || null,
          amountTotal: paymentIntent.amount,
          currency: paymentIntent.currency,
          accessToken: Buffer.from(`${paymentIntentId}:${Date.now()}`).toString('base64'),
        });
      } else {
        return NextResponse.json({
          success: false,
          paymentStatus: paymentIntent.status,
        });
      }
    } else if (sessionId) {
      // Old payment flow using Checkout Session (backward compatibility)
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status === 'paid') {
        return NextResponse.json({
          success: true,
          paymentStatus: session.payment_status,
          customerEmail: session.customer_details?.email,
          amountTotal: session.amount_total,
          currency: session.currency,
          accessToken: Buffer.from(`${sessionId}:${Date.now()}`).toString('base64'),
        });
      } else {
        return NextResponse.json({
          success: false,
          paymentStatus: session.payment_status,
        });
      }
    } else {
      return NextResponse.json(
        { error: 'Session ID or Payment Intent ID is required' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
