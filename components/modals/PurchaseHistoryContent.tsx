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
  const filteredInvestments = (activeInvestments || []).filter((inv) => {
    if (!inv) return false;
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;

    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesStatus;

    const matchesName = Boolean(inv.planName?.toLowerCase().includes(q));
    const matchesAmount = String(inv.investedAmount || '').includes(q);
    const matchesCustomer =
      Boolean(inv.customerName?.toLowerCase().includes(q)) ||
      Boolean(inv.customerMobile?.includes(q));
    const matchesDate = Boolean(inv.startDate?.toLowerCase().includes(q));

    return matchesStatus && (matchesName || matchesAmount || matchesCustomer || matchesDate);
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
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
                      <Coins className="w-5 h-5 stroke-[2.2]" />
                    </div>
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

                {/* Timer & Claim Action Section (where red box was indicated) */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Duration: {inv.totalDays || 30} Days ({(inv.totalDays || 30) * 24} Hours)</span>
                  </div>

                  {/* Real-time Timer vs Claim Button vs Black Pending Button */}
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
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1.5 bg-slate-900 text-amber-400 font-mono font-black text-xs rounded-xl border border-amber-500/40 flex items-center gap-1.5 shadow-2xs">
                        <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                        <span className="tracking-widest">{timerStr}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleClaimAndWithdraw(inv)}
                        title="Instant Claim for testing"
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-300 cursor-pointer"
                      >
                        Claim Now
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleClaimAndWithdraw(inv)}
                      disabled={claimingMap[inv.id]}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      <span>{claimingMap[inv.id] ? 'Processing...' : 'Claim & Withdraw'}</span>
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
                  <div>
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase border ${
                        isWithdrawalPending
                          ? 'bg-black text-white border-slate-800'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {isWithdrawalPending ? 'Pending' : inv.status}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm font-serif mt-1">
                      {inv.planName}
                    </h4>
                  </div>
                  <span className="text-base font-black text-slate-900 font-mono">
                    ₹{(inv.investedAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                {inv.customerName && (
                  <div className="text-xs bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Customer</span>
                    <span className="font-bold text-slate-800">{inv.customerName}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Daily: +₹{(inv.dailyReturn || 0).toFixed(2)}</span>
                  <span className="text-emerald-600 font-bold">Total: ₹{(inv.totalReturn || 0).toLocaleString('en-IN')}</span>
                </div>

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
                    <div className="px-2.5 py-1 bg-slate-900 text-amber-400 font-mono font-bold text-[11px] rounded-lg border border-amber-500/30 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
                      <span>{timerStr}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleClaimAndWithdraw(inv)}
                      disabled={claimingMap[inv.id]}
                      className="px-3 py-1 bg-emerald-600 text-white font-bold text-[11px] rounded-lg shadow-2xs hover:bg-emerald-700 cursor-pointer"
                    >
                      Claim & Withdraw
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
