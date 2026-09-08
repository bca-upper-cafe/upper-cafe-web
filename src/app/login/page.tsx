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
    <main className="w-full max-w-3xl mx-auto px-6 sm:px-10 py-24 space-y-10 text-left">
      <header className="space-y-2 border-b border-[#eaeaea] pb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111]">
          bcaupper.cafe
        </h1>
        <p className="text-sm sm:text-base text-[#666666] leading-relaxed">
          The official platform for signing into <i>Upper Cafe</i> and checking teacher attendance at Bergen County Academies.
        </p>
      </header>

      <section className="space-y-4">
        <div className="text-xs uppercase tracking-wider text-[#666666] font-semibold">
          Account Sign-In
        </div>

        <button
          onClick={handleOutlookLogin}
          disabled={submitting || isLoading}
          className="w-full h-14 btn-minimal-primary flex items-center justify-center gap-3 text-base"
        >
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 21 21">
            <rect x="1" y="1" width="9" height="9" fill="#F25022" />
            <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
            <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
            <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
          </svg>
          <span>Sign in with Outlook</span>
        </button>

        <p className="text-xs sm:text-sm text-[#888888]">
          Your account name is retrieved directly from Microsoft Outlook and cannot be altered.
        </p>
      </section>

      <section className="space-y-3 pt-6 border-t border-[#eaeaea]">
        <div className="text-xs uppercase tracking-wider text-[#666666] font-semibold">
          Development Preview &amp; Role Testing
        </div>
        <ul className="text-xs sm:text-sm text-[#666666] space-y-2">
          <li>
            <button
              onClick={() => handleDevLogin('student', 'Kabir Sekhon')}
              className="text-[#111111] underline underline-offset-3 decoration-[#d1d1d1] hover:decoration-[#111111] cursor-pointer"
            >
              Sign in as Student (Kabir Sekhon) &rarr;
            </button>
          </li>
          <li>
            <button
              onClick={() => handleDevLogin('staff', 'Dr. Robert Degan')}
              className="text-[#111111] underline underline-offset-3 decoration-[#d1d1d1] hover:decoration-[#111111] cursor-pointer"
            >
              Sign in as Staff / Admin (Dr. Robert Degan) &rarr;
            </button>
          </li>
        </ul>
      </section>
    </main>
  );
}
