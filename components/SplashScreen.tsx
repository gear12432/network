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
  duration = 2000,
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
        setTimeout(onComplete, 200);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-50 flex flex-col justify-between items-center bg-[#070b12] text-white p-6 overflow-hidden select-none"
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
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#894b0a] via-[#d0872e] to-[#fbd38d] p-[2px] shadow-2xl shadow-[#d0872e]/30 flex items-center justify-center">
              <div className="w-full h-full bg-[#0d131f] rounded-[22px] flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#d0872e]/20 via-transparent to-transparent pointer-events-none" />
                <Award className="w-11 h-11 text-[#fbd38d] drop-shadow-md" />
              </div>
            </div>
            {/* Pulsing ring */}
            <div className="absolute -inset-2 rounded-3xl border border-[#d0872e]/30 animate-pulse pointer-events-none" />
          </motion.div>

          <motion.h1
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-serif font-black text-2xl sm:text-3xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#ffe4ab] via-[#f7c26d] to-[#d0872e]"
          >
            {appName}
          </motion.h1>

          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs text-[#c9b189] font-medium mt-2 tracking-wide"
          >
            Secure Financial Ecosystem • 24/7 Instant Yield & Returns
          </motion.p>
        </div>

        {/* Bottom Progress & Cloud Trust */}
        <div className="w-full max-w-xs flex flex-col items-center pb-6 space-y-4">
          {/* Progress bar */}
          <div className="w-full bg-[#172033] h-1.5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#d0872e] to-[#fed179]"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>

          <div className="flex items-center justify-between w-full text-[11px] text-[#ab9471]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#52c41a]" />
              Cloud Firestore Verified
            </span>
            <span className="font-mono text-[#d0872e] font-bold">{progress}%</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
