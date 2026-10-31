'use client';

import React, { useState, useRef } from 'react';
import {
  Users,
  Copy,
  Check,
  Share2,
  Gift,
  Award,
  Crown,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  TrendingUp,
  ShieldCheck,
  HelpCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Coins,
  CheckCircle2,
  Star,
  Zap,
  Lock,
  Wallet,
} from 'lucide-react';
import { UserStats, ReferralMember, ActiveInvestment } from '@/types/investment';
import { triggerConfetti } from '@/lib/confetti';
import { motion, AnimatePresence } from 'motion/react';

interface NetworkScreenProps {
  stats: UserStats;
  referrals: ReferralMember[];
  activeInvestments?: ActiveInvestment[];
  onOpenPlans?: () => void;
  onOpenDeposit?: () => void;
}

type TabType = 'VIP LEVEL' | 'BUY RULES' | 'MY REWARDS' | 'MY PURCHASES';
type TimeFilter = 'This Week' | 'Yesterday Earn' | 'Last Week';

// VIP 1 to VIP 10 Specification Data
export interface VipTierInfo {
  level: number;
  title: string;
  subtitle: string;
  spend: string;
  rebate: string;
  limit: string;
  perk: string;
  isUnlocked: boolean;
  bgGradient: string;
  borderColor: string;
  tagColor: string;
  isDark?: boolean;
}

export const VIP_TIERS: VipTierInfo[] = [
  {
    level: 1,
    title: 'VIP 1',
    subtitle: 'Bronze Starter',
    spend: '₹500',
    rebate: '10%',
    limit: '₹50,000 / day',
    perk: 'Standard withdrawal speed & 10% direct team bonus',
    isUnlocked: true,
    bgGradient: 'from-[#fff9f0] via-[#fdf3e2] to-[#f7e4be]',
    borderColor: 'border-[#dfb572]',
    tagColor: 'bg-[#8c5222] text-[#fff5e6]',
  },
  {
    level: 2,
    title: 'VIP 2',
    subtitle: 'Silver Elite',
    spend: '₹2,000',
    rebate: '12%',
    limit: '₹1,00,000 / day',
    perk: '12% direct rebate + ₹500 upgrade gift bonus',
    isUnlocked: false,
    bgGradient: 'from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]',
    borderColor: 'border-[#94a3b8]',
    tagColor: 'bg-[#475569] text-white',
  },
  {
    level: 3,
    title: 'VIP 3',
    subtitle: 'Gold Master',
    spend: '₹5,000',
    rebate: '15%',
    limit: '₹2,50,000 / day',
    perk: '15% rebate + priority 15-min fast clearance',
    isUnlocked: false,
    bgGradient: 'from-[#fffcf2] via-[#fef4d6] to-[#fbe8a8]',
    borderColor: 'border-[#eab308]',
    tagColor: 'bg-[#a16207] text-white',
  },
  {
    level: 4,
    title: 'VIP 4',
    subtitle: 'Rose Prestige',
    spend: '₹10,000',
    rebate: '18%',
    limit: '₹5,00,000 / day',
    perk: '18% rebate + daily cash dividend reward pool',
    isUnlocked: false,
    bgGradient: 'from-[#fff5f5] via-[#fee2e2] to-[#fecdd3]',
    borderColor: 'border-[#f43f5e]',
    tagColor: 'bg-[#be123c] text-white',
  },
  {
    level: 5,
    title: 'VIP 5',
    subtitle: 'Emerald Royal',
    spend: '₹25,000',
    rebate: '22%',
    limit: '₹10,00,000 / day',
    perk: '22% rebate + dedicated VIP WhatsApp manager',
    isUnlocked: false,
    bgGradient: 'from-[#f0fdf4] via-[#dcfce7] to-[#bbf7d0]',
    borderColor: 'border-[#10b981]',
    tagColor: 'bg-[#047857] text-white',
  },
  {
    level: 6,
    title: 'VIP 6',
    subtitle: 'Sapphire Baron',
    spend: '₹50,000',
    rebate: '25%',
    limit: '₹25,00,000 / day',
    perk: '25% rebate + zero transaction fee on withdrawals',
    isUnlocked: false,
    bgGradient: 'from-[#eff6ff] via-[#dbeafe] to-[#bfdbfe]',
    borderColor: 'border-[#3b82f6]',
    tagColor: 'bg-[#1d4ed8] text-white',
  },
  {
    level: 7,
    title: 'VIP 7',
    subtitle: 'Ruby Sovereign',
    spend: '₹1,00,000',
    rebate: '28%',
    limit: '₹50,00,000 / day',
    perk: '28% rebate + luxury designer merchandise box',
    isUnlocked: false,
    bgGradient: 'from-[#fef2f2] via-[#fee2e2] to-[#fca5a5]',
    borderColor: 'border-[#ef4444]',
    tagColor: 'bg-[#b91c1c] text-white',
  },
  {
    level: 8,
    title: 'VIP 8',
    subtitle: 'Diamond Monarch',
    spend: '₹2,50,000',
    rebate: '32%',
    limit: '₹1,00,00,000 / day',
    perk: '32% rebate + bespoke tailor consultation & perks',
    isUnlocked: false,
    bgGradient: 'from-[#f0f9ff] via-[#e0f2fe] to-[#bae6fd]',
    borderColor: 'border-[#0284c7]',
    tagColor: 'bg-[#0369a1] text-white',
  },
  {
    level: 9,
    title: 'VIP 9',
    subtitle: 'Black Gold King',
    spend: '₹5,00,000',
    rebate: '36%',
    limit: 'Unlimited Express',
    perk: '36% rebate + annual fashion gala VIP guest seat',
    isUnlocked: false,
    bgGradient: 'from-[#18181b] via-[#27272a] to-[#09090b]',
    borderColor: 'border-[#eab308]',
    tagColor: 'bg-[#eab308] text-black font-black',
    isDark: true,
  },
  {
    level: 10,
    title: 'VIP 10',
    subtitle: 'Imperial Legend',
    spend: '₹10,00,000',
    rebate: '40%',
    limit: 'Supreme Unlimited',
    perk: '40% rebate + 24/7 personal banker & lifetime dividend',
    isUnlocked: false,
    bgGradient: 'from-[#451a03] via-[#78350f] to-[#b45309]',
    borderColor: 'border-[#f59e0b]',
    tagColor: 'bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-[#451a03] font-black',
    isDark: true,
  },
];

