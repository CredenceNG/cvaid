'use client';

import React from 'react';

interface WizardContainerProps {
  title: string;
  children: React.ReactNode;
}

export const WizardContainer: React.FC<WizardContainerProps> = ({ title, children }) => {
  return (
    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 min-h-[500px] flex flex-col">
      <h2 className="text-xl font-semibold text-white mb-4 flex-shrink-0">{title}</h2>
      <div className="flex-grow bg-slate-900/80 rounded-md p-6 overflow-y-auto ring-1 ring-slate-700">
        <div className="prose prose-invert prose-sm sm:prose-base max-w-none">
            {children}
        </div>
      </div>
    </div>
  );
};
