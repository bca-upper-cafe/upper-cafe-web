'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { loginWithOutlook, isLoading, user } = useAuth();
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
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-[440px] space-y-8 text-center">
        {/* Header */}
        <div className="space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#F4F2FF] border border-[#DDD6FE] flex items-center justify-center text-2xl shadow-sm">
            ☕
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
            Sign in to Upper Cafe
          </h1>
          <p className="text-sm text-[#666666] leading-relaxed">
            The official platform for signing into <i>Upper Cafe</i> and checking teacher attendance at Bergen County Academies.
          </p>
        </div>

        {/* Outlook Login Card */}
        <div className="p-8 rounded-2xl border border-[#eaeaea] bg-white space-y-5 shadow-xs">
          <button
            onClick={handleOutlookLogin}
            disabled={submitting || isLoading}
            className="w-full btn-duo-purple py-4 px-6 text-sm flex items-center justify-center gap-3"
          >
            {/* Microsoft 4-color tile icon */}
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 21 21">
              <rect x="1" y="1" width="9" height="9" fill="#F25022" />
              <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
              <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
              <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
            </svg>
            <span>Sign in with Outlook</span>
          </button>

          <p className="text-xs text-[#888888]">
            Your account name is retrieved directly from Microsoft Outlook and cannot be altered.
          </p>
        </div>

        {/* Quick Role Switcher for Testing / Staging */}
        <div className="pt-2">
          <div className="text-[11px] uppercase tracking-wider text-[#999999] font-semibold mb-2">
            Quick Development Logins
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs">
            <button
              onClick={() => handleDevLogin('student', 'Kabir Sekhon')}
              className="text-[#6355D8] hover:underline font-medium py-1 px-2.5 rounded-lg hover:bg-[#F4F2FF] transition-all cursor-pointer"
            >
              Sign in as Student &rarr;
            </button>
            <span className="text-[#cccccc] hidden sm:inline">&middot;</span>
            <button
              onClick={() => handleDevLogin('staff', 'Dr. Robert Degan')}
              className="text-[#6355D8] hover:underline font-medium py-1 px-2.5 rounded-lg hover:bg-[#F4F2FF] transition-all cursor-pointer"
            >
              Sign in as Staff / Admin &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
