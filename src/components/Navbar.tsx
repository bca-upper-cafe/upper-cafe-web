'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Student Check-In' },
    { href: '/absences', label: 'Teacher Absences' },
    { href: '/admin', label: 'Attendance Desk' },
  ];

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-bold text-base text-slate-900 tracking-tight">
            Upper Cafe
          </span>
          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 rounded">
            BCA
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
