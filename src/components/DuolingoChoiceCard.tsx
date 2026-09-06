'use client';

import React from 'react';
import { clsx } from 'clsx';
import { CheckCircle2 } from 'lucide-react';

interface DuolingoChoiceCardProps {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
  badge?: string;
  icon?: React.ReactNode;
  stepNumber?: number | string;
}

export const DuolingoChoiceCard: React.FC<DuolingoChoiceCardProps> = ({
  selected,
  onClick,
  title,
  description,
  badge,
  icon,
  stepNumber,
}) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={clsx(
        'group relative flex items-center gap-4 p-5 rounded-2xl cursor-pointer border-2 transition-all duration-100 select-none text-left',
        'border-b-[5px]',
        selected
          ? 'bg-[#1D2430] border-[#C5B358] border-b-[#7A6B25] shadow-lg shadow-[#C5B358]/10 translate-y-[1px]'
          : 'bg-[#151B23] border-[#2C3442] border-b-[#1A202A] hover:bg-[#1A222D] hover:border-[#3D4758]'
      )}
    >
      {/* Icon or Step indicator */}
      {icon ? (
        <div
          className={clsx(
            'flex items-center justify-center w-14 h-14 rounded-2xl text-2xl transition-transform group-hover:scale-105',
            selected ? 'bg-[#C5B358] text-[#0B0E14]' : 'bg-[#1F2631] text-[#C5B358]'
          )}
        >
          {icon}
        </div>
      ) : stepNumber ? (
        <div
          className={clsx(
            'flex items-center justify-center w-12 h-12 rounded-xl font-black text-lg border-2',
            selected
              ? 'bg-[#C5B358] text-[#0B0E14] border-[#7A6B25]'
              : 'bg-[#1F2631] text-[#8B949E] border-[#2C3442]'
          )}
        >
          {stepNumber}
        </div>
      ) : null}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3
            className={clsx(
              'font-extrabold text-base md:text-lg tracking-tight',
              selected ? 'text-[#C5B358]' : 'text-[#F0F6FC]'
            )}
          >
            {title}
          </h3>
          {badge && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-[#C5B358]/15 text-[#E5D68A] border border-[#C5B358]/30">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs md:text-sm text-[#8B949E] leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>

      {/* Radio checkmark circle */}
      <div className="shrink-0 ml-2">
        <div
          className={clsx(
            'w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all',
            selected
              ? 'bg-[#C5B358] border-[#C5B358] text-[#0B0E14]'
              : 'border-[#2C3442] bg-[#0B0E14]'
          )}
        >
          {selected ? (
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          ) : (
            <div className="w-2.5 h-2.5 rounded-full bg-transparent" />
          )}
        </div>
      </div>
    </div>
  );
};
