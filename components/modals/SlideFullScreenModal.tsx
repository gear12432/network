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
  theme?: 'white' | 'gold';
}

export default function SlideFullScreenModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  headerRight,
  theme = 'white',
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

  const isWhite = theme === 'white';

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
          className={`fixed inset-0 z-50 flex flex-col w-full h-full overflow-hidden shadow-2xl ${
            isWhite ? 'bg-white text-slate-900' : 'bg-[#faf6ee] text-[#46280b]'
          }`}
        >
          {/* Top Sticky App Navigation Bar */}
          <header
            className={`sticky top-0 z-20 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 shadow-xs backdrop-blur-md ${
              isWhite
                ? 'bg-white/95 border-b border-slate-200'
                : 'bg-[#faf6ee]/95 border-b-2 border-[#dfbe7e]'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <button
                onClick={onClose}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all shadow-xs shrink-0 cursor-pointer ${
                  isWhite
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    : 'bg-[#fff7ea] hover:bg-[#faecd4] text-[#55361e] border-2 border-[#dfbe7e]'
                }`}
                title="Go Back"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              </button>

              <div className="leading-tight min-w-0">
                <h3
                  className={`text-sm sm:text-base font-black tracking-tight truncate ${
                    isWhite ? 'text-slate-900 font-sans' : 'text-[#46280b] font-serif'
                  }`}
                >
                  {title}
                </h3>
                {subtitle && (
                  <p
                    className={`text-[10px] sm:text-[11px] font-medium truncate ${
                      isWhite ? 'text-slate-500' : 'text-[#8a5b28]'
                    }`}
                  >
                    {subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {headerRight}
              <button
                onClick={onClose}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  isWhite
                    ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-[#7a5328] hover:text-[#46280b] hover:bg-[#f4e4c2]'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Full Screen Scrollable Body */}
          <div
            className={`flex-1 overflow-y-auto p-4 sm:p-5 max-w-2xl mx-auto w-full ${
              isWhite ? 'bg-slate-50/60' : 'bg-[#faf6ee]'
            }`}
          >
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
