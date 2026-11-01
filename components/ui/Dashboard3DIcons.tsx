'use client';

import React from 'react';

// ============================================================================
// 1. VIP LEVEL: Golden Royal Crown with Blue Diamond Gemstone in Center
// ============================================================================
export function VipLevel3DIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* 3D Gold Gradient for Crown */}
        <linearGradient id="vip_crown_gold_main" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF4D0" />
          <stop offset="25%" stopColor="#FACC15" />
          <stop offset="60%" stopColor="#EAB308" />
          <stop offset="85%" stopColor="#CA8A04" />
          <stop offset="100%" stopColor="#854D0E" />
        </linearGradient>

        <linearGradient id="vip_crown_gold_highlight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#FEF08A" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#CA8A04" stopOpacity="0" />
        </linearGradient>

        {/* 3D Radiant Blue Diamond Gemstone Gradient */}
        <linearGradient id="vip_diamond_blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E0F2FE" />
          <stop offset="30%" stopColor="#38BDF8" />
          <stop offset="70%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>

        <linearGradient id="vip_diamond_facet" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.2" />
        </linearGradient>

        {/* Realistic 3D Soft Shadow */}
        <filter id="vip_crown_shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#1E3A8A" floodOpacity="0.35" />
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#854D0E" floodOpacity="0.4" />
        </filter>
      </defs>

      <g filter="url(#vip_crown_shadow)">
        {/* Crown Base Rim / Headband */}
        <path
          d="M 22 72 C 22 68, 78 68, 78 72 C 78 78, 22 78, 22 72 Z"
          fill="url(#vip_crown_gold_main)"
          stroke="#713F12"
          strokeWidth="1.5"
        />
        <rect x="24" y="69" width="52" height="6" rx="3" fill="url(#vip_crown_gold_highlight)" />

        {/* Crown Main Body with 5 Peaks */}
        <path
          d="M 22 70 L 16 34 L 34 50 L 50 20 L 66 50 L 84 34 L 78 70 Z"
          fill="url(#vip_crown_gold_main)"
          stroke="#713F12"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* Glossy 3D Bevel Highlights on Crown Peaks */}
        <path
          d="M 50 20 L 34 50 L 22 70 M 50 20 L 66 50 L 78 70"
          stroke="url(#vip_crown_gold_highlight)"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.85"
        />

        {/* Top Spheres / Jewels on Peaks */}
        <circle cx="16" cy="32" r="4.5" fill="url(#vip_crown_gold_main)" stroke="#713F12" strokeWidth="1" />
        <circle cx="16" cy="31" r="1.8" fill="#FFFFFF" opacity="0.8" />

        <circle cx="34" cy="48" r="4" fill="url(#vip_crown_gold_main)" stroke="#713F12" strokeWidth="1" />
        <circle cx="34" cy="47" r="1.5" fill="#FFFFFF" opacity="0.8" />

        <circle cx="50" cy="18" r="5.5" fill="url(#vip_crown_gold_main)" stroke="#713F12" strokeWidth="1" />
        <circle cx="50" cy="16.5" r="2.2" fill="#FFFFFF" opacity="0.9" />

        <circle cx="66" cy="48" r="4" fill="url(#vip_crown_gold_main)" stroke="#713F12" strokeWidth="1" />
        <circle cx="66" cy="47" r="1.5" fill="#FFFFFF" opacity="0.8" />

        <circle cx="84" cy="32" r="4.5" fill="url(#vip_crown_gold_main)" stroke="#713F12" strokeWidth="1" />
        <circle cx="84" cy="31" r="1.8" fill="#FFFFFF" opacity="0.8" />

        {/* =========================================================================
            Center Blue Diamond Gemstone 💎
            ========================================================================= */}
        {/* Diamond Outer Shape */}
        <polygon
          points="50,42 62,54 50,68 38,54"
          fill="url(#vip_diamond_blue)"
          stroke="#0369A1"
          strokeWidth="1.2"
        />

        {/* Diamond Top Table Facet */}
        <polygon points="50,42 57,48 50,54 43,48" fill="url(#vip_diamond_facet)" />

        {/* Diamond Lower Facets */}
        <polygon points="43,48 50,54 38,54" fill="#0284C7" opacity="0.7" />
        <polygon points="57,48 50,54 62,54" fill="#38BDF8" opacity="0.8" />
        <polygon points="50,54 62,54 50,68" fill="#0369A1" opacity="0.9" />
        <polygon points="50,54 38,54 50,68" fill="#0284C7" opacity="0.8" />

        {/* Radiant Gemstone Sparkle Star */}
        <path d="M 50 38 L 51.5 41 L 54.5 41 L 52 43 L 53 46 L 50 44 L 47 46 L 48 43 L 45.5 41 L 48.5 41 Z" fill="#FFFFFF" opacity="0.95" />
      </g>
    </svg>
  );
}

