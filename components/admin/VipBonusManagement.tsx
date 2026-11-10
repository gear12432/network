'use client';

import React, { useState, useEffect } from 'react';
import { Crown, Trash2, Save, Gift, Calendar, Sparkles, RefreshCw, Check, Clock } from 'lucide-react';
import { VipBonus } from '@/types/investment';
import {
  getVipBonusesFromFirestore,
  saveVipBonusToFirestore,
  deleteVipBonusFromFirestore,
  db,
} from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function VipBonusManagement() {
  const [bonuses, setBonuses] = useState<VipBonus[]>([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const getDefaultValidityDate = (cat: string) => {
    const days = cat === 'week' ? 7 : 30;
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  };

  const [newBonus, setNewBonus] = useState<{
    vipLevel: string;
    minInvestAmount: string;
    bonusAmount: string;
    category: 'week' | 'month' | 'vipLevelOffer';
    validityDate: string;
  }>({
    vipLevel: '1',
    minInvestAmount: '1000',
    bonusAmount: '10',
    category: 'week',
    validityDate: getDefaultValidityDate('week'),
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const loadBonuses = async () => {
    const data = await getVipBonusesFromFirestore();
    setBonuses(data || []);
  };

  useEffect(() => {
    loadBonuses();

    try {
      const ref = collection(db, 'vip_bonuses');
      const unsub = onSnapshot(
        ref,
        (snap) => {
          const list: VipBonus[] = [];
          snap.forEach((d) => list.push({ ...(d.data() as VipBonus), id: d.id }));
          setBonuses(list);
          if (typeof window !== 'undefined') {
            localStorage.setItem('network_join_pro_vip_bonuses', JSON.stringify(list));
          }
        },
        () => {}
      );
      return () => unsub();
    } catch {}
  }, []);

  const handleCategoryChange = (cat: 'week' | 'month' | 'vipLevelOffer') => {
    setNewBonus((prev) => ({
      ...prev,
      category: cat,
      validityDate: getDefaultValidityDate(cat),
    }));
  };

  const handleSave = async () => {
    const vipLvl = parseInt(newBonus.vipLevel, 10) || 1;
    const minInv = parseInt(newBonus.minInvestAmount, 10) || 0;
    const bonusAmt = parseInt(newBonus.bonusAmount, 10) || 0;

    if (!bonusAmt || bonusAmt <= 0) {
      showToast('Please enter a valid Bonus Amount!');
      return;
    }

    setSaving(true);
    const durationDays = newBonus.category === 'week' ? 7 : 30;
    const bonus: VipBonus = {
      id: `bonus_${Date.now()}`,
      vipLevel: vipLvl,
      minInvestAmount: minInv,
      bonusAmount: bonusAmt,
      category: newBonus.category,
      durationDays,
      validityDate: newBonus.validityDate || getDefaultValidityDate(newBonus.category),
      createdAt: new Date().toISOString(),
      claimedBy: [],
      userProgress: {},
    };

    await saveVipBonusToFirestore(bonus);
    await loadBonuses();
    setSaving(false);
    showToast(
      `Saved VIP ${vipLvl} ${
        bonus.category === 'week' ? 'Weekly (7 Days)' : 'Monthly (30 Days)'
      } Bonus ₹${bonusAmt} (Min Invest: ₹${minInv})!`
    );
  };

  const handleQuickEditAmount = async (bonus: VipBonus, newAmt: number) => {
    const updated: VipBonus = { ...bonus, bonusAmount: newAmt };
    setBonuses((prev) => prev.map((b) => (b.id === bonus.id ? updated : b)));
    await saveVipBonusToFirestore(updated);
    showToast(`Updated Bonus Amount to ₹${newAmt}`);
  };

  const handleResetClaims = async (bonus: VipBonus) => {
    const updated: VipBonus = { ...bonus, claimedBy: [], userProgress: {} };
    setBonuses((prev) => prev.map((b) => (b.id === bonus.id ? updated : b)));
    await saveVipBonusToFirestore(updated);
    showToast('Reset claims & timer for this bonus!');
  };

  const handleDelete = async (id: string) => {
    await deleteVipBonusFromFirestore(id);
    await loadBonuses();
    showToast('Deleted VIP Bonus rule!');
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
                Live User Sync
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Set VIP Level, Minimum Customer Investment, Bonus Amount, and Category. Weekly bonuses stay active for 7 days and auto-delete after 7 days; Monthly bonuses stay active for 30 days.
            </p>
          </div>
        </div>
      </div>

      {/* Add New VIP Bonus Card Form */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="font-black text-sm sm:text-base text-[#002E6E] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#00B9F1]" />
          <span>Add New VIP Bonus</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">VIP Level (1-10)</label>
            <input
              type="number"
              min={1}
              max={10}
              placeholder="VIP Level (1-10)"
              value={newBonus.vipLevel}
              onChange={(e) => setNewBonus({ ...newBonus, vipLevel: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-[#00B9F1]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Min Investment Amount (₹)</label>
            <input
              type="number"
              min={0}
              placeholder="e.g. 1000"
              value={newBonus.minInvestAmount}
              onChange={(e) => setNewBonus({ ...newBonus, minInvestAmount: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-[#00B9F1]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Bonus Amount (₹)</label>
            <input
              type="number"
              min={1}
              placeholder="e.g. 10"
              value={newBonus.bonusAmount}
              onChange={(e) => setNewBonus({ ...newBonus, bonusAmount: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-black text-[#B87908] focus:outline-none focus:border-[#00B9F1]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Category</label>
            <select
              value={newBonus.category}
              onChange={(e) => handleCategoryChange(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-[#00B9F1]"
            >
              <option value="week">Week (7 Days Validity)</option>
              <option value="month">Month (30 Days Validity)</option>
              <option value="vipLevelOffer">VIP Level Offer</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600">Offer End Date</label>
            <input
              type="date"
              value={newBonus.validityDate}
              onChange={(e) => setNewBonus({ ...newBonus, validityDate: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-[#00B9F1]"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Bonus</span>
          </button>

          <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
            Example: VIP Level 1 • Min Investment ₹1,000 • Bonus ₹10 • Week → Shows ₹10 Weekly Bonus to user once customer investment reaches ₹1,000, valid for 7 days then auto-deletes.
          </p>
        </div>
      </div>

      {/* Active Bonuses List */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-sm sm:text-base text-[#002E6E]">
            Active Bonuses ({bonuses.length})
          </h3>
          <span className="text-xs text-slate-500 font-semibold">
            Synced with User VIP Bonus Screen
          </span>
        </div>

        {bonuses.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-500 text-sm font-medium">
            No VIP Bonuses configured yet. Use the form above to add a Weekly or Monthly bonus!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {bonuses.map((b, idx) => {
              const isMonthly = b.category === 'month' || b.category === 'vipLevelOffer';
              const validityDays = b.durationDays || (b.category === 'week' ? 7 : 30);
              return (
                <div
                  key={b.id || idx}
                  className="flex items-center justify-between p-3.5 rounded-[20px] border-2 border-[#91CFFF] bg-[#F8FCFF] shadow-2xs gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-[#EAF6FF] border border-[#91CFFF] flex items-center justify-center shrink-0 text-[#002E6E]">
                      {isMonthly ? (
                        <Calendar className="w-5 h-5 text-[#0055CC]" />
                      ) : (
                        <Gift className="w-5 h-5 text-[#B87908]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-[#172B75]">
                          VIP {b.vipLevel} - {b.category}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {validityDays} Days Auto-Delete
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">
                        Bonus: ₹{b.bonusAmount} (Min Inv: ₹{(b.minInvestAmount || 0).toLocaleString('en-IN')})
                      </p>
                      {b.validityDate && (
                        <p className="text-[10px] text-slate-400">
                          Valid Until: {b.validityDate} • Claimed: {(b.claimedBy || []).length}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2 py-1">
                      <span className="text-xs font-black text-[#B87908] mr-1">₹</span>
                      <input
                        type="number"
                        value={b.bonusAmount}
                        onChange={(e) => handleQuickEditAmount(b, parseInt(e.target.value, 10) || 0)}
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
                      onClick={() => handleDelete(b.id)}
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
        )}
      </div>
    </div>
  );
}
