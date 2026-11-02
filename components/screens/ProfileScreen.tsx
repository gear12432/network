'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Crown,
  ShieldCheck,
  CreditCard,
  Lock,
  Headphones,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
  Camera,
  X,
  CheckCircle2,
  KeyRound,
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
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Security & Withdrawal PIN Modal State
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [pinDigits, setPinDigits] = useState<string[]>(['', '', '', '']);
  const [confirmPinDigits, setConfirmPinDigits] = useState<string[]>(['', '', '', '']);
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSavedSuccess, setPinSavedSuccess] = useState<boolean>(false);
  const [hasSavedPin, setHasSavedPin] = useState<boolean>(true);

  const pinRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const confirmPinRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 1. Load Theme
      const savedTheme = localStorage.getItem('app_theme');
      if (savedTheme === 'dark' || document.documentElement.classList.contains('dark')) {
        setIsDark(true);
        document.documentElement.classList.add('dark');
      } else {
        setIsDark(false);
        document.documentElement.classList.remove('dark');
      }

      // 2. Load Saved Profile Photo
      const savedPhoto = localStorage.getItem('user_profile_photo');
      if (savedPhoto) {
        setProfilePhoto(savedPhoto);
      }

      // 3. Load Saved PIN status
      const savedPin = localStorage.getItem('user_withdrawal_pin');
      if (savedPin) {
        setHasSavedPin(true);
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

  // Profile Image Upload Handler
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfilePhoto(result);
        if (typeof window !== 'undefined') {
          localStorage.setItem('user_profile_photo', result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // PIN Digit Change Handlers
  const handlePinInputChange = (
    index: number,
    value: string,
    isConfirm: boolean = false
  ) => {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);

    if (isConfirm) {
      const next = [...confirmPinDigits];
      next[index] = digit;
      setConfirmPinDigits(next);
      if (digit && index < 3) {
        confirmPinRefs[index + 1].current?.focus();
      }
    } else {
      const next = [...pinDigits];
      next[index] = digit;
      setPinDigits(next);
      if (digit && index < 3) {
        pinRefs[index + 1].current?.focus();
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
    isConfirm: boolean = false
  ) => {
    const digits = isConfirm ? confirmPinDigits : pinDigits;
    const refs = isConfirm ? confirmPinRefs : pinRefs;

    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      refs[index - 1].current?.focus();
    }
  };

  const handleSavePin = () => {
    setPinError(null);
    const pin = pinDigits.join('');
    const confirmPin = confirmPinDigits.join('');

    if (pin.length < 4) {
      setPinError('Please enter a 4-digit Withdrawal PIN.');
      return;
    }
    if (confirmPin.length < 4) {
      setPinError('Please confirm your 4-digit Withdrawal PIN.');
      return;
    }
    if (pin !== confirmPin) {
      setPinError('PINs do not match. Please re-enter.');
      return;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('user_withdrawal_pin', pin);
    }
    setHasSavedPin(true);
    setPinSavedSuccess(true);
    setTimeout(() => {
      setPinSavedSuccess(false);
      setShowPinModal(false);
      setPinDigits(['', '', '', '']);
      setConfirmPinDigits(['', '', '', '']);
    }, 1500);
  };

  const userEmail = stats.email || 'skjiyaul842@gmail.com';

  return (
    <div
      className={`space-y-4 pb-20 sm:pb-8 transition-colors duration-300 ${
        isDark ? 'bg-slate-950 text-slate-100 min-h-screen p-1' : 'bg-slate-50 text-slate-900 min-h-screen'
      }`}
    >
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />

      {/* Top User Profile Header */}
      <div
        className={`p-4 sm:p-5 rounded-3xl transition-colors ${
          isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200/80 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          {/* User Profile Avatar (Clickable to Select Image) & Info */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              onClick={handleAvatarClick}
              className="relative shrink-0 cursor-pointer group"
              title="Click to select & change profile picture"
            >
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt={stats.userName}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover shadow-md border-2 border-amber-500"
                />
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-500 via-amber-600 to-amber-700 text-white flex items-center justify-center font-serif font-black text-xl shadow-md uppercase">
                  {stats.userInitials || 'SJ'}
                </div>
              )}

              {/* Camera Upload Badge Overlay */}
              <div className="absolute -bottom-1 -right-1 bg-black text-white p-1 rounded-full shadow-md border-2 border-white dark:border-slate-900 group-hover:scale-110 transition-transform">
                <Camera className="w-3.5 h-3.5 text-white" />
              </div>

              {stats.isVip && !profilePhoto && (
                <div className="absolute -top-1 -right-1 bg-amber-500 text-amber-950 p-1 rounded-full shadow-xs border-2 border-white dark:border-slate-900">
                  <Crown className="w-3.5 h-3.5 fill-amber-950" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3
                  className={`font-serif font-black text-base truncate ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {stats.userName}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                  {stats.level}
                </span>
              </div>
              <p
                className={`text-xs font-mono mt-0.5 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                UID: <span className="font-bold text-amber-600">{stats.loginUid || 'GK35648'}</span> • Joined Oct 2026
              </p>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold mt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>KYC Level 2 Verified</span>
              </div>
            </div>
          </div>

          {/* Light / Dark Mode Switch Icon Button (Enlarged Black Icon, Clean Layout) */}
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-2xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
              isDark
                ? 'text-white hover:bg-slate-800'
                : 'text-black hover:bg-slate-100'
            }`}
            title="Toggle Light / Dark Theme Across All Screens"
          >
            {isDark ? (
              <Moon className="w-6.5 h-6.5 text-white stroke-[2.2]" />
            ) : (
              <Sun className="w-6.5 h-6.5 text-black stroke-[2.2]" />
            )}
          </button>
        </div>

        {/* Balance Metric Grid */}
        <div
          className={`grid grid-cols-2 gap-2 mt-4 pt-3 border-t ${
            isDark ? 'border-slate-800' : 'border-slate-100'
          }`}
        >
          <div className={`p-2.5 rounded-2xl ${isDark ? 'bg-slate-800/60' : 'bg-slate-50'}`}>
            <span
              className={`text-[10px] font-bold block uppercase ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Current Balance
            </span>
            <span
              className={`text-sm font-black font-mono ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              ₹{stats.walletBalance.toLocaleString('en-IN')}
            </span>
          </div>

          <div className={`p-2.5 rounded-2xl ${isDark ? 'bg-slate-800/60' : 'bg-slate-50'}`}>
            <span
              className={`text-[10px] font-bold block uppercase ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Total Withdrawn
            </span>
            <span
              className={`text-sm font-black font-mono ${
                isDark ? 'text-amber-400' : 'text-amber-800'
              }`}
            >
              ₹{stats.totalPayout.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Menu Options List View (Icon Container Boxes Deleted, Black & Bigger Icons Only) */}
      <div
        className={`rounded-3xl p-2 transition-colors ${
          isDark
            ? 'bg-slate-900 border border-slate-800 divide-slate-800'
            : 'bg-white border border-slate-200/80 shadow-xs divide-slate-100'
        } divide-y`}
      >
        {/* Transaction History Button */}
        <button
          onClick={onOpenHistory}
          className={`w-full flex items-center justify-between p-3.5 transition-colors text-left cursor-pointer rounded-2xl ${
            isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <CreditCard className="w-6.5 h-6.5 text-black dark:text-white stroke-[2.2] shrink-0" />
            <span
              className={`font-bold text-xs sm:text-sm ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Transaction History
            </span>
          </div>
          <ChevronRight className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
        </button>

        {/* Bank & UPI Settlement Button */}
        <button
          onClick={onOpenWithdraw}
          className={`w-full flex items-center justify-between p-3.5 transition-colors text-left cursor-pointer rounded-2xl ${
            isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <ShieldCheck className="w-6.5 h-6.5 text-black dark:text-white stroke-[2.2] shrink-0" />
            <div>
              <span
                className={`font-bold text-xs sm:text-sm block ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Bank & UPI Settlement
              </span>
              <span className={`text-[10.5px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                skjiyaul@okhdfcbank linked
              </span>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
        </button>

        {/* Security & Withdrawal PIN Button (Opens Dialog Modal) */}
        <button
          type="button"
          onClick={() => setShowPinModal(true)}
          className={`w-full flex items-center justify-between p-3.5 transition-colors text-left cursor-pointer rounded-2xl ${
            isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <Lock className="w-6.5 h-6.5 text-black dark:text-white stroke-[2.2] shrink-0" />
            <span
              className={`font-bold text-xs sm:text-sm ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Security & Withdrawal PIN
            </span>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 rounded-full">
            {hasSavedPin ? 'Active' : 'Set PIN'}
          </span>
        </button>

        {/* 24/7 VIP Helpdesk Button */}
        <div
          className={`w-full flex items-center justify-between p-3.5 transition-colors text-left cursor-pointer rounded-2xl ${
            isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <Headphones className="w-6.5 h-6.5 text-black dark:text-white stroke-[2.2] shrink-0" />
            <div>
              <span
                className={`font-bold text-xs sm:text-sm block ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                24/7 VIP Helpdesk
              </span>
              <span className={`text-[10.5px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Average response time: 2 mins
              </span>
            </div>
          </div>
          <ChevronRight className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
        </div>

        {/* Log Out Button */}
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-between p-3.5 hover:bg-rose-50/80 dark:hover:bg-rose-950/30 transition-colors text-left cursor-pointer rounded-2xl group"
          >
            <div className="flex items-center gap-3.5">
              <LogOut className="w-6.5 h-6.5 text-rose-600 dark:text-rose-400 stroke-[2.2] shrink-0" />
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

      {/* Security & Withdrawal PIN Dialog Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className={`w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl relative transition-all ${
              isDark ? 'bg-slate-900 text-white border border-slate-800' : 'bg-white text-slate-900'
            }`}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowPinModal(false)}
              className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors cursor-pointer ${
                isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
              }`}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg">Security & Withdrawal PIN</h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Protect your withdrawals & account security
                </p>
              </div>
            </div>

            {/* User Email Info Banner */}
            <div
              className={`p-3 rounded-2xl mb-5 flex items-center justify-between text-xs font-mono border ${
                isDark
                  ? 'bg-slate-800/70 border-slate-700 text-slate-300'
                  : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <span className="font-sans font-bold text-[11px] uppercase tracking-wider text-slate-400">
                Logged In User:
              </span>
              <span className="font-bold text-amber-600 dark:text-amber-400">{userEmail}</span>
            </div>

            {/* Success Banner */}
            {pinSavedSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                  Withdrawal PIN Saved!
                </h4>
                <p className="text-xs text-slate-500">Your 4-digit PIN is active for all transactions.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Error Message */}
                {pinError && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold text-center">
                    {pinError}
                  </div>
                )}

                {/* Enter 4-Digit PIN */}
                <div>
                  <label className="block text-xs font-bold mb-2">
                    Enter 4-Digit Withdrawal PIN:
                  </label>
                  <div className="flex items-center justify-center gap-3">
                    {pinDigits.map((digit, idx) => (
                      <input
                        key={`pin-${idx}`}
                        ref={pinRefs[idx]}
                        type="password"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handlePinInputChange(idx, e.target.value, false)}
                        onKeyDown={(e) => handleKeyDown(idx, e, false)}
                        className={`w-12 h-13 text-center text-xl font-bold rounded-2xl border-2 transition-all outline-none ${
                          isDark
                            ? 'bg-slate-800 border-slate-700 text-white focus:border-amber-500'
                            : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Confirm 4-Digit PIN */}
                <div>
                  <label className="block text-xs font-bold mb-2">
                    Confirm 4-Digit Withdrawal PIN:
                  </label>
                  <div className="flex items-center justify-center gap-3">
                    {confirmPinDigits.map((digit, idx) => (
                      <input
                        key={`cpin-${idx}`}
                        ref={confirmPinRefs[idx]}
                        type="password"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handlePinInputChange(idx, e.target.value, true)}
                        onKeyDown={(e) => handleKeyDown(idx, e, true)}
                        className={`w-12 h-13 text-center text-xl font-bold rounded-2xl border-2 transition-all outline-none ${
                          isDark
                            ? 'bg-slate-800 border-slate-700 text-white focus:border-amber-500'
                            : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Confirm Button */}
                <button
                  onClick={handleSavePin}
                  className="w-full mt-2 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-amber-950 font-black text-sm shadow-md transition-all cursor-pointer active:scale-[0.98]"
                >
                  Confirm & Save PIN
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
