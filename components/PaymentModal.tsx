'use client';

import React, { useState, useEffect, useRef } from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  price: number;
}

// Get Stripe keys from environment variables (required for production)
const STRIPE_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_PUBLISHABLE_KEY) {
  console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set. Please add it to .env.local');
}
if (!STRIPE_PRICE_ID) {
  console.error('NEXT_PUBLIC_STRIPE_PRICE_ID is not set. Please add it to .env.local');
}

const createCheckoutSession = async (priceId: string) => {
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ priceId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create checkout session');
  }

  return await response.json();
};

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess, price }) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const checkoutRef = useRef<HTMLDivElement>(null);
  const stripeCheckoutRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      if (stripeCheckoutRef.current) {
        stripeCheckoutRef.current.destroy();
        stripeCheckoutRef.current = null;
      }
      return;
    }

    initializeCheckout();

    return () => {
      if (stripeCheckoutRef.current) {
        stripeCheckoutRef.current.destroy();
        stripeCheckoutRef.current = null;
      }
    };
  }, [isOpen]);

  const loadStripe = async () => {
    if (!(window as any).Stripe) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      document.head.appendChild(script);
      await new Promise((resolve) => { script.onload = resolve; });
    }
    return (window as any).Stripe(STRIPE_PUBLISHABLE_KEY);
  };

  const initializeCheckout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Initializing checkout with price ID:', STRIPE_PRICE_ID);

      if (!STRIPE_PRICE_ID) {
        throw new Error('Stripe price ID is not configured');
      }

      const stripe = await loadStripe();
      if (!stripe) throw new Error('Failed to load Stripe');
      console.log('Stripe loaded successfully');

      const response = await createCheckoutSession(STRIPE_PRICE_ID);
      console.log('Checkout session response:', response);

      const { clientSecret } = response;
      if (!clientSecret) throw new Error('No client secret in response');
      console.log('Client secret received');

      // Stop loading BEFORE mounting so the ref is available
      setIsLoading(false);

      // Wait for next tick to ensure DOM is updated
      await new Promise(resolve => setTimeout(resolve, 0));

      const checkout = await stripe.initEmbeddedCheckout({ clientSecret });
      console.log('Embedded checkout initialized');

      if (checkoutRef.current) {
        checkout.mount(checkoutRef.current);
        stripeCheckoutRef.current = checkout;
        console.log('Checkout mounted to DOM');
      } else {
        console.error('checkoutRef.current is null, cannot mount checkout');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to initialize payment');
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="fixed inset-0" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-800 border border-slate-700 rounded-xl shadow-2xl">
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="text-xl font-bold text-cyan-400">Secure Payment</h3>
            <p className="text-sm text-slate-400 mt-0.5">Unlock full analysis for ${price}.00</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <svg className="animate-spin h-12 w-12 text-cyan-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-slate-300 text-sm">Loading secure payment form...</p>
            </div>
          ) : (
            <div ref={checkoutRef} className="min-h-[400px]" style={{
              // Hide any payment link buttons that might confuse users
              // @ts-ignore
              '--stripe-payment-link-display': 'none'
            }}></div>
          )}
        </div>
        <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700 px-6 py-4">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Secured by Stripe • PCI DSS compliant
          </div>
        </div>
      </div>
    </div>
  );
};
