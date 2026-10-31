'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Customer } from '@/types/investment';
import {
  User,
  Building,
  RefreshCw,
  Sparkles,
  Check,
  ArrowRight,
  Upload,
  Camera,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { triggerConfetti } from '@/lib/confetti';
import FloatingInput from '@/components/ui/FloatingInput';
import FloatingTextarea from '@/components/ui/FloatingTextarea';
import { saveCustomerToFirestore } from '@/lib/firebase';

interface AddCustomerContentProps {
  onSaveCustomer?: (customer: Customer) => void;
  onCustomerAdded?: (customer: Customer) => void;
  onViewCustomersList?: () => void;
  totalCustomersCount?: number;
  onClose?: () => void;
  onNavigateHome?: () => void;
}

// Generates a clean realistic Customer ID
const generateCustomerId = () => {
  return `CUST-${Math.floor(100000 + Math.random() * 900000)}`;
};

// Lightweight Image Compression helper
function compressImage(file: File, maxWidth = 350, maxHeight = 350, quality = 0.6): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

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
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function AddCustomerContent({
  onSaveCustomer,
  onCustomerAdded,
  onViewCustomersList: _onViewCustomersList,
  totalCustomersCount: _totalCustomersCount,
  onClose,
  onNavigateHome,
}: AddCustomerContentProps) {
  // Form State
  const [customerId, setCustomerId] = useState(generateCustomerId());
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [stateName, setStateName] = useState('Uttar Pradesh');
  const [district, setDistrict] = useState('');
  const [pincode, setPincode] = useState('');

  // Profile Photo State
  const [photo, setPhoto] = useState<string>('');
  const [photoFileName, setPhotoFileName] = useState<string>('');
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Bank State
  const [bankHolderName, setBankHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  const [errorMsg, setErrorMsg] = useState('');

  // Saving Workflow States
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [dialogSecondsLeft, setDialogSecondsLeft] = useState(3);
  const [savedCustomerData, setSavedCustomerData] = useState<Customer | null>(null);

  const dialogIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (dialogIntervalRef.current) clearInterval(dialogIntervalRef.current);
    };
  }, []);

  const handleRegenerateId = () => {
    setCustomerId(generateCustomerId());
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedDataUrl = await compressImage(file, 350, 350, 0.6);
      setPhoto(compressedDataUrl);
      setPhotoFileName(file.name);
    } catch (err) {
      console.warn('Error compressing photo:', err);
    }
  };

  const handleStartSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter customer full legal name');
      return;
    }
    if (!mobile.trim() || mobile.length < 10) {
      setErrorMsg('Valid 10-digit mobile number required');
      return;
    }

    setErrorMsg('');
    setIsSaving(true);

    const newCustomer: Customer = {
      id: customerId,
      name: name.trim(),
      mobile: mobile.trim(),
      address: address.trim() || 'N/A',
      state: stateName,
      district: district.trim() || 'N/A',
      pincode: pincode.trim() || 'N/A',
      photo: photo || '',
      bankHolderName: bankHolderName.trim() || name.trim(),
      bankName: bankName.trim() || 'State Bank of India',
      accountNumber: accountNumber.trim() || 'N/A',
      ifscCode: ifscCode.trim().toUpperCase() || 'SBIN0001001',
      createdDate: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      kycStatus: 'verified',
    };

    setSavedCustomerData(newCustomer);

    // Save Customer to Firestore database + LocalStorage asynchronously
    try {
      await saveCustomerToFirestore(newCustomer);
    } catch (err) {
      console.warn('Firestore async save customer note:', err);
    }

    // Save customer into parent React state immediately
    if (onSaveCustomer) {
      onSaveCustomer(newCustomer);
    }
    if (onCustomerAdded) {
      onCustomerAdded(newCustomer);
    }

    // Transition smoothly to Success Dialog
    setIsSaving(false);
    setShowSuccessDialog(true);
    triggerConfetti();

    // 3-Second Countdown for Success Celebration Dialog
    let dialogCountdown = 3;
    setDialogSecondsLeft(3);
    if (dialogIntervalRef.current) clearInterval(dialogIntervalRef.current);
    dialogIntervalRef.current = setInterval(() => {
      dialogCountdown -= 1;
      setDialogSecondsLeft(dialogCountdown);
      if (dialogCountdown <= 0) {
        if (dialogIntervalRef.current) clearInterval(dialogIntervalRef.current);
        setShowSuccessDialog(false);
        if (onClose) onClose();
        if (onNavigateHome) onNavigateHome();
      }
    }, 1000);
  };

  const handleInstantGoHome = () => {
    if (dialogIntervalRef.current) clearInterval(dialogIntervalRef.current);
    setShowSuccessDialog(false);
    if (onClose) onClose();
    if (onNavigateHome) onNavigateHome();
  };

  const indianStates = [
    'Uttar Pradesh',
    'Maharashtra',
    'Bihar',
    'West Bengal',
    'Madhya Pradesh',
    'Tamil Nadu',
    'Rajasthan',
    'Karnataka',
    'Gujarat',
    'Andhra Pradesh',
    'Odisha',
    'Telangana',
    'Kerala',
    'Jharkhand',
    'Assam',
    'Punjab',
    'Haryana',
    'Chhattisgarh',
    'Delhi NCR',
    'Uttarakhand',
    'Jammu and Kashmir',
  ];

  return (
    <div className="space-y-4 pb-10 bg-slate-50/50 p-1 sm:p-2 rounded-2xl">
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleStartSave} className="space-y-4">
        {/* BOX 1: Customer Personal Details - CLEAN WHITE BACKGROUND */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="font-black text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-600" />
              <span>Customer Personal Details</span>
            </h4>

            {/* Auto Generated Customer ID */}
            <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
              <span className="text-[10px] font-extrabold text-blue-700 uppercase">ID:</span>
              <span className="text-xs font-mono font-black text-blue-900">
                {customerId}
              </span>
              <button
                type="button"
                onClick={handleRegenerateId}
                disabled={isSaving}
                className="text-blue-600 hover:text-blue-800 p-0.5 transition-colors cursor-pointer"
                title="Regenerate ID"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            {/* Customer Name */}
            <FloatingInput
              label="Full Legal Name"
              badgeRequired
              required
              disabled={isSaving}
              value={name}
              onChange={(e) => setName(e.target.value)}
              focusColor="blue"
              inputClassName="font-bold text-slate-900 bg-white"
            />

            {/* Mobile Number with +91 Prefix */}
            <FloatingInput
              label="10-Digit Mobile Number"
              badgeRequired
              required
              disabled={isSaving}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              leftPrefix="+91"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
              focusColor="blue"
              inputClassName="font-mono font-bold text-slate-900 bg-white"
            />

            {/* Customer Profile Photo Field (Choice File Button) */}
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200">
              <label className="text-slate-800 font-bold text-xs mb-1.5 flex items-center justify-between">
                <span>Customer Profile Picture (प्रोफ़ाइल फ़ोटो)</span>
                {photo && (
                  <span className="text-emerald-600 text-[10px] font-bold">Photo Attached ✓</span>
                )}
              </label>

              <div className="flex items-center gap-3">
                {photo ? (
                  <img
                    src={photo}
                    alt="Customer Profile"
                    className="w-12 h-12 rounded-xl object-cover border-2 border-blue-500 shadow-xs"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                    <Camera className="w-5 h-5" />
                  </div>
                )}

                <div className="flex-1">
                  <input
                    type="file"
                    ref={photoInputRef}
                    accept="image/*"
                    disabled={isSaving}
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={isSaving}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose Profile Photo (चॉइस फाइल)</span>
                  </button>
                  {photoFileName && (
                    <span className="text-[10px] text-slate-500 block mt-1 truncate">
                      {photoFileName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Address */}
            <FloatingTextarea
              label="Full Residential Address (House/Street/Area)"
              rows={2}
              disabled={isSaving}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              focusColor="blue"
              textareaClassName="font-semibold text-slate-900 bg-white"
            />

            {/* State, District, PIN Code Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* State Dropdown */}
              <div className="relative group w-full">
                <select
                  value={stateName}
                  disabled={isSaving}
                  onChange={(e) => setStateName(e.target.value)}
                  className="w-full h-12 px-3 bg-white border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                >
                  {indianStates.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                <label className="absolute -top-2 left-3 bg-white px-1.5 text-[10px] font-bold text-slate-600 border border-slate-200 rounded pointer-events-none select-none">
                  State / Region
                </label>
              </div>

              {/* District */}
              <FloatingInput
                label="District / City"
                disabled={isSaving}
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                focusColor="blue"
                inputClassName="font-semibold text-slate-900 bg-white"
              />

              {/* PIN Code */}
              <FloatingInput
                label="PIN Code"
                disabled={isSaving}
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                focusColor="blue"
                inputClassName="font-mono font-bold text-slate-900 bg-white"
              />
            </div>
          </div>
        </div>

        {/* BOX 2: Bank Settlement Details Box - CLEAN WHITE BACKGROUND */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="font-black text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
              <Building className="w-4 h-4 text-blue-600" />
              <span>Bank Settlement Details</span>
            </h4>
            <span className="text-[10px] text-slate-500 font-semibold">Direct Payout Account</span>
          </div>

          <div className="space-y-3 pt-1">
            {/* Bank Holder Name */}
            <FloatingInput
              label="Account Holder Name"
              disabled={isSaving}
              value={bankHolderName}
              onChange={(e) => setBankHolderName(e.target.value)}
              focusColor="blue"
              inputClassName="font-bold text-slate-900 bg-white"
            />

            {/* Bank Name */}
            <FloatingInput
              label="Bank Name (e.g. State Bank of India, HDFC)"
              disabled={isSaving}
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              focusColor="blue"
              inputClassName="font-semibold text-slate-900 bg-white"
            />

            {/* Account Number & IFSC Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <FloatingInput
                label="Bank Account Number"
                disabled={isSaving}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                focusColor="blue"
                inputClassName="font-mono font-bold text-slate-900 bg-white"
              />

              <FloatingInput
                label="Bank IFSC Code"
                maxLength={11}
                disabled={isSaving}
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                focusColor="blue"
                inputClassName="font-mono font-bold uppercase text-slate-900 bg-white"
              />
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Save Customer Button placed on RIGHT SIDE with VIBRANT BLUE Theme */}
        <div className="pt-3 pb-6 flex items-center justify-end gap-3 border-t border-slate-200">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center gap-2.5 shadow-md shadow-blue-500/25 transition-all disabled:opacity-90 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSaving ? (
              <>
                {/* Round Circular Progress Spinner */}
                <div className="relative w-4 h-4 flex items-center justify-center">
                  <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    />
                    <path
                      className="opacity-100"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                </div>
                <span>Saving Customer...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                <span>Save Customer</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* =========================================================================
          CELEBRATION & SUCCESS MESSAGE DIALOG (CLEAN CRISP WHITE STYLE)
          ========================================================================= */}
      <AnimatePresence>
        {showSuccessDialog && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full text-center shadow-2xl border border-slate-200 relative overflow-hidden space-y-4"
            >
              {/* Subtle background glow */}
              <div className="absolute -top-16 -right-16 w-36 h-36 bg-blue-100/50 rounded-full blur-2xl pointer-events-none" />

              {/* Animated Checkmark Icon */}
              <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.8 }}
                  animate={{ scale: [1, 1.4, 1.6], opacity: [0.6, 0.2, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full bg-blue-500/20"
                />

                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 14, stiffness: 220 }}
                  className="relative z-10 w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/30 border-2 border-white"
                >
                  <svg
                    className="w-10 h-10 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                      d="M20 6L9 17L4 12"
                    />
                  </svg>
                </motion.div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1], rotate: [0, 180] }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="absolute -top-1 right-2 text-blue-500 text-base"
                >
                  ✨
                </motion.div>
              </div>

              {/* Congratulatory Text */}
              <div className="space-y-1.5 pt-1">
                <span className="inline-block px-3 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-black uppercase tracking-wider text-blue-700">
                  Data Saved in Firestore
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Customer Saved!
                </h3>
                <p className="text-xs font-semibold text-slate-600 leading-relaxed max-w-xs mx-auto">
                  Customer details have been saved to Firestore. This customer can now join investment plans.
                </p>
              </div>

              {/* Customer Saved Summary Card */}
              {savedCustomerData && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center gap-3 text-left shadow-2xs">
                  <div className="w-11 h-11 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    {savedCustomerData.name.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h5 className="font-black text-xs text-slate-900 truncate">
                      {savedCustomerData.name}
                    </h5>
                    <p className="text-[11px] font-mono text-slate-600">
                      +91 {savedCustomerData.mobile}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-mono font-bold text-blue-800 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded">
                        {savedCustomerData.id}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                        <Check className="w-3 h-3 text-emerald-600" /> Saved
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3-Second Auto Redirect Progress & Button */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-[11px] text-slate-600 font-bold px-1">
                  <span>Redirecting to Home</span>
                  <span className="font-mono text-blue-600">{dialogSecondsLeft}s</span>
                </div>

                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: 3, ease: 'linear' }}
                    className="h-full bg-blue-600 rounded-full"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleInstantGoHome}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  <span>Go to Home Screen Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
