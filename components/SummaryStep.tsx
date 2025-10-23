'use client';

'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { WizardContainer } from './WizardContainer';

interface SummaryStepProps {
  summary: string;
  onNext: () => void;
  onStartOver: () => void;
}

export const SummaryStep: React.FC<SummaryStepProps> = ({ summary, onNext, onStartOver }) => {
  const [isNavigating, setIsNavigating] = useState(false);

  const handleNextClick = () => {
    setIsNavigating(true);
    onNext();
  };

  return (
    <WizardContainer title="Overall Summary">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
            <button
                onClick={onStartOver}
                className="w-full order-last sm:order-first sm:w-auto inline-flex items-center justify-center gap-x-2 rounded-md bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-300 shadow-sm hover:bg-slate-700 transition-all duration-200"
            >
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M15.312 5.312a.75.75 0 0 1 0 1.061L11.873 10l3.439 3.439a.75.75 0 1 1-1.06 1.06L10.812 11.06l-3.439 3.439a.75.75 0 1 1-1.06-1.06L9.752 10 6.313 6.561a.75.75 0 1 1 1.06-1.06L10.812 8.94l3.439-3.439a.75.75 0 0 1 1.061 0Z" clipRule="evenodd" />
                </svg>
                Start Over
            </button>
            <button
                onClick={handleNextClick}
                disabled={isNavigating}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-x-2 rounded-md bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isNavigating ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                    </>
                ) : (
                    <>
                        Continue to Detailed Analysis
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M2 10a.75.75 0 0 1 .75-.75h12.59l-2.1-1.95a.75.75 0 1 1 1.02-1.1l3.5 3.25a.75.75 0 0 1 0 1.1l-3.5 3.25a.75.75 0 1 1-1.02-1.1l2.1-1.95H2.75A.75.75 0 0 1 2 10Z" clipRule="evenodd" />
                        </svg>
                    </>
                )}
            </button>
        </div>
    </WizardContainer>
  );
};