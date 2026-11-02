'use client';

import React, { useState } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  History,
  CreditCard,
  Building,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { UserStats, Transaction } from '@/types/investment';

interface WalletScreenProps {
  stats: UserStats;
  transactions: Transaction[];
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
}

export default function WalletScreen({
  stats,
  transactions,
  onOpenDeposit,
  onOpenWithdraw,
}: WalletScreenProps) {
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'roi_credit'>('all');

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  return (
    <div className="space-y-4 pb-20 sm:pb-8 bg-slate-50 min-h-screen">
      {/* Wallet Balance Hero Card */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-600 font-bold flex items-center gap-1.5">
              <Wallet className="w-4.5 h-4.5 text-[#020618] stroke-[2.2]" />
              <span className="text-slate-800">Available Wallet Balance</span>
            </span>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              Verified 24/7
            </span>
          </div>

          <div className="my-2">
            <h2 className="text-3xl sm:text-4xl font-serif font-black font-mono tracking-tight text-slate-900">
              ₹{stats.walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h2>
            <span className="text-xs text-slate-500 font-medium">Net withdrawable funds</span>
          </div>

          {/* Deposit & Withdraw Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100">
            {/* Add Money Button (#008000) */}
            <button
              onClick={onOpenDeposit}
              style={{ backgroundColor: '#008000' }}
              className="py-2.5 px-3 rounded-xl hover:brightness-110 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <ArrowDownLeft className="w-4 h-4 stroke-[3]" />
              <span>Add Money</span>
            </button>

            {/* Withdraw Button (#FF8904) */}
            <button
              onClick={onOpenWithdraw}
              style={{ backgroundColor: '#FF8904' }}
              className="py-2.5 px-3 rounded-xl hover:brightness-110 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              <span>Withdraw</span>
            </button>
          </div>
        </div>
      </div>

      {/* Instant Transfer Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex items-center gap-3 shadow-2xs">
        <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs">
          <span className="font-serif font-black text-slate-900 block">Instant Automated Payouts</span>
          <span className="text-slate-600 leading-tight font-medium">
            Direct UPI and IMPS bank transfers processed within 60 seconds with 0% gateway deductions.
          </span>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between px-1">
          <h4 className="font-serif font-black text-slate-900 text-sm">Transaction Logs</h4>
          <span className="text-xs text-slate-500 font-bold">{filteredTransactions.length} records</span>
        </div>

        {/* Transaction Filter Buttons (#1A7595 for selected) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'deposit', label: 'Deposits' },
            { id: 'withdrawal', label: 'Withdrawals' },
            { id: 'roi_credit', label: 'Daily ROI' },
          ].map((tab) => {
            const isSelected = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                style={isSelected ? { backgroundColor: '#1A7595', borderColor: '#1A7595' } : {}}
                className={`px-3.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'text-white shadow-2xs font-extrabold'
                    : 'bg-slate-100 text-slate-600 border border-slate-200/80 hover:bg-slate-200/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Transactions List View (NO CARD BOX, NO BG COLOR, BOTTOM LINE DIVIDER ONLY) */}
        <div className="divide-y divide-slate-200/80 pt-1">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((tx) => {
              const isCredit =
                tx.type === 'deposit' || tx.type === 'roi_credit' || tx.type === 'referral_bonus';

              return (
                <div
                  key={tx.id}
                  className="py-3 bg-transparent border-b border-slate-200/80 flex items-center justify-between gap-3 transition-colors hover:bg-slate-50/50 px-1"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isCredit
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </div>

                    <div className="truncate min-w-0">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 block truncate">
                        {tx.title}
                      </span>
                      <span className="text-[10.5px] text-slate-500 block font-medium">
                        {tx.timestamp} • Ref: {tx.referenceId}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-xs sm:text-sm font-black block font-mono ${
                        isCredit ? 'text-emerald-700' : 'text-slate-900'
                      }`}
                    >
                      {isCredit ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        tx.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-slate-500 text-xs font-semibold">
              No transactions found for this filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
