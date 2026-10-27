'use client';

import React from 'react';
import {
  User,
  Crown,
  ShieldCheck,
  CreditCard,
  Lock,
  Headphones,
  FileText,
  Share2,
  ChevronRight,
  LogOut,
  Bell,
  Sparkles,
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
  onOpenDeposit,
  onOpenAdmin,
  onLogout,
}: ProfileScreenProps) {
  return (
    <div className="space-y-4 pb-20 sm:pb-8">
      {/* Profile Card matching Palace Gold VIP theme */}
      <div className="bg-gradient-to-b from-[#fffefc] via-[#fbf5e7] to-[#f4e4c2] rounded-3xl p-5 border-2 border-[#dfbe7e] shadow-2xs relative overflow-hidden">
        {/* Ornate Gold Filigree Corner Accents */}
        <div className="absolute top-1.5 left-2 text-[#caa050] text-xs select-none">✦</div>
        <div className="absolute top-1.5 right-2 text-[#caa050] text-xs select-none">✦</div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#ffecc3] via-[#fff4dc] to-[#fadca0] border-2 border-[#d4a852] flex items-center justify-center font-serif font-black text-xl text-[#55361e] shadow-xs">
              {stats.userInitials}
            </div>
            {stats.isVip && (
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-[#e5ab48] to-[#b3781e] text-amber-950 p-1 rounded-full shadow-xs border border-white">
                <Crown className="w-3.5 h-3.5 fill-amber-950" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-black text-base text-[#46280b] truncate">
                {stats.userName}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#faecd4] text-[#965c19] border border-[#e8d2aa]">
                {stats.level}
              </span>
            </div>
            <p className="text-xs text-[#8a5b28] font-mono mt-0.5">
              UID: <span className="font-bold text-[#b87324]">{stats.loginUid || 'GK37643'}</span> • Joined Oct 2026
            </p>
            <div className="flex items-center gap-1 text-[11px] text-[#965c19] font-semibold mt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#b3781e]" />
              <span>KYC Level 2 Verified • Firebase Cloud</span>
            </div>
          </div>
        </div>

        {/* Quick Balance Grid */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#dfbe7e]/70">
          <div className="bg-white/85 p-2.5 rounded-2xl border border-[#ebd2aa]">
            <span className="text-[10px] text-[#8a5b28] font-bold block uppercase">
              Current Balance
            </span>
            <span className="text-sm font-black text-[#46280b] font-mono">
              ₹{stats.walletBalance.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="bg-white/85 p-2.5 rounded-2xl border border-[#ebd2aa]">
            <span className="text-[10px] text-[#8a5b28] font-bold block uppercase">
              Total Withdrawn
            </span>
            <span className="text-sm font-black text-[#965c19] font-mono">
              ₹{stats.totalPayout.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Menu Options Group */}
      <div className="bg-gradient-to-b from-[#fffefc] via-[#fffbf3] to-[#fbf2dd] rounded-3xl border border-[#dfc38d] shadow-2xs divide-y divide-[#ebd2aa] overflow-hidden">
        <button
          onClick={onOpenHistory}
          className="w-full flex items-center justify-between p-4 hover:bg-[#fff9eb] transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#faecd4] text-[#965c19] flex items-center justify-center border border-[#ebd2aa]">
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="font-serif font-black text-xs text-[#46280b]">Transaction History</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#caa050]" />
        </button>

        <button
          onClick={onOpenWithdraw}
          className="w-full flex items-center justify-between p-4 hover:bg-[#fff9eb] transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#faecd4] text-[#965c19] flex items-center justify-center border border-[#ebd2aa]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif font-black text-xs text-[#46280b] block">Bank & UPI Settlement</span>
              <span className="text-[10px] text-[#8a5b28]">skjiyaul@okhdfcbank linked</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#caa050]" />
        </button>

        <div className="w-full flex items-center justify-between p-4 hover:bg-[#fff9eb] transition-colors text-left cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#faecd4] text-[#965c19] flex items-center justify-center border border-[#ebd2aa]">
              <Lock className="w-4 h-4" />
            </div>
            <span className="font-serif font-black text-xs text-[#46280b]">Security & Withdrawal PIN</span>
          </div>
          <span className="text-[10px] font-bold text-[#8c5929] bg-[#faecd4] border border-[#e5cfab] px-2 py-0.5 rounded-full">
            Active
          </span>
        </div>

        <div className="w-full flex items-center justify-between p-4 hover:bg-[#fff9eb] transition-colors text-left cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#faecd4] text-[#965c19] flex items-center justify-center border border-[#ebd2aa]">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif font-black text-xs text-[#46280b] block">24/7 VIP Helpdesk</span>
              <span className="text-[10px] text-[#8a5b28]">Average response time: 2 mins</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#caa050]" />
        </div>

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-between p-4 hover:bg-red-50/80 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-100/70 text-red-700 flex items-center justify-center border border-red-200 group-hover:bg-red-200">
                <LogOut className="w-4 h-4" />
              </div>
              <div>
                <span className="font-serif font-black text-xs text-red-700 block">Log Out of Account</span>
                <span className="text-[10px] text-red-600/80">Sign out and return to the login screen</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-red-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      {/* App Version & Disclaimers */}
      <div className="text-center pt-2">
        <p className="text-[10px] text-slate-400">NetworkJoin Pro v2.5.0 (Firebase Cloud)</p>
        <p className="text-[10px] text-slate-400 mt-0.5">Encrypted with 256-bit SSL Certificate</p>
      </div>
    </div>
  );
}
