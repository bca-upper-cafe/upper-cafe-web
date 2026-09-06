'use client';

import React from 'react';
import { clsx } from 'clsx';

export interface DuolingoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const DuolingoButton: React.FC<DuolingoButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  disabled,
  children,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-bold tracking-wide rounded-2xl transition-all duration-75 select-none active:translate-y-[3px] disabled:opacity-50 disabled:pointer-events-none disabled:active:translate-y-0 cursor-pointer';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs border-b-[3px]',
    md: 'px-5 py-2.5 text-sm border-b-[4px]',
    lg: 'px-6 py-3.5 text-base border-b-[5px]',
    xl: 'px-8 py-4.5 text-lg border-b-[6px]',
  };

  const variantStyles = {
    primary:
      'bg-[#C5B358] text-[#0B0E14] border-[#7A6B25] hover:bg-[#D4C36A] active:border-b-0 active:mt-[4px] shadow-sm',
    secondary:
      'bg-[#1F2631] text-[#F0F6FC] border-[#12171F] hover:bg-[#283241] active:border-b-0 active:mt-[4px]',
    danger:
      'bg-[#EF4444] text-white border-[#B91C1C] hover:bg-[#F87171] active:border-b-0 active:mt-[4px]',
    success:
      'bg-[#10B981] text-white border-[#047857] hover:bg-[#34D399] active:border-b-0 active:mt-[4px]',
    outline:
      'bg-transparent text-[#C5B358] border-[#C5B358]/60 hover:bg-[#C5B358]/10 border-2 active:mt-0',
  };

  return (
    <button
      disabled={disabled}
      className={clsx(
        baseStyles,
        sizeStyles[size],
        variantStyles[variant],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
