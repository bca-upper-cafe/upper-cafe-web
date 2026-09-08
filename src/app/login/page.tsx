'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  const { loginWithOutlook, isLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const handleOutlookLogin = async () => {
    setSubmitting(true);
    try {
      await loginWithOutlook('student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDevLogin = async (role: 'student' | 'staff', name: string) => {
    setSubmitting(true);
    try {
      await loginWithOutlook(role, name);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="w-full max-w-md mx-auto px-6 py-24 sm:py-32 flex flex-col justify-center min-h-[calc(100vh-140px)]">
      <div className="flex flex-col items-center text-center space-y-8">
        {/* Brand Header */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#111111]">
            bcaupper.cafe
          </h1>
          <p className="text-xs sm:text-sm text-[#666666]">
            Sign in to continue
          </p>
        </div>

        {/* Official Microsoft Sign In Button */}
        <div className="w-full flex justify-center pt-1">
          <button
            onClick={handleOutlookLogin}
            disabled={submitting || isLoading}
            className="inline-flex items-center justify-center p-0 border-0 bg-transparent cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed select-none"
            aria-label="Sign in with Microsoft"
          >
            {/* Official Microsoft vector lockup asset directly from Microsoft Identity Platform */}
            <img
              src="/ms-symbollockup_signin_dark.svg"
              alt="Sign in with Microsoft"
              className="h-[42px] w-auto max-w-full drop-shadow-sm"
            />
          </button>
        </div>

        {/* Development & Preview Testing */}
        <div className="w-full pt-10 border-t border-[#eaeaea]/80 space-y-3">
          <div className="text-[11px] uppercase tracking-wider text-[#888888] font-medium text-center">
            Demo Environments
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleDevLogin('student', 'Kabir Sekhon')}
              disabled={submitting || isLoading}
              className="p-3 text-left rounded-lg border border-[#eaeaea] bg-[#fafafa] hover:border-[#111111] hover:bg-white transition-all cursor-pointer group"
            >
              <div className="text-xs font-semibold text-[#111111] group-hover:underline">
                Student &rarr;
              </div>
              <div className="text-[10px] text-[#666666] mt-0.5 truncate font-mono">
                Kabir Sekhon
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDevLogin('staff', 'Dr. Robert Degan')}
              disabled={submitting || isLoading}
              className="p-3 text-left rounded-lg border border-[#eaeaea] bg-[#fafafa] hover:border-[#111111] hover:bg-white transition-all cursor-pointer group"
            >
              <div className="text-xs font-semibold text-[#111111] group-hover:underline">
                Admin &rarr;
              </div>
              <div className="text-[10px] text-[#666666] mt-0.5 truncate font-mono">
                Dr. Degan
              </div>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
