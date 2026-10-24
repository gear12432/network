'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Sparkles, Award } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
  appName?: string;
  duration?: number;
}

export default function SplashScreen({
  onComplete,
  appName = 'NETWORK JOIN PRO',
  duration = 3000,
}: SplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (elapsed >= duration) {
        clearInterval(interval);
        setTimeout(onComplete, 250);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  // Radius = 28 -> Circumference = 2 * π * 28 ≈ 175.93
  const circumference = 175.93;
  const strokeDashoffset = circumference - (circumference * progress) / 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-50 flex flex-col justify-between items-center bg-gradient-to-b from-[#1c1007] via-[#281508] to-[#120903] text-white p-6 overflow-hidden select-none"
      >
        {/* Ambient Glows */}
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-[#d0872e]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[#ffd485]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Tag */}
        <div className="w-full flex items-center justify-between pt-6 text-xs text-[#dfbe7e]/80">
          <div className="flex items-center gap-1.5 font-medium tracking-wider uppercase text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-[#d0872e]" />
            <span>High-Yield Network Portal</span>
          </div>
          <span className="font-mono text-[10px] text-[#dfbe7e]/60">v2.5 Enterprise</span>
        </div>

        {/* Center Emblem & Branding */}
        <div className="flex flex-col items-center text-center my-auto">
          {/* Animated Golden Medallion */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15, delay: 0.1 }}
            className="relative mb-6"
          >
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#894b0a] via-[#d0872e] to-[#ffd485] p-[2px] shadow-2xl shadow-[#d0872e]/30 flex items-center justify-center">
              <div className="w-full h-full bg-[#28170c] rounded-[22px] flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#d0872e]/20 via-transparent to-transparent pointer-events-none" />
                <Award className="w-11 h-11 text-[#ffd485] drop-shadow-md" />
              </div>
            </div>
            {/* Pulsing ring */}
            <div className="absolute -inset-2 rounded-3xl border border-[#d0872e]/30 animate-pulse pointer-events-none" />
          </motion.div>

          <motion.h1
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-serif font-black text-2xl sm:text-3xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#ffe4ab] via-[#ffd485] to-[#d0872e]"
          >
            {appName}
          </motion.h1>

          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs text-[#cfbc9e] font-medium mt-2 tracking-wide"
          >
            Secure Financial Ecosystem • 24/7 Instant Yield & Returns
          </motion.p>
        </div>

        {/* Bottom Circular Rotating Progress Spinner (3 Seconds) */}
        <div className="w-full max-w-xs flex flex-col items-center pb-8 space-y-3.5">
          {/* Circular Round Spinner rotating for 3 seconds */}
          <div className="relative w-18 h-18 flex items-center justify-center">
            {/* Outer spinning dashed ring */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#d0872e]/40 animate-spin [animation-duration:3s]" />

            {/* SVG Circular Progress Track and Fill */}
            <svg className="w-16 h-16 -rotate-90 drop-shadow-md" viewBox="0 0 64 64">
              <defs>
                <linearGradient id="splashGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffd485" />
                  <stop offset="50%" stopColor="#d0872e" />
                  <stop offset="100%" stopColor="#894b0a" />
                </linearGradient>
              </defs>
              {/* Background circle */}
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#3f2410"
                strokeWidth="4"
                fill="none"
              />
              {/* Foreground progress circle */}
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="url(#splashGoldGrad)"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-75 ease-out"
              />
            </svg>

            {/* Center golden emblem dot / sparkle instead of numerical timer */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ffd485] shadow-lg shadow-[#d0872e] animate-pulse" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-[#dfbe7e] font-medium">
            <ShieldCheck className="w-4 h-4 text-[#52c41a]" />
            <span>Loading Secure Ecosystem...</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
