'use client';

import React from 'react';

// ============================================================================
// 1. JOINS 3D ICON (Emerald Green Palette with Glossy 3D User Group & Plus Badge)
// ============================================================================
export function Joins3DIcon({ className = 'w-9 h-9 sm:w-10 sm:h-10' }: { className?: string }) {
  return (
    <div className={`relative ${className} rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 border border-emerald-300/80 shadow-md shadow-emerald-600/30 flex items-center justify-center shrink-0 overflow-hidden`}>
      {/* Glossy Glass Highlight Ring Top */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none rounded-t-xl" />

      <svg className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 filter drop-shadow-xs" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="joins_user_body" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>
          <linearGradient id="joins_plus_gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="50%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#854D0E" />
          </linearGradient>
        </defs>

        {/* Back Secondary User Silhouette */}
        <circle cx="34" cy="38" r="11" fill="url(#joins_user_body)" opacity="0.75" />
        <path d="M 16 72 C 16 56, 24 50, 34 50 C 44 50, 52 56, 52 72 Z" fill="url(#joins_user_body)" opacity="0.7" />

        {/* Main Foreground User Silhouette */}
        <circle cx="56" cy="34" r="14" fill="url(#joins_user_body)" stroke="#047857" strokeWidth="1.5" />
        <circle cx="53" cy="30" r="4" fill="#FFFFFF" opacity="0.8" />
        <path d="M 32 78 C 32 58, 42 50, 56 50 C 70 50, 80 58, 80 78 Z" fill="url(#joins_user_body)" stroke="#047857" strokeWidth="1.5" />

        {/* Gold Plus Badge in Bottom Right ➕ */}
        <circle cx="74" cy="72" r="14" fill="url(#joins_plus_gold)" stroke="#FFFFFF" strokeWidth="2" />
        <path d="M 74 64 L 74 80 M 66 72 L 82 72" stroke="#451A03" strokeWidth="3.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// ============================================================================
// 2. EARNED 3D ICON (Metallic Gold / Amber Palette with 3D Rising Bars & Arrow)
// ============================================================================
export function Earned3DIcon({ className = 'w-9 h-9 sm:w-10 sm:h-10' }: { className?: string }) {
  return (
    <div className={`relative ${className} rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 border border-amber-200/90 shadow-md shadow-amber-500/30 flex items-center justify-center shrink-0 overflow-hidden`}>
      {/* Glossy Glass Highlight Ring Top */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/45 to-transparent pointer-events-none rounded-t-xl" />

      <svg className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 filter drop-shadow-xs" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="earned_bar_gold" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#FEF08A" />
            <stop offset="100%" stopColor="#EAB308" />
          </linearGradient>
          <linearGradient id="earned_arrow_gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#FEF08A" />
          </linearGradient>
        </defs>

        {/* 3D Rising Bar Chart Columns */}
        <rect x="18" y="58" width="14" height="26" rx="4" fill="url(#earned_bar_gold)" stroke="#78350F" strokeWidth="1.2" />
        <rect x="38" y="44" width="14" height="40" rx="4" fill="url(#earned_bar_gold)" stroke="#78350F" strokeWidth="1.2" />
        <rect x="58" y="28" width="14" height="56" rx="4" fill="url(#earned_bar_gold)" stroke="#78350F" strokeWidth="1.2" />

        {/* Dynamic Upward Trend Line & Arrow ↗️ */}
        <path d="M 18 52 L 40 38 L 56 42 L 82 18" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 66 18 L 82 18 L 82 34" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 18 52 L 40 38 L 56 42 L 82 18" stroke="url(#earned_arrow_gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 66 18 L 82 18 L 82 34" stroke="url(#earned_arrow_gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// ============================================================================
// 3. PAYOUT 3D ICON (Royal Purple Palette with Metallic Currency Banknote & Coin)
// ============================================================================
export function Payout3DIcon({ className = 'w-9 h-9 sm:w-10 sm:h-10' }: { className?: string }) {
  return (
    <div className={`relative ${className} rounded-xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-purple-400 border border-purple-300/80 shadow-md shadow-purple-600/30 flex items-center justify-center shrink-0 overflow-hidden`}>
      {/* Glossy Glass Highlight Ring Top */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none rounded-t-xl" />

      <svg className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 filter drop-shadow-xs" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="payout_note_bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F1F5F9" />
          </linearGradient>
          <linearGradient id="payout_gold_coin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="50%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#854D0E" />
          </linearGradient>
        </defs>

        {/* 3D Banknote Base */}
        <rect x="14" y="28" width="68" height="42" rx="8" fill="url(#payout_note_bg)" stroke="#312E81" strokeWidth="1.8" />
        <rect x="18" y="32" width="60" height="34" rx="5" fill="none" stroke="#6366F1" strokeWidth="1" strokeDasharray="3 2" />

        {/* Center Currency Sign (₹) */}
        <circle cx="48" cy="49" r="11" fill="#EEF2FF" stroke="#4338CA" strokeWidth="1.2" />
        <text x="48" y="55" textAnchor="middle" fill="#312E81" fontSize="18" fontWeight="900" fontFamily="sans-serif">₹</text>

        {/* Gold Coin Stack Accent in Bottom Right 🪙 */}
        <circle cx="74" cy="68" r="12" fill="url(#payout_gold_coin)" stroke="#FFFFFF" strokeWidth="2" />
        <text x="74" y="73" textAnchor="middle" fill="#451A03" fontSize="12" fontWeight="900" fontFamily="sans-serif">₹</text>
      </svg>
    </div>
  );
}

// ============================================================================
// 4. ACTIVE 3D ICON (Deep Navy Blue / Ocean Cyan Palette with 3D Clock Dial & Ring)
// ============================================================================
export function Active3DIcon({ className = 'w-9 h-9 sm:w-10 sm:h-10' }: { className?: string }) {
  return (
    <div className={`relative ${className} rounded-xl bg-gradient-to-tr from-slate-900 via-blue-900 to-cyan-500 border border-cyan-300/80 shadow-md shadow-cyan-500/30 flex items-center justify-center shrink-0 overflow-hidden`}>
      {/* Glossy Glass Highlight Ring Top */}
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none rounded-t-xl" />

      <svg className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 filter drop-shadow-xs" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="active_clock_dial" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E0F2FE" />
          </linearGradient>
          <linearGradient id="active_cyan_ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
        </defs>

        {/* Outer Circular Progress Ring */}
        <circle cx="50" cy="50" r="38" stroke="#1E293B" strokeWidth="6" />
        <circle
          cx="50"
          cy="50"
          r="38"
          stroke="url(#active_cyan_ring)"
          strokeWidth="6"
          strokeDasharray="238"
          strokeDashoffset="60"
          strokeLinecap="round"
        />

        {/* Clock Inner Dial Face */}
        <circle cx="50" cy="50" r="28" fill="url(#active_clock_dial)" stroke="#0284C7" strokeWidth="1.5" />

        {/* Hour / Minute Hands & Pivot */}
        <path d="M 50 50 L 50 28" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M 50 50 L 66 50" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
        <circle cx="50" cy="50" r="4" fill="#0284C7" stroke="#FFFFFF" strokeWidth="1.2" />

        {/* Top Glowing Pulse Bead */}
        <circle cx="50" cy="12" r="3.5" fill="#22D3EE" />
      </svg>
    </div>
  );
}
