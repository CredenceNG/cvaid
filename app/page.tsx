'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { ResumeInputForm } from '@/components/ResumeInputForm';
import { Footer } from '@/components/Footer';
import { WizardPlaceholder } from '@/components/WizardPlaceholder';
import { SummaryStep } from '@/components/SummaryStep';
import { DetailsStep } from '@/components/DetailsStep';
import { RefinedCopyStep } from '@/components/RefinedCopyStep';
import { PaymentModal } from '@/components/PaymentModal';
import { CoverLetterStep } from '@/components/CoverLetterStep';

type Step = 'input' | 'summary' | 'details' | 'refined' | 'coverLetter';

const LOCAL_STORAGE_KEY = 'resumeOptimizerState';

// Service functions
const getResumeFeedback = async (resumeText: string, jobGoals: string, targetRequirements: string): Promise<string> => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resume: resumeText,
        goals: jobGoals,
        requirements: targetRequirements,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to analyze resume');
    }

    const data = await response.json();
    return data.feedback;
  } catch (error) {
    console.error("Error generating content from AI:", error);
    throw new Error("Failed to communicate with the AI service.");
  }
};

const verifyPayment = async (sessionId: string) => {
  try {
    const response = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to verify payment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

export default function Home() {
  const [resume, setResume] = useState<string>('');
  const [goals, setGoals] = useState<string>('');
  const [requirements, setRequirements] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [step, setStep] = useState<Step>('input');
  const [summary, setSummary] = useState('');
  const [details, setDetails] = useState('');
  const [refinedCopy, setRefinedCopy] = useState('');
  const [coverLetter, setCoverLetter] = useState('');

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  // Effect for state rehydration and payment success check
  useEffect(() => {
    // Rehydrate state from localStorage on page load
    try {
      const savedStateJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON);
        setSummary(savedState.summary || '');
        setDetails(savedState.details || '');
        setRefinedCopy(savedState.refinedCopy || '');
        setCoverLetter(savedState.coverLetter || '');
        setStep(savedState.step || 'input');
        setIsUnlocked(savedState.isUnlocked || false);
        setResume(savedState.resume || '');
        setGoals(savedState.goals || '');
        setRequirements(savedState.requirements || '');
      }
    } catch (e) {
      console.error("Failed to parse saved state from localStorage", e);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }

    // Check for payment success from Stripe redirect with server-side verification
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (sessionId) {
      console.log('Payment session detected - verifying with backend...');

      verifyPayment(sessionId)
        .then((result) => {
          if (result.success && result.paymentStatus === 'paid') {
            console.log('✅ Payment verified successfully!');
            setIsUnlocked(true);

            try {
              const savedStateJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
              if (savedStateJSON) {
                const savedState = JSON.parse(savedStateJSON);
                savedState.isUnlocked = true;
                savedState.paymentTimestamp = new Date().toISOString();
                savedState.sessionId = sessionId;
                savedState.customerEmail = result.customerEmail;
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedState));
              }
            } catch (e) {
              console.error("Failed to save unlock status", e);
            }

            setStep('details');

            setTimeout(() => {
              resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          } else {
            console.error('❌ Payment verification failed:', result);
            setError('Payment verification failed. Please contact support.');
          }
        })
        .catch((err) => {
          console.error('❌ Payment verification error:', err);
          setError('Unable to verify payment.');
        })
        .finally(() => {
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        });
    }
  }, []);

  const parsedResponse = useMemo(() => {
    return { summary, details, refinedCopy, coverLetter };
  }, [summary, details, refinedCopy, coverLetter]);

  const handleGenerateFeedback = useCallback(async () => {
    if (!resume.trim() || !goals.trim()) {
      setError('Please provide your resume and career goals.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setStep('input');

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

    try {
      const feedback = await getResumeFeedback(resume, goals, requirements);

      const extractSection = (text: string, startHeadingText: string, endHeadingText?: string): string => {
        const findHeading = (haystack: string, needle: string, fromIndex: number = 0): { index: number, fullHeading: string } | null => {
          const prefixes = ['###', '##', '#', '####', '#####', '######'];
          for (const prefix of prefixes) {
            const fullHeading = `${prefix} ${needle}`;
            const index = haystack.indexOf(fullHeading, fromIndex);
            if (index !== -1) {
              return { index, fullHeading };
            }
          }
          const boldHeading = `**${needle}**`;
          const boldIndex = haystack.indexOf(boldHeading, fromIndex);
          if (boldIndex !== -1) {
            return { index: boldIndex, fullHeading: boldHeading };
          }
          return null;
        };

        const startResult = findHeading(text, startHeadingText);
        if (!startResult) return '';

        const contentStartIndex = startResult.index + startResult.fullHeading.length;
        let endIndex = text.length;

        if (endHeadingText) {
          const endResult = findHeading(text, endHeadingText, contentStartIndex);
          if (endResult) {
            endIndex = endResult.index;
          }
        }
        return text.substring(contentStartIndex, endIndex).trim();
      };

      const cleanMarkdownCode = (text: string): string => {
        let cleanedText = text.trim();
        if (cleanedText.startsWith('```') && cleanedText.endsWith('```')) {
          cleanedText = cleanedText.substring(3, cleanedText.length - 3).trim();
          const firstLineEnd = cleanedText.indexOf('\n');
          if (firstLineEnd !== -1) {
            const firstLine = cleanedText.substring(0, firstLineEnd).trim();
            if (firstLine.length > 0 && !firstLine.includes(' ') && firstLine.match(/^[a-z]+$/)) {
              cleanedText = cleanedText.substring(firstLineEnd + 1).trim();
            }
          }
        }
        return cleanedText;
      };

      const findContentInCodeBlock = (text: string): string => {
        const codeBlockRegex = /```(?:[a-zA-Z]*\n)?([\s\S]+?)```/;
        const match = text.match(codeBlockRegex);
        if (match && match[1]) {
          return match[1].trim();
        }
        return cleanMarkdownCode(text);
      };

      const summaryText = cleanMarkdownCode(extractSection(feedback, 'Overall Summary', 'Section-by-Section Breakdown'));
      const detailsText = cleanMarkdownCode(extractSection(feedback, 'Section-by-Section Breakdown', 'Refined Resume Copy'));
      const refinedCopySection = extractSection(feedback, 'Refined Resume Copy', 'Cover Letter Draft');
      const refinedCopyText = findContentInCodeBlock(refinedCopySection);
      const coverLetterSection = extractSection(feedback, 'Cover Letter Draft');
      const coverLetterText = findContentInCodeBlock(coverLetterSection);

      setSummary(summaryText || 'Summary not generated.');
      setDetails(detailsText || 'Detailed breakdown not generated.');
      setRefinedCopy(refinedCopyText || 'Refined copy not generated.');
      setCoverLetter(coverLetterText || 'Cover letter not generated.');

      const stateToSave = {
        summary: summaryText,
        details: detailsText,
        refinedCopy: refinedCopyText,
        coverLetter: coverLetterText,
        step: 'summary',
        resume,
        goals,
        requirements,
        isUnlocked: false,
      };

      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
      } catch (storageError) {
        console.error("Failed to save state to localStorage:", storageError);
        setError('Failed to save your session. Please ensure your browser allows site data storage.');
        setIsLoading(false);
        return;
      }

      setStep('summary');

    } catch (err) {
      console.error(err);
      setError('Failed to get recommendations. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [resume, goals, requirements]);

  const handleStartOver = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setResume('');
    setGoals('');
    setRequirements('');
    setSummary('');
    setDetails('');
    setRefinedCopy('');
    setCoverLetter('');
    setError(null);
    setIsLoading(false);
    setIsUnlocked(false);
    setStep('input');
  };

  const handleUnlock = () => {
    setIsPaymentModalOpen(false);
    setIsUnlocked(true);

    try {
      const savedStateJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON);
        savedState.isUnlocked = true;
        savedState.paymentTimestamp = new Date().toISOString();
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedState));
      }
    } catch (e) {
      console.error("Failed to save unlock status", e);
    }

    setStep('details');
  };

  const TOKEN_PRICE_USD = 5;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-4 md:py-8">
        <div className="flex flex-col gap-6 md:gap-8">
          <ResumeInputForm
            resume={resume}
            setResume={setResume}
            goals={goals}
            setGoals={setGoals}
            requirements={requirements}
            setRequirements={setRequirements}
            onSubmit={handleGenerateFeedback}
            isLoading={isLoading}
            isReadOnly={step !== 'input'}
          />
          <div ref={resultsRef} className="w-full">
            {step === 'input' && <WizardPlaceholder isLoading={isLoading} error={error} />}
            {step === 'summary' && (
              <SummaryStep
                summary={parsedResponse.summary}
                onNext={() => setStep('details')}
                onStartOver={handleStartOver}
              />
            )}
            {step === 'details' && (
              <DetailsStep
                details={parsedResponse.details}
                isUnlocked={isUnlocked}
                onUnlock={() => setIsPaymentModalOpen(true)}
                onNext={() => setStep('refined')}
                onBack={() => setStep('summary')}
                onStartOver={handleStartOver}
              />
            )}
            {step === 'refined' && isUnlocked && (
              <RefinedCopyStep
                refinedCopy={parsedResponse.refinedCopy}
                feedback={details}
                onBack={() => setStep('details')}
                onNext={() => setStep('coverLetter')}
                onStartOver={handleStartOver}
              />
            )}
            {step === 'coverLetter' && isUnlocked && (
              <CoverLetterStep
                coverLetter={parsedResponse.coverLetter}
                onBack={() => setStep('refined')}
                onStartOver={handleStartOver}
              />
            )}
            {(step === 'refined' || step === 'coverLetter') && !isUnlocked && (
              <DetailsStep
                details={parsedResponse.details}
                isUnlocked={isUnlocked}
                onUnlock={() => setIsPaymentModalOpen(true)}
                onNext={() => setStep('refined')}
                onBack={() => setStep('summary')}
                onStartOver={handleStartOver}
              />
            )}
          </div>
        </div>
      </main>
      <Footer />
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handleUnlock}
        price={TOKEN_PRICE_USD}
      />
    </div>
  );
}
