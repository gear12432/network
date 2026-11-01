'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Sparkles,
  Gift,
  Clock,
  ArrowUpRight,
  Activity,
  Calendar,
  Layers,
  CheckCircle2,
  Wallet,
  Users,
  Zap,
  DollarSign,
  ChevronRight,
} from 'lucide-react';
import { UserStats, ActiveInvestment } from '@/types/investment';
import { motion } from 'motion/react';

interface EarningsScreenProps {
  stats: UserStats;
  activeInvestments: ActiveInvestment[];
  onClaimDailyRoi: () => void;
  onOpenPlans: () => void;
}

// 1. Total Earnings Chart Data Series
const TOTAL_EARNINGS_SERIES = [
  { day: '1 Apr', val: 3200, percent: 55 },
  { day: '2 Apr', val: 3450, percent: 60 },
  { day: '3 Apr', val: 3900, percent: 68 },
  { day: '4 Apr', val: 4850, percent: 85 },
  { day: '5 Apr', val: 5100, percent: 72 },
  { day: '6 Apr', val: 5600, percent: 78 },
  { day: '7 Apr', val: 6100, percent: 82 },
  { day: '8 Apr', val: 6400, percent: 75 },
  { day: '9 Apr', val: 7200, percent: 90 },
  { day: '10 Apr', val: 7800, percent: 96 },
  { day: '11 Apr', val: 8100, percent: 80 },
  { day: '12 Apr', val: 8500, percent: 88 },
];

// 2. Withdrawal Payouts Chart Data Series
const WITHDRAWAL_SERIES = [
  { day: '1 Apr', val: 1200, percent: 40 },
  { day: '2 Apr', val: 1500, percent: 50 },
  { day: '3 Apr', val: 2100, percent: 65 },
  { day: '4 Apr', val: 3500, percent: 92 },
  { day: '5 Apr', val: 2800, percent: 70 },
  { day: '6 Apr', val: 3200, percent: 78 },
  { day: '7 Apr', val: 4000, percent: 85 },
  { day: '8 Apr', val: 3800, percent: 72 },
  { day: '9 Apr', val: 4500, percent: 88 },
  { day: '10 Apr', val: 5200, percent: 95 },
  { day: '11 Apr', val: 4800, percent: 82 },
  { day: '12 Apr', val: 6000, percent: 90 },
];

// 3. Ad & Daily Yield Chart Data Series
const YIELD_SERIES = [
  { day: '1 Apr', val: 120, percent: 45 },
  { day: '2 Apr', val: 140, percent: 52 },
  { day: '3 Apr', val: 165, percent: 62 },
  { day: '4 Apr', val: 248.5, percent: 90 },
  { day: '5 Apr', val: 190, percent: 68 },
  { day: '6 Apr', val: 210, percent: 75 },
  { day: '7 Apr', val: 235, percent: 82 },
  { day: '8 Apr', val: 220, percent: 74 },
  { day: '9 Apr', val: 260, percent: 88 },
  { day: '10 Apr', val: 290, percent: 95 },
  { day: '11 Apr', val: 275, percent: 84 },
  { day: '12 Apr', val: 310, percent: 92 },
];

// 4. Active Customers Growth Chart Data Series
const CUSTOMER_SERIES = [
  { day: '1 Apr', val: 4, percent: 35 },
  { day: '2 Apr', val: 6, percent: 48 },
  { day: '3 Apr', val: 8, percent: 60 },
  { day: '4 Apr', val: 12, percent: 88 },
  { day: '5 Apr', val: 10, percent: 70 },
  { day: '6 Apr', val: 14, percent: 80 },
  { day: '7 Apr', val: 15, percent: 84 },
  { day: '8 Apr', val: 13, percent: 72 },
  { day: '9 Apr', val: 17, percent: 92 },
  { day: '10 Apr', val: 19, percent: 98 },
  { day: '11 Apr', val: 16, percent: 82 },
  { day: '12 Apr', val: 22, percent: 94 },
];

