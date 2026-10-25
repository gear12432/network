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
      {/* Verification Status Banner: Deep Chocolate Bronze Banner with Gold Accents */}
      <div className="bg-gradient-to-r from-[#2c180a] via-[#4a280e] to-[#6d3e16] border-2 border-[#dfbe7e] text-white rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1.5 bg-[#dfbe7e]/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide text-[#ffd485] border border-[#dfbe7e]/40">
            <ShieldCheck className="w-3.5 h-3.5 text-[#ffd485]" />
            <span>Govt. Verified ID</span>
          </span>
          <span className="text-xs font-bold text-[#ffd485] font-mono">
            Tier-3 Full KYC
          </span>
        </div>

        <h3 className="text-lg font-black tracking-tight mb-1 text-white">
          Full KYC Document Verification
        </h3>
        <p className="text-xs text-[#faecd4]/90 leading-relaxed">
          Full KYC verification ensures unlimited 24/7 withdrawals and protects your investment balance.
        </p>
      </div>

      {/* KYC Checklist: Cream / Gold Card */}
      <div className="bg-gradient-to-b from-[#fffefc] via-[#fbf5e7] to-[#f4e4c2] rounded-2xl p-4 border-2 border-[#dfbe7e] shadow-xs space-y-3">
        <h4 className="font-bold text-[#46280b] text-xs sm:text-sm flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-[#8a5416]" />
          <span>Full KYC Details & Documents</span>
        </h4>

        <div className="space-y-3 pt-1 text-xs">
          <FloatingInput
            label="Full Legal Name (as per Aadhaar/PAN)"
            value={userName}
            disabled
            focusColor="gold"
            inputClassName="font-bold text-[#46280b]"
          />

          <FloatingInput
            label="Aadhaar Card Number"
            value={aadhaar}
            onChange={(e) => setAadhaar(e.target.value)}
            focusColor="gold"
            inputClassName="font-mono text-[#46280b] font-bold"
            rightElement={
              <span className="text-[10px] bg-[#faecd4] text-[#22c55e] font-bold px-1.5 py-0.5 rounded border border-[#dfbe7e]">
                Verified ✓
              </span>
            }
          />

          <FloatingInput
            label="Permanent Account Number (PAN)"
            value={pan}
            onChange={(e) => setPan(e.target.value.toUpperCase())}
            focusColor="gold"
            inputClassName="font-mono text-[#46280b] font-bold uppercase"
            rightElement={
              <span className="text-[10px] bg-[#faecd4] text-[#22c55e] font-bold px-1.5 py-0.5 rounded border border-[#dfbe7e]">
                Linked ✓
              </span>
            }
          />

          <div className="grid grid-cols-2 gap-2.5">
            <FloatingInput
              label="Settlement Bank A/C"
              value={bankAcc}
              onChange={(e) => setBankAcc(e.target.value)}
              focusColor="gold"
              inputClassName="font-mono text-[#46280b] font-bold"
            />

            <FloatingInput
              label="Bank IFSC Code"
              value={ifsc}
              onChange={(e) => setIfsc(e.target.value.toUpperCase())}
              focusColor="gold"
              inputClassName="font-mono text-[#46280b] font-bold uppercase"
            />
          </div>
        </div>
      </div>

      {/* Benefits Card */}
      <div className="bg-[#faecd4]/80 border-2 border-[#dfbe7e] rounded-2xl p-3.5 space-y-2 text-xs">
        <span className="font-bold text-[#8a5416] block flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#d0872e]" />
          <span>Full KYC Verified Benefits Activated</span>
        </span>
        <ul className="space-y-1 text-[#46280b] text-[11px] font-medium">
          <li>• Unlimited single-day withdrawal limit (up to ₹5,00,000/day)</li>
          <li>• 0% gateway commission on all UPI & IMPS transfers</li>
          <li>• Priority 60-second settlement queue</li>
        </ul>
      </div>

      {/* Button: #D0872E */}
      <div className="pt-2">
        <button
          onClick={handleVerify}
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-xl bg-[#D0872E] hover:bg-[#b87324] active:scale-98 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#d0872e]/30 transition-all cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Full KYC Status: Active & Approved</span>
        </button>
      </div>
    </div>
  );
}
