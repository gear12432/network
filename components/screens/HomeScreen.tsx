'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  ShieldCheck,
  ArrowRight,
  Users,
  TrendingUp,
  DollarSign,
  Sparkles,
  Gift,
  Clock,
  Layers,
  FileCheck2,
  LayoutGrid,
  List,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { InvestmentPlan, Category, UserStats, ActiveInvestment } from '@/types/investment';
import PlanCard from '@/components/PlanCard';
import FloatingInput from '@/components/ui/FloatingInput';

interface HomeScreenProps {
  stats: UserStats;
  plans: InvestmentPlan[];
  selectedCategory: Category;
  onSelectCategory: (cat: Category) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onJoinPlan: (plan: InvestmentPlan) => void;
  onViewPlanDetails: (plan: InvestmentPlan) => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onClaimDailyRoi: () => void;
  onOpenFullKyc?: () => void;
  activeInvestments: ActiveInvestment[];
  isMobileView?: boolean;
}

export default function HomeScreen({
  stats,
  plans,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onJoinPlan,
  onViewPlanDetails,
  onOpenDeposit: _onOpenDeposit,
  onOpenWithdraw: _onOpenWithdraw,
  onClaimDailyRoi,
  onOpenFullKyc,
  activeInvestments,
  isMobileView = false,
}: HomeScreenProps) {
  const categories: Category[] = ['All Plans', 'VIP', 'Platinum', 'Gold', 'Silver', 'Bronze'];

  // View Mode: default to 'grid' on desktop, 'list' on mobile
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(isMobileView ? 'list' : 'grid');

  // Mobile Stats Dropdown Accordion Toggle (hidden by default on mobile, always visible on desktop)
  const [isStatsOpenMobile, setIsStatsOpenMobile] = useState(false);

  // Slider State (Small compact height as marked in screenshot)
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 0,
      badgeLeft: 'SECURE & FAST',
      badgeRight: '0% Platform Fee',
      title: 'Instant Withdrawal Guarantee',
      subtext: 'Transfer funds directly to your bank or UPI ID instantly 24/7.',
      btnText: 'Plans',
      action: () => onSelectCategory('All Plans'),
      bgGradient: 'from-[#4a2b0e] via-[#75411a] to-[#a86e24]',
    },
    {
      id: 1,
      badgeLeft: 'FULL KYC ACTIVE',
      badgeRight: 'Verified Tier 3',
      title: 'Full KYC & Unlimited Payouts',
      subtext: 'Aadhaar & PAN linked for up to ₹5,00,000 daily bank withdrawals.',
      btnText: 'Full KYC',
      action: () => onOpenFullKyc?.(),
      bgGradient: 'from-[#3b200b] via-[#5c3516] to-[#8f5624]',
    },
    {
      id: 2,
      badgeLeft: 'GUARANTEED RETURNS',
      badgeRight: 'Up to 110% ROI',
      title: 'High-Yield Daily Compounding',
      subtext: 'Earn guaranteed daily profits credited every 24 hours to your wallet.',
      btnText: 'Invest',
      action: () => onSelectCategory('VIP'),
      bgGradient: 'from-[#543012] via-[#7e4a1f] to-[#be8432]',
    },
  ];

  // Auto-rotate slider every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Filter plans based on category and search query
  const filteredPlans = plans.filter((plan) => {
    const matchesCategory =
      selectedCategory === 'All Plans' || plan.category === selectedCategory;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      plan.name.toLowerCase().includes(query) ||
      plan.amount.toString().includes(query) ||
      `${plan.roiPercentage}`.includes(query) ||
      plan.category.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const slide = slides[currentSlide];

  return (
    <div className="space-y-4 pb-20 sm:pb-8">
      {/* 1. Desktop Executive Bento Grid (Search + Carousel + Stats) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Search Bar + Compact Slider + Daily Return + Active Investments */}
        <div className="lg:col-span-8 space-y-3">
          {/* Search Bar with Floating Animated Label */}
          <FloatingInput
            label="Search plans by name, amount, or ROI..."
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-500" />}
            inputClassName="font-medium text-black text-xs sm:text-sm"
            rightElement={
              searchQuery ? (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="text-xs text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
                  title="Clear search"
                >
                  ✕
                </button>
              ) : null
            }
          />

          {/* Compact Small-Height Slider Banner */}
          <div
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${slide.bgGradient} text-white p-3 sm:p-3.5 shadow-sm transition-all duration-500 min-h-[96px] max-h-[108px] flex flex-col justify-between`}
          >
            {/* Subtle background glow effect */}
            <div className="absolute -right-6 -top-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />

            {/* Top Badges Row */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-xs text-[9px] font-bold px-1.5 py-0.5 rounded-full tracking-wide uppercase">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-300" />
                <span>{slide.badgeLeft}</span>
              </span>

              <span className="text-[9px] font-bold bg-black/20 text-blue-100 px-1.5 py-0.5 rounded-full border border-white/10">
                {slide.badgeRight}
              </span>
            </div>

            {/* Main Banner Heading & Subtitle */}
            <div className="my-0.5">
              <h3 className="text-xs sm:text-sm font-black tracking-tight leading-tight truncate">
                {slide.title}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-blue-100/90 leading-tight truncate max-w-md">
                {slide.subtext}
              </p>
            </div>

            {/* Bottom Carousel Dots + CTA Button */}
            <div className="flex items-center justify-between pt-0.5">
              <div className="flex items-center gap-1">
                {slides.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      currentSlide === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
                    }`}
                    title={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={slide.action}
                className="flex items-center gap-1 text-[10px] sm:text-xs font-bold bg-[#fff8eb] text-[#4e2e0f] hover:bg-white active:scale-95 px-2.5 py-1 rounded-full transition-all shadow-xs cursor-pointer"
              >
                <span>{slide.btnText}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Daily ROI Quick Claim Bar */}
          {stats.unclaimedRoi > 0 && (
            <div className="bg-gradient-to-r from-[#fff9eb] via-[#fcf3e0] to-[#f6e5c5] border border-[#dfbe7e] rounded-2xl p-2.5 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#4e2e0f] text-[#ffebbe] flex items-center justify-center shrink-0 shadow-xs">
                  <Gift className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#55361e]">Daily Return Ready</span>
                    <span className="text-[9px] bg-[#faecd4] text-[#965c19] font-bold px-1.5 rounded-full border border-[#e8d2aa]">
                      Instant
                    </span>
                  </div>
                  <p className="text-[10px] text-[#784f29]">
                    ₹{stats.unclaimedRoi.toFixed(2)} accumulated today
                  </p>
                </div>
              </div>

              <button
                onClick={onClaimDailyRoi}
                className="bg-[#4e2e0f] hover:bg-[#3b220a] active:scale-95 text-[#ffebbe] text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-[#fed788]" />
                <span>Claim</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Executive Quick Stats Grid + VIP Security Card */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-3">
          {/* Mobile Dropdown Accordion Toggle Button for Account Stats */}
          <button
            onClick={() => setIsStatsOpenMobile(!isStatsOpenMobile)}
            className="md:hidden flex items-center justify-between w-full p-3 rounded-2xl bg-gradient-to-r from-[#fffefc] via-[#fbf5e7] to-[#f4e4c2] border border-[#dfbe7e] shadow-2xs text-[#46280b] active:scale-[0.99] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#fadca0] via-[#ffecc3] to-[#fff4dc] text-[#8a5b28] flex items-center justify-center border border-[#dfc38d] shadow-2xs">
                <TrendingUp className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="text-left">
                <span className="text-xs font-black text-[#46280b] block leading-tight">
                  All Data Account Statistics
                </span>
                <span className="text-[10px] text-[#8a5b28] font-semibold leading-tight">
                  {isStatsOpenMobile ? 'Tap to hide statistics' : 'Tap to show JOINS, EARNED, PAYOUT, ACTIVE'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#8a5b28] bg-[#faecd4] px-2.5 py-1 rounded-xl border border-[#e8d2aa]">
              <span>{isStatsOpenMobile ? 'Hide' : 'Show'}</span>
              {isStatsOpenMobile ? (
                <ChevronUp className="w-4 h-4 stroke-[2.5]" />
              ) : (
                <ChevronDown className="w-4 h-4 stroke-[2.5]" />
              )}
            </div>
          </button>

          {/* 4 Stat Cards: Hidden by default in mobile view, toggled via dropdown; Always visible on desktop */}
          <div className={`grid grid-cols-2 gap-2.5 ${isStatsOpenMobile ? 'grid' : 'hidden md:grid'}`}>
            {/* Joins Card */}
            <div className="bg-gradient-to-b from-[#fffefc] via-[#fbf5e7] to-[#f4e4c2] rounded-2xl p-3 border border-[#dfbe7e] shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-extrabold text-[#8a5b28] uppercase tracking-wider">JOINS</span>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#fadca0] via-[#ffecc3] to-[#fff4dc] text-[#55361e] flex items-center justify-center border-2 border-[#dfc38d] shadow-xs">
                  <Users className="w-5 h-5 stroke-[2.5]" />
                </div>
              </div>
              <span className="text-base font-black text-[#46280b] font-mono">
                {stats.totalJoins.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-emerald-700 font-bold">+18.4% active</span>
            </div>

            {/* Earned Card */}
            <div className="bg-gradient-to-b from-[#fffefc] via-[#fbf5e7] to-[#f4e4c2] rounded-2xl p-3 border border-[#dfbe7e] shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-extrabold text-[#8a5b28] uppercase tracking-wider">EARNED</span>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#fadca0] via-[#ffecc3] to-[#fff4dc] text-[#965c19] flex items-center justify-center border-2 border-[#dfc38d] shadow-xs">
                  <TrendingUp className="w-5 h-5 stroke-[2.5]" />
                </div>
              </div>
              <span className="text-base font-black text-[#46280b] font-mono">
                ₹{stats.totalEarned.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-emerald-700 font-bold">Guaranteed ROI</span>
            </div>

            {/* Payout Card */}
            <div className="bg-gradient-to-b from-[#fffefc] via-[#fbf5e7] to-[#f4e4c2] rounded-2xl p-3 border border-[#dfbe7e] shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-extrabold text-[#8a5b28] uppercase tracking-wider">PAYOUT</span>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#fadca0] via-[#ffecc3] to-[#fff4dc] text-[#55361e] flex items-center justify-center border-2 border-[#dfc38d] shadow-xs">
                  <DollarSign className="w-5 h-5 stroke-[2.5]" />
                </div>
              </div>
              <span className="text-base font-black text-[#46280b] font-mono">
                ₹{stats.totalPayout.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-emerald-700 font-bold">Instant to Bank</span>
            </div>

            {/* Active Plans Count */}
            <div className="bg-gradient-to-b from-[#fffefc] via-[#fbf5e7] to-[#f4e4c2] rounded-2xl p-3 border border-[#dfbe7e] shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-extrabold text-[#8a5b28] uppercase tracking-wider">ACTIVE</span>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#fadca0] via-[#ffecc3] to-[#fff4dc] text-[#965c19] flex items-center justify-center border-2 border-[#dfc38d] shadow-xs">
                  <Clock className="w-5 h-5 stroke-[2.5]" />
                </div>
              </div>
              <span className="text-base font-black text-[#46280b] font-mono">
                {activeInvestments.length} Running
              </span>
              <span className="text-[10px] text-emerald-700 font-bold">24/7 Compounding</span>
            </div>
          </div>

          {/* Full KYC & VIP Protection Box */}
          <div className="bg-gradient-to-br from-[#4e2e0f] to-[#361c06] p-3.5 rounded-2xl border border-[#dfbe7e]/50 text-white shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#d9a54c] to-[#be8832] text-[#2b1706] flex items-center justify-center font-bold">
                <FileCheck2 className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#ffebbe] block leading-tight">Tier 3 VIP Security</span>
                <span className="text-[10px] text-[#fed788]/80 leading-tight">Instant Payouts to Bank Active</span>
              </div>
            </div>
            {onOpenFullKyc && (
              <button
                onClick={onOpenFullKyc}
                className="px-2.5 py-1 bg-[#fff8eb] hover:bg-white text-[#4e2e0f] text-[11px] font-bold rounded-lg transition-all shadow-xs shrink-0 cursor-pointer"
              >
                Full KYC
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. CATEGORIES Section Header, Filter Pills & View Mode Switcher */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2 px-0.5">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-[10px] font-extrabold text-[#8a5b28] tracking-wider uppercase">
              CATEGORIES
            </span>
            <span className="text-xs font-bold text-[#71471f] bg-[#faecd4] px-2.5 py-0.5 rounded-full border border-[#e8d2aa]">
              {filteredPlans.length} Plans
            </span>
          </div>

          {/* Grid View vs List View Toggle Buttons */}
          <div className="flex items-center bg-[#f5e9d3] p-1 rounded-xl border border-[#dfbe7e]">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#4e2e0f] text-[#ffebbe] shadow-xs'
                  : 'text-[#71471f] hover:text-[#4e2e0f]'
              }`}
              title="Grid View (ग्रिड व्यू)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid View</span>
            </button>

            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#4e2e0f] text-[#ffebbe] shadow-xs'
                  : 'text-[#71471f] hover:text-[#4e2e0f]'
              }`}
              title="List View (लिस्ट व्यू)"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List View</span>
            </button>
          </div>
        </div>

        {/* Scrollable category pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-2xs cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#4e2e0f] to-[#3a1d06] text-[#fed788] border border-[#caa050] font-bold'
                    : 'bg-white/90 text-[#71471f] hover:bg-white border border-[#dfbe7e]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Available Plans (Responsive Multi-Column Grid or List View) */}
      <div className="space-y-3 pt-1">
        {filteredPlans.length === 0 ? (
          <div className="bg-gradient-to-b from-[#fffefc] via-[#fbf5e7] to-[#f4e4c2] rounded-2xl p-8 text-center border border-[#dfbe7e]">
            <Layers className="w-10 h-10 text-[#caa050] mx-auto mb-2" />
            <h5 className="text-sm font-bold text-[#46280b]">No plans found</h5>
            <p className="text-xs text-[#8a5b28] mt-0.5">Try adjusting your search query or category filter</p>
            <button
              onClick={() => {
                onSearchChange('');
                onSelectCategory('All Plans');
              }}
              className="mt-3 text-xs text-[#8a5b28] hover:text-[#46280b] font-bold underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Multi-column Grid View (Up to 4 columns on large screens) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
            {filteredPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onJoin={onJoinPlan}
                onViewDetails={onViewPlanDetails}
                viewMode="grid"
              />
            ))}
          </div>
        ) : (
          /* Single-column List View */
          <div className="space-y-2.5">
            {filteredPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onJoin={onJoinPlan}
                onViewDetails={onViewPlanDetails}
                viewMode="list"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
