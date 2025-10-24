/**
 * Payment Page
 *
 * Allows users to complete payment for resume analysis
 * Uses Stripe Elements with PaymentElement for secure payment
 */

'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ArrowLeft, Shield, CreditCard, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Load Stripe with publishable key
// NOTE: Turbopack in Next.js 16 has a caching bug where it loads stale NEXT_PUBLIC_ env var values
// We check if the env var contains a placeholder and use the correct fallback if needed
// For Netlify production: Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in environment variables
const envKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const isPlaceholder = !envKey || envKey.includes('your_') || envKey.includes('placeholder');
const STRIPE_PUBLISHABLE_KEY = isPlaceholder
  ? 'pk_test_51RbCRcGpNFb6poEprE9rjGrL1ErCMRGpNnNNdOCFTWG7ejTGAkHVPTH67lccdpv094ajI1ftGa2w1NqnxCPwVDee00ltDfVoDJ'
  : envKey;

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

export default function PaymentPage() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isCreatingPayment, setIsCreatingPayment] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        setIsCreatingPayment(true);
        setError(null);

        const response = await fetch('/api/payment/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: undefined }),
        });

        if (!response.ok) {
          throw new Error('Failed to create payment');
        }

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error('Error creating payment:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize payment');
      } finally {
        setIsCreatingPayment(false);
      }
    };

    createPaymentIntent();
  }, []);

  if (isCreatingPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-300">Preparing secure checkout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Payment Error</h2>
            <p className="text-slate-400 mb-6">{error}</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-xl font-semibold hover:bg-cyan-500 transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Complete Your <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Purchase</span>
            </h1>
            <p className="text-xl text-slate-400">
              Unlock full resume analysis and refined copy
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className="bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">
              Payment Details
            </h2>
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'night',
                  variables: {
                    colorPrimary: '#06b6d4',
                    colorBackground: '#1e293b',
                    colorText: '#f1f5f9',
                    colorDanger: '#ef4444',
                    borderRadius: '12px',
                  },
                },
              }}
            >
              <CheckoutForm clientSecret={clientSecret} />
            </Elements>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center pb-4 border-b border-slate-700">
                  <span className="text-slate-300">Resume Analysis</span>
                  <span className="text-white font-semibold">$5.00</span>
                </div>
                <div className="flex justify-between items-center text-lg">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-cyan-400 font-bold">$5.00</span>
                </div>
              </div>
            </div>

            {/* What's Included */}
            <div className="bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-4">What&apos;s Included</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">Detailed section-by-section feedback</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">AI-powered improvement recommendations</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">Refined resume copy with enhancements</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300">Download in multiple formats</span>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
                <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Secure Payment</p>
              </div>
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
                <Check className="h-8 w-8 text-cyan-500 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Instant Access</p>
              </div>
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
                <CreditCard className="h-8 w-8 text-cyan-500 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Instant Access</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Stripe Checkout Form Component
 */
function CheckoutForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // PaymentElement ready state is managed via onReady callback

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`
        }
      });

      if (error) {
        setError(error.message || 'Payment failed');
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        onLoadError={(error) => {
          const errorMsg = error?.message || 'Unable to load payment form';
          setError(errorMsg);
        }}
        onReady={() => {
          setIsReady(true);
        }}
      />

      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || !isReady || isProcessing}
        className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition-all flex items-center justify-center gap-2"
      >
        {!isReady ? (
          <>
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            Loading payment form...
          </>
        ) : isProcessing ? (
          <>
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5" />
            Pay $5.00
          </>
        )}
      </button>

      <p className="text-xs text-slate-500 text-center">
        By completing this purchase, you agree to our Terms of Service and Privacy Policy.
        Payment processed securely by Stripe.
      </p>
    </form>
  );
}
