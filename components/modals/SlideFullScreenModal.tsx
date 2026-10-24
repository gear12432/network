'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, X } from 'lucide-react';

interface SlideFullScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}

export default function SlideFullScreenModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  headerRight,
}: SlideFullScreenModalProps) {
  // Prevent background scrolling while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="slide-screen"
          initial={{ x: '100%', opacity: 0.95 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0.95 }}
          transition={{
            type: 'spring',
            damping: 26,
            stiffness: 260,
            mass: 0.85,
          }}
          className="fixed inset-0 z-50 bg-gradient-to-b from-[#1c1007] via-[#281508] to-[#120903] text-[#ffeec9] flex flex-col w-full h-full overflow-hidden shadow-2xl"
        >
          {/* Top Sticky App Navigation Bar - Dark Bronze Luxury Palette */}
          <header className="sticky top-0 z-20 bg-gradient-to-r from-[#2b1706] via-[#3a200a] to-[#200f04] border-b border-[#dfbe7e]/35 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 shadow-md">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <button
                onClick={onClose}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#4e2e0f] hover:bg-[#613b15] active:scale-90 text-[#fed788] border border-[#dfbe7e]/40 flex items-center justify-center transition-all shadow-xs shrink-0 cursor-pointer"
                title="Go Back"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              </button>

              <div className="leading-tight min-w-0">
                <h3 className="text-sm sm:text-base font-serif font-black text-white tracking-tight truncate">{title}</h3>
                {subtitle && <p className="text-[10px] sm:text-[11px] text-[#dfbe7e] font-medium truncate">{subtitle}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {headerRight}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full text-[#dfbe7e] hover:text-white hover:bg-[#4e2e0f] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Full Screen Scrollable Body with smooth padding */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-2xl mx-auto w-full">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