// ============================================================================
// 2. BUY RULES: Blue 3D Clipboard Checklist with Plus Badge
// ============================================================================
export function BuyRules3DIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Glossy Electric Blue Clipboard Gradient */}
        <linearGradient id="rules_board_blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="40%" stopColor="#3B82F6" />
          <stop offset="80%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>

        <linearGradient id="rules_board_light" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
        </linearGradient>

        {/* Metallic Clip Top Gradient */}
        <linearGradient id="rules_clip_gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#A16207" />
        </linearGradient>

        {/* Badge Electric Blue Gradient */}
        <linearGradient id="rules_badge_blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        <filter id="rules_shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#1E3A8A" floodOpacity="0.3" />
        </filter>
      </defs>

      <g filter="url(#rules_shadow)">
        {/* Main 3D Clipboard Body */}
        <rect
          x="24"
          y="22"
          width="52"
          height="66"
          rx="12"
          fill="url(#rules_board_blue)"
          stroke="#1D4ED8"
          strokeWidth="1.8"
        />

        {/* Inner Glass Highlights & Border */}
        <rect
          x="26"
          y="24"
          width="48"
          height="62"
          rx="10"
          fill="none"
          stroke="url(#rules_board_light)"
          strokeWidth="1.5"
        />

        {/* Top Metallic Clip Holder */}
        <rect x="36" y="14" width="28" height="14" rx="5" fill="url(#rules_clip_gold)" stroke="#854D0E" strokeWidth="1" />
        <circle cx="50" cy="18" r="3" fill="#854D0E" opacity="0.6" />

        {/* Paper Checklist Sheet Background */}
        <rect x="30" y="32" width="40" height="48" rx="6" fill="#F8FAFC" opacity="0.95" />

        {/* 3 Checkmark Items & Lines */}
        {/* Item 1 */}
        <circle cx="37" cy="42" r="3.5" fill="#3B82F6" />
        <path d="M 35 42 L 36.5 43.5 L 39.5 40.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="44" y="40" width="20" height="4" rx="2" fill="#94A3B8" />

        {/* Item 2 */}
        <circle cx="37" cy="52" r="3.5" fill="#3B82F6" />
        <path d="M 35 52 L 36.5 53.5 L 39.5 50.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="44" y="50" width="22" height="4" rx="2" fill="#94A3B8" />

        {/* Item 3 */}
        <circle cx="37" cy="62" r="3.5" fill="#3B82F6" />
        <path d="M 35 62 L 36.5 63.5 L 39.5 60.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="44" y="60" width="16" height="4" rx="2" fill="#94A3B8" />

        {/* Bottom-Right Circular Blue Plus Badge 🔵➕ */}
        <circle cx="70" cy="74" r="12" fill="url(#rules_badge_blue)" stroke="#FFFFFF" strokeWidth="2.5" />
        <path d="M 70 68 L 70 80 M 64 74 L 76 74" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// ============================================================================
