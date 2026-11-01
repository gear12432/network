'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1c1007] text-white p-6 text-center">
      <h1 className="text-4xl font-serif font-black text-[#ffd485] mb-2">Something went wrong</h1>
      <p className="text-sm text-[#cfbc9e] mb-6">An unexpected error occurred.</p>
      <div className="flex gap-3">
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 rounded-xl bg-[#d0872e] text-white font-bold text-sm shadow-lg hover:bg-[#b87324] transition-all cursor-pointer"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-slate-700 text-white font-bold text-sm shadow-lg hover:bg-slate-600 transition-all"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