// High Quality Luxury VIP Badge Component
function VipBadgeIcon({ level, className = 'w-16 h-16' }: { level: number; className?: string }) {
  const configs: Record<
    number,
    { gradId: string; stops: string[]; stroke: string; accent: string }
  > = {
    1: { gradId: 'vip_1', stops: ['#8c5222', '#be7a39', '#f3ca95'], stroke: '#fbe7cd', accent: '#693409' },
    2: { gradId: 'vip_2', stops: ['#475569', '#94a3b8', '#f8fafc'], stroke: '#ffffff', accent: '#1e293b' },
    3: { gradId: 'vip_3', stops: ['#a16207', '#eab308', '#fef08a'], stroke: '#fffbeb', accent: '#713f12' },
    4: { gradId: 'vip_4', stops: ['#9f1239', '#f43f5e', '#fecdd3'], stroke: '#ffe4e6', accent: '#881337' },
    5: { gradId: 'vip_5', stops: ['#065f46', '#10b981', '#a7f3d0'], stroke: '#d1fae5', accent: '#064e3b' },
    6: { gradId: 'vip_6', stops: ['#1e3a8a', '#3b82f6', '#bfdbfe'], stroke: '#dbeafe', accent: '#172554' },
    7: { gradId: 'vip_7', stops: ['#881337', '#ef4444', '#fecaca'], stroke: '#fee2e2', accent: '#701a75' },
    8: { gradId: 'vip_8', stops: ['#075985', '#0ea5e9', '#e0f2fe'], stroke: '#f0f9ff', accent: '#0c4a6e' },
    9: { gradId: 'vip_9', stops: ['#18181b', '#3f3f46', '#eab308'], stroke: '#fde047', accent: '#09090b' },
    10: { gradId: 'vip_10', stops: ['#7c2d12', '#ea580c', '#facc15'], stroke: '#fef08a', accent: '#431407' },
  };

  const cfg = configs[level] || configs[1];

  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${cfg.gradId}_main`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={cfg.stops[0]} />
          <stop offset="50%" stopColor={cfg.stops[1]} />
          <stop offset="100%" stopColor={cfg.stops[2]} />
        </linearGradient>
        <linearGradient id={`${cfg.gradId}_gold`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff3bf" />
          <stop offset="50%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#8a5b11" />
        </linearGradient>
        <filter id={`${cfg.gradId}_glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Ornate Sunburst Ring for Top VIPs */}
      {level >= 7 && (
        <circle cx="50" cy="50" r="46" stroke={`url(#${cfg.gradId}_gold)`} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.85" />
      )}

      {/* Golden Wings for VIP 8, 9, 10 */}
      {level >= 8 && (
        <g opacity="0.95" filter={`url(#${cfg.gradId}_glow)`}>
          <path d="M14 46 C 4 34, 10 18, 28 26 C 18 32, 18 48, 25 56 Z" fill={`url(#${cfg.gradId}_gold)`} />
          <path d="M86 46 C 96 34, 90 18, 72 26 C 82 32, 82 48, 75 56 Z" fill={`url(#${cfg.gradId}_gold)`} />
        </g>
      )}

      {/* Main Luxury Shield / Crest Base */}
      <path
        d="M 50 10 L 82 22 C 82 54 67 76 50 90 C 33 76 18 54 18 22 Z"
        fill={`url(#${cfg.gradId}_main)`}
        stroke={`url(#${cfg.gradId}_gold)`}
        strokeWidth="3.2"
        filter={`url(#${cfg.gradId}_glow)`}
      />

      {/* Inner Metallic Bevel Rim */}
      <path
        d="M 50 16 L 76 26 C 76 50 63 70 50 82 C 37 70 24 50 24 26 Z"
        fill="none"
        stroke={cfg.stroke}
        strokeWidth="1.2"
        opacity="0.65"
      />

      {/* Crown Crest for VIP 3, 7, 9, 10 */}
      {(level === 3 || level === 7 || level === 9 || level === 10) && (
        <path
          d="M 37 42 L 32 28 L 42 34 L 50 22 L 58 34 L 68 28 L 63 42 Z"
          fill={`url(#${cfg.gradId}_gold)`}
          stroke="#451a03"
          strokeWidth="0.8"
        />
      )}

      {/* Diamond Gem for VIP 4, 5, 6, 8 */}
      {(level === 4 || level === 5 || level === 6 || level === 8) && (
        <polygon points="50,22 64,32 50,42 36,32" fill="#ffffff" opacity="0.9" />
      )}

      {/* Star for VIP 1 & 2 */}
      {(level === 1 || level === 2) && (
        <polygon
          points="50,20 53,28 61,29 55,34 57,42 50,38 43,42 45,34 39,29 47,28"
          fill={`url(#${cfg.gradId}_gold)`}
        />
      )}

      {/* Golden Banner Bar */}
      <rect x="22" y="48" width="56" height="22" rx="6" fill={`url(#${cfg.gradId}_gold)`} stroke="#ffffff" strokeWidth="1" />

      {/* Bold Embossed VIP Level Title */}
      <text
        x="50"
        y="64"
        textAnchor="middle"
        fill="#3a1b06"
        fontSize="12.5"
        fontWeight="900"
        fontFamily="sans-serif"
        letterSpacing="0.5"
      >
        VIP {level}
      </text>

      {/* Triple Gold Accent Beads */}
      <circle cx="50" cy="78" r="3" fill={`url(#${cfg.gradId}_gold)`} />
      <circle cx="42" cy="76" r="2" fill={`url(#${cfg.gradId}_gold)`} />
      <circle cx="58" cy="76" r="2" fill={`url(#${cfg.gradId}_gold)`} />
    </svg>
  );
}

