'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Building,
  CreditCard,
  UserCheck,
  Lock,
  Sparkles,
} from 'lucide-react';
import { triggerConfetti } from '@/lib/confetti';
import FloatingInput from '@/components/ui/FloatingInput';

interface FullKycContentProps {
  userName: string;
  onKycComplete?: () => void;
  onClose: () => void;
}

export default function FullKycContent({
  userName,
  onKycComplete,
  onClose,
}: FullKycContentProps) {
  const [aadhaar, setAadhaar] = useState('8492-3104-9421');
  const [pan, setPan] = useState('BPZPS4892K');
  const [bankAcc, setBankAcc] = useState('501004928192');
  const [ifsc, setIfsc] = useState('HDFC0000128');
  const [isVerified, setIsVerified] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVerify = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsVerified(true);
      triggerConfetti();
      onKycComplete?.();
    }, 1000);
  };

  return (
    <div className="space-y-4">
      {/* Verification Status Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1.5 bg-white/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Govt. Verified ID</span>
          </span>
          <span className="text-xs font-bold text-emerald-200 font-mono">
            Tier-3 Full KYC
          </span>
        </div>

        <h3 className="text-lg font-black tracking-tight mb-1">
          Full KYC Document Verification
        </h3>
        <p className="text-xs text-emerald-100/90 leading-relaxed">
          Full KYC verification ensures unlimited 24/7 withdrawals and protects your investment balance.
        </p>
      </div>

      {/* KYC Checklist */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span>Full KYC Details & Documents</span>
        </h4>

        <div className="space-y-3 pt-1 text-xs">
          <FloatingInput
            label="Full Legal Name (as per Aadhaar/PAN)"
            value={userName}
            disabled
            inputClassName="font-bold text-slate-800"
          />

          <FloatingInput
            label="Aadhaar Card Number"
            value={aadhaar}
            onChange={(e) => setAadhaar(e.target.value)}
            inputClassName="font-mono text-black font-bold"
            rightElement={
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded">
                Verified ✓
              </span>
            }
          />

          <FloatingInput
            label="Permanent Account Number (PAN)"
            value={pan}
            onChange={(e) => setPan(e.target.value.toUpperCase())}
            inputClassName="font-mono text-black font-bold uppercase"
            rightElement={
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded">
                Linked ✓
              </span>
            }
          />

          <div className="grid grid-cols-2 gap-2.5">
            <FloatingInput
              label="Settlement Bank A/C"
              value={bankAcc}
              onChange={(e) => setBankAcc(e.target.value)}
              inputClassName="font-mono text-black font-bold"
            />

            <FloatingInput
              label="Bank IFSC Code"
              value={ifsc}
              onChange={(e) => setIfsc(e.target.value.toUpperCase())}
              inputClassName="font-mono text-black font-bold uppercase"
            />
          </div>
        </div>
      </div>

      {/* Benefits Card */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 space-y-2 text-xs">
        <span className="font-bold text-emerald-900 block flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Full KYC Verified Benefits Activated</span>
        </span>
        <ul className="space-y-1 text-emerald-800 text-[11px]">
          <li>• Unlimited single-day withdrawal limit (up to ₹5,00,000/day)</li>
          <li>• 0% gateway commission on all UPI & IMPS transfers</li>
          <li>• Priority 60-second settlement queue</li>
        </ul>
      </div>

      {/* Button */}
      <div className="pt-2">
        <button
          onClick={handleVerify}
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Full KYC Status: Active & Approved</span>
        </button>
      </div>
    </div>
  );
}
