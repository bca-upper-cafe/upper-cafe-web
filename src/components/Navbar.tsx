'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { useAuth } from '@/lib/auth';
import { LogOut, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout, activeCheckIn } = useAuth();

  return (
    <header className="bg-white border-b border-[#eaeaea] sticky top-0 z-40">
      <div className="max-w-[680px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href={user?.role === 'staff' ? '/admin' : '/'} className="flex items-center gap-2">
          <span className="font-semibold text-lg tracking-tight text-[#111111]">
            bcaupper.cafe
          </span>
          {user?.role === 'staff' && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#F4F2FF] text-[#6355D8] border border-[#DDD6FE]">
              Staff
            </span>
          )}
        </Link>

        {/* Navigation & User */}
        <nav className="flex items-center gap-3 text-sm">
          <Link
            href="/absences"
            className={clsx(
              'transition-colors text-sm',
              pathname === '/absences'
                ? 'font-semibold text-[#111111] underline underline-offset-4 decoration-[#6355D8]'
                : 'text-[#666666] hover:text-[#111111]'
            )}
          >
            Teacher Attendance
          </Link>

          {user && (
            <>
              {user.role === 'staff' ? (
                <Link
                  href="/admin"
                  className={clsx(
                    'transition-colors text-sm',
                    pathname === '/admin'
                      ? 'font-semibold text-[#111111] underline underline-offset-4 decoration-[#6355D8]'
                      : 'text-[#666666] hover:text-[#111111]'
                  )}
                >
                  Dashboard
                </Link>
              ) : activeCheckIn ? (
                <Link
                  href="/check-out"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5] animate-pulse"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                  Checked In (P{activeCheckIn.period})
                </Link>
              ) : null}

              <div className="h-4 w-px bg-[#eaeaea] mx-1" />

              <div className="flex items-center gap-2">
                <span className="text-xs text-[#666666] font-medium hidden sm:inline truncate max-w-[120px]">
                  {user.name}
                </span>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="text-[#888888] hover:text-[#111111] p-1 rounded transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {!user && pathname !== '/login' && (
            <Link
              href="/login"
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-[#6355D8] text-white hover:bg-[#5446C9] transition-all"
            >
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
