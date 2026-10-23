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
      {/* Header Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white">Finance & Tax Audit Report</h3>
            <span className="text-xs text-slate-400">Verified Corporate Compliance Record</span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-slate-400 block mb-0.5">Annual Companies Taxes</span>
            <span className="text-xl font-extrabold text-emerald-400 font-mono">
              {FINANCE_SUMMARY_DATA.annualTaxes}
            </span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block mb-0.5">Next Tax Review Date</span>
            <span className="text-base font-bold text-white">
              {FINANCE_SUMMARY_DATA.nextTaxReviewDate}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics List */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3">
        <h4 className="font-bold text-slate-900 text-xs sm:text-sm">Audit Performance</h4>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Average Product Price</span>
            <span className="font-bold text-slate-900">{FINANCE_SUMMARY_DATA.averageProductPrice}</span>
          </div>

          <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Platform Satisfaction Rate</span>
            <span className="font-bold text-emerald-600">68% Verified</span>
          </div>

          <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Financial Solvency Ratio</span>
            <span className="font-bold text-slate-900">3.4x (High Liquidity)</span>
          </div>

          <div className="flex items-center justify-between text-xs py-1.5">
            <span className="text-slate-500">Corporate Governance Rating</span>
            <span className="font-bold text-emerald-600">AAA+ (Standard)</span>
          </div>
        </div>
      </div>

      {/* Audit Committee Members matching Screenshot 1 avatars */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
        <h4 className="font-bold text-slate-900 text-xs sm:text-sm mb-3">Audit Committee Officers</h4>
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
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px]">
                  {m.initials}
                </div>
                <span className="font-bold text-slate-800">{m.name}</span>
              </div>
              <span className="text-slate-400 font-medium">{m.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
