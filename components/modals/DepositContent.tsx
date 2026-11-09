'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  ExternalLink,
  Check,
  Smartphone,
} from 'lucide-react';
import { triggerConfetti } from '@/lib/confetti';
import FloatingInput from '@/components/ui/FloatingInput';
import { UserStats } from '@/types/investment';
import {
  saveDepositToFirestore,
  DepositRecord,
  getGatewaySettingsFromFirestore,
  GatewaySettings,
  UserAccountData,
} from '@/lib/firebase';

interface DepositContentProps {
  currentBalance: number;
  userStats?: UserStats;
  currentUser?: UserAccountData | null;
  onDepositSuccess: (amount: number, method: string, depositData?: DepositRecord) => void;
  onClose: () => void;
}

// Compress client uploaded screenshot to a fast, clean JPEG DataURL (< 250KB)
function compressScreenshot(file: File, maxWidth = 1000, quality = 0.75): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve((e.target?.result as string) || '');
        }
      };
      img.onerror = () => resolve((e.target?.result as string) || '');
      img.src = (e.target?.result as string) || '';
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

export default function DepositContent({
  currentBalance,
  userStats,
  currentUser,
  onDepositSuccess,
  onClose,
}: DepositContentProps) {
  // Step 1: 'amount', Step 2: 'payment'
  const [step, setStep] = useState<'amount' | 'payment'>('amount');

  // Gateway Settings State
  const [gatewaySettings, setGatewaySettings] = useState<GatewaySettings>({
    upiId: 'BHARATPE94979104081@yesbankltd',
    minDeposit: 100,
    minWithdrawal: 200,
  });

  useEffect(() => {
    async function loadGateway() {
      try {
        const settings = await getGatewaySettingsFromFirestore();
        if (settings && settings.upiId) {
          setGatewaySettings(settings);
        }
      } catch (e) {
        console.warn('Failed to load gateway settings:', e);
      }
    }
    loadGateway();
  }, []);

  // Amount State
  const [selectedAmount, setSelectedAmount] = useState<number>(800);
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

  const presets = [500, 800, 1000, 2500, 5000, 10000];
  const upiId = gatewaySettings.upiId || 'BHARATPE94979104081@yesbankltd';

  const amountToDeposit = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  // Standard UPI URI format: includes exact payable amount in 'am' parameter
  // When scanned by PhonePe, GPay, Paytm, BHIM, etc., the amount is automatically filled!
  const upiPayload = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    'Network Join Pro'
  )}&am=${amountToDeposit.toFixed(2)}&cu=INR&tn=${encodeURIComponent(
    `Recharge ${currentUser?.loginUid || userStats?.loginUid || 'Wallet'}`
  )}`;

  // Dynamic QR Code encoding the UPI payload with the connected amount
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${encodeURIComponent(
    upiPayload
  )}`;

  // Handle proceed to payment screen
  const handleProceedToPayment = async () => {
    if (amountToDeposit < (gatewaySettings.minDeposit || 100)) return;
    setErrorMessage('');
    try {
      const freshSettings = await getGatewaySettingsFromFirestore();
      if (freshSettings && freshSettings.upiId) {
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

  // Handle image file selection with auto compression
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setErrorMessage('File size must be under 15MB');
        return;
      }
      setSelectedFile(file);
      setErrorMessage('');

      try {
        const compressed = await compressScreenshot(file);
        setImagePreview(compressed);
      } catch {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview((reader.result as string) || '');
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Handle direct UPI intent click on mobile devices
  const handlePayViaApp = () => {
    try {
      window.location.href = upiPayload;
    } catch {
      // ignore
    }
  };

  // Handle final deposit submission (saving to Firebase Firestore deposits collection)
  const handleSubmitPayment = async () => {
    const cleanUtr = utrNumber.trim();

    if (!cleanUtr) {
      setErrorMessage('Please enter the 12-digit UTR Number / Transaction Reference ID!');
      return;
    }
    if (cleanUtr.length < 6) {
      setErrorMessage('Please enter a valid UTR Number (at least 6-12 digits)!');
      return;
    }
    if (!imagePreview && !selectedFile) {
      setErrorMessage('Please upload your payment screenshot proof!');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Ensure image is compressed
      let finalImageUrl = imagePreview;
      if (!finalImageUrl && selectedFile) {
        finalImageUrl = await compressScreenshot(selectedFile);
      }

      const formattedDateTime = new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });

      const customerId =
        currentUser?.loginUid ||
        userStats?.loginUid ||
        'GK' + Math.floor(10000 + Math.random() * 90000);
      const customerName =
        currentUser?.fullName || userStats?.userName || 'Customer';
      const customerMobile = currentUser?.mobile || userStats?.mobile || '';

      const depositData: DepositRecord = {
        id: `DEP_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
        loginUid: customerId,
        userName: customerName,
        mobile: customerMobile,
        amount: amountToDeposit,
        utrNumber: cleanUtr,
        imageUrl: finalImageUrl || '',
        dateTime: formattedDateTime,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };

      // 1. Save to Firebase Firestore deposits collection
      await saveDepositToFirestore(depositData);

      // 2. Save locally in localStorage for backup
      try {
        const existing = JSON.parse(localStorage.getItem('user_deposits') || '[]');
        localStorage.setItem('user_deposits', JSON.stringify([depositData, ...existing]));
      } catch {
        // fallback
      }

      setIsSubmitting(false);
      setSubmitSuccess(true);
      triggerConfetti();

      onDepositSuccess(amountToDeposit, 'UPI_QR', depositData);

      setTimeout(() => {
        setSubmitSuccess(false);
        onClose();
      }, 2200);
    } catch (err) {
      console.error('Error submitting deposit:', err);
      setIsSubmitting(false);
      setErrorMessage('Failed to submit deposit. Please check connection and try again.');
    }
  };

  return (
    <div className="space-y-4 text-[#172B75]">
      {/* Current Balance Banner */}
      <div className="bg-[#002E6E] text-white rounded-2xl p-3.5 flex items-center justify-between shadow-xs border border-[#D9E7F5]/30">
        <div>
          <span className="text-[11px] text-[#00B9F1] block font-semibold">Current Balance</span>
          <span className="text-xl font-black text-white font-mono">
            ₹{currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-[#00B9F1] block font-semibold">Gateway</span>
          <span className="text-xs font-bold text-[#002E6E] bg-white px-2.5 py-0.5 rounded-md shadow-2xs">
            Fast UPI 2.0
          </span>
        </div>
      </div>

      {step === 'amount' ? (
        /* ================= STEP 1: AMOUNT & METHOD SELECTION (ENGLISH ONLY) ================= */
        <div className="space-y-4">
          {/* Preset Amounts */}
          <div className="bg-white rounded-2xl p-4 border border-[#D9E7F5] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-[#172B75] uppercase tracking-wider block">
                Select Deposit Amount (INR)
              </label>
              <span className="text-[10.5px] font-bold text-[#172B75]/70 bg-[#EAF5FF] px-2 py-0.5 rounded border border-[#D9E7F5]">
                Min: ₹100
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {presets.map((amt) => {
                const isSelected = selectedAmount === amt && !customAmount;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amt);
                      setCustomAmount('');
                    }}
                    className={`py-2 px-1 text-center rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#002E6E] text-white border-[#002E6E] shadow-xs'
                        : 'bg-[#F2F8FC] text-[#172B75] border-[#D9E7F5] hover:bg-[#EAF5FF]'
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
                inputClassName="font-mono font-bold text-[#172B75] text-sm bg-white"
              />
            </div>
          </div>

          {/* Payment Gateway Options */}
          <div className="bg-white rounded-2xl p-4 border border-[#D9E7F5] shadow-2xs space-y-2.5">
            <label className="text-xs font-black text-[#172B75] uppercase tracking-wider block">
              Select Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'phonepe', name: 'PhonePe UPI', badge: 'Auto-Fill' },
                { id: 'gpay', name: 'Google Pay', badge: 'Instant' },
                { id: 'paytm', name: 'Paytm UPI', badge: 'Fast' },
                { id: 'upi_qr', name: 'Dynamic QR Scan', badge: 'All Apps' },
              ].map((m) => {
                const isSelected = paymentMethod === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#EAF5FF] border-[#002E6E] ring-1 ring-[#00B9F1]/40 shadow-xs'
                        : 'bg-white border-[#D9E7F5] hover:bg-[#F2F8FC]'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-[#172B75] block">{m.name}</span>
                      <span className="text-[10px] text-[#002E6E] font-semibold">{m.badge}</span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-[#002E6E] bg-[#002E6E]' : 'border-slate-300'
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
          <div className="bg-[#EAF5FF] text-[#172B75] rounded-xl p-3 text-xs flex items-center gap-2 border border-[#D9E7F5]">
            <ShieldCheck className="w-4 h-4 text-[#002E6E] shrink-0" />
            <span className="font-medium">100% Secure Payment • 0% Deposit Fee • Instant Auto-Credit</span>
          </div>

          {/* Pay Button */}
          <button
            type="button"
            onClick={handleProceedToPayment}
            disabled={amountToDeposit < 100}
            className={`w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer ${
              amountToDeposit >= 100
                ? 'bg-[#002E6E] hover:bg-[#00204d] text-white border border-[#00B9F1]/40'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed border border-slate-300'
            }`}
          >
            <Zap className="w-4 h-4 text-[#00B9F1]" />
            <span>Pay ₹{amountToDeposit.toLocaleString('en-IN')} Instantly</span>
          </button>
        </div>
      ) : (
        /* ================= STEP 2: PAYMENT SCREEN (ENGLISH ONLY - ZERO HINDI) ================= */
        <div className="space-y-4">
          {/* Header & Back Button */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep('amount')}
              className="flex items-center gap-1.5 text-xs font-bold text-[#002E6E] hover:text-[#00B9F1] bg-[#EAF5FF] border border-[#D9E7F5] px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Change Amount</span>
            </button>
            <span className="text-xs font-bold text-[#172B75]/60">Step 2 of 2</span>
          </div>

          {/* Payable Amount Display Card with Dynamic Connected Amount QR Code */}
          <div className="bg-white border border-[#D9E7F5] rounded-2xl p-4 text-center shadow-2xs space-y-3">
            <span className="text-xs font-black text-[#172B75]/70 uppercase tracking-wider block">
              PAYABLE AMOUNT
            </span>

            {/* Payable Amount Highlight Box matching user red arrow */}
            <div className="inline-block px-6 py-1.5 rounded-xl bg-[#F2F8FC] border-2 border-[#00B9F1] shadow-2xs">
              <span className="text-3xl sm:text-4xl font-black text-[#002E6E] font-mono tracking-tight">
                ₹{amountToDeposit.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Dynamic QR Code Container with Auto-Amount Binding */}
            <div className="pt-2 flex flex-col items-center justify-center">
              <div className="p-3 bg-white rounded-2xl border-2 border-[#D9E7F5] shadow-md inline-block relative group">
                <img
                  src={qrCodeUrl}
                  alt={`UPI Payment QR Code for ₹${amountToDeposit}`}
                  className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-xl"
                  onError={(e) => {
                    // Fallback to quickchart QR
                    (e.currentTarget as HTMLImageElement).src = `https://quickchart.io/qr?size=260&text=${encodeURIComponent(
                      upiPayload
                    )}`;
                  }}
                />

                {/* Center Badge indicating connected amount */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-10 h-10 rounded-full bg-white shadow-md border-2 border-[#00B9F1] flex items-center justify-center p-1">
                    <span className="text-[11px] font-black text-[#002E6E] font-mono">₹</span>
                  </div>
                </div>
              </div>

              {/* Amount Connected Status Pill */}
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#07865B] text-[11px] font-bold">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Amount ₹{amountToDeposit.toLocaleString('en-IN')} Auto-Connected to QR</span>
              </div>

              {/* UPI ID Copy Bar */}
              <div className="mt-2.5 flex items-center gap-2 bg-[#F2F8FC] px-3.5 py-2 rounded-xl border border-[#D9E7F5] max-w-full">
                <span className="text-xs font-mono font-bold text-[#002E6E] truncate select-all">
                  {upiId}
                </span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="text-xs font-bold text-[#00B9F1] hover:text-[#002E6E] flex items-center gap-1 cursor-pointer shrink-0 transition-colors ml-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <p className="text-[11px] text-[#172B75]/70 mt-1.5 font-medium">
                Scan using PhonePe, Google Pay, Paytm, or any UPI App
              </p>

              {/* Mobile Direct UPI Intent Pay Button */}
              <button
                type="button"
                onClick={handlePayViaApp}
                className="mt-2.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#EAF5FF] hover:bg-[#D9E7F5] border border-[#00B9F1]/60 text-[#002E6E] text-xs font-bold transition-all shadow-2xs cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#00B9F1]" />
                <span>Tap to Open UPI App (Pay ₹{amountToDeposit.toLocaleString('en-IN')})</span>
              </button>
            </div>
          </div>

          {/* UTR Number Input & Proof Screenshot Upload Container (English Only) */}
          <div className="bg-white rounded-2xl p-4 border border-[#D9E7F5] shadow-2xs space-y-3.5">
            {/* UTR Input */}
            <div>
              <label className="text-xs font-black text-[#172B75] uppercase tracking-wider block mb-1.5">
                UTR NUMBER / TXN REF ID *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="Enter 12-digit UTR No. (e.g. 429381029384)"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F2F8FC] border border-[#D9E7F5] rounded-xl text-xs font-mono font-bold text-[#002E6E] placeholder-[#172B75]/40 focus:outline-none focus:border-[#00B9F1] focus:ring-2 focus:ring-[#00B9F1]/20 transition-all"
                />
                <Hash className="w-4 h-4 text-[#002E6E]/60 absolute left-3 top-3" />
              </div>
              <span className="text-[10px] text-[#172B75]/60 font-medium block mt-1 pl-1">
                Found in your UPI app transaction receipt (12 digits numeric)
              </span>
            </div>

            {/* Choice File / Upload Screenshot */}
            <div>
              <label className="text-xs font-black text-[#172B75] uppercase tracking-wider block mb-1.5">
                PAYMENT SCREENSHOT *
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
                  className="px-4 py-2 bg-[#00B9F1] hover:bg-[#009bc7] active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border border-[#002E6E]/20"
                >
                  <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Choose File</span>
                </button>

                <span className="text-xs font-medium text-[#172B75]/80 truncate">
                  {selectedFile ? selectedFile.name : 'No file chosen'}
                </span>
              </div>

              {/* Image Preview if selected */}
              {imagePreview && (
                <div className="mt-2.5 p-2 bg-[#F2F8FC] rounded-xl border border-[#D9E7F5] flex items-center gap-3">
                  <img
                    src={imagePreview}
                    alt="Payment Screenshot Preview"
                    className="w-12 h-12 object-cover rounded-lg border border-[#D9E7F5] bg-white"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-[#002E6E] truncate block">
                      {selectedFile?.name || 'Screenshot Attached'}
                    </span>
                    <span className="text-[10.5px] text-[#07865B] font-bold flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" />
                      Proof Attached Successfully
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setImagePreview('');
                    }}
                    className="text-xs text-rose-600 hover:text-rose-800 font-bold px-2 py-1 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Error Alert in English */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button (English Only) */}
          <div>
            {submitSuccess ? (
              <div className="w-full py-4 bg-[#07865B] text-white font-black rounded-xl flex items-center justify-center gap-2 shadow-md">
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                <span>Payment Submitted Successfully! Status: Pending Approval</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSubmitPayment}
                disabled={isSubmitting}
                className="w-full py-4 bg-[#002E6E] hover:bg-[#00204d] active:scale-98 text-white font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#00B9F1]/40"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Submitting Payment...</span>
                  </span>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-[#00B9F1]" />
                    <span>Submit Payment</span>
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