export default function EarningsScreen({
  stats,
  activeInvestments,
  onClaimDailyRoi,
  onOpenPlans,
}: EarningsScreenProps) {
  // Chart Selected Day States
  const [selectedTotalEarningsDay, setSelectedTotalEarningsDay] = useState<string>('4 Apr');
  const [selectedWithdrawalDay, setSelectedWithdrawalDay] = useState<string>('4 Apr');
  const [selectedYieldDay, setSelectedYieldDay] = useState<string>('4 Apr');
  const [selectedCustomerDay, setSelectedCustomerDay] = useState<string>('4 Apr');

  // Time Filter States per Chart
  const [earningsTab, setEarningsTab] = useState<'Weekly' | 'Monthly'>('Weekly');
  const [withdrawalTab, setWithdrawalTab] = useState<'Weekly' | 'Monthly'>('Weekly');
  const [yieldTab, setYieldTab] = useState<'Daily' | 'Ad Bonus'>('Daily');
  const [customerTab, setCustomerTab] = useState<'Active' | 'Growth'>('Active');

  return (
    <div className="space-y-4 pb-20 sm:pb-8 bg-slate-50 min-h-screen">
      {/* =========================================================================
          1. TOP UNCLAIMED ROI BALANCE CARD (CLEANED UP WITH SMALL COMPACT RIGHT CLAIM BUTTON)
          ========================================================================= */}
      <div className="bg-gradient-to-r from-[#3b200b] via-[#593315] to-[#7c481d] text-white rounded-3xl p-4 sm:p-5 shadow-md relative overflow-hidden border-2 border-[#dfbe7e]">
        {/* Ornate Gold Filigree Corner Accents */}
        <div className="absolute top-1.5 left-2 text-[#e5ab48] text-xs select-none">✦</div>
        <div className="absolute top-1.5 right-2 text-[#e5ab48] text-xs select-none">✦</div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-serif font-bold text-[#fed788] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#ffd786]" />
              <span>Daily ROI Yield Accumulator</span>
            </span>
            <span className="text-[10px] bg-[#fff0cc]/20 text-[#ffe2a2] border border-[#d6a54d]/50 font-bold px-2 py-0.5 rounded-full">
              Auto-Compounding
            </span>
          </div>

          {/* Balance Row with Compact "Claim" Button on the Right */}
          <div className="my-2 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs text-[#fed788]/80 block mb-0.5">Unclaimed Daily Earnings</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-serif font-black text-white font-mono tracking-tight drop-shadow-xs">
                  ₹{stats.unclaimedRoi.toFixed(2)}
                </span>
                <span className="text-xs text-[#ffd786] font-bold">+₹158.62/day</span>
              </div>
            </div>

            {/* Small Compact "Claim" Button on the Right Side of the Balance Box */}
            <button
              onClick={onClaimDailyRoi}
              disabled={stats.unclaimedRoi <= 0}
              className={`px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer shrink-0 ${
                stats.unclaimedRoi > 0
                  ? 'bg-gradient-to-r from-[#ffd786] via-[#e5ab48] to-[#be8832] text-[#3d2008] hover:brightness-110 shadow-amber-500/30'
                  : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/10'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Claim</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. CHART 1: TOTAL EARNINGS GRAPH CHART (AMBER / GOLD THEME)
          ========================================================================= */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="font-serif font-black text-slate-900 text-sm sm:text-base">
                Total Earnings Analytics
              </h4>
              <p className="text-[10.5px] text-slate-500 font-medium">
                Overall income & return growth performance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(['Weekly', 'Monthly'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setEarningsTab(tab)}
                className={`px-2.5 py-1 rounded-lg transition-all text-[11px] cursor-pointer ${
                  earningsTab === tab
                    ? 'bg-amber-500 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Metric Banner */}
        <div className="flex items-baseline justify-between pt-1">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Cumulative Earnings
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-slate-900">
              ₹{stats.totalEarned.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+24.8% Growth</span>
          </span>
        </div>

        {/* Colorful Bar Graph */}
        <div className="h-36 flex items-end justify-between gap-1.5 pt-4 pb-1 border-b border-slate-100">
          {TOTAL_EARNINGS_SERIES.map((item) => {
            const isSelected = selectedTotalEarningsDay === item.day;
            return (
              <div
                key={item.day}
                onClick={() => setSelectedTotalEarningsDay(item.day)}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
              >
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${item.percent}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={`w-full max-w-[16px] rounded-t-md transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-t from-amber-600 to-amber-400 scale-105 shadow-md ring-2 ring-amber-300'
                      : 'bg-gradient-to-t from-amber-400/60 to-amber-300/80 group-hover:from-amber-500 group-hover:to-amber-400'
                  }`}
                />
                <span className="text-[8.5px] font-bold text-slate-500 mt-2 truncate text-center">
                  {item.day.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Selected Day Info Pill */}
        <div className="flex items-center justify-between text-xs text-slate-600 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60">
          <span className="font-medium">
            Selected Day: <strong className="text-amber-900">{selectedTotalEarningsDay}</strong>
          </span>
          <span className="font-mono font-black text-amber-800">
            ₹{(TOTAL_EARNINGS_SERIES.find((x) => x.day === selectedTotalEarningsDay)?.val || 4850).toLocaleString('en-IN')} Earned
          </span>
        </div>
      </div>

      {/* =========================================================================
          3. CHART 2: WITHDRAWAL PAYOUTS GRAPH CHART (EMERALD GREEN THEME)
          ========================================================================= */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Wallet className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="font-serif font-black text-slate-900 text-sm sm:text-base">
                Withdrawal Payouts Timeline
              </h4>
              <p className="text-[10.5px] text-slate-500 font-medium">
                Instant UPI & Bank withdrawal execution history
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(['Weekly', 'Monthly'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setWithdrawalTab(tab)}
                className={`px-2.5 py-1 rounded-lg transition-all text-[11px] cursor-pointer ${
                  withdrawalTab === tab
                    ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Metric Banner */}
        <div className="flex items-baseline justify-between pt-1">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Total Cleared Payouts
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-emerald-800">
              ₹{stats.totalPayout.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% Cleared</span>
          </span>
        </div>

        {/* Colorful Emerald Bar Graph */}
        <div className="h-36 flex items-end justify-between gap-1.5 pt-4 pb-1 border-b border-slate-100">
          {WITHDRAWAL_SERIES.map((item) => {
            const isSelected = selectedWithdrawalDay === item.day;
            return (
              <div
                key={item.day}
                onClick={() => setSelectedWithdrawalDay(item.day)}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
              >
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${item.percent}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                  className={`w-full max-w-[16px] rounded-t-md transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-t from-emerald-700 to-emerald-500 scale-105 shadow-md ring-2 ring-emerald-300'
                      : 'bg-gradient-to-t from-emerald-500/60 to-emerald-400/80 group-hover:from-emerald-600 group-hover:to-emerald-500'
                  }`}
                />
                <span className="text-[8.5px] font-bold text-slate-500 mt-2 truncate text-center">
                  {item.day.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Selected Day Info Pill */}
        <div className="flex items-center justify-between text-xs text-slate-600 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200/60">
          <span className="font-medium">
            Selected Day: <strong className="text-emerald-900">{selectedWithdrawalDay}</strong>
          </span>
          <span className="font-mono font-black text-emerald-800">
            ₹{(WITHDRAWAL_SERIES.find((x) => x.day === selectedWithdrawalDay)?.val || 3500).toLocaleString('en-IN')} Withdrawn
          </span>
        </div>
      </div>

      {/* =========================================================================
          4. CHART 3: AD & DAILY YIELD EARNINGS GRAPH CHART (PURPLE / INDIGO THEME)
          ========================================================================= */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Zap className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="font-serif font-black text-slate-900 text-sm sm:text-base">
                Ad & Daily Yield Rewards
              </h4>
              <p className="text-[10.5px] text-slate-500 font-medium">
                Daily ROI credits & promotional ad bonuses
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(['Daily', 'Ad Bonus'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setYieldTab(tab)}
                className={`px-2.5 py-1 rounded-lg transition-all text-[11px] cursor-pointer ${
                  yieldTab === tab
                    ? 'bg-purple-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Metric Banner */}
        <div className="flex items-baseline justify-between pt-1">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Average Daily Yield Rate
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-purple-900">
              +₹{(stats.unclaimedRoi || 248.5).toFixed(2)}/day
            </span>
          </div>
          <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>High Yield Active</span>
          </span>
        </div>

        {/* Colorful Purple Bar Graph */}
        <div className="h-36 flex items-end justify-between gap-1.5 pt-4 pb-1 border-b border-slate-100">
          {YIELD_SERIES.map((item) => {
            const isSelected = selectedYieldDay === item.day;
            return (
              <div
                key={item.day}
                onClick={() => setSelectedYieldDay(item.day)}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
              >
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${item.percent}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
                  className={`w-full max-w-[16px] rounded-t-md transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-t from-purple-700 to-indigo-500 scale-105 shadow-md ring-2 ring-purple-300'
                      : 'bg-gradient-to-t from-purple-500/60 to-indigo-400/80 group-hover:from-purple-600 group-hover:to-indigo-500'
                  }`}
                />
                <span className="text-[8.5px] font-bold text-slate-500 mt-2 truncate text-center">
                  {item.day.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Selected Day Info Pill */}
        <div className="flex items-center justify-between text-xs text-slate-600 bg-purple-50/70 p-2.5 rounded-xl border border-purple-200/60">
          <span className="font-medium">
            Selected Day: <strong className="text-purple-900">{selectedYieldDay}</strong>
          </span>
          <span className="font-mono font-black text-purple-800">
            +₹{(YIELD_SERIES.find((x) => x.day === selectedYieldDay)?.val || 248.5).toFixed(2)} ROI Yield
          </span>
        </div>
      </div>

      {/* =========================================================================
          5. CHART 4: TOTAL ACTIVE CUSTOMERS GRAPH CHART (BLUE / CYAN THEME)
          ========================================================================= */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
              <Users className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="font-serif font-black text-slate-900 text-sm sm:text-base">
                Customer Network Growth
              </h4>
              <p className="text-[10.5px] text-slate-500 font-medium">
                Active investor onboarding & plan subscription trends
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(['Active', 'Growth'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setCustomerTab(tab)}
                className={`px-2.5 py-1 rounded-lg transition-all text-[11px] cursor-pointer ${
                  customerTab === tab
                    ? 'bg-cyan-600 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Metric Banner */}
        <div className="flex items-baseline justify-between pt-1">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Active Network Investors
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-cyan-900">
              {activeInvestments.length + 18} Active Customers
            </span>
          </div>
          <span className="bg-cyan-100 text-cyan-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>+32% Active</span>
          </span>
        </div>

        {/* Colorful Cyan/Blue Bar Graph */}
        <div className="h-36 flex items-end justify-between gap-1.5 pt-4 pb-1 border-b border-slate-100">
          {CUSTOMER_SERIES.map((item) => {
            const isSelected = selectedCustomerDay === item.day;
            return (
              <div
                key={item.day}
                onClick={() => setSelectedCustomerDay(item.day)}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
              >
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${item.percent}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
                  className={`w-full max-w-[16px] rounded-t-md transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-t from-cyan-600 to-blue-500 scale-105 shadow-md ring-2 ring-cyan-300'
                      : 'bg-gradient-to-t from-cyan-400/60 to-blue-400/80 group-hover:from-cyan-500 group-hover:to-blue-500'
                  }`}
                />
                <span className="text-[8.5px] font-bold text-slate-500 mt-2 truncate text-center">
                  {item.day.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Selected Day Info Pill */}
        <div className="flex items-center justify-between text-xs text-slate-600 bg-cyan-50/70 p-2.5 rounded-xl border border-cyan-200/60">
          <span className="font-medium">
            Selected Day: <strong className="text-cyan-900">{selectedCustomerDay}</strong>
          </span>
          <span className="font-mono font-black text-cyan-800">
            {CUSTOMER_SERIES.find((x) => x.day === selectedCustomerDay)?.val || 12} Customers Active
          </span>
        </div>
      </div>

      {/* =========================================================================
          6. ACTIVE RUNNING PLANS SECTION (CLEAN WHITE CARD STYLE)
          ========================================================================= */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between px-1">
          <h4 className="font-serif font-black text-slate-900 text-sm flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-amber-600" />
            <span>Active Subscribed VIP Plans ({activeInvestments.length})</span>
          </h4>
          <button
            onClick={onOpenPlans}
            className="text-xs text-amber-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>+ Subscribe Plan</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {activeInvestments.length > 0 ? (
          activeInvestments.map((inv) => {
            const progressPercent = Math.min(100, Math.round((inv.daysCompleted / inv.totalDays) * 100));

            return (
              <div
                key={inv.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3 hover:border-amber-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-serif font-black text-slate-900 text-xs sm:text-sm">
                      {inv.planName}
                    </h5>
                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                      <span className="text-[11px] text-slate-600 font-medium">
                        Day {inv.daysCompleted} of {inv.totalDays} completed
                      </span>
                      {inv.customerName && (
                        <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          {inv.customerName} {inv.customerMobile ? `(+91 ${inv.customerMobile})` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-700 block font-mono">
                      +₹{inv.dailyReturn.toFixed(2)}/day
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Invested: ₹{inv.investedAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium mb-1">
                    <span>Maturity Progress</span>
                    <span className="font-mono font-bold text-slate-900">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="bg-gradient-to-r from-amber-500 to-amber-600 h-full rounded-full"
                    />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-6 text-center bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <p className="text-xs font-bold text-slate-700">
              No active subscribed VIP plans currently running.
            </p>
            <p className="text-[11px] text-slate-500">
              Subscribe to a plan to start receiving automated 24/7 daily ROI returns!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
