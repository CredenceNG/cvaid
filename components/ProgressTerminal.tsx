'use client';

import React, { useEffect, useState } from 'react';

interface ProgressTerminalProps {
  isVisible: boolean;
}

const steps = [
  { text: '> Initializing AI analysis engine...', delay: 200 },
  { text: '> Parsing resume content...', delay: 600 },
  { text: '> Analyzing professional experience...', delay: 1200 },
  { text: '> Evaluating skills and qualifications...', delay: 1800 },
  { text: '> Checking ATS compatibility...', delay: 2400 },
  { text: '> Generating improvement suggestions...', delay: 3000 },
  { text: '> Creating refined resume copy...', delay: 3800 },
  { text: '> Drafting cover letter...', delay: 4600 },
  { text: '> Finalizing recommendations...', delay: 5200 },
  { text: '✓ Analysis complete!', delay: 5800, success: true },
];

export const ProgressTerminal: React.FC<ProgressTerminalProps> = ({ isVisible }) => {
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  // Reset state when visibility changes
  useEffect(() => {
    if (!isVisible) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisibleSteps([]);
      setCurrentStep(0);
    }
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length) {
          setVisibleSteps((existing) => {
            // Only add if not already present
            if (!existing.includes(prev)) {
              return [...existing, prev];
            }
            return existing;
          });
          return prev + 1;
        }
        return prev;
      });
    }, 600);

    return () => clearInterval(timer);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="bg-slate-900 border border-cyan-900/50 rounded-lg p-4 font-mono text-sm overflow-hidden">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-700">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <span className="text-slate-400 text-xs">AI Analysis Terminal</span>
      </div>
      <div className="space-y-1.5 max-h-64 overflow-y-auto">
        {visibleSteps.map((stepIndex) => {
          const step = steps[stepIndex];
          return (
            <div
              key={stepIndex}
              className={`flex items-center gap-2 ${
                step.success ? 'text-green-400' : 'text-cyan-300'
              } animate-fade-in`}
            >
              <span>{step.text}</span>
              {stepIndex === currentStep - 1 && !step.success && (
                <span className="animate-pulse">_</span>
              )}
            </div>
          );
        })}
        {currentStep === steps.length && (
          <div className="mt-2 pt-2 border-t border-slate-700 text-slate-400 text-xs">
            Ready to view results
          </div>
        )}
      </div>
    </div>
  );
};
