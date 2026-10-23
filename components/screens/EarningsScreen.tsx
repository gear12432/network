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
} from 'lucide-react';
import { UserStats, ActiveInvestment } from '@/types/investment';
import { ACTIVITY_CHART_DATA, FINANCE_SUMMARY_DATA, BROWSER_ACTIVITY_DATA } from '@/data/initialData';

interface EarningsScreenProps {
  stats: UserStats;
  activeInvestments: ActiveInvestment[];
  onClaimDailyRoi: () => void;
  onOpenPlans: () => void;
}

export default function EarningsScreen({
  stats,
  activeInvestments,
  onClaimDailyRoi,
  onOpenPlans,
}: EarningsScreenProps) {
  const [chartTab, setChartTab] = useState<'overview' | 'sales'>('overview');
  const [selectedDay, setSelectedDay] = useState<string>('4 April');

  return (
    <div className="space-y-4 pb-20 sm:pb-8">
      {/* 1. Unclaimed ROI Main Card */}
      <div className="bg-gradient-to-br from-[#3b200b] via-[#593315] to-[#804c1f] text-white rounded-3xl p-5 shadow-sm relative overflow-hidden border-2 border-[#dfbe7e]">
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

          <div className="my-2">
            <span className="text-xs text-[#fed788]/80 block mb-0.5">Unclaimed Daily Earnings</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-serif font-black text-white font-mono tracking-tight drop-shadow-xs">
                ₹{stats.unclaimedRoi.toFixed(2)}
              </span>
              <span className="text-xs text-[#ffd786] font-bold">+₹158.62/day</span>
            </div>
          </div>

          <p className="text-xs text-[#fdebd0]/90 mb-4">
            Daily returns are generated 24/7 based on your active designer VIP investment plans.
          </p>

          <button
            onClick={onClaimDailyRoi}
            disabled={stats.unclaimedRoi <= 0}
            className={`w-full py-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
              stats.unclaimedRoi > 0
                ? 'bg-gradient-to-r from-[#d9a54c] via-[#e5ab48] to-[#be8832] hover:brightness-105 active:scale-98 text-[#3d2008]'
                : 'bg-black/30 text-white/50 cursor-not-allowed border border-white/10'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>
              {stats.unclaimedRoi > 0
                ? `Claim ₹${stats.unclaimedRoi.toFixed(2)} to Wallet`
                : 'Daily Earnings Claimed'}
            </span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Activity Chart with Palace Gold Palette */}
      <div className="bg-gradient-to-b from-[#fffefc] via-[#fbf5e7] to-[#f4e4c2] rounded-3xl p-4 border border-[#dfbe7e] shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h4 className="font-serif font-black text-[#46280b] text-sm">Activity Analytics</h4>
            <p className="text-[11px] text-[#86592a]">12-Day Investment returns timeline</p>
          </div>

          {/* Overview / Sales Tabs */}
          <div className="flex items-center gap-1.5 bg-[#f0dfc8] p-1 rounded-xl text-xs font-semibold border border-[#dec5a2]">
            <button
              onClick={() => setChartTab('overview')}
              className={`px-2 py-1 rounded-lg transition-all ${
                chartTab === 'overview' ? 'bg-[#4e2e0f] text-[#ffebbe] shadow-2xs font-bold' : 'text-[#5a3818]'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setChartTab('sales')}
              className={`px-2 py-1 rounded-lg transition-all ${
                chartTab === 'sales' ? 'bg-[#4e2e0f] text-[#ffebbe] shadow-2xs font-bold' : 'text-[#5a3818]'
              }`}
            >
              Sales
            </button>
          </div>
        </div>

        {/* Vertical Chart Bars */}
        <div className="h-40 flex items-end justify-between gap-1 pt-3 pb-1 border-b border-[#ebd2aa]">
          {ACTIVITY_CHART_DATA.map((item) => {
            const val = chartTab === 'overview' ? item.overview : item.sales;
            const isSelected = selectedDay === item.day;

            return (
              <div
                key={item.day}
                onClick={() => setSelectedDay(item.day)}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
              >
                <div
                  className={`w-full max-w-[14px] rounded-t-sm transition-all duration-300 ${
                    isSelected
                      ? 'bg-[#b87d23] scale-105 shadow-xs ring-2 ring-[#ffd786]'
                      : 'bg-[#d9a54c]/75 group-hover:bg-[#b87d23]'
                  }`}
                  style={{ height: `${val}%` }}
                />
                <span className="text-[8px] font-bold text-[#7d511f] mt-2 truncate text-center">
                  {item.day.split(' ')[0]}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-[#71471b] px-1">
          <span>
            Selected Date: <strong className="text-[#46280b]">{selectedDay}</strong>
          </span>
          <span className="text-[#965c19] font-black font-mono">
            +{ACTIVITY_CHART_DATA.find((x) => x.day === selectedDay)?.[chartTab]}% Return
          </span>
        </div>
      </div>

      {/* 3. Finance Summary Metrics */}
      <div className="bg-gradient-to-b from-[#fffefc] via-[#fbf5e7] to-[#f4e4c2] rounded-3xl p-4 border border-[#dfbe7e] shadow-2xs">
        <h4 className="font-serif font-black text-[#46280b] text-sm mb-3">Finance Summary</h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-white/85 p-3 rounded-2xl border border-[#ebd2aa]">
            <span className="text-[#86592a] block mb-0.5 text-[11px] font-bold">Total Yield Payouts</span>
            <span className="font-black text-base text-[#46280b] font-mono">
              ₹{stats.totalPayout.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="bg-white/85 p-3 rounded-2xl border border-[#ebd2aa]">
            <span className="text-[#86592a] block mb-0.5 text-[11px] font-bold">Satisfaction Rate</span>
            <span className="font-black text-base text-[#965c19]">68% Guaranteed</span>
          </div>

          <div className="bg-white/85 p-3 rounded-2xl border border-[#ebd2aa]">
            <span className="text-[#86592a] block mb-0.5 text-[11px] font-bold">Next Audit Cycle</span>
            <span className="font-black text-[#46280b]">April 26, 2026</span>
          </div>

          <div className="bg-white/85 p-3 rounded-2xl border border-[#ebd2aa]">
            <span className="text-[#86592a] block mb-0.5 text-[11px] font-bold">Avg Daily Product Price</span>
            <span className="font-black text-[#46280b]">{FINANCE_SUMMARY_DATA.averageProductPrice}</span>
          </div>
        </div>
      </div>

      {/* 4. Active Running Plans */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h4 className="font-serif font-black text-[#46280b] text-sm">
            Active Running Plans ({activeInvestments.length})
          </h4>
          <button
            onClick={onOpenPlans}
            className="text-xs text-[#965c19] font-bold hover:underline"
          >
            + New Plan
          </button>
        </div>

        {activeInvestments.map((inv) => {
          const progressPercent = Math.round((inv.daysCompleted / inv.totalDays) * 100);

          return (
            <div
              key={inv.id}
              className="bg-gradient-to-b from-[#fffefc] via-[#fffbf3] to-[#fbf2dd] rounded-2xl p-4 border border-[#dfc38d] shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-serif font-black text-[#46280b] text-xs sm:text-sm">{inv.planName}</h5>
                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    <span className="text-[11px] text-[#7d511f]">
                      Day {inv.daysCompleted} of {inv.totalDays} completed
                    </span>
                    {inv.customerName && (
                      <span className="text-[10px] font-semibold text-[#8c5929] bg-[#faecd4] px-1.5 py-0.5 rounded-md border border-[#e5cfab] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#be8832]" />
                        {inv.customerName} {inv.customerMobile ? `(+91 ${inv.customerMobile})` : ''}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-[#965c19] block font-mono">
                    +₹{inv.dailyReturn.toFixed(2)}/day
                  </span>
                  <span className="text-[10px] text-[#86592a]">
                    Invested: ₹{inv.investedAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-[10px] text-[#86592a] font-medium mb-1">
                  <span>Maturity Progress</span>
                  <span className="font-black text-[#46280b]">{progressPercent}%</span>
                </div>
                <div className="w-full bg-[#eedcc2] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#d9a54c] to-[#be8832] h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
