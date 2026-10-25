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
      <div className="p-8 text-center bg-gradient-to-b from-[#fffefc] via-[#fbf5e7] to-[#f4e4c2] rounded-3xl border-2 border-[#dfbe7e] text-[#46280b]">
        <AlertCircle className="w-10 h-10 text-[#d0872e] mx-auto mb-3" />
        <h4 className="font-bold text-[#46280b] text-base font-serif">Incomplete Investment Data</h4>
        <p className="text-xs text-[#7a5328] mt-1 mb-4">
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
    <div className="space-y-4 text-[#46280b]">
      {/* Top Banner Notice - Deep Royal Chocolate Bronze Hero Banner */}
      <div className="bg-gradient-to-r from-[#2c180a] via-[#4a280e] to-[#6d3e16] text-white rounded-2xl p-4 shadow-sm flex items-center justify-between border-2 border-[#dfbe7e]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#fff7ea] border-2 border-[#dfbe7e] flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-[#55361e]" />
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
          <span className="text-xs font-extrabold bg-[#faecd4] border border-[#dfbe7e] text-[#8a5416] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-ping" />
            Verified
          </span>
        </div>
      </div>

      {/* 1. Customer Details Card - Palace Gold Card */}
      <div className="bg-gradient-to-b from-[#fffefc] via-[#fbf5e7] to-[#f4e4c2] rounded-2xl p-4 border-2 border-[#dfbe7e] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-[#8a5416] uppercase tracking-wider flex items-center gap-1.5 font-serif">
            <UserCheck className="w-4 h-4 text-[#8a5416]" />
            <span>Target Customer Details</span>
          </h4>
          <span className="text-[10px] font-bold text-[#8a5416] bg-[#faecd4] px-2 py-0.5 rounded-full border border-[#dfbe7e]">
            KYC Verified
          </span>
        </div>

        <div className="flex items-start gap-3.5 bg-white/90 p-3.5 rounded-xl border border-[#dfbe7e]/70">
          {/* Customer Profile Picture */}
          <div className="relative shrink-0">
            {customer.photo ? (
              <img
                src={customer.photo}
                alt={customer.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-[#d0872e] shadow-xs"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#ffecc3] to-[#fadca0] text-[#55361e] font-black text-lg flex items-center justify-center border-2 border-[#d4a852] shadow-xs uppercase font-serif">
                {customer.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 bg-[#22c55e] text-white p-0.5 rounded-full border-2 border-white shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="font-extrabold text-[#46280b] text-base leading-tight font-serif">
                {customer.name}
              </h3>
              <span className="text-xs font-mono font-bold text-[#b87324] bg-[#faecd4] px-2 py-0.5 rounded-md border border-[#dfbe7e]/50">
                {customer.id}
              </span>
            </div>

            <div className="text-xs text-[#7a5328] font-medium mt-1">
              {customer.district}, {customer.state}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#dfbe7e]/40 text-xs">
              <div className="flex items-center gap-1.5 text-[#46280b] font-mono font-bold">
                <Phone className="w-3.5 h-3.5 text-[#8a5416] shrink-0" />
                <span>+91 {customer.mobile}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#46280b] font-mono truncate">
                <Building2 className="w-3.5 h-3.5 text-[#8a5416] shrink-0" />
                <span className="truncate">{customer.bankName} • {customer.accountNumber}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#7a5328] px-1">
          <span>Holder: <strong className="text-[#46280b]">{customer.bankHolderName}</strong></span>
          <span>IFSC: <strong className="font-mono text-[#46280b]">{customer.ifscCode}</strong></span>
        </div>
      </div>

      {/* 2. Selected Investment Plan Details Card */}
      <div className="bg-gradient-to-b from-[#fffefc] via-[#fbf5e7] to-[#f4e4c2] rounded-2xl p-4 border-2 border-[#dfbe7e] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-[#8a5416] uppercase tracking-wider flex items-center gap-1.5 font-serif">
            <Coins className="w-4 h-4 text-[#8a5416]" />
            <span>Plan Details & Yield Terms</span>
          </h4>
          <span className="text-xs font-bold text-[#8a5416] bg-[#faecd4] px-2 py-0.5 rounded-full border border-[#dfbe7e]">
            {plan.category} Tier Plan
          </span>
        </div>

        {/* Plan Header Strip - Royal Chocolate Hero */}
        <div className="bg-gradient-to-r from-[#2c180a] via-[#4a280e] to-[#6d3e16] text-white rounded-xl p-4 flex items-center justify-between border-2 border-[#dfbe7e] shadow-xs">
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
          <div className="bg-white/95 p-2.5 rounded-xl border border-[#dfbe7e]/70">
            <span className="text-[10px] text-[#7a5328] font-bold uppercase block">Duration</span>
            <span className="font-extrabold text-[#46280b] text-sm flex items-center gap-1 mt-0.5 font-mono">
              <Calendar className="w-3.5 h-3.5 text-[#8a5416]" />
              <span>{plan.durationDays} Days</span>
            </span>
          </div>

          <div className="bg-white/95 p-2.5 rounded-xl border border-[#dfbe7e]/70">
            <span className="text-[10px] text-[#7a5328] font-bold uppercase block">Daily Income</span>
            <span className="font-extrabold text-[#b87324] font-mono text-sm mt-0.5 block">
              ₹{plan.dailyEarnings.toFixed(2)}
            </span>
          </div>

          <div className="bg-white/95 p-2.5 rounded-xl border border-[#dfbe7e]/70">
            <span className="text-[10px] text-[#7a5328] font-bold uppercase block">Total Return ROI</span>
            <span className="font-extrabold text-[#22c55e] font-mono text-sm mt-0.5 block">
              +{plan.roiPercentage}%
            </span>
          </div>

          <div className="bg-gradient-to-br from-[#2c180a] to-[#4a280e] text-white p-2.5 rounded-xl border border-[#dfbe7e]">
            <span className="text-[10px] text-[#dfbe7e] font-bold uppercase block">Maturity Payout</span>
            <span className="font-black text-[#ffd485] font-mono text-sm mt-0.5 block">
              ₹{totalMaturity.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Wallet Deduction & Settlement Summary */}
      <div className="bg-gradient-to-b from-[#fffefc] via-[#fbf5e7] to-[#f4e4c2] rounded-2xl p-4 border-2 border-[#dfbe7e] shadow-2xs space-y-2.5 text-xs">
        <h4 className="text-xs font-bold text-[#8a5416] uppercase tracking-wider flex items-center gap-1.5 font-serif">
          <ShieldCheck className="w-4 h-4 text-[#8a5416]" />
          <span>Ledger & Balance Settlement</span>
        </h4>

        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[#7a5328]">
            <span>Current Wallet Balance</span>
            <span className="font-mono font-bold text-[#46280b]">
              ₹{stats.walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center justify-between text-rose-600 font-semibold">
            <span>Plan Investment Amount</span>
            <span className="font-mono font-bold">
              - ₹{plan.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="border-t border-[#dfbe7e]/50 pt-1.5 flex items-center justify-between font-bold">
            <span className="text-[#46280b]">Remaining Balance After Activation</span>
            <span className={`font-mono text-sm ${isBalanceEnough ? 'text-[#22c55e]' : 'text-rose-600'}`}>
              ₹{remainingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="bg-[#fff8ea] p-2.5 rounded-xl border border-[#dfbe7e] text-[11px] text-[#55361e] flex items-start gap-2">
          <TrendingUp className="w-4 h-4 text-[#8a5416] shrink-0 mt-0.5" />
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
