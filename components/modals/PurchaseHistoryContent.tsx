'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Calendar,
  Clock,
  TrendingUp,
  User,
  Phone,
  LayoutGrid,
  List,
  CheckCircle2,
  Coins,
  ArrowRight,
  Filter,
  Check,
  Building2,
  CreditCard,
  UserCheck,
  Award,
} from 'lucide-react';
import { motion } from 'motion/react';
import { ActiveInvestment } from '@/types/investment';
import FloatingInput from '@/components/ui/FloatingInput';
import {
  saveWithdrawalToFirestore,
  saveInvestmentToFirestore,
  WithdrawalRecord,
  UserAccountData,
} from '@/lib/firebase';

export function PlanCategoryIconBadge({
  planName = '',
  category = '',
  iconUrl,
  size = 'md',
}: {
  planName?: string;
  category?: string;
  iconUrl?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses =
    size === 'sm'
      ? 'w-8 h-8 rounded-xl text-sm'
      : size === 'lg'
      ? 'w-14 h-14 rounded-3xl text-3xl'
      : 'w-10 h-10 rounded-2xl text-lg';

  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt={planName || 'Plan'}
        className={`${sizeClasses} object-cover shadow-sm ring-1 ring-amber-400/20 shrink-0`}
        referrerPolicy="no-referrer"
      />
    );
  }

  const nameLower = planName.toLowerCase();
  const catLower = category.toLowerCase();

  if (nameLower.includes('krantikari') || nameLower.includes('क्रांतिकारी') || catLower.includes('krantikari')) {
    return (
      <div className={`${sizeClasses} bg-gradient-to-tr from-[#991b1b] via-[#dc2626] to-[#f97316] flex items-center justify-center text-white shrink-0 shadow-md ring-1 ring-white/20`}>
        <span>🚩</span>
      </div>
    );
  }

  if (nameLower.includes('starter') || catLower === 'starter') {
    return (
      <div className={`${sizeClasses} bg-gradient-to-tr from-[#FF8904] via-[#FFB703] to-[#FFD60A] flex items-center justify-center text-white shrink-0 shadow-md ring-1 ring-white/20`}>
        <span className="drop-shadow-sm">🚀</span>
      </div>
    );
  }

  if (nameLower.includes('basic') || catLower === 'basic') {
    return (
      <div className={`${sizeClasses} bg-gradient-to-tr from-[#002E6E] via-[#0052A3] to-[#00B9F1] flex items-center justify-center text-white shrink-0 shadow-md ring-1 ring-white/20`}>
        <span className="drop-shadow-sm">⚡</span>
      </div>
    );
  }

  if (nameLower.includes('silver') || catLower === 'silver') {
    return (
      <div className={`${sizeClasses} bg-gradient-to-tr from-[#334155] via-[#64748b] to-[#cbd5e1] flex items-center justify-center text-white shrink-0 shadow-md ring-1 ring-white/20`}>
        <span className="drop-shadow-sm">🥈</span>
      </div>
    );
  }

  if (nameLower.includes('gold') || catLower === 'gold') {
    return (
      <div className={`${sizeClasses} bg-gradient-to-tr from-[#78350f] via-[#d97706] to-[#fef08a] flex items-center justify-center text-white shrink-0 shadow-md ring-1 ring-white/20`}>
        <span className="drop-shadow-sm">🥇</span>
      </div>
    );
  }

  if (nameLower.includes('platinum') || catLower === 'platinum') {
    return (
      <div className={`${sizeClasses} bg-gradient-to-tr from-[#1e293b] via-[#475569] to-[#e2e8f0] flex items-center justify-center text-white shrink-0 shadow-md ring-1 ring-white/20`}>
        <span className="drop-shadow-sm">💠</span>
      </div>
    );
  }

  if (nameLower.includes('diamond') || catLower === 'diamond') {
    return (
      <div className={`${sizeClasses} bg-gradient-to-tr from-[#0c4a6e] via-[#0284c7] to-[#7dd3fc] flex items-center justify-center text-white shrink-0 shadow-md ring-1 ring-white/20`}>
        <span className="drop-shadow-sm">💎</span>
      </div>
    );
  }

  if (nameLower.includes('vip') || nameLower.includes('premium') || catLower === 'vip' || catLower === 'premium') {
    return (
      <div className={`${sizeClasses} bg-gradient-to-tr from-[#09090b] via-[#27272a] to-[#d97706] flex items-center justify-center text-white shrink-0 shadow-md ring-1 ring-white/20`}>
        <span className="drop-shadow-sm">👑</span>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses} bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shrink-0 shadow-md ring-1 ring-white/20`}>
      <span className="drop-shadow-sm">💼</span>
    </div>
  );
}

interface PurchaseHistoryContentProps {
  activeInvestments: ActiveInvestment[];
  currentUser?: UserAccountData | null;
  onOpenPlans?: () => void;
  onRefreshInvestments?: () => void;
  onViewCertificate?: (inv: ActiveInvestment) => void;
}

export default function PurchaseHistoryContent({
  activeInvestments = [],
  currentUser,
  onOpenPlans,
  onRefreshInvestments,
  onViewCertificate,
}: PurchaseHistoryContentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Real-time ticker state for timer counting down every 1 second
  const [now, setNow] = useState<number>(Date.now());
  const [claimingMap, setClaimingMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper to calculate countdown timer in total Hours:Minutes:Seconds
  function getInvestmentCountdown(inv: ActiveInvestment, currentTimeMs: number) {
    let startMs = Date.now();
    if (inv.purchasedAt) {
      const parsed = new Date(inv.purchasedAt).getTime();
      if (!isNaN(parsed)) startMs = parsed;
    } else if (inv.startDate) {
      const parsed = new Date(inv.startDate).getTime();
      if (!isNaN(parsed)) startMs = parsed;
    }

    const totalDays = inv.totalDays && inv.totalDays > 0 ? inv.totalDays : 1;
    const durationMs = totalDays * 24 * 60 * 60 * 1000;
    const maturityMs = startMs + durationMs;

    const remainingMs = Math.max(0, maturityMs - currentTimeMs);

    if (remainingMs <= 0 || inv.status === 'completed') {
      return {
        isComplete: true,
        remainingMs: 0,
        timerStr: '00:00:00',
      };
    }

    const totalHours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

    const formattedHours = String(totalHours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    return {
      isComplete: false,
      remainingMs,
      timerStr: `${formattedHours}:${formattedMinutes}:${formattedSeconds}`,
    };
  }

  // Handle claim button click -> Save withdrawal details to Firebase Cloud Firestore 'withdrawals'
  const handleClaimAndWithdraw = async (inv: ActiveInvestment) => {
    if (claimingMap[inv.id]) return;
    setClaimingMap((prev) => ({ ...prev, [inv.id]: true }));

    try {
      const customerId = inv.loginUid || inv.customerId || currentUser?.loginUid || 'GK35648';
      const customerName = inv.customerName || currentUser?.fullName || 'Customer';
      const bankName = inv.bankName || 'HDFC Bank';
      const bankHolderName = inv.bankHolderName || customerName;
      const accountNumber = inv.accountNumber || '9876543210';
      const ifscCode = inv.ifscCode || 'HDFC0001234';
      const totalReturn = inv.totalReturn || inv.investedAmount || 0;

      const withdrawalData: WithdrawalRecord = {
        id: `WD_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
        loginUid: customerId,
        customerId: customerId,
        customerName: customerName,
        userName: customerName,
        mobile: inv.customerMobile || currentUser?.mobile || '',
        bankName: bankName,
        bankHolderName: bankHolderName,
        accountNumber: accountNumber,
        ifscCode: ifscCode,
        bankDetails: `${bankName} | A/C: ${accountNumber} | IFSC: ${ifscCode} (${bankHolderName})`,
        amount: totalReturn,
        totalReturn: totalReturn,
        status: 'Pending',
        dateTime: new Date().toLocaleString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        createdAt: new Date().toISOString(),
        planName: inv.planName,
      };

      // 1. Save withdrawal request to Firebase Cloud Firestore
      const resWd = await saveWithdrawalToFirestore(withdrawalData);

      // 2. Mark investment as claimed / withdrawal pending in Firestore
      const updatedInv: ActiveInvestment = {
        ...inv,
        claimed: true,
        withdrawalStatus: 'Pending',
        status: 'completed',
      };
      await saveInvestmentToFirestore(updatedInv);

      if (resWd.success) {
        showToast(`Withdrawal request submitted! Status: Pending (₹${totalReturn})`);
      } else {
        showToast(`Withdrawal request saved locally for ₹${totalReturn}`);
      }

      if (onRefreshInvestments) {
        onRefreshInvestments();
      }
    } catch (err) {
      console.error('Error claiming investment:', err);
      showToast('Failed to process withdrawal claim');
    } finally {
      setClaimingMap((prev) => ({ ...prev, [inv.id]: false }));
    }
  };

  // Calculate totals
  const totalPurchasedAmount = activeInvestments.reduce((sum, inv) => sum + (inv.investedAmount || 0), 0);
  const totalExpectedReturns = activeInvestments.reduce((sum, inv) => sum + (inv.totalReturn || 0), 0);
  const totalDailyReturn = activeInvestments.reduce((sum, inv) => sum + (inv.dailyReturn || 0), 0);

  // Filter investments based on search query and status filter
  // Requirement:
  // 1. When an investment is claimed (clean button clicked -> inv.claimed or inv.withdrawalStatus === 'Pending'),
  //    its data is HIDDEN by default from normal view ("uska data hide ho jaega so Nahin hoaega").
  // 2. BUT when the customer's mobile number (or name) is searched in the search bar, that data IS SHOWN!
  //    ("Lekin Mobile number customer ka mobile number search bar mein search Karega to use data so hoga")
  const filteredInvestments = (activeInvestments || []).filter((inv) => {
    if (!inv) return false;
    const isClaimed = Boolean(
      inv.claimed ||
      inv.withdrawalStatus === 'Pending' ||
      inv.withdrawalStatus === 'Withdrawal Pending' ||
      inv.withdrawalStatus === 'Approved'
    );

    const q = searchQuery.toLowerCase().trim();
    const cleanDigits = q.replace(/\D/g, '');

    // Case 1: Search bar is EMPTY
    if (!q) {
      if (statusFilter === 'completed') {
        return isClaimed || inv.status === 'completed';
      }
      if (statusFilter === 'active') {
        return !isClaimed && inv.status !== 'completed';
      }
      // In 'All Purchases' tab: Hide claimed records so user sees only active/unclaimed ones
      return !isClaimed;
    }

    // Case 2: User searched in search bar (e.g. customer mobile number)
    const rawMobile = (inv.customerMobile || '').replace(/\D/g, '');
    const matchesMobile = Boolean(
      (cleanDigits.length > 0 && rawMobile.includes(cleanDigits)) ||
      (inv.customerMobile && inv.customerMobile.toLowerCase().includes(q))
    );
    const matchesName = Boolean(inv.planName?.toLowerCase().includes(q));
    const matchesCustomer = Boolean(inv.customerName?.toLowerCase().includes(q));
    const matchesAmount = String(inv.investedAmount || '').includes(q);
    const matchesDate = Boolean(inv.startDate?.toLowerCase().includes(q));

    const matchesSearch = matchesMobile || matchesName || matchesCustomer || matchesAmount || matchesDate;

    if (statusFilter === 'active') {
      return matchesSearch && !isClaimed;
    }
    if (statusFilter === 'completed') {
      return matchesSearch && (isClaimed || inv.status === 'completed');
    }

    // When searching by mobile or keyword in All Purchases, include all matching data (even if claimed)
    return matchesSearch;
  });

  return (
    <div className="space-y-4 text-[#46280b] relative">
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-black text-amber-400 text-xs sm:text-sm font-bold py-2 px-4 rounded-full border border-amber-500/50 shadow-2xl animate-bounce flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Summary Card - Executive Blue & Slate Gradient */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-4 shadow-md border border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-blue-300 block">
                Total Purchased Summary
              </span>
              <h3 className="text-base sm:text-lg font-black font-serif text-white leading-tight">
                {activeInvestments.length} Total Plans Purchased
              </h3>
            </div>
          </div>

          <span className="text-xs font-extrabold bg-blue-500/20 text-blue-200 border border-blue-400/30 px-2.5 py-1 rounded-full">
            Verified Purchases
          </span>
        </div>

        {/* 3 Metrics Row */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/80 text-xs">
          <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-xs">
            <span className="text-[9px] text-slate-300 uppercase font-extrabold block">Total Invested</span>
            <span className="text-sm font-black text-white font-mono">
              ₹{totalPurchasedAmount.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-xs">
            <span className="text-[9px] text-blue-300 uppercase font-extrabold block">Daily Yield</span>
            <span className="text-sm font-black text-blue-300 font-mono">
              +₹{totalDailyReturn.toFixed(2)}/d
            </span>
          </div>

          <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-xs">
            <span className="text-[9px] text-emerald-300 uppercase font-extrabold block">Expected Return</span>
            <span className="text-sm font-black text-emerald-300 font-mono">
              ₹{totalExpectedReturns.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Search & Controls Bar */}
      <div className="space-y-2.5">
        {/* Search Input Box */}
        <FloatingInput
          label="Search purchases by plan, customer name, mobile or date..."
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-blue-600" />}
          inputClassName="font-medium text-slate-900 text-xs sm:text-sm"
          rightElement={
            searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-500 hover:text-slate-900 font-bold p-1 cursor-pointer"
                title="Clear search"
              >
                ✕
              </button>
            ) : null
          }
        />

        {/* Filter Pills + View Mode Toggle */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(['all', 'active', 'completed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-full text-xs font-bold capitalize transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {st === 'all' ? 'All Purchases' : st}
              </button>
            ))}
          </div>

          {/* List vs Grid toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Purchased Items List / Grid */}
      {filteredInvestments.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm">No Plan History Found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              {searchQuery
                ? `No purchases found matching "${searchQuery}".`
                : 'Subscribe to new investment plans to view your history here.'}
            </p>
          </div>
          {onOpenPlans && (
            <button
              onClick={onOpenPlans}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[#002E6E] hover:bg-[#002E6E]/90 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <span>Explore Plans & Purchase</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : viewMode === 'list' ? (
        /* LIST VIEW */
        <div className="space-y-4">
          {filteredInvestments.map((inv) => {
            const progressPercent = Math.min(
              100,
              Math.round(((inv.daysCompleted || 1) / (inv.totalDays || 30)) * 100)
            );

            const { isComplete, timerStr } = getInvestmentCountdown(inv, now);
            const isWithdrawalPending =
              inv.claimed ||
              inv.withdrawalStatus === 'Pending' ||
              inv.withdrawalStatus === 'Withdrawal Pending';
            const isApproved = inv.withdrawalStatus === 'Approved';

            return (
              <div
                key={inv.id}
                className="bg-white rounded-[2rem] p-4 sm:p-5 border border-[#00B9F1]/10 shadow-sm hover:shadow-md transition-all space-y-4 overflow-hidden relative"
              >
                {/* Header: Plan Name, Status & Amount */}
                <div className="flex items-start justify-between gap-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <PlanCategoryIconBadge planName={inv.planName} size="lg" />
                    <div>
                      <div className="flex flex-col">
                        <h4 className="font-black text-[#172B75] text-sm sm:text-base leading-tight">
                          {inv.planName}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border ${
                              isWithdrawalPending
                                ? 'bg-black text-white border-black shadow-xs'
                                : inv.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200 shadow-xs'
                                : 'bg-[#E5F7FF] text-[#002E6E] border-[#00B9F1]/30 shadow-xs'
                            }`}
                          >
                            {isWithdrawalPending
                              ? 'Withdrawal Pending'
                              : inv.status === 'completed'
                              ? 'Completed'
                              : 'Active Compounding'}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 font-bold block mt-1.5 uppercase tracking-wider">
                        Purchased on: {inv.startDate}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 uppercase font-black block tracking-tight">Purchase Amt</span>
                    <span className="text-xl font-black text-[#172B75] font-mono">
                      ₹{(inv.investedAmount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Linked Customer info if present - Rounded Container style */}
                {inv.customerName && (
                  <div className="bg-[#F2F8FC] p-3 rounded-2xl border border-[#00B9F1]/15 flex items-center justify-between text-xs group transition-colors hover:bg-white hover:border-[#00B9F1]/40">
                    <div className="flex items-center gap-3 min-w-0">
                      {inv.customerPhoto ? (
                        <img
                          src={inv.customerPhoto}
                          alt={inv.customerName}
                          className="w-9 h-9 rounded-xl object-cover border border-[#00B9F1]/30 shadow-2xs group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#002E6E] to-[#00B9F1] text-white flex items-center justify-center font-black text-sm shadow-2xs group-hover:scale-105 transition-transform">
                          {inv.customerName[0]}
                        </div>
                      )}
                      <div className="truncate">
                        <span className="font-black text-[#172B75] block truncate text-sm">
                          {inv.customerName}
                        </span>
                        {inv.customerMobile && (
                          <span className="text-[11px] text-[#002E6E] font-bold flex items-center gap-1 opacity-70">
                            <Phone className="w-2.5 h-2.5" />
                            +91 {inv.customerMobile}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] bg-white text-[#002E6E] font-black px-3 py-1 rounded-xl border border-[#00B9F1]/30 shadow-xs shrink-0 uppercase tracking-tighter">
                      Customer Linked
                    </span>
                  </div>
                )}

                {/* Return Projection Bar - Rounded Box */}
                <div className="grid grid-cols-2 gap-3 bg-[#F2F8FC] p-3.5 rounded-2xl border border-[#00B9F1]/10 text-xs shadow-2xs">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 uppercase font-black block tracking-tight">Daily Return</span>
                    <span className="text-base font-black text-[#00B9F1] font-mono">
                      +₹{(inv.dailyReturn || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="text-right space-y-0.5 border-l border-[#00B9F1]/10 pl-3">
                    <span className="text-[10px] text-slate-500 uppercase font-black block tracking-tight">Expected Return</span>
                    <span className="text-base font-black text-emerald-600 font-mono">
                      ₹{(inv.totalReturn || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="col-span-2 pt-2 border-t border-[#00B9F1]/10">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] text-slate-500 uppercase font-black tracking-tight">Investment Progress</span>
                      <span className="font-black text-[#172B75] text-[11px]">
                        Day {inv.daysCompleted || 1} of {inv.totalDays || 30}
                      </span>
                    </div>
                    {/* Progress Bar - Slim Blue */}
                    <div className="w-full bg-[#00B9F1]/10 h-2 rounded-full overflow-hidden shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="bg-gradient-to-r from-[#002E6E] to-[#00B9F1] h-full rounded-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Timer & Claim Action Section */}
                <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-[11px] font-black text-[#172B75]/60 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                    <Calendar className="w-3.5 h-3.5 text-[#00B9F1]" />
                    <span>Duration: {inv.totalDays || 30} Days</span>
                  </div>

                  <div className="flex items-center gap-2.5 ml-auto">
                    {onViewCertificate && (
                      <button
                        onClick={() => onViewCertificate(inv)}
                        className="w-10 h-10 flex items-center justify-center bg-white hover:bg-[#F2F8FC] text-[#00B9F1] rounded-xl border border-[#00B9F1]/30 transition-all cursor-pointer shadow-xs active:scale-90"
                        title="View Certificate"
                      >
                        <Award className="w-5 h-5" />
                      </button>
                    )}

                    {isWithdrawalPending ? (
                      <button
                        disabled
                        className="px-5 py-2.5 bg-black text-white font-black text-xs rounded-xl border border-black shadow-md flex items-center gap-2 cursor-not-allowed uppercase tracking-tighter"
                      >
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                        <span>विड्रॉल पेंडिंग</span>
                      </button>
                    ) : isApproved ? (
                      <button
                        disabled
                        className="px-5 py-2.5 bg-emerald-600 text-white font-black text-xs rounded-xl shadow-md flex items-center gap-2 cursor-not-allowed uppercase tracking-tighter"
                      >
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>Approved</span>
                      </button>
                    ) : !isComplete ? (
                      /* DURATION NOT EXPIRED: SHOW TIMER ONLY */
                      <div className="px-5 py-2.5 bg-[#002E6E] text-white font-mono font-black text-sm rounded-xl border border-[#002E6E] flex items-center gap-2.5 shadow-md">
                        <Clock className="w-4 h-4 text-[#00B9F1] animate-pulse" />
                        <span className="tracking-[0.1em]">{timerStr}</span>
                      </div>
                    ) : (
                      /* DURATION EXPIRED: SHOW CLAIM BUTTON */
                      <button
                        onClick={() => handleClaimAndWithdraw(inv)}
                        disabled={claimingMap[inv.id]}
                        className="px-6 py-2.5 bg-gradient-to-r from-[#FF8904] to-[#ff5d00] hover:scale-105 active:scale-95 text-white font-black text-sm rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 uppercase tracking-tight"
                      >
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>{claimingMap[inv.id] ? 'Processing...' : 'Claim Now'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredInvestments.map((inv) => {
            const { isComplete, timerStr } = getInvestmentCountdown(inv, now);
            const isWithdrawalPending =
              inv.claimed ||
              inv.withdrawalStatus === 'Pending' ||
              inv.withdrawalStatus === 'Withdrawal Pending';
            const isApproved = inv.withdrawalStatus === 'Approved';

            return (
              <div
                key={inv.id}
                className="bg-white rounded-[2rem] p-4 sm:p-5 border border-[#00B9F1]/10 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <PlanCategoryIconBadge planName={inv.planName} size="md" />
                    <div className="min-w-0">
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase border ${
                          isWithdrawalPending
                            ? 'bg-black text-white border-black'
                            : 'bg-[#F2F8FC] text-[#002E6E] border-[#00B9F1]/20'
                        }`}
                      >
                        {isWithdrawalPending ? 'Pending' : inv.status}
                      </span>
                      <h4 className="font-black text-[#172B75] text-sm mt-1 truncate">
                        {inv.planName}
                      </h4>
                    </div>
                  </div>
                  <span className="text-base font-black text-[#172B75] font-mono shrink-0">
                    ₹{(inv.investedAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                {inv.customerName && (
                  <div className="text-xs bg-[#F2F8FC] p-2.5 rounded-xl border border-[#00B9F1]/10">
                    <span className="text-[10px] text-slate-400 block uppercase font-black mb-0.5 tracking-tight">Linked Customer</span>
                    <span className="font-black text-[#172B75] text-sm">{inv.customerName}</span>
                    {inv.customerMobile && (
                      <span className="text-[10px] text-[#002E6E]/60 font-bold block mt-0.5">
                        +91 {inv.customerMobile}
                      </span>
                    )}
                  </div>
                )}

                <div className="pt-2 border-t border-[#00B9F1]/10 flex items-center justify-between text-[11px] font-mono">
                  <div className="flex flex-col">
                    <span className="text-slate-400 font-bold uppercase text-[9px]">Daily</span>
                    <span className="text-[#00B9F1] font-black">+₹{(inv.dailyReturn || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-slate-400 font-bold uppercase text-[9px]">Return</span>
                    <span className="text-emerald-600 font-black">₹{(inv.totalReturn || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Grid View Timer vs Claim button vs Black Pending button */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {onViewCertificate && (
                      <button
                        onClick={() => onViewCertificate(inv)}
                        className="w-8 h-8 flex items-center justify-center bg-white hover:bg-[#F2F8FC] text-[#00B9F1] rounded-lg border border-[#00B9F1]/30 transition-all cursor-pointer shadow-xs active:scale-90"
                        title="View Certificate"
                      >
                        <Award className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-auto">
                    {isWithdrawalPending ? (
                      <button
                        disabled
                        className="px-3 py-1.5 bg-black text-white font-black text-[10px] rounded-lg border border-black shadow-xs flex items-center gap-1 cursor-not-allowed uppercase"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        <span>पेंडिंग</span>
                      </button>
                    ) : isApproved ? (
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 uppercase tracking-tighter">Approved</span>
                    ) : !isComplete ? (
                      /* DURATION NOT EXPIRED: TIMER ONLY */
                      <div className="px-3 py-1.5 bg-[#002E6E] text-white font-mono font-black text-xs rounded-lg border border-[#002E6E] flex items-center gap-1.5 shadow-sm">
                        <Clock className="w-3 h-3 text-[#00B9F1] animate-pulse" />
                        <span className="tracking-tighter">{timerStr}</span>
                      </div>
                    ) : (
                      /* DURATION EXPIRED: CLEAN / CLAIM NOW BUTTON */
                      <button
                        onClick={() => handleClaimAndWithdraw(inv)}
                        disabled={claimingMap[inv.id]}
                        className="px-4 py-1.5 bg-[#FF8904] hover:bg-[#ff5d00] active:scale-95 text-white font-black text-[10px] rounded-lg shadow-md transition-all cursor-pointer uppercase tracking-tight"
                      >
                        Claim Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
