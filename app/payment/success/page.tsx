/**
 * Payment Success Page
 *
 * Shown after successful payment
 * Verifies payment and redirects to results
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Check, Loader2 } from 'lucide-react';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const paymentIntent = searchParams.get('payment_intent');
      const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');

      if (!paymentIntent) {
        setStatus('error');
        setError('No payment information found');
        return;
      }

      try {
        // Verify payment with backend
        const response = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId: paymentIntent,
            clientSecret: paymentIntentClientSecret,
          }),
        });

        if (!response.ok) {
          throw new Error('Payment verification failed');
        }

        const data = await response.json();

        if (data.success) {
          setStatus('success');

          // Mark as unlocked in localStorage
          const savedStateJSON = localStorage.getItem('resumeOptimizerState');
          if (savedStateJSON) {
            const savedState = JSON.parse(savedStateJSON);
            savedState.isUnlocked = true;
            localStorage.setItem('resumeOptimizerState', JSON.stringify(savedState));
          }

          // Redirect to home page after 2 seconds
          setTimeout(() => {
            router.push('/?payment=success');
          }, 2000);
        } else {
          setStatus('error');
          setError('Payment verification failed');
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700">
        <div className="text-center">
          {status === 'verifying' && (
            <>
              <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Verifying Payment</h2>
              <p className="text-slate-400">Please wait while we confirm your payment...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
              <p className="text-slate-400 mb-6">
                Your resume analysis is now unlocked. Redirecting you back...
              </p>
              <div className="flex items-center justify-center gap-2 text-cyan-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Redirecting...</span>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Payment Error</h2>
              <p className="text-slate-400 mb-6">{error || 'Something went wrong'}</p>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-cyan-600 text-white rounded-xl font-semibold hover:bg-cyan-500 transition-all"
              >
                Return to Home
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
