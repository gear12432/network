import React from 'react';
import Image from 'next/image';

interface InvestAppLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export default function InvestAppLogo({ className = '', size = 'md', showText = true }: InvestAppLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* App Icon / Logo Graphic - clean without extra wrapper border */}
      <div className={`${sizeClasses[size]} rounded-2xl flex items-center justify-center relative overflow-hidden shrink-0 shadow-md`}>
        <Image
          src="/assets/aistudio/invest_app_logo.jpg"
          alt="Invest App Logo"
          width={200}
          height={200}
          className="w-full h-full object-cover rounded-2xl"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="font-serif font-black text-lg tracking-tight text-[#002E6E]">INVEST</span>
            <span className="font-sans font-extrabold text-lg tracking-tight text-[#00B9F1]">APP</span>
          </div>
          <span className="text-[10px] font-bold text-[#172B75]/70 tracking-wider uppercase">
            Professional Wealth Platform
          </span>
        </div>
      )}
    </div>
  );
}
