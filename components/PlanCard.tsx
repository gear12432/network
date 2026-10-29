'use client';

import React from 'react';
import { Zap, Shield, Award, Crown, Gem, ArrowRight } from 'lucide-react';
import { InvestmentPlan } from '@/types/investment';

interface PlanCardProps {
  plan: InvestmentPlan;
  onJoin: (plan: InvestmentPlan) => void;
  onViewDetails?: (plan: InvestmentPlan) => void;
  viewMode?: 'grid' | 'list';
}

function Plan3DIcon({ plan }: { plan: InvestmentPlan }) {
  if (plan.iconUrl) {
    return (
      <img
        src={plan.iconUrl}
        alt={plan.name}
        className="w-11 h-11 rounded-2xl object-cover shadow-md ring-2 ring-amber-400/80 group-hover:scale-105 transition-transform"
        referrerPolicy="no-referrer"
      />
    );
  }

  const nameLower = (plan.name || '').toLowerCase();
  const catLower = (plan.category || '').toLowerCase();

  // Krantikari / क्रांतिकारी Plan
  if (nameLower.includes('krantikari') || nameLower.includes('क्रांतिकारी') || catLower.includes('krantikari')) {
    return (
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#991b1b] via-[#dc2626] to-[#f97316] flex items-center justify-center text-white shrink-0 shadow-md ring-2 ring-amber-400/90 group-hover:scale-105 transition-transform relative overflow-hidden">
        <span className="text-2xl filter drop-shadow-md">🚩</span>
      </div>
    );
  }

  // Starter
  if (nameLower.includes('starter') || catLower === 'starter') {
    return (
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#78350f] via-[#b45309] to-[#f59e0b] flex items-center justify-center text-white shrink-0 shadow-md ring-2 ring-amber-400/80 group-hover:scale-105 transition-transform">
        <span className="text-2xl filter drop-shadow-md">🚀</span>
      </div>
    );
  }

  // Basic
  if (nameLower.includes('basic') || catLower === 'basic') {
    return (
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#1e3a8a] via-[#1d4ed8] to-[#06b6d4] flex items-center justify-center text-white shrink-0 shadow-md ring-2 ring-cyan-400/80 group-hover:scale-105 transition-transform">
        <span className="text-2xl filter drop-shadow-md">⚡</span>
      </div>
    );
  }

  // Silver
  if (nameLower.includes('silver') || catLower === 'silver') {
    return (
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#334155] via-[#64748b] to-[#cbd5e1] flex items-center justify-center text-white shrink-0 shadow-md ring-2 ring-slate-200/90 group-hover:scale-105 transition-transform">
        <span className="text-2xl filter drop-shadow-md">🥈</span>
      </div>
    );
  }

  // Gold
  if (nameLower.includes('gold') || catLower === 'gold') {
    return (
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#78350f] via-[#d97706] to-[#fef08a] flex items-center justify-center text-white shrink-0 shadow-md ring-2 ring-amber-300/90 group-hover:scale-105 transition-transform">
        <span className="text-2xl filter drop-shadow-md">🥇</span>
      </div>
    );
  }

  // Platinum
  if (nameLower.includes('platinum') || catLower === 'platinum') {
    return (
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#1e293b] via-[#475569] to-[#e2e8f0] flex items-center justify-center text-white shrink-0 shadow-md ring-2 ring-sky-300/80 group-hover:scale-105 transition-transform">
        <span className="text-2xl filter drop-shadow-md">💠</span>
      </div>
    );
  }

  // Diamond
  if (nameLower.includes('diamond') || catLower === 'diamond') {
    return (
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0c4a6e] via-[#0284c7] to-[#7dd3fc] flex items-center justify-center text-white shrink-0 shadow-md ring-2 ring-cyan-300/90 group-hover:scale-105 transition-transform">
        <span className="text-2xl filter drop-shadow-md">💎</span>
      </div>
    );
  }

  // Premium
  if (nameLower.includes('premium') || catLower === 'premium') {
    return (
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#09090b] via-[#27272a] to-[#d97706] flex items-center justify-center text-white shrink-0 shadow-md ring-2 ring-amber-400/90 group-hover:scale-105 transition-transform">
        <span className="text-2xl filter drop-shadow-md">👑</span>
      </div>
    );
  }

  // Growth
  if (nameLower.includes('growth') || catLower === 'growth') {
    return (
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#064e3b] via-[#059669] to-[#34d399] flex items-center justify-center text-white shrink-0 shadow-md ring-2 ring-emerald-400/80 group-hover:scale-105 transition-transform">
        <span className="text-2xl filter drop-shadow-md">📈</span>
      </div>
    );
  }

  // Long-Term
  if (nameLower.includes('long-term') || nameLower.includes('longterm') || catLower === 'long-term') {
    return (
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#4c1d95] via-[#7e22ce] to-[#e879f9] flex items-center justify-center text-white shrink-0 shadow-md ring-2 ring-fuchsia-400/80 group-hover:scale-105 transition-transform">
        <span className="text-2xl filter drop-shadow-md">♾️</span>
      </div>
    );
  }

  // Elite
  if (nameLower.includes('elite') || catLower === 'elite') {
    return (
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#020617] via-[#1e293b] to-[#facc15] flex items-center justify-center text-white shrink-0 shadow-md ring-2 ring-yellow-400/90 group-hover:scale-105 transition-transform">
        <span className="text-2xl filter drop-shadow-md">✨</span>
      </div>
    );
  }

  // Default fallback
  return (
    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#b45309] to-[#f59e0b] flex items-center justify-center text-white shrink-0 shadow-md ring-2 ring-amber-400/80 group-hover:scale-105 transition-transform">
      <span className="text-2xl filter drop-shadow-md">⚡</span>
    </div>
  );
}

