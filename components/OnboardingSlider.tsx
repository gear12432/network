'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronRight,
  ArrowRight,
  Sparkles,
  MapPin,
  MessageSquare,
  Bell,
  CheckCircle2,
} from 'lucide-react';

interface OnboardingSliderProps {
  onComplete?: () => void;
}

export default function OnboardingSlider({ onComplete }: OnboardingSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
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

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      if (onComplete) onComplete();
    }
  };

  const handleSkip = () => {
    // Requirement 3: Clicking Skip on slide 1 or slide 2 moves directly to slide 3
    setCurrentSlide(2);
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
      setCurrentSlide((prev) => prev + 1);
    } else if (isSwipeRight && currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="min-h-screen w-full bg-[#0d131f] flex items-center justify-center p-0 sm:p-4 select-none font-sans overflow-hidden">
      {/* Mobile-first Unified Screen Frame (Used for both Mobile & Centered Desktop view) */}
      <div
        className="w-full max-w-md h-screen sm:h-[840px] bg-white sm:rounded-[36px] shadow-2xl flex flex-col justify-between overflow-hidden relative border border-slate-100"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background Decorative Light-Blue Vector Shapes */}
        <div className="absolute top-0 left-0 right-0 h-96 overflow-hidden pointer-events-none z-0">
          <svg className="absolute -top-12 -left-12 w-72 h-72 text-[#A7DFF0]/25" viewBox="0 0 200 200" fill="currentColor">
            <path d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.2,72.9,41.8C64.4,54.4,53,65,39.6,72.8C26.2,80.6,10.8,85.6,-4.8,88.3C-20.4,91,-36.2,91.4,-49.8,85C-63.4,78.6,-74.8,65.4,-82.1,50.3C-89.4,35.2,-92.6,18.2,-91.3,1.8C-90,-14.6,-84.2,-30.4,-74.8,-43.3C-65.4,-56.2,-52.4,-66.2,-38.3,-73.4C-24.2,-80.6,-9,-85,5.1,-87.9C19.2,-90.8,30.6,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
          </svg>
          <svg className="absolute top-20 -right-16 w-80 h-80 text-[#119DB5]/10" viewBox="0 0 200 200" fill="currentColor">
            <path d="M39.9,-65.7C51.2,-58.5,59.6,-47.5,65.8,-35.2C72,-22.9,76,-9.3,75.4,4.2C74.8,17.7,69.6,31.1,61.1,41.9C52.6,52.7,40.8,60.9,28,66.3C15.2,71.7,1.4,74.3,-12.3,73.1C-26,71.9,-39.6,66.9,-50.7,58.3C-61.8,49.7,-70.4,37.5,-75.1,23.8C-79.8,10.1,-80.6,-5.1,-76.1,-18.8C-71.6,-32.5,-61.8,-44.7,-50.1,-52.1C-38.4,-59.5,-24.8,-62,-11.2,-63.5C2.4,-65,28.6,-72.9,39.9,-65.7Z" transform="translate(100 100)" />
          </svg>
        </div>

        {/* Top Header Bar with Tag & Skip Button */}
        <div className="relative z-10 px-6 pt-6 pb-2 flex justify-between items-center">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#119DB5]" />
            <span className="text-xs font-bold tracking-widest uppercase text-[#172B4D]">
              {slides[currentSlide].tag}
            </span>
          </div>

          {currentSlide < slides.length - 1 ? (
            <button
              onClick={handleSkip}
              className="text-[#758195] hover:text-[#172B4D] text-sm font-semibold px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Skip
            </button>
          ) : (
            <div className="w-12" />
          )}
        </div>

        {/* Slide Content Area */}
        <div className="relative z-10 flex-1 flex flex-col justify-between px-6 pt-2 pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="flex-1 flex flex-col justify-between"
            >
              {/* Illustration Container */}
              <div className="w-full flex-1 min-h-[280px] sm:min-h-[340px] flex items-center justify-center relative my-2">
                {/* SLIDE 1: Explore */}
                {currentSlide === 0 && (
                  <div className="w-full h-full max-w-[320px] max-h-[320px] flex items-center justify-center relative">
                    <div className="w-64 h-64 rounded-full bg-[#A7DFF0]/30 border-2 border-[#A7DFF0]/50 absolute flex items-center justify-center">
                      <div className="w-48 h-48 rounded-full bg-[#119DB5]/10 animate-pulse" />
                    </div>

                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute top-4 right-6 bg-white p-2.5 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-2 z-20"
                    >
                      <div className="p-2 bg-[#119DB5] text-white rounded-xl">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-[#758195]">Explore</p>
                        <p className="text-xs font-bold text-[#172B4D]">New Places</p>
                      </div>
                    </motion.div>

                    <svg className="w-60 h-60 relative z-10 drop-shadow-xl" viewBox="0 0 200 200" fill="none">
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
                  <div className="w-full h-full max-w-[320px] max-h-[320px] flex items-center justify-center relative">
                    <div className="w-60 h-60 rounded-full bg-[#A7DFF0]/25 absolute flex items-center justify-center">
                      <div className="w-40 h-40 rounded-full bg-white/80 shadow-inner" />
                    </div>

                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute top-2 left-4 bg-white p-3 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-2.5 z-20"
                    >
                      <div className="p-2 bg-[#119DB5] text-white rounded-xl">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <p className="text-xs font-bold text-[#172B4D]">Instant Easy</p>
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#119DB5]" />
                        </div>
                        <p className="text-[10px] text-[#758195]">Connected Everywhere</p>
                      </div>
                    </motion.div>

                    <svg className="w-60 h-60 relative z-10 drop-shadow-xl" viewBox="0 0 200 200" fill="none">
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
                  <div className="w-full h-full max-w-[320px] max-h-[320px] flex items-center justify-center relative">
                    <div className="w-64 h-64 rounded-full bg-[#119DB5]/10 animate-ping opacity-20 absolute" />
                    <div className="w-56 h-56 rounded-full bg-[#A7DFF0]/30 border border-[#119DB5]/30 absolute" />

                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute top-2 right-4 bg-white p-3 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-2.5 z-20"
                    >
                      <div className="p-2 bg-[#172B4D] text-[#A7DFF0] rounded-xl relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#119DB5] rounded-full border-2 border-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#172B4D]">Ready to Start!</p>
                        <p className="text-[10px] text-[#758195]">Account Configured</p>
                      </div>
                    </motion.div>

                    <svg className="w-64 h-64 relative z-10 drop-shadow-2xl" viewBox="0 0 200 200" fill="none">
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
              <div className="text-center px-2 mt-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172B4D] tracking-tight mb-2.5">
                  {slides[currentSlide].title}
                </h2>
                <p className="text-sm sm:text-base font-medium text-[#758195] leading-relaxed max-w-xs mx-auto">
                  {slides[currentSlide].description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Bottom Controls */}
          <div className="w-full mt-6 pt-2 flex flex-col items-center gap-6">
            <div className="flex items-center justify-center gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    currentSlide === idx ? 'w-8 bg-[#119DB5]' : 'w-2.5 bg-[#A7DFF0] hover:bg-[#119DB5]/50'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <div className="w-full">
              {currentSlide < slides.length - 1 ? (
                <div className="flex items-center justify-between gap-4 w-full">
                  <button
                    onClick={handleSkip}
                    className="w-1/3 py-3.5 px-4 rounded-2xl text-slate-600 font-bold text-sm bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Skip
                  </button>
                  <button
                    onClick={handleNext}
                    className="w-2/3 py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleNext}
                  className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-extrabold text-base shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2 transition-all transform cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
