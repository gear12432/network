import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="bg-[#F2F8FC] text-[#172B75] flex flex-col items-center justify-center min-h-screen p-6 text-center font-sans">
      <h1 className="text-4xl font-black text-[#002E6E] mb-2 tracking-tight">404</h1>
      <p className="text-sm text-[#172B75]/70 mb-6 font-medium">Page Not Found</p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-[#002E6E] text-white font-bold text-sm shadow-md hover:bg-[#002252] border border-[#00B9F1]/30 transition-all"
      >
        Return to Home
      </Link>
    </div>

  );
}
