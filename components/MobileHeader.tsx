'use client';

import React from 'react';
import { Plus, History, Crown, Bell, UserPlus, Wallet } from 'lucide-react';
import { UserStats } from '@/types/investment';
import { INITIAL_USER_STATS } from '@/data/initialData';

interface MobileHeaderProps {
  stats?: UserStats;
  userStats?: UserStats;
  activeTab?: string;
  onOpenDeposit?: () => void;
  onOpenHistory?: () => void;
  onOpenAddCustomer?: () => void;
  onOpenCustomerList?: () => void;
  onOpenProfile?: () => void;
  onOpenNotifications?: () => void;
  onOpenFullKyc?: () => void;
  onOpenAdmin?: () => void;
}

export default function MobileHeader({
  stats,
  userStats,
  activeTab = 'home',
  onOpenDeposit,
  onOpenHistory,
  onOpenAddCustomer,
  onOpenProfile,
  onOpenNotifications,
}: MobileHeaderProps) {
  const [profilePhoto, setProfilePhoto] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('user_profile_photo');
      if (saved) setProfilePhoto(saved);
    }
  }, []);

  // REQUIREMENT: Header will ONLY show on Home Screen! On other screens, return null.
  if (activeTab !== 'home') {
    return null;
  }

  const currentStats = stats || userStats || INITIAL_USER_STATS;
  const avatarSrc = currentStats?.photoUrl || profilePhoto;

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#D0E4F5] px-2.5 sm:px-3 py-2 sm:py-2.5 flex items-center justify-between shadow-xs">
      {/* Left: Avatar */}
      <div className="flex items-center gap-2">
        <div
          onClick={onOpenProfile}
          className="flex items-center cursor-pointer hover:opacity-90 transition-opacity"
          title="View Profile & Full KYC"
        >
          <div className="relative">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover border-2 border-[#002E6E] shadow-xs"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#E5F3FC] via-[#F2F8FC] to-[#D0E4F5] border-2 border-[#002E6E] flex items-center justify-center font-black text-[#002E6E] text-xs shadow-xs">
                {currentStats?.userInitials || 'GK'}
              </div>
            )}
            {currentStats?.isVip && (
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-400 to-amber-600 text-amber-950 p-0.5 rounded-full shadow-xs border border-white">
                <Crown className="w-2.5 h-2.5 fill-amber-950" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: Wallet pill, + Customer button, History, Notification Bell */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Wallet pill */}
        <div className="flex items-center bg-[#F2F8FC] border border-[#D0E4F5] rounded-full px-2.5 py-1 text-[#172B75] shadow-2xs">
          <Wallet className="w-4.5 h-4.5 text-[#002E6E] mr-1.5 shrink-0 stroke-[2.2]" />
          <span className="text-xs sm:text-sm font-black text-[#172B75] mr-1.5 font-mono">
            ₹{(currentStats?.walletBalance ?? 0).toLocaleString('en-IN')}
          </span>
          <button
            onClick={onOpenDeposit}
            className="w-5 h-5 rounded-full bg-[#002E6E] hover:bg-[#00204d] text-white flex items-center justify-center hover:brightness-110 transition-all shadow-xs active:scale-90 shrink-0 cursor-pointer border border-[#00B9F1]/40"
            title="Add Money"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>

        {/* + Customer button */}
        <button
          onClick={onOpenAddCustomer}
          className="flex items-center gap-1 bg-[#002E6E] hover:bg-[#00204d] active:scale-95 text-white border border-[#00B9F1]/50 text-xs font-bold px-2.5 py-1 rounded-full transition-all shadow-xs shrink-0 cursor-pointer"
          title="Add New Customer"
        >
          <UserPlus className="w-3.5 h-3.5 text-[#00B9F1] stroke-[2.5]" />
          <span className="hidden xs:inline text-[11px] sm:text-xs">+ Customer</span>
          <span className="xs:hidden text-[11px]">+ Cust</span>
        </button>

        {/* History / Clock button */}
        <button
          onClick={onOpenHistory}
          className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-[#F2F8FC] hover:bg-[#E5F3FC] active:scale-95 text-[#002E6E] hover:text-[#00B9F1] border border-[#D0E4F5] flex items-center justify-center transition-all shadow-2xs shrink-0 cursor-pointer"
          title="Transaction History"
          aria-label="Transaction History"
        >
          <History className="w-4.5 h-4.5 stroke-[2.4]" />
        </button>

        {/* Notification Bell Icon */}
        <button
          onClick={onOpenNotifications}
          className="relative w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-full bg-[#F2F8FC] hover:bg-[#E5F3FC] active:scale-95 text-[#002E6E] hover:text-[#00B9F1] border border-[#D0E4F5] flex items-center justify-center transition-all shadow-2xs shrink-0 cursor-pointer"
          title="Notifications & Updates"
          aria-label="Notifications & Updates"
        >
          <Bell className="w-4.5 h-4.5 stroke-[2.4]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#00B9F1] ring-1.5 ring-white" />
        </button>
      </div>
    </header>
  );
}

