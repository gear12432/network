'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { VipBonus, UserStats, Transaction } from '@/types/investment';
import {
  getVipBonusesFromFirestore,
  saveVipBonusToFirestore,
  updateUserEarningsInFirestore,
  saveVipBonusClaimTransaction,
  DEFAULT_VIP_BONUSES,
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
  const [bonuses, setBonuses] = useState<VipBonus[]>(DEFAULT_VIP_BONUSES);
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

  // Load and subscribe to real-time VIP Bonuses from Firestore
  useEffect(() => {
    getVipBonusesFromFirestore().then((loaded) => {
      if (loaded && loaded.length > 0) {
        setBonuses(loaded);
      }
    });

    try {
      const ref = collection(db, 'vip_bonuses');
      const unsub = onSnapshot(
        ref,
        (snap) => {
          if (!snap.empty) {
            const list: VipBonus[] = [];
            snap.forEach((d) => {
              list.push({ ...(d.data() as VipBonus), id: d.id });
            });
            setBonuses(list);
          }
        },
        () => {
          // fallback handled by getVipBonusesFromFirestore
        }
      );
      return () => unsub();
    } catch {
      // ignore offline
    }
  }, []);

  // Support Android/browser back button to close the full-screen VIP Bonus view
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

  const userVipLevel = stats.vipLevel && stats.vipLevel > 0 ? stats.vipLevel : 2;
  const userInvested = stats.totalCustomerInvested ?? 0;
  const userId = stats.loginUid || 'GK35648';

  // Build exactly 4 horizontal cards matching the reference composition:
  // Card 1: Weekly Bonus (₹6 or DB weekly bonus #1)
  // Card 2: Monthly Bonus (₹120 or DB monthly bonus #1)
  // Card 3: Weekly Bonus (₹6 or DB weekly bonus #2)
  // Card 4: Monthly Bonus (₹120 or DB monthly bonus #2)
  const weeklyBonuses = bonuses.filter((b) => b.category === 'week');
  const monthlyBonuses = bonuses.filter((b) => b.category === 'month' || b.category === 'vipLevelOffer');

  const card1: VipBonus = weeklyBonuses[0] || DEFAULT_VIP_BONUSES[0];
  const card2: VipBonus = monthlyBonuses[0] || DEFAULT_VIP_BONUSES[1];
  const card3: VipBonus =
    weeklyBonuses[1] ||
    (weeklyBonuses[0]
      ? { ...weeklyBonuses[0], id: `${weeklyBonuses[0].id}_slot3` }
      : DEFAULT_VIP_BONUSES[2]);
  const card4: VipBonus =
    monthlyBonuses[1] ||
    (monthlyBonuses[0]
      ? { ...monthlyBonuses[0], id: `${monthlyBonuses[0].id}_slot4` }
      : DEFAULT_VIP_BONUSES[3]);

  const fourBonusCards: Array<{
    slotIndex: number;
    type: 'weekly' | 'monthly';
    title: string;
    bonus: VipBonus;
  }> = [
    { slotIndex: 1, type: 'weekly', title: 'Weekly Bonus', bonus: card1 },
    { slotIndex: 2, type: 'monthly', title: 'Monthly Bonus', bonus: card2 },
    { slotIndex: 3, type: 'weekly', title: 'Weekly Bonus', bonus: card3 },
    { slotIndex: 4, type: 'monthly', title: 'Monthly Bonus', bonus: card4 },
  ];

  const handleClaimBonus = async (
    cardItem: {
      slotIndex: number;
      type: 'weekly' | 'monthly';
      title: string;
      bonus: VipBonus;
    },
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    const { bonus, title, slotIndex } = cardItem;
    const claimKey = `${bonus.id}_slot_${slotIndex}`;

    if (claimingId) return;

    // 1. Check duplicate claim
    const alreadyClaimedByUser =
      (bonus.claimedBy || []).includes(userId) ||
      (bonus.claimedBy || []).includes(`${userId}_slot_${slotIndex}`);

    if (alreadyClaimedByUser) {
      showFeedback('error', `${title} (₹${bonus.bonusAmount}) has already been claimed!`);
      return;
    }

    // 2. Check VIP Level requirement
    const actualUserVip = stats.vipLevel ?? 1;
    if (bonus.vipLevel && actualUserVip < bonus.vipLevel && bonus.minInvestAmount > 0) {
      showFeedback(
        'error',
        `Requires VIP ${bonus.vipLevel} to claim this ${title}!`
      );
      return;
    }

    // 3. Check minimum investment eligibility
    if (bonus.minInvestAmount && userInvested < bonus.minInvestAmount) {
      showFeedback(
        'error',
        `Eligibility not met: Minimum investment of ₹${bonus.minInvestAmount.toLocaleString(
          'en-IN'
        )} required.`
      );
      return;
    }

    // 4. Check validity date if set
    if (bonus.validityDate) {
      const exp = new Date(bonus.validityDate);
      exp.setHours(23, 59, 59, 999);
      if (!isNaN(exp.getTime()) && new Date() > exp) {
        showFeedback('error', `This ${title} offer has expired.`);
        return;
      }
    }

    setClaimingId(claimKey);

    try {
      const creditAmount = Number(bonus.bonusAmount) || 0;
      const newBalance = (stats.walletBalance || 0) + creditAmount;
      const newTotalEarned = (stats.totalEarned || 0) + creditAmount;

      // Update user wallet balance in Firestore
      await updateUserEarningsInFirestore(userId, {
        balance: newBalance,
        totalEarned: newTotalEarned,
      });

      // Mark bonus claimed in Firestore
      const updatedClaimedBy = Array.from(
        new Set([...(bonus.claimedBy || []), userId, `${userId}_slot_${slotIndex}`])
      );
      const updatedBonus: VipBonus = {
        ...bonus,
        claimedBy: updatedClaimedBy,
      };
      await saveVipBonusToFirestore(updatedBonus);

      // Save claim transaction in Firebase
      const txId = `VIP_CLAIM_${Date.now()}_${slotIndex}`;
      await saveVipBonusClaimTransaction({
        id: txId,
        loginUid: userId,
        userName: stats.userName || 'VIP Member',
        vipLevel: userVipLevel,
        bonusId: bonus.id,
        bonusTitle: title,
        category: bonus.category,
        amount: creditAmount,
        claimedAt: new Date().toISOString(),
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

      // Update local state
      setBonuses((prev) =>
        prev.map((item) => (item.id === bonus.id ? updatedBonus : item))
      );

      triggerConfetti();
      showFeedback(
        'success',
        `₹${creditAmount} ${title} credited to your wallet!`
      );
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
      className="fixed inset-0 z-50 w-full h-full overflow-hidden select-none flex flex-col justify-between bg-[#00C8FF] font-sans"
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

      {/* Outer Samsung-Style Rounded Frame Matching Reference Image */}
      <div className="relative w-full h-full max-w-md mx-auto flex flex-col justify-between pt-3 sm:pt-4 overflow-hidden bg-gradient-to-b from-[#00C8FF] via-[#00B9F1] to-[#002E6E]">
        {/* Inner Light-Blue & White Main Body Sheet */}
        <div
          className="relative flex-1 w-full rounded-t-[34px] border-t-2 border-x border-white/90 flex flex-col justify-between overflow-hidden shadow-[0_-6px_25px_rgba(0,185,241,0.35)]"
          style={{
            background:
              'radial-gradient(circle at 50% 32%, #FFFFFF 0%, #F4FAFF 52%, #DDF0FF 100%)',
          }}
        >
          {/* Top Section: VIP Level Badge + Cyan Decorative Ornament */}
          <div className="w-full pt-4 sm:pt-5 px-4 flex flex-col items-center shrink-0">
            {/* 2. TOP VIP LEVEL BADGE (Tap badge to return if needed) */}
            <div
              onClick={onClose}
              title="VIP Level Status"
              className="relative cursor-pointer active:scale-95 transition-transform"
            >
              {/* Outer Golden Glow & Border */}
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
                  className="w-8 h-7 sm:w-9 sm:h-7.5 drop-shadow-[0_2px_3px_rgba(0,0,0,0.45)] shrink-0"
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
                  className="font-black text-2xl sm:text-[28px] tracking-wider leading-none"
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
            <div className="w-full max-w-[360px] mt-2 sm:mt-2.5 mb-1 flex items-center justify-center">
              <svg
                viewBox="0 0 500 110"
                className="w-full h-14 sm:h-16 drop-shadow-[0_4px_6px_rgba(0,168,243,0.28)]"
                fill="none"
              >
                <defs>
                  <linearGradient id="topCyanOrnament" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00C6FF" />
                    <stop offset="50%" stopColor="#0099F7" />
                    <stop offset="100%" stopColor="#00C6FF" />
                  </linearGradient>
                </defs>
                {/* Center Heart/Loop Flourish */}
                <path
                  d="M250 88 C230 62, 195 18, 225 14 C244 12, 250 34, 250 46 C250 34, 256 12, 275 14 C305 18, 270 62, 250 88 Z"
                  stroke="url(#topCyanOrnament)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Left Symmetrical Ribbon Scroll */}
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
                {/* Right Symmetrical Ribbon Scroll */}
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

          {/* 4. FOUR HORIZONTAL BONUS CLAIM CARDS */}
          <div className="w-full px-3.5 sm:px-4 flex-1 flex flex-col justify-center gap-3 sm:gap-3.5 my-1">
            {fourBonusCards.map((item) => {
              const { slotIndex, type, title, bonus } = item;
              const isClaimed =
                (bonus.claimedBy || []).includes(userId) ||
                (bonus.claimedBy || []).includes(`${userId}_slot_${slotIndex}`);
              const isProcessing = claimingId === `${bonus.id}_slot_${slotIndex}`;

              return (
                <div
                  key={`vip_card_slot_${slotIndex}`}
                  className="w-full h-[72px] sm:h-[78px] bg-[#FFFFFF] border-2 border-[#91CFFF] rounded-[22px] px-3 sm:px-4 flex items-center justify-between shadow-[0_6px_16px_rgba(0,140,255,0.12),inset_0_0_0_1.5px_rgba(225,243,255,0.9)] transition-all"
                >
                  {/* Left: 3D Icon + Title */}
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    {/* Clean Light-Blue Circular Icon Container */}
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-[#EAF6FF] to-[#D8EEFF] flex items-center justify-center shrink-0 relative">
                      {type === 'weekly' ? (
                        /* 3D Blue Gift Box with Golden Ribbon & Sparkles */
                        <svg viewBox="0 0 64 64" className="w-11 h-11 sm:w-12 sm:h-12 drop-shadow-xs">
                          <defs>
                            <linearGradient id={`giftBoxBlue_${slotIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#2B95FF" />
                              <stop offset="55%" stopColor="#0066E6" />
                              <stop offset="100%" stopColor="#003DA6" />
                            </linearGradient>
                            <linearGradient id={`giftRibbonGold_${slotIndex}`} x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#FFF078" />
                              <stop offset="50%" stopColor="#FFC928" />
                              <stop offset="100%" stopColor="#C97A00" />
                            </linearGradient>
                          </defs>
                          {/* Golden Sparkles */}
                          <path d="M8 18 L10 14 L12 18 L16 20 L12 22 L10 26 L8 22 L4 20 Z" fill="#FFC928" />
                          <path d="M54 14 L55.5 11 L57 14 L60 15.5 L57 17 L55.5 20 L54 17 L51 15.5 Z" fill="#FFC928" />
                          <path d="M55 42 L56.5 39 L58 42 L61 43.5 L58 45 L56.5 48 L55 45 L52 43.5 Z" fill="#FFC928" />
                          <circle cx="8" cy="44" r="2" fill="#FFC928" />
                          {/* Gift Box Lower Body */}
                          <rect
                            x="14"
                            y="28"
                            width="36"
                            height="26"
                            rx="4"
                            fill={`url(#giftBoxBlue_${slotIndex})`}
                            stroke="#002E6E"
                            strokeWidth="1.2"
                          />
                          {/* Gift Box Lid */}
                          <rect
                            x="11"
                            y="20"
                            width="42"
                            height="9"
                            rx="3"
                            fill={`url(#giftBoxBlue_${slotIndex})`}
                            stroke="#002E6E"
                            strokeWidth="1.2"
                          />
                          {/* Vertical & Horizontal Golden Ribbon */}
                          <rect x="28" y="20" width="8" height="34" fill={`url(#giftRibbonGold_${slotIndex})`} />
                          <rect x="14" y="36" width="36" height="6" fill={`url(#giftRibbonGold_${slotIndex})`} />
                          {/* Golden Bow on Top */}
                          <path
                            d="M32 20 C22 10, 14 14, 18 20 C21 23, 28 21, 32 20 Z"
                            fill={`url(#giftRibbonGold_${slotIndex})`}
                            stroke="#9C5A00"
                            strokeWidth="1"
                          />
                          <path
                            d="M32 20 C42 10, 50 14, 46 20 C43 23, 36 21, 32 20 Z"
                            fill={`url(#giftRibbonGold_${slotIndex})`}
                            stroke="#9C5A00"
                            strokeWidth="1"
                          />
                          <circle cx="32" cy="19.5" r="3.5" fill="#FFE066" stroke="#9C5A00" strokeWidth="1" />
                        </svg>
                      ) : (
                        /* 3D Blue Calendar with Lower-Right Clock Icon */
                        <svg viewBox="0 0 64 64" className="w-11 h-11 sm:w-12 sm:h-12 drop-shadow-xs">
                          <defs>
                            <linearGradient id={`calHeaderBlue_${slotIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#2B95FF" />
                              <stop offset="100%" stopColor="#0055CC" />
                            </linearGradient>
                          </defs>
                          {/* Calendar Body */}
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
                          {/* Calendar Top Header */}
                          <path
                            d="M10 21 C10 16.5 13.5 14 17 14 L41 14 C44.5 14 48 16.5 48 21 L48 25 L10 25 Z"
                            fill={`url(#calHeaderBlue_${slotIndex})`}
                          />
                          {/* Calendar Rings */}
                          <rect x="18" y="9" width="4.5" height="9" rx="2.2" fill="#0044AA" />
                          <rect x="35" y="9" width="4.5" height="9" rx="2.2" fill="#0044AA" />
                          {/* Calendar Grid Dots */}
                          <rect x="16" y="30" width="5" height="4.5" rx="1" fill="#1E78FF" />
                          <rect x="24" y="30" width="5" height="4.5" rx="1" fill="#1E78FF" />
                          <rect x="32" y="30" width="5" height="4.5" rx="1" fill="#1E78FF" />
                          <rect x="16" y="38" width="5" height="4.5" rx="1" fill="#1E78FF" />
                          <rect x="24" y="38" width="5" height="4.5" rx="1" fill="#1E78FF" />
                          {/* Attached Clock on Lower-Right */}
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

                    {/* Center-Left: Bonus Title */}
                    <span className="font-extrabold text-[#172B75] text-sm sm:text-base tracking-tight truncate">
                      {title}
                    </span>
                  </div>

                  {/* Right Side: Golden Amount + Dark Navy Claim Button */}
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
                      onClick={(e) => handleClaimBonus(item, e)}
                      className={`min-w-[82px] sm:min-w-[92px] py-2 sm:py-2.5 px-4 sm:px-5 rounded-full font-extrabold text-sm sm:text-base text-white transition-all shadow-[0_4px_10px_rgba(0,46,110,0.35),inset_0_1px_2px_rgba(255,255,255,0.35)] border ${
                        isClaimed
                          ? 'bg-slate-400 border-slate-300 cursor-not-allowed opacity-80'
                          : 'bg-gradient-to-b from-[#004196] to-[#002255] hover:brightness-110 active:scale-95 border-[#0055CC] cursor-pointer'
                      }`}
                    >
                      {isProcessing ? '...' : isClaimed ? 'Claimed' : 'Claim'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 6. BOTTOM DECORATIVE ORNAMENT + 7. CURVED NAVY & CYAN FOOTER */}
          <div className="w-full flex flex-col items-center shrink-0 mt-auto">
            {/* Deep Navy Symmetrical Decorative Flourish */}
            <div className="w-full max-w-[360px] px-4 mb-1 flex items-center justify-center">
              <svg
                viewBox="0 0 500 105"
                className="w-full h-13 sm:h-15 drop-shadow-[0_3px_4px_rgba(0,46,110,0.2)]"
                fill="none"
              >
                {/* Center Double-Loop & Diamond */}
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
                {/* Left Symmetrical Scroll */}
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
                {/* Right Symmetrical Scroll */}
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
            <div className="relative w-full h-20 sm:h-24 overflow-hidden">
              <svg
                viewBox="0 0 500 120"
                preserveAspectRatio="none"
                className="w-full h-full block"
              >
                {/* Bright Cyan Upper Wave Accent */}
                <path
                  d="M0 10 Q250 75 500 10 L500 120 L0 120 Z"
                  fill="#00B9F1"
                />
                {/* Deep Navy Blue Lower Wave Fill */}
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