// 3. MY REWARDS: Royal Blue 3D Gift Box with Golden Metallic Ribbon & Bow
// ============================================================================
export function MyRewards3DIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Royal Blue Gift Box Base */}
        <linearGradient id="gift_box_blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>

        <linearGradient id="gift_lid_blue" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>

        {/* Metallic Gold Ribbon & Bow */}
        <linearGradient id="gift_gold_ribbon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF4D0" />
          <stop offset="30%" stopColor="#FACC15" />
          <stop offset="70%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#854D0E" />
        </linearGradient>

        <filter id="gift_shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#1E3A8A" floodOpacity="0.35" />
        </filter>
      </defs>

      <g filter="url(#gift_shadow)">
        {/* Gift Box Main Cube Base */}
        <rect
          x="22"
          y="42"
          width="56"
          height="46"
          rx="10"
          fill="url(#gift_box_blue)"
          stroke="#1E3A8A"
          strokeWidth="1.5"
        />

        {/* Vertical Gold Ribbon Line on Base */}
        <rect x="45" y="42" width="10" height="46" fill="url(#gift_gold_ribbon)" />

        {/* Horizontal Gold Ribbon Line on Base */}
        <rect x="22" y="60" width="56" height="10" fill="url(#gift_gold_ribbon)" />

        {/* Overhanging Gift Box Lid */}
        <rect
          x="18"
          y="34"
          width="64"
          height="14"
          rx="6"
          fill="url(#gift_lid_blue)"
          stroke="#1D4ED8"
          strokeWidth="1.5"
        />
        {/* Vertical Ribbon on Lid */}
        <rect x="44" y="34" width="12" height="14" fill="url(#gift_gold_ribbon)" />

        {/* =========================================================================
            Large Metallic Golden Bow on Top 🎀
            ========================================================================= */}
        {/* Left Bow Loop */}
        <path
          d="M 50 34 C 42 20, 24 20, 30 32 C 34 38, 48 35, 50 34 Z"
          fill="url(#gift_gold_ribbon)"
          stroke="#713F12"
          strokeWidth="1.2"
        />
        <path d="M 46 32 C 40 25, 30 24, 34 30" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.8" />

        {/* Right Bow Loop */}
        <path
          d="M 50 34 C 58 20, 76 20, 70 32 C 66 38, 52 35, 50 34 Z"
          fill="url(#gift_gold_ribbon)"
          stroke="#713F12"
          strokeWidth="1.2"
        />
        <path d="M 54 32 C 60 25, 70 24, 66 30" fill="none" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.8" />

        {/* Center Ribbon Knot */}
        <circle cx="50" cy="34" r="5" fill="url(#gift_gold_ribbon)" stroke="#713F12" strokeWidth="1.2" />
        <circle cx="48.5" cy="32.5" r="2" fill="#FFFFFF" opacity="0.8" />

        {/* Hanging Ribbon Tails */}
        <path d="M 47 38 L 38 52 L 44 50 L 49 39 Z" fill="url(#gift_gold_ribbon)" stroke="#713F12" strokeWidth="0.8" />
        <path d="M 53 38 L 62 52 L 56 50 L 51 39 Z" fill="url(#gift_gold_ribbon)" stroke="#713F12" strokeWidth="0.8" />
      </g>
    </svg>
  );
}

