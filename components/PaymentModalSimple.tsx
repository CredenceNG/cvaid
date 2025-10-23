'use client';

import React, { useState } from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  price: number;
}

// ============================================
// SIMPLE STRIPE PAYMENT LINK SETUP (5 MINUTES)
// ============================================
//
// 1. Go to: https://dashboard.stripe.com/payment-links/create
// 2. Fill in:
//    - Product name: "Resume Analysis - Premium"
//    - Price: 5.00 USD
//    - Quantity: Fixed at 1
// 3. Under "After payment":
//    - Select "Don't show confirmation page"
//    - Redirect URL: http://localhost:3001/?payment_success=true
//    - (In production, use your actual domain)
// 4. Click "Create link"
// 5. Copy the Payment Link URL and paste below
//
// SECURITY NOTE: This is a simple implementation suitable for:
// - Low-value transactions ($5-$20)
// - MVP/prototype testing
// - Quick launches
//
// For production with high-value items, use the full backend integration.
// ============================================

const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_REPLACE_WITH_YOUR_LINK';

export const PaymentModalSimple: React.FC<PaymentModalProps> = ({ isOpen, onClose, price }) => {
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePayment = () => {
    setError(null);

    // Check if Payment Link is configured
    if (!STRIPE_PAYMENT_LINK || STRIPE_PAYMENT_LINK.includes('REPLACE')) {
      setError('Payment not configured. Please set up your Stripe Payment Link (see code comments).');
      return;
    }

    // Simply redirect to Stripe Payment Link
    window.location.href = STRIPE_PAYMENT_LINK;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="fixed inset-0" onClick={onClose}></div>
      <div className="relative w-full max-w-md p-6 m-4 bg-slate-800 border border-slate-700 rounded-lg shadow-xl text-white">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-cyan-400">Unlock Full Analysis</h3>
          <p className="mt-2 text-slate-300">
            Get detailed section-by-section feedback, refined resume copy, and a professional cover letter.
          </p>
          <div className="my-6">
            <span className="text-5xl font-extrabold">${price}</span>
            <span className="text-slate-400">.00 USD</span>
          </div>
          <p className="text-sm text-slate-400">One-time payment • Instant access</p>
        </div>

        {error && (
          <div className="my-4 text-center text-sm text-red-400 bg-red-900/30 p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-3">
          <button
            onClick={handlePayment}
            className="w-full inline-flex justify-center items-center gap-x-2 rounded-md bg-cyan-600 px-4 py-3 text-base font-semibold text-white shadow-sm hover:bg-cyan-500 transition-all duration-200"
          >
            Pay with Stripe
          </button>
          <button
            onClick={onClose}
            className="w-full inline-flex justify-center rounded-md bg-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 shadow-sm hover:bg-slate-600"
          >
            Cancel
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-slate-400">
            🔒 Secure payment powered by Stripe
          </p>
        </div>
      </div>
    </div>
  );
};
