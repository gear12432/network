'use client';

import React from 'react';
import {
  Menu,
  Home,
  Users,
  TrendingUp,
  Wallet,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { NavTab } from './MobileBottomNav';

interface DesktopSidebarProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
}

export default function DesktopSidebar({
  activeTab,
  onChangeTab,
  collapsed,
  onToggleCollapse,
  onOpenDeposit,
  onOpenWithdraw,
}: DesktopSidebarProps) {
  const primaryNavItems = [
    { id: 'home' as NavTab, label: 'Dashboard', icon: Home },
    { id: 'network' as NavTab, label: 'Network & Team', icon: Users },
    { id: 'earnings' as NavTab, label: 'Analytics & Earnings', icon: TrendingUp },
    { id: 'wallet' as NavTab, label: 'Wallet & Funds', icon: Wallet },
  ];

  return (
    <aside
      className={`sticky top-0 h-screen z-30 transition-all duration-300 ease-in-out flex flex-col justify-between shrink-0 bg-gradient-to-b from-[#2b1706] via-[#3a200a] to-[#200f04] text-[#ffeec9] border-r border-[#dfbe7e]/30 shadow-2xl overflow-y-auto overflow-x-hidden ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Branding & Hamburger Toggle */}
      <div>
        <div className="flex items-center justify-between px-5 py-5 border-b border-[#dfbe7e]/30">
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#d9a54c] to-[#be8832] flex items-center justify-center font-serif font-black text-[#2b1706] text-base shadow-xs">
                N
              </div>
              <div className="leading-tight">
                <span className="font-serif font-black text-sm tracking-tight text-white block">NetworkJoin</span>
                <span className="text-[10px] text-white/80 font-medium">VIP Palace Suite</span>
              </div>
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className={`p-2 rounded-lg hover:bg-white/10 active:scale-95 transition-colors text-white ${
              collapsed ? 'mx-auto' : ''
            }`}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <Menu className="w-5 h-5 stroke-[2.2] text-white" />
          </button>
        </div>

        {/* Primary Navigation with curved tab cutouts */}
        <div className="pt-4 space-y-1">
          {primaryNavItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <div key={item.id} className="relative">
                {isActive ? (
                  /* Curved palace tab cutout matching main background bg-[#faf6ee] */
                  <div
                    onClick={() => onChangeTab(item.id)}
                    className="relative flex items-center gap-3.5 pl-6 py-3 bg-[#faf6ee] text-[#2b1706] font-serif font-black rounded-l-2xl shadow-xs cursor-pointer select-none"
                  >
                    {/* Top corner reverse curve */}
                    <div className="absolute right-0 -top-4 w-4 h-4 overflow-hidden pointer-events-none">
                      <div className="w-8 h-8 rounded-full bg-[#3a200a] absolute -top-4 -right-4 border-b border-r border-[#faf6ee]" />
                    </div>

                    <div className="w-8 h-8 rounded-full bg-[#2b1706] flex items-center justify-center text-white shrink-0 border border-[#dfbe7e] shadow-xs">
                      <Icon className="w-4 h-4 stroke-[2.5] text-white" />
                    </div>

                    {!collapsed && (
                      <span className="text-sm font-black text-[#2b1706] tracking-tight whitespace-nowrap">
                        {item.label}
                      </span>
                    )}

                    {/* Bottom corner reverse curve */}
                    <div className="absolute right-0 -bottom-4 w-4 h-4 overflow-hidden pointer-events-none">
                      <div className="w-8 h-8 rounded-full bg-[#3a200a] absolute -bottom-4 -right-4 border-t border-r border-[#faf6ee]" />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => onChangeTab(item.id)}
                    className={`w-full flex items-center gap-3.5 px-6 py-3 text-white hover:bg-white/10 transition-all rounded-l-xl group ${
                      collapsed ? 'justify-center px-0' : ''
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0 text-white opacity-95 group-hover:opacity-100" />
                    {!collapsed && (
                      <span className="text-sm font-semibold tracking-tight whitespace-nowrap text-white">
                        {item.label}
                      </span>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Bottom Promo & Logout */}
      <div className="p-4 border-t border-[#dfbe7e]/30 space-y-3">
        {!collapsed && (
          <div className="bg-gradient-to-br from-[#4e2e0f] to-[#361c06] p-3 rounded-2xl border border-[#dfbe7e]/40 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-white mb-1">
              <ShieldCheck className="w-4 h-4 text-[#ffd786]" />
              <span>Instant VIP Payouts</span>
            </div>
            <p className="text-[11px] text-[#fdebd0]/90 leading-relaxed mb-2.5">
              Zero platform fee on withdrawals to Bank / UPI accounts 24/7.
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={onOpenDeposit}
                className="py-1 px-2 rounded-lg bg-gradient-to-r from-[#d9a54c] to-[#be8832] text-[#2b1706] font-black text-[11px] text-center hover:brightness-105 transition-colors shadow-xs"
              >
                Recharge
              </button>
              <button
                onClick={onOpenWithdraw}
                className="py-1 px-2 rounded-lg bg-[#2b1706] text-white border border-[#dfbe7e]/30 font-medium text-[11px] text-center hover:bg-[#200f04] transition-colors"
              >
                Withdraw
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => alert('Logged out safely. Welcome back anytime!')}
          className={`flex items-center gap-3 text-white hover:bg-white/10 p-2.5 rounded-lg w-full transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Logout"
        >
          <LogOut className="w-5 h-5 shrink-0 text-white" />
          {!collapsed && <span className="text-xs font-semibold text-white">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
