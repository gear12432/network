'use client';

import React, { useState } from 'react';
import { InvestmentPlan, UserStats, Customer } from '@/types/investment';
import {
  ShieldCheck,
  Calendar,
  Coins,
  CheckCircle2,
  Sparkles,
  Phone,
  Building2,
  AlertCircle,
  Plus,
  Loader2,
  UserCheck,
  ArrowRight,
  TrendingUp,
  Lock,
} from 'lucide-react';
import { triggerConfetti } from '@/lib/confetti';

interface ConfirmInvestContentProps {
  plan?: InvestmentPlan | null;
  customer?: Customer | null;
  stats?: UserStats;
  userStats?: UserStats;
  onConfirmInvest?: (plan: InvestmentPlan, customer: Customer) => void;
  onOpenDeposit?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
}

export default function ConfirmInvestContent({
  plan,
  customer,
  stats,
  userStats,
  onConfirmInvest,
  onOpenDeposit,
  onCancel: _onCancel,
  onClose,
}: ConfirmInvestContentProps) {
  const currentStats = stats || userStats || ({ walletBalance: 0, userName: 'Member', userInitials: 'GK' } as any);
  const [isActivating, setIsActivating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!plan || !customer) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-900 shadow-sm">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h4 className="font-bold text-slate-900 text-base font-sans">Incomplete Investment Data</h4>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          Both an investment plan and a verified customer must be selected to proceed.
        </p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          Return to Plan
        </button>
      </div>
    );
  }

  const isBalanceEnough = (currentStats.walletBalance ?? 0) >= plan.amount;
  const remainingBalance = (currentStats.walletBalance ?? 0) - plan.amount;
  const netProfit = (plan.amount * plan.roiPercentage) / 100;
  const totalMaturity = plan.amount + netProfit;

  const handleConfirm = () => {
    if (!isBalanceEnough) {
      if (onOpenDeposit) onOpenDeposit();
      return;
    }

    setIsActivating(true);

    setTimeout(() => {
      setIsActivating(false);
      setIsSuccess(true);
      triggerConfetti();

      setTimeout(() => {
        if (onConfirmInvest) onConfirmInvest(plan, customer);
        if (onClose) onClose();
      }, 1500);
    }, 900);
  };

  return (
    <div className="space-y-4 text-slate-900">
      {/* Top Banner Notice - Clean White Hero Banner */}
      <div className="bg-white text-slate-900 rounded-2xl p-4 shadow-xs flex items-center justify-between border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-blue-600 block">
              Final Plan Confirmation
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 font-sans">
              Activate Plan for Customer
            </h3>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-500 block">Status</span>
          <span className="text-xs font-extrabold bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Verified
          </span>
        </div>
      </div>

      {/* 1. Customer Details Card - Clean White Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 font-sans">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span>Target Customer Details</span>
          </h4>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            KYC Verified
          </span>
        </div>

        <div className="flex items-start gap-3.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          {/* Customer Profile Picture */}
          <div className="relative shrink-0">
            {customer.photo ? (
              <img
                src={customer.photo}
                alt={customer.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-blue-500 shadow-xs"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-blue-600 text-white font-black text-lg flex items-center justify-center border-2 border-white shadow-xs uppercase font-sans">
                {customer.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full border-2 border-white shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="font-extrabold text-slate-900 text-base leading-tight font-sans">
                {customer.name}
              </h3>
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                {customer.id}
              </span>
            </div>

            <div className="text-xs text-slate-500 font-medium mt-1">
              {customer.district}, {customer.state}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200 text-xs">
              <div className="flex items-center gap-1.5 text-slate-900 font-mono font-bold">
                <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>+91 {customer.mobile}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-900 font-mono truncate">
                <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">{customer.bankName} • {customer.accountNumber}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
          <span>Holder: <strong className="text-slate-900">{customer.bankHolderName}</strong></span>
          <span>IFSC: <strong className="font-mono text-slate-900">{customer.ifscCode}</strong></span>
        </div>
      </div>

      {/* 2. Selected Investment Plan Details Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 font-sans">
            <Coins className="w-4 h-4 text-blue-600" />
            <span>Plan Details & Yield Terms</span>
          </h4>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            {plan.category} Tier Plan
          </span>
        </div>

        {/* Plan Header Strip - White Card */}
        <div className="bg-blue-600 text-white rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <h3 className="text-base sm:text-lg font-black font-sans">{plan.name}</h3>
            <p className="text-[11px] text-blue-100 mt-0.5">{plan.description}</p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] text-blue-200 block uppercase">Investment</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-white">
              ₹{plan.amount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Breakdown Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Duration</span>
            <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1 mt-0.5 font-mono">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>{plan.durationDays} Days</span>
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Daily Income</span>
            <span className="font-extrabold text-blue-600 font-mono text-sm mt-0.5 block">
              ₹{plan.dailyEarnings.toFixed(2)}
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Return ROI</span>
            <span className="font-extrabold text-emerald-600 font-mono text-sm mt-0.5 block">
              +{plan.roiPercentage}%
            </span>
          </div>

          <div className="bg-slate-900 text-white p-2.5 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Maturity Payout</span>
            <span className="font-black text-amber-400 font-mono text-sm mt-0.5 block">
              ₹{totalMaturity.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Wallet Deduction & Settlement Summary */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2.5 text-xs">
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 font-sans">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Ledger & Balance Settlement</span>
        </h4>

        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-slate-600">
            <span>Current Wallet Balance</span>
            <span className="font-mono font-bold text-slate-900">
              ₹{(currentStats.walletBalance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center justify-between text-rose-600 font-semibold">
            <span>Plan Investment Amount</span>
            <span className="font-mono font-bold">
              - ₹{plan.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="border-t border-slate-200 pt-1.5 flex items-center justify-between font-bold">
            <span className="text-slate-900">Remaining Balance After Activation</span>
            <span className={`font-mono text-sm ${isBalanceEnough ? 'text-emerald-600' : 'text-rose-600'}`}>
              ₹{remainingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="bg-blue-50/60 p-2.5 rounded-xl border border-blue-100 text-[11px] text-slate-700 flex items-start gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>
            First daily ROI will be credited to wallet automatically tonight at 00:00 IST. Payouts are guaranteed and can be withdrawn directly to the customer&apos;s linked bank account.
          </span>
        </div>
      </div>

      {/* 4. Action CTA: Confirm Invest Button -> Blue Button */}
      <div className="pt-2">
        {isSuccess ? (
          <div className="w-full py-4 bg-emerald-600 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-lg animate-pulse">
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            <span>Plan Activated for {customer.name}!</span>
          </div>
        ) : isActivating ? (
          <div className="w-full py-4 bg-blue-700 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-lg">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
            <span>Activating {plan.name} for {customer.name}...</span>
          </div>
        ) : isBalanceEnough ? (
          <button
            onClick={handleConfirm}
            className="w-full py-4 rounded-xl font-black text-sm bg-blue-600 hover:bg-blue-700 active:scale-98 text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/30 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-blue-200" />
            <span>Confirm</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        ) : (
          <button
            onClick={onOpenDeposit}
            className="w-full py-4 rounded-xl font-black text-sm bg-blue-800 hover:bg-blue-900 active:scale-98 text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-800/30 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>
              Insufficient Balance (Recharge ₹{(plan.amount - (currentStats.walletBalance ?? 0)).toLocaleString('en-IN')})
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

