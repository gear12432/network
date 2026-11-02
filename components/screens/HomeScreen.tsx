'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Gift,
  Clock,
  Layers,
  FileCheck2,
  LayoutGrid,
  List,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import { InvestmentPlan, Category, UserStats, ActiveInvestment } from '@/types/investment';
import PlanCard from '@/components/PlanCard';
import { getCustomSlidersFromFirestore, saveWithdrawalToFirestore } from '@/lib/firebase';
import { Joins3DIcon, Earned3DIcon, Payout3DIcon, Active3DIcon } from '@/components/ui/Stat3DIcons';
import { triggerConfetti } from '@/lib/confetti';

interface HomeScreenProps {
  stats: UserStats;
  plans: InvestmentPlan[];
  selectedCategory: Category;
  onSelectCategory: (cat: Category) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onJoinPlan: (plan: InvestmentPlan) => void;
  onViewPlanDetails: (plan: InvestmentPlan) => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onClaimDailyRoi: () => void;
  onOpenFullKyc?: () => void;
  onOpenPurchaseHistory?: () => void;
  activeInvestments: ActiveInvestment[];
  isMobileView?: boolean;
}

export default function HomeScreen({
  stats,
  plans,
  selectedCategory,
  onSelectCategory,
  searchQuery = '',
  onSearchChange,
  onJoinPlan,
  onViewPlanDetails,
  onOpenDeposit: _onOpenDeposit,
  onOpenWithdraw: _onOpenWithdraw,
  onClaimDailyRoi,
  onOpenFullKyc,
  onOpenPurchaseHistory,
  activeInvestments,
  isMobileView = false,
}: HomeScreenProps) {
  const categories: Category[] = [
    'All Plans',
    'Starter',
    'Basic',
    'Silver',
    'Gold',
    'Platinum',
    'Diamond',
    'Premium',
    'Growth',
    'Long-Term',
    'Elite',
  ];

  // View Mode: default to 'grid' on desktop, 'list' on mobile
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(isMobileView ? 'list' : 'grid');

  // Mobile Stats Dropdown Accordion Toggle
  const [isStatsOpenMobile, setIsStatsOpenMobile] = useState(false);

  // Claim to Firebase Status
  const [claimedPlanIds, setClaimedPlanIds] = useState<string[]>([]);
  const [claimToast, setClaimToast] = useState<string | null>(null);

  // Slider State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [customSlides, setCustomSlides] = useState<any[]>([]);

  // Fetch custom sliders from Firebase on mount
  useEffect(() => {
    let isMounted = true;
    getCustomSlidersFromFirestore().then((sliders) => {
      if (isMounted && sliders && sliders.length > 0) {
        setCustomSlides(sliders);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const defaultSlides = [
    {
      id: 0,
      badgeLeft: 'SECURE & FAST',
      badgeRight: '0% Platform Fee',
      title: 'Instant Withdrawal Guarantee',
      subtext: 'Transfer funds directly to your bank or UPI ID instantly 24/7.',
      btnText: 'Plans',
      action: () => onSelectCategory('All Plans'),
      bgGradient: 'from-[#2c180a] via-[#4a280e] to-[#6d3e16]',
    },
    {
      id: 1,
      badgeLeft: 'FULL KYC ACTIVE',
      badgeRight: 'Verified Tier 3',
      title: 'Full KYC & Unlimited Payouts',
      subtext: 'Aadhaar & PAN linked for up to ₹5,00,000 daily bank withdrawals.',
      btnText: 'Full KYC',
      action: () => onOpenFullKyc?.(),
      bgGradient: 'from-[#231206] via-[#3a200a] to-[#593414]',
    },
    {
      id: 2,
      badgeLeft: 'GUARANTEED RETURNS',
      badgeRight: 'Up to 110% ROI',
      title: 'High-Yield Daily Compounding',
      subtext: 'Earn guaranteed daily profits credited every 24 hours to your wallet.',
      btnText: 'Invest',
      action: () => onSelectCategory('VIP' as Category),
      bgGradient: 'from-[#381f0b] via-[#5c3713] to-[#8c5720]',
    },
  ];

  const slides = customSlides.length > 0 ? customSlides : defaultSlides;

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

  const slide = slides[currentSlide % slides.length] || slides[0];

  // Helper to calculate Maturity Date string
  const getMaturityDateStr = (startDateStr?: string, durationDays: number = 30) => {
    try {
      const baseDate = startDateStr ? new Date(startDateStr) : new Date();
      if (isNaN(baseDate.getTime())) {
        const fallback = new Date();
        fallback.setDate(fallback.getDate() + durationDays);
        return fallback.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      }
      baseDate.setDate(baseDate.getDate() + durationDays);
      return baseDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return '30 Days Matured';
    }
  };

  // Claim Active Matured Plan -> Save Withdrawal Request to Firebase (`withdrawals` collection)
  const handleClaimActivePlanToFirebase = async (inv: ActiveInvestment) => {
    if (claimedPlanIds.includes(inv.id)) return;

    const withdrawRecord = {
      id: `wth-${Date.now()}`,
      loginUid: stats.loginUid || 'GK35648',
      userName: stats.userName || 'User',
      mobile: stats.mobile || '9876543210',
      amount: inv.totalReturn || inv.investedAmount * 1.5,
      bankDetails: 'skjiyaul@okhdfcbank linked',
      dateTime: new Date().toLocaleString('en-IN'),
      status: 'Pending' as const,
      createdAt: new Date().toISOString(),
      customerId: inv.customerId,
      customerName: inv.customerName,
      customerMobile: inv.customerMobile,
      planName: inv.planName,
    };

    const res = await saveWithdrawalToFirestore(withdrawRecord);
    if (res.success) {
      setClaimedPlanIds((prev) => [...prev, inv.id]);
      triggerConfetti();
      setClaimToast(`Withdrawal request for ${inv.planName} saved to Firebase (Status: Pending)!`);
      setTimeout(() => setClaimToast(null), 4000);
    }
  };

  return (
    <div className="space-y-3.5 pb-20 sm:pb-8">
      {/* Toast Notification Banner for Firebase Withdrawal Claim */}
      {claimToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1e2330] text-emerald-400 text-xs sm:text-sm font-bold py-2.5 px-5 rounded-full border border-emerald-500/40 shadow-xl backdrop-blur-md animate-bounce flex items-center gap-2">
          <span>✅</span>
          <span>{claimToast}</span>
        </div>
      )}

      {/* 1. Executive Bento Grid (Carousel + Stats) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Left Column: Compact Slider + Daily Return */}
        <div className="lg:col-span-8 space-y-2.5">
          {/* Compact Small-Height Slider Banner */}
          <div
            className={`relative overflow-hidden rounded-2xl ${
              slide.imageUrl ? 'bg-slate-900' : `bg-gradient-to-r ${slide.bgGradient || 'from-[#2c180a] via-[#4a280e] to-[#6d3e16]'}`
            } text-white p-3 shadow-sm transition-all duration-500 min-h-[92px] max-h-[102px] flex flex-col justify-between border border-[#dfbe7e]/50`}
          >
            {slide.imageUrl && (
              <img
                src={slide.imageUrl}
                alt={slide.title || 'Home Banner'}
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
            )}
            {slide.imageUrl && (
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/50 to-slate-950/30 z-0" />
            )}

            {!slide.imageUrl && (
              <div className="absolute -right-6 -top-6 w-28 h-28 bg-[#dfbe7e]/15 rounded-full blur-xl pointer-events-none z-0" />
            )}

            {/* Top Badges Row */}
            <div className="flex items-center justify-between relative z-10">
              <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-xs text-[9px] font-bold px-1.5 py-0.5 rounded-full tracking-wide uppercase text-white">
                <ShieldCheck className="w-2.5 h-2.5 text-emerald-300" />
                <span>{slide.badgeLeft || 'SPECIAL OFFER'}</span>
              </span>

              <span className="text-[9px] font-bold bg-black/40 text-[#ffd485] px-1.5 py-0.5 rounded-full border border-white/10 backdrop-blur-xs font-mono">
                {slide.badgeRight || 'VERIFIED'}
              </span>
            </div>

            {/* Main Banner Heading & Subtitle */}
            <div className="my-0.5 relative z-10">
              <h3 className="text-xs sm:text-sm font-black tracking-tight leading-tight truncate drop-shadow-sm font-serif text-white">
                {slide.title}
              </h3>
              {slide.subtext && (
                <p className="text-[10px] sm:text-[11px] text-[#faecd4]/90 leading-tight truncate max-w-md">
                  {slide.subtext}
                </p>
              )}
            </div>

            {/* Bottom Carousel Dots + CTA Button */}
            <div className="flex items-center justify-between pt-0.5 relative z-10">
              <div className="flex items-center gap-1">
                {slides.map((s: any, idx: number) => (
                  <button
                    key={s.id || idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      currentSlide === idx ? 'w-4 bg-[#ffd485]' : 'w-1.5 bg-white/40 hover:bg-white/70'
                    }`}
                    title={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => {
                  if (typeof slide.action === 'function') {
                    slide.action();
                  } else {
                    onSelectCategory('All Plans');
                  }
                }}
                className="flex items-center gap-1 text-[10px] sm:text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white active:scale-95 px-2.5 py-0.5 sm:py-1 rounded-full transition-all shadow-xs cursor-pointer"
              >
                <span>{slide.btnText || 'Explore'}</span>
                <ArrowRight className="w-3 h-3 text-white" />
              </button>
            </div>
          </div>

          {/* Daily ROI Quick Claim Bar */}
          {stats.unclaimedRoi > 0 && (
            <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-blue-50/80 border border-blue-200/80 rounded-xl py-1.5 px-3 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Gift className="w-3 h-3" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-slate-900">Daily Return Ready</span>
                    <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-1.5 rounded-full border border-blue-200">
                      Instant
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 font-mono">
                    ₹{stats.unclaimedRoi.toFixed(2)} accumulated today
                  </p>
                </div>
              </div>

              <button
                onClick={async () => {
                  onClaimDailyRoi();
                  const withdrawRecord = {
                    id: `wth-daily-${Date.now()}`,
                    loginUid: stats.loginUid || 'GK35648',
                    userName: stats.userName || 'User',
                    mobile: stats.mobile || '9876543210',
                    amount: stats.unclaimedRoi || 248.5,
                    bankDetails: 'skjiyaul@okhdfcbank linked',
                    dateTime: new Date().toLocaleString('en-IN'),
                    status: 'Pending' as const,
                    createdAt: new Date().toISOString(),
                    planName: 'Daily ROI Return Claim',
                  };
                  await saveWithdrawalToFirestore(withdrawRecord);
                  setClaimToast(`Daily Return claim saved to Firebase (Status: Pending)!`);
                  setTimeout(() => setClaimToast(null), 4000);
                }}
                style={{ backgroundColor: '#FF8904' }}
                className="hover:brightness-110 active:scale-95 text-white text-xs font-bold px-3 py-1 rounded-lg shadow-xs transition-all flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-white" />
                <span>Claim</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Executive Quick Stats Grid + VIP Security Card */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-2.5">
          {/* Mobile Accordion Toggle Button for Account Stats */}
          <button
            onClick={() => setIsStatsOpenMobile(!isStatsOpenMobile)}
            className="md:hidden flex items-center justify-between w-full py-1.5 px-3 rounded-xl bg-white border border-slate-200 shadow-2xs text-slate-800 active:scale-[0.99] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shadow-2xs">
                <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <div className="text-left">
                <span className="text-xs font-black text-slate-900 block leading-tight">
                  All Data Account Statistics
                </span>
                <span className="text-[9px] text-slate-500 font-semibold leading-tight">
                  {isStatsOpenMobile ? 'Tap to hide statistics' : 'Tap to show JOINS, EARNED, PAYOUT, ACTIVE'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
              <span>{isStatsOpenMobile ? 'Hide' : 'Show'}</span>
              {isStatsOpenMobile ? (
                <ChevronUp className="w-3.5 h-3.5 stroke-[2.5]" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
              )}
            </div>
          </button>

          {/* 4 Stat Cards */}
          <div className={`grid grid-cols-2 gap-2 ${isStatsOpenMobile ? 'grid' : 'hidden md:grid'}`}>
            {/* Joins Card */}
            <div className="bg-white rounded-xl p-2 sm:p-2.5 border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">JOINS</span>
                <Joins3DIcon />
              </div>
              <span className="text-sm sm:text-base font-black text-slate-900 font-mono">
                {stats.totalJoins.toLocaleString('en-IN')}
              </span>
              <span className="text-[9px] text-emerald-600 font-bold">+18.4% active</span>
            </div>

            {/* Earned Card */}
            <div className="bg-white rounded-xl p-2 sm:p-2.5 border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">EARNED</span>
                <Earned3DIcon />
              </div>
              <span className="text-sm sm:text-base font-black text-slate-900 font-mono">
                ₹{stats.totalEarned.toLocaleString('en-IN')}
              </span>
              <span className="text-[9px] text-emerald-600 font-bold">Guaranteed ROI</span>
            </div>

            {/* Payout Card */}
            <div className="bg-white rounded-xl p-2 sm:p-2.5 border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">PAYOUT</span>
                <Payout3DIcon />
              </div>
              <span className="text-sm sm:text-base font-black text-slate-900 font-mono">
                ₹{stats.totalPayout.toLocaleString('en-IN')}
              </span>
              <span className="text-[9px] text-emerald-600 font-bold">Instant to Bank</span>
            </div>

            {/* Active Plans Count */}
            <div className="bg-white rounded-xl p-2 sm:p-2.5 border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">ACTIVE</span>
                <Active3DIcon />
              </div>
              <span className="text-sm sm:text-base font-black text-slate-900 font-mono">
                {activeInvestments.length} Running
              </span>
              <span className="text-[9px] text-emerald-600 font-bold">24/7 Compounding</span>
            </div>
          </div>

          {/* Full KYC & VIP Protection Box */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 p-2.5 sm:p-3 rounded-xl border border-slate-700/60 text-white shadow-2xs flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                <FileCheck2 className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block leading-tight">Tier 3 VIP Security</span>
                <span className="text-[9px] text-slate-300 leading-tight block">Instant Payouts to Bank Active</span>
              </div>
            </div>
            {onOpenFullKyc && (
              <button
                onClick={onOpenFullKyc}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-extrabold rounded-lg transition-all shadow-xs shrink-0 cursor-pointer"
              >
                Full KYC
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. ACTIVE PLANS & MATURITY DATES SECTION (Claim saves to Firebase withdrawals) */}
      {activeInvestments.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 border border-amber-200 dark:border-slate-800 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  Active Running Plans & Maturity Status
                </h4>
                <p className="text-[10px] text-slate-500">
                  Claiming submits customer bank details to Firebase (Status: Pending)
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-full">
              {activeInvestments.length} Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {activeInvestments.map((inv) => {
              const maturityStr = getMaturityDateStr(inv.startDate, inv.totalDays || 30);
              const isClaimed = claimedPlanIds.includes(inv.id);

              return (
                <div
                  key={inv.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {inv.customerPhoto ? (
                        <img
                          src={inv.customerPhoto}
                          alt={inv.customerName || 'Customer'}
                          className="w-8 h-8 rounded-full object-cover border border-amber-500 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center shrink-0">
                          {inv.customerName?.[0] || 'C'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate block">
                          {inv.planName}
                        </span>
                        {inv.customerName && (
                          <span className="text-[10.5px] text-slate-500 block truncate">
                            Customer: {inv.customerName} ({inv.customerMobile || 'Linked'})
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 shrink-0">
                      ₹{inv.investedAmount}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 dark:border-slate-700 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Maturity Date:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                        {maturityStr}
                      </span>
                    </div>

                    <button
                      onClick={() => handleClaimActivePlanToFirebase(inv)}
                      disabled={isClaimed}
                      style={{ backgroundColor: isClaimed ? '#10B981' : '#008000' }}
                      className="px-3 py-1 rounded-lg text-white font-bold text-xs shadow-2xs hover:brightness-110 active:scale-95 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-90"
                    >
                      {isClaimed ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          <span>Pending in Firebase</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3.5 h-3.5 text-white" />
                          <span>Claim & Withdraw</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. CATEGORIES Section Header & COMPACT SMALL-SIZE BUTTONS */}
      <div className="pt-1">
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold text-slate-500 tracking-wider uppercase">
              CATEGORIES
            </span>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              {filteredPlans.length} Plans
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Plan History Button on Left of Grid/List icons */}
            <button
              onClick={() => {
                if (onOpenPurchaseHistory) {
                  onOpenPurchaseHistory();
                }
              }}
              style={{ backgroundColor: '#C27AFF' }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:brightness-110 active:scale-95 text-white font-extrabold text-[11px] sm:text-xs shadow-xs transition-all cursor-pointer shrink-0"
              title="Plan History"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-white stroke-[2.5]" />
              <span>Plan History</span>
            </button>

            {/* Grid View vs List View Toggle Buttons */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-3 h-3" />
                <span className="hidden sm:inline">Grid</span>
              </button>

              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="List View"
              >
                <List className="w-3 h-3" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable category pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                style={isSelected ? { backgroundColor: '#1A7595', borderColor: '#1A7595' } : {}}
                className={`px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all shadow-2xs cursor-pointer ${
                  isSelected
                    ? 'text-white border shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Available Plans */}
      <div className="space-y-2.5 pt-0.5">
        {filteredPlans.length === 0 ? (
          <div className="bg-gradient-to-b from-[#fffefc] via-[#fbf5e7] to-[#f4e4c2] rounded-2xl p-6 text-center border border-[#dfbe7e]">
            <Layers className="w-9 h-9 text-[#caa050] mx-auto mb-2" />
            <h5 className="text-xs sm:text-sm font-bold text-[#46280b]">No Plans Available</h5>
            <p className="text-[11px] text-[#8a5b28] mt-0.5">
              Plans added by the admin will appear here.
            </p>
            {(searchQuery || selectedCategory !== 'All Plans') && (
              <button
                onClick={() => {
                  onSearchChange?.('');
                  onSelectCategory('All Plans');
                }}
                className="mt-2 text-xs text-[#8a5416] hover:text-[#46280b] font-bold underline cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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
          <div className="space-y-2">
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
