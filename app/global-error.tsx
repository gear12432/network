'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <head>
        <title>Server Error</title>
      </head>
      <body className="bg-[#1c1007] text-white flex flex-col items-center justify-center min-h-screen p-6 text-center font-sans">
        <h1 className="text-4xl font-black text-[#ffd485] mb-2">500</h1>
        <p className="text-sm text-[#cfbc9e] mb-6">Something went wrong</p>
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 rounded-xl bg-[#d0872e] text-white font-bold text-sm shadow-lg hover:bg-[#b87324] transition-all cursor-pointer"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
