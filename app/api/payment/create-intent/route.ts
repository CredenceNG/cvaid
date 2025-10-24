/**
 * POST /api/payment/create-intent
 *
 * Create a Stripe PaymentIntent for resume analysis purchase
 *
 * @body { email?: string }
 * @returns { clientSecret: string, amount: number }
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

// Resume analysis pricing
const RESUME_ANALYSIS_PRICE = 500; // $5.00 in cents

export async function POST(request: NextRequest) {
  console.log('🔵 [Payment] Creating PaymentIntent for resume analysis...');

  try {
    // Parse request body (email is optional)
    const body = await request.json();
    const { email } = body;

    console.log('🔵 [Payment] User email:', email || 'Guest (no email)');

    // Verify Stripe key
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('🔴 [Payment] STRIPE_SECRET_KEY not configured');
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      );
    }

    // Create Stripe PaymentIntent
    console.log('🔵 [Payment] Creating Stripe PaymentIntent...');
    const paymentIntent = await stripe.paymentIntents.create({
      amount: RESUME_ANALYSIS_PRICE,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        product: 'resume_analysis',
        user_email: email || 'guest',
        purchase_type: email ? 'authenticated' : 'guest',
      },
      description: 'Resume Analysis - Full Feedback & Refined Copy',
      ...(email && { receipt_email: email }), // Send receipt if email provided
    });

    console.log('✅ [Payment] PaymentIntent created:', paymentIntent.id);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: RESUME_ANALYSIS_PRICE,
    });
  } catch (error) {
    console.error('🔴 [Payment] Error creating PaymentIntent:', error);

    return NextResponse.json(
      {
        error: 'Failed to create payment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
