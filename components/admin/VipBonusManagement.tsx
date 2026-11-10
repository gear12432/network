'use client';

import React, { useState, useEffect } from 'react';
import { Crown, Trash2, Save, Gift, Calendar, Sparkles, RefreshCw, Check } from 'lucide-react';
import { VipBonus } from '@/types/investment';
import {
  getVipBonusesFromFirestore,
  saveVipBonusToFirestore,
  deleteVipBonusFromFirestore,
  DEFAULT_VIP_BONUSES,
  db,
} from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function VipBonusManagement() {
  const [bonuses, setBonuses] = useState<VipBonus[]>(DEFAULT_VIP_BONUSES);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [newBonus, setNewBonus] = useState<Partial<VipBonus>>({
    vipLevel: 2,
    minInvestAmount: 0,
    bonusAmount: 6,
    category: 'week',
    validityDate: '2027-12-31',
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadBonuses = async () => {
    const data = await getVipBonusesFromFirestore();
    if (data && data.length > 0) {
      setBonuses(data);
    }
  };

  useEffect(() => {
    loadBonuses();

    try {
      const ref = collection(db, 'vip_bonuses');
      const unsub = onSnapshot(
        ref,
        (snap) => {
          if (!snap.empty) {
            const list: VipBonus[] = [];
            snap.forEach((d) => list.push({ ...(d.data() as VipBonus), id: d.id }));
            setBonuses(list);
          }
        },
        () => {}
      );
      return () => unsub();
    } catch {}
  }, []);

  const handleSave = async () => {
    if (!newBonus.vipLevel || newBonus.bonusAmount === undefined) return;
    setSaving(true);
    const bonus: VipBonus = {
      id: `bonus_${Date.now()}`,
      vipLevel: Number(newBonus.vipLevel) || 1,
      minInvestAmount: Number(newBonus.minInvestAmount) || 0,
      bonusAmount: Number(newBonus.bonusAmount) || 0,
      category: (newBonus.category as 'week' | 'month' | 'vipLevelOffer') || 'week',
      validityDate: newBonus.validityDate || '2027-12-31',
      claimedBy: [],
    };
    await saveVipBonusToFirestore(bonus);
    await loadBonuses();
    setSaving(false);
    showToast(`Saved ${bonus.category === 'month' ? 'Monthly' : 'Weekly'} Bonus ₹${bonus.bonusAmount}!`);
  };

  const handleQuickEditAmount = async (bonus: VipBonus, newAmt: number) => {
    const updated: VipBonus = { ...bonus, bonusAmount: newAmt };
    setBonuses((prev) => prev.map((b) => (b.id === bonus.id ? updated : b)));
    await saveVipBonusToFirestore(updated);
    showToast(`Updated ${bonus.category === 'month' ? 'Monthly' : 'Weekly'} Bonus to ₹${newAmt}`);
  };

  const handleResetClaims = async (bonus: VipBonus) => {
    const updated: VipBonus = { ...bonus, claimedBy: [] };
    setBonuses((prev) => prev.map((b) => (b.id === bonus.id ? updated : b)));
    await saveVipBonusToFirestore(updated);
    showToast('Reset claims for this bonus card!');
  };

  return (
    <div className="p-3 sm:p-5 md:p-6 space-y-6 w-full max-w-5xl mx-auto">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#002E6E] text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg border border-[#00B9F1] flex items-center gap-2">
          <Check className="w-4 h-4 text-[#00FF00]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Header Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-[#F5B118] to-[#9A5B00] border-2 border-[#FFC928] text-white flex items-center justify-center shrink-0 shadow-md">
            <Crown className="w-6 h-6 text-[#00FF00]" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#002E6E] tracking-tight flex items-center gap-2">
              <span>VIP Bonus Management</span>
              <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                4-Card Live Sync
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Configure Weekly Bonus (₹6) & Monthly Bonus (₹120) cards, minimum investment eligibility, and VIP levels.
            </p>
          </div>
        </div>
      </div>

      {/* Add New VIP Bonus Card Form */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="font-black text-sm sm:text-base text-[#002E6E] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#00B9F1]" />
          <span>Add / Configure VIP Bonus Card</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">VIP Level (1-10)</label>
            <input
              type="number"
              min={1}
              max={10}
              value={newBonus.vipLevel ?? 2}
              onChange={(e) => setNewBonus({ ...newBonus, vipLevel: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-[#00B9F1]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Bonus Type</label>
            <select
              value={newBonus.category}
              onChange={(e) => setNewBonus({ ...newBonus, category: e.target.value as any })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-[#00B9F1]"
            >
              <option value="week">Weekly Bonus (Gift Icon)</option>
              <option value="month">Monthly Bonus (Calendar Icon)</option>
              <option value="vipLevelOffer">VIP Level Offer</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Bonus Amount (₹)</label>
            <input
              type="number"
              min={1}
              value={newBonus.bonusAmount ?? 6}
              onChange={(e) => setNewBonus({ ...newBonus, bonusAmount: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-[#B87908] focus:outline-none focus:border-[#00B9F1]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Min Investment (₹)</label>
            <input
              type="number"
              min={0}
              value={newBonus.minInvestAmount ?? 0}
              onChange={(e) => setNewBonus({ ...newBonus, minInvestAmount: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-[#00B9F1]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Validity Date</label>
            <input
              type="date"
              value={newBonus.validityDate || ''}
              onChange={(e) => setNewBonus({ ...newBonus, validityDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-[#00B9F1]"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 bg-[#002E6E] hover:bg-[#00204d] text-white font-black text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-[#00B9F1]" />}
          <span>Save VIP Bonus Card</span>
        </button>
      </div>

      {/* Active Bonus Cards List */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-sm sm:text-base text-[#002E6E]">
            Active VIP Bonus Cards ({bonuses.length})
          </h3>
          <span className="text-xs text-slate-500 font-semibold">
            Synced with User VIP Bonus Screen
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {bonuses.map((b, idx) => {
            const isMonthly = b.category === 'month' || b.category === 'vipLevelOffer';
            return (
              <div
                key={b.id || idx}
                className="flex items-center justify-between p-3.5 rounded-[20px] border-2 border-[#91CFFF] bg-[#F8FCFF] shadow-2xs gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-[#EAF6FF] border border-[#91CFFF] flex items-center justify-center shrink-0 text-[#002E6E]">
                    {isMonthly ? <Calendar className="w-5 h-5 text-[#0055CC]" /> : <Gift className="w-5 h-5 text-[#B87908]" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-[#172B75] truncate">
                        {isMonthly ? 'Monthly Bonus' : 'Weekly Bonus'}
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                        VIP {b.vipLevel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Min Invest: ₹{(b.minInvestAmount || 0).toLocaleString('en-IN')} • Claimed: {(b.claimedBy || []).length}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2 py-1">
                    <span className="text-xs font-black text-[#B87908] mr-1">₹</span>
                    <input
                      type="number"
                      value={b.bonusAmount}
                      onChange={(e) => handleQuickEditAmount(b, parseInt(e.target.value) || 0)}
                      className="w-14 text-sm font-black text-[#B87908] focus:outline-none"
                      title="Edit Bonus Amount"
                    />
                  </div>

                  {(b.claimedBy || []).length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleResetClaims(b)}
                      className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                      title="Reset Claims"
                    >
                      Reset
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => deleteVipBonusFromFirestore(b.id).then(loadBonuses)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Bonus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
