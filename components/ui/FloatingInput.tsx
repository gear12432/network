'use client';

import React, { useState, useId } from 'react';

export interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  leftIcon?: React.ReactNode;
  leftPrefix?: string;
  rightElement?: React.ReactNode;
  containerClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
  badgeRequired?: boolean;
  focusColor?: 'emerald' | 'blue' | 'gold';
}

export const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  (
    {
      label,
      leftIcon,
      leftPrefix,
      rightElement,
      containerClassName = '',
      inputClassName = '',
      labelClassName = '',
      badgeRequired = false,
      focusColor = 'gold',
      value,
      defaultValue,
      onChange,
      onFocus,
      onBlur,
      type = 'text',
      disabled = false,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = props.id || generatedId;
    const [isFocused, setIsFocused] = useState(false);

    const hasValue =
      value !== undefined && value !== null && String(value).trim().length > 0;
    const isFloating = isFocused || hasValue;

    let restLeftClass = 'left-4';
    let inputPaddingLeftClass = 'pl-4';

    if (leftIcon && leftPrefix) {
      restLeftClass = 'left-16';
      inputPaddingLeftClass = 'pl-16';
    } else if (leftPrefix) {
      restLeftClass = 'left-12';
      inputPaddingLeftClass = 'pl-12';
    } else if (leftIcon) {
      restLeftClass = 'left-10';
      inputPaddingLeftClass = 'pl-10';
    }

    const paddingRightClass = rightElement ? 'pr-11' : 'pr-4';

    return (
      <div className={`relative group w-full ${containerClassName}`}>
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a5416] pointer-events-none flex items-center z-10">
            {leftIcon}
          </div>
        )}

        {/* Left Prefix (e.g. +91 or ₹) */}
        {leftPrefix && (
          <div
            className={`absolute ${
              leftIcon ? 'left-9' : 'left-3.5'
            } top-1/2 -translate-y-1/2 text-xs font-black text-[#b87324] pointer-events-none flex items-center z-10 transition-opacity duration-200 ${
              isFloating ? 'opacity-100' : 'opacity-70'
            }`}
          >
            {leftPrefix}
          </div>
        )}

        {/* The Native Input */}
        <input
          {...props}
          ref={ref}
          id={inputId}
          type={type}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          onChange={onChange}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          placeholder=" "
          className={`peer w-full h-12 bg-white border-2 rounded-xl font-bold text-sm text-[#46280b] placeholder-transparent focus:outline-none transition-all duration-200 ${inputPaddingLeftClass} ${paddingRightClass} ${
            isFocused
              ? focusColor === 'blue'
                ? 'border-blue-900 ring-2 ring-blue-900/20 shadow-xs'
                : focusColor === 'emerald'
                ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                : 'border-[#d0872e] ring-2 ring-[#d0872e]/30 shadow-xs'
              : 'border-[#dfbe7e] hover:border-[#caa050]'
          } ${disabled ? 'bg-[#f5ecdd] text-[#8a5d2e] cursor-not-allowed' : ''} ${inputClassName}`}
        />

        {/* Floating Label: Smoothly animates up to top border */}
        <label
          htmlFor={inputId}
          className={`absolute pointer-events-none select-none transition-all duration-200 ease-out origin-left z-20 ${
            isFloating
              ? `top-0 -translate-y-1/2 left-3 bg-[#faf6ee] px-1.5 text-[11px] font-bold ${
                  isFocused
                    ? focusColor === 'blue'
                      ? 'text-blue-900'
                      : focusColor === 'emerald'
                      ? 'text-emerald-700'
                      : 'text-[#8a5416]'
                    : 'text-[#55361e]'
                }`
              : `top-1/2 -translate-y-1/2 ${restLeftClass} text-xs font-bold text-[#7a5328]`
          } ${labelClassName}`}
        >
          <span>{label}</span>
          {badgeRequired && <span className="text-rose-500 ml-0.5">*</span>}
        </label>

        {/* Right Element */}
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center z-10">
            {rightElement}
          </div>
        )}
      </div>
    );
  }
);

FloatingInput.displayName = 'FloatingInput';

export default FloatingInput;
