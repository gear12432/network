'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  Copy,
  Check,
  Share2,
  Download,
  Building,
  CreditCard,
  Wallet,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  HelpCircle,
  ExternalLink,
  Receipt,
  Eye,
  X,
} from 'lucide-react';
import { Transaction, UserStats } from '@/types/investment';
import HelpdeskChatModal from '@/components/modals/HelpdeskChatModal';

interface TransactionDetailsModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  userStats?: UserStats;
  onOpenSupport?: () => void;
}

export default function TransactionDetailsModal({
  isOpen,
  transaction,
  onClose,
  userStats,
  onOpenSupport,
}: TransactionDetailsModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isTransferDetailsExpanded, setIsTransferDetailsExpanded] = useState<boolean>(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [shareToast, setShareToast] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  if (!isOpen || !transaction) return null;

  const copyToClipboard = (text: string, fieldName: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleShare = () => {
    const text = `Transaction Receipt\nID: ${transaction.referenceId || transaction.id}\nAmount: ₹${transaction.amount}\nStatus: ${transaction.status.toUpperCase()}\nDate: ${transaction.timestamp}\nPowered by Network Join Pro`;
    if (navigator.share) {
      navigator.share({
        title: 'Transaction Receipt',
        text: text,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    }
  };

  // Status Colors:
  // Successful -> Green #07865B
  // Failed -> Red #DC2626
  // Pending -> Amber/Yellow #D97706 / #FFC928
  const isSuccess =
    transaction.status === 'completed' ||
    (transaction.status as string) === 'Approved' ||
    (transaction.status as string) === 'Successful';
  const isFailed =
    transaction.status === 'failed' || (transaction.status as string) === 'Rejected';
  const isPending = !isSuccess && !isFailed;

  const headerBgColor = isSuccess
    ? 'bg-[#07865B]'
    : isFailed
    ? 'bg-[#DC2626]'
    : 'bg-[#D97706]';

  const statusTitle = isSuccess
    ? 'Transaction Successful'
    : isFailed
    ? 'Transaction Failed'
    : 'Transaction Pending';

  const isCredit =
    transaction.type === 'deposit' ||
    transaction.type === 'roi_credit' ||
    transaction.type === 'referral_bonus';

  // "Jahan se pay hua hai wahan top me show hoga, aur jahan credit hua hai wahan niche me show hoga"
  // Source (Top) and Destination (Bottom) Logic:
  let sourceLabel = 'Paid from';
  let sourceName = 'UPI / Bank Account';
  let sourceSubtitle = 'Bank Transfer (IMPS/UPI)';
  let sourceInitials = 'UP';

  let destLabel = 'Credited to';
  let destName = 'Network Join Pro Wallet';
  let destSubtitle = `Wallet UID: ${userStats?.loginUid || 'GK37643'}`;
  let destInitials = 'W';

  if (transaction.type === 'deposit') {
    sourceLabel = 'Paid by';
    sourceName = transaction.senderName || transaction.paidBy || userStats?.userName || 'Account Holder';
    sourceSubtitle = transaction.paymentMethod || 'UPI Payment';
    sourceInitials = (sourceName.slice(0, 2) || 'UP').toUpperCase();

    destLabel = 'Credited to';
    destName = 'Network Join Pro Wallet';
    destSubtitle = `Account: ${userStats?.loginUid || 'User Wallet'}`;
    destInitials = 'NJ';
  } else if (transaction.type === 'withdrawal') {
    sourceLabel = 'Debited from';
    sourceName = 'Network Join Pro Wallet';
    sourceSubtitle = `Withdrawable Funds (UID: ${userStats?.loginUid || 'GK'})`;
    sourceInitials = 'NJ';

    destLabel = 'Credited to (Paid to)';
    destName = transaction.receiverName || transaction.paidTo || transaction.creditedTo || 'Bank Account';
    destSubtitle = transaction.paymentMethod || transaction.bankName || 'Settlement Bank Account';
    destInitials = (destName.slice(0, 2) || 'BA').toUpperCase();
  } else if (transaction.type === 'roi_credit') {
    sourceLabel = 'Paid from';
    sourceName = 'Compounding Yield Reserve';
    sourceSubtitle = 'Daily Automated ROI Return';
    sourceInitials = 'ROI';

    destLabel = 'Credited to';
    destName = 'Available Wallet Balance';
    destSubtitle = `Account: ${userStats?.loginUid || 'User Wallet'}`;
    destInitials = 'W';
  } else if (transaction.type === 'investment') {
    sourceLabel = 'Debited from';
    sourceName = 'Network Join Pro Wallet';
    sourceSubtitle = 'Wallet Main Balance';
    sourceInitials = 'W';

    destLabel = 'Invested in';
    destName = transaction.title || 'Investment Plan';
    destSubtitle = 'Compounding Yield Contract';
    destInitials = 'INV';
  }

  // Display IDs
  const displayTxId =
    transaction.transactionId ||
    transaction.referenceId ||
    `T${Date.now().toString().slice(-14)}`;
  const displayUtr =
    transaction.utrNumber ||
    (transaction.referenceId.startsWith('DEP') || transaction.referenceId.startsWith('WD')
      ? transaction.referenceId
      : `UTR${Math.floor(100000000000 + Math.random() * 900000000000)}`);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Sheet - Smooth Right-to-Left Slide Animation */}
        <motion.div
          key="tx-details-screen"
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{
            type: 'spring',
            damping: 28,
            stiffness: 280,
            mass: 0.85,
          }}
          className="relative z-10 w-full h-full max-w-md mx-auto bg-[#F2F8FC] flex flex-col overflow-hidden shadow-2xl"
        >
          {/* Top Status Header matching Screenshot */}
          <header className={`${headerBgColor} text-white px-4 pt-3 pb-4 shadow-sm transition-colors shrink-0`}>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base sm:text-lg font-black tracking-tight truncate">
                    {statusTitle}
                  </h3>
                  {isSuccess ? (
                    <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                  ) : isFailed ? (
                    <XCircle className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <Clock className="w-4 h-4 stroke-[3]" />
                  )}
                </div>
                <p className="text-xs text-white/90 font-medium truncate mt-0.5">
                  {transaction.timestamp || transaction.dateTime || 'Recent Transaction'}
                </p>
              </div>
            </div>
          </header>

          {/* Main Scrollable Body */}
          <main className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar">
            {/* 1. Paid to / Transferred Card matching Screenshot */}
            <div className="bg-[#FFFFFF] rounded-2xl p-4 border border-[#D9E7F5] shadow-xs space-y-3.5">
              {/* TOP: Where money was paid / debited from */}
              <div className="space-y-1">
                <span className="text-[10px] font-black tracking-wider uppercase text-[#172B75]/60 block">
                  {sourceLabel}
                </span>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#00B9F1] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                      {sourceInitials}
                    </div>
                    <div className="min-w-0">
                      <span className="font-black text-sm text-[#172B75] block truncate">
                        {sourceName}
                      </span>
                      <span className="text-[11px] text-[#172B75]/70 block truncate font-medium">
                        {sourceSubtitle}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-lg sm:text-xl font-black font-mono text-[#002E6E] block">
                      {isCredit ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Divider with Transfer direction */}
              <div className="relative py-1">
                <div className="border-t border-[#D9E7F5]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="px-2 py-0.5 bg-[#EAF5FF] text-[#002E6E] text-[9.5px] font-extrabold rounded-full border border-[#D9E7F5]">
                    {isCredit ? 'CREDIT FLOW ↓' : 'DEBIT FLOW ↓'}
                  </span>
                </div>
              </div>

              {/* BOTTOM: Where money was credited / received */}
              <div className="space-y-1">
                <span className="text-[10px] font-black tracking-wider uppercase text-[#172B75]/60 block">
                  {destLabel}
                </span>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#002E6E] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                      {destInitials}
                    </div>
                    <div className="min-w-0">
                      <span className="font-black text-sm text-[#002E6E] block truncate">
                        {destName}
                      </span>
                      <span className="text-[11px] text-[#172B75]/70 block truncate font-medium">
                        {destSubtitle}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border shrink-0 ${
                      isSuccess
                        ? 'bg-emerald-50 text-[#07865B] border-emerald-200'
                        : isFailed
                        ? 'bg-rose-50 text-[#DC2626] border-rose-200'
                        : 'bg-amber-50 text-[#D97706] border-amber-200'
                    }`}
                  >
                    {transaction.status}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Transfer Details Accordion Container matching Screenshot */}
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#D9E7F5] shadow-xs overflow-hidden">
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => setIsTransferDetailsExpanded(!isTransferDetailsExpanded)}
                className="w-full p-4 flex items-center justify-between bg-white hover:bg-[#F2F8FC] transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[#002E6E]" />
                  <span className="font-black text-xs sm:text-sm text-[#172B75]">
                    Transfer Details
                  </span>
                </div>
                {isTransferDetailsExpanded ? (
                  <ChevronUp className="w-4 h-4 text-[#172B75]/60" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#172B75]/60" />
                )}
              </button>

              {/* Accordion Content */}
              {isTransferDetailsExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-[#D9E7F5] space-y-3 text-xs">
                  {/* Transaction ID with Copy Button */}
                  <div className="space-y-1">
                    <span className="text-[11px] text-[#172B75]/70 font-semibold block">
                      Transaction Reference ID
                    </span>
                    <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#F2F8FC] border border-[#D9E7F5]">
                      <span className="font-mono font-bold text-xs text-[#002E6E] break-all select-all">
                        {displayTxId}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(displayTxId, 'txId')}
                        className="p-1.5 rounded-lg bg-white hover:bg-[#EAF5FF] text-[#002E6E] border border-[#D9E7F5] transition-all cursor-pointer shrink-0"
                        title="Copy Transaction ID"
                      >
                        {copiedField === 'txId' ? (
                          <Check className="w-3.5 h-3.5 text-[#07865B] stroke-[3]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* UTR Number with Copy Button */}
                  <div className="space-y-1">
                    <span className="text-[11px] text-[#172B75]/70 font-semibold block">
                      Bank UTR / Txn Reference
                    </span>
                    <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#F2F8FC] border border-[#D9E7F5]">
                      <span className="font-mono font-bold text-xs text-[#002E6E] break-all select-all">
                        {displayUtr}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(displayUtr, 'utr')}
                        className="p-1.5 rounded-lg bg-white hover:bg-[#EAF5FF] text-[#002E6E] border border-[#D9E7F5] transition-all cursor-pointer shrink-0"
                        title="Copy UTR Number"
                      >
                        {copiedField === 'utr' ? (
                          <Check className="w-3.5 h-3.5 text-[#07865B] stroke-[3]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Payment Method Details */}
                  <div className="flex items-center justify-between py-1 border-b border-[#D9E7F5]/60">
                    <span className="text-[#172B75]/70 font-medium">Payment Mode</span>
                    <span className="font-bold text-[#002E6E] text-right">
                      {transaction.paymentMethod || 'Instant UPI / IMPS'}
                    </span>
                  </div>

                  {/* Timestamp Details */}
                  <div className="flex items-center justify-between py-1 border-b border-[#D9E7F5]/60">
                    <span className="text-[#172B75]/70 font-medium">Date & Time</span>
                    <span className="font-semibold text-[#172B75] text-right">
                      {transaction.timestamp}
                    </span>
                  </div>

                  {/* Screenshot Preview if available */}
                  {transaction.imageUrl && (
                    <div className="pt-2">
                      <span className="text-[11px] text-[#172B75]/70 font-semibold block mb-1.5">
                        Uploaded Payment Screenshot
                      </span>
                      <div
                        onClick={() => setPreviewImage(transaction.imageUrl || null)}
                        className="p-2 rounded-xl bg-[#F2F8FC] border border-[#D9E7F5] flex items-center justify-between cursor-pointer hover:bg-[#EAF5FF] transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={transaction.imageUrl}
                            alt="Receipt"
                            className="w-10 h-10 object-cover rounded-lg border border-[#D9E7F5] bg-white"
                          />
                          <div>
                            <span className="text-xs font-bold text-[#002E6E] block">
                              Receipt Attached
                            </span>
                            <span className="text-[10px] text-[#07865B] font-semibold">
                              Click to view full photo
                            </span>
                          </div>
                        </div>
                        <Eye className="w-4 h-4 text-[#002E6E]" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. Action Buttons Row (Matching PhonePe 3-circular icons) */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              {/* Button 1: View History */}
              <button
                type="button"
                onClick={onClose}
                className="bg-[#FFFFFF] hover:bg-[#EAF5FF] border border-[#D9E7F5] rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-[#EAF5FF] text-[#002E6E] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Clock className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-[11px] font-bold text-[#172B75]">
                  View History
                </span>
              </button>

              {/* Button 2: Share Receipt */}
              <button
                type="button"
                onClick={handleShare}
                className="bg-[#FFFFFF] hover:bg-[#EAF5FF] border border-[#D9E7F5] rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-[#EAF5FF] text-[#00B9F1] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Share2 className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-[11px] font-bold text-[#172B75]">
                  Share Receipt
                </span>
              </button>

              {/* Button 3: Download / Receipt */}
              <button
                type="button"
                onClick={() => copyToClipboard(displayTxId, 'copiedAll')}
                className="bg-[#FFFFFF] hover:bg-[#EAF5FF] border border-[#D9E7F5] rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-[#EAF5FF] text-[#07865B] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Download className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-[11px] font-bold text-[#172B75]">
                  Save Receipt
                </span>
              </button>
            </div>

            {/* Share Feedback Toast */}
            {shareToast && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#07865B] text-xs font-bold text-center">
                Receipt details copied to clipboard!
              </div>
            )}

            {/* 4. Contact Support Card matching Screenshot */}
            <div
              onClick={() => {
                if (onOpenSupport) {
                  onOpenSupport();
                } else {
                  setIsChatOpen(true);
                }
              }}
              className="bg-[#FFFFFF] hover:bg-[#F2F8FC] rounded-2xl p-3.5 border border-[#D9E7F5] flex items-center justify-between shadow-2xs transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#EAF5FF] text-[#002E6E] flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs text-[#172B75] block">
                    Contact 24/7 Support
                  </span>
                  <span className="text-[10px] text-[#172B75]/65 block font-medium">
                    Have questions about this transaction? Chat with us
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#172B75]/50" />
            </div>

            {/* 5. Footer Branding matching Screenshot (Powered by UPI • NPCI) */}
            <div className="pt-2 pb-4 text-center space-y-1">
              <span className="text-[10.5px] text-[#172B75]/60 font-semibold block tracking-wider uppercase">
                Powered by
              </span>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-full border border-[#D9E7F5] shadow-2xs">
                <span className="text-[11px] font-black tracking-widest text-[#002E6E]">UPI</span>
                <span className="text-slate-300">•</span>
                <span className="text-[10px] font-bold text-[#00B9F1]">NPCI GATEWAY</span>
                <span className="text-slate-300">•</span>
                <span className="text-[10px] font-black text-[#172B75]">NETWORK JOIN PRO</span>
              </div>
            </div>
          </main>
        </motion.div>

        {/* Full Image Preview Modal if screenshot clicked */}
        {previewImage && (
          <div className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4">
            <div className="relative max-w-lg w-full bg-white rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-3 bg-slate-900 text-white">
                <span className="text-xs font-bold">Payment Receipt Preview</span>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="p-1 hover:bg-white/20 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-2 max-h-[80vh] overflow-auto flex items-center justify-center bg-slate-100">
                <img
                  src={previewImage}
                  alt="Full receipt"
                  className="max-h-[75vh] w-auto object-contain rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* 24/7 VIP Customer Support Modal */}
        <HelpdeskChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          userStats={userStats}
        />
      </div>
    </AnimatePresence>
  );
}
