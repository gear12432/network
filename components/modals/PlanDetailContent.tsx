'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
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
import { PlanCategoryIconBadge } from '@/components/modals/PurchaseHistoryContent';

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

  // Interactive amount state linked to progress line slider
  const [selectedAmount, setSelectedAmount] = useState<number>(plan?.amount || 500);

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Sync selectedAmount whenever plan changes
  useEffect(() => {
    if (plan?.amount) {
      setSelectedAmount(plan.amount);
    }
  }, [plan?.amount, plan?.id]);

  if (!plan) return null;

  // Investment Slider Limits & Calculations
  const minAmount = plan.amount || 500;
  // Maximum can scale generously up to 20x base amount or 50,000
  const maxAmount = Math.max(minAmount * 20, 50000);
  const step = minAmount <= 500 ? 50 : minAmount <= 5000 ? 100 : 500;

  // Clamped selected amount
  const clampedAmount = Math.min(maxAmount, Math.max(minAmount, selectedAmount));
  const progressPercent = Math.min(
    100,
    Math.max(0, ((clampedAmount - minAmount) / (maxAmount - minAmount)) * 100)
  );

  // Automatic Calculation Logic based on selected amount and ROI rate
  const dailyRate = plan.amount > 0 ? plan.dailyEarnings / plan.amount : (plan.roiPercentage / 100);
  const currentDailyEarnings = Math.round(clampedAmount * dailyRate * 100) / 100;
  const netProfit = Math.round(((clampedAmount * plan.roiPercentage) / 100) * 100) / 100;
  const totalMaturity = Math.round((clampedAmount + netProfit) * 100) / 100;
  const isBalanceEnough = (currentStats?.walletBalance ?? 0) >= clampedAmount;

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
        `Insufficient balance. Please add ₹${(clampedAmount - (currentStats?.walletBalance ?? 0)).toLocaleString('en-IN')} to your wallet.`
      );
      return;
    }

    if (!matchedCustomer) {
      setValidationError('Please enter a valid 10-digit customer mobile number to view customer data and proceed.');
      return;
    }

    setValidationError(null);
    if (onProceedToConfirm) {
      const customizedPlan: InvestmentPlan = {
        ...plan,
        amount: clampedAmount,
        dailyEarnings: currentDailyEarnings,
        totalReturn: totalMaturity,
      };
      onProceedToConfirm(customizedPlan, matchedCustomer);
    }
  };

  return (
    <div className="space-y-4 text-slate-900 bg-white p-1 rounded-2xl">
      {/* =========================================================================
          CUSTOMER 10-DIGIT MOBILE SEARCH BAR WITH FLOATING OUTLINED LABEL
          ========================================================================= */}
      <div className="space-y-2 pt-1">
        <div className="relative w-full pt-1.5">
          <div className="relative flex items-center w-full min-h-[52px] h-[52px] sm:min-h-[56px] sm:h-14 bg-white rounded-2xl transition-all duration-200 border-2 border-slate-300 hover:border-[#00B9F1] focus-within:border-[#002E6E] focus-within:ring-2 focus-within:ring-[#00B9F1]/20 shadow-xs">
            {/* Left Icon */}
            <div className="absolute left-3.5 z-10 flex items-center justify-center pointer-events-none text-[#002E6E]">
              <Phone className="w-4 h-4" />
            </div>

            {/* Prefix */}
            <span className="absolute left-10 text-xs sm:text-sm font-mono text-slate-700 font-bold pointer-events-none">
              +91
            </span>

            {/* Outlined Floating Label on Top Border */}
            <label className="absolute -top-2.5 left-3 px-1.5 py-0 bg-white text-xs font-extrabold text-[#002E6E] tracking-wide pointer-events-none select-none z-10 rounded border border-[#00B9F1]/40 shadow-2xs">
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
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-50 text-[#002E6E] border border-[#00B9F1]/30 shadow-2xs">
                  <Loader2 className="w-3.5 h-3.5 text-[#00B9F1] animate-spin" />
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
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#00B9F1] shadow-xs"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-50 border-2 border-[#00B9F1] flex items-center justify-center font-bold text-[#002E6E] text-sm shadow-xs font-serif">
                    {(matchedCustomer.name || 'C')
                      .split(' ')
                      .map((n) => n[0] || '')
                      .join('')
                      .slice(0, 2) || 'C'}
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
                  <span className="text-[10px] font-bold bg-[#00B9F1]/15 text-[#172B75] px-2 py-0.5 rounded-md border border-[#00B9F1]/30">
                    Verified KYC
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  ID: <span className="font-bold text-[#002E6E]">{matchedCustomer.id}</span>
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
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#002E6E] flex items-center justify-center shrink-0 border border-blue-200">
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
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#002E6E] flex items-center justify-center shrink-0 border border-blue-200">
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
              className="mt-1 flex items-center gap-1.5 px-3.5 py-2 bg-[#002E6E] hover:bg-[#002352] text-white rounded-xl font-bold text-xs transition-all cursor-pointer shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add New Customer</span>
            </button>
          )}
        </div>
      ) : null}

      {/* Selected Plan Snapshot Bar with Category Icon */}
      <div className="bg-[#002E6E] text-white rounded-2xl p-4 flex items-center justify-between border border-[#172B75] shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <PlanCategoryIconBadge
            planName={plan.name}
            category={plan.category}
            iconUrl={plan.iconUrl}
            size="md"
          />
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-[#00B9F1] uppercase tracking-wider block">
              Plan Selected
            </span>
            <span className="text-sm sm:text-base font-extrabold text-white font-serif truncate block">
              {plan.name} <span className="text-xs text-slate-300 font-normal">({plan.category} Tier)</span>
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[10px] text-slate-300 block">Required Investment</span>
          <motion.span
            key={clampedAmount}
            initial={{ scale: 1.15, color: '#00B9F1' }}
            animate={{ scale: 1, color: '#FBBF24' }}
            transition={{ duration: 0.2 }}
            className="text-base sm:text-lg font-black font-mono inline-block"
          >
            ₹{clampedAmount.toLocaleString('en-IN')}
          </motion.span>
        </div>
      </div>

      {/* =========================================================================
          EARNINGS & PAYOUT PROJECTION CARD WITH INTERACTIVE PROGRESS LINE SLIDER
          Progress Line Track Color: #00B9F1
          Selected Progress Amount Color: #172B75
          Smooth Animated Fluid Drag & Auto Calculation of Daily Return & Total Payout
          ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 border-2 border-slate-200 shadow-2xs space-y-3.5">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-[#172B75] text-sm flex items-center gap-1.5 font-serif">
            <Coins className="w-4 h-4 text-[#002E6E]" />
            <span>Earnings & Payout Projection</span>
          </h4>
          <span className="text-xs font-mono font-bold text-[#172B75] bg-[#00B9F1]/15 px-2.5 py-0.5 rounded-full border border-[#00B9F1]/40">
            ₹{clampedAmount.toLocaleString('en-IN')}
          </span>
        </div>

        {/* --- DYNAMIC INTERACTIVE PROGRESS LINE SLIDER --- */}
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Investment Scale</span>
            <span className="text-[11px] font-bold text-[#002E6E] font-mono">
              Rate: <span className="text-[#00B9F1]">+{plan.roiPercentage}%</span>
            </span>
          </div>

          {/* Slider Container with Custom Colored Track (#00B9F1) & Fill (#172B75) */}
          <div className="relative w-full py-2 flex items-center">
            {/* Base Progress Line / Track in #00B9F1 */}
            <div className="w-full h-3 rounded-full bg-[#00B9F1] overflow-hidden relative shadow-inner">
              {/* Selected Amount Progress Bar in #172B75 with smooth spring animation */}
              <motion.div
                className="h-full bg-[#172B75] rounded-l-full"
                style={{ width: `${progressPercent}%` }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            </div>

            {/* Custom Interactive Thumb Knob (Selected color #172B75 with #00B9F1 border) */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#172B75] border-2 border-white ring-2 ring-[#00B9F1] shadow-md flex items-center justify-center pointer-events-none z-10"
              style={{ left: `${progressPercent}%` }}
              animate={{ left: `${progressPercent}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="w-2 h-2 rounded-full bg-[#00B9F1]" />
            </motion.div>

            {/* Accessible Native Range Slider on top for smooth touch/drag */}
            <input
              type="range"
              min={minAmount}
              max={maxAmount}
              step={step}
              value={clampedAmount}
              onChange={(e) => setSelectedAmount(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              aria-label="Select Investment Amount"
            />
          </div>

          {/* Min & Max Labels with current indicator */}
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400">
            <span>Min: ₹{minAmount.toLocaleString('en-IN')}</span>
            <span className="text-[#172B75] font-extrabold">
              ₹{clampedAmount.toLocaleString('en-IN')}
            </span>
            <span>Max: ₹{maxAmount.toLocaleString('en-IN')}</span>
          </div>

          {/* Quick Preset Buttons for Instant Selection */}
          <div className="flex items-center gap-1.5 pt-1 flex-wrap">
            {[minAmount, minAmount * 2, minAmount * 5, minAmount * 10, maxAmount]
              .filter((val, i, arr) => arr.indexOf(val) === i && val <= maxAmount)
              .map((amt) => {
                const isSelected = clampedAmount === amt;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setSelectedAmount(amt)}
                    className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#172B75] text-white shadow-xs scale-105'
                        : 'bg-slate-100 text-slate-700 hover:bg-[#00B9F1]/20 hover:text-[#172B75]'
                    }`}
                  >
                    {amt === minAmount ? 'Min' : amt === maxAmount ? 'Max' : `₹${amt.toLocaleString('en-IN')}`}
                  </button>
                );
              })}
          </div>
        </div>

        {/* 4 Cards: Duration, Daily Return, Total ROI Rate, Total Maturity Payout */}
        <div className="grid grid-cols-2 gap-2.5 text-xs pt-1">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 block mb-0.5 font-medium">Plan Duration</span>
            <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1 font-mono">
              <Calendar className="w-3.5 h-3.5 text-[#002E6E]" />
              <span>{plan.durationDays} Days</span>
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 block mb-0.5 font-medium">Daily Return</span>
            <motion.span
              key={`daily-${currentDailyEarnings}`}
              initial={{ scale: 1.1, color: '#00B9F1' }}
              animate={{ scale: 1, color: '#172B75' }}
              transition={{ duration: 0.2 }}
              className="text-sm font-extrabold font-mono block"
            >
              ₹{currentDailyEarnings.toFixed(2)}/day
            </motion.span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 block mb-0.5 font-medium">Total ROI Rate</span>
            <span className="text-sm font-extrabold text-emerald-600 font-mono">
              +{plan.roiPercentage}%
            </span>
          </div>

          <div className="bg-[#172B75] text-white p-2.5 rounded-xl border border-[#002E6E]">
            <span className="text-slate-300 font-medium block mb-0.5">Total Maturity Payout</span>
            <motion.span
              key={`payout-${totalMaturity}`}
              initial={{ scale: 1.1, color: '#00B9F1' }}
              animate={{ scale: 1, color: '#FBBF24' }}
              transition={{ duration: 0.2 }}
              className="text-sm font-black font-mono block"
            >
              ₹{totalMaturity.toFixed(2)}
            </motion.span>
          </div>
        </div>
      </div>

      {/* Wallet Balance Verification Card */}
      <div className="bg-white rounded-2xl p-3.5 border-2 border-slate-200 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#002E6E] flex items-center justify-center border border-[#00B9F1]/40">
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
            className="flex items-center gap-1 text-xs font-bold bg-[#002E6E] hover:bg-[#002352] text-white px-3.5 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer"
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

      {/* Confirm Button CTA -> Requested Color #002E6E */}
      <div className="pt-1">
        <button
          onClick={handleJoinClick}
          className={`w-full py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 cursor-pointer ${
            isBalanceEnough
              ? 'bg-[#002E6E] hover:bg-[#002352] text-white shadow-[#002E6E]/30'
              : 'bg-slate-800 hover:bg-slate-900 text-white shadow-slate-800/30'
          }`}
        >
          <Sparkles className="w-4 h-4 text-[#00B9F1]" />
          <span>{isBalanceEnough ? 'Confirm' : `Insufficient Balance (Add ₹${(clampedAmount - (currentStats?.walletBalance ?? 0)).toLocaleString('en-IN')})`}</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
