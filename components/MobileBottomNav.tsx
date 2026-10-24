'use client';

import React from 'react';
import { Home, Users, TrendingUp, User, Wallet } from 'lucide-react';
import { motion } from 'motion/react';

export type NavTab = 'home' | 'network' | 'earnings' | 'wallet' | 'profile';

interface MobileBottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  unclaimedEarnings?: number;
}

export default function MobileBottomNav({
  activeTab,
  onChangeTab,
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

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[#fdfbf6] via-[#f9f3e4] to-[#f6ebd5] border-t border-[#dfbe7e] shadow-lg px-2 py-1.5 max-w-md mx-auto sm:max-w-none">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className="relative flex flex-col items-center justify-center flex-1 py-1 transition-all group"
            >
              {/* Active Circular Glow / Backdrop */}
              <div className="relative flex items-center justify-center">
                {isActive ? (
                  <motion.div
                    layoutId="activeTabPill"
                    className="w-12 h-8 rounded-full bg-gradient-to-r from-[#4e2e0f] to-[#3a1d06] flex items-center justify-center shadow-xs border border-[#be8832]/40"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  >
                    <Icon className="w-5.5 h-5.5 text-[#fed788] stroke-[2.2]" />
                  </motion.div>
                ) : (
                  <div className="w-12 h-8 flex items-center justify-center text-[#8f6841] group-hover:text-[#55361e] transition-colors">
                    <Icon className="w-5.5 h-5.5 stroke-[2]" />
                  </div>
                )}

                {tab.badge && !isActive && (
                  <span className="absolute -top-1 -right-0.5 w-2 h-2 rounded-full bg-[#b3781e] animate-pulse" />
                )}
              </div>

              <span
                className={`text-[10px] mt-0.5 transition-colors ${
                  isActive ? 'font-serif font-black text-[#4e2e0f]' : 'font-medium text-[#8f6841] group-hover:text-[#55361e]'
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
