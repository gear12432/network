'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  FileText,
  MapPin,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  LogIn,
  UserPlus,
  Calendar,
} from 'lucide-react';
import {
  saveUserToFirestore,
  findUserInFirestore,
  generateUniqueLoginUid,
  UserAccountData,
} from '@/lib/firebase';
import { triggerConfetti } from '@/lib/confetti';

interface AuthScreenProps {
  onLoginSuccess: (user: UserAccountData) => void;
}

type AuthMode = 'login' | 'signup';
type SignUpStep = 'details' | 'kyc' | 'address' | 'confirm';

const STEPS: { id: SignUpStep; label: string; num: number }[] = [
  { id: 'details', label: 'Your Details', num: 1 },
  { id: 'kyc', label: 'KYC Details', num: 2 },
  { id: 'address', label: 'Address Details', num: 3 },
  { id: 'confirm', label: 'Confirm', num: 4 },
];

/**
 * Reusable Floating Label Input Component
 * - Center inside the input box when unfocused & empty.
 * - When clicked/focused or contains text, smoothly animates UP to sit directly ON the top border (outlined badge cutout).
 * - Pure white text, crisp font size, gold active label.
 */
interface FloatingInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  prefix?: string;
  required?: boolean;
  autoComplete?: string;
}

function FloatingInput({
  label,
  value,
  onChange,
  type = 'text',
  icon,
  rightElement,
  prefix,
  required,
  autoComplete,
}: FloatingInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const isFloating = isFocused || Boolean(value) || type === 'date';

  return (
    <div className="relative w-full pt-1.5">
      <div
        className={`relative flex items-center w-full min-h-[52px] h-[52px] sm:min-h-[56px] sm:h-14 bg-white rounded-xl transition-all duration-200 border-2 ${
          isFocused
            ? 'border-[#d0872e] ring-2 ring-[#d0872e]/20 shadow-md shadow-[#d0872e]/10'
            : 'border-[#dfbe7e] hover:border-[#c59c55]'
        }`}
      >
        {/* Left Icon */}
        {icon && (
          <div className="absolute left-3.5 z-10 flex items-center justify-center pointer-events-none text-[#8a5416]">
            {icon}
          </div>
        )}

        {/* Optional Prefix (e.g. +91) shown only when floating/focused */}
        {prefix && isFloating && (
          <span className="absolute left-10 text-xs sm:text-sm font-mono text-[#8a5416] font-bold pointer-events-none">
            {prefix}
          </span>
        )}

        {/* Smooth Floating Label Animation - Outlined on Top Border as marked by user */}
        <label
          className={`absolute pointer-events-none transition-all duration-200 ease-out origin-left select-none z-10 ${
            isFloating
              ? '-top-2.5 left-3 px-1.5 py-0 bg-[#faf6ee] text-xs font-bold text-[#8a5416] tracking-wide rounded border border-[#dfbe7e] shadow-xs'
              : `top-1/2 -translate-y-1/2 text-sm sm:text-base text-[#7a5328]/80 font-medium ${
                  icon ? 'left-10' : 'left-3.5'
                }`
          }`}
        >
          {label}
        </label>

        {/* Native Input - Dark Espresso Text */}
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          autoComplete={autoComplete}
          className={`w-full bg-transparent text-[#46280b] font-medium text-sm sm:text-base focus:outline-none transition-all [color-scheme:light] ${
            icon
              ? prefix && isFloating
                ? 'pl-18'
                : 'pl-10'
              : 'pl-3.5'
          } ${rightElement ? 'pr-11' : 'pr-3.5'} py-2.5`}
        />

        {/* Optional Right Action Element (e.g. Password Toggle) */}
        {rightElement && (
          <div className="absolute right-3.5 flex items-center justify-center">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Reusable Floating Select Component for KYC / Gender
 */
interface FloatingSelectProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  icon?: React.ReactNode;
}

function FloatingSelect({
  label,
  value,
  onChange,
  options,
  icon,
}: FloatingSelectProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative w-full pt-1.5">
      <div
        className={`relative flex items-center w-full min-h-[52px] h-[52px] sm:min-h-[56px] sm:h-14 bg-white rounded-xl transition-all duration-200 border-2 ${
          isFocused
            ? 'border-[#d0872e] ring-2 ring-[#d0872e]/20 shadow-md shadow-[#d0872e]/10'
            : 'border-[#dfbe7e] hover:border-[#c59c55]'
        }`}
      >
        {icon && (
          <div className="absolute left-3.5 z-10 flex items-center justify-center pointer-events-none text-[#8a5416]">
            {icon}
          </div>
        )}

        {/* Floating Label Outlined on Top Border */}
        <label
          className="absolute -top-2.5 left-3 px-1.5 py-0 bg-[#faf6ee] text-xs font-bold text-[#8a5416] tracking-wide pointer-events-none select-none z-10 rounded border border-[#dfbe7e] shadow-xs"
        >
          {label}
        </label>

        <select
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full bg-transparent text-[#46280b] font-medium text-sm sm:text-base focus:outline-none transition-all appearance-none cursor-pointer [color-scheme:light] ${
            icon ? 'pl-10' : 'pl-3.5'
          } pr-8 py-2.5`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#faf6ee] text-[#46280b]">
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom Arrow */}
        <div className="absolute right-3.5 pointer-events-none text-[#8a5416] text-xs">
          ▼
        </div>
      </div>
    </div>
  );
}

export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('login');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Signup form multi-step state
  const [currentStep, setCurrentStep] = useState<SignUpStep>('details');
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  // Step 1: Your Details
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Step 2: KYC Details
  const [idType, setIdType] = useState('Aadhaar Card');
  const [idNumber, setIdNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');

  // KYC Image files (base64 Data URLs)
  const [panImage, setPanImage] = useState<string>('');
  const [aadhaarFrontImage, setAadhaarFrontImage] = useState<string>('');
  const [aadhaarBackImage, setAadhaarBackImage] = useState<string>('');

  // Step 3: Address Details
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // Success Pop-up state & Pending Review Modal state
  const [createdUser, setCreatedUser] = useState<UserAccountData | null>(null);
  const [pendingNoticeUser, setPendingNoticeUser] = useState<UserAccountData | null>(null);
  const [approvedNoticeUser, setApprovedNoticeUser] = useState<UserAccountData | null>(null);
  const [copiedUid, setCopiedUid] = useState(false);
  const [copiedPwd, setCopiedPwd] = useState(false);

  // Helper to read file input into base64 Data URL
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) {
      setSignupError('Image file size must be less than 6MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setter(ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Re-fetch user status when checking pending review status
  const handleCheckPendingStatus = async () => {
    if (!pendingNoticeUser) return;
    setLoginLoading(true);
    try {
      const updatedUser = await findUserInFirestore(pendingNoticeUser.loginUid);
      if (updatedUser && updatedUser.status === 'active' && updatedUser.kycStatus === 'approved') {
        setPendingNoticeUser(null);
        setApprovedNoticeUser(updatedUser);
      } else {
        setSignupError('Your KYC verification is still under review by Admin Panel. Please check again later.');
      }
    } catch (err) {
      console.error('Error checking status:', err);
    } finally {
      setLoginLoading(false);
    }
  };

  // Step Validation (English error responses)
  const validateStep1 = () => {
    if (!fullName.trim()) return 'Please enter your full name';
    if (!mobile.trim() || mobile.replace(/\D/g, '').length < 10)
      return 'Please enter a valid 10-digit mobile number';
    if (!email.trim() || !email.includes('@'))
      return 'Please enter a valid email address';
    if (!password.trim() || password.length < 6)
      return 'Password must be at least 6 characters long';
    return null;
  };

  const validateStep2 = () => {
    if (!idNumber.trim()) return 'Please enter your Document / ID number';
    if (!dob.trim()) return 'Please enter your Date of Birth';
    return null;
  };

  const validateStep3 = () => {
    if (!street.trim()) return 'Please enter your street address or house number';
    if (!city.trim()) return 'Please enter your city or district';
    if (!state.trim()) return 'Please enter your state';
    if (!pincode.trim() || pincode.length < 6)
      return 'Please enter a valid 6-digit PIN code';
    return null;
  };

  const handleNextStep = () => {
    setSignupError(null);
    if (currentStep === 'details') {
      const err = validateStep1();
      if (err) {
        setSignupError(err);
        return;
      }
      setCurrentStep('kyc');
    } else if (currentStep === 'kyc') {
      const err = validateStep2();
      if (err) {
        setSignupError(err);
        return;
      }
      setCurrentStep('address');
    } else if (currentStep === 'address') {
      const err = validateStep3();
      if (err) {
        setSignupError(err);
        return;
      }
      setCurrentStep('confirm');
    }
  };

  const handlePrevStep = () => {
    setSignupError(null);
    if (currentStep === 'kyc') setCurrentStep('details');
    else if (currentStep === 'address') setCurrentStep('kyc');
    else if (currentStep === 'confirm') setCurrentStep('address');
  };

  // Confirm and save to Firebase Firestore
  const handleConfirmAndRegister = async () => {
    setSignupLoading(true);
    setSignupError(null);
    try {
      // 1. Generate unique UID e.g. GK37643
      const generatedUid = await generateUniqueLoginUid();

      const newUserData: UserAccountData = {
        loginUid: generatedUid,
        fullName: fullName.trim(),
        mobile: mobile.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        kycDetails: {
          idType,
          idNumber: idNumber.trim().toUpperCase(),
          panNumber: panNumber.trim().toUpperCase() || idNumber.trim().toUpperCase(),
          aadhaarNumber: idNumber.trim().toUpperCase(),
          dob,
          gender,
          panImage,
          aadhaarFrontImage,
          aadhaarBackImage,
        },
        addressDetails: {
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
        },
        balance: 12500,
        vipLevel: 1,
        status: 'pending_approval',
        kycStatus: 'pending',
        createdAt: new Date().toISOString(),
      };

      // 2. Save into Firestore
      const res = await saveUserToFirestore(newUserData);
      if (!res.success) {
        console.warn('Firestore write warning:', res.error);
      }

      // Also persist to localStorage for instant offline access
      if (typeof window !== 'undefined') {
        localStorage.setItem(`user_${generatedUid}`, JSON.stringify(newUserData));
        localStorage.setItem('network_join_pro_last_registered', JSON.stringify(newUserData));
      }

      // Trigger Confetti celebration
      triggerConfetti();

      // Show the Success Pop-up with Pending Review Notice
      setCreatedUser(newUserData);
    } catch (err: unknown) {
      console.error('Registration failed:', err);
      const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setSignupError(msg);
    } finally {
      setSignupLoading(false);
    }
  };

  // Handle Login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const identifier = loginIdentifier.trim();
    const pwd = loginPassword;

    if (!identifier) {
      setLoginError('Please enter your Login UID or Email');
      return;
    }
    if (!pwd) {
      setLoginError('Please enter your Password');
      return;
    }

    setLoginLoading(true);
    try {
      // 1. First check Firebase Firestore
      let user = await findUserInFirestore(identifier);

      // 2. Check localStorage fallback if offline or recently created
      if (!user && typeof window !== 'undefined') {
        const upperId = identifier.toUpperCase();
        const cached = localStorage.getItem(`user_${upperId}`);
        if (cached) {
          try {
            user = JSON.parse(cached);
          } catch {
            // ignore
          }
        }
        if (!user) {
          const lastReg = localStorage.getItem('network_join_pro_last_registered');
          if (lastReg) {
            try {
              const parsed = JSON.parse(lastReg);
              if (
                parsed.loginUid?.toUpperCase() === upperId ||
                parsed.email?.toLowerCase() === identifier.toLowerCase() ||
                parsed.mobile === identifier
              ) {
                user = parsed;
              }
            } catch {
              // ignore
            }
          }
        }
      }

      // 3. Demo fallback if user enters demo credentials
      if (!user && (identifier.toUpperCase() === 'GK37643' || identifier.toLowerCase() === 'skjiyaul842@gmail.com')) {
        user = {
          loginUid: 'GK37643',
          fullName: 'Sk Jiyaul',
          mobile: '9876543210',
          email: 'skjiyaul842@gmail.com',
          password: pwd || '123456',
          kycDetails: {
            idType: 'Aadhaar Card',
            idNumber: 'XXXX-XXXX-8942',
            dob: '1995-05-15',
            gender: 'Male',
          },
          addressDetails: {
            street: 'Station Road, Ward 4',
            city: 'Kolkata',
            state: 'West Bengal',
            pincode: '700001',
          },
          balance: 14850,
          vipLevel: 3,
          status: 'active',
          kycStatus: 'approved',
        };
      }

      if (!user) {
        setLoginError('Account not found with this Login UID or Email. Please check details or create a new account.');
        setLoginLoading(false);
        return;
      }

      // Check Password
      if (user.password && user.password !== pwd) {
        setLoginError('Incorrect Password! Please check and enter the correct password.');
        setLoginLoading(false);
        return;
      }

      // Check account approval status
      if (user.status === 'pending_approval' || user.kycStatus === 'pending' || user.kycStatus === 'rejected') {
        setPendingNoticeUser(user);
        setLoginLoading(false);
        return;
      }

      // Login Successful (Account is active & KYC approved!)
      if (typeof window !== 'undefined') {
        localStorage.setItem('network_join_pro_user', JSON.stringify(user));
      }
      setApprovedNoticeUser(user);
    } catch (err: unknown) {
      console.error('Login error:', err);
      setLoginError('Login service error. Please check your internet connection.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleCopy = (text: string, type: 'uid' | 'pwd') => {
    navigator.clipboard?.writeText(text);
    if (type === 'uid') {
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    } else {
      setCopiedPwd(true);
      setTimeout(() => setCopiedPwd(false), 2000);
    }
  };

  const handleSwitchToLoginWithCredentials = () => {
    if (createdUser) {
      setLoginIdentifier(createdUser.loginUid);
      setLoginPassword(createdUser.password);
    }
    setCreatedUser(null);
    setMode('login');
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#faf6ee] text-[#46280b] flex flex-col justify-between overflow-y-auto selection:bg-[#d0872e] selection:text-white">
      {/* Background Ambience with warm gold / bronze glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#dfbe7e]/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#d0872e]/10 rounded-full blur-[100px]" />
      </div>

      {/* Main Full-Screen Content (Clean layout without top box/tabs) */}
      <div className="relative z-10 w-full max-w-xl mx-auto flex-1 flex flex-col px-5 py-6 sm:px-8 sm:py-8">
        {/* =========================================================================
            VIEW 1: LOGIN (Full-screen, NO boxes, Smooth Floating Labels)
           ========================================================================= */}
        {mode === 'login' && (
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 15 }}
            className="flex-1 flex flex-col justify-center py-4"
          >
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#46280b]">
                Sign In to Your Account
              </h2>
              <p className="text-xs sm:text-sm text-[#7a5328] mt-1.5">
                Enter your <strong className="text-[#46280b]">Login UID</strong> (e.g. <code className="bg-[#faecd4] text-[#8a5416] px-1.5 py-0.5 rounded border border-[#dfbe7e] font-mono">GK37643</code>) and password to access your dashboard.
              </p>
            </div>

            {loginError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 p-3.5 mb-5 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <span>{loginError}</span>
              </motion.div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4.5">
              {/* Floating Input: Login UID or Email */}
              <FloatingInput
                label="Login UID or Email Address"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                icon={<User className="w-4 h-4" />}
                required
                autoComplete="username"
              />

              {/* Floating Input: Password */}
              <FloatingInput
                label="Account Password"
                type={showLoginPassword ? 'text' : 'password'}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                required
                autoComplete="current-password"
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="text-[#8a5416] hover:text-[#46280b] p-1"
                    tabIndex={-1}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              {/* Forgot Password Link */}
              <div className="flex justify-end pt-0.5">
                <span className="text-[11px] text-[#8a5416] font-semibold cursor-pointer hover:underline hover:text-[#d0872e]">
                  Forgot Password?
                </span>
              </div>

              {/* Action Button: #D0872E */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3.5 px-5 rounded-xl bg-[#D0872E] hover:bg-[#b87324] text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-[#d0872e]/25 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loginLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying with Firebase Cloud...</span>
                    </>
                  ) : (
                    <>
                      <span>Login to Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Switch to Signup */}
              <div className="text-center pt-3">
                <p className="text-xs text-[#7a5328]">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setSignupError(null);
                    }}
                    className="text-[#8a5416] font-bold hover:underline ml-1"
                  >
                    Sign Up Now
                  </button>
                </p>
              </div>
            </form>
          </motion.div>
        )}

        {/* =========================================================================
            VIEW 2: SIGN UP (Multi-step Status Progression, Full-screen, Smooth Floating Labels)
           ========================================================================= */}
        {mode === 'signup' && (
          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="flex-1 flex flex-col justify-start py-2"
          >
            {/* Top Status Bar / Stepper Progression (Clean English) */}
            <div className="mb-6 pt-1">
              <div className="flex items-center justify-between relative">
                {/* Horizontal progress track line */}
                <div className="absolute top-4 left-6 right-6 h-0.5 bg-[#dfbe7e]/50 -z-0" />
                <div
                  className="absolute top-4 left-6 h-0.5 bg-[#d0872e] transition-all duration-300 -z-0"
                  style={{
                    width:
                      currentStep === 'details'
                        ? '0%'
                        : currentStep === 'kyc'
                        ? '33%'
                        : currentStep === 'address'
                        ? '66%'
                        : '100%',
                  }}
                />

                {STEPS.map((s) => {
                  const isActive = currentStep === s.id;
                  const isDone =
                    (s.id === 'details' && currentStep !== 'details') ||
                    (s.id === 'kyc' && (currentStep === 'address' || currentStep === 'confirm')) ||
                    (s.id === 'address' && currentStep === 'confirm');

                  return (
                    <div
                      key={s.id}
                      className="flex flex-col items-center z-10 cursor-pointer"
                      onClick={() => {
                        // Allow clicking back to completed steps
                        if (isDone) setCurrentStep(s.id);
                      }}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md ${
                          isDone
                            ? 'bg-[#22c55e] text-white shadow-[#22c55e]/30'
                            : isActive
                            ? 'bg-[#d0872e] text-white ring-4 ring-[#d0872e]/30 shadow-[#d0872e]/40'
                            : 'bg-[#fff8ea] border-2 border-[#dfbe7e] text-[#7a5328]'
                        }`}
                      >
                        {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                      </div>
                      <span
                        className={`text-[10px] mt-1.5 font-medium whitespace-nowrap ${
                          isActive
                            ? 'text-[#8a5416] font-bold'
                            : isDone
                            ? 'text-[#22c55e]'
                            : 'text-[#7a5328]'
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Error Notification */}
            {signupError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 p-3.5 mb-4 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <span>{signupError}</span>
              </motion.div>
            )}

            {/* STEP 1: Your Details */}
            {currentStep === 'details' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#46280b]">
                    1. Personal Information
                  </h3>
                  <p className="text-xs text-[#7a5328] mt-0.5">
                    Please provide your legal name, mobile number, and secure password
                  </p>
                </div>

                {/* Full Name Floating Input */}
                <FloatingInput
                  label="Full Legal Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  icon={<User className="w-4 h-4" />}
                  required
                />

                {/* Mobile Number Floating Input */}
                <FloatingInput
                  label="Mobile Number"
                  type="tel"
                  prefix="+91"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  icon={<Phone className="w-4 h-4" />}
                  required
                />

                {/* Email Floating Input */}
                <FloatingInput
                  label="Email Address / Gmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="w-4 h-4" />}
                  required
                />

                {/* Password Floating Input */}
                <FloatingInput
                  label="Create Secure Password (min 6 characters)"
                  type={showSignupPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="w-4 h-4" />}
                  required
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="text-[#8a5416] hover:text-[#46280b] p-1"
                      tabIndex={-1}
                    >
                      {showSignupPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  }
                />

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full py-3.5 px-5 rounded-xl bg-[#D0872E] hover:bg-[#b87324] text-white font-bold text-sm tracking-wide shadow-lg shadow-[#d0872e]/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <span>Next: KYC Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: KYC Details */}
            {currentStep === 'kyc' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#46280b]">
                    2. KYC Verification Details
                  </h3>
                  <p className="text-xs text-[#7a5328] mt-0.5">
                    Select a government-issued identification document
                  </p>
                </div>

                {/* ID Type Floating Select */}
                <FloatingSelect
                  label="Government ID Type"
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  icon={<FileText className="w-4 h-4" />}
                  options={[
                    { value: 'Aadhaar Card', label: 'Aadhaar Card' },
                    { value: 'PAN Card', label: 'PAN Card' },
                    { value: 'Voter ID', label: 'Voter ID Card' },
                    { value: 'Driving License', label: 'Driving License' },
                  ]}
                />

                {/* ID Number Floating Input */}
                <FloatingInput
                  label="Aadhaar / ID Card Number"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value.toUpperCase())}
                  icon={<FileText className="w-4 h-4" />}
                  required
                />

                {/* PAN Number Input */}
                <FloatingInput
                  label="PAN Card Number"
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  icon={<FileText className="w-4 h-4" />}
                />

                {/* DOB & Gender */}
                <div className="grid grid-cols-2 gap-3">
                  <FloatingInput
                    label="Date of Birth"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    icon={<Calendar className="w-4 h-4" />}
                    required
                  />

                  <FloatingSelect
                    label="Gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    options={[
                      { value: 'Male', label: 'Male' },
                      { value: 'Female', label: 'Female' },
                      { value: 'Other', label: 'Other' },
                    ]}
                  />
                </div>

                {/* Document Upload Buttons (Choice File) */}
                <div className="space-y-3 pt-1">
                  <span className="text-xs font-bold text-[#8a5416] block uppercase tracking-wider">
                    Upload KYC Document Copies (Images)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* PAN Image Upload */}
                    <div className="bg-white border-2 border-dashed border-[#dfbe7e] rounded-xl p-2.5 text-center flex flex-col items-center justify-center relative hover:border-[#d0872e] transition-colors">
                      {panImage ? (
                        <div className="w-full h-16 relative rounded-lg overflow-hidden border border-[#dfbe7e] mb-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={panImage} alt="PAN Document" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-[#faf6ee] border border-[#dfbe7e] flex items-center justify-center text-[#8a5416] mb-1">
                          <FileText className="w-4 h-4" />
                        </div>
                      )}
                      <span className="text-[11px] font-bold text-[#46280b] mb-1">PAN Card Image</span>
                      <label className="px-2.5 py-1 rounded-lg bg-[#D0872E] hover:bg-[#b87324] text-white text-[10px] font-bold cursor-pointer transition-colors shadow-xs">
                        {panImage ? 'Change File' : 'Choose File'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, setPanImage)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Aadhaar Front Image Upload */}
                    <div className="bg-white border-2 border-dashed border-[#dfbe7e] rounded-xl p-2.5 text-center flex flex-col items-center justify-center relative hover:border-[#d0872e] transition-colors">
                      {aadhaarFrontImage ? (
                        <div className="w-full h-16 relative rounded-lg overflow-hidden border border-[#dfbe7e] mb-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={aadhaarFrontImage} alt="Aadhaar Front" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-[#faf6ee] border border-[#dfbe7e] flex items-center justify-center text-[#8a5416] mb-1">
                          <FileText className="w-4 h-4" />
                        </div>
                      )}
                      <span className="text-[11px] font-bold text-[#46280b] mb-1">Aadhaar Front</span>
                      <label className="px-2.5 py-1 rounded-lg bg-[#D0872E] hover:bg-[#b87324] text-white text-[10px] font-bold cursor-pointer transition-colors shadow-xs">
                        {aadhaarFrontImage ? 'Change File' : 'Choose File'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, setAadhaarFrontImage)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Aadhaar Back Image Upload */}
                    <div className="bg-white border-2 border-dashed border-[#dfbe7e] rounded-xl p-2.5 text-center flex flex-col items-center justify-center relative hover:border-[#d0872e] transition-colors">
                      {aadhaarBackImage ? (
                        <div className="w-full h-16 relative rounded-lg overflow-hidden border border-[#dfbe7e] mb-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={aadhaarBackImage} alt="Aadhaar Back" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-[#faf6ee] border border-[#dfbe7e] flex items-center justify-center text-[#8a5416] mb-1">
                          <FileText className="w-4 h-4" />
                        </div>
                      )}
                      <span className="text-[11px] font-bold text-[#46280b] mb-1">Aadhaar Back</span>
                      <label className="px-2.5 py-1 rounded-lg bg-[#D0872E] hover:bg-[#b87324] text-white text-[10px] font-bold cursor-pointer transition-colors shadow-xs">
                        {aadhaarBackImage ? 'Change File' : 'Choose File'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, setAadhaarBackImage)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="w-1/3 py-3.5 px-3 rounded-xl bg-[#fff7ea] hover:bg-[#faecd4] text-[#55361e] border-2 border-[#dfbe7e] font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-[#8a5416]" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex-1 py-3.5 px-5 rounded-xl bg-[#D0872E] hover:bg-[#b87324] text-white font-bold text-sm tracking-wide shadow-lg shadow-[#d0872e]/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <span>Next: Address Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Address Details */}
            {currentStep === 'address' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#46280b]">
                    3. Residential Address
                  </h3>
                  <p className="text-xs text-[#7a5328] mt-0.5">
                    Enter your complete permanent residential address
                  </p>
                </div>

                {/* Street Address Floating Input */}
                <FloatingInput
                  label="Street Address / House No."
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  icon={<MapPin className="w-4 h-4" />}
                  required
                />

                {/* City & State */}
                <div className="grid grid-cols-2 gap-3">
                  <FloatingInput
                    label="City / District"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />

                  <FloatingInput
                    label="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                  />
                </div>

                {/* Pin Code Floating Input */}
                <FloatingInput
                  label="6-Digit Postal PIN Code"
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                />

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="w-1/3 py-3.5 px-3 rounded-xl bg-[#fff7ea] hover:bg-[#faecd4] text-[#55361e] border-2 border-[#dfbe7e] font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-[#8a5416]" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex-1 py-3.5 px-5 rounded-xl bg-[#D0872E] hover:bg-[#b87324] text-white font-bold text-sm tracking-wide shadow-lg shadow-[#d0872e]/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <span>Review & Confirm</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Confirm (Final Confirmation) */}
            {currentStep === 'confirm' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#46280b]">
                    4. Confirm Registration Details
                  </h3>
                  <p className="text-xs text-[#7a5328] mt-0.5">
                    Please carefully review all your entered information before submission
                  </p>
                </div>

                {/* Summary Rows (Fluid list with cream/gold presentation) */}
                <div className="space-y-3 py-1 text-xs">
                  {/* Personal Summary */}
                  <div className="bg-gradient-to-b from-[#fffefc] via-[#fbf5e7] to-[#f4e4c2] border-2 border-[#dfbe7e] rounded-xl p-3.5 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between text-[#8a5416] font-bold">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#d0872e]" />
                        Personal Information
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep('details')}
                        className="text-[#8a5416] underline text-[11px] cursor-pointer hover:text-[#d0872e] font-bold"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[#46280b]">
                      <div>
                        <span className="text-[#7a5328] block text-[10px]">Name:</span>
                        <span className="font-bold text-[#46280b]">{fullName}</span>
                      </div>
                      <div>
                        <span className="text-[#7a5328] block text-[10px]">Mobile:</span>
                        <span className="font-mono font-bold text-[#46280b]">+91 {mobile}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[#7a5328] block text-[10px]">Email:</span>
                        <span className="font-semibold text-[#46280b]">{email}</span>
                      </div>
                    </div>
                  </div>

                  {/* KYC Summary */}
                  <div className="bg-gradient-to-b from-[#fffefc] via-[#fbf5e7] to-[#f4e4c2] border-2 border-[#dfbe7e] rounded-xl p-3.5 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between text-[#8a5416] font-bold">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#d0872e]" />
                        KYC Details
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep('kyc')}
                        className="text-[#8a5416] underline text-[11px] cursor-pointer hover:text-[#d0872e] font-bold"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[#46280b]">
                      <div>
                        <span className="text-[#7a5328] block text-[10px]">Document:</span>
                        <span className="font-bold text-[#46280b]">{idType}</span>
                      </div>
                      <div>
                        <span className="text-[#7a5328] block text-[10px]">ID Number:</span>
                        <span className="font-mono font-bold text-[#46280b]">{idNumber}</span>
                      </div>
                      <div>
                        <span className="text-[#7a5328] block text-[10px]">Date of Birth:</span>
                        <span className="font-semibold text-[#46280b]">{dob}</span>
                      </div>
                      <div>
                        <span className="text-[#7a5328] block text-[10px]">Gender:</span>
                        <span className="font-semibold text-[#46280b]">{gender}</span>
                      </div>
                    </div>
                  </div>

                  {/* Address Summary */}
                  <div className="bg-gradient-to-b from-[#fffefc] via-[#fbf5e7] to-[#f4e4c2] border-2 border-[#dfbe7e] rounded-xl p-3.5 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between text-[#8a5416] font-bold">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#d0872e]" />
                        Address Details
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep('address')}
                        className="text-[#8a5416] underline text-[11px] cursor-pointer hover:text-[#d0872e] font-bold"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="text-[#46280b] space-y-0.5">
                      <p className="font-semibold text-[#46280b]">{street}</p>
                      <p className="text-[#7a5328]">
                        {city}, {state} - <span className="font-mono font-bold text-[#46280b]">{pincode}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="w-1/3 py-3.5 px-3 rounded-xl bg-[#fff7ea] hover:bg-[#faecd4] text-[#55361e] border-2 border-[#dfbe7e] font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-[#8a5416]" />
                    <span>Back</span>
                  </button>

                  {/* Final Confirm Button: #D0872E */}
                  <button
                    type="button"
                    disabled={signupLoading}
                    onClick={handleConfirmAndRegister}
                    className="flex-1 py-4 px-5 rounded-xl bg-[#D0872E] hover:bg-[#b87324] text-white font-black text-sm tracking-wide shadow-xl shadow-[#d0872e]/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 transition-all"
                  >
                    {signupLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Saving to Firebase Cloud...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm & Create Account</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Login link below Sign Up steps */}
            <div className="text-center pt-6 pb-2">
              <p className="text-xs sm:text-sm text-[#7a5328]">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setLoginError(null);
                  }}
                  className="text-[#8a5416] font-black underline hover:text-[#d0872e] cursor-pointer ml-1 text-sm tracking-wide transition-colors"
                >
                  Login
                </button>
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* =========================================================================
          SUCCESS POP-UP MODAL (Congratulations, Login UID & Password in English)
         ========================================================================= */}
      <AnimatePresence>
        {createdUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md bg-[#faf6ee] border-2 border-[#dfbe7e] text-[#46280b] rounded-3xl p-6 shadow-2xl relative overflow-hidden"
            >
              {/* Gold Top Ambient Light */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#dfbe7e]/30 rounded-full blur-2xl pointer-events-none" />

              {/* Medallion */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#894b0a] via-[#d0872e] to-[#ffd485] p-0.5 shadow-lg shadow-[#d0872e]/30 flex items-center justify-center mb-3">
                  <div className="w-full h-full bg-[#faf6ee] rounded-[14px] flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-[#d0872e]" />
                  </div>
                </div>

                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8a5416]">
                  Account Created Successfully
                </span>

                <h3 className="font-serif font-black text-xl text-[#46280b] mt-1">
                  Congratulations!
                </h3>

                <p className="text-xs text-[#7a5328] mt-2 px-2 leading-relaxed">
                  Congratulations! Your account has been successfully created. Now login using this Login UID and Password:
                </p>
              </div>

              {/* Generated UID and Password Display with 1-Click Copy */}
              <div className="space-y-2.5 my-5">
                {/* Login UID Card */}
                <div className="bg-gradient-to-b from-[#fffefc] via-[#fbf5e7] to-[#f4e4c2] border-2 border-[#dfbe7e] rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[10px] text-[#7a5328] uppercase font-semibold block">
                      YOUR LOGIN UID
                    </span>
                    <span className="font-mono text-lg font-black text-[#8a5416] tracking-wider">
                      {createdUser.loginUid}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(createdUser.loginUid, 'uid')}
                    className="px-3 py-1.5 rounded-lg bg-[#fff7ea] hover:bg-[#faecd4] border-2 border-[#dfbe7e] text-xs font-semibold text-[#8a5416] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    {copiedUid ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#22c55e]" />
                        <span className="text-[#22c55e]">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#d0872e]" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Password Card */}
                <div className="bg-gradient-to-b from-[#fffefc] via-[#fbf5e7] to-[#f4e4c2] border-2 border-[#dfbe7e] rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[10px] text-[#7a5328] uppercase font-semibold block">
                      YOUR PASSWORD
                    </span>
                    <span className="font-mono text-base font-bold text-[#46280b] tracking-widest">
                      {createdUser.password}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(createdUser.password, 'pwd')}
                    className="px-3 py-1.5 rounded-lg bg-[#fff7ea] hover:bg-[#faecd4] border-2 border-[#dfbe7e] text-xs font-semibold text-[#46280b] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    {copiedPwd ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#22c55e]" />
                        <span className="text-[#22c55e]">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#d0872e]" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Action Button: #D0872E */}
              <button
                type="button"
                onClick={handleSwitchToLoginWithCredentials}
                className="w-full py-3.5 rounded-xl bg-[#D0872E] hover:bg-[#b87324] text-white font-black text-sm tracking-wide shadow-lg shadow-[#d0872e]/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Login Now with this UID</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}

        {/* =========================================================================
            PENDING KYC REVIEW MODAL (Confirmation message: Reviewing within 24 hours)
           ========================================================================= */}
        {pendingNoticeUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md bg-[#faf6ee] border-2 border-[#dfbe7e] text-[#46280b] rounded-3xl p-6 shadow-2xl relative overflow-hidden text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-amber-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
                <AlertCircle className="w-8 h-8" />
              </div>

              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                KYC Verification Pending
              </span>

              <h3 className="font-serif font-black text-xl text-[#46280b] mt-3">
                Verification Under Review
              </h3>

              <div className="bg-amber-50/80 border-2 border-amber-200/80 rounded-2xl p-4 my-4 text-left space-y-2">
                <p className="text-xs sm:text-sm text-[#46280b] font-medium leading-relaxed">
                  Your KYC verification is currently under review by the Admin Panel. Your account credentials (User ID & Password) will be activated within <strong className="text-[#8a5416]">24 hours</strong> once approved.
                </p>
                <div className="pt-2 border-t border-amber-200 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-amber-800 font-semibold">Login UID:</span>
                    <span className="font-mono font-bold text-[#8a5416]">{pendingNoticeUser.loginUid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-800 font-semibold">Full Name:</span>
                    <span className="font-medium text-[#46280b]">{pendingNoticeUser.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-800 font-semibold">Status:</span>
                    <span className="font-bold text-amber-700 uppercase">Pending Approval</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  disabled={loginLoading}
                  onClick={handleCheckPendingStatus}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#D0872E] hover:bg-[#b87324] text-white font-bold text-sm tracking-wide shadow-md shadow-[#d0872e]/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
                >
                  {loginLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Check Verification Status</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setPendingNoticeUser(null)}
                  className="w-full py-2.5 text-xs text-[#8a5416] font-semibold hover:underline cursor-pointer"
                >
                  Close & Back to Login
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* =========================================================================
            APPROVED NOTICE MODAL (Congratulations & Access Dashboard)
           ========================================================================= */}
        {approvedNoticeUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md bg-[#faf6ee] border-2 border-[#dfbe7e] text-[#46280b] rounded-3xl p-6 shadow-2xl relative overflow-hidden text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                Account Approved
              </span>

              <h3 className="font-serif font-black text-xl text-[#46280b] mt-3">
                Congratulations!
              </h3>

              <div className="bg-emerald-50/80 border-2 border-emerald-200/80 rounded-2xl p-4 my-4 text-left space-y-2">
                <p className="text-xs sm:text-sm text-[#46280b] font-medium leading-relaxed">
                  Congratulations! Your account has been approved by the Admin Panel.
                </p>
                <div className="pt-2 border-t border-emerald-200 text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-800 font-semibold">User ID:</span>
                    <span className="font-bold text-[#8a5416] bg-white px-2 py-0.5 rounded border border-emerald-300">
                      {approvedNoticeUser.loginUid}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-800 font-semibold">Password:</span>
                    <span className="font-bold text-[#46280b] bg-white px-2 py-0.5 rounded border border-emerald-300">
                      {approvedNoticeUser.password}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const u = approvedNoticeUser;
                  setApprovedNoticeUser(null);
                  onLoginSuccess(u);
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm tracking-wide shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Proceed to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
