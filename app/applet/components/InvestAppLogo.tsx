import React from 'react';
import Image from 'next/image';

interface InvestAppLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

const LOGO_URL = 'https://i.ibb.co/pB8wjLqm/BG-Remover-1794109130060.png';

export default function InvestAppLogo({ className = '', size = 'md', showText = true }: InvestAppLogoProps) {
  const sizeClasses = {
    sm: 'w-9 h-9',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className={`relative ${sizeClasses[size]} bg-white rounded-2xl border border-[#002E6E]/30 shadow-md shadow-[#002E6E]/10 overflow-hidden flex items-center justify-center p-1.5`}>
        <Image
          src={LOGO_URL}
          alt="NetworkJoin Pro Logo"
          fill
          sizes="(max-width: 768px) 100vw, 200px"
          className="object-contain p-1"
          priority
          referrerPolicy="no-referrer"
          unoptimized
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-serif font-black text-[#002E6E] tracking-tight ${textSizes[size]}`}>
            NetworkJoin Pro
          </span>
          <span className="text-[10px] sm:text-xs font-semibold text-[#00B9F1] tracking-wide uppercase">
            Secure Investment Platform
          </span>
        </div>
      )}
    </div>
  );
}
