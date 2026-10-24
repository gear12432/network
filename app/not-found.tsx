import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1c1007] text-white p-6 text-center">
      <h1 className="text-4xl font-serif font-black text-[#ffd485] mb-2">404</h1>
      <p className="text-sm text-[#cfbc9e] mb-6">Page Not Found</p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-[#d0872e] text-white font-bold text-sm shadow-lg hover:bg-[#b87324] transition-all"
      >
        Return to Home
      </Link>
    </div>
  );
}
