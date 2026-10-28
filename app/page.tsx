'use client';

import React, { useState } from 'react';
import {
  INITIAL_USER_STATS,
  INITIAL_PLANS,
  INITIAL_ACTIVE_INVESTMENTS,
  INITIAL_TRANSACTIONS,
  INITIAL_REFERRALS,
  INITIAL_CUSTOMERS,
} from '@/data/initialData';
import {
  Category,
  InvestmentPlan,
  UserStats,
  ActiveInvestment,
  Transaction,
  ReferralMember,
  Customer,
} from '@/types/investment';
import { Users } from 'lucide-react';
import DesktopSidebar from '@/components/DesktopSidebar';
import DesktopHeader from '@/components/DesktopHeader';
import MobileHeader from '@/components/MobileHeader';
import MobileBottomNav, { NavTab } from '@/components/MobileBottomNav';
import HomeScreen from '@/components/screens/HomeScreen';
import NetworkScreen from '@/components/screens/NetworkScreen';
import EarningsScreen from '@/components/screens/EarningsScreen';
import WalletScreen from '@/components/screens/WalletScreen';
import ProfileScreen from '@/components/screens/ProfileScreen';
import SlideFullScreenModal from '@/components/modals/SlideFullScreenModal';
import PlanDetailContent from '@/components/modals/PlanDetailContent';
import DepositContent from '@/components/modals/DepositContent';
import WithdrawContent from '@/components/modals/WithdrawContent';
import HistoryContent from '@/components/modals/HistoryContent';
import TaxSummaryContent from '@/components/modals/TaxSummaryContent';
import NotificationsContent from '@/components/modals/NotificationsContent';
import FullKycContent from '@/components/modals/FullKycContent';
import AddCustomerContent from '@/components/modals/AddCustomerContent';
import CustomerListContent from '@/components/modals/CustomerListContent';
import ConfirmInvestContent from '@/components/modals/ConfirmInvestContent';
import SplashScreen from '@/components/SplashScreen';
import AuthScreen from '@/components/screens/AuthScreen';
import AdminPanel from '@/components/admin/AdminPanel';
import { UserAccountData, testConnection, getCustomPlansFromFirestore } from '@/lib/firebase';
import { triggerConfetti } from '@/lib/confetti';

