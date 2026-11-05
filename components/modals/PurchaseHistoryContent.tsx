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
} from 'lucide-react';
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
      ? 'w-7 h-7 rounded-lg text-sm'
      : size === 'lg'
      ? 'w-11 h-11 rounded-2xl text-2xl'
      : 'w-9 h-9 rounded-xl text-lg';

  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt={planName || 'Plan'}
        className={`${sizeClasses} object-cover shadow-xs ring-1 ring-amber-400/80 shrink-0`}
        referrerPolicy="no-referrer"
      />
    );
  }

  const nameLower = planName.toLowerCase();
  const catLower = category.toLowerCase();

  if (nameLower.includes('krantikari') || nameLower.includes('क्रांतिकारी') || catLower.includes('krantikari')) {
    return (
      <div className={`${sizeClasses} bg-gradient-to-tr from-[#991b1b] via-[#dc2626] to-[#f97316] flex items-center justify-center text-white shrink-0 shadow-xs ring-1 ring-amber-400/90`}>
        <span>🚩</span>
      </div>
    );
  }

  if (nameLower.includes('starter') || catLower === 'starter') {
    return (
      <div className={`${sizeClasses} bg-gradient-to-tr from-[#78350f] via-[#b45309] to-[#f59e0b] flex items-center justify-center text-white shrink-0 shadow-xs ring-1 ring-amber-400/80`}>
        <span>🚀</span>
      </div>
    );
  }

  if (nameLower.includes('basic') || catLower === 'basic') {
    return (
      <div className={`${sizeClasses} bg-gradient-to-tr from-[#1e3a8a] via-[#1d4ed8] to-[#06b6d4] flex items-center justify-center text-white shrink-0 shadow-xs ring-1 ring-cyan-400/80`}>
        <span>⚡</span>
      </div>
    );
  }

  if (nameLower.includes('silver') || catLower === 'silver') {
    return (
      <div className={`${sizeClasses} bg-gradient-to-tr from-[#334155] via-[#64748b] to-[#cbd5e1] flex items-center justify-center text-white shrink-0 shadow-xs ring-1 ring-slate-300`}>
        <span>🥈</span>
      </div>
    );
  }

  if (nameLower.includes('gold') || catLower === 'gold') {
    return (
      <div className={`${sizeClasses} bg-gradient-to-tr from-[#78350f] via-[#d97706] to-[#fef08a] flex items-center justify-center text-white shrink-0 shadow-xs ring-1 ring-amber-300`}>
        <span>🥇</span>
      </div>
    );
  }

  if (nameLower.includes('platinum') || catLower === 'platinum') {
    return (
      <div className={`${sizeClasses} bg-gradient-to-tr from-[#1e293b] via-[#475569] to-[#e2e8f0] flex items-center justify-center text-white shrink-0 shadow-xs ring-1 ring-sky-300`}>
        <span>💠</span>
      </div>
    );
  }

  if (nameLower.includes('diamond') || catLower === 'diamond') {
    return (
      <div className={`${sizeClasses} bg-gradient-to-tr from-[#0c4a6e] via-[#0284c7] to-[#7dd3fc] flex items-center justify-center text-white shrink-0 shadow-xs ring-1 ring-cyan-300`}>
        <span>💎</span>
      </div>
    );
  }

  if (nameLower.includes('vip') || nameLower.includes('premium') || catLower === 'vip' || catLower === 'premium') {
    return (
      <div className={`${sizeClasses} bg-gradient-to-tr from-[#09090b] via-[#27272a] to-[#d97706] flex items-center justify-center text-white shrink-0 shadow-xs ring-1 ring-amber-400`}>
        <span>👑</span>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses} bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shrink-0 shadow-xs ring-1 ring-blue-300`}>
      <span>💼</span>
    </div>
  );
}

interface PurchaseHistoryContentProps {
  activeInvestments: ActiveInvestment[];
  currentUser?: UserAccountData | null;
  onOpenPlans?: () => void;
  onRefreshInvestments?: () => void;
}

export default function PurchaseHistoryContent({
  activeInvestments = [],
  currentUser,
  onOpenPlans,
  onRefreshInvestments,
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
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <span>Explore Plans & Purchase</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : viewMode === 'list' ? (
        /* LIST VIEW */
        <div className="space-y-3">
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
                className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-3"
              >
                {/* Header: Plan Name, Status & Amount */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <PlanCategoryIconBadge planName={inv.planName} />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base font-serif leading-tight">
                          {inv.planName}
                        </h4>
                        <span
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                            isWithdrawalPending
                              ? 'bg-black text-white border border-slate-800'
                              : inv.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-blue-100 text-blue-800 border border-blue-300'
                          }`}
                        >
                          {isWithdrawalPending
                            ? 'Withdrawal Pending'
                            : inv.status === 'completed'
                            ? 'Completed'
                            : 'Active Compounding'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                        Purchased on: {inv.startDate}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Purchase Amt</span>
                    <span className="text-base font-black text-slate-900 font-mono">
                      ₹{(inv.investedAmount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Linked Customer info if present */}
                {inv.customerName && (
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      {inv.customerPhoto ? (
                        <img
                          src={inv.customerPhoto}
                          alt={inv.customerName}
                          className="w-7 h-7 rounded-full object-cover border border-blue-400"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {inv.customerName[0]}
                        </div>
                      )}
                      <div className="truncate">
                        <span className="font-extrabold text-slate-900 block truncate">
                          {inv.customerName}
                        </span>
                        {inv.customerMobile && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            +91 {inv.customerMobile}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md border border-blue-200 shrink-0">
                      Customer Linked
                    </span>
                  </div>
                )}

                {/* Return Projection Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-blue-50/60 p-2.5 rounded-xl border border-blue-100 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase font-bold block">Daily Return</span>
                    <span className="font-black text-blue-700 font-mono">
                      +₹{(inv.dailyReturn || 0).toFixed(2)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9px] text-slate-500 uppercase font-bold block">Expected Return</span>
                    <span className="font-black text-emerald-700 font-mono">
                      ₹{(inv.totalReturn || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[9px] text-slate-500 uppercase font-bold block">Progress</span>
                    <span className="font-bold text-slate-800 text-[11px]">
                      Day {inv.daysCompleted || 1} of {inv.totalDays || 30}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Timer & Claim Action Section:
                    - While duration is running: show Timer ONLY, hide Claim button
                    - When duration is expired: hide Timer, show Clean / Claim button
                    - When claimed: show black 'विड्रॉल पेंडिंग' button */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Duration: {inv.totalDays || 30} Days ({(inv.totalDays || 30) * 24} Hours)</span>
                  </div>

                  {isWithdrawalPending ? (
                    <button
                      disabled
                      className="px-3.5 py-1.5 bg-black text-white font-extrabold text-xs rounded-xl border border-slate-800 shadow-xs flex items-center gap-1.5 cursor-not-allowed"
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span>विड्रॉल पेंडिंग</span>
                    </button>
                  ) : isApproved ? (
                    <button
                      disabled
                      className="px-3.5 py-1.5 bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-not-allowed"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      <span>Withdrawal Approved</span>
                    </button>
                  ) : !isComplete ? (
                    /* DURATION NOT EXPIRED: SHOW TIMER ONLY, HIDE CLAIM BUTTON */
                    <div className="px-3.5 py-1.5 bg-slate-900 text-amber-400 font-mono font-black text-xs rounded-xl border border-amber-500/40 flex items-center gap-1.5 shadow-2xs">
                      <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      <span className="tracking-widest">{timerStr}</span>
                    </div>
                  ) : (
                    /* DURATION EXPIRED: HIDE TIMER, SHOW CLEAN / CLAIM BUTTON */
                    <button
                      onClick={() => handleClaimAndWithdraw(inv)}
                      disabled={claimingMap[inv.id]}
                      className="px-4 py-1.5 bg-[#FF8904] hover:bg-[#e67a00] active:scale-95 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      <span>{claimingMap[inv.id] ? 'Processing...' : 'Claim Now'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <PlanCategoryIconBadge planName={inv.planName} size="sm" />
                    <div className="min-w-0">
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase border ${
                          isWithdrawalPending
                            ? 'bg-black text-white border-slate-800'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {isWithdrawalPending ? 'Pending' : inv.status}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-sm font-serif mt-1 truncate">
                        {inv.planName}
                      </h4>
                    </div>
                  </div>
                  <span className="text-base font-black text-slate-900 font-mono shrink-0">
                    ₹{(inv.investedAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                {inv.customerName && (
                  <div className="text-xs bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Customer</span>
                    <span className="font-bold text-slate-800">{inv.customerName}</span>
                    {inv.customerMobile && (
                      <span className="text-[10px] text-slate-500 font-mono block">
                        +91 {inv.customerMobile}
                      </span>
                    )}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Daily: +₹{(inv.dailyReturn || 0).toFixed(2)}</span>
                  <span className="text-emerald-600 font-bold">Total: ₹{(inv.totalReturn || 0).toLocaleString('en-IN')}</span>
                </div>

                {/* Grid View Timer vs Claim button vs Black Pending button */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                  {isWithdrawalPending ? (
                    <button
                      disabled
                      className="px-3 py-1 bg-black text-white font-extrabold text-[11px] rounded-lg border border-slate-800 shadow-2xs flex items-center gap-1 cursor-not-allowed"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      <span>विड्रॉल पेंडिंग</span>
                    </button>
                  ) : isApproved ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">Approved</span>
                  ) : !isComplete ? (
                    /* DURATION NOT EXPIRED: TIMER ONLY */
                    <div className="px-2.5 py-1 bg-slate-900 text-amber-400 font-mono font-bold text-[11px] rounded-lg border border-amber-500/30 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
                      <span>{timerStr}</span>
                    </div>
                  ) : (
                    /* DURATION EXPIRED: CLEAN / CLAIM NOW BUTTON */
                    <button
                      onClick={() => handleClaimAndWithdraw(inv)}
                      disabled={claimingMap[inv.id]}
                      className="px-3 py-1 bg-[#FF8904] hover:bg-[#e67a00] active:scale-95 text-white font-bold text-[11px] rounded-lg shadow-2xs transition-all cursor-pointer"
                    >
                      Claim Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
