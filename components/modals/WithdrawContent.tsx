'use client';

import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Building,
  CreditCard,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { triggerConfetti } from '@/lib/confetti';
import FloatingInput from '@/components/ui/FloatingInput';

interface WithdrawContentProps {
  currentBalance: number;
  onWithdrawSuccess: (amount: number, target: string) => void;
  onClose: () => void;
}

export default function WithdrawContent({
  currentBalance,
  onWithdrawSuccess,
  onClose,
}: WithdrawContentProps) {
  const [withdrawAmount, setWithdrawAmount] = useState<string>('1500');
  const [payoutType, setPayoutType] = useState<'upi' | 'bank'>('upi');
  const [upiId, setUpiId] = useState<string>('skjiyaul@okhdfcbank');
  const [bankAcc, setBankAcc] = useState<string>('501004928192');
  const [ifsc, setIfsc] = useState<string>('HDFC0000128');
  const [accHolder, setAccHolder] = useState<string>('Sk Jiyaul');

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const numAmount = parseFloat(withdrawAmount) || 0;
  const isValid = numAmount >= 100 && numAmount <= currentBalance;

  const setPercentAmount = (pct: number) => {
    const calculated = Math.floor(currentBalance * pct);
    setWithdrawAmount(calculated.toString());
  };

  const handleWithdraw = () => {
    if (!isValid) return;

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      triggerConfetti();
      const targetDesc =
        payoutType === 'upi' ? `UPI: ${upiId}` : `Bank A/C: ***${bankAcc.slice(-4)}`;
      onWithdrawSuccess(numAmount, targetDesc);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    }, 1200);
  };

  return (
    <div className="space-y-4 text-[#46280b]">
      {/* Balance Overview - Deep Royal Chocolate Hero */}
      <div className="bg-gradient-to-r from-[#2c180a] via-[#4a280e] to-[#6d3e16] text-white rounded-2xl p-4 flex items-center justify-between border-2 border-[#dfbe7e] shadow-sm">
        <div>
          <span className="text-xs text-[#fed788] block">Withdrawable Wallet Balance</span>
          <span className="text-2xl font-black text-[#ffd485] font-mono">
            ₹{currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-[#dfbe7e] block">Processing Speed</span>
          <span className="text-xs font-bold text-[#55361e] bg-[#faecd4] border border-[#dfbe7e] px-2.5 py-1 rounded-md">
            Under 60s
          </span>
        </div>
      </div>

      {/* Amount Input with floating animated label - Palace Gold Container */}
      <div className="bg-gradient-to-b from-[#fffefc] via-[#fbf5e7] to-[#f4e4c2] rounded-2xl p-4 border-2 border-[#dfbe7e] shadow-2xs space-y-3">
        <FloatingInput
          label="Withdrawal Amount (Min ₹100)"
          type="number"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          leftPrefix="₹"
          inputClassName="font-mono font-bold text-[#46280b] text-base"
        />

        {/* Quick Percent Buttons */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          {[
            { label: '25%', val: 0.25 },
            { label: '50%', val: 0.5 },
            { label: '75%', val: 0.75 },
            { label: 'Max (100%)', val: 1.0 },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={() => setPercentAmount(btn.val)}
              className="py-1.5 px-2 rounded-xl bg-white/95 hover:bg-[#faecd4] text-[#46280b] border border-[#dfbe7e] text-xs font-bold transition-colors cursor-pointer"
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Payout Channels */}
      <div className="bg-gradient-to-b from-[#fffefc] via-[#fbf5e7] to-[#f4e4c2] rounded-2xl p-4 border-2 border-[#dfbe7e] shadow-2xs space-y-3">
        <label className="text-xs font-bold text-[#7a5328] uppercase tracking-wider block">
          Select Payout Destination
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setPayoutType('upi')}
            className={`p-3 rounded-xl border-2 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              payoutType === 'upi'
                ? 'bg-[#fffdf9] border-[#D0872E] text-[#46280b] ring-1 ring-[#D0872E]/30 shadow-xs'
                : 'bg-white/80 border-[#dfbe7e]/50 text-[#7a5328]'
            }`}
          >
            <CreditCard className="w-4 h-4 text-[#8a5416]" />
            <span>Instant UPI ID</span>
          </button>

          <button
            onClick={() => setPayoutType('bank')}
            className={`p-3 rounded-xl border-2 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              payoutType === 'bank'
                ? 'bg-[#fffdf9] border-[#D0872E] text-[#46280b] ring-1 ring-[#D0872E]/30 shadow-xs'
                : 'bg-white/80 border-[#dfbe7e]/50 text-[#7a5328]'
            }`}
          >
            <Building className="w-4 h-4 text-[#8a5416]" />
            <span>Direct Bank Transfer</span>
          </button>
        </div>

        {payoutType === 'upi' ? (
          <div className="space-y-2 pt-1">
            <FloatingInput
              label="UPI Virtual ID (VPA)"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="username@bank"
              inputClassName="font-mono font-bold text-[#46280b] text-sm"
            />
            <span className="text-[10px] text-[#7a5328] block pl-1">
              Supports PhonePe, Google Pay, Paytm, BHIM & all Indian UPI apps
            </span>
          </div>
        ) : (
          <div className="space-y-2.5 pt-1">
            <FloatingInput
              label="Account Holder Full Legal Name"
              value={accHolder}
              onChange={(e) => setAccHolder(e.target.value)}
              inputClassName="font-bold text-[#46280b] text-sm"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <FloatingInput
                label="Bank Account Number"
                value={bankAcc}
                onChange={(e) => setBankAcc(e.target.value)}
                inputClassName="font-mono font-bold text-[#46280b] text-sm"
              />
              <FloatingInput
                label="IFSC Code"
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                inputClassName="font-mono font-bold text-[#46280b] text-sm uppercase"
              />
            </div>
          </div>
        )}
      </div>

      {/* Security Guarantee Note */}
      <div className="bg-[#fff8ea] text-[#55361e] rounded-xl p-3 text-xs flex items-center gap-2 border-2 border-[#dfbe7e]">
        <ShieldCheck className="w-4 h-4 text-[#8a5416] shrink-0" />
        <span>Instant Automated RTGS / IMPS Payout • Zero Deduction Fee</span>
      </div>

      {/* Withdraw CTA Button */}
      <div className="pt-1">
        {isSuccess ? (
          <div className="w-full py-4 bg-[#22c55e] text-white font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-md">
            <CheckCircle2 className="w-5 h-5" />
            <span>₹{numAmount.toLocaleString('en-IN')} Sent Successfully!</span>
          </div>
        ) : (
          <button
            onClick={handleWithdraw}
            disabled={!isValid || isProcessing}
            className={`w-full py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 cursor-pointer ${
              isValid && !isProcessing
                ? 'bg-[#D0872E] hover:bg-[#b87324] text-white shadow-[#d0872e]/30'
                : 'bg-[#cfbc9e] text-[#7a5328] cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <span>Transmitting Payout to Bank...</span>
            ) : (
              <>
                <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                <span>Withdraw ₹{numAmount.toLocaleString('en-IN')} Instantly</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
