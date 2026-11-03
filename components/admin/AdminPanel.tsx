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
} from 'lucide-react';
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
  UserAccountData,
  DepositRecord,
  WithdrawalRecord,
  GatewaySettings,
  SupportChatMessage,
  VipLevelRecord,
  db,
} from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { INITIAL_PLANS } from '@/data/initialData';

export default function AdminPanel() {
  // Sidebar tab: 'dashboard' | 'users' | 'plans' | 'sliders' | 'gateway' | 'withdrawals' | 'deposits' | 'contact' | 'settings'
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
  >('dashboard');

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
  const [adminReplyText, setAdminReplyText] = useState<string>('');
  const [adminReplyImagePreview, setAdminReplyImagePreview] = useState<string>('');
  const [sendingReply, setSendingReply] = useState<boolean>(false);

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

  // Group chat messages by User UID
  const chatUsersMap = React.useMemo(() => {
    const map: Record<
      string,
      {
        userUid: string;
        userName: string;
        userEmail: string;
        userMobile: string;
        messages: SupportChatMessage[];
        lastMsg: SupportChatMessage;
      }
    > = {};

    chatMessages.forEach((msg) => {
      const uid = msg.userUid;
      if (!map[uid]) {
        map[uid] = {
          userUid: uid,
          userName: msg.userName || 'User ' + uid,
          userEmail: msg.userEmail || '',
          userMobile: msg.userMobile || '',
          messages: [],
          lastMsg: msg,
        };
      }
      map[uid].messages.push(msg);
      if (msg.createdAt >= map[uid].lastMsg.createdAt) {
        map[uid].lastMsg = msg;
      }
    });

    return Object.values(map).sort((a, b) => b.lastMsg.createdAt - a.lastMsg.createdAt);
  }, [chatMessages]);

  const activeChatGroup = React.useMemo(() => {
    if (!selectedChatUserUid) return null;
    return chatUsersMap.find((g) => g.userUid === selectedChatUserUid) || null;
  }, [chatUsersMap, selectedChatUserUid]);

  // Handle Admin Sending Reply
  const handleAdminSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedChatUserUid || sendingReply) return;
    if (!adminReplyText.trim() && !adminReplyImagePreview) return;

    const group = activeChatGroup;
    const msgObj: SupportChatMessage = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userUid: selectedChatUserUid,
      userName: group?.userName || 'User ' + selectedChatUserUid,
      userEmail: group?.userEmail || '',
      userMobile: group?.userMobile || '',
      sender: 'admin',
      text: adminReplyText.trim(),
      imageUrl: adminReplyImagePreview || undefined,
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

  // Delete User Chat Message (Only user messages can be deleted by admin per requirement)
  const handleDeleteUserChatMessage = async (msg: SupportChatMessage) => {
    if (msg.sender === 'admin') {
      alert('Admin messages cannot be deleted.');
      return;
    }
    if (confirm('Are you sure you want to delete this user message?')) {
      setChatMessages((prev) => prev.filter((m) => m.id !== msg.id));
      await deleteChatMessageFromFirestore(msg.id);
    }
  };



  // Load all Firebase data
  const refreshData = async () => {
    setLoading(true);
    try {
      const [u, d, w, g, p, s, lvl] = await Promise.all([
        getAllUsersFromFirestore(),
        getAllDepositsFromFirestore(),
        getAllWithdrawalsFromFirestore(),
        getGatewaySettingsFromFirestore(),
        getCustomPlansFromFirestore(),
        getCustomSlidersFromFirestore(),
        getAllVipLevelsFromFirestore(),
      ]);

      setUsers(u);
      setDeposits(d);
      setWithdrawals(w);
      setGateway(g);
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
        if (!snap.empty) {
          const loaded: VipLevelRecord[] = [];
          snap.forEach((docSnap) => {
            const data = docSnap.data() as VipLevelRecord;
            if (data && data.levelNumber) {
              loaded.push(data);
            }
          });
          setVipLevels(loaded.sort((a, b) => a.levelNumber - b.levelNumber));
        }
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
    <div className="min-h-screen bg-[#edf1f5] text-slate-800 font-sans flex flex-col antialiased selection:bg-cyan-500 selection:text-white">
      {/* =========================================================================
          1. TOP CYAN HEADER BAR (Matching FAB ADMIN Design + Sidebar Toggle)
          ========================================================================= */}
      <header className="bg-[#009aaa] text-white px-3 sm:px-4 py-2.5 flex items-center justify-between shadow-md z-30 shrink-0">
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
                                ? 'bg-[#00a8cc] text-white shadow-md font-extrabold'
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
                                    isActive ? 'bg-white text-[#00a8cc]' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
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
                                ? 'bg-[#00a8cc] text-white shadow-md font-extrabold'
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
                                    isActive ? 'bg-white text-[#00a8cc]' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
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
                                ? 'bg-[#00a8cc] text-white shadow-md font-extrabold'
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
                                    isActive ? 'bg-white text-[#00a8cc]' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
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
                  {activeTab === 'contact' && 'Support Chats (Contact Us)'}
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
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <h3 className="text-sm font-black text-slate-900 mb-3 pb-2 border-b border-slate-100">
                Withdrawal Requests (Total: {withdrawals.length})
              </h3>

              {withdrawals.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No withdrawal requests found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
                        <th className="py-2.5 px-3">User</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Bank / UPI Details</th>
                        <th className="py-2.5 px-3">Date & Time</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
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
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleWithdrawalAction(wd, 'Rejected')}
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
            8. CONTACT US (SUPPORT CHATS MANAGER) TAB
            ========================================================================= */}
        {activeTab === 'contact' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-140px)] min-h-[500px]">
            {/* Left: User Chat Conversations List (4 Cols) */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-2xs">
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-extrabold text-sm">User Conversations ({chatUsersMap.length})</h3>
                </div>
                <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 px-2 py-0.5 rounded-full">
                  Realtime Sync 🟢
                </span>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {chatUsersMap.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                    <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="font-semibold">No support chats received yet.</p>
                    <p className="text-[11px] text-slate-400">When users message 24/7 support, their real-time chats will appear here.</p>
                  </div>
                ) : (
                  chatUsersMap.map((userGroup) => {
                    const isSelected = selectedChatUserUid === userGroup.userUid;
                    return (
                      <div
                        key={userGroup.userUid}
                        onClick={() => setSelectedChatUserUid(userGroup.userUid)}
                        className={`p-3.5 flex items-start gap-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-cyan-50/80 border-l-4 border-cyan-500'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-slate-800 text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                          {userGroup.userName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-black text-slate-900 truncate">{userGroup.userName}</h4>
                            <span className="text-[10px] text-slate-400 font-mono shrink-0">
                              {new Date(userGroup.lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium truncate">
                            {userGroup.lastMsg.sender === 'admin' ? 'You: ' : ''}
                            {userGroup.lastMsg.text || '🖼️ Image attachment'}
                          </p>
                          <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                            <span>UID: {userGroup.userUid}</span>
                            {userGroup.userMobile && <span className="font-mono">{userGroup.userMobile}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right: Active Chat Conversation Screen (8 Cols) */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-2xs">
              {activeChatGroup ? (
                <>
                  {/* Chat Top Bar */}
                  <div className="p-3.5 bg-slate-800 text-white flex items-center justify-between border-b border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-cyan-600 text-white font-extrabold flex items-center justify-center text-xs shadow-xs">
                        {activeChatGroup.userName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white">{activeChatGroup.userName}</h4>
                        <p className="text-[10px] text-slate-300 font-mono flex items-center gap-2">
                          <span>UID: {activeChatGroup.userUid}</span>
                          {activeChatGroup.userEmail && <span>• {activeChatGroup.userEmail}</span>}
                          {activeChatGroup.userMobile && <span>• {activeChatGroup.userMobile}</span>}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages Viewport */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8fafc]">
                    {activeChatGroup.messages.map((msg) => {
                      const isAdmin = msg.sender === 'admin';
                      return (
                        <div
                          key={msg.id}
                          className={`flex items-start gap-2 ${isAdmin ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isAdmin && (
                            <div className="w-7 h-7 rounded-full bg-slate-700 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-1">
                              U
                            </div>
                          )}

                          <div
                            className={`max-w-[75%] rounded-2xl p-3 shadow-2xs space-y-1.5 relative group ${
                              isAdmin
                                ? 'bg-cyan-600 text-white rounded-tr-none'
                                : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 text-[10px] opacity-80 border-b border-white/10 pb-1">
                              <span className="font-extrabold">
                                {isAdmin ? 'Admin Support 🛡️' : msg.userName || 'User'}
                              </span>
                              <span className="font-mono">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            {msg.imageUrl && (
                              <div className="rounded-xl overflow-hidden border border-black/10 cursor-pointer" onClick={() => setPreviewImage(msg.imageUrl!)}>
                                <img src={msg.imageUrl} alt="Chat Attachment" className="max-h-60 w-full object-cover" />
                              </div>
                            )}

                            {msg.text && <p className="text-xs font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>}

                            {/* Delete Button for User Messages Only */}
                            {!isAdmin && (
                              <button
                                type="button"
                                onClick={() => handleDeleteUserChatMessage(msg)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-2 -right-2 p-1 bg-rose-600 text-white rounded-full shadow-md hover:bg-rose-700 cursor-pointer"
                                title="Delete user message"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          {isAdmin && (
                            <div className="w-7 h-7 rounded-full bg-cyan-700 text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-1">
                              AD
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Image Attachment Preview in Reply Bar */}
                  {adminReplyImagePreview && (
                    <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={adminReplyImagePreview} alt="Reply Attachment" className="w-12 h-12 object-cover rounded-lg border border-slate-300" />
                        <span className="text-xs font-bold text-slate-700">Image attached</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAdminReplyImagePreview('')}
                        className="p-1 text-rose-600 hover:bg-rose-100 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Admin Reply Bar */}
                  <form onSubmit={handleAdminSendReply} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                    <label className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl cursor-pointer transition-all shrink-0">
                      <ImageIcon className="w-5 h-5" />
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
                      placeholder="Type admin reply message..."
                      className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-slate-800"
                    />

                    <button
                      type="submit"
                      disabled={sendingReply || (!adminReplyText.trim() && !adminReplyImagePreview)}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-black text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95 shrink-0"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-700">Select a User Conversation</h4>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">
                      Choose a user from the left sidebar to view their messages, images, and send real-time admin replies.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            9. VIP LEVEL & SYSTEM SETTINGS TAB
            ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-5xl">
            {/* Toast Notification Banner on Save */}
            {levelSaveMsg && (
              <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg flex items-center justify-between animate-fade-in border border-emerald-400">
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
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
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
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
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

            {/* System Status Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-700">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Admin System Settings & Connection</h3>
                    <p className="text-xs text-slate-500 font-medium">Firebase Cloud Firestore Connection Vitals</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold text-emerald-800 bg-emerald-100 border border-emerald-300">
                  System Active 🟢
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="font-extrabold text-slate-900 text-sm block">🔥 Firebase Cloud Firestore</span>
                  <p className="text-slate-600 font-medium">
                    Real-time synchronized database connection online and operational.
                  </p>
                  <span className="inline-block text-[10px] font-mono bg-slate-800 text-cyan-300 px-2.5 py-1 rounded-md">
                    DB: ai-studio-networkjoinproin
                  </span>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <span className="font-extrabold text-slate-900 text-sm block">🛡️ Security & Role Controls</span>
                  <p className="text-slate-600 font-medium">
                    Superadmin permissions active with full data access and control.
                  </p>
                  <span className="inline-block text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md border border-emerald-200">
                    Superuser Verified ✓
                  </span>
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
