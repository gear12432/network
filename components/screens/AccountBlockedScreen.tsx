'use client';

import React from 'react';
import { ShieldAlert, Lock, PhoneCall, LogOut, MessageCircle, AlertTriangle } from 'lucide-react';
import { UserAccountData } from '@/lib/firebase';

interface AccountBlockedScreenProps {
  user: UserAccountData;
  onLogout: () => void;
}

export default function AccountBlockedScreen({ user, onLogout }: AccountBlockedScreenProps) {
  const handleContactWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello Admin, my NetworkJoin Pro account (UID: ${user.loginUid}, Name: ${user.fullName}, Phone: ${user.mobile}) has been blocked. Please verify and unblock my account.`
    );
    window.open(`https://wa.me/919000000000?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0d131f] text-white flex flex-col items-center justify-center p-4 sm:p-6 select-none font-sans relative overflow-hidden">
      {/* Background Ambience Red Blur */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-rose-600/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-amber-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#161f30] rounded-3xl p-6 sm:p-8 border border-rose-500/30 shadow-2xl space-y-6 relative z-10 text-center">
        {/* Warning Icon Badge */}
        <div className="relative mx-auto w-20 h-20 rounded-3xl bg-rose-500/10 border-2 border-rose-500/40 text-rose-500 flex items-center justify-center shadow-lg shadow-rose-900/40">
          <ShieldAlert className="w-10 h-10 stroke-[2.2]" />
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold border-2 border-[#161f30]">
            <Lock className="w-3 h-3 stroke-[2.5]" />
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 bg-rose-500/15 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>Account Blocked</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-serif text-white tracking-tight">
            Account Suspended by Admin
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xs mx-auto">
            Your account has been temporarily blocked by administration. Access to trading, deposits, and payouts is currently restricted.
          </p>
        </div>

        {/* User Identification Card */}
        <div className="bg-[#0f1724] rounded-2xl p-4 border border-slate-700/80 text-left space-y-2.5 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-slate-400 font-semibold">User Name</span>
            <span className="font-extrabold text-white">{user.fullName || 'User'}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-slate-400 font-semibold">User ID (UID)</span>
            <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              {user.loginUid}
            </span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-slate-400 font-semibold">Mobile Number</span>
            <span className="font-mono font-bold text-slate-200">+91 {user.mobile || 'Linked'}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-slate-400 font-semibold">Account Status</span>
            <span className="font-bold text-rose-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Blocked 🔴</span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-semibold">Device ID</span>
            <span className="font-mono text-[10px] text-slate-400 truncate max-w-[160px]">
              {user.deviceId || 'DEV_AUTO'}
            </span>
          </div>
        </div>

        {/* Real-time Status Notice */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-left flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-200 leading-snug">
            <strong>Real-time status:</strong> As soon as the admin unblocks your account, your dashboard will automatically unlock without needing a reload.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <button
            onClick={handleContactWhatsApp}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Contact Admin on WhatsApp</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-bold text-xs tracking-wide border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            <span>Log Out / Switch Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
