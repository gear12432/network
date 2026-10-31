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
      <div className="fixed inset-0 z-70 bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-3 overflow-y-auto">
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-auto"
        >
          {/* Top Modal Navigation Header */}
          <div className="bg-slate-900 text-white px-3.5 py-2.5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <Award className="w-4.5 h-4.5 text-amber-400" />
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
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isDownloading ? 'Downloading...' : 'Download Certificate (JPG)'}</span>
                </button>
              )}

              {/* Top-Right Close X Button */}
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Certificate Display Area */}
          <div className="p-2 sm:p-3 bg-slate-100 overflow-x-hidden">
            {/* Compact ISO Certificate Container */}
            <div
              ref={certRef}
              className="bg-white p-3 sm:p-4 rounded-xl border-2 border-amber-500/80 shadow-md relative text-slate-900 font-sans space-y-2 overflow-hidden w-full"
            >
              {/* Decorative Corner Graphics (Orange Vectors - Reduced Size) */}
              <div className="absolute top-0 left-0 w-20 h-20 pointer-events-none opacity-90">
                <svg viewBox="0 0 100 100" className="w-full h-full text-amber-500 fill-current">
                  <path d="M0 0 L100 0 C60 20 20 60 0 100 Z" />
                </svg>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none opacity-90">
                <svg viewBox="0 0 100 100" className="w-full h-full text-amber-600 fill-current">
                  <path d="M100 0 L0 0 C40 20 80 60 100 100 Z" />
                </svg>
              </div>
              <div className="absolute bottom-0 right-0 w-20 h-20 pointer-events-none opacity-90">
                <svg viewBox="0 0 100 100" className="w-full h-full text-amber-500 fill-current">
                  <path d="M100 100 L0 100 C40 80 80 40 100 0 Z" />
                </svg>
              </div>
              <div className="absolute bottom-0 left-0 w-20 h-20 pointer-events-none opacity-90">
                <svg viewBox="0 0 100 100" className="w-full h-full text-amber-600 fill-current">
                  <path d="M0 100 L100 100 C60 80 20 40 0 0 Z" />
                </svg>
              </div>

              {/* Subtly Embedded Shield Background Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-3">
                <ShieldCheck className="w-56 h-56 text-amber-700" />
              </div>

              {/* Header Branding & Compact Title */}
              <div className="relative z-10 text-center space-y-0.5 pt-0.5 border-b border-amber-200 pb-1.5">
                <div className="flex items-center justify-center gap-1.5">
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    NJP
                  </div>
                </div>

                <h1 className="text-xl sm:text-2xl font-black tracking-wide text-amber-700 uppercase font-serif">
                  CERTIFICATE
                </h1>
                <p className="text-[10px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider">
                  OF INVESTMENT BOND PARTICIPATION
                </p>
                <div className="text-[9.5px] text-slate-500 font-medium">
                  This is to certify that Investment Bond Subscription of:
                </div>
              </div>

              {/* Customer Primary Details Box (COMPACT HEIGHT & FULL WIDTH) */}
              <div className="relative z-10 bg-amber-50/50 border border-amber-200/90 rounded-lg p-2 sm:p-2.5 flex items-center gap-2.5 w-full">
                {customer.photo ? (
                  <img
                    src={customer.photo}
                    alt={customer.name}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover border-2 border-amber-500 shadow-2xs shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-blue-600 text-white font-black text-base flex items-center justify-center border border-white shadow-2xs shrink-0">
                    {customer.name.slice(0, 2).toUpperCase()}
                  </div>
                )}

                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight uppercase truncate">
                      {customer.name}
                    </h2>
                    <span className="text-[9px] font-mono font-bold text-amber-900 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded shrink-0">
                      ID: {customer.id}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-700 flex items-center gap-2.5">
                    <span className="flex items-center gap-1 font-mono font-semibold">
                      <Phone className="w-3 h-3 text-blue-600 shrink-0" />
                      +91 {customer.mobile}
                    </span>
                    <span className="flex items-center gap-1 truncate font-medium">
                      <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                      {customer.district}, {customer.state}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-600 truncate">
                    <strong>Address:</strong> {customer.address} (PIN: {customer.pinCode || '226010'})
                  </div>
                </div>
              </div>

              {/* Scope Statement */}
              <div className="relative z-10 text-[9.5px] font-bold text-slate-600 uppercase tracking-wider text-center">
                HAS BEEN ASSESSED AND REGISTERED FOR OFFICIAL BOND SCHEME:
              </div>

              {/* Plan Details Box (COMPACT HEIGHT & FULL WIDTH) */}
              <div className="relative z-10 bg-white border-2 border-slate-200 rounded-lg overflow-hidden text-xs w-full shadow-2xs">
                {/* Scheme Header Row */}
                <div className="bg-slate-50 border-b border-slate-200 px-2.5 py-1 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-black text-amber-700 uppercase block leading-none">Application Name</span>
                    <strong className="text-xs sm:text-sm font-black text-slate-900">NETWORK JOIN PRO</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-slate-500 uppercase block leading-none">Selected Plan</span>
                    <span className="font-bold text-blue-700 text-xs">{plan.name}</span>
                  </div>
                </div>

                {/* Compact Terms Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-200 text-center">
                  <div className="p-1.5">
                    <span className="text-[9px] text-slate-500 font-semibold block leading-tight">Invested Amount</span>
                    <span className="text-sm font-black text-slate-900 font-mono">
                      ₹{plan.amount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="p-1.5">
                    <span className="text-[9px] text-slate-500 font-semibold block leading-tight">Daily Return</span>
                    <span className="text-sm font-black text-emerald-600 font-mono">
                      ₹{plan.dailyEarnings.toFixed(2)}
                    </span>
                  </div>

                  <div className="p-1.5">
                    <span className="text-[9px] text-slate-500 font-semibold block leading-tight">Return Amount</span>
                    <span className="text-sm font-black text-blue-600 font-mono">
                      ₹{netProfit.toFixed(2)}
                    </span>
                  </div>

                  <div className="p-1.5 bg-amber-50/70">
                    <span className="text-[9px] text-amber-800 font-bold block leading-tight">Total Maturity Amount</span>
                    <span className="text-sm font-black text-amber-900 font-mono">
                      ₹{totalMaturity.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Certificate Audit & Dates (Compact Row) */}
              <div className="relative z-10 grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-slate-50 border border-slate-200 p-1.5 rounded-md space-y-0.2">
                  <span className="text-[8.5px] font-bold text-slate-500 block uppercase leading-none">Certificate Serial</span>
                  <span className="font-mono font-bold text-slate-900">{certNumber}</span>
                  <div className="text-[8.5px] text-slate-500">
                    Activation: <strong>{issueDate}</strong>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-1.5 rounded-md space-y-0.2 text-right">
                  <span className="text-[8.5px] font-bold text-slate-500 block uppercase leading-none">Maturity Date</span>
                  <span className="font-mono font-bold text-emerald-700">{maturityDateStr}</span>
                  <div className="text-[8.5px] text-slate-500">
                    Duration: <strong>{plan.durationDays} Days</strong>
                  </div>
                </div>
              </div>

              {/* ISO Certification Badge, Stamp & Signature Row */}
              <div className="relative z-10 pt-1 border-t border-slate-200 flex items-center justify-between gap-1.5">
                {/* Left Stamp & ISO Badge */}
                <div className="flex items-center gap-1.5">
                  <div className="w-11 h-11 rounded-full border border-blue-600 bg-blue-50 flex flex-col items-center justify-center text-blue-700 text-[7px] font-black text-center p-0.5 leading-none shrink-0 shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600 mb-0.5" />
                    <span>ISO 9001</span>
                  </div>

                  <div className="text-[9px] space-y-0.2">
                    <span className="font-black text-slate-900 block flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Authenticated Bond
                    </span>
                    <span className="text-slate-500 block text-[8px]">
                      Secured Direct Payout Ledger
                    </span>
                  </div>
                </div>

                {/* Right Signature & QR Code Block */}
                <div className="flex items-center gap-2 text-right">
                  <div className="p-0.5 bg-white border border-slate-200 rounded shrink-0">
                    <QrCode className="w-8 h-8 text-slate-800" />
                  </div>

                  <div className="space-y-0.2">
                    <div className="font-serif italic font-bold text-slate-900 text-xs border-b border-slate-300 pb-0.2 px-1">
                      A.K. Sharma
                    </div>
                    <span className="text-[8px] font-bold text-slate-600 block">Auth. Registrar</span>
                  </div>
                </div>
              </div>

              {/* Company Details Footer Block (Ultra-Compact) */}
              <div className="relative z-10 pt-1 border-t border-slate-200 text-[8.5px] text-slate-600 space-y-0.5 bg-slate-50 p-1.5 rounded-md border border-slate-200/80">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-2.5 h-2.5 text-amber-600" /> Network Join Pro India Private Limited
                  </span>
                  <span>CIN: U74999UP2026PTC136667</span>
                </div>
                <div>
                  <strong>Reg. Address:</strong> Gomti Nagar, Lucknow, Uttar Pradesh - 226010, India
                </div>
                <div className="flex flex-wrap items-center justify-between gap-x-2 text-[8px] text-slate-500 pt-0.5 border-t border-slate-200/60">
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
