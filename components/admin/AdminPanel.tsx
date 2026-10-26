'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Layers,
  Sliders,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Lock,
  Unlock,
  Eye,
  Trash2,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Wallet,
  Building2,
  Phone,
  Mail,
  MapPin,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  X,
  Sparkles,
  ArrowLeft,
  Copy,
} from 'lucide-react';
import {
  getAllUsersFromFirestore,
  updateUserStatusInFirestore,
  updateUserBalanceInFirestore,
  deleteUserFromFirestore,
  getAllDepositsFromFirestore,
  updateDepositStatusInFirestore,
  getAllWithdrawalsFromFirestore,
  updateWithdrawalStatusInFirestore,
  getGatewaySettingsFromFirestore,
  saveGatewaySettingsToFirestore,
  getCustomPlansFromFirestore,
  saveCustomPlanToFirestore,
  deleteCustomPlanFromFirestore,
  getCustomSlidersFromFirestore,
  saveCustomSliderToFirestore,
  deleteCustomSliderFromFirestore,
  UserAccountData,
  DepositRecord,
  WithdrawalRecord,
  GatewaySettings,
} from '@/lib/firebase';
import { INITIAL_PLANS } from '@/data/initialData';

export default function AdminPanel() {
  // Sidebar tab: 'dashboard' | 'users' | 'plans' | 'sliders' | 'gateway' | 'withdrawals' | 'deposits'
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'users' | 'plans' | 'sliders' | 'gateway' | 'withdrawals' | 'deposits'
  >('dashboard');

  // Loading and State
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserAccountData[]>([]);
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [gateway, setGateway] = useState<GatewaySettings>({
    upiId: 'networkjoinpro@upi',
    minDeposit: 100,
    minWithdrawal: 200,
  });
  const [plans, setPlans] = useState<any[]>(INITIAL_PLANS);
  const [sliders, setSliders] = useState<any[]>([]);

  // Search Query for Users tab
  const [userSearch, setUserSearch] = useState('');

  // Selected User Modal / Detail Screen View
  const [selectedUser, setSelectedUser] = useState<UserAccountData | null>(null);
  const [editBalanceInput, setEditBalanceInput] = useState<string>('');
  const [balanceMsg, setBalanceMsg] = useState<string>('');

  // Image Modal Preview for Payment Screenshots
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // New Plan Form State
  const [newPlan, setNewPlan] = useState({
    name: '',
    category: 'VIP',
    price: '',
    dailyReturn: '',
    validityDays: '30',
  });
  const [planMsg, setPlanMsg] = useState('');

  // New Slider Form State
  const [newSlider, setNewSlider] = useState({
    title: '',
    subtext: '',
    badgeLeft: 'LIMITED OFFER',
    badgeRight: '100% SECURE',
    btnText: 'Invest Now',
  });
  const [sliderMsg, setSliderMsg] = useState('');

  // Gateway Form State
  const [gatewayForm, setGatewayForm] = useState({
    upiId: 'networkjoinpro@upi',
    minDeposit: '100',
    minWithdrawal: '200',
  });
  const [gatewayMsg, setGatewayMsg] = useState('');

  // Load all Firebase data
  const refreshData = async () => {
    setLoading(true);
    try {
      const [u, d, w, g, p, s] = await Promise.all([
        getAllUsersFromFirestore(),
        getAllDepositsFromFirestore(),
        getAllWithdrawalsFromFirestore(),
        getGatewaySettingsFromFirestore(),
        getCustomPlansFromFirestore(),
        getCustomSlidersFromFirestore(),
      ]);

      setUsers(u);
      setDeposits(d);
      setWithdrawals(w);
      setGateway(g);
      setGatewayForm({
        upiId: g.upiId || 'networkjoinpro@upi',
        minDeposit: String(g.minDeposit || 100),
        minWithdrawal: String(g.minWithdrawal || 200),
      });

      if (p && p.length > 0) {
        setPlans(p);
      } else {
        setPlans(INITIAL_PLANS);
      }

      if (s && s.length > 0) {
        setSliders(s);
      }
    } catch (err) {
      console.warn('Error loading admin data:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Filtered Users
  const filteredUsers = users.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.mobile?.includes(userSearch) ||
      u.loginUid?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Calculated Dashboard Metrics
  const totalUsersCount = users.length;
  const totalDepositAmount = deposits
    .filter((d) => d.status === 'Approved')
    .reduce((sum, d) => sum + (d.amount || 0), 0);
  const totalWithdrawalAmount = withdrawals
    .filter((w) => w.status === 'Approved')
    .reduce((sum, w) => sum + (w.amount || 0), 0);
  const pendingDepositsCount = deposits.filter((d) => d.status === 'Pending').length;
  const pendingWithdrawalsCount = withdrawals.filter((w) => w.status === 'Pending').length;

  const todayUsers = React.useMemo(() => {
    const todayStr = new Date().toLocaleDateString('en-IN');
    return users.filter((u) => {
      if (!u.createdAt) return false;
      return new Date(u.createdAt).toLocaleDateString('en-IN') === todayStr;
    });
  }, [users]);

  // Handle Block / Unblock User
  const handleToggleBlockUser = async (u: UserAccountData) => {
    const newStatus = u.status === 'blocked' ? 'active' : 'blocked';
    setUsers((prev) =>
      prev.map((item) => (item.loginUid === u.loginUid ? { ...item, status: newStatus } : item))
    );
    if (selectedUser?.loginUid === u.loginUid) {
      setSelectedUser({ ...selectedUser, status: newStatus });
    }
    await updateUserStatusInFirestore(u.loginUid, newStatus);
  };

  // Handle Delete User
  const handleDeleteUser = async (loginUid: string) => {
    if (confirm(`Are you sure you want to delete user ${loginUid}?`)) {
      setUsers((prev) => prev.filter((item) => item.loginUid !== loginUid));
      if (selectedUser?.loginUid === loginUid) {
        setSelectedUser(null);
      }
      await deleteUserFromFirestore(loginUid);
    }
  };

  // Handle Update Balance
  const handleSaveUserBalance = async () => {
    if (!selectedUser) return;
    const newBal = parseFloat(editBalanceInput);
    if (isNaN(newBal)) return;

    setUsers((prev) =>
      prev.map((item) =>
        item.loginUid === selectedUser.loginUid ? { ...item, balance: newBal } : item
      )
    );
    setSelectedUser({ ...selectedUser, balance: newBal });
    setBalanceMsg('बैलेंस सफलतापूर्वक अपडेट हो गया!');

    await updateUserBalanceInFirestore(selectedUser.loginUid, newBal);
    setTimeout(() => setBalanceMsg(''), 2500);
  };

  // Handle Deposit Status Change
  const handleDepositAction = async (dep: DepositRecord, newStatus: 'Approved' | 'Rejected') => {
    setDeposits((prev) =>
      prev.map((item) => (item.id === dep.id ? { ...item, status: newStatus } : item))
    );
    await updateDepositStatusInFirestore(dep.id, newStatus, dep);
    refreshData();
  };

  // Handle Withdrawal Status Change
  const handleWithdrawalAction = async (wd: WithdrawalRecord, newStatus: 'Approved' | 'Rejected') => {
    setWithdrawals((prev) =>
      prev.map((item) => (item.id === wd.id ? { ...item, status: newStatus } : item))
    );
    await updateWithdrawalStatusInFirestore(wd.id, newStatus);
    refreshData();
  };

  // Handle Add New Plan
  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.name || !newPlan.price || !newPlan.dailyReturn) return;

    const priceNum = parseFloat(newPlan.price);
    const returnNum = parseFloat(newPlan.dailyReturn);
    const daysNum = parseInt(newPlan.validityDays) || 30;

    const planObj = {
      id: `PLAN_${Date.now()}`,
      name: newPlan.name,
      category: newPlan.category,
      price: priceNum,
      dailyReturn: returnNum,
      validityDays: daysNum,
      totalReturn: returnNum * daysNum,
      colorGradient: 'from-amber-600 via-orange-600 to-amber-700',
      tag: 'NEW EXCLUSIVE',
    };

    setPlans((prev) => [planObj, ...prev]);
    await saveCustomPlanToFirestore(planObj);
    setPlanMsg('प्लांस सफलतापूर्वक फायरबेस में सेव हो गया!');
    setNewPlan({ name: '', category: 'VIP', price: '', dailyReturn: '', validityDays: '30' });
    setTimeout(() => setPlanMsg(''), 3000);
  };

  // Handle Delete Plan
  const handleDeletePlan = async (planId: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== planId));
    await deleteCustomPlanFromFirestore(planId);
  };

  // Handle Add New Slider
  const handleCreateSlider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlider.title) return;

    const sliderObj = {
      id: Date.now(),
      title: newSlider.title,
      subtext: newSlider.subtext,
      badgeLeft: newSlider.badgeLeft,
      badgeRight: newSlider.badgeRight,
      btnText: newSlider.btnText,
      bgGradient: 'from-amber-800 via-[#5c3516] to-amber-900',
    };

    setSliders((prev) => [sliderObj, ...prev]);
    await saveCustomSliderToFirestore(sliderObj);
    setSliderMsg('स्लाइडर बैनर सफलतापूर्वक सेव हो गया!');
    setNewSlider({
      title: '',
      subtext: '',
      badgeLeft: 'LIMITED OFFER',
      badgeRight: '100% SECURE',
      btnText: 'Invest Now',
    });
    setTimeout(() => setSliderMsg(''), 3000);
  };

  // Handle Save Gateway Settings
  const handleSaveGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings: GatewaySettings = {
      upiId: gatewayForm.upiId.trim(),
      minDeposit: parseFloat(gatewayForm.minDeposit) || 100,
      minWithdrawal: parseFloat(gatewayForm.minWithdrawal) || 200,
    };
    setGateway(updatedSettings);
    await saveGatewaySettingsToFirestore(updatedSettings);
    setGatewayMsg('पेमेंट गेटवे सेटिंग्स सफलतापूर्वक अपडेट हो गईं!');
    setTimeout(() => setGatewayMsg(''), 3000);
  };

  return (
    <div className="min-h-screen bg-[#edf1f5] text-slate-800 font-sans flex flex-col antialiased selection:bg-cyan-500 selection:text-white">
      {/* =========================================================================
          1. TOP CYAN HEADER BAR (Matching FAB ADMIN Design)
          ========================================================================= */}
      <header className="bg-[#009aaa] text-white px-4 py-2.5 flex items-center justify-between shadow-md z-30 shrink-0">
        {/* Left: Logo Brand & Dropdown Control */}
        <div className="flex items-center gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center font-black text-white text-base shadow-2xs">
              ⚡
            </div>
            <span className="font-extrabold text-base tracking-tight font-sans text-white">
              NETWORKJOIN <span className="text-cyan-200 font-normal text-xs uppercase tracking-wider">ADMIN</span>
            </span>
          </div>

          {/* Sidebar Toggle & Dropdown Selector */}
          <div className="hidden sm:flex items-center gap-2 border-l border-cyan-400/40 pl-4">
            <button
              onClick={refreshData}
              title="Refresh Data"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="relative">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as any)}
                className="bg-white/15 hover:bg-white/25 text-white border border-white/25 rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none cursor-pointer appearance-none pr-7 transition-all"
              >
                <option value="dashboard" className="text-slate-900">Dashboard ▾</option>
                <option value="users" className="text-slate-900">Users Directory ▾</option>
                <option value="deposits" className="text-slate-900">Add Money (Deposits) ▾</option>
                <option value="withdrawals" className="text-slate-900">Withdrawals ▾</option>
                <option value="plans" className="text-slate-900">Investment Plans ▾</option>
                <option value="sliders" className="text-slate-900">Home Sliders ▾</option>
                <option value="gateway" className="text-slate-900">Payment Gateway ▾</option>
              </select>
              <ChevronRight className="w-3.5 h-3.5 text-cyan-100 absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Right: Search, Notifications, Badges & Admin Avatar */}
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative hidden md:block w-48">
            <Search className="w-3.5 h-3.5 text-cyan-200 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search user, mobile..."
              className="w-full pl-8 pr-3 py-1 bg-white/15 border border-white/25 rounded-full text-xs text-white placeholder-cyan-200/80 focus:outline-none focus:bg-white/25 transition-all"
            />
          </div>

          {/* Live Sync Status Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-300/40 text-emerald-100 text-[10px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Firebase Live 🟢</span>
          </div>

          {/* Quick Icons */}
          <button
            onClick={() => setActiveTab('deposits')}
            className="relative p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            title="Pending Add Money Requests"
          >
            <ArrowDownLeft className="w-4 h-4" />
            {pendingDepositsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {pendingDepositsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('withdrawals')}
            className="relative p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
            title="Pending Withdrawal Requests"
          >
            <ArrowUpRight className="w-4 h-4" />
            {pendingWithdrawalsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {pendingWithdrawalsCount}
              </span>
            )}
          </button>

          {/* Admin User Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-cyan-400/40">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-cyan-200 text-cyan-900 font-extrabold flex items-center justify-center text-xs shadow-xs border border-white/40">
                AD
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#009aaa]" />
            </div>
            <span className="hidden sm:inline text-xs font-bold text-white tracking-tight">
              Admin Superuser
            </span>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. MAIN DESKTOP BODY: SIDEBAR + CONTENT VIEWPORT
          ========================================================================= */}
      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        {/* -----------------------------------------------------------------------
            LEFT DARK SIDEBAR (Matching FAB ADMIN Design)
            ----------------------------------------------------------------------- */}
        <aside className="w-60 bg-[#232b38] text-slate-300 flex flex-col justify-between shrink-0 shadow-lg border-r border-slate-800 overflow-y-auto">
          <div>
            {/* Top User Profile Card */}
            <div className="p-3 bg-[#1d2430] border-b border-slate-700/60 flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-cyan-400 text-white font-extrabold flex items-center justify-center text-sm shadow-md border border-cyan-300/30">
                  AD
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#1d2430]" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-black text-white truncate">Super Admin</h3>
                <span className="text-[10px] text-emerald-400 font-semibold block">Online • Full Control</span>
              </div>
            </div>

            {/* Sidebar Categorized Menu */}
            <div className="py-3 px-2 space-y-4">
              {/* Category 1: PERSONAL */}
              <div>
                <span className="px-3 text-[10px] font-black text-slate-400 tracking-wider uppercase block mb-1.5">
                  PERSONAL
                </span>
                <nav className="space-y-0.5">
                  {[
                    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                    { id: 'users', label: 'Users Directory', icon: Users, badge: users.length },
                    { id: 'deposits', label: 'Add Money (Deposits)', icon: ArrowDownLeft, badge: pendingDepositsCount },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#00a8cc] text-white shadow-md font-extrabold'
                            : 'text-slate-300 hover:bg-[#2c3747] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.badge !== undefined && item.badge > 0 && (
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                                isActive ? 'bg-white text-[#00a8cc]' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-white translate-x-0.5' : 'text-slate-500'}`} />
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Category 2: FINANCE & PAYOUTS */}
              <div>
                <span className="px-3 text-[10px] font-black text-slate-400 tracking-wider uppercase block mb-1.5">
                  FINANCE & PAYOUTS
                </span>
                <nav className="space-y-0.5">
                  {[
                    { id: 'withdrawals', label: 'Withdrawal Payouts', icon: ArrowUpRight, badge: pendingWithdrawalsCount },
                    { id: 'plans', label: 'Yield Plans', icon: Layers },
                    { id: 'gateway', label: 'Payment Gateway', icon: CreditCard },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#00a8cc] text-white shadow-md font-extrabold'
                            : 'text-slate-300 hover:bg-[#2c3747] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.badge !== undefined && item.badge > 0 && (
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                                isActive ? 'bg-white text-[#00a8cc]' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-white translate-x-0.5' : 'text-slate-500'}`} />
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Category 3: CMS & APP */}
              <div>
                <span className="px-3 text-[10px] font-black text-slate-400 tracking-wider uppercase block mb-1.5">
                  CMS & APP
                </span>
                <nav className="space-y-0.5">
                  {[
                    { id: 'sliders', label: 'Home Sliders', icon: Sliders },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-[#00a8cc] text-white shadow-md font-extrabold'
                            : 'text-slate-300 hover:bg-[#2c3747] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-white translate-x-0.5' : 'text-slate-500'}`} />
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Bottom Exit to User App Button */}
          <div className="p-3 border-t border-slate-700/60 bg-[#1d2430]">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.hash = '';
                  window.location.href = window.location.pathname.replace(/\/admin\/?$/, '/');
                }
              }}
              className="flex items-center justify-center gap-2 w-full py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-black rounded-lg transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-300" />
              <span>User Application</span>
            </button>
          </div>
        </aside>

        {/* -----------------------------------------------------------------------
            RIGHT MAIN VIEWPORT (With Sub-Header Breadcrumbs & FAB ADMIN Card Layout)
            ----------------------------------------------------------------------- */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
          {/* Sub-Header / Breadcrumb Bar */}
          <div className="bg-white rounded-xl p-4 shadow-2xs border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight capitalize flex items-center gap-2">
                <span>
                  {activeTab === 'dashboard' && 'Dashboard'}
                  {activeTab === 'users' && 'Users Directory'}
                  {activeTab === 'deposits' && 'Add Money / Deposit Requests'}
                  {activeTab === 'withdrawals' && 'Withdrawal Requests'}
                  {activeTab === 'plans' && 'Yield Plans Manager'}
                  {activeTab === 'sliders' && 'Home Screen Sliders'}
                  {activeTab === 'gateway' && 'Payment Gateway Settings'}
                </span>
                <span className="text-xs font-normal text-slate-400">Control panel</span>
              </h2>
            </div>

            {/* Breadcrumb Path */}
            <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 self-start sm:self-auto">
              <span>🏠 Home</span>
              <span>›</span>
              <span className="text-cyan-600 font-bold capitalize">{activeTab}</span>
            </div>
          </div>

          {/* =========================================================================
              TAB CONTENT 1: DASHBOARD OVERVIEW
              ========================================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-5">
              {/* 4 COLORFUL VIBRANT STAT CARDS (Matching FAB ADMIN Design) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: TOTAL USERS (Purple Icon) */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-[#8e44ad] text-white flex items-center justify-center font-black text-xl shrink-0 shadow-xs">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-2xl font-black text-slate-800 font-mono block leading-none">
                      {totalUsersCount}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mt-1">
                      TOTAL USERS
                    </span>
                  </div>
                </div>

                {/* Card 2: TOTAL ADD MONEY (Amber Icon) */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-[#f39c12] text-white flex items-center justify-center font-black text-xl shrink-0 shadow-xs">
                    <ArrowDownLeft className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-2xl font-black text-slate-800 font-mono block leading-none">
                      ₹{totalDepositAmount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mt-1">
                      TOTAL ADD MONEY
                    </span>
                  </div>
                </div>

                {/* Card 3: TOTAL WITHDRAWALS (Blue Icon) */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-[#2980b9] text-white flex items-center justify-center font-black text-xl shrink-0 shadow-xs">
                    <ArrowUpRight className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-2xl font-black text-slate-800 font-mono block leading-none">
                      ₹{totalWithdrawalAmount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mt-1">
                      TOTAL WITHDRAWALS
                    </span>
                  </div>
                </div>

                {/* Card 4: PENDING APPROVALS (Teal/Cyan Icon) */}
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-[#16a085] text-white flex items-center justify-center font-black text-xl shrink-0 shadow-xs">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-2xl font-black text-[#16a085] font-mono block leading-none">
                      {pendingDepositsCount + pendingWithdrawalsCount}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mt-1">
                      PENDING REQUESTS
                    </span>
                  </div>
                </div>
              </div>

              {/* DUAL COLUMN WIDGET GRID (Matching FAB ADMIN Layout) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left Column: Quick Vitals & Financial Activity Chart (4 Cols) */}
                <div className="lg:col-span-4 space-y-5">
                  {/* Quick System Vitals Box */}
                  <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <h3 className="text-sm font-extrabold text-slate-800">System Vitals</h3>
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        100% Operational
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Today Registered</span>
                        <span className="text-lg font-black text-slate-800 font-mono">{todayUsers.length}</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Active Yield Plans</span>
                        <span className="text-lg font-black text-slate-800 font-mono">{plans.length}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-[#f0fbfd] rounded-xl border border-cyan-200 text-xs text-cyan-900 font-semibold space-y-1">
                      <div className="flex items-center justify-between">
                        <span>Gateway Status:</span>
                        <span className="font-extrabold text-[#009aaa]">Active ({gateway.upiId})</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-cyan-800">
                        <span>Min Deposit / Withdrawal:</span>
                        <span>₹{gateway.minDeposit} / ₹{gateway.minWithdrawal}</span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Activity Chart Simulation */}
                  <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <h3 className="text-sm font-extrabold text-slate-800">Monthly Volume</h3>
                      <div className="flex items-center gap-2 text-[10px] font-bold">
                        <span className="flex items-center gap-1 text-emerald-600">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Deposit
                        </span>
                        <span className="flex items-center gap-1 text-rose-600">
                          <span className="w-2 h-2 rounded-full bg-rose-500" /> Payout
                        </span>
                      </div>
                    </div>

                    {/* Bar Chart Bars */}
                    <div className="h-36 flex items-end justify-between gap-2 pt-2 px-1">
                      {[
                        { month: 'Jun', dep: 60, wth: 35 },
                        { month: 'Jul', dep: 80, wth: 50 },
                        { month: 'Aug', dep: 70, wth: 40 },
                        { month: 'Sep', dep: 90, wth: 65 },
                        { month: 'Oct', dep: 100, wth: 75 },
                      ].map((bar, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                          <div className="w-full flex items-end justify-center gap-1 h-28">
                            <div
                              style={{ height: `${bar.dep}%` }}
                              className="w-3.5 bg-[#00a8cc] rounded-t-sm transition-all"
                              title={`Deposit: ${bar.dep}%`}
                            />
                            <div
                              style={{ height: `${bar.wth}%` }}
                              className="w-3.5 bg-amber-500 rounded-t-sm transition-all"
                              title={`Payout: ${bar.wth}%`}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400">{bar.month}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Registered Users Quick Table & Real-Time Directory (8 Cols) */}
                <div className="lg:col-span-8 space-y-5">
                  <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
                    {/* Table Header Row */}
                    <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-black text-slate-800">
                          Recent Registered Users ({users.length})
                        </h3>
                        <p className="text-xs text-slate-400">Live Firebase synced accounts directory</p>
                      </div>

                      <button
                        onClick={() => setActiveTab('users')}
                        className="text-xs text-[#009aaa] hover:text-[#007b8e] font-extrabold flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                      >
                        <span>View All Users Directory</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Table Data Content */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#f8fafc] text-slate-500 font-extrabold uppercase border-b border-slate-200/80">
                          <tr>
                            <th className="p-3">User Details</th>
                            <th className="p-3">Mobile / Email</th>
                            <th className="p-3">Wallet Balance</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                          {users.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-slate-400 font-semibold">
                                No registered users found in Firestore database.
                              </td>
                            </tr>
                          ) : (
                            users.slice(0, 5).map((u, i) => (
                              <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                                <td className="p-3">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-800 font-bold flex items-center justify-center text-xs shrink-0">
                                      {u.fullName ? u.fullName.substring(0, 2).toUpperCase() : 'GK'}
                                    </div>
                                    <div>
                                      <span className="font-extrabold text-slate-900 block">{u.fullName || 'User'}</span>
                                      <span className="text-[10px] text-slate-400 font-mono">UID: {u.loginUid}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <span className="font-mono block text-slate-800">+91 {u.mobile}</span>
                                  <span className="text-[10px] text-slate-400 block truncate max-w-[120px]">{u.email}</span>
                                </td>
                                <td className="p-3 font-mono font-black text-emerald-700 text-sm">
                                  ₹{(u.balance ?? 0).toLocaleString('en-IN')}
                                </td>
                                <td className="p-3">
                                  {u.status === 'blocked' ? (
                                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-extrabold text-[10px] border border-rose-200">
                                      Blocked
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] border border-emerald-200">
                                      Active
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 text-right">
                                  <button
                                    onClick={() => {
                                      setSelectedUser(u);
                                      setEditBalanceInput(String(u.balance ?? 0));
                                    }}
                                    className="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-[#008198] font-bold text-xs rounded-lg transition-colors border border-cyan-200 cursor-pointer"
                                  >
                                    View Details
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            2. USERS TAB
            ========================================================================= */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="यूज़र का नाम, मोबाइल नंबर या Login UID सर्च करें..."
                className="w-full text-xs font-bold text-slate-900 bg-transparent border-none focus:outline-none placeholder:text-slate-400"
              />
              {userSearch && (
                <button
                  onClick={() => setUserSearch('')}
                  className="text-xs text-slate-400 hover:text-slate-600 font-bold px-2"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Users List Table */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900">
                  ऑल यूज़र लिस्ट (User Directory - Total: {filteredUsers.length})
                </h3>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  कोई यूज़र नहीं मिला (No users match search)
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
                        <th className="py-2.5 px-3">प्रोफाइल पिक्चर & नाम</th>
                        <th className="py-2.5 px-3">UID</th>
                        <th className="py-2.5 px-3">मोबाइल नंबर</th>
                        <th className="py-2.5 px-3">ईमेल</th>
                        <th className="py-2.5 px-3">बैलेंस</th>
                        <th className="py-2.5 px-3">स्टेटस</th>
                        <th className="py-2.5 px-3 text-right">एक्शन (Action)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredUsers.map((u) => (
                        <tr key={u.loginUid} className="hover:bg-slate-50 transition-all">
                          <td className="py-3 px-3 flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200">
                              {u.fullName?.[0] || 'U'}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block leading-tight">
                                {u.fullName}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : 'Recently'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-700">
                            {u.loginUid}
                          </td>
                          <td className="py-3 px-3 font-mono">{u.mobile}</td>
                          <td className="py-3 px-3 text-slate-600 max-w-[150px] truncate">
                            {u.email}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                            ₹{(u.balance || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                u.status === 'blocked'
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {u.status === 'blocked' ? 'Blocked 🔴' : 'Active 🟢'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Block / Unblock Button */}
                              <button
                                onClick={() => handleToggleBlockUser(u)}
                                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                                  u.status === 'blocked'
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                    : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                }`}
                              >
                                {u.status === 'blocked' ? 'अनब्लॉक (Unblock)' : 'ब्लॉक (Block)'}
                              </button>

                              {/* View Button */}
                              <button
                                onClick={() => {
                                  setSelectedUser(u);
                                  setEditBalanceInput(String(u.balance || 0));
                                }}
                                className="px-2.5 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-lg hover:bg-slate-800 cursor-pointer"
                              >
                                व्यू (View)
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => handleDeleteUser(u.loginUid)}
                                className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg cursor-pointer"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* USER DETAILS MODAL / SCREEN */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-5 space-y-4 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto">
              {/* Close Button */}
              <button
                onClick={() => setSelectedUser(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-black text-slate-900">यूज़र डिटेल्स (User Details Profile)</h3>

              {/* TOP BOX: USER DETAILS BOX (White clean container with border) */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full bg-slate-900 text-amber-400 text-2xl font-black flex items-center justify-center shrink-0 border-2 border-slate-300">
                    {selectedUser.fullName?.[0] || 'U'}
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h4 className="text-base font-black text-slate-900">{selectedUser.fullName}</h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          selectedUser.status === 'blocked'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {selectedUser.status === 'blocked' ? 'Blocked' : 'Active'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono font-bold mt-0.5">
                      UID: {selectedUser.loginUid}
                    </p>
                  </div>

                  {/* Edit Wallet Balance Box */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-center sm:text-right w-full sm:w-auto">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">
                      Wallet Balance
                    </span>
                    <div className="text-lg font-black text-emerald-700 font-mono">
                      ₹{(selectedUser.balance || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                {/* Edit Balance Action Bar */}
                <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 shrink-0">
                    बैलेंस एडिट करें (Edit Balance):
                  </span>
                  <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                    <input
                      type="number"
                      value={editBalanceInput}
                      onChange={(e) => setEditBalanceInput(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 w-full focus:outline-none focus:border-slate-900"
                    />
                    <button
                      onClick={handleSaveUserBalance}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-2xs shrink-0 cursor-pointer"
                    >
                      सेव करें (Save)
                    </button>
                  </div>
                </div>
                {balanceMsg && (
                  <p className="text-xs font-bold text-emerald-600 text-center">{balanceMsg}</p>
                )}

                {/* Personal & Address Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>मोबाइल: <strong>{selectedUser.mobile}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">ईमेल: <strong>{selectedUser.email}</strong></span>
                  </div>
                  <div className="flex items-start gap-1.5 sm:col-span-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <span>
                      एड्रेस: <strong>
                        {selectedUser.addressDetails
                          ? `${selectedUser.addressDetails.street}, ${selectedUser.addressDetails.city}, ${selectedUser.addressDetails.state} - ${selectedUser.addressDetails.pincode}`
                          : 'Not Provided'}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* LOWER GRID: STATS ACCOUNT BOXES */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {/* Total Customer Account */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    टोटल कस्टमर (Total Customers)
                  </span>
                  <span className="text-lg font-black text-slate-900 font-mono">12</span>
                </div>

                {/* Total Purchased Amount */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    टोटल परचेज प्लान (Purchased Plans)
                  </span>
                  <span className="text-lg font-black text-blue-700 font-mono">₹15,000</span>
                </div>

                {/* Total Withdrawals */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    टोटल विड्रोल (Total Withdrawals)
                  </span>
                  <span className="text-lg font-black text-amber-700 font-mono">
                    ₹{withdrawals
                      .filter((w) => w.loginUid === selectedUser.loginUid && w.status === 'Approved')
                      .reduce((sum, w) => sum + w.amount, 0)
                      .toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Total Add Money */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">
                    टोटल एड मनी (Total Add Money)
                  </span>
                  <span className="text-lg font-black text-emerald-700 font-mono">
                    ₹{deposits
                      .filter((d) => d.loginUid === selectedUser.loginUid && d.status === 'Approved')
                      .reduce((sum, d) => sum + d.amount, 0)
                      .toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Toggle Block Button inside modal */}
              <div className="flex justify-end gap-2 pt-3">
                <button
                  onClick={() => handleToggleBlockUser(selectedUser)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    selectedUser.status === 'blocked'
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-amber-600 text-white hover:bg-amber-700'
                  }`}
                >
                  {selectedUser.status === 'blocked' ? 'अनब्लॉक यूज़र (Unblock User)' : 'ब्लॉक यूज़र (Block User)'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            3. ADD MONEY / DEPOSITS TAB
            ========================================================================= */}
        {activeTab === 'deposits' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <h3 className="text-sm font-black text-slate-900 mb-3 pb-2 border-b border-slate-100">
                एड मनी / डिपॉजिट रिक्वेस्ट्स (Add Money Requests - Total: {deposits.length})
              </h3>

              {deposits.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  कोई एड मनी डिपॉजिट अनुरोध प्राप्त नहीं हुआ (No deposit requests found)
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
                        <th className="py-2.5 px-3">यूज़र (User)</th>
                        <th className="py-2.5 px-3">अमाउंट (Amount)</th>
                        <th className="py-2.5 px-3">UTR नंबर (Txn ID)</th>
                        <th className="py-2.5 px-3">स्क्रीनशॉट (Image)</th>
                        <th className="py-2.5 px-3">तारीख व समय (Date Time)</th>
                        <th className="py-2.5 px-3">स्टेटस (Status)</th>
                        <th className="py-2.5 px-3 text-right">एक्शन (Action)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {deposits.map((dep) => (
                        <tr key={dep.id} className="hover:bg-slate-50 transition-all">
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-900 block">{dep.userName || dep.loginUid}</span>
                            <span className="text-[10px] text-slate-400">{dep.mobile}</span>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-emerald-700 text-sm">
                            ₹{(dep.amount || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-800">
                            {dep.utrNumber}
                          </td>
                          <td className="py-3 px-3">
                            {dep.imageUrl ? (
                              <button
                                onClick={() => setPreviewImage(dep.imageUrl)}
                                className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>व्यू इमेज</span>
                              </button>
                            ) : (
                              <span className="text-slate-400 text-[10px]">No Image</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-[11px] text-slate-600">{dep.dateTime}</td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                dep.status === 'Approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : dep.status === 'Rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {dep.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            {dep.status === 'Pending' ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleDepositAction(dep, 'Approved')}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg cursor-pointer"
                                >
                                  एप्रूव (Approve)
                                </button>
                                <button
                                  onClick={() => handleDepositAction(dep, 'Rejected')}
                                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg cursor-pointer"
                                >
                                  रिजेक्ट (Reject)
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Completed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* IMAGE PREVIEW MODAL */}
        {previewImage && (
          <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-4 max-w-lg w-full relative space-y-3">
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-3 right-3 text-slate-500 hover:text-slate-900 p-1 bg-slate-100 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <h4 className="text-sm font-bold text-slate-900">Payment Screenshot Preview</h4>
              <img
                src={previewImage}
                alt="Payment Proof"
                className="w-full max-h-[70vh] object-contain rounded-xl border border-slate-200"
              />
            </div>
          </div>
        )}

        {/* =========================================================================
            4. WITHDRAWALS TAB
            ========================================================================= */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <h3 className="text-sm font-black text-slate-900 mb-3 pb-2 border-b border-slate-100">
                विड्रोल रिक्वेस्ट्स (Withdrawal Requests - Total: {withdrawals.length})
              </h3>

              {withdrawals.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  कोई विड्रोल अनुरोध नहीं मिला (No withdrawal requests found)
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
                        <th className="py-2.5 px-3">यूज़र (User)</th>
                        <th className="py-2.5 px-3">अमाउंट (Amount)</th>
                        <th className="py-2.5 px-3">बैंक/UPI डिटेल्स</th>
                        <th className="py-2.5 px-3">तारीख व समय</th>
                        <th className="py-2.5 px-3">स्टेटस</th>
                        <th className="py-2.5 px-3 text-right">एक्शन</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {withdrawals.map((wd) => (
                        <tr key={wd.id} className="hover:bg-slate-50 transition-all">
                          <td className="py-3 px-3">
                            <span className="font-bold text-slate-900 block">{wd.userName || wd.loginUid}</span>
                            <span className="text-[10px] text-slate-400">{wd.mobile}</span>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-amber-700 text-sm">
                            ₹{(wd.amount || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-800">{wd.bankDetails}</td>
                          <td className="py-3 px-3 text-[11px] text-slate-600">{wd.dateTime}</td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                wd.status === 'Approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : wd.status === 'Rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {wd.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            {wd.status === 'Pending' ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleWithdrawalAction(wd, 'Approved')}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg cursor-pointer"
                                >
                                  एप्रूव (Approve)
                                </button>
                                <button
                                  onClick={() => handleWithdrawalAction(wd, 'Rejected')}
                                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg cursor-pointer"
                                >
                                  रिजेक्ट (Reject)
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Completed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            5. INVESTMENT PLANS TAB
            ========================================================================= */}
        {activeTab === 'plans' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Create Plan Form */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">
                नया प्लान जोड़ें (Add New Investment Plan)
              </h3>
              <form onSubmit={handleCreatePlan} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">प्लान का नाम (Plan Name)</label>
                  <input
                    type="text"
                    required
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                    placeholder="उदा: Platinum High ROI Plan"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">कैटेगरी (Category)</label>
                  <select
                    value={newPlan.category}
                    onChange={(e) => setNewPlan({ ...newPlan, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:outline-none focus:border-slate-900"
                  >
                    <option value="VIP">VIP</option>
                    <option value="Platinum">Platinum</option>
                    <option value="Gold">Gold</option>
                    <option value="Silver">Silver</option>
                    <option value="Bronze">Bronze</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">कीमत ₹ (Price)</label>
                    <input
                      type="number"
                      required
                      value={newPlan.price}
                      onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
                      placeholder="5000"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold font-mono focus:outline-none focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">डेली रिटर्न ₹ (Daily)</label>
                    <input
                      type="number"
                      required
                      value={newPlan.dailyReturn}
                      onChange={(e) => setNewPlan({ ...newPlan, dailyReturn: e.target.value })}
                      placeholder="250"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold font-mono focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">वैलिडिटी दिन (Validity Days)</label>
                  <input
                    type="number"
                    required
                    value={newPlan.validityDays}
                    onChange={(e) => setNewPlan({ ...newPlan, validityDays: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold font-mono focus:outline-none focus:border-slate-900"
                  />
                </div>

                {planMsg && (
                  <p className="text-xs font-bold text-emerald-600 text-center">{planMsg}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  प्लांस सेव करें (Save Plan to Firebase)
                </button>
              </form>
            </div>

            {/* Existing Plans List */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">
                सक्रिय प्लांस सूची (Active Plans List - Total: {plans.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {plans.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-black text-slate-900 block">{p.name}</span>
                      <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-1.5 rounded-md">
                        {p.category}
                      </span>
                      <p className="text-[11px] font-mono font-bold text-slate-700 mt-1">
                        कीमत: ₹{p.price?.toLocaleString('en-IN')} | डेली: ₹{p.dailyReturn}/दिन
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeletePlan(p.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg cursor-pointer"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            6. ADD SLIDER TAB
            ========================================================================= */}
        {activeTab === 'sliders' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Create Slider Form */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">
                नया होम बैनर स्लाइडर जोड़ें (Add Home Slider)
              </h3>
              <form onSubmit={handleCreateSlider} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">टाइटल (Banner Title)</label>
                  <input
                    type="text"
                    required
                    value={newSlider.title}
                    onChange={(e) => setNewSlider({ ...newSlider, title: e.target.value })}
                    placeholder="उदा: Double ROI Offer Active"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">सबटेक्स्ट (Subtext)</label>
                  <input
                    type="text"
                    value={newSlider.subtext}
                    onChange={(e) => setNewSlider({ ...newSlider, subtext: e.target.value })}
                    placeholder="उदा: Earn ₹500 daily directly into wallet"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">बैज लेफ्ट (Left Tag)</label>
                    <input
                      type="text"
                      value={newSlider.badgeLeft}
                      onChange={(e) => setNewSlider({ ...newSlider, badgeLeft: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:outline-none focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">बैज राइट (Right Tag)</label>
                    <input
                      type="text"
                      value={newSlider.badgeRight}
                      onChange={(e) => setNewSlider({ ...newSlider, badgeRight: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">बटन टेक्स्ट (Button Label)</label>
                  <input
                    type="text"
                    value={newSlider.btnText}
                    onChange={(e) => setNewSlider({ ...newSlider, btnText: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:outline-none focus:border-slate-900"
                  />
                </div>

                {sliderMsg && (
                  <p className="text-xs font-bold text-emerald-600 text-center">{sliderMsg}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  स्लाइडर सेव करें (Save Slider to Firebase)
                </button>
              </form>
            </div>

            {/* Existing Sliders */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">
                सक्रिय स्लाइडर्स (Active Banner Sliders)
              </h3>
              {sliders.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  कोई कस्टम स्लाइडर नहीं मिला (Default sliders active)
                </div>
              ) : (
                <div className="space-y-2">
                  {sliders.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-black text-slate-900 block">{s.title}</span>
                        <p className="text-[11px] text-slate-600">{s.subtext}</p>
                      </div>
                      <button
                        onClick={async () => {
                          setSliders((prev) => prev.filter((item) => item.id !== s.id));
                          await deleteCustomSliderFromFirestore(String(s.id));
                        }}
                        className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            7. PAYMENT GATEWAY SETTINGS TAB
            ========================================================================= */}
        {activeTab === 'gateway' && (
          <div className="max-w-xl bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">
              पेमेंट गेटवे सेटिंग्स (Payment Gateway & QR Settings)
            </h3>

            <form onSubmit={handleSaveGateway} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  UPI ID (जैसे: networkjoinpro@upi)
                </label>
                <input
                  type="text"
                  required
                  value={gatewayForm.upiId}
                  onChange={(e) => setGatewayForm({ ...gatewayForm, upiId: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    मिनिमम डिपॉजिट ₹ (Min Deposit)
                  </label>
                  <input
                    type="number"
                    required
                    value={gatewayForm.minDeposit}
                    onChange={(e) =>
                      setGatewayForm({ ...gatewayForm, minDeposit: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    मिनिमम विड्रोल ₹ (Min Withdrawal)
                  </label>
                  <input
                    type="number"
                    required
                    value={gatewayForm.minWithdrawal}
                    onChange={(e) =>
                      setGatewayForm({ ...gatewayForm, minWithdrawal: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              {gatewayMsg && (
                <p className="text-xs font-bold text-emerald-600 text-center">{gatewayMsg}</p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl transition-all shadow-sm cursor-pointer"
              >
                सेटिंग्स सेव करें (Save Gateway Settings to Firebase)
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  </div>
);
}
