'use client';

import React, { useState, useEffect } from 'react';
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
import DesktopSidebar from '@/components/DesktopSidebar';
import DesktopHeader from '@/components/DesktopHeader';
import MobileHeader from '@/components/MobileHeader';
import MobileBottomNav, { NavTab } from '@/components/MobileBottomNav';
import HomeScreen from '@/components/screens/HomeScreen';
import NetworkScreen from '@/components/screens/NetworkScreen';
import EarningsScreen from '@/components/screens/EarningsScreen';
import WalletScreen from '@/components/screens/WalletScreen';
import ProfileScreen from '@/components/screens/ProfileScreen';
import AuthScreen from '@/components/screens/AuthScreen';
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
import PurchaseHistoryContent from '@/components/modals/PurchaseHistoryContent';
import InvestmentCertificateModal from '@/components/modals/InvestmentCertificateModal';
import OnboardingSlider from '@/components/OnboardingSlider';
import AdminPanel from '@/components/admin/AdminPanel';
import { UserAccountData, testConnection, getCustomPlansFromFirestore, getAllCustomersFromFirestore } from '@/lib/firebase';
import { triggerConfetti } from '@/lib/confetti';

function subscribeWindowResize(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('resize', callback);
  return () => window.removeEventListener('resize', callback);
}

function getWindowWidthSnapshot() {
  return typeof window !== 'undefined' ? window.innerWidth : 1024;
}

function getWindowWidthServerSnapshot() {
  return 1024;
}

