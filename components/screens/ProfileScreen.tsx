'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Crown,
  ShieldCheck,
  CreditCard,
  Lock,
  Headphones,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { UserStats } from '@/types/investment';

interface ProfileScreenProps {
  stats: UserStats;
  onOpenHistory: () => void;
  onOpenWithdraw: () => void;
  onOpenDeposit: () => void;
  onOpenAdmin?: () => void;
  onLogout?: () => void;
}

export default function ProfileScreen({
  stats,
  onOpenHistory,
  onOpenWithdraw,
  onOpenDeposit: _onOpenDeposit,
  onOpenAdmin: _onOpenAdmin,
  onLogout,
}: ProfileScreenProps) {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('app_theme');
      if (savedTheme === 'dark' || document.documentElement.classList.contains('dark')) {
        setIsDark(true);
        document.documentElement.classList.add('dark');
      } else {
        setIsDark(false);
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (typeof window !== 'undefined') {
      if (nextDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('app_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('app_theme', 'light');
      }
    }
  };

  return (
    <div className={`space-y-4 pb-20 sm:pb-8 transition-colors duration-300 ${isDark ? 'bg-slate-950 text-slate-100 min-h-screen p-1' : 'bg-slate-50 text-slate-900 min-h-screen'}`}>
      {/* Top User Profile Header (No gold box background, clean white/dark theme) */}
      <div className={`p-4 sm:p-5 rounded-3xl transition-colors ${isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200/80 shadow-xs'}`}>
        <div className="flex items-center justify-between gap-3">
          {/* User Profile Avatar & Info */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-500 via-amber-600 to-amber-700 text-white flex items-center justify-center font-serif font-black text-xl shadow-md uppercase">
                {stats.userInitials || 'SJ'}
              </div>
              {stats.isVip && (
                <div className="absolute -bottom-1 -right-1 bg-amber-500 text-amber-950 p-1 rounded-full shadow-xs border-2 border-white dark:border-slate-900">
                  <Crown className="w-3.5 h-3.5 fill-amber-950" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={`font-serif font-black text-base truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {stats.userName}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                  {stats.level}
                </span>
              </div>
              <p className={`text-xs font-mono mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                UID: <span className="font-bold text-amber-600">{stats.loginUid || 'GK35648'}</span> • Joined Oct 2026
              </p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold mt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>KYC Level 2 Verified</span>
              </div>
            </div>
          </div>

          {/* Light / Dark Mode Switch Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 sm:px-3 sm:py-1.5 rounded-2xl flex items-center gap-1.5 transition-all shadow-2xs border cursor-pointer shrink-0 ${
              isDark
                ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
                : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'
            }`}
            title="Toggle Light / Dark Theme"
          >
            {isDark ? (
              <>
                <Moon className="w-4 h-4 text-amber-300 stroke-[2.5]" />
                <span className="text-xs font-bold hidden sm:inline">Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-500 stroke-[2.5]" />
                <span className="text-xs font-bold hidden sm:inline">Light</span>
              </>
            )}
          </button>
        </div>

        {/* Balance Metric Grid */}
        <div className={`grid grid-cols-2 gap-2 mt-4 pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className={`p-2.5 rounded-2xl ${isDark ? 'bg-slate-800/60' : 'bg-slate-50'}`}>
            <span className={`text-[10px] font-bold block uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Current Balance
            </span>
            <span className={`text-sm font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
              ₹{stats.walletBalance.toLocaleString('en-IN')}
            </span>
          </div>

          <div className={`p-2.5 rounded-2xl ${isDark ? 'bg-slate-800/60' : 'bg-slate-50'}`}>
            <span className={`text-[10px] font-bold block uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Total Withdrawn
            </span>
            <span className={`text-sm font-black font-mono ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>
              ₹{stats.totalPayout.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Menu Options List View */}
      <div className={`rounded-3xl p-2 transition-colors ${isDark ? 'bg-slate-900 border border-slate-800 divide-slate-800' : 'bg-white border border-slate-200/80 shadow-xs divide-slate-100'} divide-y`}>
        <button
          onClick={onOpenHistory}
          className={`w-full flex items-center justify-between p-3.5 transition-colors text-left cursor-pointer rounded-2xl ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-800 text-amber-300' : 'bg-amber-50 text-amber-800'}`}>
              <CreditCard className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className={`font-bold text-xs sm:text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Transaction History
            </span>
          </div>
          <ChevronRight className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
        </button>

        <button
          onClick={onOpenWithdraw}
          className={`w-full flex items-center justify-between p-3.5 transition-colors text-left cursor-pointer rounded-2xl ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-800 text-amber-300' : 'bg-amber-50 text-amber-800'}`}>
              <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className={`font-bold text-xs sm:text-sm block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Bank & UPI Settlement
              </span>
              <span className={`text-[10.5px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                skjiyaul@okhdfcbank linked
              </span>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
        </button>

        <div className={`w-full flex items-center justify-between p-3.5 transition-colors text-left cursor-pointer rounded-2xl ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-800 text-amber-300' : 'bg-amber-50 text-amber-800'}`}>
              <Lock className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className={`font-bold text-xs sm:text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Security & Withdrawal PIN
            </span>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
            Active
          </span>
        </div>

        <div className={`w-full flex items-center justify-between p-3.5 transition-colors text-left cursor-pointer rounded-2xl ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-800 text-amber-300' : 'bg-amber-50 text-amber-800'}`}>
              <Headphones className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className={`font-bold text-xs sm:text-sm block ${isDark ? 'text-white' : 'text-slate-900'}`}>
                24/7 VIP Helpdesk
              </span>
              <span className={`text-[10.5px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Average response time: 2 mins
              </span>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
        </div>

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-between p-3.5 hover:bg-rose-50/80 dark:hover:bg-rose-950/30 transition-colors text-left cursor-pointer rounded-2xl group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8.5 h-8.5 rounded-xl bg-rose-100/80 text-rose-700 dark:bg-rose-950 dark:text-rose-300 flex items-center justify-center">
                <LogOut className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <span className="font-bold text-xs sm:text-sm text-rose-700 dark:text-rose-400 block">
                  Log Out of Account
                </span>
                <span className="text-[10.5px] text-rose-600/80 dark:text-rose-400/80">
                  Sign out and return to the login screen
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      {/* App Version & Disclaimers */}
      <div className="text-center pt-2">
        <p className={`text-[10.5px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          NetworkJoin Pro v2.5.0
        </p>
        <p className={`text-[10px] ${isDark ? 'text-slate-600' : 'text-slate-400'} mt-0.5`}>
          Encrypted with 256-bit SSL Certificate
        </p>
      </div>
    </div>
  );
}
