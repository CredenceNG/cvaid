'use client';

'use client';


import React from 'react';
import { LogoIcon } from './icons/LogoIcon';

export const Header: React.FC = () => {
  return (
    <header className="py-6 px-4 border-b border-slate-700/50 bg-slate-900/70 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto flex items-center justify-center text-center">
        <LogoIcon className="h-10 w-10 text-cyan-400 mr-3" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Resume Optimizer AI
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Get AI-powered feedback to land your dream job.
          </p>
        </div>
      </div>
    </header>
  );
};
