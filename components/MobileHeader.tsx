'use client';

import React from 'react';
import { Plus, History, Crown, Bell, UserPlus, Wallet } from 'lucide-react';
import { UserStats } from '@/types/investment';
import { INITIAL_USER_STATS } from '@/data/initialData';

interface MobileHeaderProps {
  stats?: UserStats;
  userStats?: UserStats;
  activeTab?: string;
  onOpenDeposit?: () => void;
  onOpenHistory?: () => void;
  onOpenAddCustomer?: () => void;
  onOpenCustomerList?: () => void;
  onOpenProfile?: () => void;
  onOpenNotifications?: () => void;
  onOpenFullKyc?: () => void;
  onOpenAdmin?: () => void;
}

export default function MobileHeader({
  stats,
  userStats,
  activeTab = 'home',
  onOpenDeposit,
  onOpenHistory,
  onOpenAddCustomer,
  onOpenProfile,
  onOpenNotifications,
}: MobileHeaderProps) {
  // REQUIREMENT: Header will ONLY show on Home Screen! On other screens, return null.
  if (activeTab !== 'home') {
    return null;
  }

  const currentStats = stats || userStats || INITIAL_USER_STATS;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-2.5 sm:px-3 py-2 sm:py-2.5 flex items-center justify-between shadow-xs">
      {/* Left: Avatar */}
      <div className="flex items-center gap-2">
        <div
          onClick={onOpenProfile}
          className="flex items-center cursor-pointer hover:opacity-90 transition-opacity"
          title="View Profile & Full KYC"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-100 via-blue-50 to-indigo-100 border-2 border-blue-600 flex items-center justify-center font-serif font-black text-blue-900 text-xs shadow-xs">
              {currentStats?.userInitials || 'GK'}
            </div>
            {currentStats?.isVip && (
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-amber-600 text-amber-950 p-0.5 rounded-full shadow-xs border border-white">
                <Crown className="w-2.5 h-2.5 fill-amber-950" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: Wallet pill, + Customer button, History, Notification Bell */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Wallet pill */}
        <div className="flex items-center bg-blue-50/80 border border-blue-200 rounded-full px-2.5 py-1 text-slate-800 shadow-2xs">
          <Wallet className="w-4.5 h-4.5 text-blue-600 mr-1.5 shrink-0 stroke-[2.2]" />
          <span className="text-xs sm:text-sm font-black text-slate-900 mr-1.5 font-mono">
            ₹{(currentStats?.walletBalance ?? 0).toLocaleString('en-IN')}
          </span>
          <button
            onClick={onOpenDeposit}
            className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-xs active:scale-90 shrink-0 cursor-pointer"
            title="Add Money"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>

        {/* + Customer button in VIBRANT BLUE */}
        <button
          onClick={onOpenAddCustomer}
          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white border border-blue-500/60 text-xs font-bold px-2.5 py-1 rounded-full transition-all shadow-xs shrink-0 cursor-pointer"
          title="Add New Customer"
        >
          <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden xs:inline text-[11px] sm:text-xs">+ Customer</span>
          <span className="xs:hidden text-[11px]">+ Cust</span>
        </button>

        {/* History / Clock button */}
        <button
          onClick={onOpenHistory}
          className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-blue-50 active:scale-95 text-slate-700 hover:text-blue-600 border border-slate-200 flex items-center justify-center transition-all shadow-2xs shrink-0 cursor-pointer"
          title="Transaction History"
          aria-label="Transaction History"
        >
          <History className="w-4.5 h-4.5 stroke-[2.4]" />
        </button>

        {/* Notification Bell Icon */}
        <button
          onClick={onOpenNotifications}
          className="relative w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-blue-50 active:scale-95 text-slate-700 hover:text-blue-600 border border-slate-200 flex items-center justify-center transition-all shadow-2xs shrink-0 cursor-pointer"
          title="Notifications & Updates"
          aria-label="Notifications & Updates"
        >
          <Bell className="w-4.5 h-4.5 stroke-[2.4]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-1.5 ring-white" />
        </button>
      </div>
    </header>
  );
}

