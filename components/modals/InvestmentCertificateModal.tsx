'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, ShieldCheck, Award, CheckCircle2, Phone, MapPin, Building2, QrCode } from 'lucide-react';
import { Customer, InvestmentPlan, AppSettings, DEFAULT_APP_SETTINGS } from '@/types/investment';
import { getAppSettingsFromFirestore } from '@/lib/firebase';

interface InvestmentCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: InvestmentPlan | null;
  customer: Customer | null;
  investment?: ActiveInvestment | null;
}

export default function InvestmentCertificateModal({
  isOpen,
  onClose,
  plan: propPlan,
  customer: propCustomer,
  investment,
}: InvestmentCertificateModalProps) {
  const certRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);

  // Reconstruct plan and customer details from investment if provided
  let plan = propPlan;
  let customer = propCustomer;

  if (investment) {
    plan = {
      id: investment.planId,
      name: investment.planName,
      amount: investment.investedAmount,
      dailyEarnings: investment.dailyReturn,
      totalReturn: investment.totalReturn,
      durationDays: investment.totalDays,
      roiPercentage: (investment.dailyReturn / (investment.investedAmount || 1)) * 100,
      category: 'Starter', // default
      totalInvestors: 0,
      description: '',
      iconType: 'lightning',
    };

    customer = {
      id: investment.customerId || '',
      name: investment.customerName || '',
      mobile: investment.customerMobile || '',
      photo: investment.customerPhoto || '',
      address: investment.customerAddress || '',
      state: '',
      district: '',
      pincode: '',
      panNumber: '',
      aadhaarNumber: '',
      bankHolderName: investment.bankHolderName || '',
      bankName: investment.bankName || '',
      accountNumber: investment.accountNumber || '',
      ifscCode: investment.ifscCode || '',
      createdDate: '',
      kycStatus: 'verified',
    };
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const local = localStorage.getItem('network_join_pro_app_settings');
        if (local) setAppSettings({ ...DEFAULT_APP_SETTINGS, ...JSON.parse(local) });
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      getAppSettingsFromFirestore().then((settings) => {
        if (settings) setAppSettings(settings);
      });
    }
  }, [isOpen]);

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
      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default;
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#F2F8FC',
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
          <div
            className="text-white px-3.5 py-2.5 flex items-center justify-between"
            style={{ backgroundColor: '#002E6E' }}
          >
            <div className="flex items-center gap-1.5">
              <Award className="w-4.5 h-4.5" style={{ color: '#00B9F1' }} />
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
                  className="px-3 py-1 text-white font-bold text-xs rounded-lg flex items-center gap-1 transition-all shadow-xs cursor-pointer hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: '#00B9F1' }}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isDownloading ? 'Downloading...' : 'Download Certificate (JPG)'}</span>
                </button>
              )}

              {/* Top-Right Close X Button */}
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Certificate Display Area */}
          <div className="p-2 sm:p-3 bg-[#E5EEF5] overflow-x-hidden">
            {/* Compact ISO Certificate Container */}
            <div
              ref={certRef}
              className="p-3 sm:p-4 rounded-xl border-2 shadow-md relative font-sans space-y-2 overflow-hidden w-full"
              style={{
                backgroundColor: '#F2F8FC',
                borderColor: '#172B75',
                color: '#172B75',
              }}
            >
              {/* Top Decorative Corner Graphics (#00B9F1) */}
              <div className="absolute top-0 left-0 w-20 h-20 pointer-events-none opacity-95">
                <svg viewBox="0 0 100 100" className="w-full h-full fill-current" style={{ color: '#00B9F1' }}>
                  <path d="M0 0 L100 0 C60 20 20 60 0 100 Z" />
                </svg>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 pointer-events-none opacity-95">
                <svg viewBox="0 0 100 100" className="w-full h-full fill-current" style={{ color: '#00B9F1' }}>
                  <path d="M100 0 L0 0 C40 20 80 60 100 100 Z" />
                </svg>
              </div>

              {/* Bottom Decorative Corner Graphics (#002E6E) */}
              <div className="absolute bottom-0 right-0 w-20 h-20 pointer-events-none opacity-95">
                <svg viewBox="0 0 100 100" className="w-full h-full fill-current" style={{ color: '#002E6E' }}>
                  <path d="M100 100 L0 100 C40 80 80 40 100 0 Z" />
                </svg>
              </div>
              <div className="absolute bottom-0 left-0 w-20 h-20 pointer-events-none opacity-95">
                <svg viewBox="0 0 100 100" className="w-full h-full fill-current" style={{ color: '#002E6E' }}>
                  <path d="M0 100 L100 100 C60 80 20 40 0 0 Z" />
                </svg>
              </div>

              {/* Subtly Embedded Shield Background Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                <ShieldCheck className="w-56 h-56" style={{ color: '#002E6E' }} />
              </div>

              {/* Header Branding & Compact Title */}
              <div
                className="relative z-10 text-center space-y-0.5 pt-0.5 border-b pb-1.5"
                style={{ borderColor: 'rgba(0, 185, 241, 0.4)' }}
              >
                <div className="flex items-center justify-center gap-1.5">
                  {appSettings.appLogo ? (
                    <img
                      src={appSettings.appLogo}
                      alt={appSettings.appName || 'Logo'}
                      className="w-10 h-10 rounded-full object-contain bg-white border-2 p-0.5 shadow-xs"
                      style={{ borderColor: '#00B9F1' }}
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full text-white font-black text-xs flex items-center justify-center shadow-xs border-2"
                      style={{ backgroundColor: '#002E6E', borderColor: '#00B9F1' }}
                    >
                      {appSettings.appShortName || 'NJP'}
                    </div>
                  )}
                </div>

                <h1
                  className="text-xl sm:text-2xl font-black tracking-wide uppercase font-serif"
                  style={{ color: '#002E6E' }}
                >
                  CERTIFICATE
                </h1>
                <p
                  className="text-[10px] sm:text-xs font-black uppercase tracking-wider"
                  style={{ color: '#172B75' }}
                >
                  OF INVESTMENT BOND PARTICIPATION
                </p>
                <div className="text-[9.5px] font-semibold" style={{ color: '#172B75' }}>
                  This is to certify that Investment Bond Subscription of:
                </div>
              </div>

              {/* Customer Primary Details Box (Card: #FFFFFF) */}
              <div
                className="relative z-10 bg-white border-2 rounded-lg p-2 sm:p-2.5 flex items-center gap-2.5 w-full shadow-2xs"
                style={{ borderColor: 'rgba(0, 185, 241, 0.5)' }}
              >
                {customer.photo ? (
                  <img
                    src={customer.photo}
                    alt={customer.name}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover border-2 shadow-2xs shrink-0"
                    style={{ borderColor: '#00B9F1' }}
                  />
                ) : (
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg text-white font-black text-base flex items-center justify-center border shadow-2xs shrink-0"
                    style={{ backgroundColor: '#002E6E', borderColor: '#00B9F1' }}
                  >
                    {customer.name.slice(0, 2).toUpperCase()}
                  </div>
                )}

                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <h2
                      className="text-sm sm:text-base font-black tracking-tight uppercase truncate"
                      style={{ color: '#172B75' }}
                    >
                      {customer.name}
                    </h2>
                    <span
                      className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 border"
                      style={{ backgroundColor: '#F2F8FC', color: '#002E6E', borderColor: '#00B9F1' }}
                    >
                      ID: {customer.id}
                    </span>
                  </div>

                  <div className="text-[11px] flex items-center gap-2.5" style={{ color: '#172B75' }}>
                    <span className="flex items-center gap-1 font-mono font-semibold">
                      <Phone className="w-3 h-3 shrink-0" style={{ color: '#00B9F1' }} />
                      +91 {customer.mobile}
                    </span>
                    <span className="flex items-center gap-1 truncate font-medium">
                      <MapPin className="w-3 h-3 shrink-0" style={{ color: '#00B9F1' }} />
                      {customer.district}, {customer.state}
                    </span>
                  </div>

                  <div className="text-[10px] truncate" style={{ color: '#172B75' }}>
                    <strong>Address:</strong> {customer.address} (PIN: {customer.pinCode || '226010'})
                  </div>
                </div>
              </div>

              {/* Scope Statement */}
              <div
                className="relative z-10 text-[9.5px] font-black uppercase tracking-wider text-center"
                style={{ color: '#172B75' }}
              >
                HAS BEEN ASSESSED AND REGISTERED FOR OFFICIAL BOND SCHEME:
              </div>

              {/* Plan Details Box (Card: #FFFFFF with Primary #002E6E Header) */}
              <div
                className="relative z-10 bg-white border-2 rounded-lg overflow-hidden text-xs w-full shadow-2xs"
                style={{ borderColor: 'rgba(0, 46, 110, 0.3)' }}
              >
                {/* Scheme Header Row */}
                <div
                  className="px-2.5 py-1.5 flex items-center justify-between text-white"
                  style={{ backgroundColor: '#002E6E' }}
                >
                  <div>
                    <span
                      className="text-[9px] font-black uppercase block leading-none"
                      style={{ color: '#00B9F1' }}
                    >
                      Application Name
                    </span>
                    <strong className="text-xs sm:text-sm font-black text-white uppercase">
                      {appSettings.appName || 'NETWORK JOIN PRO'}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-white/80 uppercase block leading-none">Selected Plan</span>
                    <span className="font-extrabold text-xs" style={{ color: '#00B9F1' }}>
                      {plan.name}
                    </span>
                  </div>
                </div>

                {/* Compact Terms Grid */}
                <div
                  className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 text-center bg-white"
                  style={{ borderColor: 'rgba(0, 46, 110, 0.15)' }}
                >
                  <div className="p-1.5">
                    <span className="text-[9px] font-semibold block leading-tight" style={{ color: '#172B75' }}>
                      Invested Amount
                    </span>
                    <span className="text-sm font-black font-mono" style={{ color: '#002E6E' }}>
                      ₹{plan.amount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="p-1.5">
                    <span className="text-[9px] font-semibold block leading-tight" style={{ color: '#172B75' }}>
                      Daily Return
                    </span>
                    <span className="text-sm font-black text-emerald-600 font-mono">
                      ₹{plan.dailyEarnings.toFixed(2)}
                    </span>
                  </div>

                  <div className="p-1.5">
                    <span className="text-[9px] font-semibold block leading-tight" style={{ color: '#172B75' }}>
                      Return Amount
                    </span>
                    <span className="text-sm font-black font-mono" style={{ color: '#00B9F1' }}>
                      ₹{netProfit.toFixed(2)}
                    </span>
                  </div>

                  <div className="p-1.5" style={{ backgroundColor: '#F2F8FC' }}>
                    <span className="text-[9px] font-black block leading-tight" style={{ color: '#002E6E' }}>
                      Total Maturity Amount
                    </span>
                    <span className="text-sm font-black font-mono" style={{ color: '#002E6E' }}>
                      ₹{totalMaturity.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Certificate Audit & Dates (Compact Row) */}
              <div className="relative z-10 grid grid-cols-2 gap-2 text-[10px]">
                <div
                  className="bg-white border p-1.5 rounded-md space-y-0.5 shadow-2xs"
                  style={{ borderColor: 'rgba(0, 185, 241, 0.45)' }}
                >
                  <span className="text-[8.5px] font-bold block uppercase leading-none" style={{ color: '#172B75' }}>
                    Certificate Serial
                  </span>
                  <span className="font-mono font-black" style={{ color: '#002E6E' }}>{certNumber}</span>
                  <div className="text-[8.5px]" style={{ color: '#172B75' }}>
                    Activation: <strong style={{ color: '#002E6E' }}>{issueDate}</strong>
                  </div>
                </div>

                <div
                  className="bg-white border p-1.5 rounded-md space-y-0.5 text-right shadow-2xs"
                  style={{ borderColor: 'rgba(0, 185, 241, 0.45)' }}
                >
                  <span className="text-[8.5px] font-bold block uppercase leading-none" style={{ color: '#172B75' }}>
                    Maturity Date
                  </span>
                  <span className="font-mono font-black text-emerald-700">{maturityDateStr}</span>
                  <div className="text-[8.5px]" style={{ color: '#172B75' }}>
                    Duration: <strong style={{ color: '#002E6E' }}>{plan.durationDays} Days</strong>
                  </div>
                </div>
              </div>

              {/* ISO Certification Badge, Stamp & App Logo on Left Row */}
              <div
                className="relative z-10 pt-1 border-t flex items-center justify-between gap-1.5"
                style={{ borderColor: 'rgba(0, 185, 241, 0.4)' }}
              >
                {/* Left Stamp & App Logo Show Case */}
                <div className="flex items-center gap-2">
                  <div
                    className="w-11 h-11 rounded-full border-2 bg-white flex flex-col items-center justify-center p-0.5 leading-none shrink-0 shadow-xs relative overflow-hidden"
                    style={{ borderColor: '#00B9F1' }}
                  >
                    {appSettings.appLogo ? (
                      <img
                        src={appSettings.appLogo}
                        alt="App Logo"
                        className="w-full h-full object-contain p-0.5"
                      />
                    ) : (
                      <div
                        className="w-full h-full rounded-full flex flex-col items-center justify-center font-black text-[7px]"
                        style={{ backgroundColor: '#002E6E', color: '#FFFFFF' }}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#00B9F1' }} />
                        <span className="leading-none">{appSettings.appShortName || 'NJP'}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-[9px] space-y-0.5">
                    <span className="font-black block flex items-center gap-1" style={{ color: '#002E6E' }}>
                      <CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: '#00B9F1' }} /> Authenticated Bond
                    </span>
                    <span className="block text-[8px] font-semibold" style={{ color: '#172B75' }}>
                      ISO 9001 • Secured Payout Ledger
                    </span>
                  </div>
                </div>

                {/* Right Signature & QR Code Block */}
                <div className="flex items-center gap-2 text-right">
                  <div
                    className="p-0.5 bg-white border rounded shrink-0 shadow-2xs"
                    style={{ borderColor: 'rgba(0, 185, 241, 0.45)' }}
                  >
                    <QrCode className="w-8 h-8" style={{ color: '#002E6E' }} />
                  </div>

                  <div className="space-y-0.2">
                    <div
                      className="font-serif italic font-bold text-xs border-b pb-0.2 px-1"
                      style={{ color: '#002E6E', borderColor: 'rgba(0, 46, 110, 0.3)' }}
                    >
                      {appSettings.registrarName || 'Auth. Registrar'}
                    </div>
                    <span className="text-[8px] font-bold block" style={{ color: '#172B75' }}>
                      Auth. Registrar
                    </span>
                  </div>
                </div>
              </div>

              {/* Company Details Footer Block (Card: #FFFFFF, Text: #172B75, Highlights: #002E6E) */}
              <div
                className="relative z-10 pt-1.5 text-[8.5px] space-y-0.5 bg-white p-2 rounded-md border shadow-2xs"
                style={{ borderColor: 'rgba(0, 185, 241, 0.45)', color: '#172B75' }}
              >
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1" style={{ color: '#002E6E' }}>
                    <Building2 className="w-3 h-3 shrink-0" style={{ color: '#00B9F1' }} />
                    <span className="font-black">{appSettings.companyName || 'Network Join Pro India Private Limited'}</span>
                  </span>
                  <span className="font-mono font-bold" style={{ color: '#002E6E' }}>
                    CIN: {appSettings.cin || 'U74999UP2026PTC136667'}
                  </span>
                </div>
                <div style={{ color: '#172B75' }}>
                  <strong>Reg. Address:</strong> {appSettings.localArea ? `${appSettings.localArea}, ` : ''}{appSettings.cityDistrict}, {appSettings.state} - {appSettings.pinCode}, {appSettings.country || 'India'}
                </div>
                <div
                  className="flex flex-wrap items-center justify-between gap-x-2 text-[8px] pt-1 border-t"
                  style={{ borderColor: 'rgba(0, 185, 241, 0.3)', color: '#172B75' }}
                >
                  <span>Email: <strong style={{ color: '#002E6E' }}>{appSettings.email || 'support@networkjoinpro.in'}</strong></span>
                  <span>District: <strong style={{ color: '#002E6E' }}>{appSettings.cityDistrict || 'Lucknow'}</strong></span>
                  <span>State: <strong style={{ color: '#002E6E' }}>{appSettings.state || 'Uttar Pradesh'}</strong></span>
                  <span>PIN: <strong style={{ color: '#002E6E' }}>{appSettings.pinCode || '226010'}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
