'use client';

import React, { useState } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  CreditCard,
  Zap,
} from 'lucide-react';
import { triggerConfetti } from '@/lib/confetti';
import FloatingInput from '@/components/ui/FloatingInput';

interface DepositContentProps {
  currentBalance: number;
  onDepositSuccess: (amount: number, method: string) => void;
  onClose: () => void;
}

export default function DepositContent({
  currentBalance,
  onDepositSuccess,
  onClose,
}: DepositContentProps) {
  const [selectedAmount, setSelectedAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'upi_qr' | 'phonepe' | 'gpay' | 'paytm'>(
    'phonepe'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const presets = [500, 1000, 2500, 5000, 10000];

  const amountToDeposit = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleDeposit = () => {
    if (amountToDeposit < 100) return;

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      triggerConfetti();
      onDepositSuccess(amountToDeposit, paymentMethod.toUpperCase());
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    }, 1200);
  };

  return (
    <div className="space-y-5">
      {/* Current Balance Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400 block">Current Balance</span>
          <span className="text-xl font-extrabold text-emerald-400 font-mono">
            ₹{currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 block">Deposit Gateway</span>
          <span className="text-xs font-bold text-white bg-slate-800 px-2.5 py-1 rounded-md">
            Fast UPI 2.0
          </span>
        </div>
      </div>

      {/* Preset Amounts */}
      <div>
        <label className="text-xs font-bold text-slate-700 block mb-2">
          Select Deposit Amount (INR)
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {presets.map((amt) => {
            const isSelected = selectedAmount === amt && !customAmount;
            return (
              <button
                key={amt}
                onClick={() => {
                  setSelectedAmount(amt);
                  setCustomAmount('');
                }}
                className={`py-2 px-1 text-center rounded-xl border text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                ₹{amt.toLocaleString('en-IN')}
              </button>
            );
          })}
        </div>

        {/* Custom Amount Input with floating animated label */}
        <div className="mt-3">
          <FloatingInput
            label="Or Enter Custom Amount (Min ₹100)"
            type="number"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setSelectedAmount(0);
            }}
            leftPrefix="₹"
            inputClassName="font-mono font-bold text-black text-sm"
          />
        </div>
      </div>

      {/* Payment Gateway Options */}
      <div>
        <label className="text-xs font-bold text-slate-700 block mb-2">
          Select Payment Method
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { id: 'phonepe', name: 'PhonePe UPI', badge: 'Fastest' },
            { id: 'gpay', name: 'Google Pay', badge: 'Auto' },
            { id: 'paytm', name: 'Paytm UPI', badge: 'Instant' },
            { id: 'upi_qr', name: 'Instant QR Scan', badge: 'All Apps' },
          ].map((m) => {
            const isSelected = paymentMethod === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setPaymentMethod(m.id as any)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-emerald-50/70 border-emerald-500 ring-1 ring-emerald-500'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{m.name}</span>
                  <span className="text-[10px] text-emerald-600 font-medium">{m.badge}</span>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                  }`}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Zero Fee Guarantee Note */}
      <div className="bg-emerald-50 text-emerald-900 rounded-xl p-3 text-xs flex items-center gap-2 border border-emerald-200/80">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>100% Secure Payment • 0% Deposit Fee • Instant Auto-Credit</span>
      </div>

      {/* Deposit CTA Button */}
      <div className="pt-2">
        {isSuccess ? (
          <div className="w-full py-3.5 bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md">
            <CheckCircle2 className="w-5 h-5" />
            <span>₹{amountToDeposit.toLocaleString('en-IN')} Added Successfully!</span>
          </div>
        ) : (
          <button
            onClick={handleDeposit}
            disabled={amountToDeposit < 100 || isProcessing}
            className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 ${
              amountToDeposit >= 100 && !isProcessing
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <span>Verifying Payment...</span>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Pay ₹{amountToDeposit.toLocaleString('en-IN')} Instantly</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