// Leaderboard Top 3 Interface
interface TopCustomer {
  rank: number;
  id: string;
  avatar: string;
  prize: number;
  points: number;
  name?: string;
  badge?: string;
}

// Leaderboard Row Interface
interface RankRow {
  rank: number;
  id: string;
  avatar: string;
  points: number;
  prize: number;
}

export default function NetworkScreen({
  stats,
  referrals,
  activeInvestments = [],
  onOpenPlans,
  onOpenDeposit,
}: NetworkScreenProps) {
  const [activeModalTab, setActiveModalTab] = useState<TabType | null>(null);
  const [selectedVipTier, setSelectedVipTier] = useState<VipTierInfo | null>(VIP_TIERS[0]);
  const [copiedCode, setCopiedCode] = useState(false);

  // Prevent background scrolling when full screen view is open
  React.useEffect(() => {
    if (activeModalTab) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeModalTab]);

  const [timeFilter, setTimeFilter] = useState<TimeFilter>('This Week');

  // Top 3 Data (Matches reference screenshot c2320729-fb66-42af-8277-90aa14e8526b_ef120a21.jpeg)
  const topThreeData: Record<TimeFilter, TopCustomer[]> = {
    'This Week': [
      {
        rank: 2,
        id: '2447951',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        prize: 2000,
        points: 1446227,
        name: 'TIN BHAI MITHAI',
      },
      {
        rank: 1,
        id: '6475895',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        prize: 3000,
        points: 1461023,
        name: 'Champion Member',
      },
      {
        rank: 3,
        id: '23974873',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        prize: 1000,
        points: 838381,
        name: 'Premier VIP',
      },
    ],
    'Yesterday Earn': [
      {
        rank: 2,
        id: '1984520',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        prize: 1500,
        points: 421090,
      },
      {
        rank: 1,
        id: '6475895',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        prize: 2500,
        points: 689120,
      },
      {
        rank: 3,
        id: '3150196',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        prize: 800,
        points: 312500,
      },
    ],
    'Last Week': [
      {
        rank: 2,
        id: '23974873',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        prize: 2000,
        points: 1380900,
      },
      {
        rank: 1,
        id: '6475895',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        prize: 3000,
        points: 1520100,
      },
      {
        rank: 3,
        id: '2447951',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        prize: 1000,
        points: 910240,
      },
    ],
  };

  // Rank 4+ Leaderboard Data (Matches reference screenshot c2320729-fb66-42af-8277-90aa14e8526b_ef120a21.jpeg)
  const leaderboardTable: RankRow[] = [
    {
      rank: 4,
      id: '3150196',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
      points: 742639,
      prize: 900,
    },
    {
      rank: 5,
      id: '26172966',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
      points: 563538,
      prize: 800,
    },
    {
      rank: 6,
      id: '125044',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
      points: 415976,
      prize: 700,
    },
    {
      rank: 7,
      id: '6314271',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&q=80',
      points: 371118,
      prize: 600,
    },
    {
      rank: 8,
      id: '9823101',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80',
      points: 298450,
      prize: 500,
    },
    {
      rank: 9,
      id: '4712093',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      points: 245120,
      prize: 400,
    },
    {
      rank: 10,
      id: '8102934',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80',
      points: 198300,
      prize: 300,
    },
  ];

  const currentTop = topThreeData[timeFilter];
  const rank1 = currentTop.find((c) => c.rank === 1)!;
  const rank2 = currentTop.find((c) => c.rank === 2)!;
  const rank3 = currentTop.find((c) => c.rank === 3)!;

  return (
    <div className="pb-16 sm:pb-8 max-w-xl mx-auto space-y-3">
      {/* 4 Main Feature Navigation Buttons - CLEAN WHITE WITH BLUE ACCENTS */}
      <div className="grid grid-cols-4 gap-2 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs">
        {[
          { id: 'VIP LEVEL', label: 'VIP LEVEL', icon: Crown },
          { id: 'BUY RULES', label: 'BUY RULES', icon: HelpCircle },
          { id: 'MY REWARDS', label: 'MY REWARDS', icon: Gift },
          { id: 'MY PURCHASES', label: 'MY PURCHASES', icon: Coins },
        ].map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModalTab(item.id as TabType)}
              className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-900 transition-all cursor-pointer shadow-2xs group"
            >
              <div className="w-8.5 h-8.5 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1 group-hover:bg-blue-600 group-hover:text-white transition-colors border border-blue-100">
                <IconComponent className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-[10px] font-black tracking-tight text-center leading-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Leaderboard Tips Banner */}
      <div className="text-center pt-0.5 pb-0.5">
        <p className="text-[11px] font-bold text-slate-500">
          Tips: Leaderboard updates every 30 minutes
        </p>
      </div>

      {/* =========================================================================
          4. TIME FILTER PILLS: This Week / Yesterday Earn / Last Week (WHITE THEME)
          ========================================================================= */}
      <div className="bg-white p-1 rounded-2xl flex items-center justify-between gap-1 border border-slate-200 shadow-2xs">
        {(['This Week', 'Yesterday Earn', 'Last Week'] as TimeFilter[]).map((filter) => {
          const isActive = timeFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`flex-1 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 text-center cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30 font-black'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          5. LEADERBOARD PODIUM: TOP 3 CUSTOMERS WHO PURCHASED THE PLAN THE MOST (BORDERLESS)
          ========================================================================= */}
      <div className="bg-gradient-to-b from-[#fdfbf6] via-[#f8f1df] to-[#f4e8cb] rounded-3xl p-4 sm:p-5 shadow-xs">
        <h3 className="text-center font-bold text-xs sm:text-sm text-[#4c2d15] uppercase tracking-wide mb-4">
          TOP 3 CUSTOMERS WHO PURCHASED THE PLAN THE MOST
        </h3>

        {/* 3D Marble Podium Pedestals */}
        <div className="grid grid-cols-3 items-end gap-2 pt-8 pb-3 max-w-md mx-auto">
          {/* RANK 2: LEFT SILVER PEDESTAL */}
          <div className="flex flex-col items-center">
            {/* Avatar Frame with Silver Ring */}
            <div className="relative mb-2">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-0.5 bg-gradient-to-tr from-slate-200 to-white shadow-md">
                <img
                  src={rank2.avatar}
                  alt={rank2.id}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>

            {/* ID Badge */}
            <span className="bg-[#465b74] text-white text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded-full shadow-2xs mb-1">
              {rank2.id}
            </span>

            {/* Silver Marble Pedestal Column */}
            <div className="w-full bg-gradient-to-b from-[#e3e8ee] via-[#cfd6df] to-[#b7c1cd] rounded-t-xl py-3 px-1 text-center shadow-md">
              <span className="block text-base sm:text-lg font-black text-[#303e51]">
                {rank2.prize.toLocaleString()}
              </span>
              <span className="block text-[9px] sm:text-[10px] text-slate-600 font-bold">
                Points: {rank2.points.toLocaleString()}
              </span>
            </div>
          </div>

          {/* RANK 1: CENTER GOLD PEDESTAL (TALLL & GOLD CROWN) */}
          <div className="flex flex-col items-center -mt-6">
            {/* Crown + Avatar Frame with Gold Ring */}
            <div className="relative mb-2">
              {/* Gold Crown 👑 */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10 filter drop-shadow-md">
                <Crown className="w-7 h-7 sm:w-8 sm:h-8 text-[#ffbe33] fill-[#ffbe33] stroke-[#966308]" />
              </div>

              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-0.5 bg-gradient-to-tr from-[#ffeaa7] via-[#f7cd6a] to-[#c78b27] shadow-xl">
                <img
                  src={rank1.avatar}
                  alt={rank1.id}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>

            {/* ID Badge */}
            <span className="bg-[#6c481d] text-[#ffebbe] text-[11px] sm:text-xs font-mono font-black px-2.5 py-0.5 rounded-full shadow-2xs mb-1">
              {rank1.id}
            </span>

            {/* Gold Marble Pedestal Column (Tallest) */}
            <div className="w-full bg-gradient-to-b from-[#fff3d4] via-[#eed193] to-[#d6ad5e] rounded-t-2xl py-4 sm:py-5 px-1 text-center shadow-lg">
              <span className="block text-lg sm:text-xl font-black text-[#503010]">
                {rank1.prize.toLocaleString()}
              </span>
              <span className="block text-[10px] sm:text-[11px] text-[#694218] font-bold">
                Points: {rank1.points.toLocaleString()}
              </span>
            </div>
          </div>

          {/* RANK 3: RIGHT BRONZE PEDESTAL */}
          <div className="flex flex-col items-center">
            {/* Avatar Frame with Bronze Ring */}
            <div className="relative mb-2">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-0.5 bg-gradient-to-tr from-[#f3cfbc] to-white shadow-md">
                <img
                  src={rank3.avatar}
                  alt={rank3.id}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>

            {/* ID Badge */}
            <span className="bg-[#784b33] text-white text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 rounded-full shadow-2xs mb-1">
              {rank3.id}
            </span>

            {/* Bronze Marble Pedestal Column */}
            <div className="w-full bg-gradient-to-b from-[#fae2d5] via-[#e5bc9f] to-[#cf9877] rounded-t-xl py-2.5 px-1 text-center shadow-md">
              <span className="block text-base sm:text-lg font-black text-[#4b2713]">
                {rank3.prize.toLocaleString()}
              </span>
              <span className="block text-[9px] sm:text-[10px] text-[#663e27] font-bold">
                Points: {rank3.points.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          7. RANKED TABLE: Ranks 4 to 10+ (BORDERLESS)
          Rank | Customer | Points | Prize
          ========================================================================= */}
      <div className="space-y-1.5">
        {/* Table Header Bar */}
        <div className="bg-[#edd8ba] rounded-xl px-4 py-2 grid grid-cols-12 text-[11px] sm:text-xs font-bold text-[#55361e] shadow-xs">
          <span className="col-span-2 text-center">Rank</span>
          <span className="col-span-4 text-center">Customer</span>
          <span className="col-span-3 text-center">Points</span>
          <span className="col-span-3 text-center">Prize</span>
        </div>

        {/* Table Rows (borderless) */}
        {leaderboardTable.map((item) => (
          <div
            key={item.id}
            className="bg-gradient-to-r from-[#fffefc] via-[#fffbf3] to-[#fcf5e5] rounded-xl px-3 sm:px-4 py-2.5 grid grid-cols-12 items-center text-xs sm:text-sm shadow-2xs hover:bg-[#fff9ea] transition-colors"
          >
            {/* Rank */}
            <span className="col-span-2 text-center font-black text-slate-800 text-sm sm:text-base">
              {item.rank}
            </span>

            {/* Customer Avatar + ID */}
            <div className="col-span-4 flex items-center justify-center gap-1.5 min-w-0">
              <img
                src={item.avatar}
                alt={item.id}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover shrink-0 shadow-2xs"
              />
              <span className="font-mono font-bold text-slate-900 text-xs truncate">
                {item.id}
              </span>
            </div>

            {/* Points */}
            <span className="col-span-3 text-center font-mono font-bold text-slate-800 text-xs sm:text-sm">
              {item.points.toLocaleString()}
            </span>

            {/* Prize */}
            <span className="col-span-3 text-center font-mono font-black text-[#5a3818] text-xs sm:text-sm">
              {item.prize.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* =========================================================================
          FULL-SCREEN RIGHT-TO-LEFT MODAL SCREENS (BUY RULES, MY REWARDS, MY PURCHASES, VIP LEVEL)
          ========================================================================= */}
      <AnimatePresence>
        {activeModalTab && (
          <motion.div
            key={activeModalTab}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              damping: 26,
              stiffness: 260,
              mass: 0.85,
            }}
            className="fixed inset-0 z-50 bg-gradient-to-b from-[#fdfbf6] via-[#faf5e9] to-[#f4ecd9] flex flex-col w-full h-full overflow-hidden shadow-2xl text-slate-900"
          >
            {/* Top Navigation Bar with Back Button and Close (borderless) */}
            <header className="sticky top-0 z-20 bg-gradient-to-r from-[#fffdf9] via-[#fdf7ec] to-[#fbf1db] px-3.5 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                <button
                  onClick={() => setActiveModalTab(null)}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#f8eedb] hover:bg-[#ebd9bc] active:scale-90 text-[#55361e] flex items-center justify-center transition-all shadow-2xs shrink-0"
                  title="Go Back"
                  aria-label="Go Back"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                </button>

                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#f5e4bd] to-[#edd199] text-[#5c3710] flex items-center justify-center shadow-2xs shrink-0">
                    {activeModalTab === 'BUY RULES' && <HelpCircle className="w-4 h-4 text-[#D0872E]" />}
                    {activeModalTab === 'MY REWARDS' && <Gift className="w-4 h-4 text-[#D0872E]" />}
                    {activeModalTab === 'MY PURCHASES' && <Coins className="w-4 h-4 text-[#D0872E]" />}
                    {activeModalTab === 'VIP LEVEL' && <Crown className="w-4 h-4 text-[#D0872E]" />}
                  </div>
                  <div className="min-w-0 leading-tight">
                    <h3 className="font-serif font-black text-sm sm:text-base text-[#46280b] tracking-wide truncate">
                      {activeModalTab}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-[#86592a] font-medium truncate">
                      {activeModalTab === 'BUY RULES' && 'Commission policy & leaderboard rules'}
                      {activeModalTab === 'MY REWARDS' && 'Referral bonuses, team rebates & claiming'}
                      {activeModalTab === 'MY PURCHASES' && 'Your subscribed plans & daily returns'}
                      {activeModalTab === 'VIP LEVEL' && 'All 10 tier requirements, perks & privileges'}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveModalTab(null)}
                className="w-8 h-8 rounded-full bg-[#f8eedb] hover:bg-[#ebd9bc] active:scale-95 text-[#55361e] flex items-center justify-center transition-colors shadow-2xs shrink-0"
                title="Close"
                aria-label="Close"
              >
                <X className="w-4.5 h-4.5 stroke-[2.5]" />
              </button>
            </header>

            {/* Full-Screen Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-xl mx-auto w-full space-y-4">
              {/* =========================================================================
                  1. VIP LEVEL FULL-SCREEN CONTENT (BORDERLESS BOXES)
                  ========================================================================= */}
              {activeModalTab === 'VIP LEVEL' && (
                <div className="space-y-4 text-xs leading-relaxed">
                  {/* Current Active Status Card */}
                  <div className="bg-gradient-to-r from-[#ffecc3] via-[#fae0ab] to-[#fadca0] p-4 rounded-2xl flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                      <VipBadgeIcon level={selectedVipTier?.level || 1} className="w-14 h-14 shrink-0 drop-shadow-xs" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-[#7d521d] uppercase block">
                            {selectedVipTier?.level === 1 ? 'Current Status' : 'Selected Tier'}
                          </span>
                          {selectedVipTier?.level === 1 && (
                            <span className="bg-emerald-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <h4 className="text-base font-black text-[#46280b]">
                          {selectedVipTier?.title} • {selectedVipTier?.subtitle}
                        </h4>
                        <p className="text-[11px] text-[#714b1c] font-semibold mt-0.5">
                          Daily Rebate: <strong>{selectedVipTier?.rebate}</strong> • Spend Target: <strong>{selectedVipTier?.spend}</strong>
                        </p>
                        <p className="text-[10px] text-[#8c5a29] mt-0.5">
                          Withdrawal Limit: <strong>{selectedVipTier?.limit}</strong>
                        </p>
                      </div>
                    </div>
                    <Crown className="w-7 h-7 text-[#D0872E] fill-[#D0872E] shrink-0" />
                  </div>

                  {/* List of All 10 VIP Tiers (borderless) */}
                  <div className="space-y-2.5">
                    <h4 className="font-serif font-black text-xs text-[#503010] uppercase tracking-wider px-1">
                      Explore All 10 VIP Privilege Tiers
                    </h4>
                    {VIP_TIERS.map((v) => {
                      const isCurrent = v.level === 1;
                      const isSelected = selectedVipTier?.level === v.level;
                      return (
                        <div
                          key={v.level}
                          onClick={() => setSelectedVipTier(v)}
                          className={`p-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-[#fffbf0] shadow-md ring-2 ring-[#D0872E]/50'
                              : 'bg-white shadow-2xs hover:bg-[#fffcf7]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <VipBadgeIcon level={v.level} className="w-11 h-11 shrink-0 drop-shadow-xs" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-serif font-black text-slate-900 text-sm">
                                  {v.title}
                                </span>
                                {isCurrent && (
                                  <span className="bg-emerald-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full">
                                    CURRENT
                                  </span>
                                )}
                              </div>
                              <span className="text-[10.5px] text-[#86592a] font-bold block truncate">
                                {v.subtitle}
                              </span>
                              <span className="text-[10px] text-slate-500 block truncate">
                                Target: <strong className="text-slate-800">{v.spend}</strong> • Limit: {v.limit}
                              </span>
                              <p className="text-[9.5px] text-[#7d511f] font-medium italic mt-0.5 line-clamp-1">
                                ✦ {v.perk}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-black text-[#D0872E] bg-[#faecd4] px-2.5 py-1 rounded-full text-xs font-mono block shadow-2xs">
                              {v.rebate}
                            </span>
                            <span className="text-[9px] text-slate-400 mt-1 block">
                              Rebate
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* =========================================================================
                  2. BUY RULES FULL-SCREEN CONTENT (BORDERLESS BOXES)
                  ========================================================================= */}
              {activeModalTab === 'BUY RULES' && (
                <div className="space-y-3.5 text-xs leading-relaxed text-slate-700">
                  {/* Hero Commission Header Card */}
                  <div className="bg-gradient-to-r from-[#ffecc3] via-[#fae0ab] to-[#fadca0] p-4 rounded-2xl shadow-xs space-y-2 text-[#46280b]">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#D0872E]" />
                      <h4 className="font-serif font-black text-sm uppercase tracking-wide">
                        3-Tier Passive Commission Structure
                      </h4>
                    </div>
                    <p className="text-[11px] text-[#6d451b] font-medium leading-relaxed">
                      Earn automated direct and multi-level bonuses every time a member in your personal referral tree purchases a plan.
                    </p>
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <div className="bg-white/90 rounded-xl p-2 text-center shadow-2xs">
                        <span className="text-[9px] font-bold text-[#86592a] block">Level 1 Direct</span>
                        <span className="text-base font-black text-[#46280b] font-mono">10%</span>
                        <span className="text-[8.5px] text-emerald-700 block font-bold">Instant Payout</span>
                      </div>
                      <div className="bg-white/90 rounded-xl p-2 text-center shadow-2xs">
                        <span className="text-[9px] font-bold text-[#86592a] block">Level 2 Network</span>
                        <span className="text-base font-black text-[#46280b] font-mono">5%</span>
                        <span className="text-[8.5px] text-emerald-700 block font-bold">Automatic</span>
                      </div>
                      <div className="bg-white/90 rounded-xl p-2 text-center shadow-2xs">
                        <span className="text-[9px] font-bold text-[#86592a] block">Level 3 Team</span>
                        <span className="text-base font-black text-[#46280b] font-mono">2%</span>
                        <span className="text-[8.5px] text-emerald-700 block font-bold">Perpetual</span>
                      </div>
                    </div>
                  </div>

                  {/* Section 1: Detailed Level 1 Rules */}
                  <div className="p-4 bg-white rounded-2xl shadow-2xs space-y-2">
                    <div className="flex items-center gap-2 text-[#503010]">
                      <div className="w-5 h-5 rounded-full bg-[#f8eedb] text-[#86592a] font-bold flex items-center justify-center text-[10px]">
                        1
                      </div>
                      <h5 className="font-black text-xs">Level 1 (Direct Friends) — 10% Cash Commission</h5>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Share your personal invite code or link. When your direct contact registers and joins any VIP investment plan, you receive <strong className="text-slate-900">10% of their investment amount</strong> credited immediately into your wallet.
                    </p>
                    <div className="bg-[#fef9ee] p-2.5 rounded-xl text-[10.5px] text-[#6d451b] shadow-2xs">
                      <strong>Example:</strong> Friend invests ₹10,000 in a plan → You immediately get <strong>₹1,000 cash</strong> in your wallet.
                    </div>
                  </div>

                  {/* Section 2: Level 2 & 3 Rules */}
                  <div className="p-4 bg-white rounded-2xl shadow-2xs space-y-2">
                    <div className="flex items-center gap-2 text-[#503010]">
                      <div className="w-5 h-5 rounded-full bg-[#f8eedb] text-[#86592a] font-bold flex items-center justify-center text-[10px]">
                        2
                      </div>
                      <h5 className="font-black text-xs">Level 2 (5%) & Level 3 (2%) Indirect Rewards</h5>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Your income does not stop at your direct friends. Whenever your friends invite their own contacts, you receive <strong className="text-slate-900">5% commission on Level 2</strong> and <strong className="text-slate-900">2% on Level 3</strong> without any limit on the number of members.
                    </p>
                  </div>

                  {/* Section 3: Leaderboard Points System */}
                  <div className="p-4 bg-white rounded-2xl shadow-2xs space-y-2">
                    <div className="flex items-center gap-2 text-[#503010]">
                      <div className="w-5 h-5 rounded-full bg-[#f8eedb] text-[#86592a] font-bold flex items-center justify-center text-[10px]">
                        3
                      </div>
                      <h5 className="font-black text-xs">Leaderboard Points Calculation</h5>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      • Every <strong className="text-slate-900">₹1 invested</strong> in a plan by you or your referral network generates <strong className="text-slate-900">1 Point</strong> on the leaderboard.
                    </p>
                    <p className="text-slate-600 text-[11px]">
                      • The leaderboard updates in real-time every 30 minutes, allowing you to climb the podium ranks.
                    </p>
                  </div>

                  {/* Section 4: Weekly Settlement */}
                  <div className="p-4 bg-white rounded-2xl shadow-2xs space-y-2">
                    <div className="flex items-center gap-2 text-[#503010]">
                      <div className="w-5 h-5 rounded-full bg-[#f8eedb] text-[#86592a] font-bold flex items-center justify-center text-[10px]">
                        4
                      </div>
                      <h5 className="font-black text-xs">Weekly Sunday Settlement & Cash Payout</h5>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      • Settlement takes place every Sunday night at <strong className="text-slate-900">23:59:59</strong>.
                    </p>
                    <p className="text-slate-600 text-[11px]">
                      • The Top 10 champions receive direct bonus cash prizes (up to ₹3,000) deposited directly into their wallet, withdrawable immediately.
                    </p>
                  </div>

                  {/* Section 5: Payouts & Fair Play */}
                  <div className="p-4 bg-white rounded-2xl shadow-2xs space-y-2">
                    <div className="flex items-center gap-2 text-[#503010]">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <h5 className="font-black text-xs">Instant Withdrawal & Fair Play Policy</h5>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      All commission earnings are completely unencumbered. You can withdraw directly to UPI or Bank transfer 24/7 with zero platform fees once KYC is active.
                    </p>
                  </div>
                </div>
              )}

              {/* =========================================================================
                  3. MY REWARDS FULL-SCREEN CONTENT (BORDERLESS BOXES)
                  ========================================================================= */}
              {activeModalTab === 'MY REWARDS' && (
                <div className="space-y-4 text-xs">
                  {/* Hero Balance Card */}
                  <div className="bg-gradient-to-r from-[#ffecc3] via-[#fae0ab] to-[#fadca0] p-5 rounded-2xl text-center space-y-1.5 shadow-xs">
                    <span className="text-[10.5px] font-bold text-[#7d521d] uppercase tracking-wider block">
                      Total Referral Rewards Earned
                    </span>
                    <h3 className="text-3xl font-black text-[#46280b] font-mono">₹14,200</h3>
                    <p className="text-[11px] text-[#7d521d] font-semibold">
                      Credited to wallet & available for instant withdrawal
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={() => {
                          triggerConfetti();
                          setActiveModalTab(null);
                        }}
                        className="w-full py-2.5 bg-[#D0872E] hover:bg-[#b87324] text-white font-bold rounded-xl shadow-md transition-all active:scale-95 text-xs flex items-center justify-center gap-1.5"
                      >
                        <Gift className="w-4 h-4 text-white/90" />
                        <span>Claim All Rewards to Wallet</span>
                      </button>
                    </div>
                  </div>

                  {/* Quick Share Code Box */}
                  <div className="bg-white p-3.5 rounded-2xl shadow-2xs space-y-2">
                    <span className="text-[10px] font-bold text-[#86592a] uppercase tracking-wider block">
                      Your Referral Invite Code
                    </span>
                    <div className="flex items-center justify-between bg-[#fbf6ec] rounded-xl px-3 py-2 shadow-2xs">
                      <span className="font-mono font-black text-base text-[#46280b] tracking-widest">
                        VIP8899
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText('VIP8899');
                          setCopiedCode(true);
                          setTimeout(() => setCopiedCode(false), 2000);
                        }}
                        className="flex items-center gap-1 text-xs font-bold px-3 py-1 bg-[#D0872E] hover:bg-[#b87324] text-white rounded-lg active:scale-90 transition-all shadow-xs"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Multi-Tier Commissions Breakdown (borderless) */}
                  <div className="space-y-2">
                    <h4 className="font-serif font-black text-xs text-[#503010] uppercase tracking-wider px-1">
                      Commissions by Referral Tier
                    </h4>
                    <div className="p-3.5 bg-white rounded-xl flex items-center justify-between shadow-2xs">
                      <div>
                        <span className="font-bold text-slate-900 text-xs block">
                          Tier 1 Direct Commissions (10%)
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          2 Active Direct Referral Members
                        </span>
                      </div>
                      <span className="font-mono font-black text-emerald-700 text-sm">
                        ₹9,800
                      </span>
                    </div>

                    <div className="p-3.5 bg-white rounded-xl flex items-center justify-between shadow-2xs">
                      <div>
                        <span className="font-bold text-slate-900 text-xs block">
                          Tier 2 Network Commissions (5%)
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          4 Indirect Network Members
                        </span>
                      </div>
                      <span className="font-mono font-black text-emerald-700 text-sm">
                        ₹3,400
                      </span>
                    </div>

                    <div className="p-3.5 bg-white rounded-xl flex items-center justify-between shadow-2xs">
                      <div>
                        <span className="font-bold text-slate-900 text-xs block">
                          Tier 3 Team Commissions (2%)
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          8 Extended Team Members
                        </span>
                      </div>
                      <span className="font-mono font-black text-emerald-700 text-sm">
                        ₹1,000
                      </span>
                    </div>
                  </div>

                  {/* Recent Reward Activity History */}
                  <div className="space-y-2">
                    <h4 className="font-serif font-black text-xs text-[#503010] uppercase tracking-wider px-1">
                      Recent Referral Income Ledger
                    </h4>
                    <div className="space-y-1.5">
                      <div className="p-2.5 bg-white/90 rounded-xl shadow-2xs flex items-center justify-between text-[11px]">
                        <div>
                          <span className="font-bold text-slate-800 block">Direct Rebate: Member 2447951</span>
                          <span className="text-[9.5px] text-slate-500">Today, 14:22 • Level 1 Bonus</span>
                        </div>
                        <span className="font-mono font-black text-emerald-700">+₹1,000</span>
                      </div>
                      <div className="p-2.5 bg-white/90 rounded-xl shadow-2xs flex items-center justify-between text-[11px]">
                        <div>
                          <span className="font-bold text-slate-800 block">VIP Milestone Bonus</span>
                          <span className="text-[9.5px] text-slate-500">Yesterday • VIP 2 Promotion Gift</span>
                        </div>
                        <span className="font-mono font-black text-emerald-700">+₹500</span>
                      </div>
                      <div className="p-2.5 bg-white/90 rounded-xl shadow-2xs flex items-center justify-between text-[11px]">
                        <div>
                          <span className="font-bold text-slate-800 block">Tier 2 Rebate: Member 6475895</span>
                          <span className="text-[9.5px] text-slate-500">2 days ago • Level 2 Bonus</span>
                        </div>
                        <span className="font-mono font-black text-emerald-700">+₹350</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* =========================================================================
                  4. MY PURCHASES FULL-SCREEN CONTENT (BORDERLESS BOXES)
                  ========================================================================= */}
              {activeModalTab === 'MY PURCHASES' && (
                <div className="space-y-4 text-xs">
                  {/* Summary Metric Header */}
                  <div className="grid grid-cols-3 gap-2 p-3 bg-gradient-to-r from-[#ffecc3] via-[#fae0ab] to-[#fadca0] rounded-2xl shadow-xs text-center text-[#46280b]">
                    <div className="p-1">
                      <span className="text-[9px] font-bold text-[#86592a] block">Active Plans</span>
                      <span className="text-base font-black font-mono">
                        {activeInvestments.length > 0 ? activeInvestments.length : 2}
                      </span>
                    </div>
                    <div className="p-1 border-x border-[#dfbe7e]/30">
                      <span className="text-[9px] font-bold text-[#86592a] block">Daily Return</span>
                      <span className="text-base font-black font-mono text-emerald-800">
                        +₹{activeInvestments.length > 0
                          ? activeInvestments.reduce((acc, i) => acc + i.dailyReturn, 0).toLocaleString('en-IN')
                          : '1,250'}/d
                      </span>
                    </div>
                    <div className="p-1">
                      <span className="text-[9px] font-bold text-[#86592a] block">Total Accrued</span>
                      <span className="text-base font-black font-mono">
                        ₹{activeInvestments.length > 0
                          ? activeInvestments.reduce((acc, i) => acc + (i.dailyReturn * i.daysCompleted), 0).toLocaleString('en-IN')
                          : '6,250'}
                      </span>
                    </div>
                  </div>

                  {/* Active Purchases List (borderless) */}
                  <div className="space-y-2.5">
                    <h4 className="font-serif font-black text-xs text-[#503010] uppercase tracking-wider px-1">
                      Your Active Subscribed VIP Plans
                    </h4>

                    {activeInvestments.length > 0 ? (
                      activeInvestments.map((inv) => (
                        <div
                          key={inv.id}
                          className="p-3.5 bg-white rounded-2xl shadow-2xs space-y-2 hover:bg-[#fffdf9] transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-black text-slate-900 text-xs sm:text-sm">
                                {inv.planName}
                              </h5>
                              <span className="text-[10px] text-slate-500 font-medium">
                                Invested: ₹{inv.investedAmount.toLocaleString('en-IN')} • Started {inv.startDate}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-black text-[#966308] text-sm block">
                                +₹{inv.dailyReturn}/day
                              </span>
                              <span className="text-[8.5px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                                Running
                              </span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-1 pt-1">
                            <div className="flex justify-between text-[9.5px] text-slate-500 font-semibold">
                              <span>Duration Progress</span>
                              <span className="font-mono font-bold text-[#55361e]">
                                Day {inv.daysCompleted} of {inv.totalDays} Days
                              </span>
                            </div>
                            <div className="w-full bg-[#f4e2be] h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-[#D0872E] to-[#b87324] h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.min(100, Math.round((inv.daysCompleted / inv.totalDays) * 100))}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <>
                        {/* Sample Active Plan 1 */}
                        <div className="p-3.5 bg-white rounded-2xl shadow-2xs space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-black text-slate-900 text-xs sm:text-sm">
                                Banarasi Silk Weaver Fund
                              </h5>
                              <span className="text-[10px] text-slate-500 font-medium">
                                Invested: ₹5,000 • Started 20 Oct 2026
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-black text-[#966308] text-sm block">
                                +₹650/day
                              </span>
                              <span className="text-[8.5px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                                Running
                              </span>
                            </div>
                          </div>
                          <div className="space-y-1 pt-1">
                            <div className="flex justify-between text-[9.5px] text-slate-500 font-semibold">
                              <span>Duration Progress</span>
                              <span className="font-mono font-bold text-[#55361e]">
                                Day 5 of 45 Days
                              </span>
                            </div>
                            <div className="w-full bg-[#f4e2be] h-1.5 rounded-full overflow-hidden">
                              <div className="bg-gradient-to-r from-[#D0872E] to-[#b87324] h-full rounded-full w-[11%]" />
                            </div>
                          </div>
                        </div>

                        {/* Sample Active Plan 2 */}
                        <div className="p-3.5 bg-white rounded-2xl shadow-2xs space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-black text-slate-900 text-xs sm:text-sm">
                                Kanjivaram Royal Brocade
                              </h5>
                              <span className="text-[10px] text-slate-500 font-medium">
                                Invested: ₹3,000 • Started 18 Oct 2026
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-black text-[#966308] text-sm block">
                                +₹600/day
                              </span>
                              <span className="text-[8.5px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                                Running
                              </span>
                            </div>
                          </div>
                          <div className="space-y-1 pt-1">
                            <div className="flex justify-between text-[9.5px] text-slate-500 font-semibold">
                              <span>Duration Progress</span>
                              <span className="font-mono font-bold text-[#55361e]">
                                Day 7 of 30 Days
                              </span>
                            </div>
                            <div className="w-full bg-[#f4e2be] h-1.5 rounded-full overflow-hidden">
                              <div className="bg-gradient-to-r from-[#D0872E] to-[#b87324] h-full rounded-full w-[23%]" />
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Explore More CTA */}
                  {onOpenPlans && (
                    <button
                      onClick={() => {
                        setActiveModalTab(null);
                        onOpenPlans();
                      }}
                      className="w-full py-3 bg-[#D0872E] hover:bg-[#b87324] text-white font-bold rounded-xl text-xs active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4 text-white/90" />
                      <span>Browse More High-Yield Plans</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
