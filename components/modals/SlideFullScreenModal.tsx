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
          className="fixed inset-0 z-50 bg-slate-50 flex flex-col w-full h-full overflow-hidden shadow-2xl"
        >
          {/* Top Sticky App Navigation Bar */}
          <header className="sticky top-0 z-20 bg-white border-b border-slate-200/90 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <button
                onClick={onClose}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-90 text-slate-800 flex items-center justify-center transition-all shadow-2xs shrink-0"
                title="Go Back"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              </button>

              <div className="leading-tight min-w-0">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight truncate">{title}</h3>
                {subtitle && <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">{subtitle}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {headerRight}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors"
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
