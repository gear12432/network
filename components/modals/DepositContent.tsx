'use client';

import React, { useState, useRef } from 'react';
import {
  Wallet,
  ArrowLeft,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  Zap,
  Copy,
  Upload,
  FileImage,
  AlertCircle,
  Hash,
} from 'lucide-react';
import { triggerConfetti } from '@/lib/confetti';
import FloatingInput from '@/components/ui/FloatingInput';
import { UserStats } from '@/types/investment';
import {
  saveDepositToFirestore,
  DepositRecord,
  getGatewaySettingsFromFirestore,
  GatewaySettings,
} from '@/lib/firebase';

interface DepositContentProps {
  currentBalance: number;
  userStats?: UserStats;
  onDepositSuccess: (amount: number, method: string) => void;
  onClose: () => void;
}

export default function DepositContent({
  currentBalance,
  userStats,
  onDepositSuccess,
  onClose,
}: DepositContentProps) {
  // Step 1: 'amount', Step 2: 'payment'
  const [step, setStep] = useState<'amount' | 'payment'>('amount');

  // Gateway Settings State
  const [gatewaySettings, setGatewaySettings] = useState<GatewaySettings>({
    upiId: 'networkjoinpro@upi',
    minDeposit: 100,
    minWithdrawal: 200,
  });

  React.useEffect(() => {
    async function loadGateway() {
      try {
        const settings = await getGatewaySettingsFromFirestore();
        if (settings) {
          setGatewaySettings(settings);
        }
      } catch (e) {
        console.warn('Failed to load gateway settings:', e);
      }
    }
    loadGateway();
  }, []);

  // Amount State
  const [selectedAmount, setSelectedAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'upi_qr' | 'phonepe' | 'gpay' | 'paytm'>(
    'phonepe'
  );

  // Payment Screen Form State
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const presets = [500, 1000, 2500, 5000, 10000];
  const upiId = gatewaySettings.upiId || 'networkjoinpro@upi';

  const amountToDeposit = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  // Handle proceed to payment screen
  const handleProceedToPayment = async () => {
    if (amountToDeposit < (gatewaySettings.minDeposit || 100)) return;
    setErrorMessage('');
    try {
      const freshSettings = await getGatewaySettingsFromFirestore();
      if (freshSettings) {
        setGatewaySettings(freshSettings);
      }
    } catch {
      // fallback
    }
    setStep('payment');
  };

  // Copy UPI ID
  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Handle image file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('File size must be under 10MB');
        return;
      }
      setSelectedFile(file);
      setErrorMessage('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle final deposit submission (saving to Firebase Firestore)
  const handleSubmitPayment = async () => {
    if (!utrNumber.trim()) {
      setErrorMessage('कृपया यूटीआर नंबर / UTR Number दर्ज करें!');
      return;
    }
    if (utrNumber.trim().length < 6) {
      setErrorMessage('कृपया मान्य यूटीआर नंबर (कम से कम 6-12 अंक) दर्ज करें!');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const formattedDateTime = new Date().toLocaleString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const depositData: DepositRecord = {
      id: `DEP_${Date.now()}`,
      loginUid: userStats?.loginUid || 'GK37643',
      userName: userStats?.userName || 'User',
      mobile: userStats?.mobile || '',
      amount: amountToDeposit,
      utrNumber: utrNumber.trim(),
      imageUrl: imagePreview || '',
      dateTime: formattedDateTime,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    // Save to Firebase Firestore
    await saveDepositToFirestore(depositData);

    // Save locally in localStorage for backup
    try {
      const existing = JSON.parse(localStorage.getItem('user_deposits') || '[]');
      localStorage.setItem('user_deposits', JSON.stringify([depositData, ...existing]));
    } catch {
      // fallback
    }

    setIsSubmitting(false);
    setSubmitSuccess(true);
    triggerConfetti();

    onDepositSuccess(amountToDeposit, 'UPI_QR');

    setTimeout(() => {
      setSubmitSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="space-y-4 text-[#46280b]">
      {/* Current Balance Banner */}
      <div className="bg-gradient-to-r from-[#2c180a] via-[#4a280e] to-[#6d3e16] text-white rounded-2xl p-3.5 flex items-center justify-between border-2 border-[#dfbe7e] shadow-xs">
        <div>
          <span className="text-[11px] text-[#fed788] block">Current Balance</span>
          <span className="text-xl font-black text-[#ffd485] font-mono">
            ₹{currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-[#dfbe7e] block">Gateway</span>
          <span className="text-xs font-bold text-[#55361e] bg-[#faecd4] border border-[#dfbe7e] px-2 py-0.5 rounded-md">
            Fast UPI 2.0
          </span>
        </div>
      </div>

      {step === 'amount' ? (
        /* ================= STEP 1: AMOUNT & METHOD SELECTION ================= */
        <div className="space-y-4">
          {/* Preset Amounts */}
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

            {/* Custom Amount Input */}
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

          {/* Pay Button */}
          <button
            onClick={handleProceedToPayment}
            disabled={amountToDeposit < 100}
            className={`w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 cursor-pointer ${
              amountToDeposit >= 100
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Zap className="w-4 h-4 text-blue-200" />
            <span>Pay ₹{amountToDeposit.toLocaleString('en-IN')} Instantly</span>
          </button>
        </div>
      ) : (
        /* ================= STEP 2: PAYMENT SCREEN (QR + UTR + FILE PICKER) ================= */
        <div className="space-y-4">
          {/* Header & Back Button */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep('amount')}
              className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-blue-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>राशि बदलें (Change Amount)</span>
            </button>
            <span className="text-xs font-bold text-slate-500">Step 2 of 2</span>
          </div>

          {/* Payable Amount Display Card */}
          <div className="bg-gradient-to-b from-white to-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-center shadow-xs space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Payable Amount (भुगतान राशि)
            </span>
            <div className="text-3xl font-black text-blue-700 font-mono">
              ₹{amountToDeposit.toLocaleString('en-IN')}
            </div>

            {/* QR Code */}
            <div className="pt-2 flex flex-col items-center justify-center">
              <div className="p-2.5 bg-white rounded-2xl border-2 border-slate-200 shadow-md inline-block relative">
                <img
                  src={
                    gatewaySettings.qrCodeUrl ||
                    `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                      `upi://pay?pa=${upiId}&pn=NetworkJoinPro&am=${amountToDeposit}&cu=INR`
                    )}`
                  }
                  alt="UPI Payment QR Code"
                  className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-xl"
                  onError={(e) => {
                    if (gatewaySettings.qrCodeUrl) {
                      (e.currentTarget as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                        `upi://pay?pa=${upiId}&pn=NetworkJoinPro&am=${amountToDeposit}&cu=INR`
                      )}`;
                    } else {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }
                  }}
                />
              </div>

              {/* UPI ID Copy Bar */}
              <div className="mt-3 flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="text-xs font-mono font-bold text-slate-900">{upiId}</span>
                <button
                  onClick={handleCopyUpi}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Scan using PhonePe, GPay, Paytm or any UPI App
              </p>
            </div>
          </div>

          {/* UTR Number Input & Choice File Upload Container */}
          <div className="bg-gradient-to-b from-white to-slate-50 rounded-2xl p-4 border-2 border-slate-200 shadow-2xs space-y-3.5">
            {/* UTR Input */}
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                UTR Number / Txn Ref ID (उतर नंबर)*
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="Enter 12-digit UTR No. (उदा: 429381029384)"
                  className="w-full pl-9 pr-3 py-2.5 bg-white border-2 border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                />
                <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Choice File Button */}
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                Payment Screenshot (चॉइस फाइल)*
              </label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>चॉइस फाइल (Choice File)</span>
                </button>

                <span className="text-xs font-medium text-slate-600 truncate">
                  {selectedFile ? selectedFile.name : 'कोई फ़ाइल चुनी नहीं गई'}
                </span>
              </div>

              {/* Image Preview if selected */}
              {imagePreview && (
                <div className="mt-2.5 p-2 bg-white rounded-xl border border-slate-200 flex items-center gap-3">
                  <img
                    src={imagePreview}
                    alt="Payment Screenshot Preview"
                    className="w-12 h-12 object-cover rounded-lg border"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-slate-900 truncate block">
                      {selectedFile?.name || 'Screenshot Attached'}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold">Image Attached ✓</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setImagePreview('');
                    }}
                    className="text-xs text-red-600 hover:text-red-800 font-bold px-2 py-1 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <div>
            {submitSuccess ? (
              <div className="w-full py-4 bg-emerald-600 text-white font-black rounded-xl flex items-center justify-center gap-2 shadow-md">
                <CheckCircle2 className="w-5 h-5" />
                <span>सबमिट हो गया! स्थिति: पेंडिंग (Pending)</span>
              </div>
            ) : (
              <button
                onClick={handleSubmitPayment}
                disabled={isSubmitting}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>सबमिट हो रहा है...</span>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-blue-200" />
                    <span>Submit Payment (सबमिट करें)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

