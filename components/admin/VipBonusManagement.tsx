'use client';
import React, { useState, useEffect } from 'react';
import { Crown, Trash2, Save } from 'lucide-react';
import { VipBonus } from '@/types/investment';
import { getVipBonusesFromFirestore, saveVipBonusToFirestore, deleteVipBonusFromFirestore } from '@/lib/firebase';

export default function VipBonusManagement() {
  const [bonuses, setBonuses] = useState<VipBonus[]>([]);
  const [newBonus, setNewBonus] = useState<Partial<VipBonus>>({
    vipLevel: 1,
    minInvestAmount: 0,
    bonusAmount: 0,
    category: 'week',
    validityDate: '',
  });

  useEffect(() => {
    loadBonuses();
  }, []);

  const loadBonuses = async () => {
    const data = await getVipBonusesFromFirestore();
    setBonuses(data);
  };

  const handleSave = async () => {
    if (!newBonus.vipLevel || !newBonus.bonusAmount) return;
    const bonus: VipBonus = {
      id: `bonus_${Date.now()}`,
      vipLevel: newBonus.vipLevel,
      minInvestAmount: newBonus.minInvestAmount || 0,
      bonusAmount: newBonus.bonusAmount || 0,
      category: newBonus.category || 'week',
      validityDate: newBonus.validityDate || '',
      claimedBy: [],
    };
    await saveVipBonusToFirestore(bonus);
    loadBonuses();
    setNewBonus({ vipLevel: 1, minInvestAmount: 0, bonusAmount: 0, category: 'week', validityDate: '' });
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-black text-slate-800">VIP Bonus Management</h2>
      
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="font-bold text-sm">Add New VIP Bonus</h3>
        <div className="grid grid-cols-2 gap-3">
          <input type="number" placeholder="VIP Level (1-10)" value={newBonus.vipLevel} onChange={e => setNewBonus({...newBonus, vipLevel: parseInt(e.target.value)})} className="p-2 border rounded" />
          <input type="number" placeholder="Min Investment Amount" value={newBonus.minInvestAmount} onChange={e => setNewBonus({...newBonus, minInvestAmount: parseInt(e.target.value)})} className="p-2 border rounded" />
          <input type="number" placeholder="Bonus Amount" value={newBonus.bonusAmount} onChange={e => setNewBonus({...newBonus, bonusAmount: parseInt(e.target.value)})} className="p-2 border rounded" />
          <select value={newBonus.category} onChange={e => setNewBonus({...newBonus, category: e.target.value as any})} className="p-2 border rounded">
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="vipLevelOffer">VIP Level Offer</option>
          </select>
          <input type="date" value={newBonus.validityDate} onChange={e => setNewBonus({...newBonus, validityDate: e.target.value})} className="p-2 border rounded" />
        </div>
        <button onClick={handleSave} className="bg-blue-600 text-white p-2 rounded flex items-center gap-2"><Save className="w-4 h-4" /> Save Bonus</button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="font-bold text-sm">Active Bonuses</h3>
        {bonuses.map(b => (
          <div key={b.id} className="flex justify-between items-center p-3 border rounded">
            <div>
              <p className="font-bold">VIP {b.vipLevel} - {b.category}</p>
              <p className="text-xs text-slate-500">Bonus: ₹{b.bonusAmount} (Min Inv: ₹{b.minInvestAmount})</p>
            </div>
            <button onClick={() => deleteVipBonusFromFirestore(b.id).then(loadBonuses)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
