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
  Search,
  Phone,
  Loader2,
  X,
  Building2,
  ArrowRight,
} from 'lucide-react';
import FloatingInput from '@/components/ui/FloatingInput';

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
      onOpenDeposit();
      return;
    }

    if (!matchedCustomer) {
      setValidationError('Please enter a 10-digit mobile number to search and verify a customer before confirming.');
      return;
    }

    setValidationError(null);
    // Open the full-screen Confirm Investment screen with smooth right-to-left slide transition
    onProceedToConfirm(plan, matchedCustomer);
  };

  return (
    <div className="space-y-4">
      {/* =========================================================================
          CUSTOMER 10-DIGIT MOBILE SEARCH BAR WITH FLOATING ANIMATED LABEL
          - Top external text removed as requested.
          - Label text is black inside the box and smoothly animates to top border on click/focus.
          ========================================================================= */}
      <div className="space-y-2 pt-1">
        {/* Floating Input with animated label */}
        <FloatingInput
          label="Customer 10-Digit Mobile Number"
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={10}
          value={searchMobile}
          onChange={handleMobileInputChange}
          leftIcon={<Phone className="w-4 h-4 text-slate-700" />}
          leftPrefix="+91"
          containerClassName="shadow-xs"
          inputClassName="font-mono tracking-wider font-bold"
          rightElement={
            <div className="flex items-center gap-2">
              {searchMobile.length > 0 && !isSearching && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  title="Clear input"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* 1. Circular Spinning Progress Loader */}
              {isSearching && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
                  <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                  <span className="text-[11px] font-bold">Checking...</span>
                </div>
              )}

              {/* 2. Green Tick Mark when Matched */}
              {!isSearching && matchedCustomer && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500 text-white shadow-xs animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-white stroke-[2.5]" />
                  <span className="text-[11px] font-bold">Matched</span>
                </div>
              )}

              {/* 3. Not Found Indicator */}
              {!isSearching && searchFailed && searchMobile.length === 10 && (
                <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                  Not Found
                </span>
              )}
            </div>
          }
        />

        {/* Quick Test Chips (HIDDEN when customer details are displayed) */}
        {!matchedCustomer && customers.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap text-xs pt-0.5 transition-all">
            <span className="text-[11px] font-medium text-slate-500">Quick select:</span>
            {customers.slice(0, 3).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleQuickSelect(c.mobile)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition-all border ${
                  searchMobile === c.mobile
                    ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-700'
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
        <div className="bg-gradient-to-br from-emerald-50/70 via-white to-slate-50 border border-emerald-200/90 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Profile Picture */}
              <div className="relative shrink-0">
                {matchedCustomer.photo ? (
                  <img
                    src={matchedCustomer.photo}
                    alt={matchedCustomer.name}
                    className="w-13 h-13 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
                  />
                ) : (
                  <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-base flex items-center justify-center border-2 border-emerald-400 shadow-xs uppercase tracking-tight">
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
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md border border-emerald-200">
                    Verified KYC
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  ID: <span className="font-semibold text-slate-700">{matchedCustomer.id}</span>
                </div>
              </div>
            </div>

            {/* Location Pill */}
            <span className="text-[11px] font-semibold text-slate-600 bg-white px-2 py-1 rounded-lg border border-slate-200 shrink-0">
              {matchedCustomer.district}, {matchedCustomer.state}
            </span>
          </div>

          {/* Details Grid: Mobile Number & Bank Account */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-emerald-100 text-xs">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Mobile Number</span>
                <span className="font-extrabold text-slate-800 font-mono text-xs">
                  +91 {matchedCustomer.mobile}
                </span>
              </div>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Bank & Account</span>
                <span className="font-extrabold text-slate-800 font-mono text-xs truncate block">
                  {matchedCustomer.bankName} • {matchedCustomer.accountNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Bank Holder & IFSC Footer */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-0.5">
            <span>
              Bank Holder: <strong className="text-slate-800 font-semibold">{matchedCustomer.bankHolderName}</strong>
            </span>
            <span>
              IFSC: <strong className="font-mono text-slate-800 font-semibold">{matchedCustomer.ifscCode}</strong>
            </span>
          </div>
        </div>
      ) : searchFailed && searchMobile.length === 10 ? (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-800 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">No Registered Customer (+91 {searchMobile})</div>
            <div className="text-slate-600 mt-0.5 leading-relaxed">
              No registered customer was found with this 10-digit mobile number. Please double check the number or register this customer first from the Add Customer screen.
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 text-xs text-slate-600 flex items-start gap-2.5">
          <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-slate-800">Customer Enrollment Search</div>
            <div className="text-slate-500 mt-0.5 leading-relaxed">
              Enter any 10-digit mobile number above. The system will search in real time and display the verified profile picture, name, mobile, and bank account details.
            </div>
          </div>
        </div>
      )}

      {/* Selected Plan Snapshot Bar */}
      <div className="bg-slate-900 text-white rounded-xl p-3.5 flex items-center justify-between border border-slate-800 shadow-xs">
        <div>
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
            Plan Selected
          </span>
          <span className="text-sm sm:text-base font-extrabold text-white">
            {plan.name} <span className="text-xs text-slate-400 font-normal">({plan.category} Tier)</span>
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 block">Required Investment</span>
          <span className="text-base sm:text-lg font-black font-mono text-emerald-400">
            ₹{plan.amount.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Yield Breakdown Calculator */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
          <Coins className="w-4 h-4 text-emerald-600" />
          <span>Earnings & Payout Projection</span>
        </h4>

        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-slate-500 block mb-0.5">Plan Duration</span>
            <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{plan.durationDays} Days</span>
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-slate-500 block mb-0.5">Daily Return</span>
            <span className="text-sm font-extrabold text-emerald-600 font-mono">
              ₹{plan.dailyEarnings.toFixed(2)}/day
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <span className="text-slate-500 block mb-0.5">Total ROI Rate</span>
            <span className="text-sm font-extrabold text-amber-500 font-mono">
              +{plan.roiPercentage}%
            </span>
          </div>

          <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
            <span className="text-emerald-700 font-semibold block mb-0.5">Total Maturity Payout</span>
            <span className="text-sm font-black text-emerald-900 font-mono">
              ₹{totalMaturity.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Wallet Balance Verification Card */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Your Wallet Balance</span>
            <span className="text-sm font-black text-slate-900 font-mono">
              ₹{stats.walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {!isBalanceEnough && (
          <button
            onClick={onOpenDeposit}
            className="flex items-center gap-1 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg transition-all shadow-xs"
          >
            <Plus className="w-3 h-3 stroke-[3]" />
            <span>Add Money</span>
          </button>
        )}
      </div>

      {/* Validation error notice if no customer selected */}
      {validationError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Confirm & Join Button CTA -> Leads to Confirm Investment Screen */}
      <div className="pt-1">
        <button
          onClick={handleJoinClick}
          className={`w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 ${
            isBalanceEnough
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
              : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
          }`}
        >
          <Sparkles className="w-4 h-4" />
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
