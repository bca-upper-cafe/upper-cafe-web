'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Coffee, ClipboardCheck, Users, ShieldAlert, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Check In', icon: ClipboardCheck },
    { href: '/absences', label: 'Absent Teachers', icon: Users },
    { href: '/admin', label: 'Admin Desk', icon: ShieldAlert },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0B0E14]/85 border-b border-[#2C3442]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C5B358] to-[#9E8D38] p-0.5 shadow-md shadow-[#C5B358]/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#0B0E14] rounded-[10px] flex items-center justify-center group-hover:bg-transparent transition-colors">
              <Coffee className="w-5 h-5 text-[#C5B358] group-hover:text-[#0B0E14] transition-colors" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-[#F0F6FC]">
                Upper Cafe
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-[#C5B358]/20 text-[#E5D68A] border border-[#C5B358]/30 rounded">
                BCA
              </span>
            </div>
            <p className="text-[11px] text-[#8B949E] font-medium hidden sm:block">
              Study Hall & Absence Desk
            </p>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 sm:gap-2">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all border select-none',
                  isActive
                    ? 'bg-[#1F2631] text-[#C5B358] border-[#C5B358]/40 shadow-sm'
                    : 'text-[#8B949E] border-transparent hover:text-[#F0F6FC] hover:bg-[#151B23]'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
