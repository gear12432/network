'use client';

import React from 'react';
import { FINANCE_SUMMARY_DATA } from '@/data/initialData';
import {
  FileSpreadsheet,
  Calendar,
  CheckCircle2,
  Users,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export default function TaxSummaryContent() {
  return (
    <div className="space-y-4">
      {/* Header Card: Deep Chocolate Bronze Banner with Gold Accents */}
      <div className="bg-gradient-to-r from-[#2c180a] via-[#4a280e] to-[#6d3e16] border-2 border-[#dfbe7e] text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#dfbe7e]/20 text-[#ffd485] border border-[#dfbe7e]/40 flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white">Finance & Tax Audit Report</h3>
            <span className="text-xs text-[#faecd4]/80">Verified Corporate Compliance Record</span>
          </div>
        </div>

        <div className="pt-3 border-t border-[#dfbe7e]/30 grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-[#faecd4]/80 block mb-0.5">Annual Companies Taxes</span>
            <span className="text-xl font-extrabold text-[#ffd485] font-mono">
              {FINANCE_SUMMARY_DATA.annualTaxes}
            </span>
          </div>
          <div>
            <span className="text-xs text-[#faecd4]/80 block mb-0.5">Next Tax Review Date</span>
            <span className="text-base font-bold text-white">
              {FINANCE_SUMMARY_DATA.nextTaxReviewDate}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics List: Cream / Gold Card */}
      <div className="bg-gradient-to-b from-[#fffefc] via-[#fbf5e7] to-[#f4e4c2] rounded-2xl p-4 border-2 border-[#dfbe7e] shadow-xs space-y-3">
        <h4 className="font-bold text-[#46280b] text-xs sm:text-sm">Audit Performance</h4>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs py-1.5 border-b border-[#dfbe7e]/30">
            <span className="text-[#7a5328]">Average Product Price</span>
            <span className="font-bold text-[#46280b]">{FINANCE_SUMMARY_DATA.averageProductPrice}</span>
          </div>

          <div className="flex items-center justify-between text-xs py-1.5 border-b border-[#dfbe7e]/30">
            <span className="text-[#7a5328]">Platform Satisfaction Rate</span>
            <span className="font-bold text-[#22c55e]">68% Verified</span>
          </div>

          <div className="flex items-center justify-between text-xs py-1.5 border-b border-[#dfbe7e]/30">
            <span className="text-[#7a5328]">Financial Solvency Ratio</span>
            <span className="font-bold text-[#46280b]">3.4x (High Liquidity)</span>
          </div>

          <div className="flex items-center justify-between text-xs py-1.5">
            <span className="text-[#7a5328]">Corporate Governance Rating</span>
            <span className="font-bold text-[#22c55e]">AAA+ (Standard)</span>
          </div>
        </div>
      </div>

      {/* Audit Committee Members */}
      <div className="bg-gradient-to-b from-[#fffefc] via-[#fbf5e7] to-[#f4e4c2] rounded-2xl p-4 border-2 border-[#dfbe7e] shadow-xs">
        <h4 className="font-bold text-[#46280b] text-xs sm:text-sm mb-3">Audit Committee Officers</h4>
        <div className="space-y-2">
          {[
            { initials: 'AI', name: 'Alina Ivanova', role: 'Chief Auditor' },
            { initials: 'LS', name: 'Liam Smith', role: 'Compliance Officer' },
            { initials: 'DJ', name: 'David Jones', role: 'Treasury Controller' },
            { initials: 'RE', name: 'Rohan E.', role: 'Risk Analyst' },
            { initials: 'SA', name: 'Sara Ahmed', role: 'Legal Counsel' },
          ].map((m) => (
            <div key={m.initials} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#faecd4] border border-[#dfbe7e] text-[#8a5416] font-bold flex items-center justify-center text-[10px]">
                  {m.initials}
                </div>
                <span className="font-bold text-[#46280b]">{m.name}</span>
              </div>
              <span className="text-[#7a5328] font-medium">{m.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
