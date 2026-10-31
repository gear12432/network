'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, ShieldCheck, Award, CheckCircle2, Phone, MapPin, Building2, QrCode } from 'lucide-react';
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
  const certNumber = `NJP-CERT-${Math.floor(100000 + Math.random() * 900000)}`;
  const issueDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const maturityDateObj = new Date();
  maturityDateObj.setDate(maturityDateObj.getDate() + plan.durationDays);
  const maturityDateStr = maturityDateObj.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
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
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto"
        >
          {/* Top Modal Navigation Header */}
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span className="text-xs sm:text-sm font-bold tracking-wide">
                Investment Bond Certificate
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Download Button - VISIBLE ONLY ON DESKTOP */}
              {isDesktop && (
                <button
                  onClick={handleDownloadJpg}
                  disabled={isDownloading}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isDownloading ? 'Downloading...' : 'Download Certificate (JPG)'}</span>
                </button>
              )}

              {/* Top-Right Close X Button */}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Certificate Display Area */}
          <div className="p-2 sm:p-4 bg-slate-100 overflow-x-hidden">
            {/* Standard ISO Certificate Container with Decorative Orange Borders */}
            <div
              ref={certRef}
              className="bg-white p-4 sm:p-7 rounded-xl border-2 border-amber-500/80 shadow-lg relative text-slate-900 font-sans space-y-4 overflow-hidden"
            >
              {/* Decorative Corner Graphics (Orange Gradient Vectors inspired by reference image) */}
              <div className="absolute top-0 left-0 w-28 h-28 pointer-events-none opacity-90">
                <svg viewBox="0 0 100 100" className="w-full h-full text-amber-500 fill-current">
                  <path d="M0 0 L100 0 C60 20 20 60 0 100 Z" />
                </svg>
              </div>
              <div className="absolute top-0 right-0 w-28 h-28 pointer-events-none opacity-90">
                <svg viewBox="0 0 100 100" className="w-full h-full text-amber-600 fill-current">
                  <path d="M100 0 L0 0 C40 20 80 60 100 100 Z" />
                </svg>
              </div>
              <div className="absolute bottom-0 right-0 w-32 h-32 pointer-events-none opacity-90">
                <svg viewBox="0 0 100 100" className="w-full h-full text-amber-500 fill-current">
                  <path d="M100 100 L0 100 C40 80 80 40 100 0 Z" />
                </svg>
              </div>
              <div className="absolute bottom-0 left-0 w-24 h-24 pointer-events-none opacity-90">
                <svg viewBox="0 0 100 100" className="w-full h-full text-amber-600 fill-current">
                  <path d="M0 100 L100 100 C60 80 20 40 0 0 Z" />
                </svg>
              </div>

              {/* Subtly Embedded Shield Background Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-4">
                <ShieldCheck className="w-72 h-72 text-amber-700" />
              </div>

              {/* Header Branding & ISO Title */}
              <div className="relative z-10 text-center space-y-1 pt-1 border-b border-amber-200 pb-3">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-amber-500 text-white font-black text-sm flex items-center justify-center shadow-sm">
                    NJP
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-amber-700 uppercase font-serif pt-1">
                  CERTIFICATE
                </h1>
                <p className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-widest">
                  OF INVESTMENT BOND PARTICIPATION
                </p>
                <div className="text-[11px] text-slate-500 font-medium">
                  This is to certify that Investment Bond Subscription of:
                </div>
              </div>

              {/* Customer Primary Details Section */}
              <div className="relative z-10 bg-amber-50/50 border border-amber-200/80 rounded-xl p-3 sm:p-4 flex items-center gap-3.5">
                {customer.photo ? (
                  <img
                    src={customer.photo}
                    alt={customer.name}
                    className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl object-cover border-2 border-amber-500 shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl bg-blue-600 text-white font-black text-xl flex items-center justify-center border-2 border-white shadow-xs shrink-0">
                    {customer.name.slice(0, 2).toUpperCase()}
                  </div>
                )}

                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase truncate">
                      {customer.name}
                    </h2>
                    <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
                      ID: {customer.id}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 flex items-center gap-3">
                    <span className="flex items-center gap-1 font-mono font-semibold">
                      <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      +91 {customer.mobile}
                    </span>
                    <span className="flex items-center gap-1 truncate font-medium">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      {customer.district}, {customer.state}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 truncate pt-0.5">
                    <strong>Address:</strong> {customer.address} (PIN: {customer.pinCode || '226010'})
                  </div>
                </div>
              </div>

              {/* Scope & Investment Details Table (Clean white layout with clean grid) */}
              <div className="relative z-10 space-y-2">
                <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider text-center">
                  Has been assessed and registered for official bond scheme:
                </div>

                <div className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden text-xs">
                  {/* Scheme Header Row */}
                  <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black text-amber-700 uppercase block">Application Name</span>
                      <strong className="text-sm font-black text-slate-900">NETWORK JOIN PRO</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Selected Plan</span>
                      <span className="font-bold text-blue-700">{plan.name}</span>
                    </div>
                  </div>

                  {/* Clean Terms Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-200 text-center">
                    <div className="p-2.5">
                      <span className="text-[10px] text-slate-500 font-semibold block">Invested Amount</span>
                      <span className="text-base font-black text-slate-900 font-mono">
                        ₹{plan.amount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="p-2.5">
                      <span className="text-[10px] text-slate-500 font-semibold block">Daily Return</span>
                      <span className="text-base font-black text-emerald-600 font-mono">
                        ₹{plan.dailyEarnings.toFixed(2)}
                      </span>
                    </div>

                    <div className="p-2.5">
                      <span className="text-[10px] text-slate-500 font-semibold block">Return Amount</span>
                      <span className="text-base font-black text-blue-600 font-mono">
                        ₹{netProfit.toFixed(2)}
                      </span>
                    </div>

                    <div className="p-2.5 bg-amber-50/60">
                      <span className="text-[10px] text-amber-800 font-bold block">Total Maturity Amount</span>
                      <span className="text-base font-black text-amber-900 font-mono">
                        ₹{totalMaturity.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Certificate Audit & Expiry Dates */}
              <div className="relative z-10 grid grid-cols-2 gap-3 text-[11px]">
                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">Certificate Serial</span>
                  <span className="font-mono font-bold text-slate-900">{certNumber}</span>
                  <div className="text-[10px] text-slate-500 pt-0.5">
                    Activation Date: <strong>{issueDate}</strong>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg space-y-0.5 text-right">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">Maturity Date</span>
                  <span className="font-mono font-bold text-emerald-700">{maturityDateStr}</span>
                  <div className="text-[10px] text-slate-500 pt-0.5">
                    Duration: <strong>{plan.durationDays} Days</strong>
                  </div>
                </div>
              </div>

              {/* ISO Certification Badge, Stamp & Signature Row */}
              <div className="relative z-10 pt-2 border-t border-slate-200 flex items-end justify-between gap-2">
                {/* Left Stamp & ISO Badge */}
                <div className="flex items-center gap-2">
                  <div className="w-14 h-14 rounded-full border-2 border-blue-600 bg-blue-50 flex flex-col items-center justify-center text-blue-700 text-[8px] font-black text-center p-1 leading-tight shrink-0 shadow-xs">
                    <ShieldCheck className="w-4 h-4 text-blue-600 mb-0.5" />
                    <span>ISO 9001:2015</span>
                    <span className="text-[7px] text-blue-900">VERIFIED</span>
                  </div>

                  <div className="text-[10px] space-y-0.5">
                    <span className="font-black text-slate-900 block flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Authenticated Bond
                    </span>
                    <span className="text-slate-500 block text-[9px]">
                      Secured Direct Payout Ledger Verified
                    </span>
                  </div>
                </div>

                {/* Right Signature & QR Code Block */}
                <div className="flex items-center gap-3 text-right">
                  <div className="p-1 bg-white border border-slate-200 rounded shrink-0">
                    <QrCode className="w-10 h-10 text-slate-800" />
                  </div>

                  <div className="space-y-0.5">
                    <div className="font-serif italic font-bold text-slate-900 text-sm border-b border-slate-300 pb-0.5 px-2">
                      A.K. Sharma
                    </div>
                    <span className="text-[9px] font-bold text-slate-600 block">Authorized Registrar</span>
                  </div>
                </div>
              </div>

              {/* Company Details Footer Block (Mandatory details requested) */}
              <div className="relative z-10 pt-2 border-t border-slate-200 text-[9.5px] text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-amber-600" /> Network Join Pro India Private Limited
                  </span>
                  <span>CIN: U74999UP2026PTC136667</span>
                </div>
                <div>
                  <strong>Reg. Address:</strong> Gomti Nagar, Lucknow, Uttar Pradesh - 226010, India
                </div>
                <div className="flex flex-wrap items-center justify-between gap-x-3 text-[9px] text-slate-500 pt-0.5 border-t border-slate-200/60">
                  <span>Email: <strong>support@networkjoinpro.in</strong></span>
                  <span>District: <strong>Lucknow</strong></span>
                  <span>State: <strong>Uttar Pradesh</strong></span>
                  <span>PIN: <strong>226010</strong></span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
