'use client';

import React, { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error caught by Next.js Error Boundary:', error);
  }, [error]);

  const handleResetAndReload = () => {
    try {
      if (typeof window !== 'undefined') {
        window.location.href = './';
      }
    } catch {
      reset();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d131f] text-white p-6 text-center select-none font-sans">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-400 flex items-center justify-center mb-4 shadow-xl">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <h1 className="text-2xl sm:text-3xl font-serif font-black text-amber-300 mb-2">
        Something went wrong
      </h1>
      <p className="text-xs sm:text-sm text-slate-300 max-w-sm mb-6 leading-relaxed">
        An unexpected error occurred. Click below to reload Network Join Pro and return to the main dashboard.
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={handleResetAndReload}
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all cursor-pointer active:scale-95"
        >
          Try again & Return Home
        </button>
      </div>
    </div>
  );
}
