'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Coins, Sparkles } from 'lucide-react';
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
import InvestAppLogo from '@/components/InvestAppLogo';
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
import AdminPanel from '@/components/admin/AdminPanel';
import AccountBlockedScreen from '@/components/screens/AccountBlockedScreen';
import {
  UserAccountData,
  testConnection,
  saveInvestmentToFirestore,
  saveCustomerToFirestore,
  updateUserBalanceInFirestore,
  updateUserEarningsInFirestore,
  findUserInFirestore,
  getOrCreateDeviceId,
  findUserByDeviceId,
  VipLevelRecord,
  WithdrawalRecord,
  DepositRecord,
  db,
} from '@/lib/firebase';
import { collection, doc, onSnapshot } from 'firebase/firestore';
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

function getInitials(name?: string): string {
  if (!name || typeof name !== 'string') return 'GK';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'GK';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase() || 'GK';
}

class SafeErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: false };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('Caught non-fatal component error:', error, errorInfo);
  }

  render() {
    return this.props.children;
  }
}

function OnboardingSplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-[#F2F8FC] flex flex-col items-center justify-center p-6 select-none animate-in fade-in duration-300">
      <div className="text-center space-y-6 max-w-sm w-full">
        <div className="flex justify-center py-2">
          <InvestAppLogo size="xl" showText={false} className="scale-125" />
        </div>
        <div>
          <h2 className="font-serif font-black text-2xl text-[#172B75] tracking-tight">
            NetworkJoin Pro
          </h2>
          <p className="text-xs font-medium text-[#172B75]/80 mt-1">
            Secure Investment & Wealth Management Platform
          </p>
        </div>

        {/* 6 Zooming Dots (3 in #002E6E and 3 in #00B9F1) */}
        <div className="flex items-center justify-center gap-3 py-6">
          {['#002E6E', '#00B9F1', '#002E6E', '#00B9F1', '#002E6E', '#00B9F1'].map((dotColor, idx) => (
            <motion.div
              key={idx}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: idx * 0.2,
                ease: 'easeInOut',
              }}
              style={{ backgroundColor: dotColor }}
              className="w-4 h-4 rounded-full shadow-md"
            />
          ))}
        </div>

        <p className="text-[11px] font-mono text-[#172B75]/60">
          Initializing secure session...
        </p>
      </div>
    </div>
  );
}

