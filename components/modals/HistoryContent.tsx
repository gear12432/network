'use client';

import React, { useState } from 'react';
import { Transaction, UserStats } from '@/types/investment';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  CheckCircle2,
  Clock,
  Headset,
  HelpCircle,
} from 'lucide-react';
import HelpdeskChatModal from '@/components/modals/HelpdeskChatModal';
import TransactionDetailsModal from '@/components/modals/TransactionDetailsModal';

interface HistoryContentProps {
  transactions: Transaction[];
  userStats?: UserStats;
}

export default function HistoryContent({ transactions, userStats }: HistoryContentProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

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
      {/* Search Input (Colors: Card #FFFFFF, Text #172B75, Secondary #00B9F1, Primary #002E6E) */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#002E6E] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by ID, title, or amount..."
          className="w-full pl-9 pr-4 py-2.5 bg-[#FFFFFF] border-2 border-[#D0E4F5] rounded-xl text-xs sm:text-sm text-[#172B75] placeholder-[#172B75]/40 font-medium focus:outline-none focus:ring-2 focus:ring-[#00B9F1]/20 focus:border-[#00B9F1] shadow-2xs transition-all"
        />
      </div>

      {/* Filter Tabs (Colors: Primary #002E6E, Card #FFFFFF, Text #172B75, Secondary #00B9F1) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {[
          { id: 'all', label: 'All Records' },
          { id: 'deposit', label: 'Deposits' },
          { id: 'withdrawal', label: 'Withdrawals' },
          { id: 'roi_credit', label: 'Daily Yield' },
          { id: 'referral_bonus', label: 'Referrals' },
          { id: 'investment', label: 'Plans Joined' },
        ].map((tab) => {
          const isActive = filterType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#002E6E] text-white shadow-xs shadow-[#002E6E]/30 border border-[#002E6E]'
                  : 'bg-[#FFFFFF] text-[#172B75] border border-[#D0E4F5] hover:bg-[#E5F3FC] hover:text-[#002E6E]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-10 bg-[#FFFFFF] rounded-2xl border border-[#D0E4F5] text-[#172B75] text-xs font-medium shadow-xs">
            No transactions found for this filter
          </div>
        ) : (
          filtered.map((tx) => {
            const isCredit =
              tx.type === 'deposit' || tx.type === 'roi_credit' || tx.type === 'referral_bonus';

            return (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="bg-[#FFFFFF] rounded-2xl p-4 border border-[#D9E7F5] shadow-xs space-y-2.5 hover:border-[#00B9F1] hover:shadow-md transition-all cursor-pointer group"
              >
                {/* Top Section: Icon, Title, Date, Amount & Status */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 ${
                        isCredit
                          ? 'bg-[#E5F9F6] text-[#059669] border-[#A7F3D0]'
                          : 'bg-[#F0F5FA] text-[#002E6E] border-[#D0E4F5]'
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft className="w-5 h-5 stroke-[2.2]" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 stroke-[2.2]" />
                      )}
                    </div>

                    <div className="truncate min-w-0">
                      <span className="text-xs sm:text-sm font-extrabold text-[#172B75] block truncate group-hover:text-[#002E6E]">
                        {tx.title}
                      </span>
                      <span className="text-[11px] text-[#172B75]/70 block font-medium">
                        {tx.timestamp}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-sm sm:text-base font-black font-mono block ${
                        isCredit ? 'text-[#059669]' : 'text-[#172B75]'
                      }`}
                    >
                      {isCredit ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] font-bold text-[#002E6E] bg-[#E5F3FC] border border-[#00B9F1]/40 px-2 py-0.5 rounded inline-block uppercase tracking-wider">
                      {tx.status}
                    </span>
                  </div>
                </div>

                {/* Details Line */}
                <div className="pt-2 border-t border-[#E8EFF6] flex items-center justify-between text-[11px] text-[#172B75]/80 font-medium">
                  <span className="truncate">Ref: {tx.referenceId}</span>
                  {tx.paymentMethod && <span className="shrink-0 ml-2">{tx.paymentMethod}</span>}
                </div>

                {/* Separator Line with Customer Care Section */}
                <div className="pt-2.5 border-t border-[#E8EFF6] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00B9F1] shrink-0 animate-pulse" />
                    <span className="text-[11px] sm:text-xs font-bold text-[#172B75] truncate">
                      Tap card to view full receipt
                    </span>
                  </div>

                  {/* Customer Care Icon Button - Opens Chat Screen */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsChatOpen(true);
                    }}
                    title="Open Customer Care Chat"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#002E6E] hover:bg-[#00204d] text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
                  >
                    <Headset className="w-4 h-4 text-[#00B9F1] shrink-0" />
                    <span className="hidden xs:inline">Customer Care</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 24/7 VIP Customer Care Chat Modal */}
      <HelpdeskChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        userStats={userStats}
      />

      {/* Transaction Details Modal (PhonePe / UPI style with smooth right-to-left slide animation) */}
      <TransactionDetailsModal
        isOpen={!!selectedTx}
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
        userStats={userStats}
        onOpenSupport={() => setIsChatOpen(true)}
      />
    </div>
  );
}
