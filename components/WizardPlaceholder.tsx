'use client';

'use client';

import React from 'react';
import { DocumentIcon } from './icons/DocumentIcon';
import { ProgressTerminal } from './ProgressTerminal';

interface WizardPlaceholderProps {
  isLoading: boolean;
  error: string | null;
}

const LoadingSkeleton: React.FC = () => (
    <div className="space-y-6">
      <ProgressTerminal isVisible={true} />
    </div>
  );
  
const InitialState: React.FC = () => (
    <div className="text-center text-slate-500 flex flex-col items-center justify-center h-full">
        <DocumentIcon className="h-16 w-16 mb-4"/>
        <h3 className="text-lg font-medium text-slate-400">Ready to Improve Your Resume?</h3>
        <p className="max-w-xs">Fill out the form and your personalized, AI-powered feedback will appear here.</p>
    </div>
);

export const WizardPlaceholder: React.FC<WizardPlaceholderProps> = ({ isLoading, error }) => {
  return (
    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 min-h-[500px] flex flex-col justify-center">
        {isLoading && <LoadingSkeleton />}
        {error && <div className="text-red-400 bg-red-900/30 p-4 rounded-md text-center">{error}</div>}
        {!isLoading && !error && <InitialState />}
    </div>
  );
};
