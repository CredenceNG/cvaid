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

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover'  // Latest version matching your Stripe account
}) : null;

// Resume analysis pricing
const RESUME_ANALYSIS_PRICE = 500; // $5.00 in cents

export async function POST(request: NextRequest) {
  try {
    // Parse request body (email is optional)
    const body = await request.json();
    const { email } = body;

    // Verify Stripe key
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      );
    }

    // Create Stripe PaymentIntent
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
    }) : null;

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: RESUME_ANALYSIS_PRICE,
    }) : null;
  } catch (error) {
    console.error('Error creating PaymentIntent:', error);

    return NextResponse.json(
      {
        error: 'Failed to create payment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
