'use client';

import React from 'react';
import { Bell, Sparkles, ShieldCheck, Gift, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function NotificationsContent() {
  const alerts = [
    {
      id: 1,
      title: 'Daily ROI Yield Ready!',
      desc: '₹248.50 has been generated today from your active plans. Tap Claim to credit to wallet.',
      time: '10 mins ago',
      icon: Gift,
      color: 'bg-[#faecd4] text-[#8a5416] border border-[#dfbe7e]',
    },
    {
      id: 2,
      title: 'Full KYC Verification Verified',
      desc: 'Your Full KYC Aadhaar & PAN verification is active. Instant 24/7 withdrawals enabled.',
      time: '2 hours ago',
      icon: ShieldCheck,
      color: 'bg-[#faecd4] text-[#8a5416] border border-[#dfbe7e]',
    },
    {
      id: 3,
      title: 'Instant Withdrawal Guarantee Active',
      desc: 'Withdrawal settlement speed is currently under 60 seconds with 0% platform fee.',
      time: 'Today, 08:30 AM',
      icon: Sparkles,
      color: 'bg-[#faecd4] text-[#8a5416] border border-[#dfbe7e]',
    },
    {
      id: 4,
      title: 'New High-Yield Plan Available',
      desc: 'Gold Elite Accelerator plan is now live with 40% net returns in 45 days.',
      time: 'Yesterday',
      icon: TrendingUp,
      color: 'bg-[#faecd4] text-[#8a5416] border border-[#dfbe7e]',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1 mb-1">
        <span className="text-xs font-bold text-[#7a5328] uppercase tracking-wider">
          System Alerts & Updates
        </span>
        <span className="text-xs text-[#22c55e] font-bold bg-[#faecd4] border border-[#dfbe7e] px-2 py-0.5 rounded-full">
          All Systems Live
        </span>
      </div>

      <div className="space-y-2.5">
        {alerts.map((alert) => {
          const Icon = alert.icon;
          return (
            <div
              key={alert.id}
              className="bg-gradient-to-b from-[#fffefc] via-[#fbf5e7] to-[#f4e4c2] rounded-2xl p-3.5 border-2 border-[#dfbe7e] shadow-xs flex items-start gap-3 hover:border-[#c59c55] transition-colors"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${alert.color}`}>
                <Icon className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h4 className="text-xs font-bold text-[#46280b] truncate">{alert.title}</h4>
                  <span className="text-[10px] text-[#7a5328] shrink-0">{alert.time}</span>
                </div>
                <p className="text-[11px] text-[#7a5328] leading-relaxed">{alert.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
