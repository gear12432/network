'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Bell, Plus, ArrowUpRight, Crown, LayoutGrid, Smartphone, UserPlus, Users, Maximize2, Settings } from 'lucide-react';
import { UserStats } from '@/types/investment';
import { INITIAL_USER_STATS } from '@/data/initialData';

interface DesktopHeaderProps {
  stats?: UserStats;
  userStats?: UserStats;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onOpenDeposit?: () => void;
  onOpenWithdraw?: () => void;
  onOpenHistory?: () => void;
  onOpenProfile?: () => void;
  onOpenNotifications?: () => void;
  onOpenFullKyc?: () => void;
  onOpenAddCustomer?: () => void;
  onOpenCustomerList?: () => void;
  onToggleMobileLayout?: () => void;
  onOpenAdmin?: () => void;
}

export default function DesktopHeader({
  stats,
  userStats,
  searchQuery = '',
  onSearchChange,
  onOpenDeposit: _onOpenDeposit,
  onOpenWithdraw,
  onOpenHistory,
  onOpenProfile,
  onOpenAddCustomer,
  onOpenCustomerList,
  onToggleMobileLayout,
  onOpenAdmin: _onOpenAdmin,
}: DesktopHeaderProps) {
  const currentStats = stats || userStats || INITIAL_USER_STATS;

  return (
    <div className="sticky top-0 z-20 w-full bg-[#FFFFFF] border-b border-[#D0E4F5] shadow-xs text-[#172B75]">
      {/* 1. Main Top Header Bar */}
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Section Title & Search Bar */}
        <div className="flex items-center gap-4 sm:gap-6 flex-1 max-w-2xl">
          <div className="flex items-center gap-2 text-[#172B75] shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[#E5F3FC] border border-[#00B9F1]/40 text-[#002E6E] flex items-center justify-center shadow-2xs">
              <LayoutGrid className="w-4 h-4 text-[#002E6E]" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-[#002E6E]">Dashboard</span>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-[#D0E4F5] hidden sm:block" />

          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#172B75]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Start typing to search plan, amount, or ROI..."
              className="w-full pl-9 pr-4 py-2 bg-[#F2F8FC] border border-[#D0E4F5] rounded-xl text-xs sm:text-sm text-[#172B75] placeholder-[#172B75]/50 focus:outline-none focus:ring-2 focus:ring-[#00B9F1]/30 focus:border-[#00B9F1] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange?.('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#172B75]/60 hover:text-[#002E6E] font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right: Buy Premium + Fullscreen + Settings + Notifications + Avatar */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Mobile View Switcher button for desktop users */}
          {onToggleMobileLayout && (
            <button
              onClick={onToggleMobileLayout}
              className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F2F8FC] hover:bg-[#E5F3FC] active:scale-95 text-[#172B75] text-xs font-semibold transition-all border border-[#D0E4F5]"
              title="Switch to Mobile View"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#00B9F1]" />
              <span>Mobile View</span>
            </button>
          )}

          {/* Buy Premium Button */}
          <button
            onClick={onOpenProfile}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#002E6E] hover:bg-[#00204d] active:scale-95 text-white text-xs font-black shadow-xs border border-[#00B9F1]/40 transition-all cursor-pointer"
            title="Buy VIP Premium Upgrade"
          >
            <Crown className="w-3.5 h-3.5 text-[#00B9F1]" />
            <span>Buy Premium</span>
          </button>

          {/* Wallet Balance Chip */}
          <div className="flex items-center gap-2 bg-[#F2F8FC] border border-[#D0E4F5] rounded-xl px-3 py-1.5 shadow-2xs">
            <span className="text-[10px] font-bold text-[#172B75]/70 uppercase tracking-wider">Balance:</span>
            <span className="text-xs sm:text-sm font-extrabold text-[#002E6E] font-mono">
              ₹{(currentStats?.walletBalance ?? 0).toLocaleString('en-IN')}
            </span>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
              } else {
                document.exitFullscreen().catch(() => {});
              }
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#F2F8FC] hover:bg-[#E5F3FC] border border-[#D0E4F5] hidden sm:flex items-center justify-center text-[#172B75] transition-colors cursor-pointer"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#002E6E]" />
          </button>

          {/* Settings / Configuration */}
          <button
            onClick={onOpenProfile}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#F2F8FC] hover:bg-[#E5F3FC] border border-[#D0E4F5] hidden sm:flex items-center justify-center text-[#172B75] transition-colors cursor-pointer"
            title="Settings & Profile"
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#002E6E]" />
          </button>

          {/* Notifications / History Bell */}
          <button
            onClick={onOpenHistory}
            className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#F2F8FC] hover:bg-[#E5F3FC] border border-[#D0E4F5] flex items-center justify-center text-[#172B75] transition-colors cursor-pointer"
            title="Recent Transactions & Alerts"
          >
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#002E6E]" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#00B9F1]" />
          </button>

          {/* User Avatar */}
          <div
            onClick={onOpenProfile}
            className="flex items-center pl-0.5 cursor-pointer hover:opacity-85 transition-opacity"
            title="Profile & Account"
          >
            <div className="relative">
              {currentStats?.photoUrl ? (
                <img
                  src={currentStats.photoUrl}
                  alt="Profile"
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-[#002E6E] shadow-2xs"
                />
              ) : (
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#002E6E] border-2 border-[#00B9F1] flex items-center justify-center text-xs font-extrabold text-white shadow-2xs">
                  {currentStats?.userInitials || 'GK'}
                </div>
              )}
              {currentStats?.isVip && (
                <div className="absolute -bottom-1 -right-1 bg-[#00B9F1] text-white p-0.5 rounded-full shadow-xs">
                  <Crown className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sub-Header Action Box: Customer, Customers Directory, Withdraw */}
      <div className="bg-[#F2F8FC] border-t border-[#D0E4F5] px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        {/* Action Buttons: Customer, Customers Directory, Withdraw */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          {/* + Customer Button */}
          {onOpenAddCustomer && (
            <button
              onClick={onOpenAddCustomer}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#002E6E] hover:bg-[#00204d] active:scale-95 text-white text-xs font-bold transition-all shadow-xs border border-[#00B9F1]/40 cursor-pointer"
              title="Add New Customer"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#00B9F1]" />
              <span>+ Customer</span>
            </button>
          )}

          {/* Customers Directory Button */}
          {onOpenCustomerList && (
            <button
              onClick={onOpenCustomerList}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#E5F3FC] active:scale-95 text-[#002E6E] text-xs font-bold transition-all border border-[#D0E4F5] shadow-2xs cursor-pointer"
              title="View Customers Directory"
            >
              <Users className="w-3.5 h-3.5 text-[#00B9F1]" />
              <span>Customers Directory</span>
            </button>
          )}

          {/* Withdraw Button */}
          {onOpenWithdraw && (
            <button
              onClick={onOpenWithdraw}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#00B9F1] hover:bg-[#009bc7] active:scale-95 text-white text-xs font-bold transition-all shadow-xs border border-[#002E6E]/20 cursor-pointer"
              title="Withdraw Funds"
            >
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Withdraw</span>
            </button>
          )}
        </div>

        {/* Right Info Badge */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#172B75] font-medium bg-[#FFFFFF] px-3 py-1 rounded-lg border border-[#D0E4F5]">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span className="font-semibold text-[#002E6E]">Direct Bank Settlement & Instant Payouts Active</span>
        </div>
      </div>
    </div>
  );
}
