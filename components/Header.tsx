'use client';

import React from 'react';
import Link from 'next/link';
import { LogoIcon } from './icons/LogoIcon';

export const Header: React.FC = () => {
  return (
    <header className="py-6 px-4 border-b border-slate-700/50 bg-slate-900/70 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto flex items-center justify-center text-center">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <LogoIcon className="h-10 w-10 text-cyan-400" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent tracking-tight">
              Resumaizer
            </h1>
            <p className="text-sm sm:text-base text-slate-400">
              AI-Powered Resume Optimization
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
};
