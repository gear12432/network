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
          className="fixed inset-0 z-50 bg-[#faf6ee] text-[#46280b] flex flex-col w-full h-full overflow-hidden shadow-2xl"
        >
          {/* Top Sticky App Navigation Bar - Home Screen Luxury Palette */}
          <header className="sticky top-0 z-20 bg-[#faf6ee]/95 backdrop-blur-md border-b-2 border-[#dfbe7e] px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <button
                onClick={onClose}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#fff7ea] hover:bg-[#faecd4] active:scale-90 text-[#55361e] border-2 border-[#dfbe7e] flex items-center justify-center transition-all shadow-xs shrink-0 cursor-pointer"
                title="Go Back"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              </button>

              <div className="leading-tight min-w-0">
                <h3 className="text-sm sm:text-base font-serif font-black text-[#46280b] tracking-tight truncate">{title}</h3>
                {subtitle && <p className="text-[10px] sm:text-[11px] text-[#8a5b28] font-medium truncate">{subtitle}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {headerRight}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full text-[#7a5328] hover:text-[#46280b] hover:bg-[#f4e4c2] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Full Screen Scrollable Body with Home Screen background */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 max-w-2xl mx-auto w-full bg-[#faf6ee]">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
