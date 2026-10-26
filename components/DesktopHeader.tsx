'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Bell, Plus, ArrowUpRight, Crown, LayoutGrid, Smartphone, UserPlus, Users, Maximize2, Settings } from 'lucide-react';
import { UserStats } from '@/types/investment';

interface DesktopHeaderProps {
  stats: UserStats;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenHistory: () => void;
  onOpenProfile: () => void;
  onOpenAddCustomer?: () => void;
  onOpenCustomerList?: () => void;
  onToggleMobileLayout?: () => void;
  onOpenAdmin?: () => void;
}

export default function DesktopHeader({
  stats,
  searchQuery,
  onSearchChange,
  onOpenDeposit: _onOpenDeposit,
  onOpenWithdraw,
  onOpenHistory,
  onOpenProfile,
  onOpenAddCustomer,
  onOpenCustomerList,
  onToggleMobileLayout,
  onOpenAdmin,
}: DesktopHeaderProps) {
  const handleAdminClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onOpenAdmin) {
      onOpenAdmin();
    } else if (typeof window !== 'undefined') {
      window.location.hash = 'admin';
    }
  };
  return (
    <div className="sticky top-0 z-20 w-full bg-gradient-to-r from-[#fffdf9] via-[#fdf7ec] to-[#fbf1db] border-b border-[#dfbe7e] shadow-xs text-[#46280b]">
      {/* 1. Main Top Header Bar */}
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Section Title & Search Bar */}
        <div className="flex items-center gap-4 sm:gap-6 flex-1 max-w-2xl">
          <div className="flex items-center gap-2 text-[#46280b] shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f5e4bd] to-[#edd199] border border-[#dfbe7e] text-[#5c3710] flex items-center justify-center shadow-2xs">
              <LayoutGrid className="w-4 h-4 text-[#7d511f]" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-[#46280b]">Dashboard</span>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-[#e4cc9f] hidden sm:block" />

          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#a68255] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Start typing to search plan, amount, or ROI..."
              className="w-full pl-9 pr-4 py-2 bg-white/90 border border-[#dfbe7e] rounded-xl text-xs sm:text-sm text-[#46280b] placeholder-[#a68255] focus:outline-none focus:ring-2 focus:ring-[#d9a54c]/30 focus:border-[#d9a54c] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8a5b28] hover:text-[#46280b] font-bold"
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
              className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f8eedb] hover:bg-[#ebd9bc] active:scale-95 text-[#55361e] text-xs font-semibold transition-all border border-[#dfbe7e]"
              title="Switch to Mobile View"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#b87d23]" />
              <span>Mobile View</span>
            </button>
          )}

          {/* Buy Premium Gold Button (Matching Screenshot 1) */}
          <button
            onClick={onOpenProfile}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#d9a54c] via-[#e5b766] to-[#caa050] hover:brightness-105 active:scale-95 text-[#2b1706] text-xs font-black shadow-xs border border-[#caa050] transition-all cursor-pointer"
            title="Buy VIP Premium Upgrade"
          >
            <Crown className="w-3.5 h-3.5 fill-[#2b1706]" />
            <span>Buy Premium</span>
          </button>

          {/* Wallet Balance Chip */}
          <div className="flex items-center gap-2 bg-[#fffcf5] border border-[#dfbe7e] rounded-xl px-3 py-1.5 shadow-2xs">
            <span className="text-[10px] font-bold text-[#8a5b28] uppercase tracking-wider">Balance:</span>
            <span className="text-xs sm:text-sm font-extrabold text-[#46280b] font-mono">
              ₹{stats.walletBalance.toLocaleString('en-IN')}
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
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#f8eedb] hover:bg-[#ebd9bc] border border-[#dfbe7e] hidden sm:flex items-center justify-center text-[#55361e] transition-colors cursor-pointer"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#7d511f]" />
          </button>

          {/* Admin Panel Quick Link */}
          <button
            type="button"
            onClick={handleAdminClick}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition-all shadow-xs border border-slate-800 cursor-pointer active:scale-95"
            title="Admin Panel Control Center"
          >
            <Settings className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin</span>
          </button>

          {/* Settings / Configuration */}
          <button
            onClick={onOpenProfile}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#f8eedb] hover:bg-[#ebd9bc] border border-[#dfbe7e] hidden sm:flex items-center justify-center text-[#55361e] transition-colors cursor-pointer"
            title="Settings & Profile"
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#7d511f]" />
          </button>

          {/* Notifications / History Bell */}
          <button
            onClick={onOpenHistory}
            className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#f8eedb] hover:bg-[#ebd9bc] border border-[#dfbe7e] flex items-center justify-center text-[#55361e] transition-colors cursor-pointer"
            title="Recent Transactions & Alerts"
          >
            <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#7d511f]" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#d9a54c]" />
          </button>

          {/* User Avatar (Clean: NO name, NO VIP PRO Member text) */}
          <div
            onClick={onOpenProfile}
            className="flex items-center pl-0.5 cursor-pointer hover:opacity-85 transition-opacity"
            title="Profile & Account"
          >
            <div className="relative">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#ffe7b8] to-[#f4d188] border-2 border-[#d9a54c] flex items-center justify-center text-xs font-extrabold text-[#46280b] shadow-2xs">
                {stats.userInitials}
              </div>
              {stats.isVip && (
                <div className="absolute -bottom-1 -right-1 bg-[#d9a54c] text-[#2b1706] p-0.5 rounded-full shadow-xs">
                  <Crown className="w-2.5 h-2.5 fill-[#2b1706]" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sub-Header Action Box: Customer, Customers Directory, Withdraw */}
      <div className="bg-[#fbf5e7] border-t border-[#dfbe7e]/70 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        {/* Action Buttons: Customer, Customers Directory, Withdraw */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          {/* + Customer Button */}
          {onOpenAddCustomer && (
            <button
              onClick={onOpenAddCustomer}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#4e2e0f] to-[#3a200a] hover:from-[#3a200a] hover:to-[#2b1706] active:scale-95 text-[#ffeec9] text-xs font-bold transition-all shadow-xs border border-[#d9a54c]/60 cursor-pointer"
              title="Add New Customer"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#f5d082]" />
              <span>+ Customer</span>
            </button>
          )}

          {/* Customers Directory Button */}
          {onOpenCustomerList && (
            <button
              onClick={onOpenCustomerList}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#fffdfa] hover:bg-[#faecd4] active:scale-95 text-[#55361e] text-xs font-bold transition-all border border-[#dfbe7e] shadow-2xs cursor-pointer"
              title="View Customers Directory"
            >
              <Users className="w-3.5 h-3.5 text-[#7d511f]" />
              <span>Customers Directory</span>
            </button>
          )}

          {/* Withdraw Button */}
          <button
            onClick={onOpenWithdraw}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#d9a54c] to-[#be8832] hover:brightness-105 active:scale-95 text-[#2b1706] text-xs font-bold transition-all shadow-xs border border-[#caa050] cursor-pointer"
            title="Withdraw Funds"
          >
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Withdraw</span>
          </button>
        </div>

        {/* Right Info Badge */}
        <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#8a5b28] font-medium bg-[#f5e9d3]/80 px-3 py-1 rounded-lg border border-[#e4cc9f]">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span className="font-semibold text-[#55361e]">Direct Bank Settlement & Instant Payouts Active</span>
        </div>
      </div>
    </div>
  );
}
