'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { ArrowRight, Lock, Loader2, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { loginWithOutlook, isLoading } = useAuth();
  const [submittingAction, setSubmittingAction] = useState<'outlook' | 'student' | 'staff' | null>(null);

  const handleOutlookLogin = async () => {
    setSubmittingAction('outlook');
    try {
      await loginWithOutlook('student');
    } finally {
      setSubmittingAction(null);
    }
  };

  const handleDevLogin = async (role: 'student' | 'staff', name: string) => {
    setSubmittingAction(role);
    try {
      await loginWithOutlook(role, name);
    } finally {
      setSubmittingAction(null);
    }
  };

  const isBusy = isLoading || submittingAction !== null;

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-between text-[#111111]">
      {/* Top Navigation Bar / Brand */}
      <header className="w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#111111] text-white flex items-center justify-center font-bold text-xs tracking-tight shadow-sm">
            BCA
          </div>
          <div>
            <span className="font-semibold text-sm tracking-tight text-[#111111] block leading-none">
              Upper Cafe
            </span>
            <span className="text-[11px] text-[#71717a] font-normal block leading-tight mt-0.5">
              Study Hall Check-In
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-[#71717a] bg-white border border-[#e5e7eb] px-3 py-1.5 rounded-full shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>System Operational</span>
        </div>
      </header>

      {/* Center Authentication Card */}
      <main className="w-full max-w-[440px] mx-auto px-4 py-8 flex flex-col items-center">
        <div className="w-full bg-white border border-[#eaeaea] rounded-2xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] p-8 sm:p-9 space-y-7">
          {/* Card Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-xl bg-[#f4f4f5] border border-[#e4e4e7] flex items-center justify-center text-[#18181b] shadow-sm">
              <ShieldCheck className="w-6 h-6 text-[#18181b]" strokeWidth={1.75} />
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#111111] pt-1">
              Sign in to Upper Cafe
            </h1>
            <p className="text-xs sm:text-sm text-[#71717a] leading-relaxed max-w-xs mx-auto">
              Bergen County Academies attendance portal for study hall &amp; proctored periods.
            </p>
          </div>

          {/* Microsoft Single Sign-On */}
          <div className="space-y-3">
            <button
              onClick={handleOutlookLogin}
              disabled={isBusy}
              className="w-full h-12 px-4 rounded-xl border border-[#d4d4d8] bg-white hover:bg-[#fafafa] active:bg-[#f4f4f5] text-[#18181b] font-medium text-sm transition-all duration-150 flex items-center justify-center gap-3 shadow-sm hover:border-[#a1a1aa] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {submittingAction === 'outlook' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#71717a]" />
                  <span>Connecting to Microsoft...</span>
                </>
              ) : (
                <>
                  {/* Official Microsoft 4-Color Grid */}
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 21 21">
                    <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                    <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                    <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                    <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
                  </svg>
                  <span>Sign in with Microsoft 365</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#71717a]">
              <Lock className="w-3 h-3 text-[#a1a1aa]" />
              <span>Requires an authorized <strong>@bergen.org</strong> school account</span>
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#eaeaea]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white px-2.5 text-[#a1a1aa] font-semibold tracking-wider">
                Development Preview &amp; Role Testing
              </span>
            </div>
          </div>

          {/* Development Preview & Role Testing Section */}
          <div className="space-y-2.5">
            {/* Student Switcher */}
            <button
              onClick={() => handleDevLogin('student', 'Kabir Sekhon')}
              disabled={isBusy}
              className="w-full p-3 rounded-xl border border-[#eaeaea] hover:border-[#111111] bg-[#fafafa] hover:bg-white text-left transition-all duration-150 group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#e0e7ff] text-[#3730a3] flex items-center justify-center font-semibold text-xs shrink-0">
                  KS
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#111111] group-hover:text-black">
                    Sign in as Student (Kabir Sekhon) &rarr;
                  </div>
                  <div className="text-[11px] text-[#71717a]">
                    kabsek30@bergen.org &middot; Student Role
                  </div>
                </div>
              </div>
              {submittingAction === 'student' ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#71717a] shrink-0" />
              ) : (
                <ArrowRight className="w-4 h-4 text-[#a1a1aa] group-hover:text-[#111111] group-hover:translate-x-0.5 transition-all shrink-0" />
              )}
            </button>

            {/* Staff / Admin Switcher */}
            <button
              onClick={() => handleDevLogin('staff', 'Dr. Robert Degan')}
              disabled={isBusy}
              className="w-full p-3 rounded-xl border border-[#eaeaea] hover:border-[#111111] bg-[#fafafa] hover:bg-white text-left transition-all duration-150 group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#fef3c7] text-[#92400e] flex items-center justify-center font-semibold text-xs shrink-0">
                  RD
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#111111] group-hover:text-black">
                    Sign in as Staff / Admin (Dr. Robert Degan) &rarr;
                  </div>
                  <div className="text-[11px] text-[#71717a]">
                    rdegan@bergen.org &middot; Staff / Admin Role
                  </div>
                </div>
              </div>
              {submittingAction === 'staff' ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#71717a] shrink-0" />
              ) : (
                <ArrowRight className="w-4 h-4 text-[#a1a1aa] group-hover:text-[#111111] group-hover:translate-x-0.5 transition-all shrink-0" />
              )}
            </button>
          </div>

          {/* Security Notice */}
          <div className="pt-2 border-t border-[#f4f4f5] text-center">
            <p className="text-[11px] text-[#a1a1aa] leading-normal">
              Protected by Microsoft Entra ID authentication. <br />
              Authorized BCA students and faculty only.
            </p>
          </div>
        </div>
      </main>

      {/* Institutional Clean Bottom Footer */}
      <footer className="w-full max-w-5xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#a1a1aa]">
        <div>
          &copy; {new Date().getFullYear()} Bergen County Technical Schools &middot; Upper Cafe
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://bcaupper.cafe/terms"
            className="hover:text-[#111111] transition-colors"
          >
            Terms of Service
          </a>
          <span>&middot;</span>
          <a
            href="https://bcaupper.cafe/privacy"
            className="hover:text-[#111111] transition-colors"
          >
            Privacy Policy
          </a>
          <span>&middot;</span>
          <a
            href="https://github.com/bca-upper-cafe/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#111111] transition-colors"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
