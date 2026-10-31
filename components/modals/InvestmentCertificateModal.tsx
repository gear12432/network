'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, ShieldCheck, Award, CheckCircle2, Building, Calendar, Phone, MapPin, User, Sparkles } from 'lucide-react';
import { Customer, InvestmentPlan } from '@/types/investment';
import html2canvas from 'html2canvas';

interface InvestmentCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: InvestmentPlan | null;
  customer: Customer | null;
}

export default function InvestmentCertificateModal({
  isOpen,
  onClose,
  plan,
  customer,
}: InvestmentCertificateModalProps) {
  const certRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isOpen || !plan || !customer) return null;

  const netProfit = (plan.amount * plan.roiPercentage) / 100;
  const totalMaturity = plan.amount + netProfit;
  const certNumber = `BOND-${Math.floor(100000 + Math.random() * 900000)}-2026`;
  const issueDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const maturityDateObj = new Date();
  maturityDateObj.setDate(maturityDateObj.getDate() + plan.durationDays);
  const maturityDateStr = maturityDateObj.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handleDownloadJpg = async () => {
    if (!certRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const image = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.href = image;
      link.download = `${customer.name.replace(/\s+/g, '_')}_Investment_Certificate.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.warn('Certificate JPG download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-70 bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-auto"
        >
          {/* Top Modal Controls Header */}
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span className="text-xs sm:text-sm font-black tracking-wide font-sans">
                Official Investment Certificate
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Download Button ONLY ON DESKTOP VIEW */}
              {isDesktop && (
                <button
                  onClick={handleDownloadJpg}
                  disabled={isDownloading}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isDownloading ? 'Generating JPG...' : 'Download Certificate (JPG)'}</span>
                </button>
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close Certificate"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Certificate Scrollable Container */}
          <div className="p-3 sm:p-6 bg-slate-100 overflow-x-hidden">
            {/* The Printable Certificate Design */}
            <div
              ref={certRef}
              className="bg-white p-5 sm:p-8 rounded-2xl border-8 border-double border-amber-600/80 shadow-xl relative text-slate-900 font-sans space-y-5"
            >
              {/* Background Watermark Crest */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-4">
                <ShieldCheck className="w-80 h-80 text-amber-900" />
              </div>

              {/* Top Certificate Branding Header */}
              <div className="text-center space-y-1 pb-3 border-b-2 border-amber-600/30">
                <div className="flex items-center justify-center gap-2 text-amber-700">
                  <Award className="w-6 h-6 text-amber-600" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Government Registered Investment Bond
                  </span>
                  <Award className="w-6 h-6 text-amber-600" />
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-serif tracking-tight uppercase pt-1">
                  Certificate of Investment Bond
                </h2>
                <p className="text-[11px] text-slate-600 font-semibold max-w-md mx-auto">
                  National Textile Weaver & Agricultural Small Industry Investment Growth Scheme
                </p>
                <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-slate-500 pt-1">
                  <span>Certificate No: <strong className="text-slate-900">{certNumber}</strong></span>
                  <span>•</span>
                  <span>Issue Date: <strong className="text-slate-900">{issueDate}</strong></span>
                </div>
              </div>

              {/* Customer Profile Banner */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-2xs">
                {customer.photo ? (
                  <img
                    src={customer.photo}
                    alt={customer.name}
                    className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-amber-500 shadow-sm shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                    {customer.name.slice(0, 2).toUpperCase()}
                  </div>
                )}

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 truncate">
                      {customer.name}
                    </h3>
                    <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                      ID: {customer.id}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 font-mono">
                      <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>+91 {customer.mobile}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{customer.district}, {customer.state}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 truncate pt-0.5">
                    Address: <strong className="text-slate-800">{customer.address}</strong>
                  </div>
                </div>
              </div>

              {/* Investment & Yield Guarantee Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-blue-600" />
                  <span>Subscribed Bond Investment Terms</span>
                </h4>

                <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                        Investment Plan
                      </span>
                      <h5 className="text-base font-black text-white">{plan.name}</h5>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase block">Investment Deducted</span>
                      <span className="text-xl font-black font-mono text-amber-400">
                        ₹{plan.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-center">
                    <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                      <span className="text-[10px] text-slate-400 block">Duration</span>
                      <span className="font-bold text-white font-mono">{plan.durationDays} Days</span>
                    </div>
                    <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                      <span className="text-[10px] text-slate-400 block">Daily ROI</span>
                      <span className="font-bold text-emerald-400 font-mono">₹{plan.dailyEarnings.toFixed(2)}</span>
                    </div>
                    <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700">
                      <span className="text-[10px] text-slate-400 block">ROI Rate</span>
                      <span className="font-bold text-amber-400 font-mono">+{plan.roiPercentage}%</span>
                    </div>
                    <div className="bg-emerald-950 p-2 rounded-xl border border-emerald-600">
                      <span className="text-[10px] text-emerald-300 block">Total Maturity</span>
                      <span className="font-black text-emerald-400 font-mono">₹{totalMaturity.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Settlement Dates & Bank Account */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Settlement Schedule</span>
                  <div className="flex items-center justify-between text-slate-800">
                    <span>Activation Date:</span>
                    <strong className="font-mono">{issueDate}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-800">
                    <span>Maturity Date:</span>
                    <strong className="font-mono text-emerald-700">{maturityDateStr}</strong>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Linked Direct Payout Account</span>
                  <div className="text-slate-800 font-medium truncate">
                    Bank: <strong>{customer.bankName}</strong>
                  </div>
                  <div className="text-slate-800 font-mono truncate">
                    A/C: <strong>{customer.accountNumber}</strong> • IFSC: <strong>{customer.ifscCode}</strong>
                  </div>
                </div>
              </div>

              {/* Official Seal & Signature Stamp Footer */}
              <div className="pt-3 border-t-2 border-amber-600/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 rounded-full border-2 border-amber-600 bg-amber-50 flex items-center justify-center text-amber-700 font-black text-[9px] text-center uppercase p-1 leading-tight shadow-xs">
                    Official Stamp Verified
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 block">GOVERNMENT APPROVED BOND</span>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Authenticated & Guaranteed
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-serif italic font-bold text-slate-800 text-xs text-amber-800">
                    Auth. Registrar Sign
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono block">Secured Ledger Bond ID: {certNumber}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
