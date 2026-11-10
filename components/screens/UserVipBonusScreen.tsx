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
      return `${durationDays}d`;
    }

    const diffMs = Math.max(0, targetMs - now);
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return daysLeft > 0 ? `${daysLeft}d left` : 'Today';
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

      {/* Responsive Frame: Full-screen on Mobile, Centered Card Frame on Desktop */}
      <div className="relative w-full h-full sm:h-[94vh] max-w-md sm:max-w-lg mx-auto sm:rounded-[38px] sm:border-4 sm:border-[#00B9F1]/60 sm:shadow-[0_20px_60px_rgba(0,0,0,0.55)] flex flex-col justify-between pt-2 sm:pt-3 overflow-hidden bg-gradient-to-b from-[#00C8FF] via-[#00B9F1] to-[#002E6E]">
        {/* Inner Light-Blue & White Main Screen Sheet */}
        <div
          className="relative flex-1 w-full rounded-t-[32px] border-t-2 border-x border-white/95 flex flex-col justify-between overflow-hidden shadow-[0_-6px_25px_rgba(0,185,241,0.35)]"
          style={{
            background:
              'radial-gradient(circle at 50% 25%, #FFFFFF 0%, #F1F8FF 58%, #DCF0FF 100%)',
          }}
        >
          {/* 1. TOP BAR: Back Icon ("← VIP Bonus") on Left & "Invested: ₹..." on Right */}
          <div className="w-full pt-3 sm:pt-3.5 px-3.5 sm:px-4 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#F2F8FC] active:scale-95 border border-[#91CFFF] text-[#002E6E] shadow-xs transition-all cursor-pointer"
              title="Back to Home"
              aria-label="Back to Home"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.8] text-[#002E6E]" />
              <span className="text-xs sm:text-sm font-black tracking-tight text-[#002E6E]">
                VIP Bonus
              </span>
            </button>

            <div className="text-[11px] sm:text-xs font-extrabold text-[#172B75] bg-white border border-[#91CFFF] px-3 py-1.5 rounded-full shadow-2xs">
              Invested: ₹{userInvested.toLocaleString('en-IN')}
            </div>
          </div>

          {/* 2. TOP VIP LEVEL BADGE (Dark Navy Pill with Gold Border & Golden Text/Crown as in reference image) */}
          <div className="w-full flex flex-col items-center shrink-0 mt-1.5 sm:mt-2 mb-1 z-10">
            <div
              className="relative px-6 sm:px-7 py-1.5 sm:py-2 rounded-full border-[2.5px] border-[#FFC928] flex items-center justify-center gap-2.5 shadow-[0_5px_14px_rgba(0,46,110,0.35),0_0_0_2px_rgba(255,201,40,0.25)]"
              style={{
                background:
                  'linear-gradient(180deg, #072A6C 0%, #031947 55%, #021030 100%)',
              }}
            >
              {/* Glossy Top Highlight */}
              <div className="absolute inset-x-3 top-0.5 h-2 rounded-full bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />

              {/* 3D Golden Crown SVG */}
              <svg
                viewBox="0 0 64 52"
                className="w-6 h-5 sm:w-7 sm:h-6 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] shrink-0"
              >
                <defs>
                  <linearGradient id="vipCrownGoldBox" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFF394" />
                    <stop offset="50%" stopColor="#FFC928" />
                    <stop offset="100%" stopColor="#C87A00" />
                  </linearGradient>
                </defs>
                <path
                  d="M8 40 L4 14 L20 26 L32 8 L44 26 L60 14 L56 40 Z"
                  fill="url(#vipCrownGoldBox)"
                  stroke="#8A4F00"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <rect
                  x="8"
                  y="41"
                  width="48"
                  height="6"
                  rx="3"
                  fill="url(#vipCrownGoldBox)"
                  stroke="#8A4F00"
                  strokeWidth="1.6"
                />
                <circle cx="4" cy="11" r="3.5" fill="#FFF394" />
                <circle cx="32" cy="5" r="4" fill="#FFF394" />
                <circle cx="60" cy="11" r="3.5" fill="#FFF394" />
              </svg>

              {/* Golden VIP Level Text */}
              <span
                className="font-black text-lg sm:text-xl tracking-wider leading-none"
                style={{
                  background: 'linear-gradient(180deg, #FFF394 0%, #FFC928 55%, #DF9208 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.65))',
                }}
              >
                VIP {userVipLevel}
              </span>
            </div>
          </div>

          {/* 3. FRAMED MAIN BONUS BOX (Matches uploaded screenshot 20261110_144324_9a3fb1f8.jpg) */}
          <div className="w-full px-3.5 sm:px-5 flex-1 flex flex-col justify-center min-h-0 my-1">
            <div
              className="relative w-full flex-1 max-h-[450px] rounded-[24px] border-[1.8px] border-[#0D2B6B] px-3 sm:px-4 py-2.5 flex flex-col justify-between overflow-hidden shadow-[0_10px_28px_rgba(0,68,170,0.16),inset_0_0_18px_rgba(255,255,255,0.9)]"
              style={{
                background:
                  'linear-gradient(180deg, #F7FBFF 0%, #FFFFFF 38%, #EDF6FF 78%, #E0F0FF 100%)',
              }}
            >
              {/* Subtle Wave Highlight Inside the Box */}
              <div
                className="absolute inset-x-0 bottom-0 h-28 pointer-events-none opacity-55"
                style={{
                  background:
                    'radial-gradient(ellipse at 70% 100%, rgba(145, 207, 255, 0.45) 0%, transparent 70%)',
                }}
              />

              {/* Top 3D Blue/Cyan Symmetrical Decorative Flourish Inside Box */}
              <div className="w-full flex items-center justify-center shrink-0 -mt-1">
                <svg
                  viewBox="0 0 500 95"
                  className="w-full h-11 sm:h-12 drop-shadow-[0_3px_5px_rgba(0,110,210,0.28)]"
                  fill="none"
                >
                  <defs>
                    <linearGradient id="boxTopOrnamentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00D2FF" />
                      <stop offset="35%" stopColor="#0052B4" />
                      <stop offset="50%" stopColor="#002E6E" />
                      <stop offset="65%" stopColor="#0052B4" />
                      <stop offset="100%" stopColor="#00D2FF" />
                    </linearGradient>
                  </defs>
                  {/* Center Diamond & Loop */}
                  <path
                    d="M250 82 L261 64 L250 48 L239 64 Z"
                    stroke="url(#boxTopOrnamentGrad)"
                    strokeWidth="6.5"
                    fill="#E6F5FF"
                  />
                  {/* Left Symmetrical Scroll */}
                  <path
                    d="M250 58 C205 20, 140 20, 95 48 C58 70, 18 62, 20 34 C22 14, 48 12, 58 28 C64 40, 50 52, 38 44"
                    stroke="url(#boxTopOrnamentGrad)"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  <path
                    d="M236 46 C188 70, 134 60, 94 34"
                    stroke="#00B9F1"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                  {/* Right Symmetrical Scroll */}
                  <path
                    d="M250 58 C295 20, 360 20, 405 48 C442 70, 482 62, 480 34 C478 14, 452 12, 442 28 C436 40, 450 52, 462 44"
                    stroke="url(#boxTopOrnamentGrad)"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  <path
                    d="M264 46 C312 70, 366 60, 406 34"
                    stroke="#00B9F1"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Compact Small-Height Bonus Cards List Inside the Box */}
              <div className="relative z-10 w-full flex-1 overflow-y-auto flex flex-col justify-center gap-2 sm:gap-2.5 py-1 px-0.5">
                {eligibleBonuses.length === 0 ? (
                  <div className="bg-white/95 border border-[#91CFFF] rounded-2xl p-4 text-center shadow-2xs space-y-1.5 my-auto">
                    <p className="font-black text-[#002E6E] text-sm sm:text-base">
                      No Active VIP Bonus Unlocked Yet
                    </p>
                    <p className="text-[11px] sm:text-xs text-[#172B75]/75 font-medium leading-relaxed">
                      {bonuses.length > 0
                        ? `Complete customer investment of ₹${Math.min(
                            ...bonuses.map((b) => Number(b.minInvestAmount) || 0)
                          ).toLocaleString('en-IN')} (VIP ${
                            bonuses[0]?.vipLevel || 1
                          }) to unlock your Weekly / Monthly Bonus!`
                        : 'Admin-configured Weekly & Monthly VIP Bonuses will appear inside this box.'}
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
                        ? 'monthly bonus'
                        : 'weekly bonus';

                    const isClaimed =
                      (bonus.claimedBy || []).includes(userId) ||
                      Boolean(bonus.userProgress?.[userId]?.claimedAt);
                    const isProcessing = claimingId === bonus.id;
                    const remainingText = getRemainingDaysText(bonus);

                    return (
                      <div
                        key={bonus.id || idx}
                        className="w-full h-[46px] sm:h-[50px] bg-gradient-to-r from-[#FFFFFF] via-[#F9FCFF] to-[#FFFFFF] border-[1.5px] border-[#9AC8F5] rounded-[14px] px-3 sm:px-3.5 flex items-center justify-between shadow-[0_3px_8px_rgba(0,110,215,0.1),inset_0_1px_0_rgba(255,255,255,0.95)] transition-all shrink-0"
                      >
                        {/* Left: Compact Bonus Title + 7-Day Validity Tag */}
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-extrabold text-[#12265E] text-[13px] sm:text-[15px] tracking-tight capitalize truncate">
                            {title}
                          </span>
                          <span
                            className="text-[9px] sm:text-[10px] font-bold text-[#0052B4] bg-[#E8F4FF] border border-[#91CFFF]/80 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shrink-0"
                            title="Auto-deletes after validity ends"
                          >
                            <Clock className="w-2.5 h-2.5 text-[#00B9F1]" />
                            {remainingText}
                          </span>
                        </div>

                        {/* Right: Bold Golden Amount + Glossy Dark Navy Claim Button */}
                        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
                          <span
                            className="font-black text-base sm:text-lg tracking-tight"
                            style={{
                              color: '#B87908',
                              textShadow: '0 1px 1px rgba(255, 201, 40, 0.2)',
                            }}
                          >
                            ₹{bonus.bonusAmount}
                          </span>

                          <button
                            type="button"
                            disabled={isClaimed || isProcessing}
                            onClick={(e) => handleClaimBonus(bonus, e)}
                            className={`min-w-[74px] sm:min-w-[82px] h-[31px] sm:h-[34px] px-3.5 rounded-full font-extrabold text-xs sm:text-sm text-white flex items-center justify-center transition-all border ${
                              isClaimed
                                ? 'bg-[#8FA3B8] border-[#B0C2D4] opacity-60 blur-[0.6px] cursor-not-allowed shadow-none select-none'
                                : 'bg-gradient-to-b from-[#073A8C] via-[#032461] to-[#021740] hover:brightness-110 active:scale-95 border-[#0099F7] shadow-[0_2px_7px_rgba(0,46,110,0.4),inset_0_1px_2px_rgba(0,210,255,0.45)] cursor-pointer'
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

              {/* Bottom 3D Blue/Navy Symmetrical Decorative Flourish Inside Box */}
              <div className="w-full flex items-center justify-center shrink-0 -mb-1">
                <svg
                  viewBox="0 0 500 95"
                  className="w-full h-11 sm:h-12 drop-shadow-[0_3px_5px_rgba(0,68,160,0.28)]"
                  fill="none"
                >
                  <defs>
                    <linearGradient id="boxBottomOrnamentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00C6FF" />
                      <stop offset="30%" stopColor="#0048A8" />
                      <stop offset="50%" stopColor="#00235B" />
                      <stop offset="70%" stopColor="#0048A8" />
                      <stop offset="100%" stopColor="#00C6FF" />
                    </linearGradient>
                  </defs>
                  {/* Center Peak & Double Loop */}
                  <path
                    d="M250 14 L263 34 L250 52 L237 34 Z"
                    stroke="url(#boxBottomOrnamentGrad)"
                    strokeWidth="6.5"
                    fill="#E6F5FF"
                  />
                  <path
                    d="M250 52 C234 78, 204 88, 214 66 C220 54, 236 58, 240 70"
                    stroke="url(#boxBottomOrnamentGrad)"
                    strokeWidth="8.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M250 52 C266 78, 296 88, 286 66 C280 54, 264 58, 260 70"
                    stroke="url(#boxBottomOrnamentGrad)"
                    strokeWidth="8.5"
                    strokeLinecap="round"
                  />
                  {/* Left Symmetrical Scroll */}
                  <path
                    d="M237 36 C192 68, 136 68, 92 44 C54 22, 18 30, 20 58 C22 78, 48 82, 58 64 C64 52, 50 42, 38 48"
                    stroke="url(#boxBottomOrnamentGrad)"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  <path
                    d="M226 48 C182 26, 130 34, 92 58"
                    stroke="#00B9F1"
                    strokeWidth="5.5"
                    strokeLinecap="round"
                  />
                  {/* Right Symmetrical Scroll */}
                  <path
                    d="M263 36 C308 68, 364 68, 408 44 C446 22, 482 30, 480 58 C478 78, 452 82, 442 64 C436 52, 450 42, 462 48"
                    stroke="url(#boxBottomOrnamentGrad)"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  <path
                    d="M274 48 C318 26, 370 34, 408 58"
                    stroke="#00B9F1"
                    strokeWidth="5.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* 4. LOWER NAVY ORNAMENT + CURVED NAVY & CYAN WAVE FOOTER */}
          <div className="w-full flex flex-col items-center shrink-0 mt-auto">
            {/* Smaller Deep Navy Symmetrical Flourish Below the Main Box */}
            <div className="w-full max-w-[270px] px-4 mb-0.5 flex items-center justify-center">
              <svg
                viewBox="0 0 500 95"
                className="w-full h-8 sm:h-9 drop-shadow-[0_2px_3px_rgba(0,46,110,0.18)]"
                fill="none"
              >
                <path
                  d="M250 18 L262 34 L250 50 L238 34 Z"
                  stroke="#002E6E"
                  strokeWidth="8"
                  fill="#F2F8FC"
                />
                <path
                  d="M250 50 C235 76, 204 90, 214 68 C220 56, 236 62, 240 72"
                  stroke="#002E6E"
                  strokeWidth="9.5"
                  strokeLinecap="round"
                />
                <path
                  d="M250 50 C265 76, 296 90, 286 68 C280 56, 264 62, 260 72"
                  stroke="#002E6E"
                  strokeWidth="9.5"
                  strokeLinecap="round"
                />
                <path
                  d="M238 34 C192 64, 134 64, 92 42 C54 22, 20 30, 22 58 C24 78, 52 82, 62 64 C68 54, 54 42, 42 48"
                  stroke="#002E6E"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <path
                  d="M262 34 C308 64, 366 64, 408 42 C446 22, 480 30, 478 58 C476 78, 448 82, 438 64 C432 54, 446 42, 458 48"
                  stroke="#002E6E"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Bottom Curved Wave Footer (#002E6E with #00B9F1 Upper Accent Border) */}
            <div className="relative w-full h-12 sm:h-14 overflow-hidden">
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