export default function InvestmentApp() {
  // Prevent SSR Hydration Mismatch
  const [hasMounted, setHasMounted] = useState(false);

  // Route & Onboarding States
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserAccountData | null>(null);

  // Main App State
  const [userStats, setUserStats] = useState<UserStats>(INITIAL_USER_STATS);
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [activeInvestments, setActiveInvestments] = useState<ActiveInvestment[]>(INITIAL_ACTIVE_INVESTMENTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [referrals] = useState<ReferralMember[]>(INITIAL_REFERRALS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);

  // Navigation & View State
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All Plans');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [manualLayout, setManualLayout] = useState<'desktop' | 'mobile' | null>(null);

  // Modals & Toast State
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
    | 'purchase-history'
  >('none');
  const [selectedPlanForDetail, setSelectedPlanForDetail] = useState<InvestmentPlan | null>(null);
  const [selectedCustomerForConfirm, setSelectedCustomerForConfirm] = useState<Customer | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Certificate Modal State
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certificatePlan, setCertificatePlan] = useState<InvestmentPlan | null>(null);
  const [certificateCustomer, setCertificateCustomer] = useState<Customer | null>(null);

  // Hydration & Client-side Initialization
  useEffect(() => {
    setHasMounted(true);

    if (typeof window === 'undefined') return;

    // 1. Check Admin Route
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    if (
      Boolean((window as any).__IS_ADMIN_ROUTE__) ||
      path.includes('admin') ||
      hash.includes('admin') ||
      search.includes('admin')
    ) {
      setIsAdminRoute(true);
    }

    // 2. Always show Onboarding Slider Screen on App Launch
    setShowOnboarding(true);

    // 3. Check Logged In User
    try {
      const saved = localStorage.getItem('network_join_pro_user');
      if (saved) {
        const u = JSON.parse(saved);
        setCurrentUser(u);
        const initials =
          u.fullName
            ?.split(' ')
            .map((n: string) => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase() || 'GK';

        setUserStats((prev) => ({
          ...prev,
          userName: u.fullName || prev.userName,
          userInitials: initials,
          loginUid: u.loginUid,
          email: u.email,
          mobile: u.mobile,
          walletBalance: u.balance ?? prev.walletBalance,
        }));
      }
    } catch {
      // fallback
    }

    const handleRouteCheck = () => {
      const p = window.location.pathname.toLowerCase();
      const h = window.location.hash.toLowerCase();
      const s = window.location.search.toLowerCase();
      if (
        (window as any).__IS_ADMIN_ROUTE__ ||
        p.includes('admin') ||
        h.includes('admin') ||
        s.includes('admin')
      ) {
        setIsAdminRoute(true);
      }
    };

    window.addEventListener('popstate', handleRouteCheck);
    window.addEventListener('hashchange', handleRouteCheck);
    return () => {
      window.removeEventListener('popstate', handleRouteCheck);
      window.removeEventListener('hashchange', handleRouteCheck);
    };
  }, []);

  // Fetch Custom Admin-created Plans on Mount
  useEffect(() => {
    let isMounted = true;
    getCustomPlansFromFirestore().then((customPlans) => {
      if (!isMounted) return;
      if (customPlans && customPlans.length > 0) {
        const formattedCustomPlans: InvestmentPlan[] = customPlans.map((p: any) => {
          const amt = p.amount ?? p.price ?? 0;
          const days = p.durationDays ?? p.validityDays ?? 30;
          const roi = p.roiPercentage ?? p.dailyPercent ?? 0;
          const daily = p.dailyEarnings ?? p.dailyReturn ?? (amt * (roi / 100));
          const total = p.totalReturn ?? (amt + (daily * days));
          const cat = p.category || 'Starter';

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
        setPlans(formattedCustomPlans);
      } else {
        setPlans([]);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Saved Customers from Firestore on Mount
  useEffect(() => {
    let isMounted = true;
    getAllCustomersFromFirestore().then((custs) => {
      if (isMounted && custs && custs.length > 0) {
        setCustomers((prev) => {
          const merged = [...custs];
          prev.forEach((p) => {
            if (!merged.some((m) => m.id === p.id)) {
              merged.push(p);
            }
          });
          return merged;
        });
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync external window width safely
  const windowWidth = React.useSyncExternalStore(
    subscribeWindowResize,
    getWindowWidthSnapshot,
    getWindowWidthServerSnapshot
  );

  const isDesktop = manualLayout === 'desktop' || (manualLayout === null && windowWidth >= 768);

  // Validate Firestore Connection
  useEffect(() => {
    testConnection();
  }, []);

  // Handlers
  const handleOnboardingComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('has_completed_onboarding', 'true');
    }
    setShowOnboarding(false);
  };

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

  const handleConfirmInvest = (plan: InvestmentPlan, linkedCustomer?: Customer) => {
    if (userStats.walletBalance < plan.amount) {
      showToast('Insufficient wallet balance. Please add funds.');
      setActiveModal('deposit');
      return;
    }

    setUserStats((prev) => ({
      ...prev,
      walletBalance: prev.walletBalance - plan.amount,
      totalJoins: prev.totalJoins + 1,
      activeInvestmentsCount: prev.activeInvestmentsCount + 1,
    }));

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

    if (linkedCustomer) {
      setCertificatePlan(plan);
      setCertificateCustomer(linkedCustomer);
      setShowCertificateModal(true);
    }
  };

  const handleProceedToConfirm = (plan: InvestmentPlan, customer: Customer) => {
    setSelectedPlanForDetail(plan);
    setSelectedCustomerForConfirm(customer);
    setActiveModal('confirm-invest');
  };

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

  const handleSaveCustomer = (newCustomer: Customer) => {
    setCustomers((prev) => [newCustomer, ...prev]);
    showToast(`Customer ${newCustomer.name} (${newCustomer.id}) registered successfully!`);
  };

  const handleOpenPlanDetail = (plan: InvestmentPlan) => {
    setSelectedPlanForDetail(plan);
    setActiveModal('plan-detail');
  };

  // Prevent SSR Hydration Mismatch
  if (!hasMounted) {
    return <div className="min-h-screen bg-[#111111]" />;
  }

  // 1. If admin route detected, render Admin Panel directly
  if (isAdminRoute) {
    return <AdminPanel />;
  }

  // 2. If onboarding is active, render Onboarding Screen
  if (showOnboarding) {
    return <OnboardingSlider onComplete={handleOnboardingComplete} isLoggedIn={Boolean(currentUser)} />;
  }

  // 3. If user is NOT logged in, render Auth / Login & Sign Up screen
  if (!currentUser) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // 4. Render Logged In User Dashboard
  const renderScreenContent = (isMobileView = false) => {
    switch (activeTab) {
      case 'home':
        return (
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
            onOpenPurchaseHistory={() => setActiveModal('purchase-history')}
            activeInvestments={activeInvestments}
            isMobileView={isMobileView}
          />
        );
      case 'network':
        return (
          <NetworkScreen
            stats={userStats}
            referrals={referrals}
            activeInvestments={activeInvestments}
            onOpenPlans={() => setActiveTab('home')}
            onOpenDeposit={() => setActiveModal('deposit')}
          />
        );
      case 'earnings':
        return (
          <EarningsScreen
            stats={userStats}
            activeInvestments={activeInvestments}
            onClaimDailyRoi={handleClaimDailyRoi}
            onOpenPlans={() => setActiveTab('home')}
          />
        );
      case 'wallet':
        return (
          <WalletScreen
            stats={userStats}
            transactions={transactions}
            onOpenDeposit={() => setActiveModal('deposit')}
            onOpenWithdraw={() => setActiveModal('withdraw')}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            stats={userStats}
            onOpenHistory={() => setActiveModal('history')}
            onOpenWithdraw={() => setActiveModal('withdraw')}
            onOpenDeposit={() => setActiveModal('deposit')}
            onOpenAdmin={() => setIsAdminRoute(true)}
            onLogout={handleLogout}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans select-none antialiased">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1e2330] text-amber-400 text-xs sm:text-sm font-bold py-2.5 px-5 rounded-full border border-amber-500/40 shadow-xl backdrop-blur-md animate-bounce flex items-center gap-2">
          <span>✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {isDesktop ? (
        /* Desktop Layout */
        <div className="flex h-screen overflow-hidden bg-slate-100">
          <DesktopSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onChangeTab={setActiveTab}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            userStats={userStats}
            onOpenDeposit={() => setActiveModal('deposit')}
            onOpenWithdraw={() => setActiveModal('withdraw')}
          />
          <div className="flex-1 flex flex-col overflow-hidden">
            <DesktopHeader
              stats={userStats}
              userStats={userStats}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onOpenDeposit={() => setActiveModal('deposit')}
              onOpenWithdraw={() => setActiveModal('withdraw')}
              onOpenHistory={() => setActiveModal('history')}
              onOpenProfile={() => setActiveTab('profile')}
              onOpenNotifications={() => setActiveModal('notifications')}
              onOpenFullKyc={() => setActiveModal('full-kyc')}
              onOpenAddCustomer={() => setActiveModal('add-customer')}
              onOpenCustomerList={() => setActiveModal('customer-list')}
              onOpenAdmin={() => setIsAdminRoute(true)}
            />
            <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
              {renderScreenContent(false)}
            </main>
          </div>
        </div>
      ) : (
        /* Mobile Layout - Clean White Background */
        <div className="flex-1 flex flex-col max-w-md mx-auto w-full bg-[#fcfbfa] min-h-screen relative pb-20 overflow-x-hidden shadow-2xl">
          <MobileHeader
            stats={userStats}
            userStats={userStats}
            activeTab={activeTab}
            onOpenDeposit={() => setActiveModal('deposit')}
            onOpenHistory={() => setActiveModal('history')}
            onOpenAddCustomer={() => setActiveModal('add-customer')}
            onOpenCustomerList={() => setActiveModal('customer-list')}
            onOpenProfile={() => setActiveTab('profile')}
            onOpenNotifications={() => setActiveModal('notifications')}
            onOpenFullKyc={() => setActiveModal('full-kyc')}
            onOpenAdmin={() => setIsAdminRoute(true)}
          />
          <main className="flex-1 px-3.5 pt-3">
            {renderScreenContent(true)}
          </main>
          <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} onChangeTab={setActiveTab} />
        </div>
      )}

      {/* Slide / Full Screen Modals */}
      <SlideFullScreenModal
        isOpen={activeModal === 'plan-detail'}
        onClose={() => setActiveModal('none')}
        title="Plan Details & Activate"
      >
        {selectedPlanForDetail && (
          <PlanDetailContent
            plan={selectedPlanForDetail}
            stats={userStats}
            userStats={userStats}
            customers={customers}
            onProceedToConfirm={(plan, customer) => handleProceedToConfirm(plan, customer)}
            onOpenDeposit={() => setActiveModal('deposit')}
            onOpenAddCustomer={() => setActiveModal('add-customer')}
          />
        )}
      </SlideFullScreenModal>

      <SlideFullScreenModal
        isOpen={activeModal === 'confirm-invest'}
        onClose={() => setActiveModal('none')}
        title="Confirm Plan Activation"
      >
        {selectedPlanForDetail && selectedCustomerForConfirm && (
          <ConfirmInvestContent
            plan={selectedPlanForDetail}
            customer={selectedCustomerForConfirm}
            stats={userStats}
            userStats={userStats}
            onConfirmInvest={(plan, cust) => {
              handleConfirmInvest(plan, cust);
              setActiveModal('none');
            }}
            onOpenDeposit={() => setActiveModal('deposit')}
            onCancel={() => setActiveModal('plan-detail')}
            onClose={() => setActiveModal('none')}
          />
        )}
      </SlideFullScreenModal>

      <SlideFullScreenModal
        isOpen={activeModal === 'deposit'}
        onClose={() => setActiveModal('none')}
        title="Recharge Wallet"
      >
        <DepositContent
          currentBalance={userStats.walletBalance}
          userStats={userStats}
          onDepositSuccess={(amt, method) => {
            handleDepositSuccess(amt, method);
            setActiveModal('none');
          }}
          onClose={() => setActiveModal('none')}
        />
      </SlideFullScreenModal>

      <SlideFullScreenModal
        isOpen={activeModal === 'withdraw'}
        onClose={() => setActiveModal('none')}
        title="Withdraw Payout"
      >
        <WithdrawContent
          userStats={userStats}
          onWithdrawSuccess={(amt, target) => {
            handleWithdrawSuccess(amt, target);
            setActiveModal('none');
          }}
        />
      </SlideFullScreenModal>

      <SlideFullScreenModal
        isOpen={activeModal === 'history'}
        onClose={() => setActiveModal('none')}
        title="Transaction History"
      >
        <HistoryContent transactions={transactions} />
      </SlideFullScreenModal>

      <SlideFullScreenModal
        isOpen={activeModal === 'tax-summary'}
        onClose={() => setActiveModal('none')}
        title="Tax & Earnings Summary"
      >
        <TaxSummaryContent userStats={userStats} activeInvestments={activeInvestments} />
      </SlideFullScreenModal>

      <SlideFullScreenModal
        isOpen={activeModal === 'notifications'}
        onClose={() => setActiveModal('none')}
        title="Notifications"
      >
        <NotificationsContent />
      </SlideFullScreenModal>

      <SlideFullScreenModal
        isOpen={activeModal === 'full-kyc'}
        onClose={() => setActiveModal('none')}
        title="Full KYC Verification"
      >
        <FullKycContent
          userStats={userStats}
          onKycSubmitted={() => {
            showToast('KYC Documents submitted for verification!');
            setActiveModal('none');
          }}
        />
      </SlideFullScreenModal>

      <SlideFullScreenModal
        isOpen={activeModal === 'add-customer'}
        onClose={() => setActiveModal('none')}
        title="Add Customer"
      >
        <AddCustomerContent
          onSaveCustomer={(newCust) => {
            handleSaveCustomer(newCust);
          }}
          onClose={() => setActiveModal('none')}
          onNavigateHome={() => setActiveTab('home')}
        />
      </SlideFullScreenModal>

      <SlideFullScreenModal
        isOpen={activeModal === 'customer-list'}
        onClose={() => setActiveModal('none')}
        title="Customer Database"
      >
        <CustomerListContent
          customers={customers}
          onSelectCustomer={(cust) => {
            setActiveModal('none');
            showToast(`Selected ${cust.name}`);
          }}
        />
      </SlideFullScreenModal>

      <SlideFullScreenModal
        isOpen={activeModal === 'purchase-history'}
        onClose={() => setActiveModal('none')}
        title="Plan History"
      >
        <PurchaseHistoryContent
          activeInvestments={activeInvestments}
          onOpenPlans={() => {
            setActiveModal('none');
            setActiveTab('home');
          }}
        />
      </SlideFullScreenModal>

      {/* Official Government Investment Certificate Modal */}
      <InvestmentCertificateModal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        plan={certificatePlan}
        customer={certificateCustomer}
      />
    </div>
  );
}
