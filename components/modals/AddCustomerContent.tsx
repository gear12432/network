'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Customer } from '@/types/investment';
import {
  User,
  Building,
  Upload,
  RefreshCw,
  Camera,
  Image as ImageIcon,
  ShieldCheck,
  Sparkles,
  Check,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { triggerConfetti } from '@/lib/confetti';
import FloatingInput from '@/components/ui/FloatingInput';
import FloatingTextarea from '@/components/ui/FloatingTextarea';

interface AddCustomerContentProps {
  onSaveCustomer: (customer: Customer) => void;
  onViewCustomersList: () => void;
  totalCustomersCount: number;
  onClose: () => void;
  onNavigateHome?: () => void;
}

// Generates a clean realistic Customer ID
const generateCustomerId = () => {
  return `CUST-${Math.floor(100000 + Math.random() * 900000)}`;
};

export default function AddCustomerContent({
  onSaveCustomer,
  onViewCustomersList,
  totalCustomersCount,
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

  // KYC State
  const [panNumber, setPanNumber] = useState('');
  const [panImage, setPanImage] = useState<string | null>(null);
  const [panFileName, setPanFileName] = useState('');

  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarImage, setAadhaarImage] = useState<string | null>(null);
  const [aadhaarFileName, setAadhaarFileName] = useState('');

  const [photo, setPhoto] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState('');

  // Bank State
  const [bankHolderName, setBankHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  const [errorMsg, setErrorMsg] = useState('');

  // Saving Workflow States (4s circular progress + 3s success dialog)
  const [isSaving, setIsSaving] = useState(false);
  const [saveSecondsLeft, setSaveSecondsLeft] = useState(4);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [dialogSecondsLeft, setDialogSecondsLeft] = useState(3);
  const [savedCustomerData, setSavedCustomerData] = useState<Customer | null>(null);

  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const dialogIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
      if (dialogIntervalRef.current) clearInterval(dialogIntervalRef.current);
    };
  }, []);

  // Handle Image File Uploads
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'pan' | 'aadhaar' | 'photo'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (type === 'pan') {
        setPanImage(result);
        setPanFileName(file.name);
      } else if (type === 'aadhaar') {
        setAadhaarImage(result);
        setAadhaarFileName(file.name);
      } else if (type === 'photo') {
        setPhoto(result);
        setPhotoFileName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRegenerateId = () => {
    setCustomerId(generateCustomerId());
  };

  const handleStartSave = (e: React.FormEvent) => {
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
    const newCustomer: Customer = {
      id: customerId,
      name: name.trim(),
      mobile: mobile.trim(),
      address: address.trim() || 'N/A',
      state: stateName,
      district: district.trim() || 'N/A',
      pincode: pincode.trim() || 'N/A',
      panNumber: panNumber.trim().toUpperCase() || 'N/A',
      panImage: panImage || undefined,
      aadhaarNumber: aadhaarNumber.trim() || 'N/A',
      aadhaarImage: aadhaarImage || undefined,
      photo: photo || undefined,
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
    setIsSaving(true);
    setSaveSecondsLeft(4);

    // 4-Second Circular Progress Timer
    let seconds = 4;
    saveIntervalRef.current = setInterval(() => {
      seconds -= 1;
      setSaveSecondsLeft(seconds);
      if (seconds <= 0) {
        if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
        // Save customer data into app state
        onSaveCustomer(newCustomer);
        setIsSaving(false);
        setShowSuccessDialog(true);
        triggerConfetti();

        // 3-Second Countdown for Success Dialog
        let dialogCountdown = 3;
        setDialogSecondsLeft(3);
        dialogIntervalRef.current = setInterval(() => {
          dialogCountdown -= 1;
          setDialogSecondsLeft(dialogCountdown);
          if (dialogCountdown <= 0) {
            if (dialogIntervalRef.current) clearInterval(dialogIntervalRef.current);
            setShowSuccessDialog(false);
            onClose();
            onNavigateHome?.();
          }
        }, 1000);
      }
    }, 1000);
  };

  const handleInstantGoHome = () => {
    if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
    if (dialogIntervalRef.current) clearInterval(dialogIntervalRef.current);
    setShowSuccessDialog(false);
    onClose();
    onNavigateHome?.();
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
    <div className="space-y-4 pb-10">
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleStartSave} className="space-y-4">
        {/* BOX 1: Customer Personal Details */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-900" />
              <span>Customer Personal Details</span>
            </h4>

            {/* Auto Generated Customer ID */}
            <div className="flex items-center gap-1.5 bg-blue-50/80 border border-blue-200/60 px-2.5 py-1 rounded-lg">
              <span className="text-[10px] font-bold text-slate-600 uppercase">ID:</span>
              <span className="text-xs font-mono font-black text-blue-950">
                {customerId}
              </span>
              <button
                type="button"
                onClick={handleRegenerateId}
                disabled={isSaving}
                className="text-slate-400 hover:text-blue-900 p-0.5 transition-colors"
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
              inputClassName="font-bold text-black"
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
              inputClassName="font-mono font-bold text-black"
            />

            {/* Address */}
            <FloatingTextarea
              label="Full Residential Address (House/Street/Area)"
              rows={2}
              disabled={isSaving}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              focusColor="blue"
              textareaClassName="font-semibold text-black"
            />

            {/* State, District, PIN Code Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* State Dropdown */}
              <div className="relative group w-full">
                <select
                  value={stateName}
                  disabled={isSaving}
                  onChange={(e) => setStateName(e.target.value)}
                  className="w-full h-12 px-3 bg-white border border-slate-300 rounded-xl font-bold text-xs text-black focus:outline-none focus:border-blue-900 focus:ring-2 focus:ring-blue-900/20"
                >
                  {indianStates.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                <label className="absolute -top-2 left-3 bg-white px-1.5 text-[10px] font-bold text-slate-800 pointer-events-none select-none">
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
                inputClassName="font-semibold text-black"
              />

              {/* PIN Code */}
              <FloatingInput
                label="PIN Code"
                disabled={isSaving}
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                focusColor="blue"
                inputClassName="font-mono font-bold text-black"
              />
            </div>
          </div>
        </div>

        {/* BOX 2: KYC Form & Document Uploads */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-900" />
              <span>KYC Form & Documents</span>
            </h4>
            <span className="text-[10px] bg-blue-50 text-blue-900 font-bold px-2 py-0.5 rounded-full border border-blue-200/70">
              Safe & Encrypted
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* 1. Customer Passport Photo */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <label className="text-slate-700 font-bold block mb-1 flex items-center justify-between">
                <span>Customer Photo</span>
                {photo && (
                  <span className="text-blue-900 text-[10px] font-bold">Uploaded ✓</span>
                )}
              </label>

              <div className="flex items-center gap-3 mt-1.5">
                {photo ? (
                  <img
                    src={photo}
                    alt="Customer Preview"
                    className="w-12 h-12 rounded-xl object-cover border-2 border-blue-900 shadow-xs"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400">
                    <Camera className="w-5 h-5" />
                  </div>
                )}

                <div className="flex-1">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:border-blue-900 hover:bg-blue-50/50 active:scale-95 text-blue-950 rounded-lg font-bold text-xs cursor-pointer shadow-2xs transition-all">
                    <Upload className="w-3.5 h-3.5 text-blue-900" />
                    <span>Choose Photo File</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isSaving}
                      onChange={(e) => handleFileUpload(e, 'photo')}
                      className="hidden"
                    />
                  </label>
                  {photoFileName && (
                    <span className="text-[10px] text-slate-500 block mt-1 truncate max-w-xs">
                      {photoFileName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 2. PAN Card Details & Image File */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              <FloatingInput
                label="PAN Card Number"
                maxLength={10}
                disabled={isSaving}
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                focusColor="blue"
                inputClassName="font-mono uppercase font-bold text-black"
                rightElement={
                  panImage ? (
                    <span className="text-blue-900 bg-blue-100 text-[10px] font-black px-2 py-0.5 rounded border border-blue-200">
                      File Attached ✓
                    </span>
                  ) : null
                }
              />

              <div className="flex items-center justify-between pt-1">
                <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-300 hover:border-blue-900 hover:bg-blue-50/50 text-blue-950 rounded-lg font-bold text-xs cursor-pointer shadow-2xs transition-all">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-900" />
                  <span>Choose PAN Image File</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isSaving}
                    onChange={(e) => handleFileUpload(e, 'pan')}
                    className="hidden"
                  />
                </label>

                {panImage && (
                  <img
                    src={panImage}
                    alt="PAN"
                    className="w-9 h-7 rounded border border-blue-900 object-cover"
                  />
                )}
              </div>
            </div>

            {/* 3. Aadhaar Card Details & Image File */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              <FloatingInput
                label="Aadhaar Card Number"
                maxLength={14}
                disabled={isSaving}
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value)}
                focusColor="blue"
                inputClassName="font-mono font-bold text-black"
                rightElement={
                  aadhaarImage ? (
                    <span className="text-blue-900 bg-blue-100 text-[10px] font-black px-2 py-0.5 rounded border border-blue-200">
                      File Attached ✓
                    </span>
                  ) : null
                }
              />

              <div className="flex items-center justify-between pt-1">
                <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-300 hover:border-blue-900 hover:bg-blue-50/50 text-blue-950 rounded-lg font-bold text-xs cursor-pointer shadow-2xs transition-all">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-900" />
                  <span>Choose Aadhaar Image File</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isSaving}
                    onChange={(e) => handleFileUpload(e, 'aadhaar')}
                    className="hidden"
                  />
                </label>

                {aadhaarImage && (
                  <img
                    src={aadhaarImage}
                    alt="Aadhaar"
                    className="w-9 h-7 rounded border border-blue-900 object-cover"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* BOX 3: Bank Details Box */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
              <Building className="w-4 h-4 text-blue-900" />
              <span>Bank Settlement Details</span>
            </h4>
            <span className="text-[10px] text-slate-400">Direct Payout Account</span>
          </div>

          <div className="space-y-3 pt-1">
            {/* Bank Holder Name */}
            <FloatingInput
              label="Account Holder Name"
              disabled={isSaving}
              value={bankHolderName}
              onChange={(e) => setBankHolderName(e.target.value)}
              focusColor="blue"
              inputClassName="font-bold text-black"
            />

            {/* Bank Name */}
            <FloatingInput
              label="Bank Name (e.g. State Bank of India, HDFC)"
              disabled={isSaving}
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              focusColor="blue"
              inputClassName="font-semibold text-black"
            />

            {/* Account Number & IFSC Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <FloatingInput
                label="Bank Account Number"
                disabled={isSaving}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                focusColor="blue"
                inputClassName="font-mono font-bold text-black"
              />

              <FloatingInput
                label="Bank IFSC Code"
                maxLength={11}
                disabled={isSaving}
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                focusColor="blue"
                inputClassName="font-mono font-bold uppercase text-black"
              />
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Save Customer Button placed on RIGHT SIDE with Dark Blue Theme */}
        <div className="pt-3 pb-6 flex items-center justify-end gap-3 border-t border-slate-200/80">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-blue-950 hover:bg-blue-900 active:scale-95 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2.5 shadow-md shadow-blue-950/25 transition-all disabled:opacity-90 disabled:cursor-not-allowed"
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
                <span>Saving Customer ({saveSecondsLeft}s)...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-blue-300" />
                <span>Save Customer</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* =========================================================================
          LOTTIE CELEBRATION & SUCCESS MESSAGE DIALOG
          Auto-closes in 3 seconds and navigates to the Home screen
          ========================================================================= */}
      <AnimatePresence>
        {showSuccessDialog && (
          <div className="fixed inset-0 z-60 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full text-center shadow-2xl border border-slate-100 relative overflow-hidden space-y-4"
            >
              {/* Subtle decorative background gradient */}
              <div className="absolute -top-16 -right-16 w-36 h-36 bg-blue-100/60 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-indigo-100/60 rounded-full blur-2xl pointer-events-none" />

              {/* Lottie-style Animated Celebratory Checkmark Icon */}
              <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                {/* Ripple wave 1 */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.8 }}
                  animate={{ scale: [1, 1.4, 1.6], opacity: [0.6, 0.2, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full bg-blue-500/20"
                />
                {/* Ripple wave 2 */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0.8 }}
                  animate={{ scale: [1, 1.3, 1.5], opacity: [0.5, 0.15, 0] }}
                  transition={{ repeat: Infinity, duration: 2, delay: 0.4, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full bg-indigo-500/20"
                />

                {/* Dark Blue Circular Badge */}
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 14, stiffness: 220 }}
                  className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-tr from-blue-950 via-blue-900 to-indigo-900 flex items-center justify-center shadow-xl shadow-blue-950/30 border-2 border-blue-400/30"
                >
                  {/* Animated Checkmark Drawing Stroke */}
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

                {/* Floating sparkle stars */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1], rotate: [0, 180] }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="absolute -top-1 right-2 text-amber-400 text-base"
                >
                  ✨
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1], rotate: [0, -180] }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="absolute -bottom-1 left-2 text-blue-400 text-sm"
                >
                  ⭐
                </motion.div>
              </div>

              {/* Congratulatory Text */}
              <div className="space-y-1.5 pt-1">
                <span className="inline-block px-3 py-0.5 rounded-full bg-blue-50 border border-blue-200/80 text-[10px] font-black uppercase tracking-wider text-blue-950">
                  Data Saved Successfully
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Congratulations!
                </h3>
                <p className="text-xs font-semibold text-slate-700 leading-relaxed max-w-xs mx-auto">
                  Your customer data has been saved and is active now. This customer can now join investment plans.
                </p>
              </div>

              {/* Customer Saved Summary Card */}
              {savedCustomerData && (
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center gap-3 text-left">
                  {savedCustomerData.photo ? (
                    <img
                      src={savedCustomerData.photo}
                      alt={savedCustomerData.name}
                      className="w-11 h-11 rounded-xl object-cover border border-blue-900"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-xl bg-blue-950 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {savedCustomerData.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h5 className="font-extrabold text-xs text-slate-900 truncate">
                      {savedCustomerData.name}
                    </h5>
                    <p className="text-[11px] font-mono text-slate-500">
                      +91 {savedCustomerData.mobile}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-mono font-bold text-blue-950 bg-blue-100/80 px-1.5 py-0.2 rounded">
                        {savedCustomerData.id}
                      </span>
                      <span className="text-[10px] font-bold text-blue-900 flex items-center gap-0.5">
                        <Check className="w-3 h-3 text-blue-700" /> Active
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* 3-Second Auto Redirect Progress & Button */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold px-1">
                  <span>Redirecting to Home</span>
                  <span className="font-mono text-blue-950">{dialogSecondsLeft}s</span>
                </div>

                {/* Progress bar shrinking over 3 seconds */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: 3, ease: 'linear' }}
                    className="h-full bg-blue-950 rounded-full"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleInstantGoHome}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-blue-950 hover:bg-blue-900 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-950/20 transition-all"
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