function InvestmentAppMain() {
  // Prevent SSR Hydration Mismatch
  const [hasMounted, setHasMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Route & User States
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccountData | null>(null);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup'>('signup');
  const [vipLevels, setVipLevels] = useState<VipLevelRecord[]>([]);

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
  const [certificateInvestment, setCertificateInvestment] = useState<ActiveInvestment | null>(null);

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

    // 2. Check Logged In User from localStorage or Device ID
    try {
      const saved = localStorage.getItem('network_join_pro_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u && u.loginUid) {
          // Immediately set initial logged-in user state
          setCurrentUser(u);
          const initials = getInitials(u.fullName);

          setUserStats((prev) => ({
            ...prev,
            userName: u.fullName || prev.userName,
            userInitials: initials,
            loginUid: u.loginUid,
            email: u.email,
            mobile: u.mobile,
            walletBalance: u.balance ?? prev.walletBalance,
            unclaimedRoi: u.unclaimedRoi ?? prev.unclaimedRoi ?? 0,
            totalEarned: u.totalEarned ?? prev.totalEarned ?? 0,
            vipLevel: u.vipLevel ?? prev.vipLevel ?? 1,
            totalCustomerInvested: u.totalCustomerInvested ?? prev.totalCustomerInvested ?? 0,
          }));

          // Background sync with Firestore without purging local session on network timeouts
          findUserInFirestore(u.loginUid)
            .then((validUser) => {
              if (validUser && validUser.loginUid) {
                setCurrentUser(validUser);
                try {
                  localStorage.setItem('network_join_pro_user', JSON.stringify(validUser));
                } catch {
                  // ignore
                }
                const freshInitials = getInitials(validUser.fullName);

                setUserStats((prev) => ({
                  ...prev,
                  userName: validUser.fullName || prev.userName,
                  userInitials: freshInitials,
                  loginUid: validUser.loginUid,
                  email: validUser.email,
                  mobile: validUser.mobile,
                  walletBalance: validUser.balance ?? prev.walletBalance,
                  unclaimedRoi: validUser.unclaimedRoi ?? prev.unclaimedRoi ?? 0,
                  totalEarned: validUser.totalEarned ?? prev.totalEarned ?? 0,
                  vipLevel: validUser.vipLevel ?? prev.vipLevel ?? 1,
                  totalCustomerInvested: validUser.totalCustomerInvested ?? prev.totalCustomerInvested ?? 0,
                }));
              }
            })
            .catch(() => {
              // Ignore network timeouts
            });
        }
      } else {
        // No localStorage user -> Check if this device ID is registered in Firestore
        const currentDeviceId = getOrCreateDeviceId();
        findUserByDeviceId(currentDeviceId)
          .then((deviceUser) => {
            if (deviceUser && deviceUser.loginUid) {
              setCurrentUser(deviceUser);
              try {
                localStorage.setItem('network_join_pro_user', JSON.stringify(deviceUser));
              } catch {
                // ignore
              }
              const freshInitials = getInitials(deviceUser.fullName);

              setUserStats((prev) => ({
                ...prev,
                userName: deviceUser.fullName || prev.userName,
                userInitials: freshInitials,
                loginUid: deviceUser.loginUid,
                email: deviceUser.email,
                mobile: deviceUser.mobile,
                walletBalance: deviceUser.balance ?? prev.walletBalance,
                unclaimedRoi: deviceUser.unclaimedRoi ?? prev.unclaimedRoi ?? 0,
                totalEarned: deviceUser.totalEarned ?? prev.totalEarned ?? 0,
                vipLevel: deviceUser.vipLevel ?? prev.vipLevel ?? 1,
                totalCustomerInvested: deviceUser.totalCustomerInvested ?? prev.totalCustomerInvested ?? 0,
              }));
            }
          })
          .catch(() => {
            // ignore
          });
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

  const handleViewCertificate = (inv: ActiveInvestment) => {
    setCertificateInvestment(inv);
    setCertificatePlan(null);
    setCertificateCustomer(null);
    setShowCertificateModal(true);
  };

  // 1. Real-time Subscription for Investment Plans
  useEffect(() => {
    try {
      const plansRef = collection(db, 'plans');
      const unsub = onSnapshot(
        plansRef,
        (snap) => {
          const loadedPlans: InvestmentPlan[] = [];
          snap.forEach((docSnap) => {
            const p = docSnap.data();
            if (!p) return;
            const amt = p.amount ?? p.price ?? 0;
            const days = p.durationDays ?? p.validityDays ?? 30;
            const roi = p.roiPercentage ?? p.dailyPercent ?? 0;
            const daily = p.dailyEarnings ?? p.dailyReturn ?? amt * (roi / 100);
            const total = p.totalReturn ?? amt + daily * days;
            const cat = p.category || 'Starter';

            loadedPlans.push({
              id: String(p.id || docSnap.id),
              name: p.name || 'Investment Plan',
              category: cat,
              durationDays: days,
              roiPercentage: roi,
              amount: amt,
              dailyEarnings: Math.round(daily * 100) / 100,
              totalReturn: Math.round(total * 100) / 100,
              iconType:
                p.iconType ||
                (cat === 'VIP'
                  ? 'crown'
                  : cat === 'Platinum'
                  ? 'gem'
                  : cat === 'Gold'
                  ? 'badge'
                  : cat === 'Silver'
                  ? 'shield'
                  : 'lightning'),
              featured: p.featured ?? true,
              totalInvestors: p.totalInvestors ?? 0,
              description: p.description || `${p.name} - ${days} Days high return plan.`,
            });
          });
          setPlans(loadedPlans);
        },
        (err) => {
          console.warn('Realtime plans listener warning:', err);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Error setting up plans real-time listener:', e);
    }
  }, []);

  // 1b. Real-time Subscription for VIP Levels from Firestore 'viplevel' collection
  useEffect(() => {
    try {
      const vipRef = collection(db, 'viplevel');
      const unsub = onSnapshot(
        vipRef,
        (snap) => {
          const loaded: VipLevelRecord[] = [];
          snap.forEach((docSnap) => {
            const data = docSnap.data() as VipLevelRecord;
            if (data && data.levelNumber) {
              loaded.push(data);
            }
          });
          if (loaded.length > 0) {
            setVipLevels(loaded.sort((a, b) => a.levelNumber - b.levelNumber));
          }
        },
        (err) => {
          console.warn('Realtime viplevel listener warning:', err);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Error setting up viplevel real-time listener:', e);
    }
  }, []);

  // 2. Real-time Subscription for Active Investments
  useEffect(() => {
    try {
      const invRef = collection(db, 'investments');
      const unsub = onSnapshot(
        invRef,
        (snap) => {
          const list: ActiveInvestment[] = [];
          snap.forEach((docSnap) => {
            const data = docSnap.data() as ActiveInvestment;
            if (data && data.id) {
              list.push(data);
            }
          });
          setActiveInvestments(list);
        },
        (err) => {
          console.warn('Realtime investments listener warning:', err);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Error setting up investments real-time listener:', e);
    }
  }, []);

  // 3. Real-time Subscription for Customers
  useEffect(() => {
    try {
      const custRef = collection(db, 'customers');
      const unsub = onSnapshot(
        custRef,
        (snap) => {
          const list: Customer[] = [];
          snap.forEach((docSnap) => {
            const data = docSnap.data() as Customer;
            if (data && data.id) {
              list.push(data);
            }
          });
          setCustomers(list);
        },
        (err) => {
          console.warn('Realtime customers listener warning:', err);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Error setting up customers real-time listener:', e);
    }
  }, []);

  // 4. Real-time Subscription for Current User Document
  useEffect(() => {
    if (!currentUser?.loginUid) return;
    try {
      const userDocRef = doc(db, 'users', currentUser.loginUid);
      const unsub = onSnapshot(
        userDocRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const u = docSnap.data() as UserAccountData;
            setCurrentUser(u);
            if (typeof window !== 'undefined') {
              localStorage.setItem('network_join_pro_user', JSON.stringify(u));
            }
            const initials = getInitials(u.fullName);

            setUserStats((prev) => ({
              ...prev,
              walletBalance: u.balance ?? 0,
              unclaimedRoi: u.unclaimedRoi ?? prev.unclaimedRoi ?? 0,
              totalEarned: u.totalEarned ?? prev.totalEarned ?? 0,
              vipLevel: u.vipLevel ?? prev.vipLevel ?? 1,
              totalCustomerInvested: u.totalCustomerInvested ?? prev.totalCustomerInvested ?? 0,
              userName: u.fullName || prev.userName,
              userInitials: initials,
              loginUid: u.loginUid,
              mobile: u.mobile,
              email: u.email,
              photoUrl: u.photoUrl || prev.photoUrl,
            }));
          }
        },
        (err) => {
          console.warn('Realtime user doc listener warning:', err);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Error setting up user doc real-time listener:', e);
    }
  }, [currentUser?.loginUid]);

  // 5. Real-time Subscription for Deposits & Withdrawals (Transactions Log)
  useEffect(() => {
    try {
      const depRef = collection(db, 'deposits');
      const wdRef = collection(db, 'withdrawals');

      let currentDeposits: Transaction[] = [];
      let currentWithdrawals: Transaction[] = [];

      const unsubDep = onSnapshot(depRef, (snap) => {
        const list: Transaction[] = [];
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          if (d) {
            list.push({
              id: String(d.id || docSnap.id),
              type: 'deposit',
              title: `Wallet Deposit (INR ${d.amount})`,
              amount: Number(d.amount) || 0,
              timestamp: d.dateTime || d.createdAt || 'Recent',
              dateTime: d.dateTime || d.createdAt || 'Recent',
              status: d.status === 'Approved' ? 'completed' : d.status === 'Rejected' ? 'failed' : 'processing',
              paymentMethod: d.utrNumber ? `UTR: ${d.utrNumber}` : 'UPI Fast Transfer',
              referenceId: String(d.id),
              transactionId: String(d.id),
              utrNumber: d.utrNumber || '',
              imageUrl: d.imageUrl || '',
              paidBy: d.userName || 'Account Holder',
              debitedFrom: 'UPI / Bank Transfer',
              creditedTo: 'Network Join Pro Wallet',
              receiverName: 'Network Join Pro',
            });
          }
        });
        currentDeposits = list;
        setTransactions([...currentDeposits, ...currentWithdrawals]);
      });

      const unsubWd = onSnapshot(wdRef, (snap) => {
        const list: Transaction[] = [];
        snap.forEach((docSnap) => {
          const w = docSnap.data();
          if (w) {
            list.push({
              id: String(w.id || docSnap.id),
              type: 'withdrawal',
              title: w.planName ? `Payout for ${w.planName}` : `Bank/UPI Withdrawal`,
              amount: Number(w.amount) || 0,
              timestamp: w.dateTime || w.createdAt || 'Recent',
              dateTime: w.dateTime || w.createdAt || 'Recent',
              status: w.status === 'Approved' ? 'completed' : w.status === 'Rejected' ? 'failed' : 'processing',
              paymentMethod: w.bankDetails || 'Bank Settlement (IMPS)',
              referenceId: String(w.id),
              transactionId: String(w.id),
              utrNumber: w.utrNumber || w.referenceId || String(w.id),
              paidBy: 'Network Join Pro',
              debitedFrom: 'Available Wallet Balance',
              creditedTo: w.bankName ? `${w.bankName} (•••${w.accountNumber?.slice(-4) || 'A/C'})` : (w.bankDetails || 'Bank Account'),
              receiverName: w.bankHolderName || w.customerName || w.userName || 'Customer',
              bankName: w.bankName,
              accountNumber: w.accountNumber,
            });
          }
        });
        currentWithdrawals = list;
        setTransactions([...currentDeposits, ...currentWithdrawals]);
      });

      return () => {
        unsubDep();
        unsubWd();
      };
    } catch (e) {
      console.warn('Error setting up transactions real-time listener:', e);
    }
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

  const handleLoginSuccess = (user: UserAccountData) => {
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('network_join_pro_user', JSON.stringify(user));
    }

    const initials = getInitials(user.fullName);

    setUserStats((prev) => ({
      ...prev,
      userName: user.fullName || prev.userName,
      userInitials: initials,
      loginUid: user.loginUid,
      email: user.email,
      mobile: user.mobile,
      walletBalance: user.balance ?? prev.walletBalance,
      photoUrl: user.photoUrl || prev.photoUrl,
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

    const planCost = plan.amount;
    const newBal = userStats.walletBalance - planCost;

    // Track total customer investments and calculate user VIP Level
    const prevCustInvested = currentUser?.totalCustomerInvested ?? userStats.totalCustomerInvested ?? 0;
    const newTotalCustomerInvested = prevCustInvested + planCost;

    // Determine VIP Level dynamically based on Firestore 'viplevel' settings
    let calculatedLevel = currentUser?.vipLevel ?? userStats.vipLevel ?? 1;
    if (vipLevels && vipLevels.length > 0) {
      const sortedLevels = [...vipLevels].sort((a, b) => a.levelNumber - b.levelNumber);
      for (const lvl of sortedLevels) {
        if (newTotalCustomerInvested >= (lvl.minAmount || 0)) {
          calculatedLevel = lvl.levelNumber;
        }
      }
    }

    // Determine Commission according to user VIP Level
    const activeLevelConfig = vipLevels.find((l) => l.levelNumber === calculatedLevel);
    let commissionEarned = 0;
    if (activeLevelConfig) {
      if (activeLevelConfig.dailyPercentage && activeLevelConfig.dailyPercentage > 0) {
        commissionEarned = (planCost * activeLevelConfig.dailyPercentage) / 100;
      } else if (activeLevelConfig.commissionAmount && activeLevelConfig.commissionAmount > 0) {
        commissionEarned = activeLevelConfig.commissionAmount;
      }
    } else {
      // Default baseline percentage
      commissionEarned = (planCost * 2.5) / 100;
    }
    commissionEarned = Math.round(commissionEarned * 100) / 100;

    const newUnclaimed = (userStats.unclaimedRoi || 0) + commissionEarned;
    const newTotalEarned = (userStats.totalEarned || 0) + commissionEarned;

    setUserStats((prev) => ({
      ...prev,
      walletBalance: newBal,
      totalJoins: prev.totalJoins + 1,
      activeInvestmentsCount: prev.activeInvestmentsCount + 1,
      unclaimedRoi: newUnclaimed,
      totalEarned: newTotalEarned,
      vipLevel: calculatedLevel,
      totalCustomerInvested: newTotalCustomerInvested,
    }));

    if (currentUser?.loginUid) {
      updateUserEarningsInFirestore(currentUser.loginUid, {
        balance: newBal,
        unclaimedRoi: newUnclaimed,
        totalEarned: newTotalEarned,
        vipLevel: calculatedLevel,
        totalCustomerInvested: newTotalCustomerInvested,
      });
    }

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
      customerAddress: linkedCustomer ? `${linkedCustomer.address || ''}, ${linkedCustomer.district || ''}, ${linkedCustomer.state || ''} - ${linkedCustomer.pincode || ''}` : '',
      bankName: linkedCustomer?.bankName || '',
      accountNumber: linkedCustomer?.accountNumber || '',
      ifscCode: linkedCustomer?.ifscCode || '',
      bankHolderName: linkedCustomer?.bankHolderName || '',
      loginUid: currentUser?.loginUid || 'GK',
      purchasedAt: new Date().toISOString(),
    };
    setActiveInvestments((prev) => [newInvestment, ...prev]);
    saveInvestmentToFirestore(newInvestment);

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

  const handleDepositSuccess = (
    amount: number,
    method: string,
    depositRecord?: DepositRecord
  ) => {
    // As per user specification:
    // When submit button is clicked, all data is saved with status 'Pending'.
    // The amount is NOT credited to the wallet balance immediately.
    // It will be automatically credited once Admin approves the deposit status in Admin Panel.

    const pendingTx: Transaction = {
      id: depositRecord?.id || `tx-${Date.now()}`,
      type: 'deposit',
      title: `Wallet Deposit (Pending Verification)`,
      amount,
      timestamp: 'Just now',
      status: 'processing',
      paymentMethod: depositRecord?.utrNumber ? `UTR: ${depositRecord.utrNumber}` : method,
      referenceId: depositRecord?.id || `DEP${Math.floor(100000 + Math.random() * 900000)}`,
    };
    setTransactions((prev) => [pendingTx, ...prev]);

    showToast(`Deposit request of ₹${amount.toLocaleString('en-IN')} submitted! Status: Pending Admin Approval.`);
  };

  const handleWithdrawSuccess = (
    amount: number,
    target: string,
    withdrawalRecord?: WithdrawalRecord
  ) => {
    if (amount > userStats.walletBalance) {
      showToast('Withdrawal amount exceeds balance');
      return;
    }

    const newBal = userStats.walletBalance - amount;

    setUserStats((prev) => ({
      ...prev,
      walletBalance: newBal,
      totalPayout: prev.totalPayout + amount,
    }));

    if (currentUser?.loginUid) {
      updateUserBalanceInFirestore(currentUser.loginUid, newBal);
    }

    const newTx: Transaction = {
      id: withdrawalRecord?.id || `tx-${Date.now()}`,
      type: 'withdrawal',
      title: `Instant Payout to ${target}`,
      amount,
      timestamp: 'Just now',
      status: 'completed',
      paymentMethod: target,
      referenceId: withdrawalRecord?.id || `WTH${Math.floor(100000 + Math.random() * 900000)}`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    showToast(`₹${amount.toLocaleString('en-IN')} debited & withdrawal requested!`);
  };

  const handleClaimDailyRoi = () => {
    if ((userStats.unclaimedRoi || 0) <= 0) return;

    const claimed = userStats.unclaimedRoi;
    const newBal = userStats.walletBalance + claimed;

    setUserStats((prev) => ({
      ...prev,
      walletBalance: newBal,
      unclaimedRoi: 0,
    }));

    if (currentUser?.loginUid) {
      updateUserEarningsInFirestore(currentUser.loginUid, {
        balance: newBal,
        unclaimedRoi: 0,
      });
    }

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'roi_credit',
      title: 'VIP Commission Payout Credited',
      amount: claimed,
      timestamp: 'Just now',
      status: 'completed',
      referenceId: `ROI${Math.floor(100000 + Math.random() * 900000)}`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    triggerConfetti();
    showToast(`₹${claimed.toFixed(2)} commission earnings successfully claimed into wallet!`);
  };

  const handleSaveCustomer = (newCustomer: Customer) => {
    setCustomers((prev) => [newCustomer, ...prev]);
    saveCustomerToFirestore(newCustomer);
    showToast(`Customer ${newCustomer.name} (${newCustomer.id}) registered successfully!`);
  };

  const handleOpenPlanDetail = (plan: InvestmentPlan) => {
    setSelectedPlanForDetail(plan);
    setActiveModal('plan-detail');
  };

  // Prevent SSR Hydration Mismatch
  if (!hasMounted) {
    return <div className="min-h-screen bg-[#F2F8FC]" />;
  }

  // 0. Onboarding Progress Splash Screen (3 seconds)
  if (showSplash) {
    return <OnboardingSplashScreen onComplete={() => setShowSplash(false)} />;
  }

  // 1. If admin route detected, render Admin Panel directly
  if (isAdminRoute) {
    return <AdminPanel />;
  }

  // 2. If user is NOT logged in, render Auth / Sign Up screen directly!
  if (!currentUser) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} initialMode={authInitialMode} />;
  }

  // 3. If user is blocked, render dedicated Account Blocked screen in real time!
  if (currentUser?.status === 'blocked') {
    return <AccountBlockedScreen user={currentUser} onLogout={handleLogout} />;
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
            customers={customers}
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
    <div className="min-h-screen bg-[#F2F8FC] text-[#172B75] flex flex-col font-sans select-none antialiased">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#002E6E] text-white text-xs sm:text-sm font-bold py-2.5 px-5 rounded-full border border-[#00B9F1]/40 shadow-xl backdrop-blur-md animate-bounce flex items-center gap-2">
          <span className="text-[#00B9F1]">✨</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {isDesktop ? (
        /* Desktop Layout */
        <div className="flex h-screen overflow-hidden bg-[#F2F8FC]">
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
            <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F2F8FC]">
              {renderScreenContent(false)}
            </main>
          </div>
        </div>
      ) : (
        /* Mobile Layout - Paytm Background */
        <div className="flex-1 flex flex-col max-w-md mx-auto w-full bg-[#F2F8FC] min-h-screen relative pb-20 overflow-x-hidden shadow-2xl">
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
        theme="navy"
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
        theme="navy"
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
        theme="navy"
      >
        <DepositContent
          currentBalance={userStats.walletBalance}
          userStats={userStats}
          currentUser={currentUser}
          onDepositSuccess={(amt, method, depRecord) => {
            handleDepositSuccess(amt, method, depRecord);
            setActiveModal('none');
          }}
          onClose={() => setActiveModal('none')}
        />
      </SlideFullScreenModal>

      <SlideFullScreenModal
        isOpen={activeModal === 'withdraw'}
        onClose={() => setActiveModal('none')}
        title="Withdrawal"
        theme="navy"
      >
        <WithdrawContent
          userStats={userStats}
          currentUser={currentUser}
          onWithdrawSuccess={(amt, target, wdRecord) => {
            handleWithdrawSuccess(amt, target, wdRecord);
          }}
          onClose={() => setActiveModal('none')}
        />
      </SlideFullScreenModal>

      <SlideFullScreenModal
        isOpen={activeModal === 'history'}
        onClose={() => setActiveModal('none')}
        title="Transaction History"
        theme="navy"
      >
        <HistoryContent
          transactions={transactions}
          userStats={userStats}
        />
      </SlideFullScreenModal>

      <SlideFullScreenModal
        isOpen={activeModal === 'tax-summary'}
        onClose={() => setActiveModal('none')}
        title="Tax & Earnings Summary"
        theme="navy"
      >
        <TaxSummaryContent userStats={userStats} activeInvestments={activeInvestments} />
      </SlideFullScreenModal>

      <SlideFullScreenModal
        isOpen={activeModal === 'notifications'}
        onClose={() => setActiveModal('none')}
        title="Notifications"
        theme="navy"
      >
        <NotificationsContent />
      </SlideFullScreenModal>

      <SlideFullScreenModal
        isOpen={activeModal === 'full-kyc'}
        onClose={() => setActiveModal('none')}
        title="Full KYC Verification"
        theme="navy"
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
        theme="navy"
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
        theme="navy"
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
        theme="navy"
      >
        <PurchaseHistoryContent
          activeInvestments={activeInvestments}
          currentUser={currentUser}
          onOpenPlans={() => {
            setActiveModal('none');
            setActiveTab('home');
          }}
          onRefreshInvestments={() => {}}
          onViewCertificate={handleViewCertificate}
        />
      </SlideFullScreenModal>


      {/* Official Government Investment Certificate Modal */}
      <InvestmentCertificateModal
        isOpen={showCertificateModal}
        onClose={() => {
          setShowCertificateModal(false);
          setCertificateInvestment(null);
        }}
        plan={certificatePlan}
        customer={certificateCustomer}
        investment={certificateInvestment}
      />
    </div>
  );
}

export default function InvestmentApp() {
  return (
    <SafeErrorBoundary>
      <InvestmentAppMain />
    </SafeErrorBoundary>
  );
}
