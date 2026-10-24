'use client';

import React, { useState, useRef, useEffect } from 'react';
import { InvestmentPlan, UserStats, Customer } from '@/types/investment';
import {
  ShieldCheck,
  Calendar,
  Coins,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Plus,
  Phone,
  Loader2,
  X,
  Building2,
  ArrowRight,
} from 'lucide-react';

interface PlanDetailContentProps {
  plan: InvestmentPlan | null;
  stats: UserStats;
  customers: Customer[];
  onProceedToConfirm: (plan: InvestmentPlan, customer: Customer) => void;
  onConfirmInvest: (plan: InvestmentPlan, linkedCustomer?: Customer) => void;
  onOpenDeposit: () => void;
  onClose: () => void;
}

export default function PlanDetailContent({
  plan,
  stats,
  customers = [],
  onProceedToConfirm,
  onOpenDeposit,
}: PlanDetailContentProps) {
  const [searchMobile, setSearchMobile] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [matchedCustomer, setMatchedCustomer] = useState<Customer | null>(null);
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

  const isBalanceEnough = stats.walletBalance >= plan.amount;
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

      // Smooth simulated network search delay showing the spinning circular loader
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
      }, 550);
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
    <div className="space-y-4 text-[#ffeec9]">
      {/* =========================================================================
          CUSTOMER 10-DIGIT MOBILE SEARCH BAR WITH FLOATING OUTLINED LABEL
          ========================================================================= */}
      <div className="space-y-2 pt-1">
        <div className="relative w-full pt-1.5">
          <div className="relative flex items-center w-full min-h-[52px] h-[52px] sm:min-h-[56px] sm:h-14 bg-[#28170c] rounded-xl transition-all duration-200 border border-[#dfbe7e]/35 hover:border-[#dfbe7e]/60 focus-within:border-[#d0872e] focus-within:ring-2 focus-within:ring-[#d0872e]/30">
            {/* Left Icon */}
            <div className="absolute left-3.5 z-10 flex items-center justify-center pointer-events-none text-[#dfbe7e]">
              <Phone className="w-4 h-4" />
            </div>

            {/* Optional Prefix */}
            <span className="absolute left-10 text-xs sm:text-sm font-mono text-[#ffd485] font-bold pointer-events-none">
              +91
            </span>

            {/* Outlined Floating Label on Top Border */}
            <label className="absolute -top-2.5 left-3 px-1.5 py-0 bg-[#28170c] text-xs font-bold text-[#ffd485] tracking-wide pointer-events-none select-none z-10 rounded-sm shadow-xs">
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
              className="w-full bg-transparent text-white font-mono font-bold text-sm sm:text-base focus:outline-none pl-18 pr-28 py-2.5 [color-scheme:dark]"
              placeholder="Enter mobile..."
            />

            {/* Right Action Elements */}
            <div className="absolute right-3 flex items-center gap-2">
              {searchMobile.length > 0 && !isSearching && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-1 rounded-md text-[#dfbe7e]/70 hover:text-white hover:bg-[#3a200f] transition-colors cursor-pointer"
                  title="Clear input"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* 1. Circular Spinning Progress Loader */}
              {isSearching && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#3a200f] text-[#ffd485] border border-[#dfbe7e]/40 shadow-xs">
                  <Loader2 className="w-3.5 h-3.5 text-[#ffd485] animate-spin" />
                  <span className="text-[11px] font-bold">Checking...</span>
                </div>
              )}

              {/* 2. Green Tick Mark when Matched */}
              {!isSearching && matchedCustomer && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#22c55e] text-white shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                  <span className="text-[11px] font-bold">Matched</span>
                </div>
              )}

              {/* 3. Not Found Indicator */}
              {!isSearching && searchFailed && searchMobile.length === 10 && (
                <span className="text-[11px] font-bold text-rose-300 bg-rose-950/60 border border-rose-700/50 px-2 py-0.5 rounded-md">
                  Not Found
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Test Chips */}
        {!matchedCustomer && customers.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap text-xs pt-0.5 transition-all">
            <span className="text-[11px] font-medium text-[#cbb290]">Quick select:</span>
            {customers.slice(0, 3).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleQuickSelect(c.mobile)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition-all border cursor-pointer ${
                  searchMobile === c.mobile
                    ? 'bg-[#d0872e] text-white border-[#d0872e] font-bold shadow-xs'
                    : 'bg-[#28170c] text-[#ffd485] border-[#dfbe7e]/35 hover:bg-[#3a200f] hover:border-[#dfbe7e]'
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
        <div className="bg-[#28170c] border border-[#dfbe7e]/35 rounded-xl p-4 shadow-md space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Profile Picture */}
              <div className="relative shrink-0">
                {matchedCustomer.photo ? (
                  <img
                    src={matchedCustomer.photo}
                    alt={matchedCustomer.name}
                    className="w-13 h-13 rounded-full object-cover border-2 border-[#d0872e] shadow-xs"
                  />
                ) : (
                  <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#894b0a] via-[#d0872e] to-[#ffd485] text-[#2b1706] font-black text-base flex items-center justify-center border-2 border-[#dfbe7e] shadow-xs uppercase tracking-tight font-serif">
                    {matchedCustomer.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 bg-[#22c55e] text-white p-0.5 rounded-full border-2 border-[#28170c] shadow-xs">
                  <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                </div>
              </div>

              {/* Name & Customer ID */}
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-extrabold text-white text-base leading-tight font-serif">
                    {matchedCustomer.name}
                  </h3>
                  <span className="text-[10px] font-bold bg-[#4e2e0f] text-[#fed788] px-1.5 py-0.5 rounded-md border border-[#dfbe7e]/40">
                    Verified KYC
                  </span>
                </div>
                <div className="text-xs text-[#cbb290] font-mono mt-0.5">
                  ID: <span className="font-semibold text-[#ffd485]">{matchedCustomer.id}</span>
                </div>
              </div>
            </div>

            {/* Location Pill */}
            <span className="text-[11px] font-semibold text-[#dfbe7e] bg-[#1c1007] px-2 py-1 rounded-lg border border-[#dfbe7e]/30 shrink-0">
              {matchedCustomer.district}, {matchedCustomer.state}
            </span>
          </div>

          {/* Details Grid: Mobile Number & Bank Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#dfbe7e]/25 text-xs">
            <div className="bg-[#1c1007] p-2.5 rounded-lg border border-[#dfbe7e]/25 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#3a200f] text-[#ffd485] flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-[#a08a6b] uppercase font-bold block">Mobile Number</span>
                <span className="font-extrabold text-white font-mono text-xs">
                  +91 {matchedCustomer.mobile}
                </span>
              </div>
            </div>

            <div className="bg-[#1c1007] p-2.5 rounded-lg border border-[#dfbe7e]/25 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#3a200f] text-[#ffd485] flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-[#a08a6b] uppercase font-bold block">Bank & Account</span>
                <span className="font-extrabold text-white font-mono text-xs truncate block">
                  {matchedCustomer.bankName} • {matchedCustomer.accountNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Bank Holder & IFSC Footer */}
          <div className="flex items-center justify-between text-[11px] text-[#cbb290] px-1 pt-0.5">
            <span>
              Bank Holder: <strong className="text-white font-semibold">{matchedCustomer.bankHolderName}</strong>
            </span>
            <span>
              IFSC: <strong className="font-mono text-white font-semibold">{matchedCustomer.ifscCode}</strong>
            </span>
          </div>
        </div>
      ) : searchFailed && searchMobile.length === 10 ? (
        <div className="bg-rose-950/40 border border-rose-800/40 rounded-xl p-3.5 text-xs text-rose-300 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">No Registered Customer (+91 {searchMobile})</div>
            <div className="text-rose-200/80 mt-0.5 leading-relaxed">
              No registered customer was found with this 10-digit mobile number. Please double check the number or register this customer first from the Add Customer screen.
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#28170c]/90 border border-[#dfbe7e]/30 rounded-xl p-3.5 text-xs text-[#ffeec9] flex items-start gap-2.5">
          <Phone className="w-4 h-4 text-[#ffd485] shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-white">Customer Enrollment Search</div>
            <div className="text-[#cbb290] mt-0.5 leading-relaxed">
              Enter any 10-digit mobile number above. The system will search in real time and display the verified profile picture, name, mobile, and bank account details.
            </div>
          </div>
        </div>
      )}

      {/* Selected Plan Snapshot Bar */}
      <div className="bg-gradient-to-r from-[#3b200b] via-[#5c3516] to-[#8f5624] text-white rounded-xl p-3.5 flex items-center justify-between border border-[#dfbe7e]/40 shadow-md">
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

      {/* Yield Breakdown Calculator */}
      <div className="bg-[#28170c] rounded-xl p-4 border border-[#dfbe7e]/35 shadow-md space-y-3">
        <h4 className="font-bold text-white text-sm flex items-center gap-1.5 font-serif">
          <Coins className="w-4 h-4 text-[#ffd485]" />
          <span>Earnings & Payout Projection</span>
        </h4>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="bg-[#1c1007] p-2.5 rounded-lg border border-[#dfbe7e]/20">
            <span className="text-[#a08a6b] block mb-0.5">Plan Duration</span>
            <span className="text-sm font-extrabold text-white flex items-center gap-1 font-mono">
              <Calendar className="w-3.5 h-3.5 text-[#dfbe7e]" />
              <span>{plan.durationDays} Days</span>
            </span>
          </div>

          <div className="bg-[#1c1007] p-2.5 rounded-lg border border-[#dfbe7e]/20">
            <span className="text-[#a08a6b] block mb-0.5">Daily Return</span>
            <span className="text-sm font-extrabold text-[#ffd485] font-mono">
              ₹{plan.dailyEarnings.toFixed(2)}/day
            </span>
          </div>

          <div className="bg-[#1c1007] p-2.5 rounded-lg border border-[#dfbe7e]/20">
            <span className="text-[#a08a6b] block mb-0.5">Total ROI Rate</span>
            <span className="text-sm font-extrabold text-[#fed788] font-mono">
              +{plan.roiPercentage}%
            </span>
          </div>

          <div className="bg-gradient-to-br from-[#4e2e0f] to-[#361c06] p-2.5 rounded-lg border border-[#dfbe7e]/45">
            <span className="text-[#dfbe7e] font-semibold block mb-0.5">Total Maturity Payout</span>
            <span className="text-sm font-black text-[#ffd485] font-mono">
              ₹{totalMaturity.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Wallet Balance Verification Card */}
      <div className="bg-[#28170c] rounded-xl p-3.5 border border-[#dfbe7e]/35 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#3a200f] flex items-center justify-center text-[#ffd485] border border-[#dfbe7e]/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-[#a08a6b] block">Your Wallet Balance</span>
            <span className="text-sm font-black text-[#ffd485] font-mono">
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
        <div className="bg-amber-950/50 border border-amber-700/50 text-amber-200 text-xs p-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
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
