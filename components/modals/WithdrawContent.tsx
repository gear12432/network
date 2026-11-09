'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Building,
  CreditCard,
  AlertCircle,
  Plus,
  ArrowLeft,
  Check,
  ChevronRight,
  Clock,
  Sparkles,
  Lock,
} from 'lucide-react';
import { triggerConfetti } from '@/lib/confetti';
import { UserStats, Transaction } from '@/types/investment';
import {
  UserAccountData,
  WithdrawalRecord,
  saveWithdrawalToFirestore,
  updateUserProfileInFirestore,
  updateUserBalanceInFirestore,
} from '@/lib/firebase';

export interface BankAccountInfo {
  bankHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId?: string;
}

interface WithdrawContentProps {
  userStats: UserStats;
  currentUser?: UserAccountData | null;
  onWithdrawSuccess: (
    amount: number,
    target: string,
    withdrawalData?: WithdrawalRecord
  ) => void;
  onClose?: () => void;
}

const POPULAR_BANKS = [
  'State Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Punjab National Bank',
  'Axis Bank',
  'Bank of Baroda',
  'Kotak Mahindra Bank',
  'Canara Bank',
];

const QUICK_AMOUNTS = [200, 500, 1000, 2000, 5000];

export default function WithdrawContent({
  userStats,
  currentUser,
  onWithdrawSuccess,
  onClose,
}: WithdrawContentProps) {
  // Screen views: 'withdraw' | 'add-bank'
  const [currentView, setCurrentView] = useState<'withdraw' | 'add-bank'>('withdraw');

  // Available balance
  const currentBalance = userStats?.walletBalance ?? 0;

  // Amount input state
  const [withdrawAmount, setWithdrawAmount] = useState<string>('500');

  // Saved Bank Account state
  const [bankAccount, setBankAccount] = useState<BankAccountInfo | null>(null);

  // Add Bank form states
  const [bankHolderName, setBankHolderName] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState<string>('');
  const [ifscCode, setIfscCode] = useState<string>('');
  const [bankFormError, setBankFormError] = useState<string | null>(null);
  const [isBankSaving, setIsBankSaving] = useState(false);
  const [bankSaveSuccess, setBankSaveSuccess] = useState(false);

  // Withdrawal processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [successRecord, setSuccessRecord] = useState<WithdrawalRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize Bank Account from currentUser or localStorage
  useEffect(() => {
    // 1. Try from currentUser profile
    if (currentUser?.bankDetails?.accountNumber) {
      setBankAccount({
        bankHolderName:
          currentUser.bankDetails.bankHolderName || currentUser.fullName || 'Sk Jiyaul',
        bankName: currentUser.bankDetails.bankName || 'State Bank of India',
        accountNumber: currentUser.bankDetails.accountNumber,
        ifscCode: currentUser.bankDetails.ifscCode || 'SBIN0001234',
        upiId: currentUser.bankDetails.upiId || '',
      });
      return;
    }

    // 2. Try from localStorage
    try {
      const savedLocal = localStorage.getItem('network_join_pro_saved_bank');
      if (savedLocal) {
        const parsed = JSON.parse(savedLocal) as BankAccountInfo;
        if (parsed.accountNumber && parsed.bankName) {
          setBankAccount(parsed);
          return;
        }
      }
    } catch {
      // ignore
    }

    // 3. Sensible default based on user data
    const defaultHolder = currentUser?.fullName || userStats?.userName || 'Sk Jiyaul';
    const fallbackBank: BankAccountInfo = {
      bankHolderName: defaultHolder,
      bankName: 'HDFC Bank',
      accountNumber: '501004928192',
      ifscCode: 'HDFC0000128',
    };
    setBankAccount(fallbackBank);
  }, [currentUser, userStats]);

  // When opening Add Bank, pre-fill inputs if bankAccount already exists
  const handleOpenAddBank = () => {
    if (bankAccount) {
      setBankHolderName(bankAccount.bankHolderName);
      setBankName(bankAccount.bankName);
      setAccountNumber(bankAccount.accountNumber);
      setConfirmAccountNumber(bankAccount.accountNumber);
      setIfscCode(bankAccount.ifscCode);
    } else {
      setBankHolderName(currentUser?.fullName || userStats?.userName || '');
      setBankName('State Bank of India');
      setAccountNumber('');
      setConfirmAccountNumber('');
      setIfscCode('');
    }
    setBankFormError(null);
    setCurrentView('add-bank');
  };

  // Save Bank Account
  const handleSaveBank = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setBankFormError(null);

    const holder = bankHolderName.trim();
    const bank = bankName.trim();
    const acc = accountNumber.trim().replace(/\s+/g, '');
    const confirmAcc = confirmAccountNumber.trim().replace(/\s+/g, '');
    const ifsc = ifscCode.trim().toUpperCase().replace(/\s+/g, '');

    if (!holder || holder.length < 3) {
      setBankFormError('Please enter valid account holder full name.');
      return;
    }
    if (!bank) {
      setBankFormError('Please enter or select your Bank Name.');
      return;
    }
    if (!acc || acc.length < 8 || !/^\d+$/.test(acc)) {
      setBankFormError('Account number must be 8 to 18 digits.');
      return;
    }
    if (confirmAcc && confirmAcc !== acc) {
      setBankFormError('Account numbers do not match.');
      return;
    }
    if (!ifsc || ifsc.length < 8) {
      setBankFormError('Please enter a valid IFSC code (e.g. SBIN0001234).');
      return;
    }

    setIsBankSaving(true);

    const newBankData: BankAccountInfo = {
      bankHolderName: holder,
      bankName: bank,
      accountNumber: acc,
      ifscCode: ifsc,
    };

    // Save in state
    setBankAccount(newBankData);

    // Save in localStorage
    try {
      localStorage.setItem('network_join_pro_saved_bank', JSON.stringify(newBankData));
    } catch {
      // ignore
    }

    // Save in Firestore user profile
    if (currentUser?.loginUid) {
      try {
        await updateUserProfileInFirestore(currentUser.loginUid, {
          bankDetails: {
            bankHolderName: holder,
            bankName: bank,
            accountNumber: acc,
            ifscCode: ifsc,
            updatedAt: new Date().toISOString(),
          },
        });
      } catch (err) {
        console.warn('Failed to sync bank to Firestore:', err);
      }
    }

    setIsBankSaving(false);
    setBankSaveSuccess(true);

    setTimeout(() => {
      setBankSaveSuccess(false);
      setCurrentView('withdraw');
    }, 600);
  };

  // Numeric amount calculation & validation
  const numAmount = parseFloat(withdrawAmount) || 0;
  const isMinValid = numAmount >= 100;
  const isBalanceSufficient = numAmount <= currentBalance;
  const isAmountValid = isMinValid && isBalanceSufficient && numAmount > 0;
  const canWithdraw = isAmountValid && bankAccount && !isProcessing;

  const handleQuickAmountClick = (amount: number) => {
    setWithdrawAmount(amount.toString());
    setErrorMessage(null);
  };

  const handleMaxClick = () => {
    const maxVal = Math.floor(currentBalance);
    setWithdrawAmount(maxVal.toString());
    setErrorMessage(null);
  };

  // Submit Withdrawal
  const handleConfirmWithdraw = async () => {
    setErrorMessage(null);

    if (!bankAccount) {
      setErrorMessage('Please add a bank account before submitting withdrawal.');
      return;
    }

    if (numAmount < 100) {
      setErrorMessage('Minimum withdrawal amount is ₹100.');
      return;
    }

    if (numAmount > currentBalance) {
      setErrorMessage(`Insufficient wallet balance. You have ₹${currentBalance.toLocaleString('en-IN')}.`);
      return;
    }

    setIsProcessing(true);

    try {
      const now = new Date();
      const indianDateTime = now.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const customerId =
        currentUser?.loginUid || userStats?.loginUid || 'GK' + Math.floor(10000 + Math.random() * 90000);
      const customerName =
        currentUser?.fullName || userStats?.userName || bankAccount.bankHolderName || 'Customer';
      const customerMobile = currentUser?.mobile || userStats?.mobile || '';

      const withdrawalRecord: WithdrawalRecord = {
        id: `WD_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
        loginUid: customerId,
        customerId: customerId,
        customerName: customerName,
        userName: customerName,
        mobile: customerMobile,
        customerMobile: customerMobile,
        amount: numAmount,
        bankName: bankAccount.bankName,
        bankHolderName: bankAccount.bankHolderName,
        accountNumber: bankAccount.accountNumber,
        ifscCode: bankAccount.ifscCode,
        bankDetails: `${bankAccount.bankName} | A/C: ${bankAccount.accountNumber} | IFSC: ${bankAccount.ifscCode} (${bankAccount.bankHolderName})`,
        status: 'Pending',
        dateTime: indianDateTime,
        createdAt: now.toISOString(),
      };

      // 1. Save withdrawal record in Firestore 'withdrawals' collection
      await saveWithdrawalToFirestore(withdrawalRecord);

      // 2. Trigger parent callback to debit balance and add transaction
      const targetDesc = `${bankAccount.bankName} (A/C: •••${bankAccount.accountNumber.slice(-4)})`;
      onWithdrawSuccess(numAmount, targetDesc, withdrawalRecord);

      // 3. Trigger celebratory confetti
      triggerConfetti();

      // 4. Show success screen
      setSuccessRecord(withdrawalRecord);
      setIsProcessing(false);
    } catch (err) {
      console.error('Withdrawal submission error:', err);
      setIsProcessing(false);
      setErrorMessage('Could not process withdrawal. Please try again.');
    }
  };

  // Mask account number helper (e.g., •••• •••• 8192)
  const formatMaskedAccount = (acc: string) => {
    if (!acc) return '•••• •••• ••••';
    if (acc.length <= 4) return acc;
    const last4 = acc.slice(-4);
    return `•••• •••• ${last4}`;
  };

  // ==========================================
  // SUCCESS VIEW (After Withdrawal Debited)
  // ==========================================
  if (successRecord) {
    const remainingBalance = Math.max(0, currentBalance - successRecord.amount);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="space-y-4 pb-6"
      >
        {/* Success Card */}
        <div className="bg-[#FFFFFF] border-2 border-[#07865B] rounded-3xl p-5 sm:p-6 text-center shadow-lg relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-[#EAF5FF] border-2 border-[#07865B] text-[#07865B] flex items-center justify-center mx-auto mb-3 shadow-sm">
            <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
          </div>

          <span className="text-[11px] font-black tracking-widest uppercase text-[#07865B] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block mb-1">
            Request Registered Successfully
          </span>

          <h3 className="text-xl sm:text-2xl font-black text-[#002E6E] mt-1">
            ₹{successRecord.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-[#172B75]/70 font-medium mt-0.5">
            Debited from Wallet & Queued for IMPS Bank Payout
          </p>

          {/* Details breakdown */}
          <div className="mt-4 pt-4 border-t border-[#D9E7F5] space-y-2.5 text-left text-xs">
            <div className="flex items-center justify-between py-1 border-b border-[#D9E7F5]/60">
              <span className="text-[#172B75]/70 font-semibold">Reference ID</span>
              <span className="font-mono font-bold text-[#002E6E] text-[11px] bg-[#EAF5FF] px-2 py-0.5 rounded border border-[#D9E7F5]">
                {successRecord.id}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[#D9E7F5]/60">
              <span className="text-[#172B75]/70 font-semibold">Crediting To</span>
              <span className="font-bold text-[#002E6E] text-right">
                {successRecord.bankName} (•••{successRecord.accountNumber?.slice(-4)})
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[#D9E7F5]/60">
              <span className="text-[#172B75]/70 font-semibold">Account Holder</span>
              <span className="font-bold text-[#172B75]">{successRecord.bankHolderName}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-[#D9E7F5]/60">
              <span className="text-[#172B75]/70 font-semibold">Status</span>
              <span className="font-bold text-[#07865B] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Under Processing (Auto IMPS)
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-[#172B75]/70 font-semibold">Remaining Wallet Balance</span>
              <span className="font-mono font-black text-[#002E6E] text-sm">
                ₹{remainingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-[#EAF5FF] border border-[#D9E7F5] flex items-center gap-2.5 text-[11px] text-[#172B75] text-left">
            <ShieldCheck className="w-5 h-5 text-[#002E6E] shrink-0" />
            <span>
              Your payout is 100% secured with zero deductions. Transfer is directly credited to your registered bank account within 60 seconds.
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-4 py-3 rounded-xl bg-[#002E6E] hover:bg-[#00204d] active:scale-98 text-white font-black text-sm shadow-sm transition-all cursor-pointer border border-[#00B9F1]/40"
          >
            Done & Back to Wallet
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="relative overflow-hidden min-h-[500px]">
      <AnimatePresence mode="wait" initial={false}>
        {/* ======================================================== */}
        {/* 1. MAIN WITHDRAWAL SCREEN VIEW                           */}
        {/* ======================================================== */}
        {currentView === 'withdraw' && (
          <motion.div
            key="view-withdraw"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22 }}
            className="space-y-4 pb-6"
          >
            {/* A. Small Size Wallet Card */}
            <div className="bg-[#FFFFFF] rounded-2xl p-3.5 sm:p-4 border border-[#D9E7F5] shadow-2xs flex items-center justify-between gap-3 relative overflow-hidden">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#EAF5FF] border border-[#D9E7F5] flex items-center justify-center text-[#002E6E] shrink-0 shadow-2xs">
                  <Wallet className="w-5 h-5 text-[#002E6E] stroke-[2.4]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-[#172B75]/70 block truncate">
                    Available Wallet Balance
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl sm:text-2xl font-black font-mono text-[#002E6E] tracking-tight">
                      ₹{currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold bg-[#EAF5FF] text-[#07865B] px-2.5 py-1 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#07865B] animate-pulse" />
                  Verified 24/7
                </span>
                <span className="text-[9.5px] text-[#172B75]/60 font-semibold block mt-0.5">
                  Instant Payout
                </span>
              </div>
            </div>

            {/* B. Amount Input Box & Quick Amount Buttons */}
            <div className="bg-[#FFFFFF] rounded-2xl p-4 border border-[#D9E7F5] shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-[#172B75] uppercase tracking-wider flex items-center gap-1.5">
                  <span>Enter Withdrawal Amount</span>
                </label>
                <span className="text-[11px] font-bold text-[#172B75]/70 bg-[#EAF5FF] px-2 py-0.5 rounded-md border border-[#D9E7F5]">
                  Min: ₹100
                </span>
              </div>

              {/* Amount Input with Currency Symbol */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span className="text-xl sm:text-2xl font-black text-[#002E6E] font-mono">₹</span>
                </div>
                <input
                  type="number"
                  inputMode="numeric"
                  min="100"
                  max={currentBalance}
                  value={withdrawAmount}
                  onChange={(e) => {
                    setWithdrawAmount(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="0"
                  className="w-full pl-9 pr-4 py-3 rounded-xl bg-[#F2F8FC] border border-[#D9E7F5] text-xl sm:text-2xl font-black font-mono text-[#002E6E] placeholder-[#172B75]/30 focus:outline-none focus:border-[#00B9F1] focus:ring-2 focus:ring-[#00B9F1]/20 transition-all"
                />
              </div>

              {/* Quick Amount Buttons */}
              <div>
                <span className="text-[10.5px] font-bold text-[#172B75]/70 block mb-1.5">
                  Quick Select Amount:
                </span>
                <div className="grid grid-cols-6 gap-1.5">
                  {QUICK_AMOUNTS.map((amt) => {
                    const isSelected = numAmount === amt;
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleQuickAmountClick(amt)}
                        className={`py-1.5 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                          isSelected
                            ? 'bg-[#002E6E] text-white shadow-2xs border border-[#002E6E]'
                            : 'bg-[#EAF5FF] text-[#002E6E] border border-[#D9E7F5] hover:bg-[#D9E7F5]'
                        }`}
                      >
                        ₹{amt}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={handleMaxClick}
                    className="py-1.5 px-1 rounded-xl text-xs font-black bg-[#EAF5FF] text-[#002E6E] border border-[#00B9F1]/60 hover:bg-[#00B9F1] hover:text-white transition-all cursor-pointer text-center"
                  >
                    All Max
                  </button>
                </div>
              </div>

              {/* Real-time Status / Validation Helper */}
              {numAmount > currentBalance ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Amount exceeds available wallet balance (₹{currentBalance.toLocaleString('en-IN')})</span>
                </div>
              ) : numAmount > 0 && numAmount < 100 ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Minimum withdrawal amount is ₹100.</span>
                </div>
              ) : numAmount >= 100 ? (
                <div className="flex items-center justify-between text-[11px] font-bold text-[#07865B] bg-emerald-50 border border-emerald-200/70 px-3 py-1.5 rounded-xl">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    Ready for Instant Transfer
                  </span>
                  <span className="font-mono">Charges: ₹0 (Free)</span>
                </div>
              ) : null}
            </div>

            {/* C. Saved Bank Account Border Box & Small Size Add Bank Button */}
            <div className="bg-[#FFFFFF] rounded-2xl p-4 border border-[#D9E7F5] shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#172B75] uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#002E6E]" />
                  <span>Settlement Bank Account</span>
                </span>

                {/* Small size Add / Change Bank Button */}
                <button
                  type="button"
                  onClick={handleOpenAddBank}
                  className="px-2.5 py-1 rounded-lg bg-[#EAF5FF] hover:bg-[#D9E7F5] active:scale-95 text-[#002E6E] font-bold text-[11px] flex items-center gap-1 transition-all border border-[#D9E7F5] cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3 h-3 stroke-[3] text-[#00B9F1]" />
                  <span>{bankAccount ? 'Change Bank' : 'Add Bank'}</span>
                </button>
              </div>

              {bankAccount ? (
                /* Bank Account Border Box (Exact style matching user specification) */
                <div className="rounded-xl border border-[#D9E7F5] bg-[#F2F8FC] p-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#FFFFFF] border border-[#D9E7F5] flex items-center justify-center text-[#002E6E] shrink-0 shadow-2xs">
                        <Building className="w-4 h-4 text-[#002E6E]" />
                      </div>
                      <div className="min-w-0">
                        <span className="font-black text-sm text-[#002E6E] block truncate">
                          {bankAccount.bankName}
                        </span>
                        <span className="text-[11px] font-semibold text-[#172B75]/80 block truncate">
                          Holder: {bankAccount.bankHolderName}
                        </span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#FFFFFF] text-[#07865B] px-2 py-0.5 rounded-md border border-emerald-200 shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                      Active
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#D9E7F5]/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-[#172B75]/60 block font-medium">
                        Account Number
                      </span>
                      <span className="font-mono font-black text-[#002E6E] tracking-wider text-xs">
                        {formatMaskedAccount(bankAccount.accountNumber)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#172B75]/60 block font-medium">
                        IFSC Code
                      </span>
                      <span className="font-mono font-bold text-[#172B75] text-[11px] bg-white px-2 py-0.5 rounded border border-[#D9E7F5]">
                        {bankAccount.ifscCode}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty state prompt to Add Bank */
                <div className="rounded-xl border border-dashed border-[#D9E7F5] bg-[#F2F8FC] p-4 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-[#EAF5FF] text-[#002E6E] flex items-center justify-center mx-auto">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#172B75] block">
                      No Bank Account Linked
                    </span>
                    <span className="text-[10.5px] text-[#172B75]/65 block font-medium">
                      Add your bank account to receive withdrawals directly via IMPS.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddBank}
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#002E6E] hover:bg-[#00204d] text-white font-bold text-xs transition-all shadow-xs cursor-pointer border border-[#00B9F1]/40"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3] text-[#00B9F1]" />
                    <span>+ Add Bank Account</span>
                  </button>
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Security Guarantee Note */}
            <div className="bg-[#FFFFFF] border border-[#D9E7F5] rounded-2xl p-3 flex items-center gap-2.5 shadow-2xs">
              <div className="w-7 h-7 rounded-lg bg-[#EAF5FF] border border-[#D9E7F5] flex items-center justify-center text-[#002E6E] shrink-0">
                <ShieldCheck className="w-4 h-4 text-[#002E6E]" />
              </div>
              <div className="text-[11px] leading-tight text-[#172B75]/80 font-medium">
                <span className="font-bold text-[#002E6E]">Instant Automated IMPS Transfer</span>
                <span className="block text-[10px] text-[#172B75]/70">
                  Zero commission fee • Processed 24/7 directly to your bank account.
                </span>
              </div>
            </div>

            {/* D. Main Withdrawal Submit Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleConfirmWithdraw}
                disabled={!canWithdraw}
                className={`w-full py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-98 ${
                  canWithdraw
                    ? 'bg-[#002E6E] hover:bg-[#00204d] text-white border border-[#00B9F1]/50 shadow-md'
                    : 'bg-[#D9E7F5] text-[#172B75]/50 border border-[#D9E7F5] cursor-not-allowed'
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Transmitting Withdrawal Request...</span>
                  </span>
                ) : (
                  <>
                    <ArrowUpRight className="w-4 h-4 stroke-[3] text-[#00B9F1]" />
                    <span>
                      {numAmount > 0
                        ? `Withdraw ₹${numAmount.toLocaleString('en-IN')} Instantly`
                        : 'Enter Amount to Withdraw'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* 2. ADD BANK SCREEN (Right-to-Left Smooth Slide Animation) */}
        {/* ======================================================== */}
        {currentView === 'add-bank' && (
          <motion.div
            key="view-add-bank"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{
              type: 'spring',
              damping: 26,
              stiffness: 280,
              mass: 0.85,
            }}
            className="space-y-4 pb-6"
          >
            {/* Top Navigation Bar for Add Bank Screen */}
            <div className="flex items-center justify-between pb-2 border-b border-[#D9E7F5]">
              <button
                type="button"
                onClick={() => setCurrentView('withdraw')}
                className="flex items-center gap-1.5 text-xs font-bold text-[#002E6E] hover:text-[#00B9F1] px-2.5 py-1.5 rounded-lg bg-[#EAF5FF] border border-[#D9E7F5] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                <span>Back to Withdrawal</span>
              </button>

              <span className="text-xs font-black text-[#002E6E]">
                Add Bank Account
              </span>
            </div>

            {/* Add Bank Form Container */}
            <form onSubmit={handleSaveBank} className="space-y-3.5">
              <div className="bg-[#FFFFFF] rounded-2xl p-4 border border-[#D9E7F5] shadow-2xs space-y-3.5">
                {/* 1. Bank Holder Name */}
                <div className="space-y-1">
                  <label className="text-[11.5px] font-bold text-[#172B75] flex items-center justify-between">
                    <span>Bank Holder Name *</span>
                    <span className="text-[10px] text-[#172B75]/60 font-medium">As per Passbook</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={bankHolderName}
                    onChange={(e) => setBankHolderName(e.target.value)}
                    placeholder="Enter Account Holder Full Name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F8FC] border border-[#D9E7F5] text-sm font-bold text-[#172B75] placeholder-[#172B75]/40 focus:outline-none focus:border-[#00B9F1] focus:ring-2 focus:ring-[#00B9F1]/20 transition-all"
                  />
                </div>

                {/* 2. Bank Name with Popular Bank chips */}
                <div className="space-y-1.5">
                  <label className="text-[11.5px] font-bold text-[#172B75]">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. State Bank of India, HDFC Bank"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F8FC] border border-[#D9E7F5] text-sm font-bold text-[#172B75] placeholder-[#172B75]/40 focus:outline-none focus:border-[#00B9F1] focus:ring-2 focus:ring-[#00B9F1]/20 transition-all"
                  />

                  {/* Popular Bank Chips */}
                  <div className="pt-1">
                    <span className="text-[10px] font-bold text-[#172B75]/70 block mb-1">
                      Popular Banks (Tap to select):
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto no-scrollbar">
                      {POPULAR_BANKS.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setBankName(b)}
                          className={`text-[10.5px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                            bankName === b
                              ? 'bg-[#002E6E] text-white border-[#002E6E] shadow-2xs'
                              : 'bg-[#EAF5FF] text-[#172B75] border-[#D9E7F5] hover:bg-[#D9E7F5]'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. Account Number */}
                <div className="space-y-1">
                  <label className="text-[11.5px] font-bold text-[#172B75]">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter Bank Account Number (8-18 digits)"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F8FC] border border-[#D9E7F5] font-mono text-sm font-bold text-[#172B75] placeholder-[#172B75]/40 focus:outline-none focus:border-[#00B9F1] focus:ring-2 focus:ring-[#00B9F1]/20 transition-all"
                  />
                </div>

                {/* 4. Confirm Account Number */}
                <div className="space-y-1">
                  <label className="text-[11.5px] font-bold text-[#172B75]">
                    Confirm Account Number *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={confirmAccountNumber}
                    onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="Re-enter Bank Account Number"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F8FC] border border-[#D9E7F5] font-mono text-sm font-bold text-[#172B75] placeholder-[#172B75]/40 focus:outline-none focus:border-[#00B9F1] focus:ring-2 focus:ring-[#00B9F1]/20 transition-all"
                  />
                  {accountNumber && confirmAccountNumber && accountNumber !== confirmAccountNumber && (
                    <span className="text-[10.5px] text-rose-600 font-bold block">
                      Account numbers do not match!
                    </span>
                  )}
                </div>

                {/* 5. IFSC Code */}
                <div className="space-y-1">
                  <label className="text-[11.5px] font-bold text-[#172B75] flex items-center justify-between">
                    <span>IFSC Code *</span>
                    <span className="text-[10px] text-[#172B75]/60 font-medium">11 Characters Alphanumeric</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SBIN0001234 / HDFC0000128"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F2F8FC] border border-[#D9E7F5] font-mono text-sm font-bold uppercase text-[#002E6E] placeholder-[#172B75]/40 focus:outline-none focus:border-[#00B9F1] focus:ring-2 focus:ring-[#00B9F1]/20 transition-all"
                  />
                </div>
              </div>

              {/* Form Validation Error */}
              {bankFormError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{bankFormError}</span>
                </div>
              )}

              {/* Save Bank Button */}
              <div>
                {bankSaveSuccess ? (
                  <div className="w-full py-3.5 bg-[#07865B] text-white font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-xs">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Bank Account Saved Successfully!</span>
                  </div>
                ) : (
                  <button
                    type="submit"
                    disabled={isBankSaving}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#002E6E] hover:bg-[#00204d] active:scale-98 text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer border border-[#00B9F1]/40"
                  >
                    {isBankSaving ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Saving Bank Account...</span>
                      </span>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[3] text-[#00B9F1]" />
                        <span>Save Bank Account</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
