'use client';

import React from 'react';
import { Plus, History, Crown, Bell, UserPlus, Wallet } from 'lucide-react';
import { UserStats } from '@/types/investment';

interface MobileHeaderProps {
  stats: UserStats;
  onOpenDeposit: () => void;
  onOpenHistory: () => void;
  onOpenAddCustomer: () => void;
  onOpenProfile: () => void;
  onOpenNotifications: () => void;
}

export default function MobileHeader({
  stats,
  onOpenDeposit,
  onOpenHistory,
  onOpenAddCustomer,
  onOpenProfile,
  onOpenNotifications,
}: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-gradient-to-r from-[#fffdf9] via-[#fdf7ec] to-[#fbf1db] border-b border-[#dfbe7e] px-2.5 sm:px-3 py-2 sm:py-2.5 flex items-center justify-between shadow-2xs">
      {/* Left: Avatar only with luxury gold rim */}
      <div
        onClick={onOpenProfile}
        className="flex items-center cursor-pointer hover:opacity-90 transition-opacity"
        title="View Profile & Full KYC"
      >
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#ffecc3] via-[#fff4dc] to-[#fadca0] border-2 border-[#d4a852] flex items-center justify-center font-serif font-black text-[#55361e] text-xs shadow-xs">
            {stats.userInitials}
          </div>
          {stats.isVip && (
            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-[#e5ab48] to-[#b3781e] text-amber-950 p-0.5 rounded-full shadow-xs border border-white">
              <Crown className="w-2.5 h-2.5 fill-amber-950" />
            </div>
          )}
        </div>
      </div>

      {/* Right: Wallet pill (with Wallet icon instead of text), + Customer button, History, Notification Bell */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Wallet pill */}
        <div className="flex items-center bg-white/95 border border-[#dfbe7e] rounded-full px-2.5 py-1 text-[#55361e] shadow-2xs">
          <Wallet className="w-3.5 h-3.5 text-[#8a5b28] mr-1 shrink-0" />
          <span className="text-xs font-black text-[#46280b] mr-1.5 font-mono">
            ₹{stats.walletBalance.toLocaleString('en-IN')}
          </span>
          <button
            onClick={onOpenDeposit}
            className="w-4 h-4 rounded-full bg-[#4e2e0f] text-[#ffebbe] flex items-center justify-center hover:bg-[#3b220a] transition-colors shadow-xs active:scale-90 shrink-0"
            title="Add Money"
          >
            <Plus className="w-3 h-3 stroke-[3]" />
          </button>
        </div>

        {/* + Customer button */}
        <button
          onClick={onOpenAddCustomer}
          className="flex items-center gap-1 bg-[#4e2e0f] hover:bg-[#3b220a] active:scale-95 text-[#ffebbe] border border-[#d6a54d]/60 text-xs font-bold px-2.5 py-1 rounded-full transition-all shadow-xs shrink-0"
          title="Add New Customer"
        >
          <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden xs:inline text-[11px] sm:text-xs">+ Customer</span>
          <span className="xs:hidden text-[11px]">+ Cust</span>
        </button>

        {/* History / Clock button - Enlarged size */}
        <button
          onClick={onOpenHistory}
          className="w-8 h-8 rounded-full bg-[#f8eedb] hover:bg-[#ebd9bc] active:scale-95 text-[#5a3818] border border-[#e8d2a8] flex items-center justify-center transition-all shadow-2xs shrink-0"
          title="Transaction History"
          aria-label="Transaction History"
        >
          <History className="w-4.5 h-4.5 stroke-[2.2]" />
        </button>

        {/* Notification Bell Icon - Enlarged size */}
        <button
          onClick={onOpenNotifications}
          className="relative w-8 h-8 rounded-full bg-[#f8eedb] hover:bg-[#ebd9bc] active:scale-95 text-[#5a3818] border border-[#e8d2a8] flex items-center justify-center transition-all shadow-2xs shrink-0"
          title="Notifications & Updates"
          aria-label="Notifications & Updates"
        >
          <Bell className="w-4.5 h-4.5 stroke-[2.2]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#b3781e] ring-1 ring-white" />
        </button>
      </div>
    </header>
  );
}
