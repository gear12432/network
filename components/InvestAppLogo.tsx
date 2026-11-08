import React from 'react';

interface InvestAppLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

// Transparent PNG image URL provided by the user (background removed)
const LOGO_URL = 'https://i.ibb.co/pB8wjLqm/BG-Remover-1794109130060.png';

export default function InvestAppLogo({ className = '', size = 'md', showText = true }: InvestAppLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Box background and borders removed, rendering only the logo image */}
      <div className={`${sizeClasses[size]} flex items-center justify-center relative shrink-0`}>
        <img
          src={LOGO_URL}
          alt="Invest App Logo"
          className="w-full h-full object-contain"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.src.endsWith('/logo.png')) {
              target.src = './logo.png';
            }
          }}
        />
      </div>

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
