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
  plan: InvestmentPlan | null;
  customer: Customer | null;
  stats: UserStats;
  onConfirmInvest: (plan: InvestmentPlan, customer: Customer) => void;
  onOpenDeposit: () => void;
  onClose: () => void;
}

export default function ConfirmInvestContent({
  plan,
  customer,
  stats,
  onConfirmInvest,
  onOpenDeposit,
  onClose,
}: ConfirmInvestContentProps) {
  const [isActivating, setIsActivating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!plan || !customer) {
    return (
      <div className="p-8 text-center bg-[#28170c] rounded-2xl border border-[#dfbe7e]/30 text-[#ffeec9]">
        <AlertCircle className="w-10 h-10 text-[#ffd485] mx-auto mb-3" />
        <h4 className="font-bold text-white text-base font-serif">Incomplete Investment Data</h4>
        <p className="text-xs text-[#cbb290] mt-1 mb-4">
          Both an investment plan and a verified customer must be selected to proceed.
        </p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-[#D0872E] hover:bg-[#b87324] text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          Return to Plan
        </button>
      </div>
    );
  }

  const isBalanceEnough = stats.walletBalance >= plan.amount;
  const remainingBalance = stats.walletBalance - plan.amount;
  const netProfit = (plan.amount * plan.roiPercentage) / 100;
  const totalMaturity = plan.amount + netProfit;

  const handleConfirm = () => {
    if (!isBalanceEnough) {
      onOpenDeposit();
      return;
    }

    setIsActivating(true);

    setTimeout(() => {
      setIsActivating(false);
      setIsSuccess(true);
      triggerConfetti();

      setTimeout(() => {
        onConfirmInvest(plan, customer);
        onClose();
      }, 1500);
    }, 900);
  };

  return (
    <div className="space-y-4 text-[#ffeec9]">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-[#3b200b] via-[#5c3516] to-[#8f5624] text-white rounded-2xl p-4 shadow-md flex items-center justify-between border border-[#dfbe7e]/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#28170c] border border-[#dfbe7e]/40 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-[#ffd485]" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-[#fed788] block">
              Final Plan Confirmation
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-white font-serif">
              Activate Plan for Customer
            </h3>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-[#dfbe7e] block">Status</span>
          <span className="text-xs font-extrabold bg-[#28170c] border border-[#dfbe7e]/40 text-[#ffd485] px-2 py-0.5 rounded-full inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-ping" />
            Verified
          </span>
        </div>
      </div>

      {/* 1. Customer Details Card */}
      <div className="bg-[#28170c] rounded-2xl p-4 border border-[#dfbe7e]/35 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-[#ffd485] uppercase tracking-wider flex items-center gap-1.5 font-serif">
            <UserCheck className="w-4 h-4 text-[#ffd485]" />
            <span>Target Customer Details</span>
          </h4>
          <span className="text-[10px] font-bold text-[#fed788] bg-[#4e2e0f] px-2 py-0.5 rounded-full border border-[#dfbe7e]/40">
            KYC Verified
          </span>
        </div>

        <div className="flex items-start gap-3.5 bg-[#1c1007] p-3.5 rounded-xl border border-[#dfbe7e]/25">
          {/* Customer Profile Picture */}
          <div className="relative shrink-0">
            {customer.photo ? (
              <img
                src={customer.photo}
                alt={customer.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-[#d0872e] shadow-xs"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#894b0a] via-[#d0872e] to-[#ffd485] text-[#2b1706] font-black text-lg flex items-center justify-center border-2 border-[#dfbe7e] shadow-xs uppercase font-serif">
                {customer.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 bg-[#22c55e] text-white p-0.5 rounded-full border-2 border-[#1c1007] shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="font-extrabold text-white text-base leading-tight font-serif">
                {customer.name}
              </h3>
              <span className="text-xs font-mono font-bold text-[#ffd485] bg-[#28170c] px-2 py-0.5 rounded-md border border-[#dfbe7e]/30">
                {customer.id}
              </span>
            </div>

            <div className="text-xs text-[#cbb290] font-medium mt-1">
              {customer.district}, {customer.state}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#dfbe7e]/20 text-xs">
              <div className="flex items-center gap-1.5 text-white font-mono font-bold">
                <Phone className="w-3.5 h-3.5 text-[#ffd485] shrink-0" />
                <span>+91 {customer.mobile}</span>
              </div>
              <div className="flex items-center gap-1.5 text-white font-mono truncate">
                <Building2 className="w-3.5 h-3.5 text-[#ffd485] shrink-0" />
                <span className="truncate">{customer.bankName} • {customer.accountNumber}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#cbb290] px-1">
          <span>Holder: <strong className="text-white">{customer.bankHolderName}</strong></span>
          <span>IFSC: <strong className="font-mono text-white">{customer.ifscCode}</strong></span>
        </div>
      </div>

      {/* 2. Selected Investment Plan Details Card */}
      <div className="bg-[#28170c] rounded-2xl p-4 border border-[#dfbe7e]/35 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-[#ffd485] uppercase tracking-wider flex items-center gap-1.5 font-serif">
            <Coins className="w-4 h-4 text-[#ffd485]" />
            <span>Plan Details & Yield Terms</span>
          </h4>
          <span className="text-xs font-bold text-[#fed788] bg-[#4e2e0f] px-2 py-0.5 rounded-full border border-[#dfbe7e]/40">
            {plan.category} Tier Plan
          </span>
        </div>

        {/* Plan Header Strip */}
        <div className="bg-gradient-to-r from-[#3b200b] via-[#5c3516] to-[#8f5624] text-white rounded-xl p-4 flex items-center justify-between border border-[#dfbe7e]/40 shadow-xs">
          <div>
            <h3 className="text-base sm:text-lg font-black font-serif">{plan.name}</h3>
            <p className="text-[11px] text-[#ffd485]/80 mt-0.5">{plan.description}</p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] text-[#dfbe7e] block uppercase">Investment</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-[#ffd485]">
              ₹{plan.amount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Breakdown Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-[#1c1007] p-2.5 rounded-xl border border-[#dfbe7e]/20">
            <span className="text-[10px] text-[#a08a6b] font-bold uppercase block">Duration</span>
            <span className="font-extrabold text-white text-sm flex items-center gap-1 mt-0.5 font-mono">
              <Calendar className="w-3.5 h-3.5 text-[#dfbe7e]" />
              <span>{plan.durationDays} Days</span>
            </span>
          </div>

          <div className="bg-[#1c1007] p-2.5 rounded-xl border border-[#dfbe7e]/20">
            <span className="text-[10px] text-[#a08a6b] font-bold uppercase block">Daily Income</span>
            <span className="font-extrabold text-[#ffd485] font-mono text-sm mt-0.5 block">
              ₹{plan.dailyEarnings.toFixed(2)}
            </span>
          </div>

          <div className="bg-[#1c1007] p-2.5 rounded-xl border border-[#dfbe7e]/20">
            <span className="text-[10px] text-[#a08a6b] font-bold uppercase block">Total Return ROI</span>
            <span className="font-extrabold text-[#fed788] font-mono text-sm mt-0.5 block">
              +{plan.roiPercentage}%
            </span>
          </div>

          <div className="bg-gradient-to-br from-[#4e2e0f] to-[#361c06] p-2.5 rounded-xl border border-[#dfbe7e]/45">
            <span className="text-[10px] text-[#dfbe7e] font-bold uppercase block">Maturity Payout</span>
            <span className="font-black text-[#ffd485] font-mono text-sm mt-0.5 block">
              ₹{totalMaturity.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Wallet Deduction & Settlement Summary */}
      <div className="bg-[#28170c] rounded-2xl p-4 border border-[#dfbe7e]/35 shadow-md space-y-2.5 text-xs">
        <h4 className="text-xs font-bold text-[#ffd485] uppercase tracking-wider flex items-center gap-1.5 font-serif">
          <ShieldCheck className="w-4 h-4 text-[#ffd485]" />
          <span>Ledger & Balance Settlement</span>
        </h4>

        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[#cbb290]">
            <span>Current Wallet Balance</span>
            <span className="font-mono font-bold text-white">
              ₹{stats.walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center justify-between text-rose-400 font-semibold">
            <span>Plan Investment Amount</span>
            <span className="font-mono font-bold">
              - ₹{plan.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="border-t border-[#dfbe7e]/20 pt-1.5 flex items-center justify-between font-bold">
            <span className="text-white">Remaining Balance After Activation</span>
            <span className={`font-mono text-sm ${isBalanceEnough ? 'text-[#ffd485]' : 'text-rose-400'}`}>
              ₹{remainingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="bg-[#1c1007] p-2.5 rounded-xl border border-[#dfbe7e]/20 text-[11px] text-[#cbb290] flex items-start gap-2">
          <TrendingUp className="w-4 h-4 text-[#ffd485] shrink-0 mt-0.5" />
          <span>
            First daily ROI will be credited to wallet automatically tonight at 00:00 IST. Payouts are guaranteed and can be withdrawn directly to the customer&apos;s linked bank account.
          </span>
        </div>
      </div>

      {/* 4. Action CTA: Confirm Invest Button -> #D0872E */}
      <div className="pt-2">
        {isSuccess ? (
          <div className="w-full py-4 bg-[#22c55e] text-white font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-lg animate-pulse">
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            <span>Plan Activated for {customer.name}!</span>
          </div>
        ) : isActivating ? (
          <div className="w-full py-4 bg-[#3a200f] text-white font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-lg border border-[#dfbe7e]/40">
            <Loader2 className="w-5 h-5 text-[#ffd485] animate-spin" />
            <span>Activating {plan.name} for {customer.name}...</span>
          </div>
        ) : isBalanceEnough ? (
          <button
            onClick={handleConfirm}
            className="w-full py-4 rounded-xl font-black text-sm bg-[#D0872E] hover:bg-[#b87324] active:scale-98 text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#d0872e]/30 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#fed788]" />
            <span>Confirm Invest (₹{plan.amount.toLocaleString('en-IN')})</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        ) : (
          <button
            onClick={onOpenDeposit}
            className="w-full py-4 rounded-xl font-black text-sm bg-[#894B0A] hover:bg-[#723e07] active:scale-98 text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#894b0a]/30 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>
              Insufficient Balance (Recharge ₹{(plan.amount - stats.walletBalance).toLocaleString('en-IN')})
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
