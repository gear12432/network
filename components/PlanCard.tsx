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

export default function PlanCard({ plan, onJoin, onViewDetails, viewMode = 'grid' }: PlanCardProps) {
  // Select icon and color scheme based on iconType
  const getIconConfig = () => {
    switch (plan.iconType) {
      case 'lightning':
        return {
          icon: Zap,
          bg: 'bg-amber-500',
          lightBg: 'bg-amber-50',
          text: 'text-amber-500',
        };
      case 'shield':
        return {
          icon: Shield,
          bg: 'bg-blue-500',
          lightBg: 'bg-blue-50',
          text: 'text-blue-500',
        };
      case 'badge':
        return {
          icon: Award,
          bg: 'bg-amber-400',
          lightBg: 'bg-amber-50',
          text: 'text-amber-600',
        };
      case 'crown':
        return {
          icon: Crown,
          bg: 'bg-purple-600',
          lightBg: 'bg-purple-50',
          text: 'text-purple-600',
        };
      case 'gem':
      default:
        return {
          icon: Gem,
          bg: 'bg-emerald-500',
          lightBg: 'bg-emerald-50',
          text: 'text-emerald-600',
        };
    }
  };

  const config = getIconConfig();
  const Icon = config.icon;

  // 1. Grid View (Modern, Professional Executive Investment Card)
  if (viewMode === 'grid') {
    return (
      <div
        onClick={() => onViewDetails?.(plan)}
        className="bg-gradient-to-b from-[#fffefc] via-[#fffbf3] to-[#fbf2dd] rounded-2xl p-4 sm:p-5 border border-[#dfc38d] shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between gap-4 cursor-pointer group hover:border-[#caa050] hover:-translate-y-1 relative"
      >
        {/* Top Header: Icon & Category Badges */}
        <div className="flex items-start justify-between gap-2">
          <div
            className={`w-11 h-11 rounded-2xl ${config.bg} flex items-center justify-center text-white shrink-0 shadow-xs group-hover:scale-105 transition-transform`}
          >
            <Icon className="w-5 h-5 fill-white/20 stroke-[2.2]" />
          </div>

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
        <div
          className={`w-11 h-11 rounded-2xl ${config.bg} flex items-center justify-center text-white shrink-0 shadow-xs group-hover:scale-105 transition-transform`}
        >
          <Icon className="w-5 h-5 fill-white/20 stroke-[2.2]" />
        </div>

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
