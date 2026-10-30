'use client';

import React from 'react';
import { Home, Users, TrendingUp, User, Wallet } from 'lucide-react';
import { motion } from 'motion/react';

export type NavTab = 'home' | 'network' | 'earnings' | 'wallet' | 'profile';

interface MobileBottomNavProps {
  activeTab: NavTab;
  onChangeTab?: (tab: NavTab) => void;
  onTabChange?: (tab: NavTab) => void;
  unclaimedEarnings?: number;
}

export default function MobileBottomNav({
  activeTab,
  onChangeTab,
  onTabChange,
  unclaimedEarnings = 0,
}: MobileBottomNavProps) {
  const tabs = [
    {
      id: 'home' as NavTab,
      label: 'Home',
      icon: Home,
    },
    {
      id: 'network' as NavTab,
      label: 'Network',
      icon: Users,
    },
    {
      id: 'earnings' as NavTab,
      label: 'Earnings',
      icon: TrendingUp,
      badge: unclaimedEarnings > 0,
    },
    {
      id: 'wallet' as NavTab,
      label: 'Wallet',
      icon: Wallet,
    },
    {
      id: 'profile' as NavTab,
      label: 'Profile',
      icon: User,
    },
  ];

  const handleTabClick = (tabId: NavTab) => {
    if (onChangeTab) {
      onChangeTab(tabId);
    } else if (onTabChange) {
      onTabChange(tabId);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1.5 max-w-md mx-auto sm:max-w-none">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className="relative flex flex-col items-center justify-center flex-1 py-1 transition-all group cursor-pointer"
            >
              {/* Active Circular Glow / Backdrop */}
              <div className="relative flex items-center justify-center">
                {isActive ? (
                  <motion.div
                    layoutId="activeTabPill"
                    className="w-12 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-xs border border-blue-500/50"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  >
                    <Icon className="w-5.5 h-5.5 text-white stroke-[2.2]" />
                  </motion.div>
                ) : (
                  <div className="w-12 h-8 flex items-center justify-center text-slate-500 group-hover:text-blue-600 transition-colors">
                    <Icon className="w-5.5 h-5.5 stroke-[2]" />
                  </div>
                )}

                {tab.badge && !isActive && (
                  <span className="absolute -top-1 -right-0.5 w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                )}
              </div>

              <span
                className={`text-[10px] mt-0.5 transition-colors ${
                  isActive ? 'font-serif font-black text-blue-700' : 'font-medium text-slate-500 group-hover:text-slate-900'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
