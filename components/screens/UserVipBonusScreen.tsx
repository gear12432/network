'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VipBonus, UserStats, Transaction } from '@/types/investment';
import {
  getVipBonusesFromFirestore,
  saveVipBonusToFirestore,
  deleteVipBonusFromFirestore,
  updateUserEarningsInFirestore,
  saveVipBonusClaimTransaction,
  db,
} from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { triggerConfetti } from '@/lib/confetti';

interface UserVipBonusScreenProps {
  stats: UserStats;
  onClose?: () => void;
  onBonusClaimed?: (amount: number, tx: Transaction) => void;
}

export default function UserVipBonusScreen({
  stats,
  onClose,
  onBonusClaimed,
}: UserVipBonusScreenProps) {
  const [bonuses, setBonuses] = useState<VipBonus[]>([]);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackBanner({ type, text });
    setTimeout(() => {
      setFeedbackBanner(null);
    }, 3500);
  };

  const userVipLevel = stats.vipLevel && stats.vipLevel > 0 ? stats.vipLevel : 1;
  const userInvested = stats.totalCustomerInvested ?? 0;
  const userId = stats.loginUid || 'GK35648';

  // Helper to evaluate and auto-delete expired bonuses (7 days for weekly, 30 days for monthly, or past validityDate)
  const processAndCleanBonuses = useCallback(
    async (rawList: VipBonus[]) => {
      const now = Date.now();
      const validBonuses: VipBonus[] = [];

      for (const b of rawList) {
        const durationDays = b.durationDays || (b.category === 'week' ? 7 : 30);
        const durationMs = durationDays * 24 * 60 * 60 * 1000;

        // 1. Check Admin validityDate (if set and in the past)
        let isDateExpired = false;
        if (b.validityDate) {
          const expDate = new Date(b.validityDate);
          expDate.setHours(23, 59, 59, 999);
          if (!isNaN(expDate.getTime()) && now > expDate.getTime()) {
            isDateExpired = true;
          }
        }

        // 2. Check 7-day (Weekly) or 30-day (Monthly) creation/unlock auto-expiry window
        let isWindowExpired = false;
        const userRec = b.userProgress?.[userId];
        if (userRec?.expiresAt) {
          const expTime = new Date(userRec.expiresAt).getTime();
          if (!isNaN(expTime) && now > expTime) {
            isWindowExpired = true;
          }
        } else if (b.createdAt) {
          const createdTime = new Date(b.createdAt).getTime();
          if (!isNaN(createdTime) && now > createdTime + durationMs) {
            isWindowExpired = true;
          }
        }

        // If expired after 7 days (or past validity date), auto-delete from Firestore & hide from screen
        if (isDateExpired || isWindowExpired) {
          deleteVipBonusFromFirestore(b.id).catch(() => {});
          continue;
        }

        // If user meets minimum investment requirement and doesn't have an unlock timestamp yet, stamp 7-day / 30-day timer
        const meetsInvestment = userInvested >= (b.minInvestAmount || 0);
        const meetsVip = userVipLevel >= (b.vipLevel || 1);

        if (meetsInvestment && meetsVip && !userRec?.unlockedAt) {
          const unlockedAt = new Date(now).toISOString();
          const expiresAt = new Date(now + durationMs).toISOString();
          const updatedBonus: VipBonus = {
            ...b,
            userProgress: {
              ...(b.userProgress || {}),
              [userId]: {
                unlockedAt,
                expiresAt,
              },
            },
          };
          saveVipBonusToFirestore(updatedBonus).catch(() => {});
          validBonuses.push(updatedBonus);
        } else {
          validBonuses.push(b);
        }
      }

      setBonuses(validBonuses);
    },
    [userId, userInvested, userVipLevel]
  );

  // Load and subscribe to real-time VIP Bonuses from Firestore
  useEffect(() => {
    getVipBonusesFromFirestore().then((loaded) => {
      processAndCleanBonuses(loaded || []);
    });

    try {
      const ref = collection(db, 'vip_bonuses');
      const unsub = onSnapshot(
        ref,
        (snap) => {
          const list: VipBonus[] = [];
          snap.forEach((d) => {
            list.push({ ...(d.data() as VipBonus), id: d.id });
          });
          processAndCleanBonuses(list);
        },
        () => {}
      );
      return () => unsub();
    } catch {
      // ignore offline
    }
  }, [processAndCleanBonuses]);

  // Support Android/browser Escape or Back key
  useEffect(() => {
    if (typeof window === 'undefined' || !onClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Filter bonuses that match user eligibility:
  // User's customer investment >= bonus.minInvestAmount AND user's VIP Level >= bonus.vipLevel
  const eligibleBonuses = bonuses.filter((b) => {
    const reqInvest = Number(b.minInvestAmount) || 0;
    const reqVip = Number(b.vipLevel) || 1;
    return userInvested >= reqInvest && userVipLevel >= reqVip;
  });

  // Helper to calculate remaining days in 7-day / 30-day validity window
  const getRemainingDaysText = (bonus: VipBonus): string => {
    const now = Date.now();
    const durationDays = bonus.durationDays || (bonus.category === 'week' ? 7 : 30);
    const userExp = bonus.userProgress?.[userId]?.expiresAt;
    let targetMs = 0;

    if (userExp) {
      targetMs = new Date(userExp).getTime();
    } else if (bonus.createdAt) {
      targetMs = new Date(bonus.createdAt).getTime() + durationDays * 24 * 60 * 60 * 1000;
    } else if (bonus.validityDate) {
      const d = new Date(bonus.validityDate);
      d.setHours(23, 59, 59, 999);
      targetMs = d.getTime();
    }

    if (!targetMs || isNaN(targetMs)) {
      return `${durationDays}d validity`;
    }

    const diffMs = Math.max(0, targetMs - now);
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? `${daysLeft}d left` : 'Expiring today';
  };

  const handleClaimBonus = async (bonus: VipBonus, e: React.MouseEvent) => {
    e.stopPropagation();
    if (claimingId) return;

    const isMonthly = bonus.category === 'month' || bonus.category === 'vipLevelOffer';
    const title =
      bonus.category === 'vipLevelOffer'
        ? `VIP ${bonus.vipLevel} Bonus`
        : isMonthly
        ? 'Monthly Bonus'
        : 'Weekly Bonus';

    // 1. Check duplicate claim
    const alreadyClaimedByUser =
      (bonus.claimedBy || []).includes(userId) ||
      Boolean(bonus.userProgress?.[userId]?.claimedAt);

    if (alreadyClaimedByUser) {
      showFeedback('error', `${title} (₹${bonus.bonusAmount}) is already claimed!`);
      return;
    }

    // 2. Check VIP Level requirement
    if (bonus.vipLevel && userVipLevel < bonus.vipLevel) {
      showFeedback('error', `Requires VIP ${bonus.vipLevel} to claim this ${title}!`);
      return;
    }

    // 3. Check minimum customer investment requirement
    if (bonus.minInvestAmount && userInvested < bonus.minInvestAmount) {
      showFeedback(
        'error',
        `Invest ₹${bonus.minInvestAmount.toLocaleString('en-IN')} in customer plans to unlock!`
      );
      return;
    }

    setClaimingId(bonus.id);

    try {
      const creditAmount = Number(bonus.bonusAmount) || 0;
      const newBalance = (stats.walletBalance || 0) + creditAmount;
      const newTotalEarned = (stats.totalEarned || 0) + creditAmount;

      // 1. Credit User Wallet Balance in Firestore
      await updateUserEarningsInFirestore(userId, {
        balance: newBalance,
        totalEarned: newTotalEarned,
      });

      // 2. Mark bonus as claimed by this user (and keep 7-day / 30-day expiry timer running so it auto-deletes after 7 days)
      const nowIso = new Date().toISOString();
      const durationDays = bonus.durationDays || (bonus.category === 'week' ? 7 : 30);
      const existingProgress = bonus.userProgress?.[userId];
      const expiresAt =
        existingProgress?.expiresAt ||
        new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

      const updatedClaimedBy = Array.from(new Set([...(bonus.claimedBy || []), userId]));
      const updatedBonus: VipBonus = {
        ...bonus,
        claimedBy: updatedClaimedBy,
        userProgress: {
          ...(bonus.userProgress || {}),
          [userId]: {
            unlockedAt: existingProgress?.unlockedAt || nowIso,
            expiresAt,
            claimedAt: nowIso,
          },
        },
      };
      await saveVipBonusToFirestore(updatedBonus);

      // 3. Save claim transaction record in Firestore
      const txId = `VIP_CLAIM_${Date.now()}`;
      await saveVipBonusClaimTransaction({
        id: txId,
        loginUid: userId,
        userName: stats.userName || 'VIP Member',
        vipLevel: userVipLevel,
        bonusId: bonus.id,
        bonusTitle: title,
        category: bonus.category,
        amount: creditAmount,
        claimedAt: nowIso,
      });

      const newTx: Transaction = {
        id: txId,
        type: 'roi_credit',
        title: `VIP ${userVipLevel} ${title} Claimed`,
        amount: creditAmount,
        timestamp: 'Just now',
        status: 'completed',
        referenceId: `VIPB${Math.floor(100000 + Math.random() * 900000)}`,
        paidBy: 'NetworkJoin VIP Bonus Pool',
        debitedFrom: 'VIP Reward Vault',
        creditedTo: 'Wallet Balance',
        receiverName: stats.userName || 'Account Holder',
      };

      onBonusClaimed?.(creditAmount, newTx);

      // Update local state so Claim button immediately blurs and disables
      setBonuses((prev) =>
        prev.map((item) => (item.id === bonus.id ? updatedBonus : item))
      );

      triggerConfetti();
      showFeedback('success', `₹${creditAmount} ${title} credited to your wallet!`);
    } catch {
      showFeedback('error', 'Could not process claim right now. Please try again.');
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      className="fixed inset-0 z-50 w-full h-full overflow-hidden select-none flex flex-col items-center justify-center bg-[#002E6E]/90 backdrop-blur-xs font-sans"
    >
      {/* Toast / Status Message Floating Pill */}
      <AnimatePresence>
        {feedbackBanner && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.92 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full text-xs sm:text-sm font-black shadow-xl border backdrop-blur-md flex items-center gap-2 whitespace-nowrap ${
              feedbackBanner.type === 'success'
                ? 'bg-[#002E6E] text-[#00FF00] border-[#00B9F1]'
                : 'bg-[#172B75] text-[#FFC928] border-[#FFC928]/60'
            }`}
          >
            <span>{feedbackBanner.type === 'success' ? '✓' : '!'}</span>
            <span>{feedbackBanner.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Responsive Frame: Full-screen on Mobile, Centered Premium Card Frame on Desktop */}
      <div className="relative w-full h-full sm:h-[94vh] max-w-md sm:max-w-lg mx-auto sm:rounded-[38px] sm:border-4 sm:border-[#00B9F1]/60 sm:shadow-[0_20px_60px_rgba(0,0,0,0.55)] flex flex-col justify-between pt-2.5 sm:pt-3.5 overflow-hidden bg-gradient-to-b from-[#00C8FF] via-[#00B9F1] to-[#002E6E]">
        {/* Inner Light-Blue & White Main Body Sheet */}
        <div
          className="relative flex-1 w-full rounded-t-[34px] border-t-2 border-x border-white/90 flex flex-col justify-between overflow-hidden shadow-[0_-6px_25px_rgba(0,185,241,0.35)]"
          style={{
            background:
              'radial-gradient(circle at 50% 32%, #FFFFFF 0%, #F4FAFF 52%, #DDF0FF 100%)',
          }}
        >
          {/* Top Section: Back Icon + Screen Name "VIP Bonus" + VIP Level Badge + Cyan Decorative Ornament */}
          <div className="w-full pt-3.5 sm:pt-4 px-4 flex flex-col items-center shrink-0 relative">
            {/* Top Bar with Back Button (Top-Left as marked in screenshot) & Screen Title "VIP Bonus" */}
            <div className="w-full flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white active:scale-95 border-2 border-[#91CFFF] text-[#002E6E] shadow-xs transition-all cursor-pointer"
                title="Back to Home"
                aria-label="Back to Home"
              >
                <ArrowLeft className="w-4.5 h-4.5 stroke-[2.8] text-[#002E6E]" />
                <span className="text-xs sm:text-sm font-black tracking-tight text-[#002E6E]">
                  VIP Bonus
                </span>
              </button>

              <div className="text-[11px] sm:text-xs font-extrabold text-[#172B75] bg-white/80 border border-[#91CFFF] px-3 py-1 rounded-full shadow-2xs">
                Invested: ₹{userInvested.toLocaleString('en-IN')}
              </div>
            </div>

            {/* 2. TOP VIP LEVEL BADGE */}
            <div className="relative mt-0.5">
              <div
                className="px-7 sm:px-8 py-2 sm:py-2.5 rounded-full border-[3px] border-[#FFC928] flex items-center justify-center gap-3 shadow-[0_6px_16px_rgba(184,121,8,0.45),inset_0_2px_4px_rgba(255,255,255,0.75)]"
                style={{
                  background:
                    'linear-gradient(180deg, #F5B118 0%, #C67D05 48%, #9A5B00 100%)',
                }}
              >
                {/* Glossy Top Highlight */}
                <div className="absolute inset-x-3 top-1 h-2.5 rounded-full bg-gradient-to-b from-white/55 to-transparent pointer-events-none" />

                {/* 3D Golden Crown SVG */}
                <svg
                  viewBox="0 0 64 52"
                  className="w-7 h-6 sm:w-8 sm:h-7 drop-shadow-[0_2px_3px_rgba(0,0,0,0.45)] shrink-0"
                >
                  <defs>
                    <linearGradient id="vipCrownGold" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FFF394" />
                      <stop offset="45%" stopColor="#FFC928" />
                      <stop offset="100%" stopColor="#C87A00" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M8 40 L4 14 L20 26 L32 8 L44 26 L60 14 L56 40 Z"
                    fill="url(#vipCrownGold)"
                    stroke="#7A4400"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <rect
                    x="8"
                    y="41"
                    width="48"
                    height="6"
                    rx="3"
                    fill="url(#vipCrownGold)"
                    stroke="#7A4400"
                    strokeWidth="1.8"
                  />
                  <circle cx="4" cy="11" r="3.5" fill="#FFF394" stroke="#7A4400" strokeWidth="1.4" />
                  <circle cx="32" cy="5" r="4" fill="#FFF394" stroke="#7A4400" strokeWidth="1.4" />
                  <circle cx="60" cy="11" r="3.5" fill="#FFF394" stroke="#7A4400" strokeWidth="1.4" />
                </svg>

                {/* Exact Bright Green (#00FF00) Extra-Bold Text */}
                <span
                  className="font-black text-xl sm:text-2xl tracking-wider leading-none"
                  style={{
                    color: '#00FF00',
                    textShadow:
                      '0 2px 3px rgba(0, 0, 0, 0.55), 0 0 8px rgba(0, 255, 0, 0.35)',
                  }}
                >
                  VIP {userVipLevel}
                </span>
              </div>
            </div>

            {/* 3. TOP DECORATIVE ORNAMENT (Symmetrical Cyan & Sky-Blue Flourish) */}
            <div className="w-full max-w-[340px] mt-1.5 flex items-center justify-center">
              <svg
                viewBox="0 0 500 110"
                className="w-full h-12 sm:h-14 drop-shadow-[0_4px_6px_rgba(0,168,243,0.28)]"
                fill="none"
              >
                <defs>
                  <linearGradient id="topCyanOrnament" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00C6FF" />
                    <stop offset="50%" stopColor="#0099F7" />
                    <stop offset="100%" stopColor="#00C6FF" />
                  </linearGradient>
                </defs>
                <path
                  d="M250 88 C230 62, 195 18, 225 14 C244 12, 250 34, 250 46 C250 34, 256 12, 275 14 C305 18, 270 62, 250 88 Z"
                  stroke="url(#topCyanOrnament)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M250 78 C205 42, 135 42, 92 66 C56 85, 22 76, 22 48 C22 24, 52 18, 62 36 C70 50, 52 64, 40 56"
                  stroke="url(#topCyanOrnament)"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <path
                  d="M236 62 C188 86, 132 76, 95 50"
                  stroke="url(#topCyanOrnament)"
                  strokeWidth="8.5"
                  strokeLinecap="round"
                />
                <path
                  d="M250 78 C295 42, 365 42, 408 66 C444 85, 478 76, 478 48 C478 24, 448 18, 438 36 C430 50, 448 64, 460 56"
                  stroke="url(#topCyanOrnament)"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <path
                  d="M264 62 C312 86, 368 76, 405 50"
                  stroke="url(#topCyanOrnament)"
                  strokeWidth="8.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* 4. DYNAMIC ADMIN-CONFIGURED BONUS CLAIM CARDS */}
          <div className="w-full px-3.5 sm:px-5 flex-1 overflow-y-auto flex flex-col justify-center gap-3 py-2">
            {eligibleBonuses.length === 0 ? (
              <div className="bg-white/90 border-2 border-[#91CFFF] rounded-[22px] p-6 text-center shadow-sm space-y-2 my-auto">
                <p className="font-black text-[#002E6E] text-base sm:text-lg">
                  No Active VIP Bonus Unlocked Yet
                </p>
                <p className="text-xs sm:text-sm text-[#172B75]/75 font-medium leading-relaxed">
                  {bonuses.length > 0
                    ? `Complete customer investment of ₹${Math.min(
                        ...bonuses.map((b) => Number(b.minInvestAmount) || 0)
                      ).toLocaleString('en-IN')} (VIP ${
                        bonuses[0]?.vipLevel || 1
                      }) to unlock your Weekly / Monthly VIP Bonus!`
                    : 'New Weekly & Monthly VIP Bonuses configured by Admin will appear here automatically.'}
                </p>
              </div>
            ) : (
              eligibleBonuses.map((bonus, idx) => {
                const isMonthly =
                  bonus.category === 'month' || bonus.category === 'vipLevelOffer';
                const title =
                  bonus.category === 'vipLevelOffer'
                    ? `VIP ${bonus.vipLevel} Bonus`
                    : isMonthly
                    ? 'Monthly Bonus'
                    : 'Weekly Bonus';

                const isClaimed =
                  (bonus.claimedBy || []).includes(userId) ||
                  Boolean(bonus.userProgress?.[userId]?.claimedAt);
                const isProcessing = claimingId === bonus.id;
                const remainingText = getRemainingDaysText(bonus);

                return (
                  <div
                    key={bonus.id || idx}
                    className="w-full min-h-[74px] sm:min-h-[80px] bg-[#FFFFFF] border-2 border-[#91CFFF] rounded-[22px] px-3 sm:px-4 py-2.5 flex items-center justify-between shadow-[0_6px_16px_rgba(0,140,255,0.12),inset_0_0_0_1.5px_rgba(225,243,255,0.9)] transition-all shrink-0"
                  >
                    {/* Left: 3D Icon + Title & Validity Info */}
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-[#EAF6FF] to-[#D8EEFF] flex items-center justify-center shrink-0 relative">
                        {!isMonthly ? (
                          /* 3D Blue Gift Box with Golden Ribbon & Sparkles */
                          <svg
                            viewBox="0 0 64 64"
                            className="w-11 h-11 sm:w-12 sm:h-12 drop-shadow-xs"
                          >
                            <defs>
                              <linearGradient
                                id={`giftBoxBlue_${idx}`}
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="100%"
                              >
                                <stop offset="0%" stopColor="#2B95FF" />
                                <stop offset="55%" stopColor="#0066E6" />
                                <stop offset="100%" stopColor="#003DA6" />
                              </linearGradient>
                              <linearGradient
                                id={`giftRibbonGold_${idx}`}
                                x1="0%"
                                y1="0%"
                                x2="0%"
                                y2="100%"
                              >
                                <stop offset="0%" stopColor="#FFF078" />
                                <stop offset="50%" stopColor="#FFC928" />
                                <stop offset="100%" stopColor="#C97A00" />
                              </linearGradient>
                            </defs>
                            <path
                              d="M8 18 L10 14 L12 18 L16 20 L12 22 L10 26 L8 22 L4 20 Z"
                              fill="#FFC928"
                            />
                            <path
                              d="M54 14 L55.5 11 L57 14 L60 15.5 L57 17 L55.5 20 L54 17 L51 15.5 Z"
                              fill="#FFC928"
                            />
                            <path
                              d="M55 42 L56.5 39 L58 42 L61 43.5 L58 45 L56.5 48 L55 45 L52 43.5 Z"
                              fill="#FFC928"
                            />
                            <circle cx="8" cy="44" r="2" fill="#FFC928" />
                            <rect
                              x="14"
                              y="28"
                              width="36"
                              height="26"
                              rx="4"
                              fill={`url(#giftBoxBlue_${idx})`}
                              stroke="#002E6E"
                              strokeWidth="1.2"
                            />
                            <rect
                              x="11"
                              y="20"
                              width="42"
                              height="9"
                              rx="3"
                              fill={`url(#giftBoxBlue_${idx})`}
                              stroke="#002E6E"
                              strokeWidth="1.2"
                            />
                            <rect
                              x="28"
                              y="20"
                              width="8"
                              height="34"
                              fill={`url(#giftRibbonGold_${idx})`}
                            />
                            <rect
                              x="14"
                              y="36"
                              width="36"
                              height="6"
                              fill={`url(#giftRibbonGold_${idx})`}
                            />
                            <path
                              d="M32 20 C22 10, 14 14, 18 20 C21 23, 28 21, 32 20 Z"
                              fill={`url(#giftRibbonGold_${idx})`}
                              stroke="#9C5A00"
                              strokeWidth="1"
                            />
                            <path
                              d="M32 20 C42 10, 50 14, 46 20 C43 23, 36 21, 32 20 Z"
                              fill={`url(#giftRibbonGold_${idx})`}
                              stroke="#9C5A00"
                              strokeWidth="1"
                            />
                            <circle
                              cx="32"
                              cy="19.5"
                              r="3.5"
                              fill="#FFE066"
                              stroke="#9C5A00"
                              strokeWidth="1"
                            />
                          </svg>
                        ) : (
                          /* 3D Blue Calendar with Lower-Right Clock Icon */
                          <svg
                            viewBox="0 0 64 64"
                            className="w-11 h-11 sm:w-12 sm:h-12 drop-shadow-xs"
                          >
                            <defs>
                              <linearGradient
                                id={`calHeaderBlue_${idx}`}
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="100%"
                              >
                                <stop offset="0%" stopColor="#2B95FF" />
                                <stop offset="100%" stopColor="#0055CC" />
                              </linearGradient>
                            </defs>
                            <rect
                              x="10"
                              y="14"
                              width="38"
                              height="36"
                              rx="7"
                              fill="#FFFFFF"
                              stroke="#0066E6"
                              strokeWidth="2.4"
                            />
                            <path
                              d="M10 21 C10 16.5 13.5 14 17 14 L41 14 C44.5 14 48 16.5 48 21 L48 25 L10 25 Z"
                              fill={`url(#calHeaderBlue_${idx})`}
                            />
                            <rect x="18" y="9" width="4.5" height="9" rx="2.2" fill="#0044AA" />
                            <rect x="35" y="9" width="4.5" height="9" rx="2.2" fill="#0044AA" />
                            <rect x="16" y="30" width="5" height="4.5" rx="1" fill="#1E78FF" />
                            <rect x="24" y="30" width="5" height="4.5" rx="1" fill="#1E78FF" />
                            <rect x="32" y="30" width="5" height="4.5" rx="1" fill="#1E78FF" />
                            <rect x="16" y="38" width="5" height="4.5" rx="1" fill="#1E78FF" />
                            <rect x="24" y="38" width="5" height="4.5" rx="1" fill="#1E78FF" />
                            <circle
                              cx="44"
                              cy="44"
                              r="11"
                              fill="#E8F4FF"
                              stroke="#0055CC"
                              strokeWidth="2.8"
                            />
                            <path
                              d="M44 38.5 L44 44 L48 46"
                              stroke="#002E6E"
                              strokeWidth="2.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>

                      {/* Center-Left: Bonus Title & 7-Day Validity Badge */}
                      <div className="min-w-0">
                        <span className="font-extrabold text-[#172B75] text-sm sm:text-base tracking-tight block truncate">
                          {title}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="text-[10px] font-bold text-[#002E6E]/75 bg-[#EAF6FF] border border-[#91CFFF] px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5 text-[#00B9F1]" />
                            {remainingText}
                          </span>
                          {bonus.minInvestAmount > 0 && (
                            <span className="text-[10px] font-semibold text-slate-500">
                              Min ₹{bonus.minInvestAmount.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Side: Golden Amount + Dark Navy Claim Button (Blurs when claimed) */}
                    <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
                      <span
                        className="font-black text-xl sm:text-2xl tracking-tight"
                        style={{
                          color: '#B87908',
                          textShadow: '0 1px 1px rgba(255, 201, 40, 0.25)',
                        }}
                      >
                        ₹{bonus.bonusAmount}
                      </span>

                      <button
                        type="button"
                        disabled={isClaimed || isProcessing}
                        onClick={(e) => handleClaimBonus(bonus, e)}
                        className={`min-w-[84px] sm:min-w-[94px] py-2 sm:py-2.5 px-4 sm:px-5 rounded-full font-extrabold text-sm sm:text-base text-white transition-all border ${
                          isClaimed
                            ? 'bg-[#8FA3B8] border-[#B0C2D4] opacity-60 blur-[0.6px] cursor-not-allowed shadow-none select-none'
                            : 'bg-gradient-to-b from-[#004196] to-[#002255] hover:brightness-110 active:scale-95 border-[#0055CC] shadow-[0_4px_10px_rgba(0,46,110,0.35),inset_0_1px_2px_rgba(255,255,255,0.35)] cursor-pointer'
                        }`}
                      >
                        {isProcessing ? '...' : isClaimed ? 'Claimed' : 'Claim'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 6. BOTTOM DECORATIVE ORNAMENT + 7. CURVED NAVY & CYAN FOOTER */}
          <div className="w-full flex flex-col items-center shrink-0 mt-auto">
            {/* Deep Navy Symmetrical Decorative Flourish */}
            <div className="w-full max-w-[340px] px-4 mb-0.5 flex items-center justify-center">
              <svg
                viewBox="0 0 500 105"
                className="w-full h-11 sm:h-13 drop-shadow-[0_3px_4px_rgba(0,46,110,0.2)]"
                fill="none"
              >
                <path
                  d="M250 18 L262 34 L250 50 L238 34 Z"
                  stroke="#002E6E"
                  strokeWidth="8"
                  fill="#F2F8FC"
                />
                <path
                  d="M250 50 C235 76, 204 94, 214 70 C220 56, 236 62, 240 74"
                  stroke="#002E6E"
                  strokeWidth="9.5"
                  strokeLinecap="round"
                />
                <path
                  d="M250 50 C265 76, 296 94, 286 70 C280 56, 264 62, 260 74"
                  stroke="#002E6E"
                  strokeWidth="9.5"
                  strokeLinecap="round"
                />
                <path
                  d="M238 34 C192 64, 134 64, 92 42 C54 22, 20 30, 22 58 C24 80, 52 84, 62 66 C68 54, 54 42, 42 48"
                  stroke="#002E6E"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <path
                  d="M226 48 C180 24, 128 32, 92 56"
                  stroke="#002E6E"
                  strokeWidth="8.5"
                  strokeLinecap="round"
                />
                <path
                  d="M262 34 C308 64, 366 64, 408 42 C446 22, 480 30, 478 58 C476 80, 448 84, 438 66 C432 54, 446 42, 458 48"
                  stroke="#002E6E"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <path
                  d="M274 48 C320 24, 372 32, 408 56"
                  stroke="#002E6E"
                  strokeWidth="8.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* 7. Bottom Curved Wave Footer (#002E6E with #00B9F1 Upper Accent Border) */}
            <div className="relative w-full h-16 sm:h-20 overflow-hidden">
              <svg
                viewBox="0 0 500 120"
                preserveAspectRatio="none"
                className="w-full h-full block"
              >
                <path
                  d="M0 10 Q250 75 500 10 L500 120 L0 120 Z"
                  fill="#00B9F1"
                />
                <path
                  d="M0 24 Q250 88 500 24 L500 120 L0 120 Z"
                  fill="#002E6E"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
