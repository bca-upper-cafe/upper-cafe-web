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
    <main className="max-w-2xl mx-auto px-6 sm:px-8 py-12 space-y-6">
      <Link
        href="/check-in/code"
        className="text-xs text-[#666666] hover:text-[#111111] transition-colors"
      >
        &larr; Back
      </Link>

      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight text-[#111111]">
          Select Reason
        </h1>
        <p className="text-sm text-[#666666]">
          Period {period} &middot; Select your reason for visiting Upper Cafe.
        </p>
      </header>

      <hr className="border-none border-t border-[#eaeaea]" />

      <div className="space-y-3">
        {/* Option 1: Teacher Absent */}
        <div
          onClick={() => setSelectedReason('TEACHER_ABSENT')}
          className={`p-4 rounded-lg border transition-colors cursor-pointer select-none ${
            selectedReason === 'TEACHER_ABSENT'
              ? 'border-[#111111] bg-[#fafafa]'
              : 'border-[#eaeaea] hover:border-[#999999] bg-white'
          }`}
        >
          <div className="text-sm font-semibold text-[#111111]">
            My Teacher Is Absent
          </div>
          <p className="text-xs text-[#666666] mt-1">
            Your class teacher is absent today and you were instructed to report to Upper Cafe.
          </p>
        </div>

        {/* Option 2: Study Hall */}
        <div
          onClick={() => setSelectedReason('STUDY_HALL')}
          className={`p-4 rounded-lg border transition-colors cursor-pointer select-none ${
            selectedReason === 'STUDY_HALL'
              ? 'border-[#111111] bg-[#fafafa]'
              : 'border-[#eaeaea] hover:border-[#999999] bg-white'
          }`}
        >
          <div className="text-sm font-semibold text-[#111111]">
            I Am Here for Study Hall
          </div>
          <p className="text-xs text-[#666666] mt-1">
            You have a scheduled study hall or free period during this time.
          </p>
        </div>
      </div>

      <button
        onClick={handleContinue}
        disabled={!selectedReason || submitting}
        className={`w-full py-2.5 text-sm ${
          selectedReason && !submitting
            ? 'btn-minimal-primary'
            : 'btn-minimal-disabled'
        }`}
      >
        {submitting ? 'Checking in...' : 'Continue \u2192'}
      </button>
    </main>
  );
}

export default function ReasonSelectionPage() {
  return (
    <Suspense fallback={<div className="max-w-[580px] mx-auto p-12 text-sm text-[#666666]">Loading...</div>}>
      <ReasonSelectionContent />
    </Suspense>
  );
}