// ============================================================================
// 4. MY PURCHASES: Royal Blue Shopping Bag with Cart & Golden Plus Badge
// ============================================================================
export function MyPurchases3DIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Royal Blue Shopping Bag */}
        <linearGradient id="bag_blue_main" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="35%" stopColor="#3B82F6" />
          <stop offset="75%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>

        {/* Golden Plus Badge */}
        <linearGradient id="bag_plus_gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#854D0E" />
        </linearGradient>

        <filter id="bag_shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#1E3A8A" floodOpacity="0.3" />
        </filter>
      </defs>

      <g filter="url(#bag_shadow)">
        {/* 3D Curved Carrying Handles */}
        <path
          d="M 36 32 C 36 14, 64 14, 64 32"
          fill="none"
          stroke="#93C5FD"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <path
          d="M 36 32 C 36 14, 64 14, 64 32"
          fill="none"
          stroke="#1E40AF"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Main 3D Shopping Bag Body */}
        <path
          d="M 22 32 L 78 32 C 81 32 83 34 82 37 L 76 82 C 75.5 86 72 88 68 88 L 32 88 C 28 88 24.5 86 24 82 L 18 37 C 17 34 19 32 22 32 Z"
          fill="url(#bag_blue_main)"
          stroke="#1E3A8A"
          strokeWidth="1.8"
        />

        {/* Top Fold Highlight */}
        <path
          d="M 22 32 L 78 32"
          stroke="#93C5FD"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* White Shopping Cart Emblem in Center 🛒 */}
        <g stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
          <path d="M 40 50 L 44 50 L 48 64 L 62 64 L 66 54 L 46 54" />
          <circle cx="49" cy="70" r="1.8" fill="#FFFFFF" />
          <circle cx="61" cy="70" r="1.8" fill="#FFFFFF" />
        </g>

        {/* Bottom-Right Golden Circular Plus Badge 🟡➕ */}
        <circle cx="72" cy="74" r="12" fill="url(#bag_plus_gold)" stroke="#FFFFFF" strokeWidth="2.5" />
        <path d="M 72 68 L 72 80 M 66 74 L 78 74" stroke="#713F12" strokeWidth="2.8" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// ============================================================================
// 5. Container Component wrapping each 3D Icon with #F0F6FF background,
//    glassmorphism, outer blue glow, inner highlight, drop shadow
// ============================================================================
export interface Dashboard3DCardProps {
  id: string;
  label: string;
  onClick: () => void;
  iconType: 'VIP LEVEL' | 'BUY RULES' | 'MY REWARDS' | 'MY PURCHASES';
}

export function Dashboard3DCard({ label, onClick, iconType }: Dashboard3DCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-center justify-center py-2.5 px-1.5 rounded-2xl transition-all cursor-pointer select-none active:scale-95"
    >
      {/* Container Box matching exact spec: Light blue gradient (#F0F6FF), glassmorphism, soft blue outer glow */}
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-b from-[#F4F8FF] via-[#EAF2FF] to-[#DBEAFE] border border-[#D0E2FF] shadow-[0_6px_16px_-3px_rgba(59,130,246,0.22)] flex items-center justify-center mb-1.5 group-hover:shadow-[0_8px_22px_-2px_rgba(37,99,235,0.35)] group-hover:scale-105 transition-all duration-300">
        {/* Subtle Glassmorphism Inner Top Highlight */}
        <div className="absolute inset-x-0 top-0 h-1/2 rounded-t-2xl bg-gradient-to-b from-white/80 to-transparent pointer-events-none" />

        {/* 3D Rendered Icon */}
        <div className="relative z-10 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
          {iconType === 'VIP LEVEL' && <VipLevel3DIcon className="w-10 h-10 sm:w-11 sm:h-11 drop-shadow-md" />}
          {iconType === 'BUY RULES' && <BuyRules3DIcon className="w-10 h-10 sm:w-11 sm:h-11 drop-shadow-md" />}
          {iconType === 'MY REWARDS' && <MyRewards3DIcon className="w-10 h-10 sm:w-11 sm:h-11 drop-shadow-md" />}
          {iconType === 'MY PURCHASES' && <MyPurchases3DIcon className="w-10 h-10 sm:w-11 sm:h-11 drop-shadow-md" />}
        </div>
      </div>

      {/* Label Text below Icon */}
      <span className="text-[10.5px] sm:text-[11px] font-black tracking-tight text-center leading-tight text-slate-800 group-hover:text-blue-700 transition-colors">
        {label}
      </span>
    </button>
  );
}
