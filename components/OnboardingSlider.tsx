'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronRight,
  ArrowRight,
  MapPin,
  MessageSquare,
  Bell,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface OnboardingSliderProps {
  onComplete?: () => void;
  isLoggedIn?: boolean;
}

export default function OnboardingSlider({ onComplete, isLoggedIn = false }: OnboardingSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0); // 0 to 100 over 3 seconds
  const [isTimerActive, setIsTimerActive] = useState(true);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const slides = [
    {
      id: 1,
      title: 'Explore New Possibilities',
      description: 'Discover a smarter and easier experience designed just for you.',
      tag: 'Explore',
    },
    {
      id: 2,
      title: 'Everything Made Simple',
      description: 'Enjoy a smooth, convenient, and effortless experience every day.',
      tag: 'Discover',
    },
    {
      id: 3,
      title: 'Your Journey Starts Here',
      description: 'Get ready to explore an amazing experience with our application.',
      tag: 'Get Started',
    },
  ];

  // 3-Second Countdown & Progress Logic on Launch
  useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const updateProgress = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const duration = 3000; // 3 seconds

      const currentProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(currentProgress);

      if (currentProgress < 100) {
        animationFrameId = requestAnimationFrame(updateProgress);
      } else {
        setIsTimerActive(false);
        // Check if user is already logged in
        const savedUser = typeof window !== 'undefined' ? localStorage.getItem('network_join_pro_user') : null;
        if (isLoggedIn || savedUser) {
          // Already logged in user -> Auto open Home Screen after 3 seconds
          if (onComplete) onComplete();
        }
      }
    };

    animationFrameId = requestAnimationFrame(updateProgress);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isLoggedIn, onComplete]);

  const handleNext = () => {
    setIsTimerActive(false);
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      if (onComplete) onComplete();
    }
  };

  const handleSkip = () => {
    setIsTimerActive(false);
    if (onComplete) onComplete();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isSwipeLeft = distance > 50;
    const isSwipeRight = distance < -50;

    if (isSwipeLeft && currentSlide < slides.length - 1) {
      setIsTimerActive(false);
      setCurrentSlide((prev) => prev + 1);
    } else if (isSwipeRight && currentSlide > 0) {
      setIsTimerActive(false);
      setCurrentSlide((prev) => prev - 1);
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="h-screen h-[100dvh] max-h-[100dvh] w-full bg-[#0d131f] flex items-center justify-center p-0 sm:p-4 select-none font-sans overflow-hidden">
      {/* Mobile-first Unified Screen Frame */}
      <div
        className="w-full max-w-md h-full max-h-[100dvh] sm:h-[840px] bg-white sm:rounded-[36px] shadow-2xl flex flex-col justify-between overflow-hidden relative border border-slate-100"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background Decorative Light-Blue Vector Shapes */}
        <div className="absolute top-0 left-0 right-0 h-72 overflow-hidden pointer-events-none z-0">
          <svg className="absolute -top-12 -left-12 w-64 h-64 text-[#A7DFF0]/25" viewBox="0 0 200 200" fill="currentColor">
            <path d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.2,72.9,41.8C64.4,54.4,53,65,39.6,72.8C26.2,80.6,10.8,85.6,-4.8,88.3C-20.4,91,-36.2,91.4,-49.8,85C-63.4,78.6,-74.8,65.4,-82.1,50.3C-89.4,35.2,-92.6,18.2,-91.3,1.8C-90,-14.6,-84.2,-30.4,-74.8,-43.3C-65.4,-56.2,-52.4,-66.2,-38.3,-73.4C-24.2,-80.6,-9,-85,5.1,-87.9C19.2,-90.8,30.6,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
          </svg>
          <svg className="absolute top-12 -right-16 w-72 h-72 text-[#119DB5]/10" viewBox="0 0 200 200" fill="currentColor">
            <path d="M39.9,-65.7C51.2,-58.5,59.6,-47.5,65.8,-35.2C72,-22.9,76,-9.3,75.4,4.2C74.8,17.7,69.6,31.1,61.1,41.9C52.6,52.7,40.8,60.9,28,66.3C15.2,71.7,1.4,74.3,-12.3,73.1C-26,71.9,-39.6,66.9,-50.7,58.3C-61.8,49.7,-70.4,37.5,-75.1,23.8C-79.8,10.1,-80.6,-5.1,-76.1,-18.8C-71.6,-32.5,-61.8,-44.7,-50.1,-52.1C-38.4,-59.5,-24.8,-62,-11.2,-63.5C2.4,-65,28.6,-72.9,39.9,-65.7Z" transform="translate(100 100)" />
          </svg>
        </div>

        {/* Top Header Bar with Tag and Top Right Skip */}
        <div className="relative z-10 px-5 pt-4 pb-1 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#119DB5]" />
            <span className="text-xs font-bold tracking-widest uppercase text-[#172B4D]">
              {slides[currentSlide].tag}
            </span>
          </div>

          <button
            onClick={handleSkip}
            className="text-xs font-bold text-slate-500 hover:text-[#172B4D] py-1 px-2.5 rounded-lg transition-colors cursor-pointer"
          >
            Skip
          </button>
        </div>

        {/* Slide Content Area */}
        <div className="relative z-10 flex-1 min-h-0 flex flex-col justify-between px-5 pt-1 pb-5 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden"
            >
              {/* Illustration Container */}
              <div className="w-full flex-1 min-h-0 max-h-[220px] xs:max-h-[260px] sm:max-h-[320px] flex items-center justify-center relative my-auto">
                {/* SLIDE 1: Explore */}
                {currentSlide === 0 && (
                  <div className="w-full h-full max-w-[260px] max-h-[260px] flex items-center justify-center relative">
                    <div className="w-52 h-52 rounded-full bg-[#A7DFF0]/30 border-2 border-[#A7DFF0]/50 absolute flex items-center justify-center">
                      <div className="w-40 h-40 rounded-full bg-[#119DB5]/10 animate-pulse" />
                    </div>

                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute top-2 right-2 bg-white p-2 rounded-xl shadow-md border border-slate-100 flex items-center gap-1.5 z-20"
                    >
                      <div className="p-1.5 bg-[#119DB5] text-white rounded-lg">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[9px] font-semibold text-[#758195]">Explore</p>
                        <p className="text-[11px] font-bold text-[#172B4D]">New Places</p>
                      </div>
                    </motion.div>

                    <svg className="w-48 h-48 sm:w-56 sm:h-56 relative z-10 drop-shadow-xl" viewBox="0 0 200 200" fill="none">
                      <ellipse cx="100" cy="180" rx="60" ry="8" fill="#172B4D" opacity="0.12" />
                      <g>
                        <rect x="42" y="110" width="34" height="48" rx="6" fill="#119DB5" />
                        <rect x="46" y="114" width="26" height="40" rx="3" fill="#0E8397" />
                        <circle cx="48" cy="160" r="3" fill="#172B4D" />
                        <circle cx="70" cy="160" r="3" fill="#172B4D" />
                        <path d="M54 110 V90 H64 V110" stroke="#172B4D" strokeWidth="3" strokeLinecap="round" />
                      </g>
                      <path d="M102 140 L90 178" stroke="#172B4D" strokeWidth="10" strokeLinecap="round" />
                      <path d="M110 140 L126 178" stroke="#119DB5" strokeWidth="10" strokeLinecap="round" />
                      <path d="M96 85 C96 75, 120 75, 120 85 L124 135 C124 142, 92 142, 92 135 Z" fill="#172B4D" />
                      <polygon points="104,85 112,85 110,110" fill="#A7DFF0" />
                      <path d="M96 90 L68 108" stroke="#172B4D" strokeWidth="8" strokeLinecap="round" />
                      <path d="M116 90 L132 110 L138 102" stroke="#172B4D" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                      <rect x="135" y="92" width="14" height="24" rx="3" fill="#119DB5" stroke="#FFFFFF" strokeWidth="1.5" />
                      <rect x="137" y="95" width="10" height="18" rx="1" fill="#FFFFFF" />
                      <circle cx="108" cy="62" r="14" fill="#F3A683" />
                      <path d="M94 62 C94 48, 122 48, 122 62 L124 62 C124 54, 116 52, 108 52 C98 52, 94 58, 94 62 Z" fill="#119DB5" />
                    </svg>
                  </div>
                )}

                {/* SLIDE 2: Discover */}
                {currentSlide === 1 && (
                  <div className="w-full h-full max-w-[260px] max-h-[260px] flex items-center justify-center relative">
                    <div className="w-52 h-52 rounded-full bg-[#A7DFF0]/25 absolute flex items-center justify-center">
                      <div className="w-36 h-36 rounded-full bg-white/80 shadow-inner" />
                    </div>

                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute top-2 left-2 bg-white p-2 rounded-xl shadow-md border border-slate-100 flex items-center gap-2 z-20"
                    >
                      <div className="p-1.5 bg-[#119DB5] text-white rounded-lg">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <p className="text-[11px] font-bold text-[#172B4D]">Instant Easy</p>
                          <CheckCircle2 className="w-3 h-3 text-[#119DB5]" />
                        </div>
                        <p className="text-[9px] text-[#758195]">Connected Everywhere</p>
                      </div>
                    </motion.div>

                    <svg className="w-48 h-48 sm:w-56 sm:h-56 relative z-10 drop-shadow-xl" viewBox="0 0 200 200" fill="none">
                      <ellipse cx="100" cy="178" rx="50" ry="7" fill="#172B4D" opacity="0.12" />
                      <path d="M92 135 L88 175" stroke="#172B4D" strokeWidth="10" strokeLinecap="round" />
                      <path d="M108 135 L112 175" stroke="#172B4D" strokeWidth="10" strokeLinecap="round" />
                      <path d="M82 82 C82 72, 118 72, 118 82 L120 135 C120 140, 80 140, 80 135 Z" fill="#119DB5" />
                      <path d="M82 90 L100 112" stroke="#0E8397" strokeWidth="8" strokeLinecap="round" />
                      <path d="M118 90 L100 112" stroke="#0E8397" strokeWidth="8" strokeLinecap="round" />
                      <g>
                        <rect x="88" y="92" width="24" height="42" rx="4" fill="#172B4D" stroke="#FFFFFF" strokeWidth="2" />
                        <rect x="91" y="96" width="18" height="34" rx="2" fill="#A7DFF0" />
                        <line x1="94" y1="102" x2="105" y2="102" stroke="#119DB5" strokeWidth="2" strokeLinecap="round" />
                        <line x1="94" y1="108" x2="101" y2="108" stroke="#172B4D" strokeWidth="1.5" strokeLinecap="round" />
                        <circle cx="100" cy="118" r="4" fill="#119DB5" />
                      </g>
                      <circle cx="100" cy="58" r="15" fill="#F3A683" />
                      <path d="M85 58 C85 42, 115 42, 115 58 C115 48, 85 48, 85 58 Z" fill="#172B4D" />
                      <rect x="92" y="56" width="7" height="5" rx="1" fill="#172B4D" />
                      <rect x="101" y="56" width="7" height="5" rx="1" fill="#172B4D" />
                    </svg>
                  </div>
                )}

                {/* SLIDE 3: Get Started */}
                {currentSlide === 2 && (
                  <div className="w-full h-full max-w-[260px] max-h-[260px] flex items-center justify-center relative">
                    <div className="w-52 h-52 rounded-full bg-[#119DB5]/10 animate-ping opacity-20 absolute" />
                    <div className="w-48 h-48 rounded-full bg-[#A7DFF0]/30 border border-[#119DB5]/30 absolute" />

                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute top-2 right-2 bg-white p-2 rounded-xl shadow-md border border-slate-100 flex items-center gap-2 z-20"
                    >
                      <div className="p-1.5 bg-[#172B4D] text-[#A7DFF0] rounded-lg relative">
                        <Bell className="w-4 h-4" />
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#119DB5] rounded-full border-2 border-white" />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-[#172B4D]">Ready to Start!</p>
                        <p className="text-[9px] text-[#758195]">Account Configured</p>
                      </div>
                    </motion.div>

                    <svg className="w-48 h-48 sm:w-56 sm:h-56 relative z-10 drop-shadow-xl" viewBox="0 0 200 200" fill="none">
                      <ellipse cx="100" cy="182" rx="65" ry="8" fill="#172B4D" opacity="0.14" />
                      <g>
                        <rect x="130" y="112" width="36" height="52" rx="7" fill="#172B4D" />
                        <rect x="134" y="116" width="28" height="44" rx="4" fill="#223E6C" />
                        <line x1="142" y1="112" x2="142" y2="164" stroke="#119DB5" strokeWidth="2" />
                        <line x1="154" y1="112" x2="154" y2="164" stroke="#119DB5" strokeWidth="2" />
                        <path d="M142 112 V92 H154 V112" stroke="#119DB5" strokeWidth="3" strokeLinecap="round" />
                      </g>
                      <path d="M80 138 L76 178" stroke="#172B4D" strokeWidth="11" strokeLinecap="round" />
                      <path d="M98 138 L102 178" stroke="#172B4D" strokeWidth="11" strokeLinecap="round" />
                      <path d="M72 82 C72 72, 108 72, 108 82 L112 138 C112 144, 68 144, 68 138 Z" fill="#119DB5" />
                      <polygon points="84,82 96,82 90,105" fill="#FFFFFF" />
                      <path d="M72 88 L58 104 L68 112" stroke="#0E8397" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M108 88 L122 102 L118 92" stroke="#0E8397" strokeWidth="7" strokeLinecap="round" />
                      <rect x="114" y="76" width="16" height="26" rx="3" fill="#172B4D" stroke="#FFFFFF" strokeWidth="1.5" />
                      <rect x="116" y="79" width="12" height="20" rx="1" fill="#A7DFF0" />
                      <circle cx="90" cy="56" r="15" fill="#F3A683" />
                      <path d="M75 56 C75 38, 105 38, 105 56 C105 44, 75 46, 75 56 Z" fill="#172B4D" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Text Area */}
              <div className="text-center px-2 my-auto shrink-0">
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#172B4D] tracking-tight mb-1">
                  {slides[currentSlide].title}
                </h2>
                <p className="text-xs sm:text-sm font-medium text-[#758195] leading-snug max-w-xs mx-auto">
                  {slides[currentSlide].description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Bottom Controls (Pagination Dots + Side by Side Skip & Next Buttons matching screenshot) */}
          <div className="w-full shrink-0 pt-2 flex flex-col items-center gap-3">
            {/* Pagination Dots */}
            <div className="flex items-center justify-center gap-1.5 mb-1">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIsTimerActive(false);
                    setCurrentSlide(idx);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    currentSlide === idx ? 'w-7 bg-[#119DB5]' : 'w-2 bg-[#A7DFF0] hover:bg-[#119DB5]/50'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Bottom Action Bar: Skip Button + Blue Next Button matching Screenshot_20261101-001913_bf71f855.jpg */}
            <div className="w-full flex items-center gap-3">
              <button
                onClick={handleSkip}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-[#F0F4F8] hover:bg-[#e2e8f0] active:scale-[0.98] text-[#172B4D] font-bold text-sm tracking-wide text-center transition-all cursor-pointer border border-slate-200/60 shadow-xs"
              >
                Skip
              </button>

              <button
                onClick={handleNext}
                className="flex-[2] py-3.5 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-extrabold text-sm tracking-wide shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer relative overflow-hidden"
              >
                {/* Subtle top 3s progress indicator bar */}
                {isTimerActive && (
                  <div
                    className="absolute top-0 left-0 h-1 bg-white/40 transition-all duration-75 ease-linear pointer-events-none"
                    style={{ width: `${progress}%` }}
                  />
                )}
                <span>{currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}</span>
                {currentSlide === slides.length - 1 ? (
                  <ArrowRight className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

