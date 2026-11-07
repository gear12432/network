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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F2F8FC] text-[#172B75] p-6 text-center select-none font-sans">
      <div className="w-16 h-16 rounded-2xl bg-[#002E6E]/10 border-2 border-[#00B9F1]/40 text-[#002E6E] flex items-center justify-center mb-4 shadow-xl">
        <svg className="w-8 h-8 text-[#002E6E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <h1 className="text-2xl sm:text-3xl font-black text-[#002E6E] mb-2 tracking-tight">
        Network Join Pro
      </h1>
      <p className="text-xs sm:text-sm text-[#172B75]/80 max-w-sm mb-6 leading-relaxed">
        Refreshing application... Click below to open dashboard.
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={handleResetAndReload}
          className="px-6 py-3 rounded-xl bg-[#002E6E] hover:bg-[#002252] text-white font-bold text-xs sm:text-sm shadow-lg shadow-[#002E6E]/20 transition-all cursor-pointer active:scale-95 border border-[#00B9F1]/30"
        >
          Open Dashboard
        </button>
      </div>

    </div>
  );
}
