'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-[#eaeaea] sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-6 sm:px-8 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href={user?.role === 'staff' ? '/admin' : '/'} className="flex items-center gap-2">
          <span className="font-semibold text-base tracking-tight text-[#111111]">
            bcaupper.cafe
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-5 text-xs">
          <Link
            href="/absences"
            className={`transition-colors ${
              pathname === '/absences'
                ? 'text-[#111111] font-semibold underline underline-offset-4 decoration-[#d1d1d1]'
                : 'text-[#666666] hover:text-[#111111]'
            }`}
          >
            Teacher Attendance
          </Link>

          {user && (
            <>
              {user.role === 'staff' && (
                <Link
                  href="/admin"
                  className={`transition-colors ${
                    pathname === '/admin'
                      ? 'text-[#111111] font-semibold underline underline-offset-4 decoration-[#d1d1d1]'
                      : 'text-[#666666] hover:text-[#111111]'
                  }`}
                >
                  Admin Desk
                </Link>
              )}

              <button
                onClick={logout}
                className="text-[#666666] hover:text-[#111111] transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </>
          )}

          {!user && pathname !== '/login' && (
            <Link
              href="/login"
              className="text-[#111111] font-medium underline underline-offset-3 decoration-[#d1d1d1] hover:decoration-[#111111]"
            >
              Sign In &rarr;
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};
