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
    <div className="space-y-5">
      {/* Balance Overview */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-4 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400 block">Withdrawable Balance</span>
          <span className="text-2xl font-black text-emerald-400 font-mono">
            ₹{currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 block">Processing Time</span>
          <span className="text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
            Under 60s
          </span>
        </div>
      </div>

      {/* Amount Input with floating animated label */}
      <div className="pt-1">
        <FloatingInput
          label="Withdrawal Amount (Min ₹100)"
          type="number"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          leftPrefix="₹"
          inputClassName="font-mono font-bold text-black text-base"
        />

        {/* Quick Percent Buttons */}
        <div className="grid grid-cols-4 gap-2 mt-2">
          {[
            { label: '25%', val: 0.25 },
            { label: '50%', val: 0.5 },
            { label: '75%', val: 0.75 },
            { label: 'Max (100%)', val: 1.0 },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={() => setPercentAmount(btn.val)}
              className="py-1 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Payout Channels */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setPayoutType('upi')}
            className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              payoutType === 'upi'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>UPI ID (Instant)</span>
          </button>

          <button
            onClick={() => setPayoutType('bank')}
            className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              payoutType === 'bank'
                ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Bank Account</span>
          </button>
        </div>

        {payoutType === 'upi' ? (
          <div className="pt-1">
            <FloatingInput
              label="Your Verified UPI ID"
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              inputClassName="font-bold text-black"
            />
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            <FloatingInput
              label="Account Holder Name"
              type="text"
              value={accHolder}
              onChange={(e) => setAccHolder(e.target.value)}
              inputClassName="font-bold text-black"
            />

            <FloatingInput
              label="Bank Account Number"
              type="text"
              value={bankAcc}
              onChange={(e) => setBankAcc(e.target.value)}
              inputClassName="font-mono font-bold text-black"
            />

            <FloatingInput
              label="Bank IFSC Code"
              type="text"
              value={ifsc}
              onChange={(e) => setIfsc(e.target.value.toUpperCase())}
              inputClassName="font-mono font-bold uppercase text-black"
            />
          </div>
        )}
      </div>

      {/* 0% Platform Fee Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs flex items-center justify-between text-emerald-900">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Platform Fee: 0% Free</span>
        </div>
        <span className="font-bold">You Receive: ₹{numAmount.toLocaleString('en-IN')}</span>
      </div>

      {/* CTA Button */}
      <div className="pt-2">
        {isSuccess ? (
          <div className="w-full py-3.5 bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md">
            <CheckCircle2 className="w-5 h-5" />
            <span>₹{numAmount.toLocaleString('en-IN')} Withdrawal Dispatched!</span>
          </div>
        ) : (
          <button
            onClick={handleWithdraw}
            disabled={!isValid || isProcessing}
            className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 ${
              isValid && !isProcessing
                ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <span>Initiating Bank Settlement...</span>
            ) : (
              <>
                <ArrowUpRight className="w-4 h-4" />
                <span>Withdraw ₹{numAmount.toLocaleString('en-IN')} Now</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
