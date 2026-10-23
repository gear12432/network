'use client';

import React, { useState } from 'react';
import { Transaction } from '@/types/investment';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  CheckCircle2,
  Clock,
  Download,
  Filter,
} from 'lucide-react';

interface HistoryContentProps {
  transactions: Transaction[];
}

export default function HistoryContent({ transactions }: HistoryContentProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      !searchTerm ||
      tx.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.referenceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.amount.toString().includes(searchTerm);

    const matchesFilter = filterType === 'all' || tx.type === filterType;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by ID, title, or amount..."
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {[
          { id: 'all', label: 'All Records' },
          { id: 'deposit', label: 'Deposits' },
          { id: 'withdrawal', label: 'Withdrawals' },
          { id: 'roi_credit', label: 'Daily Yield' },
          { id: 'referral_bonus', label: 'Referrals' },
          { id: 'investment', label: 'Plans Joined' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              filterType === tab.id
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="space-y-2.5">
        {filtered.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No transactions found for this filter
          </div>
        ) : (
          filtered.map((tx) => {
            const isCredit =
              tx.type === 'deposit' || tx.type === 'roi_credit' || tx.type === 'referral_bonus';

            return (
              <div
                key={tx.id}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-2 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft className="w-5 h-5 stroke-[2.2]" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 stroke-[2.2]" />
                      )}
                    </div>

                    <div className="truncate">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate">
                        {tx.title}
                      </span>
                      <span className="text-[11px] text-slate-400 block">{tx.timestamp}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-sm sm:text-base font-extrabold font-mono block ${
                        isCredit ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {isCredit ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded inline-block">
                      {tx.status}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Ref: {tx.referenceId}</span>
                  {tx.paymentMethod && <span>{tx.paymentMethod}</span>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
