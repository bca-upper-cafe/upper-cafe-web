'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function CheckOutPage() {
  const { user, activeCheckIn, submitCheckOut } = useAuth();
  const router = useRouter();

  const [checkingOut, setCheckingOut] = useState(false);
  const [justCheckedOut, setJustCheckedOut] = useState(false);

  useEffect(() => {
    if (!activeCheckIn) {
      setJustCheckedOut(true);
      const timer = setTimeout(() => {
        router.replace('/');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [activeCheckIn, router]);

  const handleCheckOut = async () => {
    setCheckingOut(true);
    try {
      await submitCheckOut();
      setJustCheckedOut(true);
      setTimeout(() => {
        router.replace('/');
      }, 1200);
    } finally {
      setCheckingOut(false);
    }
  };

  if (justCheckedOut || !activeCheckIn) {
    return (
      <main className="max-w-2xl mx-auto px-6 sm:px-8 py-20 space-y-3">
        <h1 className="text-xl font-semibold tracking-tight text-[#111111]">
          Checked Out.
        </h1>
        <p className="text-sm text-[#666666]">
          Your sign-in record has been logged. Returning to home...
        </p>
      </main>
    );
  }

  const checkInTimeFormatted = new Date(activeCheckIn.checkInTime).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <main className="max-w-2xl mx-auto px-6 sm:px-8 py-12 space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-[#111111]">
          Upper Cafe Check-Out
        </h1>
        <p className="text-sm text-[#666666]">
          You are currently signed into Upper Cafe. When leaving, please check out.
        </p>
      </header>

      <hr className="border-none border-t border-[#eaeaea]" />

      <div className="border border-[#eaeaea] rounded-lg p-5 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-[#666666]">Student:</span>
          <span className="font-semibold text-[#111111]">{activeCheckIn.studentName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#666666]">Period:</span>
          <span className="font-semibold text-[#111111]">Period {activeCheckIn.period}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#666666]">Reason:</span>
          <span className="text-[#111111]">
            {activeCheckIn.reason === 'TEACHER_ABSENT'
              ? `Teacher Absent (${activeCheckIn.teacherName})`
              : 'Study Hall'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#666666]">Signed in at:</span>
          <span className="font-mono text-[#111111]">{checkInTimeFormatted}</span>
        </div>
      </div>

      <button
        onClick={handleCheckOut}
        disabled={checkingOut}
        className="w-full btn-minimal-primary py-3 text-sm"
      >
        {checkingOut ? 'Checking out...' : 'Check Out \u2192'}
      </button>

      <div className="pt-2 text-center">
        <Link
          href="/absences"
          className="text-xs text-[#666666] hover:text-[#111111] underline underline-offset-3"
        >
          View Teacher Attendance &rarr;
        </Link>
      </div>
    </main>
  );
}
