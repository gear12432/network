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
      <body className="bg-[#F2F8FC] text-[#172B75] flex flex-col items-center justify-center min-h-screen p-6 text-center font-sans">
        <h1 className="text-4xl font-black text-[#002E6E] mb-2 tracking-tight">500</h1>
        <p className="text-sm text-[#172B75]/70 mb-6 font-medium">Something went wrong</p>
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 rounded-xl bg-[#002E6E] text-white font-bold text-sm shadow-md hover:bg-[#002252] border border-[#00B9F1]/30 transition-all cursor-pointer"
        >
          Try again
        </button>
      </body>

    </html>
  );
}
