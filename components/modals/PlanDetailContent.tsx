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
  UserPlus,
} from 'lucide-react';

import { getAllCustomersFromFirestore } from '@/lib/firebase';

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
  const currentStats = stats || userStats || ({ walletBalance: 0, userName: 'Member', userInitials: 'GK' } as any);

  // Mobile search state - STARTS CLEAR/EMPTY as requested by user
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

  const isBalanceEnough = (currentStats?.walletBalance ?? 0) >= plan.amount;
  const netProfit = (plan.amount * plan.roiPercentage) / 100;
  const totalMaturity = plan.amount + netProfit;

  // Search logic triggered on 10-digit mobile input
  const triggerCustomerSearch = (mobileDigits: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    setValidationError(null);

    if (mobileDigits.length === 10) {
      setIsSearching(true);
      setSearchFailed(false);
      setMatchedCustomer(null);

      searchTimeoutRef.current = setTimeout(async () => {
        // 1. Search in props customers array
        let found = customers.find((c) => {
          const rawMobile = (c.mobile || '').replace(/\D/g, '');
          return rawMobile === mobileDigits || rawMobile.endsWith(mobileDigits);
        });

        // 2. Search in localStorage
        if (!found && typeof window !== 'undefined') {
          try {
            const localStr = localStorage.getItem('network_join_pro_customers');
            if (localStr) {
              const localCusts: Customer[] = JSON.parse(localStr);
              found = localCusts.find((c) => {
                const rawMobile = (c.mobile || '').replace(/\D/g, '');
                return rawMobile === mobileDigits || rawMobile.endsWith(mobileDigits);
              });
            }
          } catch {
            // ignore
          }
        }

        // 3. Search in Firestore database
        if (!found) {
          try {
            const firestoreCusts = await getAllCustomersFromFirestore();
            if (firestoreCusts && firestoreCusts.length > 0) {
              found = firestoreCusts.find((c) => {
                const rawMobile = (c.mobile || '').replace(/\D/g, '');
                return rawMobile === mobileDigits || rawMobile.endsWith(mobileDigits);
              });
            }
          } catch {
            // ignore
          }
        }

        setIsSearching(false);
        if (found) {
          setMatchedCustomer(found);
          setSearchFailed(false);
        } else {
          setMatchedCustomer(null);
          setSearchFailed(true);
        }
      }, 300);
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

  const handleJoinClick = () => {
    if (!isBalanceEnough) {
      setValidationError(
        `Insufficient balance. Please add ₹${(plan.amount - (currentStats?.walletBalance ?? 0)).toLocaleString('en-IN')} to your wallet.`
      );
      return;
    }

    if (!matchedCustomer) {
      setValidationError('Please enter a valid 10-digit customer mobile number to view customer data and proceed.');
      return;
    }

    setValidationError(null);
    if (onProceedToConfirm) {
      onProceedToConfirm(plan, matchedCustomer);
    }
  };

  return (
    <div className="space-y-4 text-slate-900 bg-white p-1 rounded-2xl">
      {/* =========================================================================
          CUSTOMER 10-DIGIT MOBILE SEARCH BAR WITH FLOATING OUTLINED LABEL
          ========================================================================= */}
      <div className="space-y-2 pt-1">
        <div className="relative w-full pt-1.5">
          <div className="relative flex items-center w-full min-h-[52px] h-[52px] sm:min-h-[56px] sm:h-14 bg-white rounded-2xl transition-all duration-200 border-2 border-slate-300 hover:border-blue-500 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20 shadow-xs">
            {/* Left Icon */}
            <div className="absolute left-3.5 z-10 flex items-center justify-center pointer-events-none text-blue-600">
              <Phone className="w-4 h-4" />
            </div>

            {/* Prefix */}
            <span className="absolute left-10 text-xs sm:text-sm font-mono text-slate-700 font-bold pointer-events-none">
              +91
            </span>

            {/* Outlined Floating Label on Top Border */}
            <label className="absolute -top-2.5 left-3 px-1.5 py-0 bg-white text-xs font-extrabold text-blue-700 tracking-wide pointer-events-none select-none z-10 rounded border border-blue-200 shadow-2xs">
              Customer 10-Digit Mobile Number
            </label>

            {/* Native Input - STARTS CLEAR/EMPTY */}
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              value={searchMobile}
              onChange={handleMobileInputChange}
              className="w-full bg-transparent text-slate-900 font-mono font-bold text-sm sm:text-base focus:outline-none pl-18 pr-28 py-2.5 placeholder:text-slate-400"
              placeholder="Enter 10-digit mobile..."
              autoFocus
            />

            {/* Right Action Elements */}
            <div className="absolute right-3 flex items-center gap-2">
              {searchMobile.length > 0 && !isSearching && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-1 rounded-md text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Clear input"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Spinning Progress Loader */}
              {isSearching && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
                  <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                  <span className="text-[11px] font-bold">Checking...</span>
                </div>
              )}

              {/* Green Tick Mark when Matched */}
              {!isSearching && matchedCustomer && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                  <span className="text-[11px] font-bold">Matched</span>
                </div>
              )}

              {/* Not Found Indicator */}
              {!isSearching && searchFailed && searchMobile.length === 10 && (
                <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-300 px-2 py-0.5 rounded-md">
                  Not Found
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MATCHED CUSTOMER DETAILS CARD (PHOTO, NAME, MOBILE, ACCOUNT NUMBER)
          Shown automatically when 10-digit mobile matches a customer
          ========================================================================= */}
      {matchedCustomer ? (
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Profile Picture */}
              <div className="relative shrink-0">
                {matchedCustomer.photo ? (
                  <img
                    src={matchedCustomer.photo}
                    alt={matchedCustomer.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 shadow-xs"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-50 border-2 border-blue-400 flex items-center justify-center font-bold text-blue-900 text-sm shadow-xs font-serif">
                    {matchedCustomer.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full border-2 border-white shadow-xs">
                  <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                </div>
              </div>

              {/* Name & Customer ID */}
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                    {matchedCustomer.name}
                  </h3>
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200">
                    Verified KYC
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  ID: <span className="font-bold text-blue-600">{matchedCustomer.id}</span>
                </div>
              </div>
            </div>

            {/* Location Pill */}
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 shrink-0">
              {matchedCustomer.district}, {matchedCustomer.state}
            </span>
          </div>

          {/* Details Grid: Mobile Number & Bank Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Mobile Number</span>
                <span className="font-extrabold text-slate-900 font-mono text-xs">
                  +91 {matchedCustomer.mobile}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Bank & Account</span>
                <span className="font-extrabold text-slate-900 font-mono text-xs truncate block">
                  {matchedCustomer.bankName} • {matchedCustomer.accountNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Bank Holder & IFSC Footer */}
          <div className="flex items-center justify-between text-[11px] text-slate-600 px-1 pt-0.5">
            <span>
              Bank Holder: <strong className="text-slate-900 font-bold">{matchedCustomer.bankHolderName}</strong>
            </span>
            <span>
              IFSC: <strong className="font-mono text-slate-900 font-bold">{matchedCustomer.ifscCode}</strong>
            </span>
          </div>
        </div>
      ) : searchFailed && searchMobile.length === 10 ? (
        <div className="bg-rose-50 border border-rose-300 rounded-2xl p-4 text-xs text-rose-800 space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-bold text-sm">No Registered Customer (+91 {searchMobile})</span>
          </div>
          <p className="text-rose-700/90 leading-relaxed">
            No customer was found with this 10-digit mobile number. You can register this customer first.
          </p>
          {onOpenAddCustomer && (
            <button
              onClick={onOpenAddCustomer}
              className="mt-1 flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add New Customer</span>
            </button>
          )}
        </div>
      ) : null}

      {/* Selected Plan Snapshot Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between border border-slate-800 shadow-sm">
        <div>
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
            Plan Selected
          </span>
          <span className="text-sm sm:text-base font-extrabold text-white font-serif">
            {plan.name} <span className="text-xs text-slate-300 font-normal">({plan.category} Tier)</span>
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 block">Required Investment</span>
          <span className="text-base sm:text-lg font-black font-mono text-amber-400">
            ₹{plan.amount.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Yield Breakdown Calculator */}
      <div className="bg-white rounded-2xl p-4 border-2 border-slate-200 shadow-2xs space-y-3">
        <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 font-serif">
          <Coins className="w-4 h-4 text-blue-600" />
          <span>Earnings & Payout Projection</span>
        </h4>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 block mb-0.5 font-medium">Plan Duration</span>
            <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1 font-mono">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>{plan.durationDays} Days</span>
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 block mb-0.5 font-medium">Daily Return</span>
            <span className="text-sm font-extrabold text-blue-600 font-mono">
              ₹{plan.dailyEarnings.toFixed(2)}/day
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 block mb-0.5 font-medium">Total ROI Rate</span>
            <span className="text-sm font-extrabold text-emerald-600 font-mono">
              +{plan.roiPercentage}%
            </span>
          </div>

          <div className="bg-slate-900 text-white p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-medium block mb-0.5">Total Maturity Payout</span>
            <span className="text-sm font-black text-amber-400 font-mono">
              ₹{totalMaturity.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Wallet Balance Verification Card */}
      <div className="bg-white rounded-2xl p-3.5 border-2 border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">Your Wallet Balance</span>
            <span className="text-sm font-black text-slate-900 font-mono">
              ₹{(currentStats?.walletBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {!isBalanceEnough && onOpenDeposit && (
          <button
            onClick={onOpenDeposit}
            className="flex items-center gap-1 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer"
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

      {/* Confirm Button CTA -> Clean Blue */}
      <div className="pt-1">
        <button
          onClick={handleJoinClick}
          className={`w-full py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 cursor-pointer ${
            isBalanceEnough
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30'
              : 'bg-slate-800 hover:bg-slate-900 text-white shadow-slate-800/30'
          }`}
        >
          <Sparkles className="w-4 h-4 text-blue-200" />
          <span>{isBalanceEnough ? 'Confirm' : 'Insufficient Balance'}</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
