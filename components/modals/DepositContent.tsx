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
    <div className="space-y-4 text-[#46280b]">
      {/* Current Balance Banner - Deep Royal Chocolate Hero */}
      <div className="bg-gradient-to-r from-[#2c180a] via-[#4a280e] to-[#6d3e16] text-white rounded-2xl p-4 flex items-center justify-between border-2 border-[#dfbe7e] shadow-sm">
        <div>
          <span className="text-xs text-[#fed788] block">Current Wallet Balance</span>
          <span className="text-2xl font-black text-[#ffd485] font-mono">
            ₹{currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-[#dfbe7e] block">Deposit Gateway</span>
          <span className="text-xs font-bold text-[#55361e] bg-[#faecd4] border border-[#dfbe7e] px-2.5 py-1 rounded-md">
            Fast UPI 2.0
          </span>
        </div>
      </div>

      {/* Preset Amounts - Palace Gold Card Container */}
      <div className="bg-gradient-to-b from-[#fffefc] via-[#fbf5e7] to-[#f4e4c2] rounded-2xl p-4 border-2 border-[#dfbe7e] shadow-2xs space-y-3">
        <label className="text-xs font-bold text-[#7a5328] uppercase tracking-wider block">
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
                className={`py-2 px-1 text-center rounded-xl border-2 text-xs font-mono font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#D0872E] text-white border-[#dfbe7e] shadow-xs'
                    : 'bg-white/95 text-[#46280b] border-[#dfbe7e]/60 hover:bg-[#faecd4]'
                }`}
              >
                ₹{amt.toLocaleString('en-IN')}
              </button>
            );
          })}
        </div>

        {/* Custom Amount Input with floating animated label */}
        <div className="mt-2">
          <FloatingInput
            label="Or Enter Custom Amount (Min ₹100)"
            type="number"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setSelectedAmount(0);
            }}
            leftPrefix="₹"
            inputClassName="font-mono font-bold text-[#46280b] text-sm"
          />
        </div>
      </div>

      {/* Payment Gateway Options */}
      <div className="bg-gradient-to-b from-[#fffefc] via-[#fbf5e7] to-[#f4e4c2] rounded-2xl p-4 border-2 border-[#dfbe7e] shadow-2xs space-y-2.5">
        <label className="text-xs font-bold text-[#7a5328] uppercase tracking-wider block">
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
                className={`p-3 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#fffdf9] border-[#D0872E] ring-1 ring-[#D0872E]/30 shadow-xs'
                    : 'bg-white/85 border-[#dfbe7e]/50 hover:bg-white'
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-[#46280b] block">{m.name}</span>
                  <span className="text-[10px] text-[#b87324] font-semibold">{m.badge}</span>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-[#D0872E] bg-[#D0872E]' : 'border-[#dfbe7e]'
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
      <div className="bg-[#fff8ea] text-[#55361e] rounded-xl p-3 text-xs flex items-center gap-2 border-2 border-[#dfbe7e]">
        <ShieldCheck className="w-4 h-4 text-[#8a5416] shrink-0" />
        <span className="font-medium">100% Secure Payment • 0% Deposit Fee • Instant Auto-Credit</span>
      </div>

      {/* Deposit CTA Button */}
      <div className="pt-1">
        {isSuccess ? (
          <div className="w-full py-4 bg-[#22c55e] text-white font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-md">
            <CheckCircle2 className="w-5 h-5" />
            <span>₹{amountToDeposit.toLocaleString('en-IN')} Added Successfully!</span>
          </div>
        ) : (
          <button
            onClick={handleDeposit}
            disabled={amountToDeposit < 100 || isProcessing}
            className={`w-full py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 cursor-pointer ${
              amountToDeposit >= 100 && !isProcessing
                ? 'bg-[#D0872E] hover:bg-[#b87324] text-white shadow-[#d0872e]/30'
                : 'bg-[#cfbc9e] text-[#7a5328] cursor-not-allowed'
            }`}
          >
            {isProcessing ? (
              <span>Verifying Payment...</span>
            ) : (
              <>
                <Zap className="w-4 h-4 text-[#ffd485]" />
                <span>Pay ₹{amountToDeposit.toLocaleString('en-IN')} Instantly</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