export default function PlanCard({ plan, onJoin, onViewDetails, viewMode = 'grid' }: PlanCardProps) {
  // 1. Grid View (Modern, Professional Executive Investment Card)
  if (viewMode === 'grid') {
    return (
      <div
        onClick={() => onViewDetails?.(plan)}
        className="bg-gradient-to-b from-[#fffefc] via-[#fffbf3] to-[#fbf2dd] rounded-2xl p-4 sm:p-5 border border-[#dfc38d] shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between gap-4 cursor-pointer group hover:border-[#caa050] hover:-translate-y-1 relative"
      >
        {/* Top Header: Icon & Category Badges */}
        <div className="flex items-start justify-between gap-2">
          <Plan3DIcon plan={plan} />

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {plan.featured && (
              <span className="text-[10px] bg-gradient-to-r from-[#d9a54c] to-[#be8832] text-[#2b1706] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                HOT VIP
              </span>
            )}
            <span className="text-[10px] bg-[#faecd4] text-[#965c19] border border-[#e8d2aa] font-bold px-2 py-0.5 rounded-full">
              {plan.category}
            </span>
          </div>
        </div>

        {/* Plan Title & High ROI Highlight */}
        <div>
          <h4 className="font-serif text-base font-black text-[#46280b] truncate tracking-tight group-hover:text-[#965c19] transition-colors mb-1">
            {plan.name}
          </h4>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-[#a16207] font-mono">
              {plan.roiPercentage}%
            </span>
            <span className="text-[11px] font-semibold text-[#8a5b28]">Total Net Return</span>
          </div>
        </div>

        {/* 3 Metrics Mini Grid */}
        <div className="grid grid-cols-3 gap-1.5 bg-[#f5e9d3]/70 p-2.5 rounded-xl border border-[#e4cc9f]/70 text-center">
          <div>
            <span className="text-[9px] text-[#8a5b28] uppercase font-bold block">Days</span>
            <span className="text-xs font-black text-[#46280b]">{plan.durationDays}d</span>
          </div>
          <div className="border-x border-[#dfbe7e]/60">
            <span className="text-[9px] text-[#8a5b28] uppercase font-bold block">Daily</span>
            <span className="text-xs font-black text-emerald-800">+₹{plan.dailyEarnings}</span>
          </div>
          <div>
            <span className="text-[9px] text-[#8a5b28] uppercase font-bold block">Total</span>
            <span className="text-xs font-black text-[#46280b]">₹{plan.totalReturn.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Bottom: Amount & Join Button */}
        <div className="flex items-center justify-between pt-2 border-t border-[#dfc38d]/60">
          <div>
            <span className="text-[9px] text-[#8a5b28] font-bold block uppercase tracking-wider">
              Invest Amount
            </span>
            <span className="text-base font-black text-[#46280b] font-mono">
              ₹{plan.amount.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onJoin(plan);
            }}
            className="bg-[#4e2e0f] hover:bg-[#3b220a] active:scale-95 text-[#ffebbe] border border-[#d6a54d]/60 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer group-hover:shadow-md"
          >
            <span>Join</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#ffd786]" />
          </button>
        </div>
      </div>
    );
  }

  // 2. List View (Compact Horizontal Row)
  return (
    <div
      onClick={() => onViewDetails?.(plan)}
      className="bg-gradient-to-b from-[#fffefc] via-[#fffbf3] to-[#fbf2dd] rounded-2xl p-4 border border-[#dfc38d] shadow-2xs hover:shadow-md transition-all flex items-center justify-between gap-3 cursor-pointer group hover:border-[#caa050]"
    >
      {/* Left Icon + Title + Meta */}
      <div className="flex items-center gap-3 min-w-0">
        <Plan3DIcon plan={plan} />

        <div className="truncate">
          <div className="flex items-center gap-1.5">
            <h4 className="font-serif text-sm font-black text-[#46280b] truncate tracking-tight group-hover:text-[#965c19] transition-colors">
              {plan.name}
            </h4>
            {plan.featured && (
              <span className="text-[9px] bg-[#faecd4] text-[#965c19] border border-[#e8d2aa] font-bold px-1.5 py-0.2 rounded-full uppercase shrink-0">
                Hot
              </span>
            )}
          </div>
          <p className="text-xs text-[#7d511f] font-medium">
            <span>{plan.durationDays} Days</span>
            <span className="mx-1.5 text-[#dfbe7e]">•</span>
            <span className="text-[#a16207] font-black">{plan.roiPercentage}% ROI</span>
            <span className="mx-1.5 text-[#dfbe7e]">•</span>
            <span className="text-emerald-800 font-bold">+₹{plan.dailyEarnings}/day</span>
          </p>
        </div>
      </div>

      {/* Right: AMT & Join Button */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <span className="text-[10px] text-[#8a5b28] font-bold block uppercase tracking-wider">
            AMT
          </span>
          <span className="text-sm font-black text-[#46280b] font-mono">
            ₹{plan.amount.toLocaleString('en-IN')}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onJoin(plan);
          }}
          className="bg-[#4e2e0f] hover:bg-[#3b220a] active:scale-95 text-[#ffebbe] border border-[#d6a54d]/60 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer"
        >
          <span>Join</span>
        </button>
      </div>
    </div>
  );
}
