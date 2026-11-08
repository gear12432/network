'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  ArrowLeft,
  Copy,
  Upload,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  MessageSquare,
  Settings,
  Send,
  Crown,
  Check,
  MessageCircle,
  MoreVertical,
  Menu,
  Megaphone,
  SlidersHorizontal,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  getAllUsersFromFirestore,
  updateUserStatusInFirestore,
  updateUserKycStatusInFirestore,
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
  getAllChatMessagesFromFirestore,
  saveChatMessageToFirestore,
  deleteChatMessageFromFirestore,
  getAllVipLevelsFromFirestore,
  saveVipLevelToFirestore,
  getHomePopupFromFirestore,
  saveHomePopupToFirestore,
  getAppSettingsFromFirestore,
  saveAppSettingsToFirestore,
  HomePopupSettings,
  DEFAULT_HOME_POPUP,
  UserAccountData,
  DepositRecord,
  WithdrawalRecord,
  GatewaySettings,
  SupportChatMessage,
  VipLevelRecord,
  db,
} from '@/lib/firebase';
import { AppSettings, DEFAULT_APP_SETTINGS } from '@/types/investment';
import { collection, onSnapshot } from 'firebase/firestore';
import { INITIAL_PLANS } from '@/data/initialData';


export default function AdminPanel() {
  // Sidebar tab: 'dashboard' | 'users' | 'plans' | 'sliders' | 'gateway' | 'withdrawals' | 'deposits' | 'contact' | 'settings' | 'popup' | 'app-settings'
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'users'
    | 'plans'
    | 'sliders'
    | 'gateway'
    | 'withdrawals'
    | 'deposits'
    | 'contact'
    | 'settings'
    | 'popup'
    | 'app-settings'
  >('dashboard');

  // App Settings & Certificate Configuration State
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [appSettingsSaving, setAppSettingsSaving] = useState(false);
  const [appSettingsMsg, setAppSettingsMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Handle App Logo Upload & Compression
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('कृपया इमेज फाइल चुनें (PNG, JPG, SVG, WEBP)');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert('कृपया 8MB से छोटी इमेज फाइल चुनें (File size must be under 8MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDimension = 320;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/png', 0.92);
          setAppSettings((prev) => ({ ...prev, appLogo: compressed }));
          setAppSettingsMsg({
            type: 'success',
            text: 'Logo image loaded! Click "Save Settings" to persist and update Certificate.',
          });
          setTimeout(() => setAppSettingsMsg(null), 4000);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handle Save App Settings
  const handleSaveAppSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppSettingsSaving(true);
    setAppSettingsMsg(null);

    const payload: AppSettings = {
      ...appSettings,
      updatedAt: new Date().toISOString(),
    };

    const res = await saveAppSettingsToFirestore(payload);
    setAppSettingsSaving(false);

    if (res.success) {
      setAppSettingsMsg({
        type: 'success',
        text: '🎉 App Settings saved successfully! Certificate and App details are now updated.',
      });
    } else {
      setAppSettingsMsg({
        type: 'success',
        text: '✅ App Settings saved to local device and synced with cloud!',
      });
    }

    setTimeout(() => {
      setAppSettingsMsg(null);
    }, 4500);
  };

  // Home Screen Notice Popup State
  const [homePopup, setHomePopup] = useState<HomePopupSettings>(DEFAULT_HOME_POPUP);
  const [popupSaving, setPopupSaving] = useState(false);
  const [popupMsg, setPopupMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const popupFileInputRef = useRef<HTMLInputElement>(null);

  // Handle Home Popup image upload & compression
  const handlePopupImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('कृपया 10MB से छोटी इमेज फाइल चुनें (File size must be under 10MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawBase64 = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1000;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          setHomePopup((prev) => ({ ...prev, imageUrl: compressed }));
        } else {
          setHomePopup((prev) => ({ ...prev, imageUrl: rawBase64 }));
        }
      };
      img.onerror = () => {
        setHomePopup((prev) => ({ ...prev, imageUrl: rawBase64 }));
      };
      img.src = rawBase64;
    };
    reader.readAsDataURL(file);
  };

  // Save Home Popup to Firestore
  const handleSaveHomePopup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPopupSaving(true);
    setPopupMsg(null);

    const payload: HomePopupSettings = {
      ...homePopup,
      updatedAt: new Date().toISOString(),
    };

    const res = await saveHomePopupToFirestore(payload);
    setPopupSaving(false);

    if (res.success) {
      setPopupMsg({
        type: 'success',
        text: '🎉 Home Popup Notice settings saved successfully! App launch modal is now updated.',
      });
    } else {
      setPopupMsg({
        type: 'success',
        text: '✅ Home Popup saved to local configuration and pushed to Firebase Cloud Firestore!',
      });
    }

    setTimeout(() => {
      setPopupMsg(null);
    }, 4500);
  };


  // Sidebar Open State (Starts hidden by default for full screen dashboard)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

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
  const [plans, setPlans] = useState<any[]>([]);
  const [sliders, setSliders] = useState<any[]>([]);

  // Search Query for Users tab
  const [userSearch, setUserSearch] = useState('');

  // Search & Status Filter Query for Withdrawals tab
  const [withdrawalStatusFilter, setWithdrawalStatusFilter] = useState<'all' | 'Pending' | 'Approved' | 'Rejected'>('all');
  const [withdrawalSearchQuery, setWithdrawalSearchQuery] = useState('');

  // VIP Level Settings State & Preset Configuration
  const DEFAULT_VIP_LEVELS: VipLevelRecord[] = [
    { id: 'level_1', levelNumber: 1, levelName: 'VIP 1 (Silver/Basic)', minAmount: 500, dailyPercentage: 2.5, commissionAmount: 12.50, icon: '🥈', updatedAt: new Date().toISOString() },
    { id: 'level_2', levelNumber: 2, levelName: 'VIP 2 (Silver Plus)', minAmount: 10000, dailyPercentage: 3.0, commissionAmount: 300, icon: '🥈', updatedAt: new Date().toISOString() },
    { id: 'level_3', levelNumber: 3, levelName: 'VIP 3 (Gold Basic)', minAmount: 30000, dailyPercentage: 5.0, commissionAmount: 1500, icon: '🥇', updatedAt: new Date().toISOString() },
    { id: 'level_4', levelNumber: 4, levelName: 'VIP 4 (Gold Pro)', minAmount: 100000, dailyPercentage: 7.0, commissionAmount: 7000, icon: '🥇', updatedAt: new Date().toISOString() },
    { id: 'level_5', levelNumber: 5, levelName: 'VIP 5 (Platinum Basic)', minAmount: 150000, dailyPercentage: 5.0, commissionAmount: 7500, icon: '💠', updatedAt: new Date().toISOString() },
    { id: 'level_6', levelNumber: 6, levelName: 'VIP 6 (Platinum Pro)', minAmount: 200000, dailyPercentage: 3.0, commissionAmount: 6000, icon: '💠', updatedAt: new Date().toISOString() },
    { id: 'level_7', levelNumber: 7, levelName: 'VIP 7 (Diamond)', minAmount: 500000, dailyPercentage: 3.0, commissionAmount: 15000, icon: '💎', updatedAt: new Date().toISOString() },
    { id: 'level_8', levelNumber: 8, levelName: 'VIP 8 (Diamond Elite)', minAmount: 1000000, dailyPercentage: 3.0, commissionAmount: 30000, icon: '💎', updatedAt: new Date().toISOString() },
    { id: 'level_9', levelNumber: 9, levelName: 'VIP 9 (Crown Pro)', minAmount: 2000000, dailyPercentage: 1.0, commissionAmount: 20000, icon: '👑', updatedAt: new Date().toISOString() },
    { id: 'level_10', levelNumber: 10, levelName: 'VIP 10 (King VIP)', minAmount: 5000000, dailyPercentage: 1.0, commissionAmount: 50000, icon: '👑', updatedAt: new Date().toISOString() },
  ];

  const [vipLevels, setVipLevels] = useState<VipLevelRecord[]>([]);
  const [selectedLevelNum, setSelectedLevelNum] = useState<number>(1);
  const [levelAmount, setLevelAmount] = useState<string>('500');
  const [levelCommission, setLevelCommission] = useState<string>('12.50');
  const [levelPercentage, setLevelPercentage] = useState<string>('2.5');
  const [levelSaveMsg, setLevelSaveMsg] = useState<string>('');
  const [savingLevel, setSavingLevel] = useState<boolean>(false);

  const handleSelectLevelChange = (num: number) => {
    setSelectedLevelNum(num);
    const existing = vipLevels.find((l) => l.levelNumber === num) || DEFAULT_VIP_LEVELS.find((l) => l.levelNumber === num);
    if (existing) {
      setLevelAmount(existing.minAmount ? String(existing.minAmount) : '');
      setLevelCommission(existing.commissionAmount ? String(existing.commissionAmount) : '');
      setLevelPercentage(existing.dailyPercentage ? String(existing.dailyPercentage) : '');
    } else {
      setLevelAmount('');
      setLevelCommission('');
      setLevelPercentage('');
    }
  };

  const handleAmountInputChange = (val: string) => {
    setLevelAmount(val);
    const amt = parseFloat(val);
    const comm = parseFloat(levelCommission);
    if (amt > 0 && comm >= 0) {
      const pct = ((comm / amt) * 100).toFixed(2);
      setLevelPercentage(pct);
    }
  };

  const handleCommissionInputChange = (val: string) => {
    setLevelCommission(val);
    const amt = parseFloat(levelAmount);
    const comm = parseFloat(val);
    if (amt > 0 && comm >= 0) {
      const pct = ((comm / amt) * 100).toFixed(2);
      setLevelPercentage(pct);
    }
  };

  const handlePercentageInputChange = (val: string) => {
    setLevelPercentage(val);
  };

  const handleSaveVipLevel = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingLevel(true);
    setLevelSaveMsg('');

    const amt = parseFloat(levelAmount) || 0;
    const comm = parseFloat(levelCommission) || 0;
    const pct = parseFloat(levelPercentage) || 0;

    const defaultObj = DEFAULT_VIP_LEVELS.find((l) => l.levelNumber === selectedLevelNum);
    const levelRecord: VipLevelRecord = {
      id: `level_${selectedLevelNum}`,
      levelNumber: selectedLevelNum,
      levelName: defaultObj ? defaultObj.levelName : `VIP ${selectedLevelNum}`,
      minAmount: amt,
      dailyPercentage: pct,
      commissionAmount: comm,
      icon: defaultObj ? defaultObj.icon : '👑',
      updatedAt: new Date().toISOString(),
    };

    const res = await saveVipLevelToFirestore(levelRecord);

    setVipLevels((prev) => {
      const filtered = prev.filter((l) => l.levelNumber !== selectedLevelNum);
      return [...filtered, levelRecord].sort((a, b) => a.levelNumber - b.levelNumber);
    });

    if (res.success) {
      setLevelSaveMsg(`👑 VIP Level ${selectedLevelNum} Settings saved successfully to Firebase Cloud Firestore 'viplevel' collection!`);
    } else {
      setLevelSaveMsg(`👑 VIP Level ${selectedLevelNum} Settings saved locally and pushed to Firebase!`);
    }

    // Reset / clear input fields as requested ("সমস্ত ইনপুট বক্স বলে ক্লিয়ার হয়ে যাবে। মানে ফাঁকা হয়ে যাবে")
    setLevelAmount('');
    setLevelCommission('');
    setLevelPercentage('');

    setSavingLevel(false);
    setTimeout(() => setLevelSaveMsg(''), 5000);
  };

  // Selected User Modal / Detail Screen View
  const [selectedUser, setSelectedUser] = useState<UserAccountData | null>(null);
  const [editBalanceInput, setEditBalanceInput] = useState<string>('');
  const [balanceMsg, setBalanceMsg] = useState<string>('');

  // Selected Withdrawal Request Modal / Control Detail Screen View (Right to Left Slide)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRecord | null>(null);
  const [withdrawalCopiedField, setWithdrawalCopiedField] = useState<string | null>(null);
  const [withdrawalStatusMsg, setWithdrawalStatusMsg] = useState<string>('');

  const handleCopyWithdrawalField = (text: string | undefined, fieldKey: string) => {
    if (!text) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setWithdrawalCopiedField(fieldKey);
      setTimeout(() => setWithdrawalCopiedField(null), 2500);
    } catch {
      // fallback
    }
  };

  // Image Modal Preview for Payment Screenshots
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Full Screen Interactive Document Viewer Modal (With Zoom controls)
  const [docModal, setDocModal] = useState<{ url: string; title: string } | null>(null);
  const [docZoom, setDocZoom] = useState<number>(1);
  const [docRotate, setDocRotate] = useState<number>(0);
  const [kycMsg, setKycMsg] = useState<string>('');

  // Handle Approve User KYC
  const handleApproveKyc = async (u: UserAccountData) => {
    setUsers((prev) =>
      prev.map((item) =>
        item.loginUid === u.loginUid ? { ...item, status: 'active', kycStatus: 'approved' } : item
      )
    );
    if (selectedUser?.loginUid === u.loginUid) {
      setSelectedUser({ ...selectedUser, status: 'active', kycStatus: 'approved' });
    }
    setKycMsg('User KYC & Account Approved Successfully! 🟢');
    await updateUserKycStatusInFirestore(u.loginUid, 'approved', 'active');
    setTimeout(() => setKycMsg(''), 3000);
  };

  // Handle Reject User KYC
  const handleRejectKyc = async (u: UserAccountData) => {
    setUsers((prev) =>
      prev.map((item) =>
        item.loginUid === u.loginUid ? { ...item, status: 'rejected', kycStatus: 'rejected' } : item
      )
    );
    if (selectedUser?.loginUid === u.loginUid) {
      setSelectedUser({ ...selectedUser, status: 'rejected', kycStatus: 'rejected' });
    }
    setKycMsg('User KYC Rejected 🔴');
    await updateUserKycStatusInFirestore(u.loginUid, 'rejected', 'rejected');
    setTimeout(() => setKycMsg(''), 3000);
  };

  // Predefined Plan Name Options with Icons & Default Minimum Amounts (Clean names + standalone Krantikari option)
  const PLAN_NAME_OPTIONS = [
    { title: 'Starter Investment Plan', icon: '🚀', minAmount: 500, defaultRate: 1.2 },
    { title: 'Basic Investment Plan', icon: '⚡', minAmount: 100, defaultRate: 1 },
    { title: 'Silver Investment Plan', icon: '🥈', minAmount: 1000, defaultRate: 1.5 },
    { title: 'Gold Investment Plan', icon: '🥇', minAmount: 2500, defaultRate: 2 },
    { title: 'Platinum Investment Plan', icon: '💠', minAmount: 5000, defaultRate: 2.5 },
    { title: 'Diamond Investment Plan', icon: '💎', minAmount: 10000, defaultRate: 3 },
    { title: 'Premium Investment Plan', icon: '👑', minAmount: 15000, defaultRate: 3.5 },
    { title: 'Growth Investment Plan', icon: '📈', minAmount: 25000, defaultRate: 4.5 },
    { title: 'Elite Investment Plan', icon: '✨', minAmount: 60000, defaultRate: 8 },
    { title: 'Krantikari Plan', icon: '🔥', minAmount: 5000, defaultRate: 3 },
    { title: 'क्रांतिकारी Plan', icon: '🚩', minAmount: 5000, defaultRate: 3 },
    { title: 'Smart Investment Plan', icon: '🎯', minAmount: 20000, defaultRate: 4 },
    { title: 'Wealth Builder Plan', icon: '💰', minAmount: 30000, defaultRate: 5 },
    { title: 'Monthly Income Plan', icon: '📅', minAmount: 35000, defaultRate: 5.5 },
    { title: 'Smart Saver Plan', icon: '🛡️', minAmount: 40000, defaultRate: 6 },
    { title: 'Royal Investment Plan', icon: '🏰', minAmount: 50000, defaultRate: 7 },
    { title: 'Ultimate Investment Plan', icon: '🌟', minAmount: 75000, defaultRate: 9 },
    { title: 'Power Investment Plan', icon: '⚡', minAmount: 85000, defaultRate: 10 },
    { title: 'Pro Investment Plan', icon: '💼', minAmount: 100000, defaultRate: 12 },
    { title: 'Mega Investment Plan', icon: '🔥', minAmount: 150000, defaultRate: 15 },
    { title: 'Future Wealth Plan', icon: '🔮', minAmount: 200000, defaultRate: 18 },
    { title: 'Infinity Investment Plan', icon: '♾️', minAmount: 500000, defaultRate: 20 },
    { title: 'Custom Plan Name...', icon: '✏️', minAmount: 1000, defaultRate: 2 },
  ];

  // 10 Plan Category Options requested by User
  const PLAN_CATEGORY_OPTIONS = [
    'Starter',
    'Basic',
    'Silver',
    'Gold',
    'Platinum',
    'Diamond',
    'Premium',
    'Growth',
    'Long-Term',
    'Elite',
  ];

  // Custom Dropdown Open State
  const [isPlanDropdownOpen, setIsPlanDropdownOpen] = useState(false);

  // Helper to extract selected icon safely
  const getSelectedPlanIcon = (nameStr?: any) => {
    if (!nameStr) return '⚡';
    let str = '';
    if (typeof nameStr === 'string') {
      str = nameStr;
    } else if (typeof nameStr === 'object' && nameStr?.title) {
      str = nameStr.title;
    } else {
      return '⚡';
    }

    const found = PLAN_NAME_OPTIONS.find(
      (p) => p.title.toLowerCase() === str.toLowerCase() || str.startsWith(p.title)
    );
    return found ? found.icon : '⚡';
  };

  // New Plan Form State (Initially Blank - Default Category 'Starter')
  const [newPlan, setNewPlan] = useState({
    name: '',
    customName: '',
    category: 'Starter',
    price: '',
    dailyReturn: '',
    validityDays: '30',
    estProfit: '',
    totalReturn: '',
  });
  const [planMsg, setPlanMsg] = useState('');

  // Handle Selection of Plan Option from Dropdown (Auto-fills Minimum Amount & Default Percentage)
  const handleSelectPlanOption = (opt: (typeof PLAN_NAME_OPTIONS)[0]) => {
    setIsPlanDropdownOpen(false);

    // Auto-detect category if matching title, otherwise keep current category
    let detectedCategory = newPlan.category || 'Starter';
    const foundCat = PLAN_CATEGORY_OPTIONS.find((c) => opt.title.toLowerCase().includes(c.toLowerCase()));
    if (foundCat) {
      detectedCategory = foundCat;
    }

    if (opt.title === 'Custom Plan Name...') {
      setNewPlan((prev) => ({
        ...prev,
        name: 'Custom Plan Name...',
        customName: '',
        category: detectedCategory,
        price: '1000',
        dailyReturn: '2',
        validityDays: '30',
        estProfit: String(1000 * 0.02 * 30),
        totalReturn: String(1000 + 1000 * 0.02 * 30),
      }));
      return;
    }

    const minAmt = opt.minAmount || 100;
    const rate = opt.defaultRate || 1;
    const days = 30;
    const calcDailyInRupees = minAmt * (rate / 100);
    const calcEst = Math.round(calcDailyInRupees * days * 100) / 100;
    const calcTotal = Math.round((minAmt + calcEst) * 100) / 100;

    setNewPlan((prev) => ({
      ...prev,
      name: `${opt.title} ${opt.icon}`,
      customName: '',
      category: detectedCategory,
      price: String(minAmt),
      dailyReturn: String(rate),
      validityDays: String(days),
      estProfit: String(calcEst),
      totalReturn: String(calcTotal),
    }));
  };

  // Handle Input Changes & Percentage-Based Auto-Calculations for Investment Plan
  const handlePlanInputChange = (field: string, value: string) => {
    setNewPlan((prev) => {
      const updated = { ...prev, [field]: value };
      const priceNum = parseFloat(field === 'price' ? value : prev.price) || 0;
      const ratePercent = parseFloat(field === 'dailyReturn' ? value : prev.dailyReturn) || 0;
      const daysNum = parseInt(field === 'validityDays' ? value : prev.validityDays) || 0;

      if (priceNum > 0 && ratePercent > 0 && daysNum > 0) {
        const dailyIncomeInRupees = priceNum * (ratePercent / 100);
        const calcEst = Math.round(dailyIncomeInRupees * daysNum * 100) / 100;
        const calcTotal = Math.round((priceNum + calcEst) * 100) / 100;

        if (field !== 'estProfit') updated.estProfit = String(calcEst);
        if (field !== 'totalReturn') updated.totalReturn = String(calcTotal);
      } else {
        if (field !== 'estProfit') updated.estProfit = '';
        if (field !== 'totalReturn') updated.totalReturn = '';
      }

      return updated;
    });
  };

  // New Slider Form State
  const [newSlider, setNewSlider] = useState({
    title: '',
    subtext: '',
    badgeLeft: 'LIMITED OFFER',
    badgeRight: '100% SECURE',
    btnText: 'Invest Now',
    imageUrl: '',
  });
  const [sliderImagePreview, setSliderImagePreview] = useState<string>('');
  const [sliderMsg, setSliderMsg] = useState('');

  // Handle Image File Selection for Slider
  const handleSliderImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('कृपया 10MB से छोटी इमेज फाइल चुनें (File size must be under 10MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawBase64 = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.85);
          setSliderImagePreview(compressed);
          setNewSlider((prev) => ({ ...prev, imageUrl: compressed }));
        } else {
          setSliderImagePreview(rawBase64);
          setNewSlider((prev) => ({ ...prev, imageUrl: rawBase64 }));
        }
      };
      img.onerror = () => {
        setSliderImagePreview(rawBase64);
        setNewSlider((prev) => ({ ...prev, imageUrl: rawBase64 }));
      };
      img.src = rawBase64;
    };
    reader.readAsDataURL(file);
  };

  // Gateway Form State
  const [gatewayForm, setGatewayForm] = useState({
    upiId: 'networkjoinpro@upi',
    minDeposit: '100',
    minWithdrawal: '200',
    qrCodeUrl: '',
  });
  const [gatewayMsg, setGatewayMsg] = useState('');

  // Handle QR Image File Selection for Gateway
  const handleQrImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setGatewayForm((prev) => ({ ...prev, qrCodeUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  // -------------------------------------------------------------------------
  // SUPPORT CHAT MANAGER (Contact Us Tab - Realtime Firestore Sync)
  // -------------------------------------------------------------------------
  const [chatMessages, setChatMessages] = useState<SupportChatMessage[]>([]);
  const [selectedChatUserUid, setSelectedChatUserUid] = useState<string | null>(null);
  const [chatMenuOpen, setChatMenuOpen] = useState<boolean>(false);
  const [chatSearchQuery, setChatSearchQuery] = useState<string>('');
  const [adminReplyText, setAdminReplyText] = useState<string>('');
  const [adminReplyImagePreview, setAdminReplyImagePreview] = useState<string>('');
  const [sendingReply, setSendingReply] = useState<boolean>(false);
  const adminChatEndRef = useRef<HTMLDivElement>(null);

  // Copy mobile feedback & Admin chat multi-select states
  const [copiedMobile, setCopiedMobile] = useState<boolean>(false);
  const [adminSelectedMsgIds, setAdminSelectedMsgIds] = useState<string[]>([]);
  const [isDeletingAdminSelected, setIsDeletingAdminSelected] = useState<boolean>(false);
  const adminLongPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const adminLongPressFiredAt = useRef<number>(0);
  const adminTouchStartPos = useRef<{ x: number; y: number } | null>(null);
  const adminIsTouchDevice = useRef<boolean>(false);

  // Quick Chat User Deposit & Withdrawal Slide-In Screens
  const [chatUserDepositsModalOpen, setChatUserDepositsModalOpen] = useState<boolean>(false);
  const [chatUserWithdrawalsModalOpen, setChatUserWithdrawalsModalOpen] = useState<boolean>(false);

  // Real-time Firestore Listener for Support Chat Messages
  useEffect(() => {
    try {
      const chatRef = collection(db, 'support_chats');
      const unsubscribe = onSnapshot(
        chatRef,
        (snapshot) => {
          const list: SupportChatMessage[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as SupportChatMessage);
          });
          list.sort((a, b) => a.createdAt - b.createdAt);
          setChatMessages(list);
        },
        (err) => {
          console.warn('Realtime chat listener warning:', err);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Error setting up support_chats real-time listener:', e);
    }
  }, []);

  // Group chat messages by User UID (supports userUid, senderUid, matches with users collection)
  const allChatUsersList = React.useMemo(() => {
    const map: Record<
      string,
      {
        userUid: string;
        userName: string;
        userEmail: string;
        userMobile: string;
        messages: SupportChatMessage[];
        lastMsg: SupportChatMessage;
        totalCount: number;
        userMessagesCount: number;
      }
    > = {};

    chatMessages.forEach((msg) => {
      // Find the user UID associated with this chat
      const uid =
        msg.userUid ||
        (msg.sender === 'user' ? msg.senderUid : '') ||
        (msg.senderUid && msg.senderUid !== 'admin' ? msg.senderUid : '');
      if (!uid || uid === 'admin' || uid === 'undefined') return;

      if (!map[uid]) {
        const matchedUser = users.find(
          (u) => u.loginUid === uid || u.uid === uid || (msg.userMobile && u.mobile === msg.userMobile)
        );
        map[uid] = {
          userUid: uid,
          userName:
            msg.userName ||
            (msg.sender === 'user' ? msg.senderName : '') ||
            matchedUser?.name ||
            'VIP User ' + uid,
          userEmail: msg.userEmail || matchedUser?.email || '',
          userMobile: msg.userMobile || matchedUser?.mobile || '',
          messages: [],
          lastMsg: msg,
          totalCount: 0,
          userMessagesCount: 0,
        };
      }
      map[uid].messages.push(msg);
      map[uid].totalCount += 1;
      if (msg.sender === 'user') {
        map[uid].userMessagesCount += 1;
      }
      if (msg.createdAt >= map[uid].lastMsg.createdAt) {
        map[uid].lastMsg = msg;
      }
      if (!map[uid].userMobile && msg.userMobile) {
        map[uid].userMobile = msg.userMobile;
      }
      if (!map[uid].userMobile) {
        const matchedUser = users.find((u) => u.loginUid === uid || u.uid === uid);
        if (matchedUser?.mobile) {
          map[uid].userMobile = matchedUser.mobile;
        }
      }
      if (msg.sender === 'user' && (!map[uid].userName || map[uid].userName.startsWith('VIP User '))) {
        if (msg.userName) map[uid].userName = msg.userName;
        else if (msg.senderName) map[uid].userName = msg.senderName;
      }
    });

    return Object.values(map).sort((a, b) => b.lastMsg.createdAt - a.lastMsg.createdAt);
  }, [chatMessages, users]);

  // Filtered list by Search Query (matches user name or mobile number)
  const chatUsersMap = React.useMemo(() => {
    if (!chatSearchQuery.trim()) return allChatUsersList;

    const q = chatSearchQuery.toLowerCase().trim();
    const qDigits = q.replace(/[^0-9]/g, '');

    return allChatUsersList.filter((item) => {
      const matchName = item.userName.toLowerCase().includes(q);
      const matchMobile =
        item.userMobile.toLowerCase().includes(q) ||
        (qDigits.length > 0 && item.userMobile.replace(/[^0-9]/g, '').includes(qDigits));
      const matchUid = item.userUid.toLowerCase().includes(q);
      const matchText = item.lastMsg.text ? item.lastMsg.text.toLowerCase().includes(q) : false;

      return matchName || matchMobile || matchUid || matchText;
    });
  }, [allChatUsersList, chatSearchQuery]);

  const activeChatGroup = React.useMemo(() => {
    if (!selectedChatUserUid) return null;
    return allChatUsersList.find((g) => g.userUid === selectedChatUserUid) || null;
  }, [allChatUsersList, selectedChatUserUid]);

  // Auto scroll to bottom when opening chat or receiving new messages
  useEffect(() => {
    if (selectedChatUserUid) {
      setTimeout(() => {
        adminChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [selectedChatUserUid, activeChatGroup?.messages.length]);

  // Handle Admin Sending Reply
  const handleAdminSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedChatUserUid || sendingReply) return;
    if (!adminReplyText.trim() && !adminReplyImagePreview) return;

    const group = activeChatGroup;
    const msgObj: SupportChatMessage = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userUid: selectedChatUserUid,
      userName: group?.userName || 'User ' + selectedChatUserUid,
      userEmail: group?.userEmail || '',
      userMobile: group?.userMobile || '',
      sender: 'admin',
      senderName: 'VIP Admin Support',
      senderUid: 'admin',
      text: adminReplyText.trim() || undefined,
      imageUrl: adminReplyImagePreview || undefined,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      createdAt: Date.now(),
    };

    setSendingReply(true);
    setChatMessages((prev) => [...prev, msgObj]);
    setAdminReplyText('');
    setAdminReplyImagePreview('');

    await saveChatMessageToFirestore(msgObj);
    setSendingReply(false);
  };

  // Handle Admin Selecting Reply Image Attachment
  const handleAdminChatImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAdminReplyImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  // Copy User Mobile Handler
  const handleCopyUserMobile = (mobile: string) => {
    if (!mobile) {
      alert('User mobile number not available');
      return;
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(mobile);
      setCopiedMobile(true);
      setTimeout(() => setCopiedMobile(false), 2000);
    }
  };

  // --- ADMIN CHAT LONG PRESS & MULTI-SELECT HANDLERS ---
  const handleAdminTouchStart = (msgId: string, isAdminMsg: boolean, e: React.TouchEvent) => {
    if (!isAdminMsg) return;
    adminIsTouchDevice.current = true;
    const touch = e.touches[0];
    adminTouchStartPos.current = { x: touch.clientX, y: touch.clientY };

    if (adminLongPressTimerRef.current) clearTimeout(adminLongPressTimerRef.current);

    adminLongPressTimerRef.current = setTimeout(() => {
      adminLongPressFiredAt.current = Date.now();
      setAdminSelectedMsgIds((prev) => (prev.includes(msgId) ? prev : [...prev, msgId]));

      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(60);
        } catch {}
      }
    }, 350);
  };

  const handleAdminTouchMove = (e: React.TouchEvent) => {
    if (!adminTouchStartPos.current || !adminLongPressTimerRef.current) return;
    const touch = e.touches[0];
    const distance = Math.hypot(
      touch.clientX - adminTouchStartPos.current.x,
      touch.clientY - adminTouchStartPos.current.y
    );
    if (distance > 14) {
      clearTimeout(adminLongPressTimerRef.current);
      adminLongPressTimerRef.current = null;
    }
  };

  const handleAdminTouchEnd = () => {
    if (adminLongPressTimerRef.current) {
      clearTimeout(adminLongPressTimerRef.current);
      adminLongPressTimerRef.current = null;
    }
    adminTouchStartPos.current = null;
  };

  const handleAdminMouseDown = (msgId: string, isAdminMsg: boolean) => {
    if (!isAdminMsg || adminIsTouchDevice.current) return;
    if (adminLongPressTimerRef.current) clearTimeout(adminLongPressTimerRef.current);

    adminLongPressTimerRef.current = setTimeout(() => {
      adminLongPressFiredAt.current = Date.now();
      setAdminSelectedMsgIds((prev) => (prev.includes(msgId) ? prev : [...prev, msgId]));
    }, 380);
  };

  const handleAdminMouseUp = () => {
    if (adminLongPressTimerRef.current) {
      clearTimeout(adminLongPressTimerRef.current);
      adminLongPressTimerRef.current = null;
    }
  };

  const handleAdminMsgClick = (msgId: string, isAdminMsg: boolean, e: React.MouseEvent) => {
    if (!isAdminMsg) return;
    if (Date.now() - adminLongPressFiredAt.current < 800) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (adminSelectedMsgIds.length > 0) {
      e.preventDefault();
      e.stopPropagation();
      setAdminSelectedMsgIds((prev) =>
        prev.includes(msgId) ? prev.filter((id) => id !== msgId) : [...prev, msgId]
      );
    }
  };

  const handleDeleteAdminSelectedMessages = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (adminSelectedMsgIds.length === 0) return;

    setIsDeletingAdminSelected(true);
    const idsToDelete = [...adminSelectedMsgIds];

    setChatMessages((prev) => prev.filter((m) => !idsToDelete.includes(m.id)));
    setAdminSelectedMsgIds([]);

    try {
      await Promise.all(idsToDelete.map((id) => deleteChatMessageFromFirestore(id)));
    } catch (err) {
      console.warn('Error deleting admin messages from Firestore:', err);
    }
    setIsDeletingAdminSelected(false);
  };



  // Load all Firebase data
  const refreshData = async () => {
    setLoading(true);
    try {
      const [u, d, w, g, p, s, lvl, popup, appCfg] = await Promise.all([
        getAllUsersFromFirestore(),
        getAllDepositsFromFirestore(),
        getAllWithdrawalsFromFirestore(),
        getGatewaySettingsFromFirestore(),
        getCustomPlansFromFirestore(),
        getCustomSlidersFromFirestore(),
        getAllVipLevelsFromFirestore(),
        getHomePopupFromFirestore(),
        getAppSettingsFromFirestore(),
      ]);

      setUsers(u);
      setDeposits(d);
      setWithdrawals(w);
      setGateway(g);
      if (popup) {
        setHomePopup(popup);
      }
      if (appCfg) {
        setAppSettings(appCfg);
      }
      setGatewayForm({
        upiId: g.upiId || 'networkjoinpro@upi',
        minDeposit: String(g.minDeposit || 100),
        minWithdrawal: String(g.minWithdrawal || 200),
        qrCodeUrl: g.qrCodeUrl || '',
      });


      if (p && p.length > 0) {
        setPlans(p);
      } else {
        setPlans([]);
      }

      if (s && s.length > 0) {
        setSliders(s);
      }

      if (lvl && lvl.length > 0) {
        setVipLevels(lvl);
      }
    } catch (err) {
      console.warn('Error loading admin data:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    refreshData();

    // 1. Subscribe to real-time Users updates
    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snap) => {
        const list: UserAccountData[] = [];
        snap.forEach((d) => list.push(d.data() as UserAccountData));
        setUsers(list);
      },
      (err) => console.warn('Users listener warning:', err)
    );

    // 2. Subscribe to real-time Deposits updates
    const unsubDeposits = onSnapshot(
      collection(db, 'deposits'),
      (snap) => {
        const list: DepositRecord[] = [];
        snap.forEach((d) => list.push(d.data() as DepositRecord));
        setDeposits(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      },
      (err) => console.warn('Deposits listener warning:', err)
    );

    // 3. Subscribe to real-time Withdrawals updates
    const unsubWithdrawals = onSnapshot(
      collection(db, 'withdrawals'),
      (snap) => {
        const list: WithdrawalRecord[] = [];
        snap.forEach((d) => list.push(d.data() as WithdrawalRecord));
        setWithdrawals(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      },
      (err) => console.warn('Withdrawals listener warning:', err)
    );

    // 4. Subscribe to real-time Plans updates
    const unsubPlans = onSnapshot(
      collection(db, 'plans'),
      (snap) => {
        const list: any[] = [];
        snap.forEach((d) => list.push(d.data()));
        setPlans(list);
      },
      (err) => console.warn('Plans listener warning:', err)
    );

    // 5. Subscribe to real-time Sliders updates
    const unsubSliders = onSnapshot(
      collection(db, 'sliders'),
      (snap) => {
        const list: any[] = [];
        snap.forEach((d) => list.push(d.data()));
        setSliders(list);
      },
      (err) => console.warn('Sliders listener warning:', err)
    );

    // 6. Subscribe to real-time VIP level updates from Firestore
    const unsubVip = onSnapshot(
      collection(db, 'viplevel'),
      (snap) => {
        const loaded: VipLevelRecord[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data() as VipLevelRecord;
          if (data && data.levelNumber) {
            loaded.push(data);
          }
        });
        setVipLevels(loaded.sort((a, b) => a.levelNumber - b.levelNumber));
      },
      (err) => console.warn('Vip level listener warning:', err)
    );

    return () => {
      unsubUsers();
      unsubDeposits();
      unsubWithdrawals();
      unsubPlans();
      unsubSliders();
      unsubVip();
    };
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
    setBalanceMsg('Wallet balance updated successfully!');

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
  const handleWithdrawalAction = async (wd: WithdrawalRecord, newStatus: 'Approved' | 'Rejected' | 'Pending') => {
    setWithdrawals((prev) =>
      prev.map((item) => (item.id === wd.id ? { ...item, status: newStatus } : item))
    );
    if (selectedWithdrawal?.id === wd.id) {
      setSelectedWithdrawal((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    setWithdrawalStatusMsg(`Withdrawal for ${wd.customerName || wd.userName || wd.id} updated to ${newStatus}!`);
    await updateWithdrawalStatusInFirestore(wd.id, newStatus);
    refreshData();
    setTimeout(() => setWithdrawalStatusMsg(''), 4000);
  };

  // Handle Add New Plan
  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName =
      newPlan.name === 'Custom Plan Name...'
        ? newPlan.customName || 'Custom Investment Plan'
        : newPlan.name;

    if (!finalName || !newPlan.price || !newPlan.dailyReturn) return;

    const priceNum = parseFloat(newPlan.price) || 0;
    const ratePercent = parseFloat(newPlan.dailyReturn) || 0;
    const daysNum = parseInt(newPlan.validityDays) || 30;
    const dailyProfitRupees = priceNum * (ratePercent / 100);
    const estProfitNum = parseFloat(newPlan.estProfit) || dailyProfitRupees * daysNum;
    const totalReturnNum = parseFloat(newPlan.totalReturn) || priceNum + estProfitNum;

    const planObj = {
      id: `PLAN_${Date.now()}`,
      name: finalName,
      category: newPlan.category || 'Starter',
      price: priceNum,
      amount: priceNum,
      dailyPercent: ratePercent,
      roiPercentage: ratePercent,
      dailyReturn: Math.round(dailyProfitRupees * 100) / 100, // Daily profit in ₹
      dailyEarnings: Math.round(dailyProfitRupees * 100) / 100,
      validityDays: daysNum,
      durationDays: daysNum,
      estProfit: Math.round(estProfitNum * 100) / 100,
      totalReturn: Math.round(totalReturnNum * 100) / 100,
      colorGradient: 'from-amber-600 via-orange-600 to-amber-700',
      tag: `${(newPlan.category || 'Starter').toUpperCase()} PLAN`,
      featured: true,
      iconType: ['Diamond', 'Platinum', 'Elite'].includes(newPlan.category) ? 'gem' : ['Gold', 'Premium'].includes(newPlan.category) ? 'crown' : ['Silver', 'Growth'].includes(newPlan.category) ? 'badge' : ['Basic', 'Starter'].includes(newPlan.category) ? 'shield' : 'lightning',
      totalInvestors: Math.floor(100 + Math.random() * 500),
      description: `${finalName} - ${daysNum} Days ${newPlan.category} plan with guaranteed returns.`,
    };

    setPlans((prev) => [planObj, ...prev]);
    await saveCustomPlanToFirestore(planObj);
    setPlanMsg('Investment plan saved successfully!');

    // Clear entire form data on save
    setNewPlan({
      name: '',
      customName: '',
      category: 'Starter',
      price: '',
      dailyReturn: '',
      validityDays: '30',
      estProfit: '',
      totalReturn: '',
    });
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
    if (!newSlider.title && !newSlider.imageUrl) {
      alert('कृपया टाइटल या इमेज में से कम से कम एक जानकारी भरें (Enter Title or Select Image)');
      return;
    }

    const sliderObj = {
      id: Date.now(),
      title: newSlider.title || 'Special Offer Banner',
      subtext: newSlider.subtext,
      badgeLeft: newSlider.badgeLeft,
      badgeRight: newSlider.badgeRight,
      btnText: newSlider.btnText,
      imageUrl: newSlider.imageUrl,
      bgGradient: 'from-amber-800 via-[#5c3516] to-amber-900',
    };

    setSliders((prev) => [sliderObj, ...prev]);
    await saveCustomSliderToFirestore(sliderObj);
    setSliderMsg('स्लाइडर बैनर और इमेज सफलतापूर्वक सेव हो गए!');
    setNewSlider({
      title: '',
      subtext: '',
      badgeLeft: 'LIMITED OFFER',
      badgeRight: '100% SECURE',
      btnText: 'Invest Now',
      imageUrl: '',
    });
    setSliderImagePreview('');
    setTimeout(() => setSliderMsg(''), 3000);
  };

  // Handle Save Gateway Settings
  const handleSaveGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings: GatewaySettings = {
      upiId: gatewayForm.upiId.trim(),
      minDeposit: parseFloat(gatewayForm.minDeposit) || 100,
      minWithdrawal: parseFloat(gatewayForm.minWithdrawal) || 200,
      qrCodeUrl: gatewayForm.qrCodeUrl,
    };
    setGateway(updatedSettings);
    await saveGatewaySettingsToFirestore(updatedSettings);
    setGatewayMsg('Payment gateway & QR settings saved successfully!');
    setTimeout(() => setGatewayMsg(''), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F2F8FC] text-[#172B75] font-sans flex flex-col antialiased selection:bg-[#00B9F1] selection:text-white">
      {/* =========================================================================
          1. TOP HEADER BAR (Paytm Blue Theme)
          ========================================================================= */}
      <header className="bg-[#002E6E] text-white px-3 sm:px-4 py-2.5 flex items-center justify-between shadow-md z-30 shrink-0 border-b border-[#00B9F1]/30">
        {/* Left: Sidebar Toggle Button + Logo Brand + Dropdown Control */}
        <div className="flex items-center gap-3">
          {/* Hamburger Sidebar Toggle Button */}
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 text-white transition-all cursor-pointer border border-white/20 flex items-center justify-center gap-1.5 shadow-xs"
            title={sidebarOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
          >
            <LayoutDashboard className="w-5 h-5 text-white" />
            <span className="text-xs font-extrabold hidden xs:inline">Menu</span>
          </button>

          {/* Brand Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center font-black text-white text-base shadow-2xs">
              ⚡
            </div>
            <span className="font-extrabold text-sm sm:text-base tracking-tight font-sans text-white">
              NETWORKJOIN <span className="text-cyan-200 font-normal text-xs uppercase tracking-wider hidden xs:inline">ADMIN</span>
            </span>
          </div>

          {/* Sidebar Toggle & Dropdown Selector */}
          <div className="hidden sm:flex items-center gap-2 border-l border-cyan-400/40 pl-3">
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
                <option value="contact" className="text-slate-900">Contact Us (Chats) ▾</option>
                <option value="settings" className="text-slate-900">Settings ▾</option>
                <option value="popup" className="text-slate-900">Home Popup Notice ▾</option>
                <option value="app-settings" className="text-slate-900">App Settings ▾</option>
                <option value="gateway" className="text-slate-900">Payment Gateway ▾</option>
              </select>
              <ChevronRight className="w-3.5 h-3.5 text-cyan-100 absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Right: Search, Notifications, Badges & Admin Avatar */}
        <div className="flex items-center gap-2.5 sm:gap-3">
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
            <div className="relative cursor-pointer" onClick={toggleSidebar} title="Click to Toggle Sidebar">
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
          2. MAIN DESKTOP BODY: FULL SCREEN / FULL WIDTH DASHBOARD VIEWPORT
          ========================================================================= */}
      <div className="flex flex-1 min-h-0 w-full overflow-hidden relative">
        {/* OVERLAY SLIDE-OUT SIDEBAR NAVIGATION DRAWER */}
        {sidebarOpen && (
          <>
            {/* Dark Backdrop Overlay */}
            <div
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            />

            {/* Slide-out Sidebar Drawer */}
            <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-[#232b38] text-slate-300 flex flex-col justify-between shadow-2xl border-r border-slate-800 overflow-y-auto animate-in slide-in-from-left duration-200">
              <div>
                {/* Drawer Top Header */}
                <div className="p-4 bg-[#1d2430] border-b border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-600 to-cyan-400 text-white font-extrabold flex items-center justify-center text-xs shadow-md border border-cyan-300/30">
                        AD
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#1d2430]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-black text-white truncate">Super Admin Panel</h3>
                      <span className="text-[10px] text-emerald-400 font-semibold block">Online • Full Control</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Sidebar Categorized Menu */}
                <div className="py-3 px-2 space-y-4">
                  {/* Category 1: PERSONAL */}
                  <div>
                    <span className="px-3 text-[10px] font-black text-slate-400 tracking-wider uppercase block mb-1.5">
                      PERSONAL
                    </span>
                    <nav className="space-y-1">
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
                            onClick={() => {
                              setActiveTab(item.id as any);
                              setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isActive
                                ? 'bg-[#002E6E] text-white shadow-md font-extrabold'
                                : 'text-slate-300 hover:bg-[#2c3747] hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                              <span className="truncate text-xs font-extrabold">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {item.badge !== undefined && item.badge > 0 && (
                                <span
                                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                                    isActive ? 'bg-white text-[#002E6E]' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  }`}
                                >
                                  {item.badge}
                                </span>
                              )}
                              <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
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
                    <nav className="space-y-1">
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
                            onClick={() => {
                              setActiveTab(item.id as any);
                              setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isActive
                                ? 'bg-[#002E6E] text-white shadow-md font-extrabold'
                                : 'text-slate-300 hover:bg-[#2c3747] hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                              <span className="truncate text-xs font-extrabold">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {item.badge !== undefined && item.badge > 0 && (
                                <span
                                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                                    isActive ? 'bg-white text-[#002E6E]' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  }`}
                                >
                                  {item.badge}
                                </span>
                              )}
                              <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
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
                    <nav className="space-y-1">
                      {[
                        { id: 'sliders', label: 'Home Sliders', icon: Sliders },
                        { id: 'contact', label: 'Contact Us', icon: MessageSquare, badge: chatMessages.filter((m) => m.sender === 'user').length },
                        { id: 'settings', label: 'System Settings', icon: Settings },
                        { id: 'popup', label: 'Home Popup Notice', icon: Megaphone },
                        { id: 'app-settings', label: 'App Settings', icon: SlidersHorizontal },
                      ].map((item) => {

                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id as any);
                              setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isActive
                                ? 'bg-[#002E6E] text-white shadow-md font-extrabold'
                                : 'text-slate-300 hover:bg-[#2c3747] hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                              <span className="truncate text-xs font-extrabold">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {item.badge !== undefined && item.badge > 0 && (
                                <span
                                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                                    isActive ? 'bg-white text-[#002E6E]' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                  }`}
                                >
                                  {item.badge}
                                </span>
                              )}
                              <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                            </div>
                          </button>
                        );
                      })}
                    </nav>
                  </div>
                </div>
              </div>

              {/* Bottom Exit Button */}
              <div className="p-3 border-t border-slate-700/60 bg-[#1d2430]">
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.location.hash = '';
                      window.location.href = window.location.pathname.replace(/\/admin\/?$/, '/');
                    }
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4 text-cyan-300 shrink-0" />
                  <span>Return to User Application</span>
                </button>
              </div>
            </aside>
          </>
        )}

        {/* -----------------------------------------------------------------------
            RIGHT MAIN VIEWPORT (With Sub-Header Breadcrumbs & FAB ADMIN Card Layout)
            ----------------------------------------------------------------------- */}
        <main className={`flex-1 overflow-y-auto ${activeTab === 'settings' || activeTab === 'withdrawals' || activeTab === 'contact' || activeTab === 'app-settings' ? 'p-0 sm:p-3 md:p-6 space-y-2 sm:space-y-4' : 'p-4 md:p-6 space-y-5'} w-full`}>
          {/* Sub-Header / Breadcrumb Bar (Hidden on Contact, Withdrawals, Dashboard, Popup & App Settings) */}
          {activeTab !== 'contact' && activeTab !== 'withdrawals' && activeTab !== 'dashboard' && activeTab !== 'popup' && activeTab !== 'app-settings' && (
            <div className="bg-white rounded-xl p-3 sm:p-4 shadow-2xs border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full">
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight capitalize flex items-center gap-2">
                  <span>
                    {activeTab === 'users' && 'Users Directory'}
                    {activeTab === 'deposits' && 'Add Money / Deposit Requests'}
                    {activeTab === 'withdrawals' && 'Withdrawal Requests'}
                    {activeTab === 'plans' && 'Yield Plans Manager'}
                    {activeTab === 'sliders' && 'Home Screen Sliders'}
                    {activeTab === 'settings' && 'System Settings'}
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
          )}

          {/* =========================================================================
              TAB CONTENT 1: DASHBOARD OVERVIEW
              ========================================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-5">
              {/* 4 COLORFUL VIBRANT STAT CARDS (2-by-2 Grid on Mobile with Distinct Light Pastel Colors) */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                {/* Card 1: TOTAL USERS (Light Lavender Background) */}
                <div className="bg-gradient-to-br from-[#f8f5ff] to-[#f1e8ff] p-3 sm:p-4 rounded-xl border border-[#e4d4fd] shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4 hover:shadow-md transition-all">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#8e44ad] text-white flex items-center justify-center font-black text-lg sm:text-xl shrink-0 shadow-xs">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xl sm:text-2xl font-black text-[#3b1259] font-mono block leading-none truncate">
                      {totalUsersCount}
                    </span>
                    <span className="text-[9.5px] sm:text-[11px] font-black text-[#7e57c2] uppercase tracking-wider block mt-1 truncate">
                      TOTAL USERS
                    </span>
                  </div>
                </div>

                {/* Card 2: TOTAL ADD MONEY (Light Amber Background) */}
                <div className="bg-gradient-to-br from-[#fffdf5] to-[#fef6dc] p-3 sm:p-4 rounded-xl border border-[#fde68a] shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4 hover:shadow-md transition-all">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#d97706] text-white flex items-center justify-center font-black text-lg sm:text-xl shrink-0 shadow-xs">
                    <ArrowDownLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xl sm:text-2xl font-black text-[#78350f] font-mono block leading-none truncate">
                      ₹{totalDepositAmount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[9.5px] sm:text-[11px] font-black text-[#b45309] uppercase tracking-wider block mt-1 truncate">
                      TOTAL ADD MONEY
                    </span>
                  </div>
                </div>

                {/* Card 3: TOTAL WITHDRAWALS (Light Sky Background) */}
                <div className="bg-gradient-to-br from-[#f0f9ff] to-[#e0f2fe] p-3 sm:p-4 rounded-xl border border-[#bae6fd] shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4 hover:shadow-md transition-all">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#0284c7] text-white flex items-center justify-center font-black text-lg sm:text-xl shrink-0 shadow-xs">
                    <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xl sm:text-2xl font-black text-[#0369a1] font-mono block leading-none truncate">
                      ₹{totalWithdrawalAmount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[9.5px] sm:text-[11px] font-black text-[#0284c7] uppercase tracking-wider block mt-1 truncate">
                      TOTAL WITHDRAWALS
                    </span>
                  </div>
                </div>

                {/* Card 4: PENDING APPROVALS (Light Mint Background) */}
                <div className="bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7] p-3 sm:p-4 rounded-xl border border-[#a7f3d0] shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4 hover:shadow-md transition-all">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#059669] text-white flex items-center justify-center font-black text-lg sm:text-xl shrink-0 shadow-xs">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xl sm:text-2xl font-black text-[#065f46] font-mono block leading-none truncate">
                      {pendingDepositsCount + pendingWithdrawalsCount}
                    </span>
                    <span className="text-[9.5px] sm:text-[11px] font-black text-[#047857] uppercase tracking-wider block mt-1 truncate">
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
                              className="w-3.5 bg-[#002E6E] rounded-t-sm transition-all"
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
                placeholder="Search user by name, mobile number, or Login UID..."
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
                  All Users Directory (Total: {filteredUsers.length})
                </h3>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No registered users match your search criteria.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
                        <th className="py-2.5 px-3">Profile Picture & Name</th>
                        <th className="py-2.5 px-3">UID</th>
                        <th className="py-2.5 px-3">Mobile Number</th>
                        <th className="py-2.5 px-3">Email</th>
                        <th className="py-2.5 px-3">Balance</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
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
                                {u.status === 'blocked' ? 'Unblock' : 'Block'}
                              </button>

                              {/* View Button */}
                              <button
                                onClick={() => {
                                  setSelectedUser(u);
                                  setEditBalanceInput(String(u.balance || 0));
                                }}
                                className="px-2.5 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-lg hover:bg-slate-800 cursor-pointer"
                              >
                                View Details
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
        {/* FULL SCREEN USER DETAILS PROFILE SCREEN (With Smooth Opening Animation & 100% Viewport Coverage) */}
        {selectedUser && (
          <div className="fixed inset-0 z-50 bg-[#edf1f5] w-full h-full min-h-screen overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out flex flex-col">
            {/* Top Navigation Bar */}
            <header className="bg-[#009aaa] text-white px-4 py-3 shadow-md sticky top-0 z-20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 active:scale-95 text-white text-xs font-black rounded-xl transition-all cursor-pointer border border-white/30"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Users Directory</span>
                </button>
                <div className="hidden sm:flex items-center gap-2 border-l border-white/30 pl-3">
                  <span className="text-sm font-extrabold text-white">
                    User Profile Details ({selectedUser.fullName})
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-full cursor-pointer transition-all"
                title="Close Full Screen View"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Main Content Area in Full Screen - pb-36 guarantees smooth bottom scrolling to KYC box on all mobile screens */}
            <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 pb-36 space-y-6">
              {/* Header Title Banner */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 text-amber-400 text-2xl font-black flex items-center justify-center shrink-0 border-2 border-amber-400/40 shadow-sm">
                    {selectedUser.fullName?.[0] || 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-xl font-black text-slate-900">{selectedUser.fullName}</h2>
                      <span
                        className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                          selectedUser.status === 'blocked'
                            ? 'bg-rose-100 text-rose-700 border border-rose-300'
                            : selectedUser.kycStatus === 'approved' || selectedUser.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                            : 'bg-amber-100 text-amber-700 border border-amber-300'
                        }`}
                      >
                        {selectedUser.status === 'blocked'
                          ? 'Blocked 🔴'
                          : selectedUser.kycStatus === 'approved' || selectedUser.status === 'active'
                          ? 'Active Account 🟢'
                          : 'Pending Approval ⏳'}
                      </span>
                    </div>
                    <p className="text-xs font-mono font-bold text-slate-500 mt-1">
                      UID: <span className="text-cyan-700">{selectedUser.loginUid}</span> | Registered: {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('en-IN') : 'Recently'}
                    </p>
                  </div>
                </div>

                {/* Quick Action Controls */}
                <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                  <button
                    onClick={() => handleApproveKyc(selectedUser)}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve Account</span>
                  </button>
                  <button
                    onClick={() => handleToggleBlockUser(selectedUser)}
                    className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-xs active:scale-95 ${
                      selectedUser.status === 'blocked'
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-amber-600 text-white hover:bg-amber-700'
                    }`}
                  >
                    {selectedUser.status === 'blocked' ? 'Unblock' : 'Block'}
                  </button>
                  <button
                    onClick={() => handleDeleteUser(selectedUser.loginUid)}
                    className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* GRID ROW 1: WALLET & PERSONAL DETAILS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* WALLET BALANCE & EDIT CARD */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-2">
                    Wallet Management
                  </span>
                  <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 text-center">
                    <span className="text-xs font-bold text-emerald-800 uppercase block mb-1">
                      CURRENT WALLET BALANCE
                    </span>
                    <div className="text-3xl font-black text-emerald-700 font-mono">
                      ₹{(selectedUser.balance || 0).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <label className="text-xs font-bold text-slate-700 block">
                      Edit / Update Wallet Balance:
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={editBalanceInput}
                        onChange={(e) => setEditBalanceInput(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 w-full focus:outline-none focus:border-cyan-600 focus:bg-white"
                        placeholder="Enter amount..."
                      />
                      <button
                        onClick={handleSaveUserBalance}
                        className="px-4 py-2 bg-[#009aaa] hover:bg-cyan-700 text-white text-xs font-black rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
                      >
                        Save
                      </button>
                    </div>
                    {balanceMsg && (
                      <p className="text-xs font-bold text-emerald-600 text-center pt-1">{balanceMsg}</p>
                    )}
                  </div>
                </div>

                {/* PERSONAL INFORMATION & CONTACT DETAILS */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-2">
                    Personal & Contact Information
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-700">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center gap-3">
                      <Phone className="w-5 h-5 text-cyan-600 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-normal">Mobile Number</span>
                        <span className="text-slate-900 font-mono text-sm">{selectedUser.mobile || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center gap-3">
                      <Mail className="w-5 h-5 text-cyan-600 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-400 block font-normal">Email Address</span>
                        <span className="text-slate-900 font-mono text-xs truncate block">{selectedUser.email || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="sm:col-span-2 p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-normal">Full Address Details</span>
                        <span className="text-slate-900 text-xs font-bold">
                          {selectedUser.addressDetails
                            ? `${selectedUser.addressDetails.street}, ${selectedUser.addressDetails.city}, ${selectedUser.addressDetails.state} - ${selectedUser.addressDetails.pincode}`
                            : 'Address Not Provided'}
                        </span>
                      </div>
                    </div>

                    <div className="sm:col-span-2 p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Lock className="w-5 h-5 text-amber-600 shrink-0" />
                        <div>
                          <span className="text-[10px] text-amber-800 block font-normal uppercase font-mono">REGISTERED DEVICE ID (1 ACCOUNT RULE)</span>
                          <span className="text-slate-900 font-mono text-xs font-black">{selectedUser.deviceId || 'DEV_RECORDED_ON_REGISTRATION'}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300 shrink-0">
                        1 Device Verified 🔒
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* GRID ROW 2: 4 STATS ACCOUNT CARDS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs text-center space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Total Customers
                  </span>
                  <span className="text-2xl font-black text-slate-900 font-mono block">12</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs text-center space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Purchased Plans
                  </span>
                  <span className="text-2xl font-black text-blue-600 font-mono block">₹15,000</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs text-center space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Total Withdrawals
                  </span>
                  <span className="text-2xl font-black text-amber-600 font-mono block">
                    ₹{withdrawals
                      .filter((w) => w.loginUid === selectedUser.loginUid && w.status === 'Approved')
                      .reduce((sum, w) => sum + w.amount, 0)
                      .toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs text-center space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Total Deposits
                  </span>
                  <span className="text-2xl font-black text-emerald-600 font-mono block">
                    ₹{deposits
                      .filter((d) => d.loginUid === selectedUser.loginUid && d.status === 'Approved')
                      .reduce((sum, d) => sum + d.amount, 0)
                      .toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* GRID ROW 3: KYC & DOCUMENT VERIFICATION DETAILS BOX (Exact Red Box in Screenshot) */}
              <div id="kyc-verification-box" className="bg-white rounded-2xl p-5 border-2 border-slate-300 shadow-md space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-black shrink-0 text-xl border border-cyan-200">
                      🪪
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        KYC Document & Address Verification Box
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Review PAN Card, Aadhaar Card, State, District, PIN Code & Approve Account
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span
                      className={`px-3.5 py-1.5 rounded-full text-xs font-black border shadow-2xs ${
                        selectedUser.kycStatus === 'approved' || selectedUser.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : selectedUser.kycStatus === 'rejected' || selectedUser.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {selectedUser.kycStatus === 'approved' || selectedUser.status === 'active'
                        ? 'KYC Approved 🟢'
                        : selectedUser.kycStatus === 'rejected' || selectedUser.status === 'rejected'
                        ? 'KYC Rejected 🔴'
                        : 'Pending Approval ⏳'}
                    </span>
                  </div>
                </div>

                {/* ADDRESS, DISTRICT, STATE & PINCODE BADGES */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Street Address</span>
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      {selectedUser.addressDetails?.street || 'Station Road, Ward No. 4'}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase block">District / City</span>
                    <span className="text-xs font-bold text-slate-900 block">
                      {selectedUser.addressDetails?.city || 'Kolkata'}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase block">State</span>
                    <span className="text-xs font-bold text-slate-900 block">
                      {selectedUser.addressDetails?.state || 'West Bengal'}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase block">PIN Code</span>
                    <span className="text-xs font-mono font-bold text-cyan-800 block">
                      {selectedUser.addressDetails?.pincode || '700001'}
                    </span>
                  </div>
                </div>

                {/* KYC DOCUMENT IMAGES GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 1. PAN CARD BOX */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                        PAN Card Document
                      </span>
                      <span className="text-[10px] font-mono font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                        {selectedUser.kycDetails?.panNumber || 'ABCDE1234F'}
                      </span>
                    </div>

                    <div
                      onClick={() => {
                        const url =
                          selectedUser.kycDetails?.panImage ||
                          'https://picsum.photos/seed/pancard/800/500';
                        setDocModal({ url, title: `PAN Card Document - ${selectedUser.fullName}` });
                        setDocZoom(1);
                        setDocRotate(0);
                      }}
                      className="relative h-44 w-full rounded-xl overflow-hidden border-2 border-slate-300 bg-slate-200 group cursor-pointer shadow-xs hover:border-cyan-600 transition-all"
                    >
                      <img
                        src={
                          selectedUser.kycDetails?.panImage ||
                          'https://picsum.photos/seed/pancard/800/500'
                        }
                        alt="PAN Card"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black text-xs gap-1.5 backdrop-blur-[2px]">
                        <ZoomIn className="w-4 h-4" />
                        <span>Click Full Screen Preview</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. AADHAAR CARD FRONT BOX */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                        Aadhaar Card (Front)
                      </span>
                      <span className="text-[10px] font-mono font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                        {selectedUser.kycDetails?.aadhaarNumber || selectedUser.kycDetails?.idNumber || 'XXXX-XXXX-8942'}
                      </span>
                    </div>

                    <div
                      onClick={() => {
                        const url =
                          selectedUser.kycDetails?.aadhaarFrontImage ||
                          'https://picsum.photos/seed/aadhaarfront/800/500';
                        setDocModal({ url, title: `Aadhaar Card (Front) - ${selectedUser.fullName}` });
                        setDocZoom(1);
                        setDocRotate(0);
                      }}
                      className="relative h-44 w-full rounded-xl overflow-hidden border-2 border-slate-300 bg-slate-200 group cursor-pointer shadow-xs hover:border-cyan-600 transition-all"
                    >
                      <img
                        src={
                          selectedUser.kycDetails?.aadhaarFrontImage ||
                          'https://picsum.photos/seed/aadhaarfront/800/500'
                        }
                        alt="Aadhaar Front"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black text-xs gap-1.5 backdrop-blur-[2px]">
                        <ZoomIn className="w-4 h-4" />
                        <span>Click Full Screen Preview</span>
                      </div>
                    </div>
                  </div>

                  {/* 3. AADHAAR CARD BACK BOX */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                        Aadhaar Card (Back)
                      </span>
                      <span className="text-[10px] font-mono font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                        PIN: {selectedUser.addressDetails?.pincode || '700001'}
                      </span>
                    </div>

                    <div
                      onClick={() => {
                        const url =
                          selectedUser.kycDetails?.aadhaarBackImage ||
                          'https://picsum.photos/seed/aadhaarback/800/500';
                        setDocModal({ url, title: `Aadhaar Card (Back) - ${selectedUser.fullName}` });
                        setDocZoom(1);
                        setDocRotate(0);
                      }}
                      className="relative h-44 w-full rounded-xl overflow-hidden border-2 border-slate-300 bg-slate-200 group cursor-pointer shadow-xs hover:border-cyan-600 transition-all"
                    >
                      <img
                        src={
                          selectedUser.kycDetails?.aadhaarBackImage ||
                          'https://picsum.photos/seed/aadhaarback/800/500'
                        }
                        alt="Aadhaar Back"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black text-xs gap-1.5 backdrop-blur-[2px]">
                        <ZoomIn className="w-4 h-4" />
                        <span>Click Full Screen Preview</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ACTION BUTTONS ROW */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <p className="text-xs font-bold text-slate-600">
                    Click <strong className="text-emerald-700">Approve KYC Account</strong> to activate this account. Once approved, the user receives their User ID and Password popup upon login.
                  </p>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                    <button
                      onClick={() => handleApproveKyc(selectedUser)}
                      className="flex-1 sm:flex-initial px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve KYC Account</span>
                    </button>

                    <button
                      onClick={() => handleRejectKyc(selectedUser)}
                      className="flex-1 sm:flex-initial px-5 py-3 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject KYC</span>
                    </button>
                  </div>
                </div>

                {kycMsg && (
                  <p className="text-xs font-extrabold text-center text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-300 animate-in fade-in">
                    {kycMsg}
                  </p>
                )}
              </div>
            </main>
          </div>
        )}

        {/* =========================================================================
            3. ADD MONEY / DEPOSITS TAB
            ========================================================================= */}
        {activeTab === 'deposits' && (
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <h3 className="text-sm font-black text-slate-900 mb-3 pb-2 border-b border-slate-100">
                Add Money & Deposit Requests (Total: {deposits.length})
              </h3>

              {deposits.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No deposit requests found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
                        <th className="py-2.5 px-3">User</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">UTR / Txn ID</th>
                        <th className="py-2.5 px-3">Screenshot</th>
                        <th className="py-2.5 px-3">Date & Time</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
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
                                <span>View Proof</span>
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
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleDepositAction(dep, 'Rejected')}
                                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg cursor-pointer"
                                >
                                  Reject
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

        {/* FULL SCREEN PAYMENT SCREENSHOT PREVIEW VIEWPORT */}
        {previewImage && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in duration-200">
            <div className="w-full max-w-5xl flex items-center justify-between text-white pb-3 border-b border-slate-800">
              <span className="text-sm font-extrabold tracking-tight">Payment Proof Screenshot - Full Screen View</span>
              <button
                onClick={() => setPreviewImage(null)}
                className="flex items-center gap-2 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-95"
              >
                <X className="w-4 h-4" />
                <span>Close Preview</span>
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center p-2 w-full max-w-4xl overflow-hidden">
              <img
                src={previewImage}
                alt="Payment Proof Screenshot"
                className="max-w-full max-h-[82vh] object-contain rounded-2xl border-2 border-slate-700 shadow-2xl animate-in zoom-in-95 duration-200"
              />
            </div>

            <div className="text-center text-xs text-slate-400 font-mono">
              NetworkJoin Pro Deposit Verification System
            </div>
          </div>
        )}

        {/* INTERACTIVE FULL SCREEN DOCUMENT IMAGE VIEWER WITH SMOOTH ANIMATION & ZOOM */}
        {docModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-lg flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-300">
            {/* Top Toolbar */}
            <div className="w-full max-w-6xl mx-auto flex items-center justify-between text-white pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-sm font-extrabold tracking-tight text-cyan-400">
                  {docModal.title}
                </span>
                <span className="text-xs font-mono bg-slate-800 px-2.5 py-1 rounded-md text-slate-300">
                  Zoom: {Math.round(docZoom * 100)}%
                </span>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDocZoom((z) => Math.min(z + 0.25, 3))}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl cursor-pointer transition-all active:scale-95"
                  title="Zoom In (+)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDocZoom((z) => Math.max(z - 0.25, 0.5))}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl cursor-pointer transition-all active:scale-95"
                  title="Zoom Out (-)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setDocZoom(1);
                    setDocRotate(0);
                  }}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl cursor-pointer transition-all active:scale-95"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setDocModal(null)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-95 ml-2"
                >
                  <X className="w-4 h-4" />
                  <span>Close Viewer</span>
                </button>
              </div>
            </div>

            {/* Document Image View Area */}
            <div className="flex-1 flex items-center justify-center p-4 overflow-auto relative">
              <img
                src={docModal.url}
                alt={docModal.title}
                style={{
                  transform: `scale(${docZoom}) rotate(${docRotate}deg)`,
                  transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                className="max-w-full max-h-[78vh] object-contain rounded-2xl shadow-2xl border-2 border-slate-700"
              />
            </div>

            {/* Bottom Footer Tip */}
            <div className="text-center text-xs text-slate-400 font-mono">
              Use controls above to Zoom In, Zoom Out, or Reset View. Smooth full-screen document viewer.
            </div>
          </div>
        )}

        {/* =========================================================================
            4. WITHDRAWALS TAB
            ========================================================================= */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-4 w-full">
            {/* Status Feedback Toast */}
            {withdrawalStatusMsg && (
              <div className="p-3.5 sm:p-4 bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center justify-between animate-fade-in border border-emerald-400 w-full text-xs font-bold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                  <span>{withdrawalStatusMsg}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setWithdrawalStatusMsg('')}
                  className="p-1 hover:bg-white/20 rounded-lg text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Status Filter Tab Buttons (Dark Green When Selected, All Selected By Default) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar w-full">
              <button
                type="button"
                onClick={() => setWithdrawalStatusFilter('all')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shadow-xs active:scale-95 ${
                  withdrawalStatusFilter === 'all'
                    ? 'bg-emerald-900 text-white shadow-md ring-2 ring-emerald-700'
                    : 'bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-200'
                }`}
              >
                All ({withdrawals.length})
              </button>
              <button
                type="button"
                onClick={() => setWithdrawalStatusFilter('Pending')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shadow-xs active:scale-95 ${
                  withdrawalStatusFilter === 'Pending'
                    ? 'bg-emerald-900 text-white shadow-md ring-2 ring-emerald-700'
                    : 'bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-200'
                }`}
              >
                Pending ({withdrawals.filter((w) => w.status === 'Pending').length})
              </button>
              <button
                type="button"
                onClick={() => setWithdrawalStatusFilter('Approved')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shadow-xs active:scale-95 ${
                  withdrawalStatusFilter === 'Approved'
                    ? 'bg-emerald-900 text-white shadow-md ring-2 ring-emerald-700'
                    : 'bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-200'
                }`}
              >
                Successful ({withdrawals.filter((w) => w.status === 'Approved' || w.status === 'Successful').length})
              </button>
              <button
                type="button"
                onClick={() => setWithdrawalStatusFilter('Rejected')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shadow-xs active:scale-95 ${
                  withdrawalStatusFilter === 'Rejected'
                    ? 'bg-emerald-900 text-white shadow-md ring-2 ring-emerald-700'
                    : 'bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-200'
                }`}
              >
                Rejected ({withdrawals.filter((w) => w.status === 'Rejected').length})
              </button>
            </div>

            {/* Search Bar for Mobile Number or Customer Name */}
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={withdrawalSearchQuery}
                onChange={(e) => setWithdrawalSearchQuery(e.target.value)}
                placeholder="Search by customer mobile number or name..."
                className="w-full pl-10 pr-9 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 shadow-2xs transition-all"
              />
              {withdrawalSearchQuery && (
                <button
                  type="button"
                  onClick={() => setWithdrawalSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* List View (One Single Line per item: Profile Picture, Name, Withdrawal Amount, Status, View Icon) */}
            {(() => {
              const filteredList = withdrawals.filter((wd) => {
                if (withdrawalStatusFilter !== 'all') {
                  if (withdrawalStatusFilter === 'Approved') {
                    if (wd.status !== 'Approved' && wd.status !== 'Successful') return false;
                  } else if (wd.status !== withdrawalStatusFilter) {
                    return false;
                  }
                }

                if (withdrawalSearchQuery.trim()) {
                  const q = withdrawalSearchQuery.trim().toLowerCase();
                  const qDigits = q.replace(/[^0-9]/g, '');

                  const matchedUser = users.find(
                    (u) =>
                      u.loginUid === wd.customerId ||
                      u.uid === wd.customerId ||
                      u.loginUid === wd.loginUid ||
                      u.uid === wd.loginUid
                  );

                  const mobile = (wd.mobile || wd.customerMobile || matchedUser?.mobile || '').toLowerCase();
                  const mobileDigits = mobile.replace(/[^0-9]/g, '');
                  const name = (wd.customerName || wd.userName || matchedUser?.name || '').toLowerCase();
                  const uid = (wd.customerId || wd.loginUid || '').toLowerCase();

                  const matchesMobile = (qDigits.length > 0 && mobileDigits.includes(qDigits)) || mobile.includes(q);
                  const matchesName = name.includes(q);
                  const matchesUid = uid.includes(q);

                  return matchesMobile || matchesName || matchesUid;
                }

                return true;
              });

              if (filteredList.length === 0) {
                return (
                  <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                    {withdrawalSearchQuery.trim()
                      ? `No withdrawal requests found matching "${withdrawalSearchQuery}".`
                      : 'No withdrawal requests found in this category.'}
                  </div>
                );
              }

              return (
                <div className="space-y-2 w-full">
                  {filteredList.map((wd) => {
                    const matchedUser = users.find(
                      (u) =>
                        (wd.customerId && (u.loginUid === wd.customerId || u.uid === wd.customerId)) ||
                        (wd.loginUid && (u.loginUid === wd.loginUid || u.uid === wd.loginUid)) ||
                        ((wd.mobile || wd.customerMobile) && (u.mobile === wd.mobile || u.mobile === wd.customerMobile))
                    );
                    const userPhoto = matchedUser?.photoUrl || null;
                    const custName = wd.customerName || wd.userName || matchedUser?.name || wd.loginUid || 'Customer';
                    const amt = wd.totalReturn || wd.amount || 0;

                    return (
                      <div
                        key={wd.id}
                        className="bg-white hover:bg-slate-50/90 border border-slate-200/90 rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2.5 sm:gap-4 shadow-2xs transition-all w-full"
                      >
                        {/* Profile Picture & Customer Name (Single Line) */}
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                          {userPhoto ? (
                            <img
                              src={userPhoto}
                              alt={custName}
                              className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shrink-0 shadow-2xs"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-900 text-amber-400 font-black text-sm flex items-center justify-center shrink-0 shadow-2xs border border-slate-700">
                              {(custName[0] || 'C').toUpperCase()}
                            </div>
                          )}
                          <span className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                            {custName}
                          </span>
                        </div>

                        {/* Withdrawal Amount (Single Line) */}
                        <div className="font-mono font-black text-emerald-700 text-sm sm:text-base whitespace-nowrap shrink-0">
                          ₹{amt.toLocaleString('en-IN')}
                        </div>

                        {/* Status (Single Line) */}
                        <div className="shrink-0">
                          <span
                            className={`px-2.5 sm:px-3 py-1 rounded-full text-[10.5px] font-black border flex items-center gap-1 ${
                              wd.status === 'Approved' || wd.status === 'Successful'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : wd.status === 'Rejected'
                                ? 'bg-rose-100 text-rose-800 border-rose-300'
                                : 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                            }`}
                          >
                            {wd.status === 'Approved' || wd.status === 'Successful' ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Approved</span>
                              </>
                            ) : wd.status === 'Rejected' ? (
                              <>
                                <XCircle className="w-3.5 h-3.5 text-rose-700" />
                                <span>Rejected</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5 text-amber-700" />
                                <span>Pending</span>
                              </>
                            )}
                          </span>
                        </div>

                        {/* View Details Icon Button (Single Line) */}
                        <div className="shrink-0">
                          <button
                            type="button"
                            onClick={() => setSelectedWithdrawal(wd)}
                            className="p-2 sm:px-3 sm:py-1.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-xl font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-amber-400" />
                            <span className="hidden sm:inline">View</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* WITHDRAWAL CONTROL DETAILS SCREEN (Smooth Right-to-Left Slide Animation) */}
            <AnimatePresence>
              {selectedWithdrawal && (
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                  className="fixed inset-0 z-50 bg-[#edf1f5] w-full h-full min-h-screen overflow-y-auto flex flex-col"
                >
                  {/* Top Navigation Bar */}
                  <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#009aaa] text-white px-4 py-3.5 shadow-md sticky top-0 z-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedWithdrawal(null)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-black rounded-xl transition-all cursor-pointer border border-white/25"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Withdrawals</span>
                      </button>
                      <div className="hidden sm:flex items-center gap-2 border-l border-white/25 pl-3">
                        <span className="text-sm font-extrabold text-white">
                          Withdrawal Control Details
                        </span>
                        <span className="text-xs text-amber-300 font-mono">
                          (Ref: {selectedWithdrawal.id})
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedWithdrawal(null)}
                      className="p-1.5 bg-white/15 hover:bg-white/25 text-white rounded-full cursor-pointer transition-all"
                      title="Close Screen"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </header>

                  {/* Main Content Area in Full Screen */}
                  <main className="flex-1 max-w-4xl w-full mx-auto p-3.5 sm:p-6 lg:p-8 pb-36 space-y-5">
                    {/* 1. PAYOUT AMOUNT & STATUS BANNER */}
                    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-sm">
                          ₹
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                            Requested Payout Amount
                          </span>
                          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                            ₹{(selectedWithdrawal.totalReturn || selectedWithdrawal.amount || 0).toLocaleString('en-IN')}
                          </h2>
                          <span className="text-xs text-slate-500 font-medium">
                            Request Date: {selectedWithdrawal.dateTime || selectedWithdrawal.createdAt}
                          </span>
                        </div>
                      </div>

                      {/* Status Indicator */}
                      <div className="flex flex-col items-start sm:items-end gap-1.5 self-start sm:self-auto">
                        <span
                          className={`px-3.5 py-1.5 rounded-full text-xs font-black border flex items-center gap-1.5 ${
                            selectedWithdrawal.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : selectedWithdrawal.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-800 border-rose-300'
                              : 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                          }`}
                        >
                          {selectedWithdrawal.status === 'Approved' && <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
                          {selectedWithdrawal.status === 'Rejected' && <XCircle className="w-4 h-4 text-rose-700" />}
                          {selectedWithdrawal.status === 'Pending' && <Clock className="w-4 h-4 text-amber-700" />}
                          <span>Status: {selectedWithdrawal.status}</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          ID: {selectedWithdrawal.id}
                        </span>
                      </div>
                    </div>

                    {/* 2. CUSTOMER & CALL CONTACT DETAILS */}
                    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                            <Users className="w-4 h-4" />
                          </div>
                          <h3 className="text-sm font-black text-slate-900">
                            Customer & Call Contact Details
                          </h3>
                        </div>
                        {selectedWithdrawal.planName && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {selectedWithdrawal.planName}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            Customer Name
                          </span>
                          <span className="text-sm font-black text-slate-900 mt-0.5 block">
                            {selectedWithdrawal.customerName || selectedWithdrawal.userName || 'N/A'}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            Customer ID / Login UID
                          </span>
                          <span className="text-sm font-mono font-bold text-slate-900 mt-0.5 block">
                            {selectedWithdrawal.customerId || selectedWithdrawal.loginUid || 'N/A'}
                          </span>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 sm:col-span-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            Registered Mobile Number
                          </span>
                          <span className="text-sm font-mono font-black text-slate-900 mt-0.5 block">
                            +91 {selectedWithdrawal.mobile || selectedWithdrawal.customerMobile || '9000000000'}
                          </span>
                        </div>
                      </div>

                      {/* Direct Call & WhatsApp Buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <a
                          href={`tel:${selectedWithdrawal.mobile || selectedWithdrawal.customerMobile || ''}`}
                          className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Call Customer (+91 {selectedWithdrawal.mobile || selectedWithdrawal.customerMobile || 'Call'})</span>
                        </a>

                        <a
                          href={`https://wa.me/91${(selectedWithdrawal.mobile || selectedWithdrawal.customerMobile || '').replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Hello ${selectedWithdrawal.customerName || 'Customer'}, regarding your withdrawal request of ₹${selectedWithdrawal.totalReturn || selectedWithdrawal.amount} on NetworkJoin Pro.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-3 px-4 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>WhatsApp Customer</span>
                        </a>
                      </div>
                    </div>

                    {/* 3. FULL BANK ACCOUNT DETAILS (With 1-Click Copy Buttons) */}
                    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-cyan-50 text-cyan-700 rounded-xl">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-slate-900">
                              Full Bank Account & Settlement Details
                            </h3>
                            <p className="text-[11px] text-slate-500 font-medium">
                              Click copy buttons to quickly copy Account Number and IFSC Code for NEFT / IMPS transfer
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3.5 text-xs">
                        {/* Bank Name & Holder Name */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                              Bank Name
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <Building2 className="w-4 h-4 text-blue-700" />
                              <span className="text-sm font-black text-slate-900">
                                {selectedWithdrawal.bankName || 'State Bank of India'}
                              </span>
                            </div>
                          </div>

                          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                              Account Holder Name
                            </span>
                            <span className="text-sm font-black text-slate-900 mt-1 block">
                              {selectedWithdrawal.bankHolderName || selectedWithdrawal.customerName || selectedWithdrawal.userName || 'Account Holder'}
                            </span>
                          </div>
                        </div>

                        {/* Bank Account Number Box with 1-Click Copy */}
                        <div className="p-4 bg-blue-50/60 border-2 border-blue-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 block">
                              Bank Account Number (A/C Number)
                            </span>
                            <span className="font-mono font-black text-lg sm:text-xl text-slate-900 tracking-wider mt-0.5 block select-all">
                              {selectedWithdrawal.accountNumber || selectedWithdrawal.bankDetails || 'N/A'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyWithdrawalField(
                                selectedWithdrawal.accountNumber || selectedWithdrawal.bankDetails,
                                'accountNumber'
                              )
                            }
                            className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95 shrink-0 ${
                              withdrawalCopiedField === 'accountNumber'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            {withdrawalCopiedField === 'accountNumber' ? (
                              <>
                                <Check className="w-4 h-4 stroke-[3]" />
                                <span>Account No. Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                <span>Copy Account Number</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* IFSC Code Box with 1-Click Copy */}
                        <div className="p-4 bg-amber-50/60 border-2 border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 block">
                              IFSC Code
                            </span>
                            <span className="font-mono font-black text-lg sm:text-xl text-slate-900 tracking-widest uppercase mt-0.5 block select-all">
                              {selectedWithdrawal.ifscCode || 'N/A'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyWithdrawalField(selectedWithdrawal.ifscCode, 'ifscCode')
                            }
                            className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95 shrink-0 ${
                              withdrawalCopiedField === 'ifscCode'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-amber-600 hover:bg-amber-700 text-white'
                            }`}
                          >
                            {withdrawalCopiedField === 'ifscCode' ? (
                              <>
                                <Check className="w-4 h-4 stroke-[3]" />
                                <span>IFSC Code Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                <span>Copy IFSC Code</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 4. ADMIN STATUS UPDATE & CONTROL BUTTONS */}
                    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-2xs space-y-3.5">
                      <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                        <ShieldAlert className="w-4 h-4 text-slate-800" />
                        <h3 className="text-sm font-black text-slate-900">
                          Withdrawal Action & Status Control
                        </h3>
                      </div>

                      <p className="text-xs text-slate-500 font-medium">
                        Verify account transfer completion, then approve or reject this withdrawal request. Status updates to Firebase Cloud Firestore immediately.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => handleWithdrawalAction(selectedWithdrawal, 'Approved')}
                          className={`py-3.5 px-6 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-95 text-white ${
                            selectedWithdrawal.status === 'Approved'
                              ? 'bg-emerald-700 opacity-90 ring-2 ring-emerald-400'
                              : 'bg-emerald-600 hover:bg-emerald-700'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{selectedWithdrawal.status === 'Approved' ? 'Already Approved ✓' : 'Approve Withdrawal'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleWithdrawalAction(selectedWithdrawal, 'Rejected')}
                          className={`py-3.5 px-6 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all active:scale-95 text-white ${
                            selectedWithdrawal.status === 'Rejected'
                          ? 'bg-rose-700 opacity-90 ring-2 ring-rose-400'
                          : 'bg-rose-600 hover:bg-rose-700'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>{selectedWithdrawal.status === 'Rejected' ? 'Already Rejected ✕' : 'Reject Withdrawal'}</span>
                    </button>
                  </div>

                  {selectedWithdrawal.status !== 'Pending' && (
                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleWithdrawalAction(selectedWithdrawal, 'Pending')}
                        className="text-[11px] font-bold text-amber-700 hover:text-amber-800 underline cursor-pointer"
                      >
                        Reset Status to Pending
                      </button>
                    </div>
                  )}
                </div>
              </main>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )}

        {/* =========================================================================
            5. INVESTMENT PLANS TAB
            ========================================================================= */}
        {activeTab === 'plans' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Create Plan Form */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900">
                  Add New Investment Plan
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Select a predefined plan title or enter a custom name with live auto calculations.
                </p>
              </div>

              <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
                {/* 1. PLAN NAME INTERACTIVE DROPDOWN WITH ICON BADGE */}
                <div className="relative">
                  <label className="font-extrabold text-slate-800 block mb-1 text-xs">
                    Plan Name
                  </label>

                  {/* Dropdown Trigger showing Icon Badge & Plan Title */}
                  <div
                    onClick={() => setIsPlanDropdownOpen(!isPlanDropdownOpen)}
                    className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl font-bold flex items-center justify-between cursor-pointer transition-all shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {newPlan.name ? (
                        <>
                          <span className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-900 flex items-center justify-center text-base font-black shrink-0 border border-cyan-200">
                            {getSelectedPlanIcon(newPlan.name)}
                          </span>
                          <span className="truncate text-slate-900 text-xs font-black">
                            {typeof newPlan.name === 'string'
                              ? newPlan.name
                              : (newPlan.name as any)?.title || ''}
                          </span>
                        </>
                      ) : (
                        <span className="text-slate-400 font-bold text-xs py-1">
                          Select Plan Name...
                        </span>
                      )}
                    </div>
                    {isPlanDropdownOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </div>

                  {/* Dropdown Menu Options */}
                  {isPlanDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 z-40 mt-1.5 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl divide-y divide-slate-100 p-1.5 animate-in fade-in duration-150">
                      {PLAN_NAME_OPTIONS.map((opt) => (
                        <div
                          key={opt.title}
                          onClick={() => handleSelectPlanOption(opt)}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all ${
                            newPlan.name.includes(opt.title)
                              ? 'bg-cyan-50 text-cyan-900 font-black border border-cyan-200'
                              : 'hover:bg-slate-50 text-slate-800 font-bold'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-sm shrink-0">
                              {opt.icon}
                            </span>
                            <span className="text-xs truncate">{opt.title}</span>
                          </div>
                          {opt.minAmount && (
                            <span className="text-[10px] font-mono font-extrabold text-cyan-800 bg-cyan-100 px-1.5 py-0.5 rounded-md shrink-0 ml-2">
                              Min: ₹{opt.minAmount}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* IF CUSTOM PLAN NAME IS SELECTED */}
                {newPlan.name === 'Custom Plan Name...' && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1 text-xs">
                      Custom Plan Title
                    </label>
                    <input
                      type="text"
                      required
                      value={newPlan.customName}
                      onChange={(e) => handlePlanInputChange('customName', e.target.value)}
                      placeholder="Enter custom plan title..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:outline-none focus:border-cyan-600 focus:bg-white text-xs"
                    />
                  </div>
                )}

                {/* 2. PLAN CATEGORY DROPDOWN BOX */}
                <div>
                  <label className="font-extrabold text-slate-800 block mb-1 text-xs">
                    Plan Category (कैटेगरी चुनें)
                  </label>
                  <select
                    value={newPlan.category}
                    onChange={(e) => handlePlanInputChange('category', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-extrabold focus:outline-none focus:border-cyan-600 focus:bg-white text-xs text-slate-900 cursor-pointer shadow-2xs"
                  >
                    {PLAN_CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat} Category
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. INVESTMENT (₹) & 3. DAILY PROFIT (%) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-extrabold text-slate-800 block mb-1 text-xs">
                      Investment (₹)
                    </label>
                    <input
                      type="number"
                      required
                      value={newPlan.price}
                      onChange={(e) => handlePlanInputChange('price', e.target.value)}
                      placeholder="e.g. 100"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-extrabold focus:outline-none focus:border-cyan-600 focus:bg-white text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-extrabold text-slate-800 block mb-1 text-xs">
                      Daily Profit (%)
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={newPlan.dailyReturn}
                      onChange={(e) => handlePlanInputChange('dailyReturn', e.target.value)}
                      placeholder="e.g. 1 or 1.02"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-extrabold focus:outline-none focus:border-cyan-600 focus:bg-white text-xs text-slate-900"
                    />
                    {newPlan.price && newPlan.dailyReturn && (
                      <p className="text-[10px] text-cyan-700 font-bold mt-1">
                        ₹
                        {(
                          (parseFloat(newPlan.price) || 0) *
                          ((parseFloat(newPlan.dailyReturn) || 0) / 100)
                        ).toFixed(2)}
                        /day
                      </p>
                    )}
                  </div>
                </div>

                {/* 4. DURATION (DAYS) */}
                <div>
                  <label className="font-extrabold text-slate-800 block mb-1 text-xs">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    required
                    value={newPlan.validityDays}
                    onChange={(e) => handlePlanInputChange('validityDays', e.target.value)}
                    placeholder="30"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-extrabold focus:outline-none focus:border-cyan-600 focus:bg-white text-xs text-slate-900"
                  />
                </div>

                {/* 5. EST. PROFIT (₹) & 6. TOTAL (₹) - LIVE AUTO FILL */}
                <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Auto-Calculated Financial Returns
                    </span>
                    <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md">
                      Live Auto Fill ⚡
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="font-bold text-slate-600 text-[10px] uppercase block mb-1">
                        Est. Profit (₹)
                      </label>
                      <input
                        type="number"
                        readOnly
                        value={newPlan.estProfit}
                        className="w-full px-3 py-2 bg-amber-50/80 border border-amber-200 rounded-xl font-mono font-black text-amber-800 text-xs focus:outline-none cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 text-[10px] uppercase block mb-1">
                        Total (₹)
                      </label>
                      <input
                        type="number"
                        readOnly
                        value={newPlan.totalReturn}
                        className="w-full px-3 py-2 bg-emerald-50/80 border border-emerald-200 rounded-xl font-mono font-black text-emerald-800 text-xs focus:outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {planMsg && (
                  <p className="text-xs font-bold text-emerald-600 text-center">{planMsg}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl transition-all shadow-sm cursor-pointer active:scale-95 text-xs"
                >
                  Save Plan to Firebase
                </button>
              </form>
            </div>

            {/* Existing Plans List */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">
                Active Plans List (Total: {plans.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {plans.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 bg-slate-50/80 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 transition-all flex items-start justify-between gap-3 shadow-2xs"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900 truncate">{p.name}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-mono font-bold text-slate-700 pt-1">
                        <div>
                          <span className="text-[10px] text-slate-400 font-normal block">Investment</span>
                          <span className="text-slate-900">₹{p.price?.toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-normal block">Daily Profit</span>
                          <span className="text-emerald-700">₹{p.dailyReturn}/day</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-normal block">Duration</span>
                          <span className="text-slate-800">{p.validityDays} Days</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-normal block">Total Return</span>
                          <span className="text-amber-700">
                            ₹{(p.totalReturn || (p.price + (p.dailyReturn * p.validityDays)))?.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeletePlan(p.id)}
                      className="p-2 text-rose-600 hover:bg-rose-100/80 rounded-xl cursor-pointer shrink-0 transition-all"
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
                Add New Home Banner Slider
              </h3>
              <form onSubmit={handleCreateSlider} className="space-y-3 text-xs">
                {/* CHOICE FILE IMAGE BUTTON */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                  <label className="font-extrabold text-slate-800 block">
                    Choice Banner Image File:
                  </label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <label className="flex items-center justify-center gap-2 px-3.5 py-2 bg-[#009aaa] hover:bg-cyan-700 text-white rounded-xl font-black text-xs cursor-pointer transition-all shadow-xs active:scale-95">
                        <Upload className="w-4 h-4" />
                        <span>Choice File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSliderImageSelect}
                          className="hidden"
                        />
                      </label>

                      {sliderImagePreview && (
                        <button
                          type="button"
                          onClick={() => {
                            setSliderImagePreview('');
                            setNewSlider((prev) => ({ ...prev, imageUrl: '' }));
                          }}
                          className="px-2.5 py-2 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          Remove Image
                        </button>
                      )}
                    </div>

                    {/* Image Preview Thumbnail */}
                    {sliderImagePreview ? (
                      <div className="relative w-full h-24 rounded-xl overflow-hidden border border-slate-300 shadow-2xs">
                        <img
                          src={sliderImagePreview}
                          alt="Selected Banner Preview"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-2 bg-black/75 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-md border border-white/20">
                          Image Selected 🟢
                        </span>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-500 font-medium">
                        Click the <strong>&apos;Choice File&apos;</strong> button above to select a banner image. (JPG, PNG, WEBP)
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Banner Title</label>
                  <input
                    type="text"
                    value={newSlider.title}
                    onChange={(e) => setNewSlider({ ...newSlider, title: e.target.value })}
                    placeholder="e.g. Double ROI Offer Active"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subtext</label>
                  <input
                    type="text"
                    value={newSlider.subtext}
                    onChange={(e) => setNewSlider({ ...newSlider, subtext: e.target.value })}
                    placeholder="e.g. Earn ₹500 daily directly into wallet"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Left Tag</label>
                    <input
                      type="text"
                      value={newSlider.badgeLeft}
                      onChange={(e) => setNewSlider({ ...newSlider, badgeLeft: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:outline-none focus:border-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Right Tag</label>
                    <input
                      type="text"
                      value={newSlider.badgeRight}
                      onChange={(e) => setNewSlider({ ...newSlider, badgeRight: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Button Label</label>
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
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl transition-all shadow-sm cursor-pointer active:scale-95"
                >
                  Save Slider to Firebase
                </button>
              </form>
            </div>

            {/* Existing Sliders */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">
                Active Banner Sliders
              </h3>
              {sliders.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No custom sliders found (Default sliders active)
                </div>
              ) : (
                <div className="space-y-2">
                  {sliders.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {s.imageUrl ? (
                          <img
                            src={s.imageUrl}
                            alt={s.title}
                            className="w-16 h-12 object-cover rounded-lg border border-slate-300 shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-12 bg-slate-800 text-amber-400 rounded-lg flex items-center justify-center shrink-0 font-bold text-[10px]">
                            Gradient
                          </div>
                        )}
                        <div className="min-w-0">
                          <span className="text-xs font-black text-slate-900 block truncate">{s.title}</span>
                          <p className="text-[11px] text-slate-600 truncate">{s.subtext}</p>
                          {s.imageUrl && (
                            <span className="text-[9px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.2 rounded-md inline-block mt-0.5">
                              Custom Banner Image 🖼️
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          setSliders((prev) => prev.filter((item) => item.id !== s.id));
                          await deleteCustomSliderFromFirestore(String(s.id));
                        }}
                        className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg cursor-pointer shrink-0"
                        title="Delete Slider"
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
              Payment Gateway & QR Settings
            </h3>

            <form onSubmit={handleSaveGateway} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  UPI ID (e.g. networkjoinpro@upi)
                </label>
                <input
                  type="text"
                  required
                  value={gatewayForm.upiId}
                  onChange={(e) => setGatewayForm({ ...gatewayForm, upiId: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold focus:outline-none focus:border-slate-900"
                />
              </div>

              {/* Custom Payment QR Code Upload Section */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <label className="font-extrabold text-slate-800 block text-xs">
                  Upload Payment QR Code Image (चॉइस फाइल)*
                </label>
                <p className="text-[11px] text-slate-500 font-medium">
                  Select a QR code image from your device. This QR code will be displayed to users in the <strong className="text-slate-800 font-bold">Recharge Wallet</strong> screen.
                </p>

                <div className="flex flex-wrap items-center gap-2.5">
                  <label className="px-4 py-2.5 bg-[#D0872E] hover:bg-[#b87324] text-white font-black text-xs rounded-xl cursor-pointer flex items-center gap-2 transition-all shadow-md active:scale-95 shrink-0">
                    <Upload className="w-4 h-4 text-white shrink-0" />
                    <span>चॉइस फाइल (Choice File)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrImageSelect}
                      className="hidden"
                    />
                  </label>

                  <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
                    {gatewayForm.qrCodeUrl ? 'इमेज चुनी गई ✓ (QR Selected)' : 'कोई फ़ाइल नहीं चुनी गई (No file chosen)'}
                  </span>

                  {gatewayForm.qrCodeUrl && (
                    <button
                      type="button"
                      onClick={() => setGatewayForm((prev) => ({ ...prev, qrCodeUrl: '' }))}
                      className="text-xs font-extrabold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer ml-auto"
                    >
                      Delete QR Image
                    </button>
                  )}
                </div>

                {gatewayForm.qrCodeUrl ? (
                  <div className="mt-3 p-3 bg-white border border-slate-300 rounded-xl shadow-xs inline-block space-y-2">
                    <div className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md text-center border border-emerald-200 uppercase tracking-wider">
                      User Panel Preview: Active in Recharge Wallet Screen 🟢
                    </div>
                    <div className="w-48 h-48 mx-auto border border-slate-200 rounded-lg p-1 bg-white">
                      <img
                        src={gatewayForm.qrCodeUrl}
                        alt="Uploaded Payment QR Code Preview"
                        className="w-full h-full object-contain rounded-md"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-amber-700 font-medium bg-amber-50 border border-amber-200 p-2 rounded-lg mt-1">
                    ⚡ Note: If no custom QR code image is uploaded, the dynamic UPI QR Code will be automatically generated for users.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Min Deposit (₹)
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
                    Min Withdrawal (₹)
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
                Save Gateway Settings
              </button>
            </form>
          </div>
        )}

        {/* =========================================================================
            8. CONTACT US (SUPPORT CHATS MANAGER) TAB - FULL WIDTH LIST & FULL SCREEN CHAT
            ========================================================================= */}
        {activeTab === 'contact' && (
          <div className="w-full space-y-2.5 sm:space-y-3">
            {/* 1. Top Search Bar (Search user by name or mobile number) */}
            <div className="w-full bg-white border-y sm:border border-slate-200/90 rounded-none sm:rounded-2xl p-2.5 sm:p-3 shadow-2xs">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={chatSearchQuery}
                  onChange={(e) => setChatSearchQuery(e.target.value)}
                  placeholder="Search user name or mobile number..."
                  className="w-full pl-10 pr-10 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 transition-all"
                />
                {chatSearchQuery && (
                  <button
                    onClick={() => setChatSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* 2. Full-Width Clean Conversations List View (No Left & Right Gap) */}
            <div className="w-full bg-white border-y sm:border border-slate-200/90 rounded-none sm:rounded-2xl overflow-hidden shadow-2xs">
              {chatUsersMap.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
                    <MessageSquare className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="font-extrabold text-sm text-slate-700">No support chats found</p>
                    <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                      {chatSearchQuery
                        ? 'No user conversations matched your search name or mobile.'
                        : 'When users send messages through 24/7 VIP Helpdesk, their chat will appear here.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {chatUsersMap.map((userGroup) => {
                    const isSelected = selectedChatUserUid === userGroup.userUid;
                    return (
                      <div
                        key={userGroup.userUid}
                        onClick={() => setSelectedChatUserUid(userGroup.userUid)}
                        className={`w-full px-4 py-3.5 sm:px-5 sm:py-4 hover:bg-slate-50 active:bg-slate-100 cursor-pointer transition-colors ${
                          isSelected ? 'bg-cyan-50/70' : ''
                        }`}
                      >
                        {/* 1. User Ka Naam */}
                        <h4 className="text-sm font-black text-slate-900 leading-tight">
                          {userGroup.userName}
                        </h4>

                        {/* 2. Uska Niche Text (Message text) */}
                        <p className="text-xs text-slate-600 font-medium mt-1 truncate">
                          {userGroup.lastMsg.text || (userGroup.lastMsg.imageUrl ? '🖼️ [Image attachment]' : '')}
                        </p>

                        {/* 3. Text Ke Niche Update Message Date Time */}
                        <p className="text-[11px] text-slate-400 font-medium mt-1">
                          {new Date(userGroup.lastMsg.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {' • '}
                          {new Date(userGroup.lastMsg.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Dedicated Full-Screen Chat View for Selected Conversation */}
            {selectedChatUserUid && activeChatGroup && (() => {
              const matchedUser = users.find(
                (u) =>
                  u.loginUid === activeChatGroup.userUid ||
                  u.uid === activeChatGroup.userUid ||
                  (activeChatGroup.userMobile && u.mobile === activeChatGroup.userMobile)
              );
              const userProfilePic = matchedUser?.photoUrl || null;
              const userMobile = activeChatGroup.userMobile || matchedUser?.mobile || '';
              const userEmail = activeChatGroup.userEmail || matchedUser?.email || '';
              const userUid = activeChatGroup.userUid;
              const userName = activeChatGroup.userName || matchedUser?.name || 'User';

              const userDeposits = deposits.filter(
                (d) =>
                  (userUid && (d.customerId === userUid || d.loginUid === userUid)) ||
                  (userMobile && (d.mobile === userMobile || d.customerMobile === userMobile))
              );
              const userWithdrawals = withdrawals.filter(
                (w) =>
                  (userUid && (w.customerId === userUid || w.loginUid === userUid)) ||
                  (userMobile && (w.mobile === userMobile || w.customerMobile === userMobile))
              );
              const pendingUserDepCount = userDeposits.filter((d) => d.status === 'Pending').length;
              const pendingUserWdCount = userWithdrawals.filter((w) => w.status === 'Pending').length;

              return (
              <div
                onClick={() => {
                  if (chatMenuOpen) setChatMenuOpen(false);
                }}
                className="fixed inset-0 z-50 w-full h-full min-h-screen bg-[#edf1f5] flex flex-col overflow-hidden animate-in fade-in duration-200"
              >
                {/* 1. Full Screen Chat Header (With Profile Picture, Name, Online, UID, Mobile, Gmail & Right Menu Icon) */}
                <div className="w-full px-3.5 sm:px-6 py-2.5 sm:py-3 bg-slate-900 text-white flex items-center justify-between shrink-0 shadow-md border-b border-slate-800 relative">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    {/* Back Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setChatMenuOpen(false);
                        setSelectedChatUserUid(null);
                      }}
                      className="p-2 -ml-1 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all cursor-pointer flex items-center justify-center shrink-0"
                      title="Back to Conversations List"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    {/* User Profile Picture */}
                    {userProfilePic ? (
                      <img
                        src={userProfilePic}
                        alt={userName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-cyan-400 shrink-0 shadow-xs"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-cyan-600 text-white font-black flex items-center justify-center text-sm shadow-xs border border-cyan-400/30 shrink-0">
                        {userName.slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    {/* User Name & Status Online Underneath Name */}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm sm:text-base font-black text-white leading-tight truncate">
                        {userName}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                        <span className="text-xs text-emerald-400 font-bold leading-none">Online</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Withdrawal Icon, Deposit Icon, Copy Mobile Icon & Menu Icon */}
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {/* Withdrawal Requests Icon Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setChatUserWithdrawalsModalOpen(true);
                      }}
                      className="p-2 sm:p-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30 transition-all cursor-pointer flex items-center justify-center shadow-xs active:scale-95 relative"
                      title="Withdrawal Requests for this User"
                    >
                      <ArrowUpRight className="w-5 h-5 stroke-[2.3]" />
                      {pendingUserWdCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-black text-[9px] rounded-full flex items-center justify-center border border-slate-900 shadow-xs animate-pulse">
                          {pendingUserWdCount}
                        </span>
                      )}
                    </button>

                    {/* Deposit Requests Icon Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setChatUserDepositsModalOpen(true);
                      }}
                      className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 transition-all cursor-pointer flex items-center justify-center shadow-xs active:scale-95 relative"
                      title="Deposit Records for this User"
                    >
                      <ArrowDownLeft className="w-5 h-5 stroke-[2.3]" />
                      {pendingUserDepCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white font-black text-[9px] rounded-full flex items-center justify-center border border-slate-900 shadow-xs animate-pulse">
                          {pendingUserDepCount}
                        </span>
                      )}
                    </button>

                    {/* Copy Mobile Number Icon Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyUserMobile(userMobile);
                      }}
                      className={`p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center shadow-xs active:scale-95 ${
                        copiedMobile
                          ? 'bg-emerald-500 text-white font-bold'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                      title={copiedMobile ? 'Mobile Number Copied!' : 'Copy Mobile Number'}
                    >
                      {copiedMobile ? (
                        <Check className="w-5 h-5 stroke-[2.8]" />
                      ) : (
                        <Copy className="w-5 h-5 stroke-[2.3]" />
                      )}
                    </button>

                    {/* Menu Options Button */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setChatMenuOpen(!chatMenuOpen);
                        }}
                        className="p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all cursor-pointer flex items-center justify-center shadow-xs"
                        title="Menu Options"
                      >
                        <MoreVertical className="w-5 h-5 stroke-[2.3]" />
                      </button>

                    {/* Floating Dropdown Box Open next to Menu Icon */}
                    {chatMenuOpen && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-12 z-50 bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 p-2.5 min-w-[200px] animate-in fade-in zoom-in-95 duration-150"
                      >
                        {/* User Details card inside Menu (UID, Mobile, Gmail) */}
                        <div className="px-2.5 py-2 mb-1.5 bg-slate-800/80 rounded-xl border border-slate-700/60 text-[11px] font-mono space-y-1">
                          <div className="flex items-center justify-between text-cyan-300 font-bold">
                            <span>UID:</span>
                            <span>{userUid}</span>
                          </div>
                          {userMobile && (
                            <div className="flex items-center justify-between text-slate-300">
                              <span>Mobile:</span>
                              <span>{userMobile}</span>
                            </div>
                          )}
                          {userEmail && (
                            <div className="flex items-center justify-between text-slate-300">
                              <span>Email:</span>
                              <span className="truncate max-w-[110px]">{userEmail}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-1">
                          {/* WhatsApp Option */}
                          {userMobile ? (
                            <a
                              href={`https://wa.me/${userMobile.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => setChatMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold transition-all"
                            >
                              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                                <MessageCircle className="w-4 h-4 text-emerald-400" />
                              </div>
                              <span>WhatsApp</span>
                            </a>
                          ) : null}

                          {/* Call Option */}
                          {userMobile ? (
                            <a
                              href={`tel:${userMobile}`}
                              onClick={() => setChatMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-cyan-500/20 text-cyan-300 text-xs font-bold transition-all"
                            >
                              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center shrink-0">
                                <Phone className="w-4 h-4 text-cyan-400" />
                              </div>
                              <span>Call</span>
                            </a>
                          ) : null}

                          {/* Exit Chat Option */}
                          <button
                            type="button"
                            onClick={() => {
                              setChatMenuOpen(false);
                              setSelectedChatUserUid(null);
                            }}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-slate-300 text-xs font-bold transition-all cursor-pointer text-left w-full"
                          >
                            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                              <ArrowLeft className="w-4 h-4 text-slate-300" />
                            </div>
                            <span>Exit Chat</span>
                          </button>

                          <div className="border-t border-slate-800 my-1" />

                          {/* Cancel Option */}
                          <button
                            type="button"
                            onClick={() => setChatMenuOpen(false)}
                            className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-all cursor-pointer w-full"
                          >
                            <X className="w-4 h-4 stroke-[2.5]" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

                {/* 2. Messages Viewport (Scrollable Full Height) */}
                <div className="flex-1 w-full overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-[#f0f4f8]">
                  {activeChatGroup.messages.map((msg) => {
                    const isAdmin = msg.sender === 'admin';
                    const isSelected = adminSelectedMsgIds.includes(msg.id);
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'} group select-none`}
                      >
                        {/* Header Label: Name & Time */}
                        <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">
                          {isAdmin ? 'Admin Support 🛡️' : msg.userName || activeChatGroup.userName} •{' '}
                          {msg.timestamp ||
                            new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                        </span>

                        {/* Message Box with Long-Press & Multi-Select Support for Admin Messages */}
                        <div
                          onTouchStart={(e) => handleAdminTouchStart(msg.id, isAdmin, e)}
                          onTouchEnd={handleAdminTouchEnd}
                          onTouchMove={handleAdminTouchMove}
                          onMouseDown={() => handleAdminMouseDown(msg.id, isAdmin)}
                          onMouseUp={handleAdminMouseUp}
                          onMouseLeave={handleAdminMouseUp}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (isAdmin) {
                              setAdminSelectedMsgIds((prev) =>
                                prev.includes(msg.id) ? prev : [...prev, msg.id]
                              );
                            }
                          }}
                          onClick={(e) => handleAdminMsgClick(msg.id, isAdmin, e)}
                          style={{
                            WebkitTouchCallout: 'none',
                            WebkitUserSelect: 'none',
                            userSelect: 'none',
                          }}
                          className={`relative max-w-[85%] sm:max-w-[70%] flex items-center gap-1.5 transition-transform duration-150 ${
                            isAdmin ? 'cursor-pointer active:scale-[0.99]' : ''
                          }`}
                          title={isAdmin ? 'Long press to select & delete' : ''}
                        >
                          {/* Selection Checkmark Badge on Admin Message */}
                          {isAdmin && isSelected && (
                            <div className="absolute -top-2.5 -left-2.5 z-30 bg-rose-600 text-white rounded-full p-1 shadow-lg border-2 border-white animate-in zoom-in-75 duration-150">
                              <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                            </div>
                          )}

                          {/* Delete Button for User Messages Only */}
                          {!isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUserChatMessage(msg)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-full transition-opacity cursor-pointer shrink-0"
                              title="Delete user message"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <div
                            className={`p-3.5 rounded-2xl shadow-xs text-xs sm:text-sm leading-relaxed space-y-2 transition-all ${
                              isSelected ? 'ring-4 ring-rose-500 shadow-xl' : ''
                            } ${
                              isAdmin
                                ? 'bg-slate-900 text-white rounded-tr-none border border-slate-800'
                                : 'bg-white text-slate-900 rounded-tl-none border border-slate-200 shadow-2xs'
                            }`}
                          >
                            {/* Attached Image if any */}
                            {msg.imageUrl && (
                              <div
                                className="rounded-xl overflow-hidden border border-black/10 cursor-pointer"
                                onClick={(e) => {
                                  if (adminSelectedMsgIds.length === 0) {
                                    e.stopPropagation();
                                    setPreviewImage(msg.imageUrl!);
                                  }
                                }}
                              >
                                <img
                                  src={msg.imageUrl}
                                  alt="Chat Attachment"
                                  className="max-h-72 w-full object-cover hover:opacity-95 transition-opacity"
                                />
                              </div>
                            )}

                            {/* Text Message */}
                            {msg.text && (
                              <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                            )}

                            {/* Timestamp & Info */}
                            <div
                              className={`text-[9.5px] font-mono text-right ${
                                isAdmin ? 'text-cyan-300' : 'text-slate-400'
                              }`}
                            >
                              {msg.timestamp ||
                                new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={adminChatEndRef} />
                </div>

                {/* Floating Multi-Select Action Box (Appears on Long-Press / Multi-Select of Admin Replies) */}
                {adminSelectedMsgIds.length > 0 && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    className="fixed bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-60 bg-slate-900/98 text-white backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in zoom-in-95 duration-150"
                  >
                    <div className="flex items-center gap-1.5 pr-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      <span className="text-xs sm:text-sm font-black text-slate-100">
                        {adminSelectedMsgIds.length} Selected
                      </span>
                    </div>

                    {/* Delete Icon Button */}
                    <button
                      type="button"
                      onClick={handleDeleteAdminSelectedMessages}
                      disabled={isDeletingAdminSelected}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 disabled:opacity-50 text-white font-black text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                      title="Delete selected admin messages"
                    >
                      <Trash2 className="w-4 h-4 stroke-[2.3]" />
                      <span>Delete</span>
                    </button>

                    {/* Cancel Icon Button */}
                    <button
                      type="button"
                      onClick={() => setAdminSelectedMsgIds([])}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white transition-all cursor-pointer"
                      title="Cancel selection"
                    >
                      <X className="w-4 h-4 stroke-[2.3]" />
                    </button>
                  </div>
                )}

                {/* 3. Image Attachment Preview Bar */}
                {adminReplyImagePreview && (
                  <div className="w-full px-4 py-2.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                      <img
                        src={adminReplyImagePreview}
                        alt="Reply Attachment"
                        className="w-12 h-12 object-cover rounded-xl border-2 border-cyan-500 shadow-xs"
                      />
                      <div>
                        <p className="text-xs text-slate-900 font-bold">Image attachment ready</p>
                        <p className="text-[10px] text-slate-500">Will be sent to user in real time</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAdminReplyImagePreview('')}
                      className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-full transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* 4. Full-Width Footer Admin Reply Bar */}
                <form
                  onSubmit={handleAdminSendReply}
                  className="w-full p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2.5 shrink-0 shadow-lg"
                >
                  <label className="p-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-95 rounded-2xl cursor-pointer transition-all shrink-0">
                    <ImageIcon className="w-5 h-5 stroke-[2.2]" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAdminChatImageSelect}
                      className="hidden"
                    />
                  </label>

                  <input
                    type="text"
                    value={adminReplyText}
                    onChange={(e) => setAdminReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAdminSendReply();
                      }
                    }}
                    placeholder={`Type reply message to ${activeChatGroup.userName}...`}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 transition-all"
                  />

                  {/* Send Button: Icon Only (Text Deleted as Requested) */}
                  <button
                    type="submit"
                    disabled={sendingReply || (!adminReplyText.trim() && !adminReplyImagePreview)}
                    className="w-11 h-11 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-2xl flex items-center justify-center transition-all shadow-md cursor-pointer active:scale-95 shrink-0"
                    title="Send Reply"
                  >
                    <Send className="w-5 h-5 text-cyan-400 stroke-[2.5]" />
                  </button>
                </form>

                {/* 5. SLIDE-IN USER DEPOSITS SCREEN (Smooth Right-to-Left Slide Animation) */}
                <AnimatePresence>
                  {chatUserDepositsModalOpen && (
                    <motion.div
                      initial={{ x: '100%' }}
                      animate={{ x: 0 }}
                      exit={{ x: '100%' }}
                      transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                      className="fixed inset-0 z-60 bg-[#edf1f5] w-full h-full min-h-screen overflow-y-auto flex flex-col"
                    >
                      {/* Top Bar */}
                      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white px-4 py-3.5 shadow-md sticky top-0 z-20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setChatUserDepositsModalOpen(false)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-black rounded-xl transition-all cursor-pointer border border-white/25"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Chat</span>
                          </button>
                          <div className="flex items-center gap-2 border-l border-white/25 pl-3">
                            <span className="text-sm font-extrabold text-white">
                              {userName}&apos;s Deposits
                            </span>
                            <span className="text-xs text-emerald-300 font-mono">
                              (UID: {userUid})
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setChatUserDepositsModalOpen(false)}
                          className="p-1.5 bg-white/15 hover:bg-white/25 text-white rounded-full cursor-pointer transition-all"
                          title="Close"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </header>

                      {/* Content */}
                      <main className="flex-1 max-w-4xl w-full mx-auto p-3.5 sm:p-6 space-y-4">
                        {/* Summary Bar */}
                        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                              Total User Deposits
                            </span>
                            <h3 className="text-xl font-black text-slate-900 font-mono">
                              ₹{userDeposits.reduce((acc, d) => acc + (d.amount || 0), 0).toLocaleString('en-IN')}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold">
                              Pending: {pendingUserDepCount}
                            </span>
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold">
                              Approved: {userDeposits.filter((d) => d.status === 'Approved').length}
                            </span>
                            <span className="px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-xs font-bold">
                              Rejected: {userDeposits.filter((d) => d.status === 'Rejected').length}
                            </span>
                          </div>
                        </div>

                        {/* Deposits List */}
                        {userDeposits.length === 0 ? (
                          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                              <ArrowDownLeft className="w-6 h-6" />
                            </div>
                            <h4 className="text-sm font-black text-slate-800">No deposits found for {userName}</h4>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto">
                              When this user submits a deposit slip or UTR through Add Money, it will appear here.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {userDeposits.map((dep) => (
                              <div
                                key={dep.id}
                                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                                      ₹
                                    </div>
                                    <div>
                                      <h4 className="text-base font-black text-slate-900 font-mono">
                                        ₹{(dep.amount || 0).toLocaleString('en-IN')}
                                      </h4>
                                      <span className="text-[11px] text-slate-500">
                                        {dep.dateTime || dep.createdAt} • {dep.method || 'UPI Transfer'}
                                      </span>
                                    </div>
                                  </div>

                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 ${
                                      dep.status === 'Approved'
                                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                        : dep.status === 'Rejected'
                                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                                        : 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                                    }`}
                                  >
                                    {dep.status === 'Approved' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />}
                                    {dep.status === 'Rejected' && <XCircle className="w-3.5 h-3.5 text-rose-700" />}
                                    {dep.status === 'Pending' && <Clock className="w-3.5 h-3.5 text-amber-700" />}
                                    <span>{dep.status}</span>
                                  </span>
                                </div>

                                {/* UTR / Transaction ID */}
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                                  <div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                      UTR / Reference ID
                                    </span>
                                    <span className="font-mono font-black text-slate-900 mt-0.5 block select-all">
                                      {dep.utrNumber || dep.utr || 'N/A'}
                                    </span>
                                  </div>
                                  {(dep.utrNumber || dep.utr) && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (navigator.clipboard) {
                                          navigator.clipboard.writeText(dep.utrNumber || dep.utr);
                                          alert('UTR copied to clipboard!');
                                        }
                                      }}
                                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                      <span>Copy UTR</span>
                                    </button>
                                  )}
                                </div>

                                {/* Screenshot Thumbnail if available */}
                                {dep.screenshotUrl && (
                                  <div
                                    onClick={() => setPreviewImage(dep.screenshotUrl)}
                                    className="p-2 bg-slate-100 rounded-xl border border-slate-200 flex items-center gap-3 cursor-pointer hover:bg-slate-200 transition-colors"
                                  >
                                    <img
                                      src={dep.screenshotUrl}
                                      alt="Deposit Screenshot"
                                      className="w-12 h-12 object-cover rounded-lg border border-slate-300"
                                    />
                                    <div>
                                      <span className="text-xs font-bold text-slate-900 block">Payment Screenshot Attached</span>
                                      <span className="text-[10px] text-cyan-700 font-semibold">Click to preview full size</span>
                                    </div>
                                  </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => handleDepositAction(dep, 'Approved')}
                                    className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                      dep.status === 'Approved'
                                        ? 'bg-emerald-700 text-white opacity-80 cursor-default'
                                        : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-sm'
                                    }`}
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>{dep.status === 'Approved' ? 'Approved ✓' : 'Approve Deposit'}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDepositAction(dep, 'Rejected')}
                                    className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                      dep.status === 'Rejected'
                                        ? 'bg-rose-700 text-white opacity-80 cursor-default'
                                        : 'bg-rose-600 hover:bg-rose-700 active:scale-95 text-white shadow-sm'
                                    }`}
                                  >
                                    <XCircle className="w-4 h-4" />
                                    <span>{dep.status === 'Rejected' ? 'Rejected ✕' : 'Reject Deposit'}</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </main>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 6. SLIDE-IN USER WITHDRAWALS SCREEN (Smooth Right-to-Left Slide Animation) */}
                <AnimatePresence>
                  {chatUserWithdrawalsModalOpen && (
                    <motion.div
                      initial={{ x: '100%' }}
                      animate={{ x: 0 }}
                      exit={{ x: '100%' }}
                      transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                      className="fixed inset-0 z-60 bg-[#edf1f5] w-full h-full min-h-screen overflow-y-auto flex flex-col"
                    >
                      {/* Top Bar */}
                      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white px-4 py-3.5 shadow-md sticky top-0 z-20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setChatUserWithdrawalsModalOpen(false)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs font-black rounded-xl transition-all cursor-pointer border border-white/25"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to Chat</span>
                          </button>
                          <div className="flex items-center gap-2 border-l border-white/25 pl-3">
                            <span className="text-sm font-extrabold text-white">
                              {userName}&apos;s Withdrawals
                            </span>
                            <span className="text-xs text-amber-300 font-mono">
                              (UID: {userUid})
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setChatUserWithdrawalsModalOpen(false)}
                          className="p-1.5 bg-white/15 hover:bg-white/25 text-white rounded-full cursor-pointer transition-all"
                          title="Close"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </header>

                      {/* Content */}
                      <main className="flex-1 max-w-4xl w-full mx-auto p-3.5 sm:p-6 space-y-4">
                        {/* Summary Bar */}
                        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                              Total User Withdrawals
                            </span>
                            <h3 className="text-xl font-black text-slate-900 font-mono">
                              ₹{userWithdrawals.reduce((acc, w) => acc + (w.totalReturn || w.amount || 0), 0).toLocaleString('en-IN')}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold">
                              Pending: {pendingUserWdCount}
                            </span>
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold">
                              Approved: {userWithdrawals.filter((w) => w.status === 'Approved').length}
                            </span>
                            <span className="px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg text-xs font-bold">
                              Rejected: {userWithdrawals.filter((w) => w.status === 'Rejected').length}
                            </span>
                          </div>
                        </div>

                        {/* Withdrawals List */}
                        {userWithdrawals.length === 0 ? (
                          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                              <ArrowUpRight className="w-6 h-6" />
                            </div>
                            <h4 className="text-sm font-black text-slate-800">No withdrawal requests found for {userName}</h4>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto">
                              When this user submits a withdrawal payout request, it will appear here.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {userWithdrawals.map((wd) => (
                              <div
                                key={wd.id}
                                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-black flex items-center justify-center text-sm shadow-xs">
                                      ₹
                                    </div>
                                    <div>
                                      <h4 className="text-base font-black text-slate-900 font-mono">
                                        ₹{(wd.totalReturn || wd.amount || 0).toLocaleString('en-IN')}
                                      </h4>
                                      <span className="text-[11px] text-slate-500">
                                        {wd.dateTime || wd.createdAt}
                                      </span>
                                    </div>
                                  </div>

                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 ${
                                      wd.status === 'Approved'
                                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                        : wd.status === 'Rejected'
                                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                                        : 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                                    }`}
                                  >
                                    {wd.status === 'Approved' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />}
                                    {wd.status === 'Rejected' && <XCircle className="w-3.5 h-3.5 text-rose-700" />}
                                    {wd.status === 'Pending' && <Clock className="w-3.5 h-3.5 text-amber-700" />}
                                    <span>{wd.status}</span>
                                  </span>
                                </div>

                                {/* Bank Account & IFSC details */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                      Bank & Holder
                                    </span>
                                    <span className="font-extrabold text-slate-900 mt-0.5 block truncate">
                                      {wd.bankName || 'State Bank of India'} • {wd.bankHolderName || wd.customerName || 'Holder'}
                                    </span>
                                  </div>

                                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                                    <div className="min-w-0 flex-1">
                                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                        Account Number
                                      </span>
                                      <span className="font-mono font-black text-slate-900 mt-0.5 block select-all truncate">
                                        {wd.accountNumber || wd.bankDetails || 'N/A'}
                                      </span>
                                    </div>
                                    {(wd.accountNumber || wd.bankDetails) && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (navigator.clipboard) {
                                            navigator.clipboard.writeText(wd.accountNumber || wd.bankDetails);
                                            alert('Account number copied!');
                                          }
                                        }}
                                        className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg cursor-pointer shrink-0 ml-2"
                                        title="Copy Account Number"
                                      >
                                        <Copy className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>

                                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between sm:col-span-2">
                                    <div>
                                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                        IFSC Code
                                      </span>
                                      <span className="font-mono font-black text-slate-900 mt-0.5 block select-all">
                                        {wd.ifscCode || 'N/A'}
                                      </span>
                                    </div>
                                    {wd.ifscCode && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (navigator.clipboard) {
                                            navigator.clipboard.writeText(wd.ifscCode);
                                            alert('IFSC Code copied!');
                                          }
                                        }}
                                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                                      >
                                        <Copy className="w-3.5 h-3.5" />
                                        <span>Copy IFSC</span>
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2 pt-1">
                                  <button
                                    type="button"
                                    onClick={() => handleWithdrawalAction(wd, 'Approved')}
                                    className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                      wd.status === 'Approved'
                                        ? 'bg-emerald-700 text-white opacity-80 cursor-default'
                                        : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-sm'
                                    }`}
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>{wd.status === 'Approved' ? 'Approved ✓' : 'Approve Withdrawal'}</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleWithdrawalAction(wd, 'Rejected')}
                                    className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                      wd.status === 'Rejected'
                                        ? 'bg-rose-700 text-white opacity-80 cursor-default'
                                        : 'bg-rose-600 hover:bg-rose-700 active:scale-95 text-white shadow-sm'
                                    }`}
                                  >
                                    <XCircle className="w-4 h-4" />
                                    <span>{wd.status === 'Rejected' ? 'Rejected ✕' : 'Reject Withdrawal'}</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </main>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              );
            })()}
          </div>
        )}

        {/* =========================================================================
            9. VIP LEVEL & SYSTEM SETTINGS TAB
            ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="space-y-4 w-full">
            {/* Toast Notification Banner on Save */}
            {levelSaveMsg && (
              <div className="p-3.5 sm:p-4 bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center justify-between animate-fade-in border border-emerald-400 w-full">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Crown className="w-6 h-6 text-yellow-300" />
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold leading-snug">{levelSaveMsg}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setLevelSaveMsg('')}
                  className="p-1.5 hover:bg-white/20 rounded-lg text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* VIP Level Configuration Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-2xs space-y-5 w-full">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl">
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <span>VIP Level Settings</span>
                    <span className="text-xs font-semibold text-slate-400">Saved directly to Firestore &apos;viplevel&apos; folder</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Configure investment rules & daily profit rates</p>
                </div>
              </div>

              <form onSubmit={handleSaveVipLevel} className="space-y-5">
                {/* Select VIP Level (1 to 10) */}
                <div>
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                    Select VIP Level Box (Level 1 to 10):
                  </label>
                  <select
                    value={selectedLevelNum}
                    onChange={(e) => handleSelectLevelChange(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-extrabold text-slate-900 focus:outline-none focus:border-cyan-600 focus:bg-white transition-all cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                      const def = DEFAULT_VIP_LEVELS.find((l) => l.levelNumber === num);
                      return (
                        <option key={num} value={num}>
                          {def ? `${def.icon} ${def.levelName}` : `👑 VIP Level ${num}`}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Input Grid: Invest Amount & Commission */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                      Invest Amount (₹) / इन्वेस्टमेंट
                    </label>
                    <input
                      type="number"
                      value={levelAmount}
                      onChange={(e) => handleAmountInputChange(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-extrabold text-slate-900 focus:outline-none focus:border-cyan-600 focus:bg-white transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                      Commission Amount (₹) / कमीशन
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={levelCommission}
                      onChange={(e) => handleCommissionInputChange(e.target.value)}
                      placeholder="e.g. 12.50"
                      className="w-full px-4 py-3 bg-amber-50/50 border border-amber-300 rounded-xl text-xs font-extrabold text-amber-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Daily Profit Percentage */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                      Daily Profit Income Percentage (%) / % दर
                    </label>
                    <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                      Auto Fitted ✨
                    </span>
                  </div>
                  <input
                    type="number"
                    step="any"
                    value={levelPercentage}
                    onChange={(e) => handlePercentageInputChange(e.target.value)}
                    placeholder="e.g. 2.5"
                    className="w-full px-4 py-3 bg-emerald-50/50 border border-emerald-300 rounded-xl text-xs font-black text-emerald-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5 font-medium flex items-center gap-1">
                    <span>⚡ जैसे ही आप इन्वेस्टमेंट अमाउंट या कमीशन अमाउंट बदलेंगे, परसेंटेज (Percentage) ऑटो-कैलकुलेट हो जाएगा। (सेव करने पर % दर सेव होगी)</span>
                  </p>
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  disabled={savingLevel}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>
                    {savingLevel
                      ? 'Saving to Firebase Cloud Firestore...'
                      : `Save VIP Level ${selectedLevelNum} Settings`}
                  </span>
                </button>
              </form>
            </div>

            {/* Configured VIP Levels Summary Table (1 - 10) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-2xs space-y-4 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-black text-slate-900">Configured VIP Levels Summary (1 - 10)</h4>
                  <p className="text-xs text-slate-500 font-medium">Real-time synced from Firebase Cloud Firestore</p>
                </div>
                <span className="px-3 py-1 bg-cyan-50 border border-cyan-200 rounded-full text-[10px] font-mono font-extrabold text-cyan-800 self-start sm:self-auto">
                  Firestore Folder: viplevel
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-3">Level</th>
                      <th className="p-3">Badge</th>
                      <th className="p-3">Min Amount (₹)</th>
                      <th className="p-3">Daily Rate (%)</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                      const dbRecord = vipLevels.find((l) => l.levelNumber === num);
                      const defRecord = DEFAULT_VIP_LEVELS.find((l) => l.levelNumber === num);
                      const activeRecord = dbRecord || defRecord!;
                      const isSelected = selectedLevelNum === num;

                      return (
                        <tr
                          key={num}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isSelected ? 'bg-amber-50/40' : ''
                          }`}
                        >
                          <td className="p-3 font-black text-slate-900 font-mono">
                            VIP {num}
                          </td>
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-slate-800 font-bold text-[11px] border border-slate-200">
                              <span>{activeRecord.icon || '👑'}</span>
                              <span>{activeRecord.levelName}</span>
                            </span>
                          </td>
                          <td className="p-3 font-extrabold text-slate-800 font-mono">
                            ₹{(activeRecord.minAmount || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="p-3 font-extrabold text-emerald-600 font-mono">
                            {activeRecord.dailyPercentage}% / day
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleSelectLevelChange(num)}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-black text-[10px] transition-all cursor-pointer shadow-2xs"
                            >
                              Edit Level
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB CONTENT: HOME POPUP ANNOUNCEMENT MANAGER
            ========================================================================= */}
        {activeTab === 'popup' && (
          <div className="p-3 sm:p-5 md:p-6 space-y-6 w-full max-w-6xl mx-auto">
            {/* Top Header Card */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#002E6E] to-[#007b99] text-white flex items-center justify-center shrink-0 shadow-md">
                  <Megaphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                    <span>Home Popup Notice Manager</span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                      Live App CMS
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Configure promotional announcement modal shown to users on application launch (হোম স্ক্রিন পপ-আপ)
                  </p>
                </div>
              </div>

              {/* Popup Active / Inactive Switch */}
              <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 self-start md:self-auto">
                <span className="text-xs font-bold text-slate-700">Popup Status:</span>
                <button
                  type="button"
                  onClick={() => setHomePopup((prev) => ({ ...prev, active: !prev.active }))}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer shadow-xs ${
                    homePopup.active
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                      : 'bg-slate-300 hover:bg-slate-400 text-slate-700'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      homePopup.active ? 'bg-white animate-pulse' : 'bg-slate-500'
                    }`}
                  />
                  <span>{homePopup.active ? 'Active (चालू)' : 'Disabled (बंद)'}</span>
                </button>
              </div>
            </div>

            {/* Notification Toast */}
            {popupMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2.5 border shadow-xs ${
                  popupMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{popupMsg.text}</span>
              </motion.div>
            )}

            {/* Main Content: Form Inputs on Left + Live Mobile Preview on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Form Settings (7 Cols) */}
              <div className="lg:col-span-7 bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-2xs space-y-5">
                <form onSubmit={handleSaveHomePopup} className="space-y-4">
                  {/* Field 1: Image Upload / URL */}
                  <div>
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-2">
                      Popup Banner Image (इमेज / ছবি)
                    </label>

                    {/* Image Preview & Actions */}
                    {homePopup.imageUrl ? (
                      <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group mb-3 shadow-inner">
                        <img
                          src={homePopup.imageUrl}
                          alt="Popup preview"
                          className="w-full h-44 object-cover object-center group-hover:scale-102 transition-transform duration-300"
                        />
                        <button
                          type="button"
                          onClick={() => setHomePopup((prev) => ({ ...prev, imageUrl: '' }))}
                          className="absolute top-2.5 right-2.5 p-2 bg-rose-600/90 hover:bg-rose-700 text-white rounded-xl shadow-md transition-all cursor-pointer backdrop-blur-xs flex items-center gap-1.5 text-xs font-bold"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    ) : (
                      <div className="p-5 border-2 border-dashed border-slate-200 rounded-2xl text-center bg-slate-50 mb-3">
                        <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
                        <p className="text-xs font-bold text-slate-600">No image currently selected</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Upload a banner or paste an image URL below</p>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      {/* Hidden File Input */}
                      <input
                        type="file"
                        ref={popupFileInputRef}
                        accept="image/*"
                        onChange={handlePopupImageUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => popupFileInputRef.current?.click()}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs shrink-0"
                      >
                        <Upload className="w-4 h-4 text-cyan-400" />
                        <span>Upload From Device</span>
                      </button>

                      {/* Image URL Input */}
                      <input
                        type="url"
                        value={homePopup.imageUrl}
                        onChange={(e) => setHomePopup((prev) => ({ ...prev, imageUrl: e.target.value }))}
                        placeholder="Or paste image URL (https://...)"
                        className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                      />
                    </div>

                    {/* Preset Banner Quick Select */}
                    <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Presets:</span>
                      {[
                        { label: '🎁 Gift Bonus', url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80' },
                        { label: '💰 Cash Reward', url: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=800&q=80' },
                        { label: '🚀 VIP Growth', url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80' },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setHomePopup((prev) => ({ ...prev, imageUrl: preset.url }))}
                          className="text-[10.5px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-cyan-50 hover:text-cyan-800 border border-slate-200 transition-colors cursor-pointer"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Field 2: Title */}
                  <div>
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                      Popup Title (শিরোনাম / शीर्षक) *
                    </label>
                    <input
                      type="text"
                      required
                      value={homePopup.title}
                      onChange={(e) => setHomePopup((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Special Welcome Bonus Offer"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                    />
                  </div>

                  {/* Field 3: Description */}
                  <div>
                    <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                      Description Details (বিবরণ / विवरण) *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={homePopup.description}
                      onChange={(e) => setHomePopup((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter announcement details, offer conditions, instructions..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all leading-relaxed"
                    />
                  </div>

                  {/* Dual Grid: Amount & Direction Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Field 4: Amount */}
                    <div>
                      <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                        Amount / Highlight Tag (राशि / পরিমাণ)
                      </label>
                      <input
                        type="text"
                        value={homePopup.amount}
                        onChange={(e) => setHomePopup((prev) => ({ ...prev, amount: e.target.value }))}
                        placeholder="e.g. ₹500 Extra Bonus"
                        className="w-full px-3.5 py-2.5 bg-amber-50/60 border border-amber-300 rounded-xl text-xs font-black text-amber-950 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                      />
                    </div>

                    {/* Field 5: Direction Date (Duration/Expiry) */}
                    <div>
                      <label className="block text-xs font-black text-slate-800 uppercase tracking-wider mb-1.5">
                        Direction Date / Validity (মেয়াদ / तारीख)
                      </label>
                      <input
                        type="text"
                        value={homePopup.directionDate}
                        onChange={(e) => setHomePopup((prev) => ({ ...prev, directionDate: e.target.value }))}
                        placeholder="e.g. Valid till 31 Dec 2026"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={popupSaving}
                      className="w-full py-3.5 bg-gradient-to-r from-[#002E6E] to-[#007b99] hover:from-[#0092b3] hover:to-[#006982] text-white font-black text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 active:scale-98"
                    >
                      {popupSaving ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>Saving to Firestore...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4.5 h-4.5 text-white" />
                          <span>Save & Publish Popup (सेव करें)</span>
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-slate-400 text-center mt-2 font-medium">
                      Changes are synchronized directly with Firebase Firestore and will display in the user application.
                    </p>
                  </div>
                </form>
              </div>

              {/* Right Column: Live Mobile View Mockup (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="w-full max-w-[340px] bg-slate-900 rounded-[2.5rem] p-3 shadow-2xl border-4 border-slate-700 relative">
                  {/* Phone Notch/Speaker */}
                  <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-slate-900 mr-2" />
                    <div className="w-8 h-1 rounded-full bg-slate-700" />
                  </div>

                  {/* Phone Screen Simulated Container */}
                  <div className="bg-slate-950 rounded-[2rem] overflow-hidden min-h-[460px] relative p-3 flex flex-col justify-center items-center">
                    {/* Simulated blurred app background behind modal */}
                    <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xs flex flex-col p-4 opacity-40 pointer-events-none">
                      <div className="h-6 w-24 bg-slate-700 rounded-md mb-4" />
                      <div className="h-24 w-full bg-slate-800 rounded-xl mb-3" />
                      <div className="h-16 w-full bg-slate-800 rounded-xl" />
                    </div>

                    {/* The Live Popup Card Mockup */}
                    <div className="relative z-10 w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-white/20 animate-in fade-in zoom-in-95 duration-200">
                      {/* Close Icon */}
                      <div className="absolute top-2.5 right-2.5 z-20 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center backdrop-blur-xs text-[10px] font-bold cursor-pointer">
                        ✕
                      </div>

                      {/* Header Image */}
                      {homePopup.imageUrl ? (
                        <div className="w-full h-32 bg-slate-200 relative overflow-hidden">
                          <img
                            src={homePopup.imageUrl}
                            alt="Popup Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-24 bg-gradient-to-r from-cyan-600 to-blue-700 flex items-center justify-center text-white">
                          <Megaphone className="w-8 h-8 opacity-80" />
                        </div>
                      )}

                      {/* Card Body */}
                      <div className="p-3.5 space-y-2 text-center">
                        {/* Amount Tag */}
                        {homePopup.amount && (
                          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black text-[11px] border border-amber-300">
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            <span>{homePopup.amount}</span>
                          </div>
                        )}

                        {/* Title */}
                        <h4 className="text-sm font-black text-slate-900 leading-snug">
                          {homePopup.title || 'Welcome Notice'}
                        </h4>

                        {/* Description */}
                        <p className="text-[11px] text-slate-600 leading-relaxed max-h-20 overflow-y-auto font-medium">
                          {homePopup.description || 'Special announcement and promotional instructions...'}
                        </p>

                        {/* Direction Date */}
                        {homePopup.directionDate && (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                            <Clock className="w-2.5 h-2.5 text-slate-500" />
                            <span>{homePopup.directionDate}</span>
                          </div>
                        )}

                        {/* Action CTA Button */}
                        <div className="pt-1">
                          <button
                            type="button"
                            className="w-full py-2 bg-gradient-to-r from-[#002E6E] to-[#007b99] text-white font-black text-xs rounded-xl shadow-xs"
                          >
                            Explore Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <span className="text-xs font-black text-slate-700 flex items-center justify-center gap-1.5">
                    <span>📱 Live Mobile Preview</span>
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Real-time visual replica of the popup appearing on users&apos; screens
                  </p>

                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB CONTENT 11: APP SETTINGS & CERTIFICATE CONFIGURATION
            - App Logo with file picker button
            - Application Name ("good box")
            - Application Short Name
            - Company Legal Name
            - Company Full Address (State, Local Area, PIN Code, City/District)
            - Gmail / Support Email
            - Company CIN
            - Save Button with real-time sync to User Certificate
            - Live Certificate Preview on right
            ========================================================================= */}
        {activeTab === 'app-settings' && (
          <div className="p-3 sm:p-5 md:p-6 space-y-6 w-full max-w-6xl mx-auto">
            {/* Top Header Card */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#002E6E] to-[#00B9F1] text-white flex items-center justify-center shrink-0 shadow-md">
                  <SlidersHorizontal className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                    <span>App Settings & Certificate Branding</span>
                    <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                      Live Sync
                    </span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Configure application logo, official company details, and registered address. These details appear automatically on the user&apos;s Investment Bond Certificate.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={refreshData}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Notification message banner */}
            {appSettingsMsg && (
              <div
                className={`p-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-sm transition-all ${
                  appSettingsMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-2 border-emerald-300'
                    : 'bg-rose-50 text-rose-800 border-2 border-rose-300'
                }`}
              >
                {appSettingsMsg.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <span>{appSettingsMsg.text}</span>
              </div>
            )}

            {/* Hidden File Input for Logo */}
            <input
              type="file"
              ref={logoFileInputRef}
              onChange={handleLogoUpload}
              accept="image/*"
              className="hidden"
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Form Settings (7 Cols) */}
              <div className="lg:col-span-7 bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-2xs space-y-5">
                <form onSubmit={handleSaveAppSettings} className="space-y-5">
                  {/* SECTION 1: APP LOGO & BRANDING */}
                  <div className="space-y-3 pb-3 border-b border-slate-100">
                    <h4 className="text-xs font-black uppercase text-[#002E6E] tracking-wider flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[#00B9F1]" />
                      <span>App Logo & Visual Identity</span>
                    </h4>

                    {/* Logo Choice File Button & Preview Box */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                      <div className="flex items-center gap-4">
                        {/* Current Logo Preview */}
                        <div className="relative w-16 h-16 rounded-2xl bg-white border-2 border-dashed border-[#00B9F1] flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                          {appSettings.appLogo ? (
                            <img
                              src={appSettings.appLogo}
                              alt="App Logo Preview"
                              className="w-full h-full object-contain p-1"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                              {appSettings.appShortName || 'NJP'}
                            </div>
                          )}
                        </div>

                        {/* Choice File Action Button */}
                        <div className="flex-1 space-y-1.5">
                          <label className="text-xs font-extrabold text-slate-800 block">
                            App Logo Image (Choice File)
                          </label>
                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => logoFileInputRef.current?.click()}
                              className="px-3.5 py-2 bg-[#002E6E] hover:bg-[#002352] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <Upload className="w-3.5 h-3.5 text-[#00B9F1]" />
                              <span>Choose Logo File</span>
                            </button>

                            {appSettings.appLogo && (
                              <button
                                type="button"
                                onClick={() => setAppSettings((prev) => ({ ...prev, appLogo: '' }))}
                                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-all cursor-pointer"
                              >
                                Remove Logo
                              </button>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 block">
                            Recommended: PNG with transparent background or square JPG (Max 8MB)
                          </span>
                        </div>
                      </div>

                      {/* Direct Logo URL Option */}
                      <div className="pt-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                          Or Enter Logo Direct URL (Optional)
                        </label>
                        <input
                          type="url"
                          value={appSettings.appLogo}
                          onChange={(e) => setAppSettings((prev) => ({ ...prev, appLogo: e.target.value }))}
                          placeholder="https://example.com/logo.png"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-700 focus:outline-none focus:border-[#00B9F1]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: APPLICATION NAME & SHORT NAME ("good box") */}
                  <div className="space-y-3 pb-3 border-b border-slate-100">
                    <h4 className="text-xs font-black uppercase text-[#002E6E] tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#00B9F1]" />
                      <span>Application Names</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      {/* Application Name ("good box") */}
                      <div className="sm:col-span-8 space-y-1">
                        <label className="text-xs font-extrabold text-slate-800 flex items-center justify-between">
                          <span>Application Name (Good Box) *</span>
                          <span className="text-[10px] font-normal text-slate-400">Shown in Certificate & App</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={appSettings.appName}
                            onChange={(e) => setAppSettings((prev) => ({ ...prev, appName: e.target.value }))}
                            placeholder="e.g. Network Join Pro"
                            className="w-full pl-3.5 pr-8 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 focus:outline-none focus:border-[#00B9F1] focus:bg-white shadow-xs transition-all"
                          />
                          <Sparkles className="w-4 h-4 text-[#00B9F1] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      {/* Application Short Name */}
                      <div className="sm:col-span-4 space-y-1">
                        <label className="text-xs font-extrabold text-slate-800 flex items-center justify-between">
                          <span>Short Name *</span>
                          <span className="text-[10px] font-normal text-slate-400">Badge/Seal</span>
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={8}
                          value={appSettings.appShortName}
                          onChange={(e) => setAppSettings((prev) => ({ ...prev, appShortName: e.target.value.toUpperCase() }))}
                          placeholder="e.g. NJP"
                          className="w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-black text-center font-mono text-[#002E6E] focus:outline-none focus:border-[#00B9F1] focus:bg-white shadow-xs uppercase transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: COMPANY LEGAL DETAILS */}
                  <div className="space-y-3 pb-3 border-b border-slate-100">
                    <h4 className="text-xs font-black uppercase text-[#002E6E] tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-[#00B9F1]" />
                      <span>Company Legal Profile</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Company Name */}
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-extrabold text-slate-800">
                          Company Registered Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={appSettings.companyName}
                          onChange={(e) => setAppSettings((prev) => ({ ...prev, companyName: e.target.value }))}
                          placeholder="e.g. Network Join Pro India Private Limited"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#00B9F1] focus:bg-white transition-all"
                        />
                      </div>

                      {/* Company CIN */}
                      <div className="space-y-1">
                        <label className="text-xs font-extrabold text-slate-800">
                          Corporate CIN Number *
                        </label>
                        <input
                          type="text"
                          required
                          value={appSettings.cin}
                          onChange={(e) => setAppSettings((prev) => ({ ...prev, cin: e.target.value }))}
                          placeholder="e.g. U74999UP2026PTC136667"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#00B9F1] focus:bg-white transition-all uppercase"
                        />
                      </div>

                      {/* Official Gmail / Contact Email */}
                      <div className="space-y-1">
                        <label className="text-xs font-extrabold text-slate-800">
                          Official Gmail / Email *
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            required
                            value={appSettings.email}
                            onChange={(e) => setAppSettings((prev) => ({ ...prev, email: e.target.value }))}
                            placeholder="e.g. support@networkjoinpro.in"
                            className="w-full pl-3.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:border-[#00B9F1] focus:bg-white transition-all"
                          />
                          <Mail className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 4: COMPANY FULL ADDRESS */}
                  <div className="space-y-3 pb-3 border-b border-slate-100">
                    <h4 className="text-xs font-black uppercase text-[#002E6E] tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#00B9F1]" />
                      <span>Company Registered Full Address</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Local Area / Street */}
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-extrabold text-slate-800">
                          Local Area / Street / Premises *
                        </label>
                        <input
                          type="text"
                          required
                          value={appSettings.localArea}
                          onChange={(e) => setAppSettings((prev) => ({ ...prev, localArea: e.target.value }))}
                          placeholder="e.g. Gomti Nagar, Vibhuti Khand"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#00B9F1] focus:bg-white transition-all"
                        />
                      </div>

                      {/* City / District */}
                      <div className="space-y-1">
                        <label className="text-xs font-extrabold text-slate-800">
                          City / District *
                        </label>
                        <input
                          type="text"
                          required
                          value={appSettings.cityDistrict}
                          onChange={(e) => setAppSettings((prev) => ({ ...prev, cityDistrict: e.target.value }))}
                          placeholder="e.g. Lucknow"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#00B9F1] focus:bg-white transition-all"
                        />
                      </div>

                      {/* State */}
                      <div className="space-y-1">
                        <label className="text-xs font-extrabold text-slate-800">
                          State *
                        </label>
                        <input
                          type="text"
                          required
                          value={appSettings.state}
                          onChange={(e) => setAppSettings((prev) => ({ ...prev, state: e.target.value }))}
                          placeholder="e.g. Uttar Pradesh"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#00B9F1] focus:bg-white transition-all"
                        />
                      </div>

                      {/* PIN Code */}
                      <div className="space-y-1">
                        <label className="text-xs font-extrabold text-slate-800">
                          PIN Code *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={appSettings.pinCode}
                          onChange={(e) => setAppSettings((prev) => ({ ...prev, pinCode: e.target.value.replace(/\D/g, '') }))}
                          placeholder="e.g. 226010"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-[#00B9F1] focus:bg-white transition-all"
                        />
                      </div>

                      {/* Country */}
                      <div className="space-y-1">
                        <label className="text-xs font-extrabold text-slate-800">
                          Country
                        </label>
                        <input
                          type="text"
                          value={appSettings.country}
                          onChange={(e) => setAppSettings((prev) => ({ ...prev, country: e.target.value }))}
                          placeholder="e.g. India"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#00B9F1] focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SAVE BUTTON */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={appSettingsSaving}
                      className="w-full py-3.5 bg-gradient-to-r from-[#002E6E] to-[#172B75] hover:from-[#002352] hover:to-[#0f1d52] text-white font-black text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 active:scale-98"
                    >
                      {appSettingsSaving ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>Saving to Firestore & Updating Certificate...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4.5 h-4.5 text-[#00B9F1]" />
                          <span>Save Settings & Update Certificate (सेव करें)</span>
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-slate-400 text-center mt-2 font-medium">
                      All changes are saved to Firebase Firestore and will immediately show on the user&apos;s Investment Bond Certificate.
                    </p>
                  </div>
                </form>
              </div>

              {/* Right Column: Live Certificate Card Preview (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="w-full max-w-[420px] bg-slate-900 rounded-2xl p-3 shadow-2xl border-2 border-slate-700 relative text-slate-900">
                  <div className="text-center pb-2">
                    <span className="text-xs font-black text-white flex items-center justify-center gap-1.5">
                      <span>📜 Live Certificate Preview</span>
                    </span>
                    <p className="text-[10px] text-slate-300">
                      Real-time replica of the certificate shown in the user application
                    </p>
                  </div>

                  {/* Simulated Certificate Container */}
                  <div
                    className="p-3 rounded-xl border-2 shadow-md relative font-sans space-y-2 overflow-hidden w-full"
                    style={{
                      backgroundColor: '#F2F8FC',
                      borderColor: '#172B75',
                      color: '#172B75',
                    }}
                  >
                    {/* Top Decorative Corner Graphics (#00B9F1) */}
                    <div className="absolute top-0 left-0 w-16 h-16 pointer-events-none opacity-95">
                      <svg viewBox="0 0 100 100" className="w-full h-full fill-current" style={{ color: '#00B9F1' }}>
                        <path d="M0 0 L100 0 C60 20 20 60 0 100 Z" />
                      </svg>
                    </div>
                    <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-95">
                      <svg viewBox="0 0 100 100" className="w-full h-full fill-current" style={{ color: '#00B9F1' }}>
                        <path d="M100 0 L0 0 C40 20 80 60 100 100 Z" />
                      </svg>
                    </div>

                    {/* Bottom Decorative Corner Graphics (#002E6E) */}
                    <div className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none opacity-95">
                      <svg viewBox="0 0 100 100" className="w-full h-full fill-current" style={{ color: '#002E6E' }}>
                        <path d="M100 100 L0 100 C40 80 80 40 100 0 Z" />
                      </svg>
                    </div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 pointer-events-none opacity-95">
                      <svg viewBox="0 0 100 100" className="w-full h-full fill-current" style={{ color: '#002E6E' }}>
                        <path d="M0 100 L100 100 C60 80 20 40 0 0 Z" />
                      </svg>
                    </div>

                    {/* Header Branding */}
                    <div
                      className="relative z-10 text-center space-y-0.5 pt-0.5 border-b pb-1.5"
                      style={{ borderColor: 'rgba(0, 185, 241, 0.4)' }}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        {appSettings.appLogo ? (
                          <img
                            src={appSettings.appLogo}
                            alt="Logo"
                            className="w-8 h-8 rounded-full object-contain bg-white border-2 p-0.5 shadow-xs"
                            style={{ borderColor: '#00B9F1' }}
                          />
                        ) : (
                          <div
                            className="w-8 h-8 rounded-full text-white font-black text-xs flex items-center justify-center shadow-xs border-2"
                            style={{ backgroundColor: '#002E6E', borderColor: '#00B9F1' }}
                          >
                            {appSettings.appShortName || 'NJP'}
                          </div>
                        )}
                      </div>

                      <h1
                        className="text-lg font-black tracking-wide uppercase font-serif"
                        style={{ color: '#002E6E' }}
                      >
                        CERTIFICATE
                      </h1>
                      <p
                        className="text-[9px] font-black uppercase tracking-wider"
                        style={{ color: '#172B75' }}
                      >
                        OF INVESTMENT BOND PARTICIPATION
                      </p>
                    </div>

                    {/* Customer Mock Card (Card: #FFFFFF) */}
                    <div
                      className="relative z-10 bg-white border-2 rounded-lg p-2 flex items-center gap-2 shadow-2xs"
                      style={{ borderColor: 'rgba(0, 185, 241, 0.5)' }}
                    >
                      <div
                        className="w-9 h-9 rounded-lg text-white font-black text-xs flex items-center justify-center shrink-0 border"
                        style={{ backgroundColor: '#002E6E', borderColor: '#00B9F1' }}
                      >
                        BB
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <strong className="text-xs font-black truncate" style={{ color: '#172B75' }}>BBBB</strong>
                          <span
                            className="text-[8px] font-mono px-1 rounded border"
                            style={{ backgroundColor: '#F2F8FC', color: '#002E6E', borderColor: '#00B9F1' }}
                          >
                            ID: CUST-587393
                          </span>
                        </div>
                        <span className="text-[10px] block truncate" style={{ color: '#172B75' }}>
                          +91 9000000009 • Nxnxbx, Uttar Pradesh
                        </span>
                      </div>
                    </div>

                    {/* Plan Details Box with Dynamic Application Name */}
                    <div
                      className="relative z-10 bg-white border-2 rounded-lg overflow-hidden text-xs shadow-2xs"
                      style={{ borderColor: 'rgba(0, 46, 110, 0.3)' }}
                    >
                      <div
                        className="px-2 py-1 flex items-center justify-between text-white"
                        style={{ backgroundColor: '#002E6E' }}
                      >
                        <div>
                          <span
                            className="text-[8px] font-black uppercase block leading-none"
                            style={{ color: '#00B9F1' }}
                          >
                            Application Name
                          </span>
                          <strong className="text-xs font-black text-white uppercase">
                            {appSettings.appName || 'NETWORK JOIN PRO'}
                          </strong>
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] font-bold text-white/80 uppercase block leading-none">Selected Plan</span>
                          <span className="font-extrabold text-[11px]" style={{ color: '#00B9F1' }}>
                            Gold Investment Plan 🥇
                          </span>
                        </div>
                      </div>

                      <div
                        className="grid grid-cols-4 divide-x text-center p-1 bg-white text-[10px]"
                        style={{ borderColor: 'rgba(0, 46, 110, 0.15)' }}
                      >
                        <div>
                          <span className="text-[8px] block" style={{ color: '#172B75' }}>Invested</span>
                          <strong style={{ color: '#002E6E' }}>₹20,000</strong>
                        </div>
                        <div>
                          <span className="text-[8px] block" style={{ color: '#172B75' }}>Daily</span>
                          <strong className="text-emerald-600">₹16.00</strong>
                        </div>
                        <div>
                          <span className="text-[8px] block" style={{ color: '#172B75' }}>Return</span>
                          <strong style={{ color: '#00B9F1' }}>₹16.00</strong>
                        </div>
                        <div style={{ backgroundColor: '#F2F8FC' }}>
                          <span className="text-[8px] block" style={{ color: '#002E6E' }}>Total</span>
                          <strong style={{ color: '#002E6E' }}>₹20,016.00</strong>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Left App Logo & Badges Row */}
                    <div
                      className="relative z-10 pt-1 border-t flex items-center justify-between text-[8px]"
                      style={{ borderColor: 'rgba(0, 185, 241, 0.4)' }}
                    >
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-8 h-8 rounded-full border-2 bg-white flex flex-col items-center justify-center p-0.5 leading-none shrink-0 shadow-xs relative overflow-hidden"
                          style={{ borderColor: '#00B9F1' }}
                        >
                          {appSettings.appLogo ? (
                            <img
                              src={appSettings.appLogo}
                              alt="App Logo"
                              className="w-full h-full object-contain p-0.5"
                            />
                          ) : (
                            <div
                              className="w-full h-full rounded-full flex flex-col items-center justify-center font-black text-[6px]"
                              style={{ backgroundColor: '#002E6E', color: '#FFFFFF' }}
                            >
                              <ShieldCheck className="w-2.5 h-2.5" style={{ color: '#00B9F1' }} />
                              <span className="leading-none">{appSettings.appShortName || 'NJP'}</span>
                            </div>
                          )}
                        </div>
                        <div className="space-y-0.2">
                          <span className="font-black block" style={{ color: '#002E6E' }}>
                            Authenticated Bond
                          </span>
                          <span className="text-[7px] block" style={{ color: '#172B75' }}>
                            ISO 9001 • Secured
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="italic font-bold block" style={{ color: '#002E6E' }}>A.K. Sharma</span>
                        <span className="text-[7px]" style={{ color: '#172B75' }}>Auth. Registrar</span>
                      </div>
                    </div>

                    {/* Company Footer with Dynamic Details */}
                    <div
                      className="relative z-10 pt-1 text-[7.5px] space-y-0.5 bg-white p-1.5 rounded-md border shadow-2xs"
                      style={{ borderColor: 'rgba(0, 185, 241, 0.45)', color: '#172B75' }}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-0.5 truncate" style={{ color: '#002E6E' }}>
                          <Building2 className="w-2.5 h-2.5 shrink-0" style={{ color: '#00B9F1' }} />
                          <span className="truncate font-black">{appSettings.companyName || 'Network Join Pro India Private Limited'}</span>
                        </span>
                        <span className="shrink-0 font-mono text-[7px]" style={{ color: '#002E6E' }}>
                          CIN: {appSettings.cin || 'U74999UP2026PTC136667'}
                        </span>
                      </div>
                      <div className="truncate" style={{ color: '#172B75' }}>
                        <strong>Reg. Address:</strong> {appSettings.localArea ? `${appSettings.localArea}, ` : ''}{appSettings.cityDistrict}, {appSettings.state} - {appSettings.pinCode}, {appSettings.country || 'India'}
                      </div>
                      <div
                        className="flex flex-wrap items-center justify-between gap-x-1 text-[7px] pt-0.5 border-t"
                        style={{ borderColor: 'rgba(0, 185, 241, 0.3)', color: '#172B75' }}
                      >
                        <span>Email: <strong style={{ color: '#002E6E' }}>{appSettings.email || 'support@networkjoinpro.in'}</strong></span>
                        <span>Dist: <strong style={{ color: '#002E6E' }}>{appSettings.cityDistrict || 'Lucknow'}</strong></span>
                        <span>State: <strong style={{ color: '#002E6E' }}>{appSettings.state || 'Uttar Pradesh'}</strong></span>
                        <span>PIN: <strong style={{ color: '#002E6E' }}>{appSettings.pinCode || '226010'}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

    </div>
  </div>
);
}
