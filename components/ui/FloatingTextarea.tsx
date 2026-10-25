'use client';

import React, { useState, useId } from 'react';

export interface FloatingTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  containerClassName?: string;
  textareaClassName?: string;
  labelClassName?: string;
  badgeRequired?: boolean;
  focusColor?: 'emerald' | 'blue' | 'gold';
}

export const FloatingTextarea = React.forwardRef<
  HTMLTextAreaElement,
  FloatingTextareaProps
>(
  (
    {
      label,
      containerClassName = '',
      textareaClassName = '',
      labelClassName = '',
      badgeRequired = false,
      focusColor = 'gold',
      value,
      defaultValue,
      onChange,
      onFocus,
      onBlur,
      disabled = false,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = props.id || generatedId;
    const [isFocused, setIsFocused] = useState(false);

    const hasValue =
      value !== undefined && value !== null && String(value).trim().length > 0;
    const isFloating = isFocused || hasValue;

    return (
      <div className={`relative group w-full ${containerClassName}`}>
        <textarea
          {...props}
          ref={ref}
          id={textareaId}
          rows={rows}
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
          className={`peer w-full bg-white border-2 rounded-xl font-bold text-sm text-[#46280b] p-3 pt-4 placeholder-transparent focus:outline-none transition-all duration-200 resize-none ${
            isFocused
              ? focusColor === 'blue'
                ? 'border-blue-900 ring-2 ring-blue-900/20 shadow-xs'
                : focusColor === 'emerald'
                ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                : 'border-[#d0872e] ring-2 ring-[#d0872e]/30 shadow-xs'
              : 'border-[#dfbe7e] hover:border-[#caa050]'
          } ${disabled ? 'bg-[#f5ecdd] text-[#8a5d2e] cursor-not-allowed' : ''} ${textareaClassName}`}
        />

        {/* Floating Label */}
        <label
          htmlFor={textareaId}
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
              : 'top-3.5 left-3 text-xs font-bold text-[#7a5328]'
          } ${labelClassName}`}
        >
          <span>{label}</span>
          {badgeRequired && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      </div>
    );
  }
);

FloatingTextarea.displayName = 'FloatingTextarea';

export default FloatingTextarea;
