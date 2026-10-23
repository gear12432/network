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
    <div className="space-y-4 pb-20 sm:pb-8">
      {/* Wallet Balance Hero Card */}
      <div className="bg-gradient-to-br from-[#3b200b] via-[#593315] to-[#804c1f] text-white rounded-3xl p-5 shadow-sm border-2 border-[#dfbe7e] relative overflow-hidden">
        {/* Ornate Gold Filigree Corner Accents */}
        <div className="absolute top-1.5 left-2 text-[#e5ab48] text-xs select-none">✦</div>
        <div className="absolute top-1.5 right-2 text-[#e5ab48] text-xs select-none">✦</div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#fed788] font-serif font-bold flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-[#ffd786]" />
              <span>Available Wallet Balance</span>
            </span>
            <span className="text-[10px] bg-[#fff0cc]/20 text-[#ffe2a2] font-bold px-2 py-0.5 rounded-full border border-[#d6a54d]/50">
              Verified 24/7
            </span>
          </div>

          <div className="my-2">
            <h2 className="text-3xl sm:text-4xl font-serif font-black font-mono tracking-tight text-white drop-shadow-xs">
              ₹{stats.walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h2>
            <span className="text-xs text-[#fdebd0]/80">Net withdrawable funds</span>
          </div>

          {/* Deposit & Withdraw Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-4 pt-2 border-t border-white/15">
            <button
              onClick={onOpenDeposit}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#d9a54c] via-[#e5ab48] to-[#be8832] hover:brightness-105 active:scale-95 text-[#3d2008] font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-md"
            >
              <ArrowDownLeft className="w-4 h-4 stroke-[3]" />
              <span>Add Money</span>
            </button>

            <button
              onClick={onOpenWithdraw}
              className="py-2.5 px-3 rounded-xl bg-[#4e2e0f] hover:bg-[#3b220a] active:scale-95 text-[#ffebbe] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all border border-[#d6a54d]/60 shadow-xs"
            >
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              <span>Withdraw</span>
            </button>
          </div>
        </div>
      </div>

      {/* Instant Transfer Banner */}
      <div className="bg-gradient-to-r from-[#fff9eb] via-[#fcf3e0] to-[#f6e5c5] border border-[#dfbe7e] rounded-2xl p-3.5 flex items-center gap-3 shadow-2xs">
        <div className="w-9 h-9 rounded-xl bg-[#4e2e0f] text-[#fed788] flex items-center justify-center shrink-0 shadow-xs">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs">
          <span className="font-serif font-black text-[#46280b] block">Instant Automated Payouts</span>
          <span className="text-[#784f29] leading-tight">
            Direct UPI and IMPS bank transfers processed within 60 seconds with 0% gateway deductions.
          </span>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <h4 className="font-serif font-black text-[#46280b] text-sm">Transaction Logs</h4>
          <span className="text-xs text-[#8a5b28] font-bold">{filteredTransactions.length} records</span>
        </div>

        {/* Transaction Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'deposit', label: 'Deposits' },
            { id: 'withdrawal', label: 'Withdrawals' },
            { id: 'roi_credit', label: 'Daily ROI' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-2xs ${
                filter === tab.id
                  ? 'bg-gradient-to-r from-[#4e2e0f] to-[#3a1d06] text-[#fed788] border border-[#caa050] font-bold'
                  : 'bg-white/90 text-[#71471f] border border-[#dfbe7e] hover:bg-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        <div className="space-y-2">
          {filteredTransactions.map((tx) => {
            const isCredit =
              tx.type === 'deposit' || tx.type === 'roi_credit' || tx.type === 'referral_bonus';

            return (
              <div
                key={tx.id}
                className="bg-gradient-to-b from-[#fffefc] via-[#fffbf3] to-[#fbf2dd] rounded-2xl p-3 border border-[#dfc38d] shadow-2xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isCredit
                        ? 'bg-[#faecd4] text-[#965c19] border border-[#ebd2aa]'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {isCredit ? (
                      <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                    )}
                  </div>

                  <div className="truncate">
                    <span className="font-serif font-black text-xs text-[#46280b] block truncate">
                      {tx.title}
                    </span>
                    <span className="text-[10px] text-[#86592a] block">
                      {tx.timestamp} • Ref: {tx.referenceId}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-xs sm:text-sm font-black block font-mono ${
                      isCredit ? 'text-[#965c19]' : 'text-slate-900'
                    }`}
                  >
                    {isCredit ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[9px] font-bold text-[#8c5929] uppercase bg-[#faecd4] border border-[#e5cfab] px-1.5 py-0.2 rounded-full">
                    {tx.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
