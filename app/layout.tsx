import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NetworkJoin Pro - Investment & WebView Platform',
  description: 'Smart investment amount and network earning platform with responsive dual layouts: desktop executive dashboard and native mobile app with smooth right-to-left slide animations.',
  openGraph: {
    title: 'NetworkJoin Pro - Investment & WebView Platform',
    description: 'Smart investment amount and network earning platform with responsive dual layouts: desktop executive dashboard and native mobile app with smooth right-to-left slide animations.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NetworkJoin Pro - Investment & WebView Platform',
    description: 'Smart investment amount and network earning platform with responsive dual layouts.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#faf6ee] text-[#46280b] w-full min-h-screen selection:bg-[#d9a54c] selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
