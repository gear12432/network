'use client';

import React, { useState, useRef, useEffect } from 'react';
import { InvestmentPlan, UserStats, Customer } from '@/types/investment';
import {
  Calendar,
  Coins,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2,
  Phone,
  Building2,
  Sparkles,
  X,
  Search,
} from 'lucide-react';

interface PlanDetailContentProps {
  plan?: InvestmentPlan | null;
  stats?: UserStats;
  userStats?: UserStats;
  customers?: Customer[];
  onProceedToConfirm?: (plan: InvestmentPlan, customer: Customer) => void;
  onOpenDeposit?: () => void;
  onOpenAddCustomer?: () => void;
}

export default function PlanDetailContent({
  plan,
  stats,
  userStats,
  customers = [],
  onProceedToConfirm,
  onOpenDeposit,
  onOpenAddCustomer,
}: PlanDetailContentProps) {
  const currentStats = stats || userStats || { walletBalance: 0, userName: 'Member', userInitials: 'GK' } as any;

  // Mobile search state - pre-populate with first customer if available
  const [searchMobile, setSearchMobile] = useState(() => (customers && customers.length > 0 ? customers[0].mobile : ''));
  const [isSearching, setIsSearching] = useState(false);
  const [matchedCustomer, setMatchedCustomer] = useState<Customer | null>(() => (customers && customers.length > 0 ? customers[0] : null));
  const [searchFailed, setSearchFailed] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  if (!plan) return null;

  const isBalanceEnough = (currentStats?.walletBalance ?? 0) >= plan.amount;
  const netProfit = (plan.amount * plan.roiPercentage) / 100;
  const totalMaturity = plan.amount + netProfit;

  // Search logic triggered on mobile input change
  const triggerCustomerSearch = (mobileDigits: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    setValidationError(null);

    if (mobileDigits.length === 10) {
      setIsSearching(true);
      setSearchFailed(false);
      setMatchedCustomer(null);

      searchTimeoutRef.current = setTimeout(() => {
        const found = customers.find((c) => {
          const rawMobile = c.mobile.replace(/\D/g, '');
          return rawMobile === mobileDigits || rawMobile.endsWith(mobileDigits);
        });

        setIsSearching(false);
        if (found) {
          setMatchedCustomer(found);
          setSearchFailed(false);
        } else {
          setMatchedCustomer(null);
          setSearchFailed(true);
        }
      }, 450);
    } else {
      setIsSearching(false);
      setMatchedCustomer(null);
      setSearchFailed(false);
    }
  };

  const handleMobileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const digitsOnly = rawVal.replace(/\D/g, '').slice(0, 10);
    setSearchMobile(digitsOnly);
    triggerCustomerSearch(digitsOnly);
  };

  const handleClearSearch = () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    setSearchMobile('');
    setIsSearching(false);
    setMatchedCustomer(null);
    setSearchFailed(false);
    setValidationError(null);
  };

  const handleQuickSelect = (mobile: string) => {
    const digitsOnly = mobile.replace(/\D/g, '').slice(0, 10);
    setSearchMobile(digitsOnly);
    triggerCustomerSearch(digitsOnly);
  };

  const handleJoinClick = () => {
    if (!isBalanceEnough) {
      setValidationError(
        `Insufficient balance. Please add ₹${(plan.amount - stats.walletBalance).toLocaleString('en-IN')} to your wallet.`
      );
      return;
    }

    if (!matchedCustomer) {
      setValidationError('Please enter a valid 10-digit customer mobile number before proceeding.');
      return;
    }

    setValidationError(null);
    onProceedToConfirm(plan, matchedCustomer);
  };

  return (
    <div className="space-y-4 text-[#46280b]">
      {/* =========================================================================
          CUSTOMER 10-DIGIT MOBILE SEARCH BAR WITH FLOATING OUTLINED LABEL
          ========================================================================= */}
      <div className="space-y-2 pt-1">
        <div className="relative w-full pt-1.5">
          <div className="relative flex items-center w-full min-h-[52px] h-[52px] sm:min-h-[56px] sm:h-14 bg-white rounded-2xl transition-all duration-200 border-2 border-[#dfbe7e] hover:border-[#caa050] focus-within:border-[#d0872e] focus-within:ring-2 focus-within:ring-[#d0872e]/30 shadow-2xs">
            {/* Left Icon */}
            <div className="absolute left-3.5 z-10 flex items-center justify-center pointer-events-none text-[#8a5416]">
              <Phone className="w-4 h-4" />
            </div>

            {/* Optional Prefix */}
            <span className="absolute left-10 text-xs sm:text-sm font-mono text-[#b87324] font-bold pointer-events-none">
              +91
            </span>

            {/* Outlined Floating Label on Top Border */}
            <label className="absolute -top-2.5 left-3 px-1.5 py-0 bg-[#faf6ee] text-xs font-bold text-[#8a5416] tracking-wide pointer-events-none select-none z-10 rounded-sm">
              Customer 10-Digit Mobile Number
            </label>

            {/* Native Input */}
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              value={searchMobile}
              onChange={handleMobileInputChange}
              className="w-full bg-transparent text-[#46280b] font-mono font-bold text-sm sm:text-base focus:outline-none pl-18 pr-28 py-2.5 placeholder:text-[#a08a6b]"
              placeholder="Enter mobile..."
            />

            {/* Right Action Elements */}
            <div className="absolute right-3 flex items-center gap-2">
              {searchMobile.length > 0 && !isSearching && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-1 rounded-md text-[#8a5416] hover:bg-[#faecd4] transition-colors cursor-pointer"
                  title="Clear input"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* 1. Circular Spinning Progress Loader */}
              {isSearching && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#faecd4] text-[#8a5416] border border-[#dfbe7e] shadow-2xs">
                  <Loader2 className="w-3.5 h-3.5 text-[#b87324] animate-spin" />
                  <span className="text-[11px] font-bold">Checking...</span>
                </div>
              )}

              {/* 2. Green Tick Mark when Matched */}
              {!isSearching && matchedCustomer && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#22c55e] text-white shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                  <span className="text-[11px] font-bold">Matched</span>
                </div>
              )}

              {/* 3. Not Found Indicator */}
              {!isSearching && searchFailed && searchMobile.length === 10 && (
                <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-300 px-2 py-0.5 rounded-md">
                  Not Found
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Test Chips */}
        {!matchedCustomer && customers.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap text-xs pt-0.5 transition-all">
            <span className="text-[11px] font-medium text-[#7a5328]">Quick select:</span>
            {customers.slice(0, 3).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleQuickSelect(c.mobile)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition-all border cursor-pointer ${
                  searchMobile === c.mobile
                    ? 'bg-[#d0872e] text-white border-[#d0872e] font-bold shadow-xs'
                    : 'bg-[#fff8ea] text-[#6d3e16] border-[#dfbe7e] hover:bg-[#faecd4]'
                }`}
              >
                {c.mobile} ({c.name.split(' ')[0]})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* =========================================================================
          MATCHED CUSTOMER DETAILS CARD (PHOTO, NAME, MOBILE, ACCOUNT NUMBER)
          ========================================================================= */}
      {matchedCustomer ? (
        <div className="bg-gradient-to-b from-[#fffefc] via-[#fbf5e7] to-[#f4e4c2] border-2 border-[#dfbe7e] rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Profile Picture */}
              <div className="relative shrink-0">
                {matchedCustomer.photo ? (
                  <img
                    src={matchedCustomer.photo}
                    alt={matchedCustomer.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#d4a852] shadow-xs"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#ffecc3] to-[#fadca0] border-2 border-[#d4a852] flex items-center justify-center font-bold text-[#55361e] text-sm shadow-xs font-serif">
                    {matchedCustomer.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 bg-[#22c55e] text-white p-0.5 rounded-full border-2 border-white shadow-xs">
                  <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                </div>
              </div>

              {/* Name & Customer ID */}
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-extrabold text-[#46280b] text-base leading-tight font-serif">
                    {matchedCustomer.name}
                  </h3>
                  <span className="text-[10px] font-bold bg-[#faecd4] text-[#8a5416] px-1.5 py-0.5 rounded-md border border-[#dfbe7e]">
                    Verified KYC
                  </span>
                </div>
                <div className="text-xs text-[#7a5328] font-mono mt-0.5">
                  ID: <span className="font-semibold text-[#b87324]">{matchedCustomer.id}</span>
                </div>
              </div>
            </div>

            {/* Location Pill */}
            <span className="text-[11px] font-semibold text-[#7a5328] bg-white/80 px-2 py-1 rounded-lg border border-[#dfbe7e] shrink-0">
              {matchedCustomer.district}, {matchedCustomer.state}
            </span>
          </div>

          {/* Details Grid: Mobile Number & Bank Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#dfbe7e]/50 text-xs">
            <div className="bg-white/90 p-2.5 rounded-xl border border-[#dfbe7e]/70 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#faecd4] text-[#8a5416] flex items-center justify-center shrink-0 border border-[#dfbe7e]/40">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-[#7a5328] uppercase font-bold block">Mobile Number</span>
                <span className="font-extrabold text-[#46280b] font-mono text-xs">
                  +91 {matchedCustomer.mobile}
                </span>
              </div>
            </div>

            <div className="bg-white/90 p-2.5 rounded-xl border border-[#dfbe7e]/70 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#faecd4] text-[#8a5416] flex items-center justify-center shrink-0 border border-[#dfbe7e]/40">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-[#7a5328] uppercase font-bold block">Bank & Account</span>
                <span className="font-extrabold text-[#46280b] font-mono text-xs truncate block">
                  {matchedCustomer.bankName} • {matchedCustomer.accountNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Bank Holder & IFSC Footer */}
          <div className="flex items-center justify-between text-[11px] text-[#7a5328] px-1 pt-0.5">
            <span>
              Bank Holder: <strong className="text-[#46280b] font-semibold">{matchedCustomer.bankHolderName}</strong>
            </span>
            <span>
              IFSC: <strong className="font-mono text-[#46280b] font-semibold">{matchedCustomer.ifscCode}</strong>
            </span>
          </div>
        </div>
      ) : searchFailed && searchMobile.length === 10 ? (
        <div className="bg-rose-50 border border-rose-300 rounded-2xl p-3.5 text-xs text-rose-800 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">No Registered Customer (+91 {searchMobile})</div>
            <div className="text-rose-700/90 mt-0.5 leading-relaxed">
              No registered customer was found with this 10-digit mobile number. Please double check the number or register this customer first from the Add Customer screen.
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#fff8ea] border-2 border-[#dfbe7e] rounded-2xl p-3.5 text-xs text-[#55361e] flex items-start gap-2.5">
          <Phone className="w-4 h-4 text-[#8a5416] shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-[#46280b]">Customer Enrollment Search</div>
            <div className="text-[#7a5328] mt-0.5 leading-relaxed">
              Enter any 10-digit mobile number above. The system will search in real time and display the verified profile picture, name, mobile, and bank account details.
            </div>
          </div>
        </div>
      )}

      {/* Selected Plan Snapshot Bar - Deep Bronze Hero Style matching Home Screen */}
      <div className="bg-gradient-to-r from-[#2c180a] via-[#4a280e] to-[#6d3e16] text-white rounded-2xl p-3.5 flex items-center justify-between border-2 border-[#dfbe7e] shadow-sm">
        <div>
          <span className="text-[10px] font-bold text-[#fed788] uppercase tracking-wider block">
            Plan Selected
          </span>
          <span className="text-sm sm:text-base font-extrabold text-white font-serif">
            {plan.name} <span className="text-xs text-[#ffd485]/80 font-normal">({plan.category} Tier)</span>
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-[#dfbe7e] block">Required Investment</span>
          <span className="text-base sm:text-lg font-black font-mono text-[#ffd485]">
            ₹{plan.amount.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Yield Breakdown Calculator - Palace Gold Card matching Home Screen */}
      <div className="bg-gradient-to-b from-[#fffefc] via-[#fbf5e7] to-[#f4e4c2] rounded-2xl p-4 border-2 border-[#dfbe7e] shadow-2xs space-y-3">
        <h4 className="font-bold text-[#46280b] text-sm flex items-center gap-1.5 font-serif">
          <Coins className="w-4 h-4 text-[#8a5416]" />
          <span>Earnings & Payout Projection</span>
        </h4>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="bg-white/95 p-2.5 rounded-xl border border-[#dfbe7e]/70">
            <span className="text-[#7a5328] block mb-0.5">Plan Duration</span>
            <span className="text-sm font-extrabold text-[#46280b] flex items-center gap-1 font-mono">
              <Calendar className="w-3.5 h-3.5 text-[#8a5416]" />
              <span>{plan.durationDays} Days</span>
            </span>
          </div>

          <div className="bg-white/95 p-2.5 rounded-xl border border-[#dfbe7e]/70">
            <span className="text-[#7a5328] block mb-0.5">Daily Return</span>
            <span className="text-sm font-extrabold text-[#b87324] font-mono">
              ₹{plan.dailyEarnings.toFixed(2)}/day
            </span>
          </div>

          <div className="bg-white/95 p-2.5 rounded-xl border border-[#dfbe7e]/70">
            <span className="text-[#7a5328] block mb-0.5">Total ROI Rate</span>
            <span className="text-sm font-extrabold text-[#22c55e] font-mono">
              +{plan.roiPercentage}%
            </span>
          </div>

          <div className="bg-gradient-to-br from-[#2c180a] to-[#4a280e] text-white p-2.5 rounded-xl border border-[#dfbe7e]">
            <span className="text-[#dfbe7e] font-semibold block mb-0.5">Total Maturity Payout</span>
            <span className="text-sm font-black text-[#ffd485] font-mono">
              ₹{totalMaturity.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Wallet Balance Verification Card */}
      <div className="bg-gradient-to-b from-[#fffefc] via-[#fbf5e7] to-[#f4e4c2] rounded-2xl p-3.5 border-2 border-[#dfbe7e] shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#ffecc3] to-[#fadca0] flex items-center justify-center text-[#55361e] border-2 border-[#d4a852]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-[#7a5328] block">Your Wallet Balance</span>
            <span className="text-sm font-black text-[#46280b] font-mono">
              ₹{stats.walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {!isBalanceEnough && (
          <button
            onClick={onOpenDeposit}
            className="flex items-center gap-1 text-xs font-bold bg-[#D0872E] hover:bg-[#b87324] text-white px-3 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3 h-3 stroke-[3]" />
            <span>Add Money</span>
          </button>
        )}
      </div>

      {/* Validation error notice if no customer selected */}
      {validationError && (
        <div className="bg-rose-50 border border-rose-300 text-rose-800 text-xs p-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Confirm & Join Button CTA -> #D0872E */}
      <div className="pt-1">
        <button
          onClick={handleJoinClick}
          className={`w-full py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 cursor-pointer ${
            isBalanceEnough
              ? 'bg-[#D0872E] hover:bg-[#b87324] text-white shadow-[#d0872e]/30'
              : 'bg-[#894B0A] hover:bg-[#723e07] text-white shadow-[#894b0a]/30'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#fed788]" />
          <span>
            {isBalanceEnough
              ? matchedCustomer
                ? `Confirm & Join for ${matchedCustomer.name.split(' ')[0]} (₹${plan.amount.toLocaleString('en-IN')})`
                : `Confirm & Join Plan (₹${plan.amount.toLocaleString('en-IN')})`
              : `Insufficient Balance (Add ₹${(plan.amount - stats.walletBalance).toLocaleString('en-IN')})`}
          </span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
