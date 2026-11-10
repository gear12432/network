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
  ChevronDown,
  ChevronUp,
  Eye,
  MapPin,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export default function PurchaseHistoryContent({
  activeInvestments = [],
  currentUser,
  onOpenPlans,
  onRefreshInvestments,
  onViewCertificate,
  searchQuery: propSearchQuery,
  onSearchChange: propOnSearchChange,
}: PurchaseHistoryContentProps) {
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const activeSearch = propSearchQuery !== undefined ? propSearchQuery : internalSearchQuery;

  const setSearchQuery = (val: string) => {
    if (propOnSearchChange) {
      propOnSearchChange(val);
    } else {
      setInternalSearchQuery(val);
    }
  };

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
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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

    const q = activeSearch.toLowerCase().trim();
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
          value={activeSearch}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-blue-600" />}
          inputClassName="font-medium text-slate-900 text-xs sm:text-sm"
          rightElement={
            activeSearch ? (
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
              {activeSearch
                ? `No purchases found matching "${activeSearch}".`
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
      ) : (
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
            const isExpanded = Boolean(expandedIds[inv.id]);

            return (
              <div
                key={inv.id}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-[#00B9F1]/50 shadow-2xs hover:shadow-sm transition-all overflow-hidden"
              >
                {/* 1. COMPACT LIST ROW (Matches marked height) */}
                <div
                  onClick={() => toggleExpand(inv.id)}
                  className="p-2.5 sm:p-3.5 flex items-center justify-between gap-2.5 cursor-pointer select-none bg-white hover:bg-slate-50/60 transition-colors"
                >
                  {/* Left: Customer Photo + Customer Name + Plan Name */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Customer Profile Picture */}
                    <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-[#00B9F1] shrink-0 shadow-xs bg-slate-100 flex items-center justify-center">
                      {inv.customerPhoto ? (
                        <img
                          src={inv.customerPhoto}
                          alt={inv.customerName || 'Customer'}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-[#002E6E] to-[#00B9F1] text-white flex items-center justify-center font-black text-xs font-serif">
                          {inv.customerName?.[0] || 'C'}
                        </div>
                      )}
                    </div>

                    {/* Customer Name & Plan Name */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-black text-[#172B75] text-xs sm:text-sm leading-tight truncate">
                          {inv.customerName || 'Investor'}
                        </span>
                        <span className="text-[8px] font-black px-1.5 py-0.2 rounded-full bg-[#EAF5FF] text-[#00B9F1] border border-[#00B9F1]/30 uppercase">
                          Active
                        </span>
                      </div>
                      <div className="text-[11px] sm:text-xs text-slate-500 font-bold truncate mt-0.5 flex items-center gap-1">
                        <PlanCategoryIconBadge planName={inv.planName} size="sm" />
                        <span className="truncate">{inv.planName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Plan Amount + Timer + View Icon + Dropdown Toggle */}
                  <div
                    className="flex items-center gap-1.5 sm:gap-2.5 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Plan Amount */}
                    <div className="text-right">
                      <span className="text-[8px] sm:text-[9px] text-slate-400 font-extrabold uppercase block leading-none">
                        Amount
                      </span>
                      <span className="text-xs sm:text-base font-black text-[#002E6E] font-mono leading-tight">
                        ₹{(inv.investedAmount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Timer */}
                    <div className="flex items-center gap-1 bg-[#002E6E] text-white px-2 py-1 rounded-xl text-[10px] sm:text-xs font-mono font-bold shrink-0 shadow-xs">
                      <Clock className="w-3 h-3 text-[#00B9F1] animate-pulse" />
                      <span>{timerStr}</span>
                    </div>

                    {/* Blue View Icon (Click to view certificate with smooth animation) */}
                    {onViewCertificate && (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => onViewCertificate(inv)}
                        className="w-8 h-8 rounded-xl bg-[#EAF5FF] hover:bg-[#00B9F1] text-[#00B9F1] hover:text-white border border-[#00B9F1]/30 flex items-center justify-center transition-colors cursor-pointer shadow-xs shrink-0"
                        title="View Official Certificate"
                      >
                        <Award className="w-4 h-4 stroke-[2.2]" />
                      </motion.button>
                    )}

                    {/* Drop Down Icon (Expands full details & enlarges box) */}
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleExpand(inv.id)}
                      className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                      title={isExpanded ? 'Collapse Details' : 'Show Full Details'}
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          isExpanded ? 'rotate-180 text-[#002E6E]' : ''
                        }`}
                      />
                    </motion.button>
                  </div>
                </div>

                {/* 2. DROPDOWN EXPANDED DETAILS (Smooth Animation & Enlarged Box) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: 'easeInOut' }}
                      className="overflow-hidden border-t border-slate-100 bg-[#F9FBFE] p-3 sm:p-4 space-y-3"
                    >
                      {/* Plan Metrics Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase block leading-none mb-1">
                            Purchased Date
                          </span>
                          <span className="font-extrabold text-slate-800 text-xs">
                            {inv.startDate}
                          </span>
                        </div>

                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase block leading-none mb-1">
                            Plan Duration
                          </span>
                          <span className="font-extrabold text-[#002E6E] text-xs">
                            {inv.totalDays || 30} Days
                          </span>
                        </div>

                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase block leading-none mb-1">
                            Daily Return
                          </span>
                          <span className="font-black text-[#00B9F1] font-mono text-xs">
                            +₹{(inv.dailyReturn || 0).toFixed(2)}/d
                          </span>
                        </div>

                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase block leading-none mb-1">
                            Total Expected
                          </span>
                          <span className="font-black text-[#07865B] font-mono text-xs">
                            ₹{(inv.totalReturn || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* VIP Commission Per Day Breakdown */}
                      <div className="bg-[#EAF5FF] p-3 rounded-xl border border-[#D9E7F5] shadow-2xs space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#002E6E] font-black uppercase text-[10px] tracking-wider flex items-center gap-1">
                            <span>👑</span>
                            <span>VIP Commission (Per Day)</span>
                          </span>
                          <span className="text-[#07865B] font-black font-mono">
                            +₹{(inv.dailyCommission || 0).toFixed(2)}/day
                            {inv.vipCommissionRate ? ` (${inv.vipCommissionRate}%)` : ''}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#172B75] font-semibold">
                          <span>Accumulated Commission ({inv.daysCompleted || 1}/{inv.totalDays || 30} days):</span>
                          <span className="font-mono font-black text-[#002E6E]">
                            ₹{((inv.dailyCommission || 0) * (inv.daysCompleted || 1)).toFixed(2)} / ₹{((inv.dailyCommission || 0) * (inv.totalDays || 30)).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Investment Compounding Progress Bar */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-slate-500 uppercase text-[9px] font-extrabold">
                            Compounding Progress
                          </span>
                          <span className="text-[#002E6E] font-black">
                            Day {inv.daysCompleted || 1} of {inv.totalDays || 30}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-[1px]">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="bg-[#00B9F1] h-full rounded-full"
                          />
                        </div>
                      </div>

                      {/* Customer & Settlement Information Box */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs text-xs space-y-2">
                        <span className="text-[10px] text-[#002E6E] font-black uppercase tracking-wider block">
                          Customer Profile & Details
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-[#00B9F1] shrink-0" />
                            <span className="font-extrabold text-slate-800 truncate">
                              Name: {inv.customerName || 'Investor'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-[#00B9F1] shrink-0" />
                            <span className="font-mono font-bold text-slate-800">
                              +91 {inv.customerMobile || 'Not Linked'}
                            </span>
                          </div>

                          {inv.customerId && (
                            <div className="flex items-center gap-2">
                              <UserCheck className="w-3.5 h-3.5 text-[#00B9F1] shrink-0" />
                              <span className="text-slate-600">
                                Customer ID: <strong className="text-slate-800">{inv.customerId}</strong>
                              </span>
                            </div>
                          )}

                          {inv.bankName && (
                            <div className="flex items-center gap-2 sm:col-span-2">
                              <Building2 className="w-3.5 h-3.5 text-[#00B9F1] shrink-0" />
                              <span className="truncate">
                                Bank: <strong className="text-slate-800">{inv.bankName}</strong> • A/C: {inv.accountNumber} ({inv.ifscCode})
                              </span>
                            </div>
                          )}

                          {inv.customerAddress && (
                            <div className="flex items-center gap-2 sm:col-span-2">
                              <MapPin className="w-3.5 h-3.5 text-[#00B9F1] shrink-0" />
                              <span className="truncate text-slate-600 text-[11px]">
                                Address: {inv.customerAddress}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Bar inside Expanded Details */}
                      <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                        {onViewCertificate && (
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => onViewCertificate(inv)}
                            className="px-4 py-2 rounded-xl bg-[#002E6E] hover:bg-[#002352] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                          >
                            <Award className="w-4 h-4 text-[#00B9F1]" />
                            <span>View Official Bond Certificate</span>
                          </motion.button>
                        )}

                        {isWithdrawalPending ? (
                          <span className="text-xs font-black px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            <span>विड्रॉल पेंडिंग</span>
                          </span>
                        ) : isApproved ? (
                          <span className="text-xs font-black px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Payout Approved</span>
                          </span>
                        ) : isComplete ? (
                          <button
                            onClick={() => handleClaimAndWithdraw(inv)}
                            disabled={claimingMap[inv.id]}
                            className="px-4 py-2 bg-gradient-to-r from-[#FF8904] to-[#ff5d00] text-white text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 uppercase"
                          >
                            {claimingMap[inv.id] ? 'Processing...' : 'CLAIM NOW'}
                          </button>
                        ) : null}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
