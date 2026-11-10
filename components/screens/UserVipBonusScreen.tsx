'use client';
import React, { useState, useEffect } from 'react';
import { Crown, Gift, X } from 'lucide-react';
import { VipBonus, UserStats } from '@/types/investment';
import { getVipBonusesFromFirestore, updateUserEarningsInFirestore } from '@/lib/firebase';
import { motion } from 'motion/react';

interface UserVipBonusScreenProps {
  stats: UserStats;
  onClose: () => void;
}

export default function UserVipBonusScreen({ stats, onClose }: UserVipBonusScreenProps) {
  const [bonuses, setBonuses] = useState<VipBonus[]>([]);

  useEffect(() => {
    getVipBonusesFromFirestore().then(setBonuses);
  }, []);

  const handleClaim = async (bonus: VipBonus) => {
    if (stats.totalCustomerInvested! < bonus.minInvestAmount) {
      alert("Investment target not met!");
      return;
    }
    
    // Update wallet and mark as claimed
    const newBal = stats.walletBalance + bonus.bonusAmount;
    await updateUserEarningsInFirestore(stats.loginUid!, { balance: newBal });
    // TODO: Update bonus.claimedBy in firestore
    alert("Bonus claimed!");
  };

  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 z-50 bg-[#F2F8FC] p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-[#002E6E]">VIP Bonus</h2>
        <button onClick={onClose}><X /></button>
      </div>
      <div className="space-y-4">
        {bonuses.map(b => {
          const isEligible = stats.totalCustomerInvested! >= b.minInvestAmount;
          const isClaimed = b.claimedBy?.includes(stats.loginUid!);
          if (!isEligible || isClaimed) return null;
          
          return (
            <div key={b.id} className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center">
              <div>
                <p className="font-black text-[#002E6E]">VIP {b.vipLevel}</p>
                <p className="text-sm">Bonus: ₹{b.bonusAmount}</p>
              </div>
              <button onClick={() => handleClaim(b)} className="bg-[#002E6E] text-white px-4 py-2 rounded-lg text-xs font-bold">Claim</button>
            </div>
          );
        })}
        {bonuses.filter(b => stats.totalCustomerInvested! >= b.minInvestAmount && !b.claimedBy?.includes(stats.loginUid!)).length === 0 && (
          <p className="text-center text-slate-500">No eligible bonuses available.</p>
        )}
      </div>
    </motion.div>
  );
}
