'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';

function ReasonSelectionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const period = searchParams.get('period') || '4';
  const { submitCheckIn } = useAuth();

  const [selectedReason, setSelectedReason] = useState<'TEACHER_ABSENT' | 'STUDY_HALL' | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleContinue = async () => {
    if (!selectedReason) return;
    if (selectedReason === 'TEACHER_ABSENT') {
      router.push(`/check-in/teacher?period=${period}`);
    } else {
      setSubmitting(true);
      try {
        await submitCheckIn(period, 'STUDY_HALL');
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <main className="w-full max-w-3xl mx-auto px-6 sm:px-10 py-16 space-y-8">
      <div>
        <Link
          href="/check-in/code"
          className="text-xs text-[#666666] hover:text-[#111111] transition-colors"
        >
          &larr; Back to Cafe Code
        </Link>
      </div>

      <header className="space-y-2 border-b border-[#eaeaea] pb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111]">
          Select Check-In Reason
        </h1>
        <p className="text-sm sm:text-base text-[#666666]">
          Period {period} &middot; Select your reason for attendance in Upper Cafe today.
        </p>
      </header>

      <div className="space-y-4">
        {/* Option 1: Teacher Absent */}
        <div
          onClick={() => setSelectedReason('TEACHER_ABSENT')}
          className={`p-6 rounded-xl border transition-all cursor-pointer select-none ${
            selectedReason === 'TEACHER_ABSENT'
              ? 'border-[#111111] bg-[#fafafa] shadow-xs'
              : 'border-[#eaeaea] hover:border-[#999999] bg-white'
          }`}
        >
          <div className="text-base font-semibold text-[#111111]">
            My Teacher Is Absent
          </div>
          <p className="text-sm text-[#666666] mt-1.5 leading-relaxed">
            Your class teacher is absent today and you were instructed to report to Upper Cafe for independent study hall coverage.
          </p>
        </div>

        {/* Option 2: Study Hall */}
        <div
          onClick={() => setSelectedReason('STUDY_HALL')}
          className={`p-6 rounded-xl border transition-all cursor-pointer select-none ${
            selectedReason === 'STUDY_HALL'
              ? 'border-[#111111] bg-[#fafafa] shadow-xs'
              : 'border-[#eaeaea] hover:border-[#999999] bg-white'
          }`}
        >
          <div className="text-base font-semibold text-[#111111]">
            I Am Here for Study Hall
          </div>
          <p className="text-sm text-[#666666] mt-1.5 leading-relaxed">
            You have a scheduled study hall, free period, or library privilege during Period {period}.
          </p>
        </div>
      </div>

      <button
        onClick={handleContinue}
        disabled={!selectedReason || submitting}
        className={`w-full h-14 text-base ${
          selectedReason && !submitting
            ? 'btn-minimal-primary'
            : 'btn-minimal-disabled'
        }`}
      >
        {submitting ? 'Signing in...' : 'Continue \u2192'}
      </button>
    </main>
  );
}

export default function ReasonSelectionPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto p-12 text-sm text-[#666666]">Loading...</div>}>
      <ReasonSelectionContent />
    </Suspense>
  );
}
