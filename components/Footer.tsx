'use client';

'use client';


import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="py-4 px-4 mt-8 border-t border-slate-700/50">
            <div className="container mx-auto text-center text-sm text-slate-500">
                <p>&copy; {new Date().getFullYear()} Resume Optimizer AI. All rights reserved.</p>
            </div>
        </footer>
    );
};