export default function InvestmentApp() {
  // Admin Route Detection
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    return (
      Boolean((window as any).__IS_ADMIN_ROUTE__) ||
      path.includes('admin') ||
      hash.includes('admin') ||
      search.includes('admin')
    );
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (
        (window as any).__IS_ADMIN_ROUTE__ ||
        path.includes('admin') ||
        hash.includes('admin') ||
        search.includes('admin')
      ) {
        setIsAdminRoute(true);
      }
    };
    checkRoute();
    window.addEventListener('popstate', checkRoute);
    window.addEventListener('hashchange', checkRoute);
    return () => {
      window.removeEventListener('popstate', checkRoute);
      window.removeEventListener('hashchange', checkRoute);
    };
  }, []);
  // Main State
  const [userStats, setUserStats] = useState<UserStats>(() => {
    if (typeof window === 'undefined') return INITIAL_USER_STATS;
    try {
      const saved = localStorage.getItem('network_join_pro_user');
      if (saved) {
        const u = JSON.parse(saved);
        const initials =
          u.fullName
            ?.split(' ')
            .map((n: string) => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase() || 'GK';
        return {
          ...INITIAL_USER_STATS,
          userName: u.fullName || INITIAL_USER_STATS.userName,
          userInitials: initials,
          loginUid: u.loginUid,
          email: u.email,
          mobile: u.mobile,
          walletBalance: u.balance ?? INITIAL_USER_STATS.walletBalance,
        };
      }
    } catch {
      // fallback
    }
    return INITIAL_USER_STATS;
  });
  const [plans, setPlans] = useState<InvestmentPlan[]>(INITIAL_PLANS);

  // Fetch custom admin-created plans from Firestore / LocalStorage on mount
  React.useEffect(() => {
    let isMounted = true;
    getCustomPlansFromFirestore().then((customPlans) => {
      if (!isMounted || !customPlans || customPlans.length === 0) return;
      const formattedCustomPlans: InvestmentPlan[] = customPlans.map((p: any) => {
        const amt = p.amount ?? p.price ?? 0;
        const days = p.durationDays ?? p.validityDays ?? 30;
        const roi = p.roiPercentage ?? p.dailyPercent ?? 0;
        const daily = p.dailyEarnings ?? p.dailyReturn ?? (amt * (roi / 100));
        const total = p.totalReturn ?? (amt + (daily * days));
        const cat = p.category || 'VIP';

        return {
          id: String(p.id),
          name: p.name || 'Investment Plan',
          category: cat,
          durationDays: days,
          roiPercentage: roi,
          amount: amt,
          dailyEarnings: Math.round(daily * 100) / 100,
          totalReturn: Math.round(total * 100) / 100,
          iconType: p.iconType || (cat === 'VIP' ? 'crown' : cat === 'Platinum' ? 'gem' : cat === 'Gold' ? 'badge' : cat === 'Silver' ? 'shield' : 'lightning'),
          featured: p.featured ?? true,
          totalInvestors: p.totalInvestors ?? Math.floor(100 + Math.random() * 500),
          description: p.description || `${p.name} - ${days} Days high return plan.`,
        };
      });

      const existingIds = new Set(formattedCustomPlans.map((p) => p.id));
      const remainingInitial = INITIAL_PLANS.filter((p) => !existingIds.has(p.id));
      setPlans([...formattedCustomPlans, ...remainingInitial]);
    });
    return () => {
      isMounted = false;
    };
  }, []);
  const [activeInvestments, setActiveInvestments] = useState<ActiveInvestment[]>(
    INITIAL_ACTIVE_INVESTMENTS
  );
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [referrals] = useState<ReferralMember[]>(INITIAL_REFERRALS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All Plans');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [manualLayout, setManualLayout] = useState<'desktop' | 'mobile' | null>(null);

  const windowWidth = React.useSyncExternalStore(
    (callback) => {
      if (typeof window === 'undefined') return () => {};
      window.addEventListener('resize', callback);
      return () => window.removeEventListener('resize', callback);
    },
    () => (typeof window !== 'undefined' ? window.innerWidth : 1024),
    () => 1024
  );

  // Determine if desktop layout is active (>= 768px is desktop)
  const isDesktop = manualLayout === 'desktop' || (manualLayout === null && windowWidth >= 768);

  // Full Screen Slide Modals (Right-to-Left animation in mobile)
  const [activeModal, setActiveModal] = useState<
    | 'none'
    | 'plan-detail'
    | 'confirm-invest'
    | 'deposit'
    | 'withdraw'
    | 'history'
    | 'tax-summary'
    | 'notifications'
    | 'full-kyc'
    | 'add-customer'
    | 'customer-list'
  >('none');
  const [selectedPlanForDetail, setSelectedPlanForDetail] = useState<InvestmentPlan | null>(null);
  const [selectedCustomerForConfirm, setSelectedCustomerForConfirm] = useState<Customer | null>(null);

  // Toast Notification Message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Splash Screen & User Authentication State
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserAccountData | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem('network_join_pro_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthChecked] = useState(true);

  // Validate Firestore connection per Skill
  React.useEffect(() => {
    testConnection();
  }, []);

  const handleLoginSuccess = (user: UserAccountData) => {
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('network_join_pro_user', JSON.stringify(user));
    }

    const initials =
      user.fullName
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase() || 'GK';

    setUserStats((prev) => ({
      ...prev,
      userName: user.fullName || prev.userName,
      userInitials: initials,
      loginUid: user.loginUid,
      email: user.email,
      mobile: user.mobile,
      walletBalance: user.balance ?? prev.walletBalance,
    }));

    showToast(`Welcome, ${user.fullName}! (Login Successful)`);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('network_join_pro_user');
    }
    setCurrentUser(null);
    showToast('Logged out successfully.');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Join a plan (with optional linked customer)
  const handleConfirmInvest = (plan: InvestmentPlan, linkedCustomer?: Customer) => {
    if (userStats.walletBalance < plan.amount) {
      showToast('Insufficient wallet balance. Please add funds.');
      setActiveModal('deposit');
      return;
    }

    // Deduct from wallet
    setUserStats((prev) => ({
      ...prev,
      walletBalance: prev.walletBalance - plan.amount,
      totalJoins: prev.totalJoins + 1,
      activeInvestmentsCount: prev.activeInvestmentsCount + 1,
    }));

    // Add active investment with customer association
    const newInvestment: ActiveInvestment = {
      id: `act-${Date.now()}`,
      planId: plan.id,
      planName: linkedCustomer ? `${plan.name} • ${linkedCustomer.name}` : plan.name,
      investedAmount: plan.amount,
      dailyReturn: plan.dailyEarnings,
      totalReturn: plan.totalReturn,
      totalDays: plan.durationDays,
      daysCompleted: 1,
      startDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'active',
      customerId: linkedCustomer?.id,
      customerName: linkedCustomer?.name,
      customerMobile: linkedCustomer?.mobile,
      customerPhoto: linkedCustomer?.photo,
    };
    setActiveInvestments((prev) => [newInvestment, ...prev]);

    // Record Transaction
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'investment',
      title: linkedCustomer
        ? `Activated ${plan.name} for ${linkedCustomer.name}`
        : `Joined ${plan.name}`,
      amount: plan.amount,
      timestamp: 'Just now',
      status: 'completed',
      referenceId: `INV${Math.floor(100000 + Math.random() * 900000)}`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    showToast(
      linkedCustomer
        ? `Plan "${plan.name}" successfully activated for ${linkedCustomer.name} (+91 ${linkedCustomer.mobile})!`
        : `Successfully subscribed to ${plan.name}!`
    );
  };

  // Proceed from Plan Details to the full-screen Confirm Investment screen
  const handleProceedToConfirm = (plan: InvestmentPlan, customer: Customer) => {
    setSelectedPlanForDetail(plan);
    setSelectedCustomerForConfirm(customer);
    setActiveModal('confirm-invest');
  };

  // 2. Deposit Funds
  const handleDepositSuccess = (amount: number, method: string) => {
    setUserStats((prev) => ({
      ...prev,
      walletBalance: prev.walletBalance + amount,
    }));

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'deposit',
      title: `Wallet Deposit via ${method}`,
      amount,
      timestamp: 'Just now',
      status: 'completed',
      paymentMethod: method,
      referenceId: `DEP${Math.floor(100000 + Math.random() * 900000)}`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    showToast(`₹${amount.toLocaleString('en-IN')} added to your wallet!`);
  };

  // 3. Withdraw Funds
  const handleWithdrawSuccess = (amount: number, target: string) => {
    if (amount > userStats.walletBalance) {
      showToast('Withdrawal amount exceeds balance');
      return;
    }

    setUserStats((prev) => ({
      ...prev,
      walletBalance: prev.walletBalance - amount,
      totalPayout: prev.totalPayout + amount,
    }));

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'withdrawal',
      title: `Instant Payout to ${target}`,
      amount,
      timestamp: 'Just now',
      status: 'completed',
      paymentMethod: target,
      referenceId: `WTH${Math.floor(100000 + Math.random() * 900000)}`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    showToast(`₹${amount.toLocaleString('en-IN')} withdrawn successfully!`);
  };

  // 4. Claim Daily ROI
  const handleClaimDailyRoi = () => {
    if (userStats.unclaimedRoi <= 0) return;

    const claimed = userStats.unclaimedRoi;
    setUserStats((prev) => ({
      ...prev,
      walletBalance: prev.walletBalance + claimed,
      totalEarned: prev.totalEarned + claimed,
      unclaimedRoi: 0,
    }));

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'roi_credit',
      title: 'Daily ROI Payout Credited',
      amount: claimed,
      timestamp: 'Just now',
      status: 'completed',
      referenceId: `ROI${Math.floor(100000 + Math.random() * 900000)}`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    triggerConfetti();
    showToast(`₹${claimed.toFixed(2)} daily income credited to wallet!`);
  };

  // 5. Save New Customer
  const handleSaveCustomer = (newCustomer: Customer) => {
    setCustomers((prev) => [newCustomer, ...prev]);
    showToast(`Customer ${newCustomer.name} (${newCustomer.id}) registered successfully!`);
  };

  // Helper to open plan detail
  const handleOpenPlanDetail = (plan: InvestmentPlan) => {
    setSelectedPlanForDetail(plan);
    setActiveModal('plan-detail');
  };

  // 0. Direct Admin Route Bypass
  if (isAdminRoute) {
    return <AdminPanel />;
  }

  // 1. Initial Animated Splash Screen
  if (showSplash) {
    return (
      <SplashScreen
        onComplete={() => {
          if (typeof window !== 'undefined') {
            try {
              const saved = localStorage.getItem('network_join_pro_user');
              if (saved) {
                const user = JSON.parse(saved);
                if (user && (user.loginUid || user.fullName)) {
                  setCurrentUser(user);
                  const initials =
                    user.fullName
                      ?.split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase() || 'GK';

                  setUserStats((prev) => ({
                    ...prev,
                    userName: user.fullName || prev.userName,
                    userInitials: initials,
                    loginUid: user.loginUid,
                    email: user.email,
                    mobile: user.mobile,
                    walletBalance: user.balance ?? prev.walletBalance,
                  }));
                }
              }
            } catch {
              // fallback
            }
          }
          setShowSplash(false);
        }}
      />
    );
  }

  // 2. Full-Screen Login & Multi-step Sign Up Screen if not logged in
  if (isAuthChecked && !currentUser) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#faf6ee] font-sans text-[#46280b] antialiased selection:bg-[#d9a54c] selection:text-[#2b1706]">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#2b1706] text-[#ffeec9] text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-2xl border border-[#d9a54c] flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#d9a54c]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          DESKTOP LAYOUT (When isDesktop === true)
          - Emerald Green Sidebar is ALWAYS VISIBLE on the left (matches Screenshot 1)
          - DesktopHeader is at the top
          - Bottom Navigation Menu is COMPLETELY DELETED / REMOVED!
          ========================================================================= */}
      {isDesktop ? (
        <div className="flex min-h-screen w-full bg-[#faf6ee]">
          {/* 1. Left Royal Palace Dark Bronze Sidebar */}
          <DesktopSidebar
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            onOpenDeposit={() => setActiveModal('deposit')}
            onOpenWithdraw={() => setActiveModal('withdraw')}
          />

          {/* 2. Main Content Viewport Full Screen */}
          <div className="flex-1 flex flex-col min-w-0 w-full bg-[#faf6ee]">
            {/* Top Desktop Header (Only shown on Home tab) */}
            {activeTab === 'home' && (
              <DesktopHeader
                stats={userStats}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onOpenDeposit={() => setActiveModal('deposit')}
                onOpenWithdraw={() => setActiveModal('withdraw')}
                onOpenHistory={() => setActiveModal('history')}
                onOpenProfile={() => setActiveTab('profile')}
                onOpenAddCustomer={() => setActiveModal('add-customer')}
                onOpenCustomerList={() => setActiveModal('customer-list')}
                onToggleMobileLayout={() => setManualLayout('mobile')}
                onOpenAdmin={() => setIsAdminRoute(true)}
              />
            )}

            {/* Scrollable Main Area Full Width (Side gaps removed) */}
            <main className="flex-1 px-3 sm:px-4 py-3.5 w-full max-w-full">
              {/* Screens */}
              {activeTab === 'home' && (
                <HomeScreen
                  stats={userStats}
                  plans={plans}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onJoinPlan={handleOpenPlanDetail}
                  onViewPlanDetails={handleOpenPlanDetail}
                  onOpenDeposit={() => setActiveModal('deposit')}
                  onOpenWithdraw={() => setActiveModal('withdraw')}
                  onClaimDailyRoi={handleClaimDailyRoi}
                  onOpenFullKyc={() => setActiveModal('full-kyc')}
                  activeInvestments={activeInvestments}
                  isMobileView={false}
                />
              )}

              {activeTab === 'network' && (
                <NetworkScreen
                  stats={userStats}
                  referrals={referrals}
                  activeInvestments={activeInvestments}
                  onOpenPlans={() => setActiveTab('home')}
                  onOpenDeposit={() => setActiveModal('deposit')}
                />
              )}

              {activeTab === 'earnings' && (
                <EarningsScreen
                  stats={userStats}
                  activeInvestments={activeInvestments}
                  onClaimDailyRoi={handleClaimDailyRoi}
                  onOpenPlans={() => setActiveTab('home')}
                />
              )}

              {activeTab === 'wallet' && (
                <WalletScreen
                  stats={userStats}
                  transactions={transactions}
                  onOpenDeposit={() => setActiveModal('deposit')}
                  onOpenWithdraw={() => setActiveModal('withdraw')}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileScreen
                  stats={userStats}
                  onOpenHistory={() => setActiveModal('history')}
                  onOpenWithdraw={() => setActiveModal('withdraw')}
                  onOpenDeposit={() => setActiveModal('deposit')}
                  onOpenAdmin={() => setIsAdminRoute(true)}
                  onLogout={handleLogout}
                />
              )}
            </main>
          </div>
        </div>
      ) : (
        /* =========================================================================
            MOBILE LAYOUT (When isDesktop === false)
            - Top Bar has MobileHeader directly at top (SJ avatar, NO VIP PRO text, Wallet, +Customer, History, Notification Bell)
            - NO SIDEBAR
            - Bottom Navigation Menu IS DISPLAYED (Home, Network, Earnings, Wallet, Profile)
            ========================================================================= */
        <div className="flex flex-col min-h-screen bg-[#faf6ee] text-[#46280b]">
          {/* Top Mobile Header (Only shown on Home tab) */}
          {activeTab === 'home' && (
            <MobileHeader
              stats={userStats}
              onOpenDeposit={() => setActiveModal('deposit')}
              onOpenHistory={() => setActiveModal('history')}
              onOpenAddCustomer={() => setActiveModal('add-customer')}
              onOpenProfile={() => setActiveTab('profile')}
              onOpenNotifications={() => setActiveModal('notifications')}
              onOpenAdmin={() => setIsAdminRoute(true)}
            />
          )}

          {/* Main Mobile Scrollable Content (Reduced top gap) */}
          <main className="flex-1 px-3 pt-1.5 pb-24 overflow-y-auto max-w-lg mx-auto w-full">
            {activeTab === 'home' && (
              <HomeScreen
                stats={userStats}
                plans={plans}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onJoinPlan={handleOpenPlanDetail}
                onViewPlanDetails={handleOpenPlanDetail}
                onOpenDeposit={() => setActiveModal('deposit')}
                onOpenWithdraw={() => setActiveModal('withdraw')}
                onClaimDailyRoi={handleClaimDailyRoi}
                onOpenFullKyc={() => setActiveModal('full-kyc')}
                activeInvestments={activeInvestments}
                isMobileView={true}
              />
            )}

            {activeTab === 'network' && (
              <NetworkScreen
                stats={userStats}
                referrals={referrals}
                activeInvestments={activeInvestments}
                onOpenPlans={() => setActiveTab('home')}
                onOpenDeposit={() => setActiveModal('deposit')}
              />
            )}

            {activeTab === 'earnings' && (
              <EarningsScreen
                stats={userStats}
                activeInvestments={activeInvestments}
                onClaimDailyRoi={handleClaimDailyRoi}
                onOpenPlans={() => setActiveTab('home')}
              />
            )}

            {activeTab === 'wallet' && (
              <WalletScreen
                stats={userStats}
                transactions={transactions}
                onOpenDeposit={() => setActiveModal('deposit')}
                onOpenWithdraw={() => setActiveModal('withdraw')}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileScreen
                stats={userStats}
                onOpenHistory={() => setActiveModal('history')}
                onOpenWithdraw={() => setActiveModal('withdraw')}
                onOpenDeposit={() => setActiveModal('deposit')}
                onOpenAdmin={() => setIsAdminRoute(true)}
                onLogout={handleLogout}
              />
            )}
          </main>

          {/* Bottom Navigation Menu (Only shown in Mobile layout!) */}
          <MobileBottomNav
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            unclaimedEarnings={userStats.unclaimedRoi}
          />
        </div>
      )}

      {/* =========================================================================
          SMOOTH RIGHT-TO-LEFT FULL SCREEN SLIDE MODALS
          ========================================================================= */}
      {/* 1. Add New Customer Modal (Triggered by + Customer button) */}
      <SlideFullScreenModal
        isOpen={activeModal === 'add-customer'}
        onClose={() => setActiveModal('none')}
        title="Add New Customer"
        subtitle="Customer registration, KYC verification & bank details"
        headerRight={
          <button
            type="button"
            onClick={() => setActiveModal('customer-list')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-950 hover:bg-blue-900 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs transition-all border border-blue-800/40"
            title="Total Registered Customers"
          >
            <Users className="w-3.5 h-3.5 text-blue-300" />
            <span className="hidden xs:inline text-[11px]">Customers</span>
            <span className="bg-blue-800/80 text-blue-100 px-1.5 py-0.2 rounded-md text-[10px] font-black">
              {customers.length}
            </span>
          </button>
        }
      >
        <AddCustomerContent
          onSaveCustomer={handleSaveCustomer}
          onViewCustomersList={() => setActiveModal('customer-list')}
          totalCustomersCount={customers.length}
          onClose={() => setActiveModal('none')}
          onNavigateHome={() => {
            setActiveModal('none');
            setActiveTab('home');
          }}
        />
      </SlideFullScreenModal>

      {/* 2. Customer List Modal (Triggered by View Customers button) */}
      <SlideFullScreenModal
        isOpen={activeModal === 'customer-list'}
        onClose={() => setActiveModal('none')}
        title="Customer Directory"
        subtitle={`Total registered customers: ${customers.length}`}
      >
        <CustomerListContent
          customers={customers}
          onOpenAddCustomer={() => setActiveModal('add-customer')}
        />
      </SlideFullScreenModal>

      {/* 3. Plan Details / Confirm Invest */}
      <SlideFullScreenModal
        isOpen={activeModal === 'plan-detail'}
        onClose={() => setActiveModal('none')}
        title={selectedPlanForDetail?.name || 'Investment Plan'}
        subtitle="Verify customer mobile & enroll in yield plan"
      >
        <PlanDetailContent
          plan={selectedPlanForDetail}
          stats={userStats}
          customers={customers}
          onProceedToConfirm={handleProceedToConfirm}
          onConfirmInvest={handleConfirmInvest}
          onOpenDeposit={() => setActiveModal('deposit')}
          onClose={() => setActiveModal('none')}
        />
      </SlideFullScreenModal>

      {/* 3b. Confirm Investment Screen (Smooth Right-to-Left Full Screen) */}
      <SlideFullScreenModal
        isOpen={activeModal === 'confirm-invest'}
        onClose={() => setActiveModal('plan-detail')}
        title="Confirm Investment"
        subtitle="Review customer & plan details"
      >
        <ConfirmInvestContent
          plan={selectedPlanForDetail}
          customer={selectedCustomerForConfirm}
          stats={userStats}
          onConfirmInvest={(plan, customer) => {
            handleConfirmInvest(plan, customer);
            setActiveModal('none');
          }}
          onOpenDeposit={() => setActiveModal('deposit')}
          onClose={() => setActiveModal('plan-detail')}
        />
      </SlideFullScreenModal>

      {/* 4. Deposit Funds Modal */}
      <SlideFullScreenModal
        isOpen={activeModal === 'deposit'}
        onClose={() => setActiveModal('none')}
        title="Recharge Wallet"
        subtitle="Instant deposit via UPI 2.0 with 0% platform fee"
      >
        <DepositContent
          currentBalance={userStats.walletBalance}
          userStats={userStats}
          onDepositSuccess={handleDepositSuccess}
          onClose={() => setActiveModal('none')}
        />
      </SlideFullScreenModal>

      {/* 5. Withdraw Funds Modal */}
      <SlideFullScreenModal
        isOpen={activeModal === 'withdraw'}
        onClose={() => setActiveModal('none')}
        title="Instant Withdrawal"
        subtitle="Direct 24/7 bank and UPI payout without charges"
      >
        <WithdrawContent
          currentBalance={userStats.walletBalance}
          onWithdrawSuccess={handleWithdrawSuccess}
          onClose={() => setActiveModal('none')}
        />
      </SlideFullScreenModal>

      {/* 6. Transaction History Modal */}
      <SlideFullScreenModal
        isOpen={activeModal === 'history'}
        onClose={() => setActiveModal('none')}
        title="Transaction Records"
        subtitle="Complete ledger of deposits, yields & payouts"
      >
        <HistoryContent transactions={transactions} />
      </SlideFullScreenModal>

      {/* 7. Finance & Tax Summary Audit Modal */}
      <SlideFullScreenModal
        isOpen={activeModal === 'tax-summary'}
        onClose={() => setActiveModal('none')}
        title="Finance Summary & Tax Audit"
        subtitle="Official audit review & solvency verification"
      >
        <TaxSummaryContent />
      </SlideFullScreenModal>

      {/* 8. Notification Bell Modal */}
      <SlideFullScreenModal
        isOpen={activeModal === 'notifications'}
        onClose={() => setActiveModal('none')}
        title="System Notifications"
        subtitle="Real-time alerts, daily yields & announcements"
      >
        <NotificationsContent />
      </SlideFullScreenModal>

      {/* 9. Full KYC Verification Modal */}
      <SlideFullScreenModal
        isOpen={activeModal === 'full-kyc'}
        onClose={() => setActiveModal('none')}
        title="Full KYC Verification"
        subtitle="Government ID verification for unlimited instant payouts"
      >
        <FullKycContent
          userName={userStats.userName}
          onKycComplete={() => {
            showToast('Full KYC verification active!');
            setActiveModal('none');
          }}
          onClose={() => setActiveModal('none')}
        />
      </SlideFullScreenModal>
    </div>
  );
}
